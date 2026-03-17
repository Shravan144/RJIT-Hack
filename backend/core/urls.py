from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DealerViewSet, AgriProductViewSet, ReportViewSet, DistrictViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'dealers', DealerViewSet, basename='dealer')
router.register(r'products', AgriProductViewSet, basename='product')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'districts', DistrictViewSet, basename='district')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
