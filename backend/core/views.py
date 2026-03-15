from rest_framework import viewsets, permissions, filters, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Dealer, AgriProduct, DealerProduct, Report, Review, District
from .serializers import (
    DealerListSerializer, DealerDetailSerializer,
    AgriProductSerializer, DealerProductSerializer,
    ReportSerializer, ReviewSerializer, DistrictSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.is_staff or getattr(request.user, 'role', '') == 'admin'
        )


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'state']


class DealerViewSet(viewsets.ModelViewSet):
    queryset = Dealer.objects.select_related('district').prefetch_related('reviews').all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['license_status', 'district']
    search_fields = ['name', 'shop_name', 'license_number', 'address', 'specializations']
    ordering_fields = ['trust_score', 'name', 'created_at']
    ordering = ['-trust_score']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DealerDetailSerializer
        return DealerListSerializer

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

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        dealer = self.get_object()
        dealer_products = DealerProduct.objects.filter(dealer=dealer, in_stock=True).select_related('product')
        serializer = DealerProductSerializer(dealer_products, many=True)
        return Response(serializer.data)


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
