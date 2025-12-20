# ~/Thinkora/tests/backend_tests.py - UPDATED VERSION
import os
import sys
import django
import requests
import json

# Setup Django
sys.path.append('/data/data/com.termux/files/home/Thinkora/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Now import Django modules
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

class SimpleAuthTests:
    """Simple tests that don't require full Django test setup"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000/api"
        self.test_results = []
    
    def run_tests(self):
        print("🚀 STARTING SIMPLE AUTHENTICATION TESTS")
        print("=" * 50)
        
        try:
            self.test_registration()
            self.test_login()
            self.test_protected_endpoint()
            self.test_duplicate_registration()
            self.test_invalid_login()
            
            self.print_results()
            return all(r['passed'] for r in self.test_results)
        except Exception as e:
            print(f"❌ Test suite failed: {e}")
            return False
    
    def test_registration(self):
        print("🧪 Testing User Registration...")
        
        test_user = {
            'username': f'testuser_{os.getpid()}_{os.times()[4]}',
            'email': f'test_{os.getpid()}_{os.times()[4]}@example.com',
            'password': 'TestPass123!'
        }
        
        try:
            response = requests.post(f'{self.base_url}/register/', json=test_user, timeout=10)
            data = response.json()
            
            if response.status_code == 201 and data.get('success'):
                print(f"✅ Registration test passed! User: {data['user']['email']}")
                self.test_results.append({'test': 'Registration', 'passed': True})
                return data
            else:
                raise Exception(f"Failed: {response.status_code} - {data}")
                
        except Exception as e:
            print(f"❌ Registration test failed: {e}")
            self.test_results.append({'test': 'Registration', 'passed': False})
            return None
    
    def test_login(self):
        print("🧪 Testing JWT Login...")
        
        # Create a test user first
        test_user = {
            'username': f'login_test_{os.getpid()}',
            'email': f'login_test_{os.getpid()}@example.com',
            'password': 'LoginTest123!'
        }
        
        try:
            # Register
            requests.post(f'{self.base_url}/register/', json=test_user, timeout=10)
            
            # Login
            response = requests.post(f'{self.base_url}/token/', json={
                'email': test_user['email'],
                'password': test_user['password']
            }, timeout=10)
            
            data = response.json()
            
            if response.status_code == 200 and 'access' in data:
                print(f"✅ JWT Login test passed! Token: {data['access'][:20]}...")
                self.test_results.append({'test': 'JWT Login', 'passed': True})
                return data['access']
            else:
                raise Exception(f"Failed: {response.status_code} - {data}")
                
        except Exception as e:
            print(f"❌ Login test failed: {e}")
            self.test_results.append({'test': 'JWT Login', 'passed': False})
            return None
    
    def test_protected_endpoint(self):
        print("🧪 Testing Protected Endpoint...")
        
        try:
            # Create user and get token
            test_user = {
                'username': f'protected_test_{os.getpid()}',
                'email': f'protected_{os.getpid()}@example.com',
                'password': 'Protected123!'
            }
            
            requests.post(f'{self.base_url}/register/', json=test_user, timeout=10)
            
            token_response = requests.post(f'{self.base_url}/token/', json={
                'email': test_user['email'],
                'password': test_user['password']
            }, timeout=10)
            
            token_data = token_response.json()
            access_token = token_data['access']
            
            # Access protected endpoint
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(f'{self.base_url}/test/', headers=headers, timeout=10)
            data = response.json()
            
            if response.status_code == 200 and 'user_email' in data:
                print(f"✅ Protected endpoint test passed! User: {data['user_email']}")
                self.test_results.append({'test': 'Protected Endpoint', 'passed': True})
            else:
                raise Exception(f"Failed: {response.status_code} - {data}")
                
        except Exception as e:
            print(f"❌ Protected endpoint test failed: {e}")
            self.test_results.append({'test': 'Protected Endpoint', 'passed': False})
    
    def test_duplicate_registration(self):
        print("🧪 Testing Duplicate Registration Prevention...")
        
        try:
            test_user = {
                'username': f'duplicate_test_{os.getpid()}',
                'email': f'duplicate_{os.getpid()}@example.com',
                'password': 'Duplicate123!'
            }
            
            # First registration
            requests.post(f'{self.base_url}/register/', json=test_user, timeout=10)
            
            # Try duplicate email
            duplicate_user = {
                'username': 'different_username',
                'email': test_user['email'],  # Same email
                'password': 'DifferentPass123!'
            }
            
            response = requests.post(f'{self.base_url}/register/', json=duplicate_user, timeout=10)
            data = response.json()
            
            if response.status_code == 400 and 'error' in data:
                print(f"✅ Duplicate prevention test passed: {data['error']}")
                self.test_results.append({'test': 'Duplicate Prevention', 'passed': True})
            else:
                raise Exception(f"Expected 400 but got {response.status_code}")
                
        except Exception as e:
            print(f"❌ Duplicate test failed: {e}")
            self.test_results.append({'test': 'Duplicate Prevention', 'passed': False})
    
    def test_invalid_login(self):
        print("🧪 Testing Invalid Login...")
        
        try:
            response = requests.post(f'{self.base_url}/token/', json={
                'email': 'nonexistent@example.com',
                'password': 'wrongpassword'
            }, timeout=10)
            
            if response.status_code in [401, 400]:
                print("✅ Invalid login test passed!")
                self.test_results.append({'test': 'Invalid Login', 'passed': True})
            else:
                raise Exception(f"Expected 401/400 but got {response.status_code}")
                
        except Exception as e:
            print(f"❌ Invalid login test failed: {e}")
            self.test_results.append({'test': 'Invalid Login', 'passed': False})
    
    def print_results(self):
        print("=" * 50)
        print("📊 TEST RESULTS:")
        print("=" * 50)
        
        passed = sum(1 for r in self.test_results if r['passed'])
        total = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            print(f"{status} - {result['test']}")
        
        print("=" * 50)
        print(f"🏆 {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("⚠️  Some tests failed")

if __name__ == "__main__":
    tests = SimpleAuthTests()
    success = tests.run_tests()
    sys.exit(0 if success else 1)
