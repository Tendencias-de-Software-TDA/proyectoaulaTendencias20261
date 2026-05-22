from django.contrib import admin

from .models import NotaCredito


@admin.register(NotaCredito)
class NotaCreditoAdmin(admin.ModelAdmin):

    list_display = (
        'numero',
        'factura',
        'motivo',
        'monto',
        'fecha',
    )
    list_filter = ('motivo', 'fecha')
    search_fields = ('factura__numero', 'observaciones')
