from decimal import Decimal

from django.db import IntegrityError
from django.test import TestCase

from apps.productos.models import Producto


class ProductoModelTests(TestCase):

    def setUp(self):
        self.producto = Producto.objects.create(
            nombre_producto='Teclado USB',
            codigo='TEC-001',
            descripcion='Teclado mecánico',
            unidad_medida='unidad',
            precio_unitario=Decimal('120000.00'),
            porcentaje_iva=Decimal('19.00'),
        )

    def test_str_devuelve_nombre_producto(self):
        self.assertEqual(str(self.producto), 'Teclado USB')

    def test_estado_por_defecto_activo(self):
        self.assertEqual(self.producto.estado, Producto.Estado.ACTIVO)

    def test_codigo_es_unico(self):
        with self.assertRaises(IntegrityError):
            Producto.objects.create(
                nombre_producto='Duplicado',
                codigo='TEC-001',
                descripcion='Copia',
                unidad_medida='unidad',
                precio_unitario=Decimal('100000.00'),
            )
