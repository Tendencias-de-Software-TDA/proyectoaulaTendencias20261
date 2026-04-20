from rest_framework import serializers
from .models import Cotizacion, ItemCotizacion
from apps.productos.models import Producto


class ItemCotizacionSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemCotizacion
        fields = ['producto', 'cantidad']


class CotizacionSerializer(serializers.ModelSerializer):

    # 🔴 Se mantiene para lectura (GET)
    items = ItemCotizacionSerializer(many=True, read_only=True)

    class Meta:
        model = Cotizacion
        fields = "__all__"

    def create(self, validated_data):

        # 🔥 FIX: tomar items desde request.data porque no viene en validated_data
        items_data = self.context['request'].data.get('items', [])

        cotizacion = Cotizacion.objects.create(**validated_data)

        for item_data in items_data:

            producto = Producto.objects.get(id=item_data['producto'])

            ItemCotizacion.objects.create(
                cotizacion=cotizacion,
                producto=producto,
                cantidad=item_data['cantidad']
            )

        return cotizacion