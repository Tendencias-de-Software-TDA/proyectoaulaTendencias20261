from django.db import IntegrityError
from django.test import TestCase

from apps.clientes.models import Cliente


class ClienteModelTests(TestCase):

    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre='Empresa Demo',
            identificacion='900100200',
            regimen_tributario='Común',
            direccion='Calle 10 #20-30',
            email='demo@empresa.com',
            telefono='3001234567',
        )

    def test_str_devuelve_nombre(self):
        self.assertEqual(str(self.cliente), 'Empresa Demo')

    def test_identificacion_es_unica(self):
        with self.assertRaises(IntegrityError):
            Cliente.objects.create(
                nombre='Otro Cliente',
                identificacion='900100200',
                regimen_tributario='Simplificado',
                direccion='Otra dirección',
                email='otro@empresa.com',
                telefono='3009876543',
            )
