from decimal import Decimal
from django.db.models import Sum
from django.db.models.functions import Coalesce
from apps.facturacion.models import Factura


def obtener_ventas_totales(facturas):

    return facturas.aggregate(
        total_ventas=Coalesce(
            Sum('total'),
            Decimal('0.00')
        )
    )['total_ventas']