from django.shortcuts import render
from django.core.exceptions import ValidationError as DjangoValidationError
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

        try:
            factura = Factura.crear_desde_cotizacion(
                cotizacion,
                dias_vencimiento=30
            )

        except DjangoValidationError as exc:
            detail = getattr(exc, "message", None) or (
                " ".join(str(m) for m in exc.messages)
                if getattr(exc, "messages", None)
                else str(exc)
            )
            return Response(
                {"detail": detail},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            "message": "Factura creada correctamente",
            "numero": factura.numero
        }, status=status.HTTP_201_CREATED)