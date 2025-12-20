# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, 
    ProtectedTestView, 
    CourseViewSet,
    chat_message,
    get_chat_history,
    calculate_gpa_endpoint,  # ← MUST INCLUDE THIS
    health_check
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('test/', ProtectedTestView.as_view(), name='test_authentication'),
    path('chat/', chat_message, name='chat'),
    path('chat/history/', get_chat_history, name='chat_history'),
    path('calculate-gpa/', calculate_gpa_endpoint, name='calculate_gpa'),  # ← MUST HAVE THIS LINE
    path('health/', health_check, name='health_check'),
] + router.urls
