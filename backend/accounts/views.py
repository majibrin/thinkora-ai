# backend/accounts/views.py - COMPLETE FILE
from rest_framework import generics, permissions, serializers, viewsets, status  # ADD 'status' here
from rest_framework import generics, permissions, serializers, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from .models import User, Course, ChatMessage
from .serializers import CourseSerializer

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

# backend/accounts/views.py - FIXED REGISTRATION VIEW
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            # Return proper error messages, not "invalid credentials"
            errors = serializer.errors
            
            # Handle common errors with clear messages
            if 'username' in errors:
                if 'already exists' in str(errors['username']).lower():
                    return Response(
                        {'error': 'Username already taken'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if 'email' in errors:
                if 'already exists' in str(errors['email']).lower():
                    return Response(
                        {'error': 'Email already registered'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Return first error field's message
            for field, field_errors in errors.items():
                if field_errors:
                    return Response(
                        {'error': f"{field}: {field_errors[0]}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            return Response(
                {'error': 'Registration failed. Check your details.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If valid, create user
        user = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Registration successful!',
            'user': {
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)

class ProtectedTestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response({
            'message': 'Protected route accessed!',
            'user_email': request.user.email,
            'username': request.user.username
        })

# --- Course ViewSet ---
class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(user=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- GPA CALCULATION ENDPOINT (5.00 SCALE) ---
@api_view(['POST'])
def calculate_gpa_endpoint(request):
    """Calculate GPA - 5.00 Scale (A=5, B=4, C=3, D=2, E=1, F=0)"""
    try:
        grades = request.data.get('grades', [])
        credits = request.data.get('credits', [])
        
        if not grades or not credits or len(grades) != len(credits):
            return Response({
                'success': False,
                'error': 'Send grades=["A","B"] and credits=[3,4]'
            }, status=400)
        
        # NIGERIAN 5.00 SCALE (NO A+/A-)
        grade_points = {
            'A': 5.0, 'B': 4.0, 'C': 3.0, 
            'D': 2.0, 'E': 1.0, 'F': 0.0
        }
        
        total_points = 0
        total_credits = 0
        
        for grade, credit in zip(grades, credits):
            grade_upper = grade.upper().strip()
            if grade_upper in grade_points:
                total_points += grade_points[grade_upper] * float(credit)
                total_credits += float(credit)
        
        if total_credits == 0:
            return Response({
                'success': False,
                'error': 'No valid grades provided'
            }, status=400)
        
        gpa = total_points / total_credits
        
        # Nigerian Classification
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
        
        return Response({
            'success': True,
            'gpa': round(gpa, 2),
            'total_credits': total_credits,
            'total_points': round(total_points, 2),
            'scale': '5.00',
            'classification': classification,
            'grades_count': len(grades)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- CHAT ENDPOINT WITH GPA SUPPORT ---
@api_view(['POST'])
def chat_message(request):
    """AI Chat with GPA calculation support"""
    try:
        user_message = request.data.get('message', '').strip()
        context = request.data.get('context', 'student')
        
        if not user_message:
            return Response({'error': 'Message empty'}, status=400)
        
        # Get or create user
        if request.user.is_authenticated:
            user = request.user
        else:
            user, created = User.objects.get_or_create(
                username='demo_user',
                defaults={'email': 'demo@thinkora.com'}
            )
        
        # Save user message
        user_msg = ChatMessage.objects.create(
            user=user,
            conversation_id='main',
            role='user',
            content=user_message,
            context=context
        )
        
        # Check if user wants GPA calculation
        user_message_lower = user_message.lower()
        
        # GPA CALCULATION IN CHAT
        if 'gpa' in user_message_lower or 'cgpa' in user_message_lower:
            import re
            # Look for pattern: A=3, B=4, C=2
            pattern = r'([A-F])\s*=\s*(\d+)'
            matches = re.findall(pattern, user_message, re.IGNORECASE)
            
            if matches:
                # Calculate GPA
                grade_points = {'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0}
                total_points = 0
                total_credits = 0
                grade_list = []
                
                for grade, credit in matches:
                    grade_upper = grade.upper()
                    if grade_upper in grade_points:
                        credit_float = float(credit)
                        total_points += grade_points[grade_upper] * credit_float
                        total_credits += credit_float
                        grade_list.append(f"{grade_upper}={credit_float}")
                
                if total_credits > 0:
                    gpa = total_points / total_credits
                    
                    # Determine classification
                    if gpa >= 4.50:
                        classification = "First Class 🥇"
                    elif gpa >= 3.50:
                        classification = "Second Class Upper 🥈"
                    elif gpa >= 2.50:
                        classification = "Second Class Lower 🥉"
                    elif gpa >= 1.50:
                        classification = "Third Class"
                    elif gpa >= 1.00:
                        classification = "Pass"
                    else:
                        classification = "Fail"
                    
                    reply = f"""📊 GPA CALCULATION (5.00 Scale):
Grades: {', '.join(grade_list)}
Total Credits: {total_credits}
GPA: {gpa:.2f}/5.00
Classification: {classification}

Use the GPA Calculator tool for more courses!"""
                else:
                    reply = "I couldn't calculate. Use format: A=5, B=4, C=3, D=2, E=1, F=0"
            else:
                reply = """📚 GPA Calculator (5.00 Scale):
Grade Points: A=5, B=4, C=3, D=2, E=1, F=0

Send: "Calculate GPA: A=3, B=4, C=2"
Or use the GPA Calculator tool on the right →"""
        
        # STUDY MODE
        elif any(word in user_message_lower for word in ['study', 'learn', 'exam', 'test']):
            reply = "I can help with study topics! What subject? (Math, English, Science, etc.)"
        
        # BUSINESS MODE  
        elif any(word in user_message_lower for word in ['business', 'sme', 'startup', 'plan']):
            reply = "For business: I can help with planning, marketing, strategy, or finances."
        
        # GREETINGS
        elif any(word in user_message_lower for word in ['hello', 'hi', 'hey']):
            reply = f"Hello {user.username}! I'm Thinkora AI. How can I help?"
        
        # HELP
        elif 'help' in user_message_lower:
            reply = """I can help with:
1. GPA Calculation (5.00 scale)
2. Study Assistance
3. Business Planning
4. Exam Preparation

What do you need?"""
        
        # DEFAULT
        else:
            reply = f"I understand: '{user_message}'. How can I assist you today?"
        
        # Save AI response
        ai_msg = ChatMessage.objects.create(
            user=user,
            conversation_id='main',
            role='ai',
            content=reply,
            context=context
        )
        
        return Response({
            'success': True,
            'reply': reply,
            'message_id': ai_msg.id,
            'timestamp': ai_msg.created_at.isoformat()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- CHAT HISTORY ENDPOINT ---
@api_view(['GET'])
def get_chat_history(request):
    """Get user's chat history"""
    try:
        if request.user.is_authenticated:
            user = request.user
        else:
            user = User.objects.get(username='demo_user')
        
        # Get last 50 messages
        messages = ChatMessage.objects.filter(user=user).order_by('created_at')[:50]
        
        history = []
        for msg in messages:
            history.append({
                'id': msg.id,
                'sender': msg.role,
                'text': msg.content,
                'time': msg.created_at.isoformat(),
                'context': msg.context
            })
        
        return Response({
            'success': True,
            'history': history
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- HEALTH CHECK ---
@api_view(['GET'])
def health_check(request):
    """Server health check"""
    return Response({
        'status': 'ok',
        'service': 'Thinkora Backend',
        'version': '1.0',
        'endpoints': ['/chat/', '/chat/history/', '/calculate-gpa/']
    })
