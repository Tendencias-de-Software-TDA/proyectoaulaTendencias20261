from django.db import models
from django.utils import timezone

from apps.facturacion.models import Factura


class NotaCredito(models.Model):

    class Motivo(models.TextChoices):
        DEVOLUCION = 'devolucion', 'Devolución'
        DESCUENTO_POSTERIOR = 'descuento_posterior', 'Descuento posterior'
        CORRECCION = 'correccion', 'Corrección'

    numero = models.PositiveIntegerField(unique=True, editable=False)

    factura = models.ForeignKey(
        Factura,
        on_delete=models.PROTECT,
        related_name='notas_credito'
    )

    motivo = models.CharField(max_length=30, choices=Motivo.choices)
    monto = models.DecimalField(max_digits=20, decimal_places=2)
    fecha = models.DateField(default=timezone.now)
    observaciones = models.TextField(blank=True, default='')

    def save(self, *args, **kwargs):

        if not self.numero:
            last = NotaCredito.objects.order_by('-numero').first()
            self.numero = 1 if not last else last.numero + 1

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Nota crédito {self.numero} - Factura {self.factura.numero}"
