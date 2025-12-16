# backend/accounts/views.py (FINAL VERSION WITH COURSE VIEWSET)

from rest_framework import generics, permissions, serializers, viewsets 
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Course # 🛑 CRITICAL: Import Course model
from .serializers import CourseSerializer # 🛑 CRITICAL: Import CourseSerializer

# --- Serializers ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

# --- Views ---

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)


class ProtectedTestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response({
            'message': 'Congratulations, you accessed a protected route!',
            'user_email': request.user.email,
            'username': request.user.username,
            'is_authenticated': request.user.is_authenticated
        })

# --- NEW VIEWSET FOR CGPA DATA ---
class CourseViewSet(viewsets.ModelViewSet):
    # Only authenticated users can access this endpoint
    permission_classes = [permissions.IsAuthenticated]
    
    # 1. Serializer for CRUD operations
    serializer_class = CourseSerializer
    
    # 2. Queryset Definition: Filters courses to only show the logged-in user's courses
    def get_queryset(self):
        return Course.objects.filter(user=self.request.user).order_by('-id')

    # 3. Save Method: Automatically sets the 'user' field when a course is created
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


