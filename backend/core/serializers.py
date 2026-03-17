from rest_framework import serializers
from .models import Dealer, AgriProduct, DealerProduct, Report, Review, District, Order, OrderItem


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'


class DealerListSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)

    class Meta:
        model = Dealer
        fields = [
            'id', 'name', 'shop_name', 'license_number', 'license_status',
            'address', 'district_name', 'latitude', 'longitude',
            'phone', 'trust_score', 'total_reports', 'specializations',
            'is_approved', 'is_flagged',
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
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)


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

