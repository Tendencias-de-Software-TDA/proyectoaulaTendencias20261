from django.db import models
from django.utils import timezone
from apps.facturacion.models import Factura


class Pago(models.Model):

    class MedioPago(models.TextChoices):
        EFECTIVO = 'efectivo', 'Efectivo'
        TRANSFERENCIA = 'transferencia', 'Transferencia'
        TARJETA = 'tarjeta', 'Tarjeta'
        OTRO = 'otro', 'Otro'

    factura = models.ForeignKey(
        Factura,
        on_delete=models.PROTECT,
        related_name='pagos'
    )
    medio_pago = models.CharField(max_length=30, choices=MedioPago.choices)
    monto = models.DecimalField(max_digits=20, decimal_places=2)
    fecha_pago = models.DateField(default=timezone.now)
    comprobante = models.CharField(max_length=255)

    def __str__(self):
        return f"Pago {self.id} - Factura {self.factura.numero}"
