from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import AgriProduct, Dealer, DealerProduct, District, Report, Order


User = get_user_model()


class BaseDataMixin:
    def setUp(self):
        super().setUp()
        self.admin = User.objects.create_user(
            username='admin1',
            email='admin1@example.com',
            password='secret123',
            role='admin',
            is_staff=True,
            is_superuser=True,
        )
        self.dealer_user = User.objects.create_user(
            username='dealer1',
            email='dealer1@example.com',
            password='secret123',
            role='dealer',
        )
        self.farmer1 = User.objects.create_user(
            username='farmer1',
            email='farmer1@example.com',
            password='secret123',
            role='farmer',
        )
        self.farmer2 = User.objects.create_user(
            username='farmer2',
            email='farmer2@example.com',
            password='secret123',
            role='farmer',
        )

        self.district = District.objects.create(name='Bhopal', state='MP')
        self.dealer = Dealer.objects.create(
            user=self.dealer_user,
            name='Dealer Name',
            shop_name='Dealer Shop',
            license_number='LIC-001',
            license_status='active',
            address='Main road',
            district=self.district,
            phone='9999999999',
            is_approved=True,
            is_flagged=False,
        )


class ReportVisibilityTests(BaseDataMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.report1 = Report.objects.create(
            reporter=self.farmer1,
            dealer=self.dealer,
            category='overpricing',
            description='Dealer charged much more than market price in multiple transactions.',
        )
        self.report2 = Report.objects.create(
            reporter=self.farmer2,
            dealer=self.dealer,
            category='fake_product',
            description='The product looked adulterated and damaged crop growth in my field.',
        )

    def test_report_list_requires_authentication(self):
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_sees_all_reports(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_dealer_sees_reports_against_own_dealer(self):
        self.client.force_authenticate(user=self.dealer_user)
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_farmer_sees_only_own_reports(self):
        self.client.force_authenticate(user=self.farmer1)
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.report1.id)


class OrderPricingIntegrityTests(BaseDataMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.p1 = AgriProduct.objects.create(
            barcode='BAR-001',
            name='Nitrogen Boost',
            brand='AgriBrand',
            category='fertilizer',
            is_approved=True,
        )
        self.p2 = AgriProduct.objects.create(
            barcode='BAR-002',
            name='Pest Shield',
            brand='AgriBrand',
            category='pesticide',
            is_approved=True,
        )
        DealerProduct.objects.create(dealer=self.dealer, product=self.p1, price=Decimal('100.00'), in_stock=True)
        DealerProduct.objects.create(dealer=self.dealer, product=self.p2, price=Decimal('50.00'), in_stock=True)

    def test_order_total_is_calculated_server_side(self):
        self.client.force_authenticate(user=self.farmer1)
        payload = {
            'dealer': self.dealer.id,
            'total_amount': '1.00',
            'items': [
                {'product': self.p1.id, 'quantity': 2, 'price_at_time': '1.00'},
                {'product': self.p2.id, 'quantity': 1, 'price_at_time': '1.00'},
            ],
        }
        response = self.client.post('/api/orders/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['total_amount']), Decimal('250.00'))

        items = response.data['items']
        self.assertEqual(len(items), 2)
        item_price_map = {item['product']: Decimal(item['price_at_time']) for item in items}
        self.assertEqual(item_price_map[self.p1.id], Decimal('100.00'))
        self.assertEqual(item_price_map[self.p2.id], Decimal('50.00'))


class ReportStatusTransitionTests(BaseDataMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.report = Report.objects.create(
            reporter=self.farmer1,
            dealer=self.dealer,
            category='unlicensed',
            description='Dealer appears to be operating without valid license in this district.',
        )

    def test_verified_report_counter_transitions_correctly(self):
        self.client.force_authenticate(user=self.admin)

        verify_once = self.client.patch(
            f'/api/reports/{self.report.id}/update_status/',
            {'status': 'verified', 'admin_notes': 'Verified by inspector.'},
            format='json',
        )
        self.assertEqual(verify_once.status_code, status.HTTP_200_OK)
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.verified_reports, 1)

        verify_again = self.client.patch(
            f'/api/reports/{self.report.id}/update_status/',
            {'status': 'verified', 'admin_notes': 'No change.'},
            format='json',
        )
        self.assertEqual(verify_again.status_code, status.HTTP_200_OK)
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.verified_reports, 1)

        dismiss = self.client.patch(
            f'/api/reports/{self.report.id}/update_status/',
            {'status': 'dismissed', 'admin_notes': 'Re-evaluated and dismissed.'},
            format='json',
        )
        self.assertEqual(dismiss.status_code, status.HTTP_200_OK)
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.verified_reports, 0)


class ReportValidationTests(BaseDataMixin, APITestCase):
    def test_report_description_must_be_minimum_length(self):
        self.client.force_authenticate(user=self.farmer1)
        payload = {
            'dealer': self.dealer.id,
            'category': 'other',
            'description': 'Too short',
        }
        response = self.client.post('/api/reports/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('description', response.data)


class FilteringAndSearchTests(BaseDataMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.other_dealer_user = User.objects.create_user(
            username='dealer2',
            email='dealer2@example.com',
            password='secret123',
            role='dealer',
        )
        self.other_dealer = Dealer.objects.create(
            user=self.other_dealer_user,
            name='Pending Dealer',
            shop_name='Pending Shop',
            license_number='LIC-002',
            license_status='pending',
            address='Side road',
            district=self.district,
            phone='8888888888',
            is_approved=False,
            is_flagged=False,
        )

        self.report1 = Report.objects.create(
            reporter=self.farmer1,
            dealer=self.dealer,
            category='overpricing',
            description='Shopkeeper overcharged for fertilizer during kharif season purchase.',
            status='pending',
        )
        self.report2 = Report.objects.create(
            reporter=self.farmer2,
            dealer=self.other_dealer,
            category='fake_product',
            description='Suspected fake pesticide packet sold in market.',
            status='under_review',
        )

    def test_admin_can_filter_dealers_by_approval_and_flag(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/dealers/?is_approved=false&is_flagged=false')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.other_dealer.id)

    def test_admin_can_search_reports_by_description_text(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/reports/?search=overcharged')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.report1.id)

    def test_admin_can_filter_reports_by_status(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/reports/?status=under_review')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.report2.id)


class OrderStatsTests(BaseDataMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.other_dealer_user = User.objects.create_user(
            username='dealerX',
            email='dealerx@example.com',
            password='secret123',
            role='dealer',
        )
        self.other_dealer = Dealer.objects.create(
            user=self.other_dealer_user,
            name='Other Dealer',
            shop_name='Other Shop',
            license_number='LIC-010',
            license_status='active',
            address='Alt road',
            district=self.district,
            phone='7777777777',
            is_approved=True,
            is_flagged=False,
        )

        Order.objects.create(farmer=self.farmer1, dealer=self.dealer, total_amount='100.00', status='pending')
        Order.objects.create(farmer=self.farmer1, dealer=self.dealer, total_amount='200.00', status='shipped')
        Order.objects.create(farmer=self.farmer2, dealer=self.dealer, total_amount='150.00', status='delivered')
        Order.objects.create(farmer=self.farmer2, dealer=self.other_dealer, total_amount='99.00', status='cancelled')

    def test_admin_stats_include_all_orders(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/orders/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        stats = response.data['data']
        self.assertEqual(stats['all'], 4)
        self.assertEqual(stats['pending'], 1)
        self.assertEqual(stats['shipped'], 1)
        self.assertEqual(stats['delivered'], 1)
        self.assertEqual(stats['cancelled'], 1)

    def test_farmer_stats_are_scoped(self):
        self.client.force_authenticate(user=self.farmer1)
        response = self.client.get('/api/orders/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        stats = response.data['data']
        self.assertEqual(stats['all'], 2)
        self.assertEqual(stats['pending'], 1)
        self.assertEqual(stats['shipped'], 1)
        self.assertEqual(stats['delivered'], 0)
        self.assertEqual(stats['cancelled'], 0)

    def test_dealer_stats_are_scoped(self):
        self.client.force_authenticate(user=self.dealer_user)
        response = self.client.get('/api/orders/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        stats = response.data['data']
        self.assertEqual(stats['all'], 3)
        self.assertEqual(stats['pending'], 1)
        self.assertEqual(stats['shipped'], 1)
        self.assertEqual(stats['delivered'], 1)
        self.assertEqual(stats['cancelled'], 0)


class DealerMeEndpointTests(BaseDataMixin, APITestCase):
    def test_dealer_can_fetch_own_profile_from_me_endpoint(self):
        self.client.force_authenticate(user=self.dealer_user)
        response = self.client.get('/api/dealers/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.dealer.id)

    def test_dealer_can_patch_own_profile_from_me_endpoint(self):
        self.client.force_authenticate(user=self.dealer_user)
        response = self.client.patch('/api/dealers/me/', {'address': 'Updated address line'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.address, 'Updated address line')

    def test_farmer_cannot_access_dealer_me_endpoint(self):
        self.client.force_authenticate(user=self.farmer1)
        response = self.client.get('/api/dealers/me/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
