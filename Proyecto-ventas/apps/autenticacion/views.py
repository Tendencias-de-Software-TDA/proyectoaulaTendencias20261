from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from drf_yasg.utils import swagger_auto_schema


class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['rol'] = user.rol
        return token


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

    @swagger_auto_schema(
        operation_description="Endpoint para autenticación de usuarios con JWT"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)