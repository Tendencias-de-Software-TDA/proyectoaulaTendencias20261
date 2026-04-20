from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class CustomTokenSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        # 👇 aquí puedes meter lógica como la que tenías
        if not self.user.is_active:
            raise serializers.ValidationError("Usuario inactivo")

        # 👇 agregar datos extra al response
        data['rol'] = self.user.rol
        data['username'] = self.user.username

        return data