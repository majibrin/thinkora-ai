# backend/backend/urls.py (Reverting and Confirming Paths)
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 1. JWT token generation/refresh: Must be at the base /api/
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 2. Accounts app base path (must be correct for the 404 fix)
    # The frontend was requesting /api/auth/test/. Let's ensure this works.
    # If the tokens above work, this path is the source of the 404 fix:
    path('api/', include('accounts.urls')), 
]
