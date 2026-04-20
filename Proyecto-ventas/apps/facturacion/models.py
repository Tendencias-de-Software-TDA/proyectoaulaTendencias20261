from django.db import models
from decimal import Decimal
from django.core.exceptions import ValidationError
from apps.clientes.models import Cliente
from apps.cotizacion.models import Cotizacion


class Factura(models.Model):

    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        PAGADA = 'pagada', 'Pagada'
        ANULADA = 'anulada', 'Anulada'

    numero = models.PositiveIntegerField(unique=True, editable=False)

    cotizacion = models.OneToOneField(
        Cotizacion,
        on_delete=models.PROTECT,
        related_name='factura'
    )

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)

    fecha_emision = models.DateField(auto_now_add=True)
    fecha_vencimiento = models.DateField()

    subtotal = models.DecimalField(max_digits=20, decimal_places=2)
    iva = models.DecimalField(max_digits=20, decimal_places=2)
    total = models.DecimalField(max_digits=20, decimal_places=2)
    saldo_pendiente = models.DecimalField(max_digits=20, decimal_places=2)

    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE
    )

    motivo_anulacion = models.TextField(null=True, blank=True)
    fecha_anulacion = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.numero:
            last = Factura.objects.order_by('-numero').first()
            self.numero = 1 if not last else last.numero + 1
        if self.saldo_pendiente is None:
            self.saldo_pendiente = self.total
        super().save(*args, **kwargs)

    def aplicar_abono(self, monto):
        if monto <= Decimal('0.00'):
            raise ValidationError("El monto del pago debe ser mayor a cero")

        if self.estado == self.Estado.ANULADA:
            raise ValidationError("No se pueden registrar pagos en facturas anuladas")

        if self.saldo_pendiente <= Decimal('0.00'):
            raise ValidationError("La factura ya está pagada")

        if monto > self.saldo_pendiente:
            raise ValidationError("El monto del pago no puede superar el saldo pendiente")

        self.saldo_pendiente -= monto
        self.estado = self.Estado.PAGADA if self.saldo_pendiente == Decimal('0.00') else self.Estado.PENDIENTE
        self.save(update_fields=['saldo_pendiente', 'estado'])

    def __str__(self):
        return f"Factura {self.numero}"