# backend/accounts/serializers.py (FINAL COMPLETE VERSION)

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # Needed for login fix
from .models import User, Course # CRITICAL: Import both models

# --- 1. Custom Login Serializer (FIXES 400 BAD REQUEST on /api/token/) ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # This ensures that when the frontend sends the 'email' for login, 
    # it is correctly validated by the base Simple JWT class.
    def validate(self, attrs):
        # Move 'email' from request to 'username' field for base serializer validation
        attrs['username'] = attrs.get('email')
        return super().validate(attrs)

# --- 2. Course Data Serializer (For CGPA API) ---
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        # fields list includes all necessary data fields plus 'id'
        # 'user' is included but set to read-only, as the ViewSet handles setting it automatically.
        fields = ['id', 'user', 'course_name', 'credits', 'letter_grade', 'semester_year']
        read_only_fields = ['user']
