from django.shortcuts import render
from rest_framework import viewsets
from .models import Producto
from .serializer import ProductoSerializer
from apps.usuarios.permissions import EsVendedorOAdmin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
 
 
class ProductoViewSet(viewsets.ModelViewSet):
 
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, EsVendedorOAdmin]