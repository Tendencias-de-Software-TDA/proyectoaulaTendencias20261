from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from apps.facturacion.models import Factura
from apps.usuarios.permissions import EsContadorOAdmin
from .models import NotaCredito
from .serializer import NotaCreditoSerializer


class NotaCreditoViewSet(viewsets.ModelViewSet):

    queryset = NotaCredito.objects.select_related(
        'factura',
        'factura__cliente',
    ).all().order_by('-fecha', '-id')

    serializer_class = NotaCreditoSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, EsContadorOAdmin]

    http_method_names = ['get', 'post', 'head', 'options']

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

            factura = Factura.objects.select_for_update().get(
                id=factura_id
            )

            try:
                factura.aplicar_nota_credito(monto)

            except ValidationError as exc:
                return Response(
                    {'detail': exc.message},
                    status=status.HTTP_400_BAD_REQUEST
                )

            nota = NotaCredito.objects.create(
                factura=factura,
                motivo=serializer.validated_data['motivo'],
                monto=monto,
                fecha=serializer.validated_data.get(
                    'fecha',
                    timezone.now().date(),
                ),
                observaciones=serializer.validated_data.get(
                    'observaciones',
                    ''
                ),
            )

        return Response(
            {
                'detail': 'Nota crédito registrada correctamente',
                'nota_credito': self.get_serializer(nota).data,
                'saldo_pendiente': factura.saldo_pendiente,
                'estado_factura': factura.estado,
            },
            status=status.HTTP_201_CREATED
        )
