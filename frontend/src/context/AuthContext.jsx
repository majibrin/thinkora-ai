import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('thinkora_token'));
  const [loading, setLoading] = useState(true);

  // REAL BACKEND API BASE
  const API_BASE = 'http://localhost:8000/api';

  // Initialize auth - check token validity
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('thinkora_token');
      const savedUser = localStorage.getItem('thinkora_user');
      
      if (savedToken && savedUser) {
        try {
          // Verify token by calling protected endpoint
          const response = await fetch(`${API_BASE}/test/`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          
          if (response.ok) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('thinkora_token');
            localStorage.removeItem('thinkora_user');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('thinkora_token');
          localStorage.removeItem('thinkora_user');
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // REAL LOGIN - Calls Django backend
  
 // REAL LOGIN - Calls Django backend
const login = async (credentials) => {
  try {
    // Try to get token from Django
    const response = await fetch(`${API_BASE}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // WITH THIS:
body: JSON.stringify({
  email: credentials.username.includes('@') ? credentials.username : `${credentials.username}@thinkora.com`,  // ✅ CORRECT
  password: credentials.password
}),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ FIX: JWT returns {refresh, access}
      const accessToken = data.access;
      localStorage.setItem('thinkora_token', accessToken);
      setToken(accessToken);

      // ✅ FIX: We need to fetch user profile separately
      // Try to get user info from protected endpoint
      const userResponse = await fetch(`${API_BASE}/test/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      let userData = {
        username: credentials.username,
        email: `${credentials.username}@thinkora.com`, // Placeholder
        id: Date.now() // Placeholder
      };

      if (userResponse.ok) {
        const userInfo = await userResponse.json();
        // Use actual user data from /test/ endpoint
        userData = {
          username: userInfo.username || credentials.username,
          email: userInfo.user_email || `${credentials.username}@thinkora.com`,
          id: userInfo.user_id || Date.now()
        };
      }

      localStorage.setItem('thinkora_user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } else {
      // ✅ FIX: Handle JWT error format correctly
      const errorMsg = data.detail || 
                       data.non_field_errors?.[0] || 
                       'Invalid username or password';
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

  
 const register = async (userData) => {
  try {
    console.log('📝 Registering with:', userData);  // Add this
    
    const response = await fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email || `${userData.username}@thinkora.com`,
        password: userData.password
      }),
    });

    console.log('📡 Registration response:', response.status);  // Add this
    const data = await response.json();
    console.log('📦 Registration data:', data);  // Add this

    // FIXED (CORRECT):
if (response.ok) {
  // After registration, auto-login with EMAIL
  const registeredEmail = userData.email || `${userData.username}@thinkora.com`;
  
  console.log('🔄 Auto-login with email:', registeredEmail);  // Debug log
  
  return await login({
    username: registeredEmail,  // ✅ Sends "muhammadabdullahijibrinbir@gmail.com"
    password: userData.password
  });


    } else {
      // Handle backend error format correctly
      const errorMsg = data.error || 
                       data.username?.[0] || 
                       data.email?.[0] || 
                       data.password?.[0] || 
                       'Registration failed';
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
      
  // DEMO LOGIN - Creates demo user in backend
  const demoLogin = async () => {
    try {
      // First try to register demo user
      const registerResponse = await fetch(`${API_BASE}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'demo_user',
          email: 'demo@thinkora.com',
          password: 'demo123'
        }),
      });

      if (!registerResponse.ok) {
        // If demo user exists, try to login
        const loginResponse = await fetch(`${API_BASE}/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'demo_user',
            password: 'demo123'
          }),
        });

        if (!loginResponse.ok) {
          throw new Error('Demo account setup failed');
        }
        
        const loginData = await loginResponse.json();
        localStorage.setItem('thinkora_token', loginData.access || loginData.token);
        setToken(loginData.access || loginData.token);
      }

      // Set demo user data
      const demoUser = {
        username: 'demo_user',
        email: 'demo@thinkora.com',
        isDemo: true
      };
      
      localStorage.setItem('thinkora_user', JSON.stringify(demoUser));
      setUser(demoUser);
      
      return { success: true, user: demoUser };
    } catch (error) {
      console.error('Demo login error:', error);
      
      // Ultimate fallback - local demo
      const demoUser = {
        username: 'demo_user',
        email: 'demo@thinkora.com',
        isDemo: true
      };
      
      localStorage.setItem('thinkora_user', JSON.stringify(demoUser));
      setUser(demoUser);
      
      return { success: true, user: demoUser };
    }
  };

  const logout = () => {
    localStorage.removeItem('thinkora_token');
    localStorage.removeItem('thinkora_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    demoLogin,
    logout,
    isAuthenticated: !!user && !!token
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading Thinkora...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
