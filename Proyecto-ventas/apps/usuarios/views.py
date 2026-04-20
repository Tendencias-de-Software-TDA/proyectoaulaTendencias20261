from rest_framework import viewsets
from .models import Usuario
from .serializer import UsuarioSerializer
from .permissions import EsAdministrador
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
 
 
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, EsAdministrador]