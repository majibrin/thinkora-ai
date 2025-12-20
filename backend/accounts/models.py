# backend/accounts/models.py (FINAL VERSION - LOGIN FIX INCLUDED)

from django.db import models
from django.contrib.auth.models import AbstractUser

# --- Existing Custom User Model (FIXED) ---
class User(AbstractUser):
    # Overriding the default AbstractUser email field to ensure it is unique
    email = models.EmailField(unique=True)
    
    # 🛑 CRITICAL FIX 1: This tells Django to use 'email' for the login field
    USERNAME_FIELD = 'email'
    
    # 🛑 CRITICAL FIX 2: This lists the fields required when creating a superuser (must NOT contain 'email')
    REQUIRED_FIELDS = ['username'] 
    
    # NOTE: You can remove the 'pass' line when you add these fields.

    # --- NEW MODEL FOR GPA/AI DATA ---
class Course(models.Model):
    # Links the course to the user who entered it
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')

    # Core course data fields
    course_name = models.CharField(max_length=100)
    credits = models.DecimalField(max_digits=3, decimal_places=1) # e.g., 3.0, 4.5
    letter_grade = models.CharField(max_length=2) # e.g., 'A', 'B+', 'C'

    # Optional field for AI Training (e.g., Semester/Year)
    semester_year = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Course: {self.course_name} ({self.letter_grade})"

    class Meta:
        ordering = ['course_name']


class ChatMessage(models.Model):
    """Store chat messages in database"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    conversation_id = models.CharField(max_length=50, default='default')
    role = models.CharField(max_length=10, choices=[('user', 'User'), ('ai', 'AI')])
    content = models.TextField()
    context = models.CharField(max_length=20, default='general')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
