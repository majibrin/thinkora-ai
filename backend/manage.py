#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# IMPORTANT: Load settings patch BEFORE Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    import settings_patch
except ImportError:
    pass

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
