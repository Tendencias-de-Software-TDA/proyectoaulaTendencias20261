from django.shortcuts import render
from rest_framework import viewsets, status
from .models import Cotizacion
from .serializer import CotizacionSerializer
from apps.usuarios.permissions import EsVendedorOAdmin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.facturacion.models import Factura
from datetime import timedelta
from django.utils import timezone


class CotizacionViewSet(viewsets.ModelViewSet):

    queryset = Cotizacion.objects.all()
    serializer_class = CotizacionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, EsVendedorOAdmin]

    
    @action(detail=True, methods=['post'])
    def convertir_a_factura(self, request, pk=None):
        cotizacion = self.get_object()

        
        if cotizacion.estado in ['borrador', 'rechazada', 'vencida']:
            return Response(
                {"error": "No se puede convertir esta cotización"},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        if hasattr(cotizacion, 'factura'):
            return Response(
                {"error": "La cotización ya fue convertida en factura"},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        factura = Factura.objects.create(
            cotizacion=cotizacion,
            cliente=cotizacion.cliente,
            subtotal=cotizacion.subtotal,
            iva=cotizacion.iva,
            total=cotizacion.total,
            saldo_pendiente=cotizacion.total,
            fecha_vencimiento=timezone.now().date() + timedelta(days=30),
            estado=Factura.Estado.PENDIENTE
        )

        return Response({
            "message": "Factura creada correctamente",
            "numero": factura.numero
        }, status=status.HTTP_201_CREATED)
