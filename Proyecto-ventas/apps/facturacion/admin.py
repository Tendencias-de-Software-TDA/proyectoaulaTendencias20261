from django.contrib import admin
from .models import Factura


@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):

    list_display = (
        'numero',
        'cotizacion',
        'fecha_emision',
        'estado',
        'total',
        'saldo_pendiente'
    )

    list_filter = (
        'estado',
        'fecha_emision'
    )

    search_fields = (
        'numero',
    )