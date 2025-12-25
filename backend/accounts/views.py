# backend/accounts/views.py

from rest_framework import generics, permissions, serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import User, Course, ChatMessage
from .serializers import CourseSerializer
import uuid
import re

# -------------------------------
# SERIALIZERS
# -------------------------------
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

# -------------------------------
# REGISTRATION VIEW
# -------------------------------
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            errors = serializer.errors
            if 'username' in errors:
                if 'already exists' in str(errors['username']).lower():
                    return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
            if 'email' in errors:
                if 'already exists' in str(errors['email']).lower():
                    return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
            for field, field_errors in errors.items():
                if field_errors:
                    return Response({'error': f"{field}: {field_errors[0]}"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': 'Registration failed. Check your details.'}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        return Response({
            'success': True,
            'message': 'Registration successful!',
            'user': {
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)

# -------------------------------
# PROTECTED TEST VIEW
# -------------------------------
class ProtectedTestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response({
            'message': 'Protected route accessed!',
            'user_email': request.user.email,
            'username': request.user.username
        })

# -------------------------------
# COURSE VIEWSET
# -------------------------------
class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(user=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# -------------------------------
# GPA CALCULATION ENDPOINT
# -------------------------------
@api_view(['POST'])
def calculate_gpa_endpoint(request):
    try:
        grades = request.data.get('grades', [])
        credits = request.data.get('credits', [])

        if not grades or not credits or len(grades) != len(credits):
            return Response({'success': False, 'error': 'Send grades=["A","B"] and credits=[3,4]'}, status=400)

        grade_points = {'A':5.0,'B':4.0,'C':3.0,'D':2.0,'E':1.0,'F':0.0}

        total_points = 0
        total_credits = 0

        for grade, credit in zip(grades, credits):
            grade_upper = grade.upper().strip()
            if grade_upper in grade_points:
                total_points += grade_points[grade_upper]*float(credit)
                total_credits += float(credit)

        if total_credits == 0:
            return Response({'success': False, 'error': 'No valid grades provided'}, status=400)

        gpa = total_points / total_credits
        if gpa >= 4.50:
            classification = "First Class 🥇"
        elif gpa >= 3.50:
            classification = "Second Class Upper (2:1) 🥈"
        elif gpa >= 2.50:
            classification = "Second Class Lower (2:2) 🥉"
        elif gpa >= 1.50:
            classification = "Third Class 📖"
        elif gpa >= 1.00:
            classification = "Pass Degree 🎯"
        else:
            classification = "Fail ❌"

        return Response({'success': True, 'gpa': round(gpa,2),'total_credits':total_credits,'total_points':round(total_points,2),'scale':'5.00','classification':classification,'grades_count':len(grades)})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# -------------------------------
# CHAT ENDPOINT (PER USER / SESSION)
# -------------------------------
@api_view(['POST'])
def chat_message(request):
    try:
        user_message = request.data.get('message','').strip()
        context = request.data.get('context','student')
        session_id = request.data.get('session_id') or str(uuid.uuid4())

        if not user_message:
            return Response({'error':'Message empty'}, status=400)

        if request.user.is_authenticated:
            user = request.user
        else:
            # Use session_id as pseudo-user key for guests
            user, created = User.objects.get_or_create(
                username=f"guest_{session_id[:8]}",
                defaults={'email': f"{session_id}@thinkora.com"}
            )

        # Save user message
        user_msg = ChatMessage.objects.create(
            user=user,
            conversation_id=session_id,
            role='user',
            content=user_message,
            context=context
        )

        # GPA detection
        reply = f"I understand: '{user_message}'. How can I assist you today?"
        if 'gpa' in user_message.lower() or 'cgpa' in user_message.lower():
            pattern = r'([A-F])\s*=\s*(\d+)'
            matches = re.findall(pattern, user_message, re.IGNORECASE)
            if matches:
                grade_points = {'A':5.0,'B':4.0,'C':3.0,'D':2.0,'E':1.0,'F':0.0}
                total_points = total_credits = 0
                grade_list = []
                for grade, credit in matches:
                    grade_upper = grade.upper()
                    credit_float = float(credit)
                    if grade_upper in grade_points:
                        total_points += grade_points[grade_upper]*credit_float
                        total_credits += credit_float
                        grade_list.append(f"{grade_upper}={credit_float}")
                if total_credits > 0:
                    gpa = total_points/total_credits
                    if gpa>=4.50: classification="First Class 🥇"
                    elif gpa>=3.50: classification="Second Class Upper 🥈"
                    elif gpa>=2.50: classification="Second Class Lower 🥉"
                    elif gpa>=1.50: classification="Third Class"
                    elif gpa>=1.00: classification="Pass"
                    else: classification="Fail"
                    reply = f"📊 GPA CALCULATION (5.00 Scale):\nGrades: {', '.join(grade_list)}\nTotal Credits: {total_credits}\nGPA: {gpa:.2f}/5.00\nClassification: {classification}\nUse the GPA Calculator tool for more courses!"
                else:
                    reply = "I couldn't calculate. Use format: A=5, B=4, C=3, D=2, E=1, F=0"

        # Save AI response
        ai_msg = ChatMessage.objects.create(
            user=user,
            conversation_id=session_id,
            role='ai',
            content=reply,
            context=context
        )

        return Response({'success': True, 'reply': reply, 'session_id': session_id, 'message_id': ai_msg.id, 'timestamp': ai_msg.created_at.isoformat()})

    except Exception as e:
        return Response({'error': str(e)}, status=500)

# -------------------------------
# CHAT HISTORY PER USER / SESSION
# -------------------------------
@api_view(['GET'])
def get_chat_history(request):
    try:
        session_id = request.query_params.get('session_id')
        if request.user.is_authenticated:
            user = request.user
            conv_id = None  # use per-user conversation
        elif session_id:
            user = User.objects.filter(username__startswith=f"guest_{session_id[:8]}").first()
            conv_id = session_id
        else:
            return Response({'success': True, 'history':[]})

        if not user:
            return Response({'success': True, 'history':[]})

        messages = ChatMessage.objects.filter(user=user)
        if conv_id:
            messages = messages.filter(conversation_id=conv_id)
        messages = messages.order_by('created_at')[:50]

        history = [{'id':msg.id,'sender':msg.role,'text':msg.content,'time':msg.created_at.isoformat(),'context':msg.context} for msg in messages]

        return Response({'success': True, 'history': history})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# -------------------------------
# HEALTH CHECK
# -------------------------------
@api_view(['GET'])
def health_check(request):
    return Response({'status':'ok','service':'Thinkora Backend','version':'1.0','endpoints':['/chat/','/chat/history/','/calculate-gpa/']})

# -------------------------------
# CREATE SUPERUSER (CUSTOM)
# -------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def create_superuser(request):
    User = get_user_model()
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')

    if User.objects.filter(email=email).exists():
        return Response({'error':'User with this email already exists.'})

    user = User.objects.create_superuser(email=email, username=username, password=password)
    return Response({'success':True,'email':user.email})
