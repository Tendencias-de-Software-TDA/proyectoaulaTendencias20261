from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from django.utils import timezone
from .models import Factura
from .serializer import (
    FacturaSerializer,
    ConvertirFacturaSerializer,
    AnularFacturaSerializer
)

from apps.usuarios.permissions import EsContadorOAdmin


class FacturaViewSet(viewsets.ModelViewSet):

    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def generar_numero(self):
        ultimo = Factura.objects.order_by('id').last()

        if not ultimo:
            return 1

        return ultimo.numero + 1

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated, EsContadorOAdmin]
    )
    def convertir(self, request):

        serializer = ConvertirFacturaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cotizacion = serializer.validated_data['cotizacion']

        factura = Factura.objects.create(
            numero=self.generar_numero(),
            cotizacion=cotizacion,
            cliente=cotizacion.cliente,
            subtotal=cotizacion.subtotal,
            iva=cotizacion.iva,
            total=cotizacion.total,
            saldo_pendiente=cotizacion.total,
            fecha_vencimiento=timezone.now().date() + timedelta(days=15),
            estado=Factura.Estado.PENDIENTE
        )

        return Response(
            FacturaSerializer(factura).data,
            status=status.HTTP_201_CREATED
        )

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated, EsContadorOAdmin]
    )
    def anular(self, request, pk=None):

        factura = self.get_object()

       
        if factura.pagos.exists():
            return Response(
                {"detail": "No se puede anular la factura porque tiene pagos registrados"},
                status=status.HTTP_400_BAD_REQUEST
            )

       
        if factura.estado == Factura.Estado.ANULADA:
            return Response(
                {"detail": "La factura ya se encuentra anulada"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AnularFacturaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        factura.estado = Factura.Estado.ANULADA
        factura.motivo_anulacion = serializer.validated_data['motivo']
        factura.fecha_anulacion = timezone.now()

        factura.save(update_fields=[
            'estado',
            'motivo_anulacion',
            'fecha_anulacion'
        ])

        return Response(
            {"detail": "Factura anulada correctamente"},
            status=status.HTTP_200_OK
        )