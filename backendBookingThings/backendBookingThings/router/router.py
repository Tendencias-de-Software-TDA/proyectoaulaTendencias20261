from rest_framework.routers import DefaultRouter
from resource import views

router = DefaultRouter()
router.register(r'resources', views.ResourceViewSet)
router.register(r'reservations', views.ReservationViewSet)