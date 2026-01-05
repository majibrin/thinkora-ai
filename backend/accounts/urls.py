from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, 
    CourseViewSet, 
    chat_message, 
    get_chat_history,
    calculate_gpa_endpoint,
    create_superuser,
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
    path('chat/', chat_message, name='chat_message'),
    path('chat/history/', get_chat_history, name='chat_history'),
    
    # Maintenance & Health
    path('health/', health_check, name='health_check'),
    # path('setup-admin-secret/', create_superuser, name='create_superuser'),
    
    # Viewsets
    path('', include(router.urls)),
]
