from rest_framework import serializers

from .models import NotaCredito


class NotaCreditoSerializer(serializers.ModelSerializer):
    factura_numero = serializers.IntegerField(
        source='factura.numero',
        read_only=True
    )
    cliente_nombre = serializers.CharField(
        source='factura.cliente.nombre',
        read_only=True
    )

    class Meta:
        model = NotaCredito
        fields = [
            'id',
            'numero',
            'factura',
            'factura_numero',
            'cliente_nombre',
            'motivo',
            'monto',
            'fecha',
            'observaciones',
        ]
        read_only_fields = ['id', 'numero', 'factura_numero', 'cliente_nombre']
