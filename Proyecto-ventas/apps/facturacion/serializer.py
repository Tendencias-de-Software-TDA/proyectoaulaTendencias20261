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

    def validate(self, data):

        cotizacion = Cotizacion.objects.filter(id=data['cotizacion_id']).first()

        if not cotizacion:
            raise serializers.ValidationError("La cotización no existe")

        if cotizacion.estado != Cotizacion.Estado.ACEPTADA:
            raise serializers.ValidationError("Solo cotizaciones aceptadas pueden convertirse")

        from .models import Factura

        if Factura.objects.filter(cotizacion=cotizacion).exists():
            raise serializers.ValidationError("Esta cotización ya fue facturada")

        data['cotizacion'] = cotizacion
        return data


class AnularFacturaSerializer(serializers.Serializer):
    motivo = serializers.CharField()

    def validate_motivo(self, value):
        if not value.strip():
            raise serializers.ValidationError("El motivo es obligatorio")
        return value