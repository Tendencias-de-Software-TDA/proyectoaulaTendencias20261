from django.contrib import admin
from .models import Pago


@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):

    list_display = ('id', 'factura', 'medio_pago', 'monto', 'fecha_pago')
    list_filter = ('medio_pago', 'fecha_pago')
    search_fields = ('factura__numero', 'comprobante')
