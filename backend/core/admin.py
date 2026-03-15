from django.contrib import admin
from .models import Dealer, AgriProduct, DealerProduct, Report, Review, District


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'state']
    search_fields = ['name', 'state']


@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    list_display = ['shop_name', 'name', 'license_number', 'license_status', 'trust_score', 'district']
    list_filter = ['license_status', 'district']
    search_fields = ['shop_name', 'name', 'license_number']
    readonly_fields = ['trust_score', 'total_reports', 'verified_reports', 'created_at', 'updated_at']


@admin.register(AgriProduct)
class AgriProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'category', 'barcode', 'is_approved']
    list_filter = ['category', 'is_approved']
    search_fields = ['name', 'brand', 'barcode']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'dealer', 'category', 'status', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['dealer__shop_name', 'description']
    readonly_fields = ['created_at', 'updated_at']

    actions = ['mark_verified', 'mark_dismissed']

    def mark_verified(self, request, queryset):
        for report in queryset:
            if report.status != 'verified':
                report.status = 'verified'
                report.save()
                report.dealer.verified_reports += 1
                report.dealer.save(update_fields=['verified_reports'])
                report.dealer.recalculate_trust_score()
    mark_verified.short_description = "Mark selected reports as Verified"

    def mark_dismissed(self, request, queryset):
        queryset.update(status='dismissed')
    mark_dismissed.short_description = "Mark selected reports as Dismissed"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'dealer', 'rating', 'created_at']
    list_filter = ['rating']
