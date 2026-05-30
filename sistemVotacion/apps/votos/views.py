from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Voto
from .serializers import VotoSerializer
from apps.permissions import EsVotante

'''Por aca protegemos el endpoint de votos
 Solo votantes autenticados pueden votar'''

class VotoViewSet(viewsets.ModelViewSet):
    queryset = Voto.objects.all()
    serializer_class = VotoSerializer
    http_method_names = ['get', 'post']

    def get_permissions(self):
       
        return [EsVotante()]

    def get_queryset(self):
        return Voto.objects.filter(usuario=self.request.user)
