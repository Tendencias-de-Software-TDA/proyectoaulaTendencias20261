from rest_framework import serializers
from .models import Factura
from apps.cotizacion.models import Cotizacion


class FacturaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Factura
        fields = "__all__"
        read_only_fields = [
            'numero',
            'cliente',
            'subtotal',
            'iva',
            'total',
            'saldo_pendiente',
            'estado',
            'motivo_anulacion',
            'fecha_emision'
        ]


class ConvertirFacturaSerializer(serializers.Serializer):
    cotizacion_id = serializers.IntegerField()


class AnularFacturaSerializer(serializers.Serializer):
    motivo = serializers.CharField()

    def validate_motivo(self, value):
        if not value.strip():
            raise serializers.ValidationError("El motivo es obligatorio")
        return value