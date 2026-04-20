"""
URL configuration for ventas project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.clientes.views import ClienteViewSet
from apps.productos.views import ProductoViewSet
from apps.usuarios.views import UsuarioViewSet
from apps.cotizacion.views import CotizacionViewSet
from apps.autenticacion.views import LoginView
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from apps.facturacion.views import FacturaViewSet
from apps.pagos.views import PagoViewSet

schema_view = get_schema_view(
   openapi.Info(
      title="ENDPOINT DOCS",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)


router = DefaultRouter()
router.register(r'cliente', viewset = ClienteViewSet, basename = 'cliente')
router.register(r'producto', viewset = ProductoViewSet, basename = 'producto')
router.register(r'cotizacion', viewset = CotizacionViewSet, basename = 'cotizacion')
router.register(r'factura', viewset=FacturaViewSet, basename='factura')
router.register(r'pago', viewset=PagoViewSet, basename='pago')
router.register(r'usuario', viewset = UsuarioViewSet, basename = 'usuario')


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"ok": True, "message": "API conectada correctamente"})


urlpatterns = [
    path('v1/health/', health_check, name='health-check'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('admin/', admin.site.urls),
    path('v1/login/', LoginView.as_view(), name='login'),
    path('v1/login/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('v1/', include(router.urls))

]
