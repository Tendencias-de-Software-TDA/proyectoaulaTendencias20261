from rest_framework import serializers
from .models import Pago


class PagoSerializer(serializers.ModelSerializer):
    factura_numero = serializers.IntegerField(source='factura.numero', read_only=True)

    class Meta:
        model = Pago
        fields = [
            'id',
            'factura',
            'factura_numero',
            'medio_pago',
            'monto',
            'fecha_pago',
            'comprobante'
        ]
        read_only_fields = ['id', 'factura_numero']
