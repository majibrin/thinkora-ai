from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView,
    CourseViewSet,
    calculate_gpa_endpoint, # Keep this!
    health_check
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    # Auth
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Tools & Logic
    path('calculate-gpa/', calculate_gpa_endpoint, name='calculate_gpa'),

    # Maintenance & Health
    path('health/', health_check, name='health_check'),

    # Viewsets
    path('', include(router.urls)),
]
