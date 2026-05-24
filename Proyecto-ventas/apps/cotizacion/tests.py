from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from apps.clientes.models import Cliente
from apps.cotizacion.models import Cotizacion, ItemCotizacion
from apps.productos.models import Producto


class CotizacionModelTests(TestCase):

    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre='Cliente Cotización',
            identificacion='800200300',
            regimen_tributario='Común',
            direccion='Calle 5',
            email='cot@test.com',
            telefono='3100000000',
        )
        self.cotizacion = Cotizacion.objects.create(
            cliente=self.cliente,
            fecha_vencimiento=timezone.now().date(),
        )

    def test_str_incluye_id_y_cliente(self):
        texto = str(self.cotizacion)
        self.assertIn('Cotización', texto)
        self.assertIn(self.cliente.nombre, texto)

    def test_estado_por_defecto_borrador(self):
        self.assertEqual(self.cotizacion.estado, Cotizacion.Estado.BORRADOR)


class ItemCotizacionModelTests(TestCase):

    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre='Cliente Items',
            identificacion='800200301',
            regimen_tributario='Común',
            direccion='Calle 6',
            email='items@test.com',
            telefono='3100000001',
        )
        self.producto = Producto.objects.create(
            nombre_producto='Monitor',
            codigo='MON-001',
            descripcion='Monitor 24"',
            unidad_medida='unidad',
            precio_unitario=Decimal('100.00'),
            porcentaje_iva=Decimal('19.00'),
        )
        self.cotizacion = Cotizacion.objects.create(
            cliente=self.cliente,
            fecha_vencimiento=timezone.now().date(),
            estado=Cotizacion.Estado.ACEPTADA,
        )

    def test_save_recalcula_totales_de_la_cotizacion(self):
        ItemCotizacion.objects.create(
            cotizacion=self.cotizacion,
            producto=self.producto,
            cantidad=2,
            precio=Decimal('0'),
            subtotal=Decimal('0'),
        )
        self.cotizacion.refresh_from_db()

        self.assertEqual(self.cotizacion.subtotal, Decimal('200.00'))
        self.assertEqual(self.cotizacion.iva, Decimal('38.00'))
        self.assertEqual(self.cotizacion.total, Decimal('238.00'))
