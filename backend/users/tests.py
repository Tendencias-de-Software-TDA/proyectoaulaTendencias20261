from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User


class AuthTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='edison',
            password='pass1234',
            email='edison@test.com'
        )

    def test_registro_usuario(self):
        admin = User.objects.create_user(
            username='admin',
            password='pass1234',
            email='admin@test.com',
            role='admin'
        )
        self.client.force_authenticate(user=admin)
        response = self.client.post('/api/users/', {
            'username': 'nuevo',
            'password': 'pass1234',
            'email': 'nuevo@test.com'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login_correcto(self):
        response = self.client.post('/api/token/', {
            'username': 'edison',
            'password': 'pass1234'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_incorrecto(self):
        response = self.client.post('/api/token/', {
            'username': 'edison',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_perfil_autenticado(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'edison')

    def test_perfil_sin_autenticar(self):
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserMetricsTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='dev',
            password='pass1234',
            email='dev@test.com'
        )

    def test_metricas_usuario_propio(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/users/{self.user.id}/metrics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_assigned', response.data)
        self.assertIn('fulfillment_rate_percent', response.data)
        self.assertIn('overdue', response.data)

    def test_metricas_otro_usuario_sin_permiso(self):
        otro = User.objects.create_user(
            username='otro',
            password='pass1234',
            email='otro@test.com'
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/users/{otro.id}/metrics/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)