from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.usuarios.permissions import EsContadorOAdmin
from apps.facturacion.models import Factura
from .models import Pago
from .serializer import PagoSerializer


class PagoViewSet(viewsets.ModelViewSet):

    queryset = Pago.objects.select_related('factura').all().order_by('-fecha_pago', '-id')
    serializer_class = PagoSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, EsContadorOAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        factura_id = self.request.query_params.get('factura_id')
        if factura_id:
            queryset = queryset.filter(factura_id=factura_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        factura_id = serializer.validated_data['factura'].id
        monto = serializer.validated_data['monto']

        with transaction.atomic():
            factura = Factura.objects.select_for_update().get(id=factura_id)

            
            if factura.estado == Factura.Estado.ANULADA:
                return Response(
                    {'detail': 'No se pueden registrar pagos en facturas anuladas'},
                    status=status.HTTP_400_BAD_REQUEST
                )

           
            if factura.estado == Factura.Estado.PAGADA:
                return Response(
                    {'detail': 'La factura ya se encuentra pagada'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                factura.aplicar_abono(monto)
            except ValidationError as exc:
                return Response(
                    {'detail': exc.message},
                    status=status.HTTP_400_BAD_REQUEST
                )

            pago = Pago.objects.create(
                factura=factura,
                medio_pago=serializer.validated_data['medio_pago'],
                monto=monto,
                fecha_pago=serializer.validated_data['fecha_pago'],
                comprobante=serializer.validated_data['comprobante']
            )

        return Response(
            {
                'detail': 'Pago registrado correctamente',
                'pago': self.get_serializer(pago).data,
                'saldo_pendiente': factura.saldo_pendiente,
                'estado_factura': factura.estado
            },
            status=status.HTTP_201_CREATED
        )