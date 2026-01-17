from rest_framework import generics, permissions, serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import User, Course
from .serializers import CourseSerializer, UserRegistrationSerializer

# SERIALIZERS & REGISTRATION (Keep as is)
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

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Registration failed.'}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        return Response({'success': True, 'user': {'username': user.username, 'email': user.email}}, status=status.HTTP_201_CREATED)

# COURSE VIEWSET (Keep as is)
class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(user=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# GPA CALCULATION ENDPOINT (Keep as is)
@api_view(['POST'])
def calculate_gpa_endpoint(request):
    try:
        grades = request.data.get('grades', [])
        credits = request.data.get('credits', [])
        if not grades or not credits or len(grades) != len(credits):
            return Response({'success': False, 'error': 'Invalid data'}, status=400)

        grade_points = {'A':5.0,'B':4.0,'C':3.0,'D':2.0,'E':1.0,'F':0.0}
        total_points = 0
        total_credits = 0

        for grade, credit in zip(grades, credits):
            grade_upper = grade.upper().strip()
            if grade_upper in grade_points:
                total_points += grade_points[grade_upper]*float(credit)
                total_credits += float(credit)

        if total_credits == 0:
            return Response({'success': False, 'error': 'No credits'}, status=400)

        gpa = total_points / total_credits
        return Response({'success': True, 'gpa': round(gpa,2), 'total_credits': total_credits})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# HEALTH CHECK (Keep as is)
@api_view(['GET'])
def health_check(request):
    return Response({'status':'ok'})
