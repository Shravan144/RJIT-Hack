from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from core.models import Dealer


User = get_user_model()


class RegistrationSecurityTests(APITestCase):
    def test_register_cannot_escalate_to_admin(self):
        payload = {
            'username': 'attacker',
            'email': 'attacker@example.com',
            'password': 'secret123',
            'role': 'admin',
        }
        response = self.client.post('/api/users/register/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='attacker')
        self.assertEqual(user.role, 'farmer')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_register_allows_duplicate_usernames_with_different_email(self):
        payload1 = {
            'username': 'same_name',
            'email': 'first@example.com',
            'password': 'secret123',
            'role': 'farmer',
        }
        payload2 = {
            'username': 'same_name',
            'email': 'second@example.com',
            'password': 'secret123',
            'role': 'dealer',
        }

        response1 = self.client.post('/api/users/register/', payload1, format='json')
        response2 = self.client.post('/api/users/register/', payload2, format='json')

        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(username='same_name').count(), 2)

    def test_register_blocks_duplicate_email(self):
        payload = {
            'username': 'user1',
            'email': 'dup@example.com',
            'password': 'secret123',
            'role': 'farmer',
        }
        response1 = self.client.post('/api/users/register/', payload, format='json')
        response2 = self.client.post('/api/users/register/', {
            **payload,
            'username': 'user2',
        }, format='json')

        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response2.data)

    def test_login_uses_email_instead_of_username(self):
        User.objects.create_user(
            username='loginname',
            email='login@example.com',
            password='secret123',
            role='farmer',
        )

        response = self.client.post('/api/token/', {
            'email': 'login@example.com',
            'password': 'secret123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_dealer_registration_creates_active_approved_dealer_profile(self):
        payload = {
            'username': 'dealernew',
            'email': 'dealernew@example.com',
            'password': 'secret123',
            'role': 'dealer',
        }
        response = self.client.post('/api/users/register/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='dealernew@example.com')
        dealer = Dealer.objects.get(user=user)
        self.assertTrue(dealer.is_approved)
        self.assertEqual(dealer.license_status, 'active')
