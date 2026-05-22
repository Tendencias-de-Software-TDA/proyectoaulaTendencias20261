from decimal import Decimal
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.clientes.models import Cliente
from apps.cotizacion.models import Cotizacion
from apps.facturacion.models import Factura
from apps.notas_credito.models import NotaCredito


class NotaCreditoModelTests(TestCase):

    def setUp(self):

        self.cliente = Cliente.objects.create(
            nombre='Cliente Test',
            identificacion='900111222',
            regimen_tributario='Común',
            direccion='Calle 1',
            email='test@example.com',
            telefono='3000000000',
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
        self.factura.aplicar_abono(self.factura.total)

    def test_aplicar_nota_credito_ajusta_saldo_y_estado(self):

        self.factura.aplicar_nota_credito(Decimal('50.00'))
        self.factura.refresh_from_db()

        self.assertEqual(self.factura.saldo_pendiente, Decimal('50.00'))
        self.assertEqual(self.factura.estado, Factura.Estado.PENDIENTE)

    def test_rechaza_nota_credito_si_factura_no_esta_pagada(self):

        factura_pendiente = Factura.crear_desde_cotizacion(
            Cotizacion.objects.create(
                cliente=self.cliente,
                fecha_vencimiento=timezone.now().date(),
                subtotal=Decimal('10.00'),
                iva=Decimal('1.90'),
                total=Decimal('11.90'),
                estado=Cotizacion.Estado.ACEPTADA,
            )
        )

        with self.assertRaises(ValidationError):
            factura_pendiente.aplicar_nota_credito(Decimal('5.00'))

    def test_rechaza_monto_mayor_al_credito_disponible(self):

        with self.assertRaises(ValidationError):
            self.factura.aplicar_nota_credito(Decimal('200.00'))

    def test_numero_nota_credito_autoincremental(self):

        nota = NotaCredito.objects.create(
            factura=self.factura,
            motivo=NotaCredito.Motivo.DEVOLUCION,
            monto=Decimal('10.00'),
            fecha=timezone.now().date(),
        )

        self.assertEqual(nota.numero, 1)
