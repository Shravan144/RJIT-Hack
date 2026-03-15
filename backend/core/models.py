from django.db import models
from django.conf import settings
import uuid


class District(models.Model):
    name = models.CharField(max_length=100)
    state = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name}, {self.state}"


class Dealer(models.Model):
    LICENSE_STATUS = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('expired', 'Expired'),
        ('pending', 'Pending'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        null=True, blank=True, related_name='dealer_profile'
    )
    name = models.CharField(max_length=200)
    license_number = models.CharField(max_length=100, unique=True)
    license_status = models.CharField(max_length=20, choices=LICENSE_STATUS, default='active')
    license_expiry = models.DateField(null=True, blank=True)
    shop_name = models.CharField(max_length=200)
    address = models.TextField()
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    trust_score = models.FloatField(default=5.0)
    total_reports = models.IntegerField(default=0)
    verified_reports = models.IntegerField(default=0)
    specializations = models.CharField(max_length=300, blank=True, help_text="Comma-separated categories")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.shop_name} ({self.license_number})"

    def recalculate_trust_score(self):
        """Recalculate trust score based on verified reports and complaints."""
        base = 5.0
        if self.total_reports > 0:
            complaint_ratio = self.verified_reports / self.total_reports
            base = max(1.0, 5.0 - (complaint_ratio * 4.0))
        self.trust_score = round(base, 1)
        self.save(update_fields=['trust_score'])


class AgriProduct(models.Model):
    CATEGORY_CHOICES = [
        ('pesticide', 'Pesticide'),
        ('fertilizer', 'Fertilizer'),
        ('seed', 'Seed'),
        ('herbicide', 'Herbicide'),
        ('fungicide', 'Fungicide'),
        ('equipment', 'Equipment'),
        ('other', 'Other'),
    ]

    barcode = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    active_ingredients = models.TextField(blank=True)
    manufacturer = models.CharField(max_length=200, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    is_approved = models.BooleanField(default=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} by {self.brand}"


class DealerProduct(models.Model):
    """Products stocked by a dealer."""
    dealer = models.ForeignKey(Dealer, on_delete=models.CASCADE, related_name='products')
    product = models.ForeignKey(AgriProduct, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    in_stock = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['dealer', 'product']


class Report(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('verified', 'Verified'),
        ('dismissed', 'Dismissed'),
    ]
    CATEGORY_CHOICES = [
        ('fake_product', 'Fake/Adulterated Product'),
        ('overpricing', 'Overpricing'),
        ('unlicensed', 'Unlicensed Operation'),
        ('expired_product', 'Selling Expired Product'),
        ('wrong_advice', 'Wrong Agronomic Advice'),
        ('other', 'Other'),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='filed_reports'
    )
    dealer = models.ForeignKey(Dealer, on_delete=models.CASCADE, related_name='reports')
    product = models.ForeignKey(AgriProduct, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    evidence_image = models.ImageField(upload_to='evidence/', null=True, blank=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report #{self.pk} against {self.dealer.shop_name} [{self.status}]"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            self.dealer.total_reports += 1
            self.dealer.save(update_fields=['total_reports'])

    class Meta:
        ordering = ['-created_at']


class Review(models.Model):
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews'
    )
    dealer = models.ForeignKey(Dealer, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['reviewer', 'dealer']

    def __str__(self):
        return f"{self.reviewer.username} → {self.dealer.shop_name}: {self.rating}★"
