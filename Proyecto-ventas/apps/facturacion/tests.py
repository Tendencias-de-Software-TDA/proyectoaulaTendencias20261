from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.clientes.models import Cliente
from apps.cotizacion.models import Cotizacion, ItemCotizacion
from apps.facturacion.models import Factura
from apps.pagos.models import Pago
from apps.productos.models import Producto


class FacturaModelTests(TestCase):

    def setUp(self):
        self.cliente = Cliente.objects.create(
            nombre='Cliente Factura',
            identificacion='700100200',
            regimen_tributario='Común',
            direccion='Calle 1',
            email='factura@test.com',
            telefono='3200000000',
        )
        self.producto = Producto.objects.create(
            nombre_producto='Servicio',
            codigo='SRV-001',
            descripcion='Servicio mensual',
            unidad_medida='unidad',
            precio_unitario=Decimal('100.00'),
            porcentaje_iva=Decimal('19.00'),
        )
        self.cotizacion = Cotizacion.objects.create(
            cliente=self.cliente,
            fecha_vencimiento=timezone.now().date(),
            estado=Cotizacion.Estado.ACEPTADA,
        )
        ItemCotizacion.objects.create(
            cotizacion=self.cotizacion,
            producto=self.producto,
            cantidad=1,
            precio=Decimal('0'),
            subtotal=Decimal('0'),
        )
        self.cotizacion.refresh_from_db()
        self.factura = Factura.crear_desde_cotizacion(self.cotizacion)

    def test_crear_desde_cotizacion(self):
        self.assertEqual(self.factura.total, self.cotizacion.total)
        self.assertEqual(self.factura.saldo_pendiente, self.cotizacion.total)
        self.assertEqual(self.factura.estado, Factura.Estado.PENDIENTE)

    def test_aplicar_abono_total_marca_pagada(self):
        self.factura.aplicar_abono(self.factura.total)
        self.factura.refresh_from_db()
        self.assertEqual(self.factura.estado, Factura.Estado.PAGADA)
        self.assertEqual(self.factura.saldo_pendiente, Decimal('0.00'))

    def test_aplicar_nota_credito_sobre_factura_pagada(self):
        self.factura.aplicar_abono(self.factura.total)
        self.factura.aplicar_nota_credito(Decimal('50.00'))
        self.factura.refresh_from_db()
        self.assertEqual(self.factura.saldo_pendiente, Decimal('50.00'))
        self.assertEqual(self.factura.estado, Factura.Estado.PENDIENTE)

    def test_anular_sin_pagos(self):
        self.factura.anular('Corrección administrativa')
        self.factura.refresh_from_db()
        self.assertEqual(self.factura.estado, Factura.Estado.ANULADA)

    def test_rechaza_anular_con_pagos(self):
        self.factura.aplicar_abono(Decimal('10.00'))
        Pago.objects.create(
            factura=self.factura,
            medio_pago=Pago.MedioPago.EFECTIVO,
            monto=Decimal('10.00'),
            comprobante='REC-001',
        )
        with self.assertRaises(ValidationError):
            self.factura.anular('No permitido')
