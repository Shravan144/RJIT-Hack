from rest_framework import serializers
from django.db import transaction
from django.db.models import Avg
from .models import Dealer, AgriProduct, DealerProduct, Report, Review, District, Order, OrderItem


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'


class DealerListSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    owner_user_id = serializers.IntegerField(source='user_id', read_only=True)

    class Meta:
        model = Dealer
        fields = [
            'id', 'name', 'shop_name', 'license_number', 'license_status',
            'address', 'district_name', 'latitude', 'longitude',
            'phone', 'trust_score', 'total_reports', 'specializations',
            'is_approved', 'is_flagged', 'owner_user_id',
        ]


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer_name', 'created_at']


class DealerDetailSerializer(serializers.ModelSerializer):
    district = DistrictSerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Dealer
        fields = '__all__'

    def get_avg_rating(self, obj):
        avg = obj.reviews.aggregate(avg=Avg('rating'))['avg']
        if avg is None:
            return None
        return round(avg, 1)


class AgriProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgriProduct
        fields = '__all__'


class DealerProductSerializer(serializers.ModelSerializer):
    product = AgriProductSerializer(read_only=True)
    dealer_name = serializers.CharField(source='dealer.shop_name', read_only=True)

    class Meta:
        model = DealerProduct
        fields = ['id', 'dealer', 'dealer_name', 'product', 'price', 'in_stock', 'added_at']


class ReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.username', read_only=True, default='Anonymous')
    dealer_name = serializers.CharField(source='dealer.shop_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True, default=None)

    class Meta:
        model = Report
        fields = [
            'id', 'reporter_name', 'dealer', 'dealer_name', 'product', 'product_name',
            'category', 'description', 'status', 'evidence_image',
            'admin_notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'reporter_name', 'dealer_name', 'product_name', 'status', 'admin_notes', 'created_at', 'updated_at']

    def validate_description(self, value):
        description = (value or '').strip()
        if len(description) < 20:
            raise serializers.ValidationError('Description must be at least 20 characters.')
        return description


class DealerProductUpsertSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=AgriProduct.objects.filter(is_approved=True))
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    in_stock = serializers.BooleanField(required=False, default=True)


class OrderItemCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=AgriProduct.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    price_at_time = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class OrderCreateSerializer(serializers.Serializer):
    dealer = serializers.PrimaryKeyRelatedField(queryset=Dealer.objects.select_related('user').all())
    items = OrderItemCreateSerializer(many=True, min_length=1)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    def validate_dealer(self, dealer):
        if not dealer.is_approved or dealer.is_flagged or dealer.license_status != 'active':
            raise serializers.ValidationError('Dealer is not currently eligible for orders.')
        return dealer

    @transaction.atomic
    def create(self, validated_data):
        farmer = self.context['request'].user
        dealer = validated_data['dealer']
        items_data = validated_data['items']

        product_ids = [item['product'].id for item in items_data]
        dealer_products = DealerProduct.objects.select_related('product').filter(
            dealer=dealer,
            product_id__in=product_ids,
            in_stock=True,
        )
        dealer_product_map = {dp.product_id: dp for dp in dealer_products}

        missing_products = []
        for item in items_data:
            if item['product'].id not in dealer_product_map:
                missing_products.append(item['product'].name)

        if missing_products:
            raise serializers.ValidationError({
                'items': f"These products are unavailable for the selected dealer: {', '.join(missing_products)}"
            })

        order = Order.objects.create(farmer=farmer, dealer=dealer)
        total = 0
        order_items = []

        for item in items_data:
            dp = dealer_product_map[item['product'].id]
            line_total = dp.price * item['quantity']
            total += line_total
            order_items.append(OrderItem(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price_at_time=dp.price,
            ))

        OrderItem.objects.bulk_create(order_items)
        order.total_amount = total
        order.save(update_fields=['total_amount'])
        return order

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_time']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    farmer_name = serializers.CharField(source='farmer.username', read_only=True)
    dealer_name = serializers.CharField(source='dealer.shop_name', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'farmer', 'farmer_name', 'dealer', 'dealer_name', 'total_amount', 'status', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'farmer_name', 'dealer_name', 'created_at', 'updated_at']

