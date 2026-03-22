from django.contrib import admin
from django.urls import path, include

from django.db import router


# AUTH SCREENS
from django.urls import path
from users.views import RegisterView, LoginView

# DOCS
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


# JWT
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

# GENERAL VIEWS
from backendBookingThings.router.router import router


urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('admin/', admin.site.urls),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]
  
  