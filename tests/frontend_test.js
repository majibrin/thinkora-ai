// ~/Thinkora/tests/frontend_test.js - API Integration Test
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000/api';

class FrontendAuthTest {
    constructor() {
        this.results = [];
    }

    async runTests() {
        console.log('🚀 Testing Frontend-Backend API Integration');
        console.log('='.repeat(50));

        try {
            await this.testRegistration();
            await this.testLogin();
            await this.testProtectedEndpoint();
            await this.testErrorHandling();
            
            this.printResults();
            return this.allPassed();
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            return false;
        }
    }

    async testRegistration() {
        console.log('🧪 Test 1: User Registration via API');
        
        const testUser = {
            username: `frontend_test_${Date.now()}`,
            email: `frontend_${Date.now()}@test.com`,
            password: 'FrontendTest123!'
        };

        try {
            const response = await fetch(`${API_BASE}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser)
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Registration successful');
                console.log(`   Created: ${data.user.email}`);
                this.results.push({ test: 'Registration', passed: true });
                return data;
            } else {
                throw new Error(`Registration failed: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.error('❌ Registration test failed:', error.message);
            this.results.push({ test: 'Registration', passed: false });
            return null;
        }
    }

    async testLogin() {
        console.log('\n🧪 Test 2: Login with Email (as USERNAME_FIELD)');
        
        // First, test with your existing user
        const credentials = {
            email: 'muhammadabdullahijibrinbir@gmail.com',
            password: '123456'
        };

        try {
            const response = await fetch(`${API_BASE}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            
            if (response.ok && data.access) {
                console.log('✅ Login successful');
                console.log(`   Token: ${data.access.substring(0, 20)}...`);
                this.results.push({ test: 'Email Login', passed: true });
                return data.access;
            } else {
                throw new Error(`Login failed: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.error('❌ Login test failed:', error.message);
            this.results.push({ test: 'Email Login', passed: false });
            return null;
        }
    }

    async testProtectedEndpoint() {
        console.log('\n🧪 Test 3: Access Protected Endpoint with Token');
        
        try {
            // Get token first
            const loginResponse = await fetch(`${API_BASE}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'muhammadabdullahijibrinbir@gmail.com',
                    password: '123456'
                })
            });

            const loginData = await loginResponse.json();
            
            if (!loginData.access) {
                throw new Error('No access token received');
            }

            // Access protected endpoint
            const protectedResponse = await fetch(`${API_BASE}/test/`, {
                headers: {
                    'Authorization': `Bearer ${loginData.access}`
                }
            });

            const protectedData = await protectedResponse.json();
            
            if (protectedResponse.ok && protectedData.user_email) {
                console.log('✅ Protected endpoint accessible');
                console.log(`   Authenticated as: ${protectedData.user_email}`);
                this.results.push({ test: 'Protected Endpoint', passed: true });
            } else {
                throw new Error(`Protected endpoint failed: ${JSON.stringify(protectedData)}`);
            }
        } catch (error) {
            console.error('❌ Protected endpoint test failed:', error.message);
            this.results.push({ test: 'Protected Endpoint', passed: false });
        }
    }

    async testErrorHandling() {
        console.log('\n🧪 Test 4: Error Handling (Invalid Credentials)');
        
        try {
            const response = await fetch(`${API_BASE}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'wrong@example.com',
                    password: 'wrongpassword'
                })
            });

            const data = await response.json();
            
            if (response.status === 401 || response.status === 400) {
                console.log('✅ Error handling works correctly');
                console.log(`   Server returned: ${response.status}`);
                this.results.push({ test: 'Error Handling', passed: true });
            } else {
                throw new Error(`Expected 401/400 but got ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error handling test failed:', error.message);
            this.results.push({ test: 'Error Handling', passed: false });
        }
    }

    allPassed() {
        return this.results.every(r => r.passed);
    }

    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 FRONTEND-BACKEND API TEST RESULTS');
        console.log('='.repeat(50));
        
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        this.results.forEach(result => {
            console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
        });
        
        console.log('='.repeat(50));
        console.log(`🏆 ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 FRONTEND-BACKEND INTEGRATION VERIFIED!');
        } else {
            console.log('⚠️  Some integration tests failed');
        }
    }
}

// Run tests
async function main() {
    const test = new FrontendAuthTest();
    const success = await test.runTests();
    process.exit(success ? 0 : 1);
}

// Install node-fetch if not available
if (typeof fetch === 'undefined') {
    console.log('⚠️  Installing node-fetch module...');
    const { execSync } = require('child_process');
    try {
        execSync('npm install node-fetch', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to install node-fetch. Install manually:');
        console.error('   npm install node-fetch@2');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});
