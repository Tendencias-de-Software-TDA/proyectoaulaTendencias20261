from django.core.exceptions import ValidationError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Factura
from .serializer import (
    FacturaSerializer,
    ConvertirFacturaSerializer,
    AnularFacturaSerializer
)
from apps.cotizacion.models import Cotizacion
from apps.usuarios.permissions import EsContadorOAdmin


def _django_validation_detail(exc: ValidationError) -> str:
    if getattr(exc, "message", None) is not None:
        return str(exc.message)
    msgs = getattr(exc, "messages", None)
    if msgs:
        return " ".join(str(m) for m in msgs)
    return str(exc)


class FacturaViewSet(viewsets.ModelViewSet):

    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated, EsContadorOAdmin]
    )
    def convertir(self, request):

        serializer = ConvertirFacturaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cotizacion = Cotizacion.objects.filter(
            id=serializer.validated_data['cotizacion_id']
        ).first()

        if not cotizacion:
            return Response(
                {"detail": "La cotización no existe"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            factura = Factura.crear_desde_cotizacion(cotizacion)

        except ValidationError as exc:
            return Response(
                {"detail": _django_validation_detail(exc)},
                status=status.HTTP_400_BAD_REQUEST
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

        serializer = AnularFacturaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            factura.anular(
                serializer.validated_data['motivo']
            )

        except ValidationError as exc:
            return Response(
                {"detail": _django_validation_detail(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"detail": "Factura anulada correctamente"},
            status=status.HTTP_200_OK
        )