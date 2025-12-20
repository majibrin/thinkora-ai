// authService.js - SIMPLIFIED VERSION
const API_BASE = 'http://localhost:8000/api';

export const authService = {
    // Login with username/password
    login: async (credentials) => {
        try {
            // First, try to get a token (if using token auth)
            const tokenResponse = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            
            if (!tokenResponse.ok) {
                // Fallback: Try registration endpoint
                const registerResponse = await fetch(`${API_BASE}/register/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...credentials,
                        email: credentials.username + '@thinkora.com'
                    }),
                });
                
                const registerData = await registerResponse.json();
                
                if (registerResponse.ok) {
                    // For MVP: Just store username in localStorage
                    localStorage.setItem('user', JSON.stringify({
                        username: credentials.username,
                        email: credentials.username + '@thinkora.com'
                    }));
                    return { success: true, user: { username: credentials.username } };
                }
                
                return { error: 'Login failed' };
            }
            
            const data = await tokenResponse.json();
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user || { username: credentials.username }));
                return { success: true, user: data.user };
            }
            
            return { error: 'No token received' };
            
        } catch (error) {
            console.error('Login error:', error);
            
            // MVP FALLBACK: Create user object anyway
            localStorage.setItem('user', JSON.stringify({
                username: credentials.username,
                email: credentials.username + '@thinkora.com',
                isDemo: true
            }));
            
            return { 
                success: true, 
                user: { 
                    username: credentials.username,
                    email: credentials.username + '@thinkora.com',
                    isDemo: true
                } 
            };
        }
    },

    // Register new user
    register: async (userData) => {
        const response = await fetch(`${API_BASE}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('user');
    }
};

export default authService;
