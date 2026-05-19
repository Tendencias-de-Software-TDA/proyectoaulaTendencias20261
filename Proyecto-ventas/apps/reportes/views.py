from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from apps.usuarios.permissions import EsContadorOAdmin
from .services.ventas import obtener_ventas_totales
from .services.productos import obtener_productos_top
from .services.clientes import obtener_clientes_top
from .services.cobros import obtener_tasa_cobro
from apps.facturacion.models import Factura


class ReportesViewSet(viewsets.ViewSet):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, EsContadorOAdmin]

    @swagger_auto_schema(
        operation_summary="Reporte financiero general",
        manual_parameters=[
            openapi.Parameter(
                'fecha_inicio',
                openapi.IN_QUERY,
                description='Fecha inicial del reporte (YYYY-MM-DD)',
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE
            ),
            openapi.Parameter(
                'fecha_fin',
                openapi.IN_QUERY,
                description='Fecha final del reporte (YYYY-MM-DD)',
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE
            ),
        ],
        responses={
            200: openapi.Response(
                description='Reporte generado correctamente',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'ventas_totales': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            title='Ventas Totales',
                            properties={
                                'total': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', title='Ventas Totales'),
                                'cantidad_facturas': openapi.Schema(type=openapi.TYPE_INTEGER, title='Cantidad de Facturas'),
                            }
                        ),
                        'clientes_top': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            title='Clientes Top',
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'cliente': openapi.Schema(type=openapi.TYPE_STRING, title='Cliente'),
                                    'total': openapi.Schema(type=openapi.TYPE_STRING, format='decimal', title='Total'),
                                }
                            )
                        ),
                        'productos_top': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            title='Productos Top',
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'producto': openapi.Schema(type=openapi.TYPE_STRING, title='Producto'),
                                    'cantidad': openapi.Schema(type=openapi.TYPE_INTEGER, title='Cantidad'),
                                    'total': openapi.Schema(type=openapi.TYPE_STRING, format='decimal', title='Total'),
                                }
                            )
                        ),
                        'tasa_cobro': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            title='Tasa de Cobro',
                            properties={
                                'porcentaje': openapi.Schema(type=openapi.TYPE_STRING, format='decimal', title='Porcentaje'),
                                'cobradas': openapi.Schema(type=openapi.TYPE_INTEGER, title='Cobradas'),
                                'pendientes': openapi.Schema(type=openapi.TYPE_INTEGER, title='Pendientes'),
                            }
                        ),
                    }
                )
            ),
            400: 'Parámetros inválidos'
        }
    )
    @action(detail=False, methods=['get'])
    def resumen(self, request):

        facturas = Factura.objects.exclude(
            estado=Factura.Estado.ANULADA
        )

        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if fecha_inicio and fecha_fin:
            facturas = facturas.filter(
                fecha_emision__range=[fecha_inicio, fecha_fin]
            )

        data = {
            'ventas_totales': obtener_ventas_totales(facturas),
            'clientes_top': obtener_clientes_top(facturas),
            'productos_top': obtener_productos_top(facturas),
            'tasa_cobro': obtener_tasa_cobro(facturas)
        }

        return Response(data)