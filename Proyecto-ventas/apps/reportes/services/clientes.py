from decimal import Decimal
from django.db.models import Sum, Count, F
from django.db.models.functions import Coalesce


def obtener_clientes_top(facturas):

    return facturas.values(

        id_cliente=F('cliente__id'),

        nombre_cliente=F('cliente__nombre')

    ).annotate(

        total_compras=Coalesce(
            Sum('total'),
            Decimal('0.00')
        ),

        cantidad_facturas=Count('id')

    ).order_by('-total_compras')[:10]