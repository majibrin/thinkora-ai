# backend/accounts/urls.py (FINAL URL FIX)

from django.urls import path
from accounts.views import UserRegistrationView, ProtectedTestView 

urlpatterns = [
    # 1. Registration Route
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    
    # 2. Protected Test Route 
    # CRITICAL FIX: Ensure this path segment (auth/test/) is correct.
    path('auth/test/', ProtectedTestView.as_view(), name='test_authentication'), 
]
