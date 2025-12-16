# backend/accounts/urls.py (FINAL STRUCTURE with DRF Router)

from django.urls import path, include
from rest_framework.routers import DefaultRouter 
from .views import UserRegistrationView, ProtectedTestView, CourseViewSet # 🛑 CRITICAL: Import the new ViewSet

# Create a router instance
router = DefaultRouter()
# Register the CourseViewSet: This creates paths like /api/courses/
router.register(r'courses', CourseViewSet, basename='course') 


urlpatterns = [
    # Static Paths (Used by AuthContext)
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('test/', ProtectedTestView.as_view(), name='test_authentication'), 
    
    # Dynamic Paths (For the CGPA Data)
    # Includes all router URLs (e.g., /api/courses/)
    path('', include(router.urls)),
]
