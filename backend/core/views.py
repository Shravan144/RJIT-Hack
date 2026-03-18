from rest_framework import viewsets, permissions, filters, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Count
from django.core.cache import cache
from django.conf import settings
import time
from django_filters.rest_framework import DjangoFilterBackend
from .models import Dealer, AgriProduct, DealerProduct, Report, Review, District, Order, OrderItem
from .serializers import (
    DealerListSerializer, DealerDetailSerializer,
    AgriProductSerializer, DealerProductSerializer,
    ReportSerializer, ReviewSerializer, DistrictSerializer,
    OrderSerializer, OrderItemSerializer, DealerProductUpsertSerializer,
    OrderCreateSerializer,
)


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    payload = {
        'success': True,
        'message': message,
        'detail': message,
    }
    if data is not None:
        payload['data'] = data
    return Response(payload, status=status_code)


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    payload = {
        'success': False,
        'message': message,
        'detail': message,
        'error': message,
    }
    if errors is not None:
        payload['errors'] = errors
    return Response(payload, status=status_code)


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


class AdminOrInspectorPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'role', '') in {'admin', 'inspector'})
        )


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
    filterset_fields = ['license_status', 'district', 'is_approved', 'is_flagged']
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
        # Dealer can always see their own profile, even before approval.
        if user.is_authenticated and getattr(user, 'role', '') == 'dealer':
            return qs.filter(Q(is_approved=True, is_flagged=False) | Q(user=user)).distinct()
        # Non-admin only sees approved & non-flagged dealers
        return qs.filter(is_approved=True, is_flagged=False)

    @action(detail=False, methods=['get', 'patch'], url_path='me', permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        if getattr(user, 'role', '') != 'dealer' and not (user.is_staff or getattr(user, 'role', '') == 'admin'):
            return error_response('Not allowed.', status_code=status.HTTP_403_FORBIDDEN)

        dealer = Dealer.objects.filter(user=user).first()
        if not dealer:
            return error_response('Dealer profile not found.', status_code=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(DealerDetailSerializer(dealer).data)

        serializer = DealerListSerializer(dealer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response('Dealer profile updated.', data=serializer.data)

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
            return success_response('Review submitted.', status_code=status.HTTP_201_CREATED)
        return error_response('Invalid review payload.', errors=serializer.errors)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def products(self, request, pk=None):
        dealer = self.get_object()
        
        # If POST, a dealer is adding a product to their catalog
        if request.method == 'POST':
            if dealer.user != request.user:
                return error_response('Not allowed.', status_code=status.HTTP_403_FORBIDDEN)
            input_serializer = DealerProductUpsertSerializer(data=request.data)
            input_serializer.is_valid(raise_exception=True)
            product = input_serializer.validated_data['product']
            price = input_serializer.validated_data['price']
            in_stock = input_serializer.validated_data.get('in_stock', True)

            dealer_product, created = DealerProduct.objects.get_or_create(
                dealer=dealer,
                product=product,
                defaults={'price': price, 'in_stock': in_stock},
            )
            if not created:
                dealer_product.price = price
                dealer_product.in_stock = in_stock
                dealer_product.save()
            message = 'Product added to catalog.' if created else 'Product updated in catalog.'
            return success_response(
                message,
                data=DealerProductSerializer(dealer_product).data,
                status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )

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
            return error_response('Not allowed.', status_code=status.HTTP_403_FORBIDDEN)
        try:
            dealer_product = DealerProduct.objects.get(dealer=dealer, pk=product_pk)
            dealer_product.delete()
            return success_response('Product removed from catalog.', status_code=status.HTTP_200_OK)
        except DealerProduct.DoesNotExist:
            return error_response('Product not found.', status_code=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        dealer = self.get_object()
        dealer.is_approved = True
        dealer.license_status = 'active'
        dealer.save(update_fields=['is_approved', 'license_status'])
        return success_response(f'{dealer.shop_name} has been approved.')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        dealer = self.get_object()
        dealer.is_approved = False
        dealer.license_status = 'suspended'
        dealer.save(update_fields=['is_approved', 'license_status'])
        return success_response(f'{dealer.shop_name} has been rejected.')

    @action(detail=True, methods=['post'], permission_classes=[AdminOrInspectorPermission])
    def flag(self, request, pk=None):
        dealer = self.get_object()
        dealer.is_flagged = not dealer.is_flagged
        if dealer.is_flagged:
            dealer.license_status = 'suspended'
        dealer.save(update_fields=['is_flagged', 'license_status'])
        action_str = 'red-flagged' if dealer.is_flagged else 'unflagged'
        return success_response(
            f'{dealer.shop_name} has been {action_str}.',
            data={'is_flagged': dealer.is_flagged},
        )

    @action(detail=False, methods=['get'], permission_classes=[AdminOrInspectorPermission])
    def admin_stats(self, request):
        total = Dealer.objects.count()
        approved = Dealer.objects.filter(is_approved=True).count()
        pending = Dealer.objects.filter(is_approved=False, is_flagged=False).count()
        flagged = Dealer.objects.filter(is_flagged=True).count()
        active = Dealer.objects.filter(license_status='active').count()
        suspended = Dealer.objects.filter(license_status='suspended').count()
        total_reports = Report.objects.count()
        pending_reports = Report.objects.filter(status='pending').count()
        under_review_reports = Report.objects.filter(status='under_review').count()
        verified_reports = Report.objects.filter(status='verified').count()
        dismissed_reports = Report.objects.filter(status='dismissed').count()
        return Response({
            'dealers': {'total': total, 'approved': approved, 'pending_approval': pending, 'flagged': flagged, 'active': active, 'suspended': suspended},
            'reports': {'total': total_reports, 'pending': pending_reports, 'under_review': under_review_reports, 'verified': verified_reports, 'dismissed': dismissed_reports},
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
            return error_response('barcode param required', status_code=status.HTTP_400_BAD_REQUEST)
        try:
            product = AgriProduct.objects.get(barcode=barcode)
            return Response(AgriProductSerializer(product).data)
        except AgriProduct.DoesNotExist:
            return error_response('Product not found', status_code=status.HTTP_404_NOT_FOUND)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.select_related('dealer', 'product', 'reporter').all()
    serializer_class = ReportSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'dealer']
    search_fields = ['description', 'dealer__shop_name', 'reporter__username']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [AdminOrInspectorPermission()]
        if self.action in ['update_status']:
            return [AdminOrInspectorPermission()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if user.is_staff or getattr(user, 'role', '') in {'admin', 'inspector'}:
            return qs
        if getattr(user, 'role', '') == 'dealer':
            return qs.filter(dealer__user=user)
        return qs.filter(reporter=user)

    def perform_create(self, serializer):
        reporter = self.request.user if self.request.user.is_authenticated else None
        serializer.save(reporter=reporter)

    @action(detail=True, methods=['patch'], permission_classes=[AdminOrInspectorPermission])
    def update_status(self, request, pk=None):
        report = self.get_object()
        previous_status = report.status
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')
        if new_status not in dict(Report.STATUS_CHOICES):
            return error_response('Invalid status', status_code=status.HTTP_400_BAD_REQUEST)
        report.status = new_status
        report.admin_notes = admin_notes
        report.save()

        if previous_status != 'verified' and new_status == 'verified':
            report.dealer.verified_reports += 1
            report.dealer.save(update_fields=['verified_reports'])
        elif previous_status == 'verified' and new_status != 'verified':
            report.dealer.verified_reports = max(0, report.dealer.verified_reports - 1)
            report.dealer.save(update_fields=['verified_reports'])

        report.dealer.recalculate_trust_score()
        return success_response('Report status updated.', data=ReportSerializer(report).data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('farmer', 'dealer').prefetch_related('items__product').all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'farmer', 'dealer']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def stats(self, request):
        user = request.user
        ttl = max(1, int(getattr(settings, 'ORDER_STATS_CACHE_TTL', 20)))
        bucket = int(time.time() // ttl)
        scope = f"{getattr(user, 'role', 'anon')}:{user.id}"
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            scope = 'admin'
        cache_key = f"orders:stats:v1:{bucket}:{scope}"

        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return success_response('Order stats fetched.', data=cached_data)

        scoped_qs = self.get_queryset()
        grouped = scoped_qs.values('status').annotate(count=Count('id'))
        counts_by_status = {row['status']: row['count'] for row in grouped}
        data = {
            'all': sum(counts_by_status.values()),
            'pending': counts_by_status.get('pending', 0),
            'shipped': counts_by_status.get('shipped', 0),
            'delivered': counts_by_status.get('delivered', 0),
            'cancelled': counts_by_status.get('cancelled', 0),
        }
        cache.set(cache_key, data, timeout=ttl)
        return success_response('Order stats fetched.', data=data)

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user
        # Allow dealer who owns this order to update status
        if hasattr(order.dealer, 'user') and order.dealer.user == user:
            return super().update(request, *args, **kwargs)
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return super().update(request, *args, **kwargs)
        return error_response('Not allowed', status_code=status.HTTP_403_FORBIDDEN)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user
        if hasattr(order.dealer, 'user') and order.dealer.user == user:
            return super().partial_update(request, *args, **kwargs)
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return super().partial_update(request, *args, **kwargs)
        return error_response('Not allowed', status_code=status.HTTP_403_FORBIDDEN)

