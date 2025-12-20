"""
WSGI config for backend project.
"""

import os
import sys
from django.core.wsgi import get_wsgi_application

# ADD THESE TWO LINES - crucial for Render deployment
# Add the project root directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
