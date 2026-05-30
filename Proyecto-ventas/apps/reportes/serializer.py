from rest_framework import serializers


class ReporteFinancieroSerializer(serializers.Serializer):

    fecha_inicio = serializers.DateField(required=False)
    fecha_fin = serializers.DateField(required=False)

    def validate(self, data):

        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')

        if fecha_inicio and fecha_fin:

            if fecha_inicio > fecha_fin:
                raise serializers.ValidationError(
                    "La fecha inicial no puede ser mayor a la final"
                )

        return data