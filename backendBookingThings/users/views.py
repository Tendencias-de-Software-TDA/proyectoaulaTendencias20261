from rest_framework import generics
from .serializers import RegisterSerializer, CustomTokenSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# 👉 Registro
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

# 👉 Login (JWT)
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer