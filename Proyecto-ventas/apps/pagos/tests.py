from datetime import datetime
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from apps.clientes.models import Cliente
from apps.cotizacion.models import Cotizacion
from apps.facturacion.models import Factura
from apps.pagos.models import Pago


class PagoModelTests(TestCase):

    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre='Cliente Pago',
            identificacion='600100200',
            regimen_tributario='Común',
            direccion='Calle 2',
            email='pago@test.com',
            telefono='3300000000',
        )
        self.cotizacion = Cotizacion.objects.create(
            cliente=self.cliente,
            fecha_vencimiento=timezone.now().date(),
            subtotal=Decimal('100.00'),
            iva=Decimal('19.00'),
            total=Decimal('119.00'),
            estado=Cotizacion.Estado.ACEPTADA,
        )
        self.factura = Factura.crear_desde_cotizacion(self.cotizacion)
        self.pago = Pago.objects.create(
            factura=self.factura,
            medio_pago=Pago.MedioPago.TRANSFERENCIA,
            monto=Decimal('50.00'),
            comprobante='TRX-12345',
        )

    def test_str_incluye_factura(self):
        self.assertIn(str(self.factura.numero), str(self.pago))

    def test_relacion_con_factura(self):
        self.assertEqual(self.pago.factura_id, self.factura.id)
        self.assertIn(self.pago, self.factura.pagos.all())

    def test_fecha_pago_asignada_al_crear(self):
        fecha = self.pago.fecha_pago
        if isinstance(fecha, datetime):
            fecha = fecha.date()
        self.assertIsNotNone(fecha)
