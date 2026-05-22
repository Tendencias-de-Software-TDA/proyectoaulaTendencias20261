from decimal import Decimal
from django.db.models import Sum, F
from django.db.models import IntegerField, DecimalField
from django.db.models.functions import Coalesce


def obtener_productos_top(facturas):

    return facturas.values(

        id_producto=F(
            'cotizacion__items__producto__id'
        ),

        nombre_producto=F(
            'cotizacion__items__producto__nombre_producto'
        )

    ).annotate(

        total_facturado=Coalesce(
            Sum('cotizacion__items__subtotal'),
            Decimal('0.00'),
            output_field=DecimalField()
        ),

        cantidad_vendida=Coalesce(
            Sum('cotizacion__items__cantidad'),
            0,
            output_field=IntegerField()
        )

    ).order_by('-total_facturado')[:10]