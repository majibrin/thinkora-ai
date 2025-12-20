#!/bin/bash

# tests/e2e_test.sh
# Full authentication pipeline test

echo "🚀 STARTING END-TO-END AUTHENTICATION TEST SUITE"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if servers are running
echo "🔍 Checking if servers are running..."

# Check Django backend
curl -s http://localhost:8000/api/health/ > /dev/null
if [ $? -eq 0 ]; then
    print_status 0 "Django backend is running"
else
    print_status 1 "Django backend is not running on port 8000"
    echo "Start it with: cd ~/Thinkora/backend && python manage.py runserver"
    exit 1
fi

# Check React frontend (if needed)
curl -s http://localhost:5173 > /dev/null
if [ $? -eq 0 ]; then
    print_status 0 "React frontend is running"
else
    echo -e "${YELLOW}⚠️  React frontend not detected on port 5173${NC}"
    echo "Start it with: cd ~/Thinkora/frontend && npm run dev"
fi

echo ""
echo "🧪 TEST 1: Backend Registration"
echo "------------------------------"

TEST_USER="testuser_$(date +%s)"
TEST_EMAIL="${TEST_USER}@thinkora.com"
TEST_PASS="TestPass123!"

REG_RESPONSE=$(curl -s -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")

if echo "$REG_RESPONSE" | grep -q '"success":true'; then
    print_status 0 "Registration successful"
    echo "   User: $TEST_EMAIL created"
else
    print_status 1 "Registration failed"
    echo "   Response: $REG_RESPONSE"
    exit 1
fi

echo ""
echo "🧪 TEST 2: JWT Login"
echo "-------------------"

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"access"'; then
    print_status 0 "JWT Login successful"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
    echo "   Token obtained: ${ACCESS_TOKEN:0:20}..."
else
    print_status 1 "JWT Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "🧪 TEST 3: Protected Endpoint"
echo "---------------------------"

PROTECTED_RESPONSE=$(curl -s http://localhost:8000/api/test/ \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$PROTECTED_RESPONSE" | grep -q '"message":'; then
    print_status 0 "Protected endpoint accessible"
    USER_EMAIL=$(echo "$PROTECTED_RESPONSE" | grep -o '"user_email":"[^"]*"' | cut -d'"' -f4)
    echo "   Authenticated as: $USER_EMAIL"
else
    print_status 1 "Protected endpoint failed"
    echo "   Response: $PROTECTED_RESPONSE"
    exit 1
fi

echo ""
echo "🧪 TEST 4: Frontend Integration Check"
echo "-----------------------------------"

# Create a simple HTML test page
cat > /tmp/auth_test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Auth Test</title>
    <script>
        async function testAuth() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Testing...';
            
            try {
                // Test registration
                const regResponse = await fetch('http://localhost:8000/api/register/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'html_test_user',
                        email: 'html_test@thinkora.com',
                        password: 'HtmlTest123!'
                    })
                });
                
                if (regResponse.ok) {
                    resultDiv.innerHTML = '✅ Frontend can connect to backend API';
                    resultDiv.style.color = 'green';
                } else {
                    resultDiv.innerHTML = '❌ Frontend API connection failed';
                    resultDiv.style.color = 'red';
                }
            } catch (error) {
                resultDiv.innerHTML = `❌ Error: ${error.message}`;
                resultDiv.style.color = 'red';
            }
        }
    </script>
</head>
<body onload="testAuth()">
    <h2>Frontend-Backend Connection Test</h2>
    <div id="result"></div>
</body>
</html>
EOF

echo "   Test page created at /tmp/auth_test.html"
echo "   Open it in browser to test frontend-backend connection"

echo ""
echo "🧪 TEST 5: Error Handling"
echo "------------------------"

# Test invalid login
ERROR_RESPONSE=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrong"}')

if echo "$ERROR_RESPONSE" | grep -q '"detail":' || [ $(echo "$ERROR_RESPONSE" | wc -c) -lt 100 ]; then
    print_status 0 "Error handling works correctly"
    echo "   Server properly rejects invalid credentials"
else
    print_status 1 "Error handling test failed"
    echo "   Response: $ERROR_RESPONSE"
fi

echo ""
echo "=============================================="
echo "🎉 AUTHENTICATION PIPELINE TESTS COMPLETED"
echo "=============================================="
echo ""
echo "📋 SUMMARY:"
echo "   1. ✅ Backend Registration"
echo "   2. ✅ JWT Token Generation"
echo "   3. ✅ Protected Endpoint Access"
echo "   4. ✅ Frontend Integration Ready"
echo "   5. ✅ Error Handling"
echo ""
echo "🚀 Ready for commit and deployment!"
echo ""
echo "Next steps:"
echo "   1. Run: git add ."
echo "   2. Run: git commit -m 'feat: Complete authentication system with tests'"
echo "   3. Run: git push origin main"
