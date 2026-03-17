from rest_framework import viewsets, permissions, filters, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Dealer, AgriProduct, DealerProduct, Report, Review, District, Order, OrderItem
from .serializers import (
    DealerListSerializer, DealerDetailSerializer,
    AgriProductSerializer, DealerProductSerializer,
    ReportSerializer, ReviewSerializer, DistrictSerializer,
    OrderSerializer, OrderItemSerializer
)


class DealerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_authenticated:
            if request.user.is_staff or getattr(request.user, 'role', '') == 'admin':
                return True
            if getattr(request.user, 'role', '') == 'dealer' and request.method in ['PUT', 'PATCH']:
                return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if request.user.is_staff or getattr(request.user, 'role', '') == 'admin':
                return True
            if request.method in ['PUT', 'PATCH']:
                return obj.user == request.user
        if getattr(request, 'method', '') in permissions.SAFE_METHODS:
            return True
        return False


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'state']


class DealerViewSet(viewsets.ModelViewSet):
    queryset = Dealer.objects.select_related('district').prefetch_related('reviews').all()
    permission_classes = [DealerPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['license_status', 'district']
    search_fields = ['name', 'shop_name', 'license_number', 'address', 'specializations']
    ordering_fields = ['trust_score', 'name', 'created_at']
    ordering = ['-trust_score']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DealerDetailSerializer
        return DealerListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Admin sees ALL dealers (including unapproved, flagged)
        if user.is_authenticated and (user.is_staff or getattr(user, 'role', '') == 'admin'):
            return qs
        # Non-admin only sees approved & non-flagged dealers
        return qs.filter(is_approved=True, is_flagged=False)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def review(self, request, pk=None):
        dealer = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            Review.objects.update_or_create(
                reviewer=request.user, dealer=dealer,
                defaults={
                    'rating': serializer.validated_data['rating'],
                    'comment': serializer.validated_data.get('comment', ''),
                }
            )
            dealer.recalculate_trust_score()
            return Response({'detail': 'Review submitted.'}, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def products(self, request, pk=None):
        dealer = self.get_object()
        
        # If POST, a dealer is adding a product to their catalog
        if request.method == 'POST':
            if dealer.user != request.user:
                return Response({"detail": "Not allowed"}, status=403)
            # Make sure it's valid
            product_id = request.data.get('product')
            if not product_id:
                return Response({"detail": "product ID required"}, status=400)
            dealer_product, created = DealerProduct.objects.get_or_create(
                dealer=dealer, product_id=product_id,
                defaults={'price': request.data.get('price', 0), 'in_stock': True}
            )
            if not created:
                # Update existing
                dealer_product.price = request.data.get('price', dealer_product.price)
                dealer_product.in_stock = request.data.get('in_stock', dealer_product.in_stock)
                dealer_product.save()
            return Response(DealerProductSerializer(dealer_product).data, status=201 if created else 200)

        # Normal GET - return all products (not just in_stock) for the dealer's own view
        dealer_products = DealerProduct.objects.filter(dealer=dealer).select_related('product')
        if not (request.user.is_staff or getattr(request.user, 'role', '') == 'admin'):
            # For public/farmer view, only show in_stock
            if dealer.user != request.user:
                dealer_products = dealer_products.filter(in_stock=True)
        serializer = DealerProductSerializer(dealer_products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='products/(?P<product_pk>[^/.]+)', permission_classes=[permissions.IsAuthenticated])
    def remove_product(self, request, pk=None, product_pk=None):
        """Remove a product from dealer's catalog."""
        dealer = self.get_object()
        if dealer.user != request.user and not (request.user.is_staff or getattr(request.user, 'role', '') == 'admin'):
            return Response({"detail": "Not allowed"}, status=403)
        try:
            dealer_product = DealerProduct.objects.get(dealer=dealer, pk=product_pk)
            dealer_product.delete()
            return Response({'detail': 'Product removed from catalog.'}, status=204)
        except DealerProduct.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=404)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        dealer = self.get_object()
        dealer.is_approved = True
        dealer.license_status = 'active'
        dealer.save(update_fields=['is_approved', 'license_status'])
        return Response({'detail': f'{dealer.shop_name} has been approved.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        dealer = self.get_object()
        dealer.is_approved = False
        dealer.license_status = 'suspended'
        dealer.save(update_fields=['is_approved', 'license_status'])
        return Response({'detail': f'{dealer.shop_name} has been rejected.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def flag(self, request, pk=None):
        dealer = self.get_object()
        dealer.is_flagged = not dealer.is_flagged
        if dealer.is_flagged:
            dealer.license_status = 'suspended'
        dealer.save(update_fields=['is_flagged', 'license_status'])
        action_str = 'red-flagged' if dealer.is_flagged else 'unflagged'
        return Response({'detail': f'{dealer.shop_name} has been {action_str}.', 'is_flagged': dealer.is_flagged})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def admin_stats(self, request):
        total = Dealer.objects.count()
        approved = Dealer.objects.filter(is_approved=True).count()
        pending = Dealer.objects.filter(is_approved=False, is_flagged=False).count()
        flagged = Dealer.objects.filter(is_flagged=True).count()
        active = Dealer.objects.filter(license_status='active').count()
        suspended = Dealer.objects.filter(license_status='suspended').count()
        total_reports = Report.objects.count()
        pending_reports = Report.objects.filter(status='pending').count()
        verified_reports = Report.objects.filter(status='verified').count()
        dismissed_reports = Report.objects.filter(status='dismissed').count()
        return Response({
            'dealers': {'total': total, 'approved': approved, 'pending_approval': pending, 'flagged': flagged, 'active': active, 'suspended': suspended},
            'reports': {'total': total_reports, 'pending': pending_reports, 'verified': verified_reports, 'dismissed': dismissed_reports},
        })


class AgriProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AgriProduct.objects.filter(is_approved=True)
    serializer_class = AgriProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_approved']
    search_fields = ['name', 'brand', 'barcode', 'active_ingredients']

    @action(detail=False, methods=['get'])
    def by_barcode(self, request):
        barcode = request.query_params.get('barcode')
        if not barcode:
            return Response({'error': 'barcode param required'}, status=400)
        try:
            product = AgriProduct.objects.get(barcode=barcode)
            return Response(AgriProductSerializer(product).data)
        except AgriProduct.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.select_related('dealer', 'product', 'reporter').all()
    serializer_class = ReportSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'dealer']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        reporter = self.request.user if self.request.user.is_authenticated else None
        serializer.save(reporter=reporter)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')
        if new_status not in dict(Report.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)
        report.status = new_status
        report.admin_notes = admin_notes
        report.save()
        if new_status == 'verified':
            report.dealer.verified_reports += 1
            report.dealer.save(update_fields=['verified_reports'])
            report.dealer.recalculate_trust_score()
        return Response(ReportSerializer(report).data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('farmer', 'dealer').prefetch_related('items__product').all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'farmer', 'dealer']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return qs
        if getattr(user, 'role', '') == 'dealer':
            return qs.filter(dealer__user=user)
        return qs.filter(farmer=user)

    def create(self, request, *args, **kwargs):
        items_data = request.data.pop('items', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save(farmer=request.user)
        
        for item in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=item['product'],
                quantity=item.get('quantity', 1),
                price_at_time=item.get('price_at_time', 0),
            )
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user
        # Allow dealer who owns this order to update status
        if hasattr(order.dealer, 'user') and order.dealer.user == user:
            return super().update(request, *args, **kwargs)
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return super().update(request, *args, **kwargs)
        return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user
        if hasattr(order.dealer, 'user') and order.dealer.user == user:
            return super().partial_update(request, *args, **kwargs)
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return super().partial_update(request, *args, **kwargs)
        return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

