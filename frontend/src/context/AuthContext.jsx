// ~/Thinkora/frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Initialize axios with token if exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.baseURL = API_URL;
    }
  }, [API_URL]);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        // Parse stored user
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        axios.defaults.baseURL = API_URL;
        
        // Optional: Verify token is still valid
        try {
          await axios.get(`${API_URL}/test/`, { timeout: 5000 });
        } catch (error) {
          console.log('Token may be expired, but keeping user logged in');
          // Don't log out - let the next API call fail naturally
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [API_URL]);

  const login = async ({ email, password }) => {
    try {
      console.log('🔐 Logging in...');
      
      // 1. Get JWT tokens
      const tokenRes = await axios.post(`${API_URL}/token/`, { 
        email, 
        password 
      });
      
      const { access, refresh } = tokenRes.data;
      
      if (!access) {
        throw new Error('No access token received from server');
      }
      
      // 2. Store tokens
      localStorage.setItem('token', access);
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }
      
      // 3. CRITICAL: Update axios defaults IMMEDIATELY
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      axios.defaults.baseURL = API_URL;
      setToken(access);
      
      // 4. Fetch user info from /api/test/ endpoint
      try {
        const userRes = await axios.get(`${API_URL}/test/`);
        
        const userData = {
          email: userRes.data.user_email || email,
          username: userRes.data.username || email.split('@')[0],
          ...userRes.data
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        console.log('✅ Login successful!');
        return userData;
        
      } catch (userError) {
        console.warn('⚠️ Could not fetch user details, using fallback');
        // Fallback user data
        const fallbackUser = {
          email,
          username: email.split('@')[0]
        };
        
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        
        return fallbackUser;
      }
      
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      
      // Clear any partial auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      // Throw readable error
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.error || 
                      error.message || 
                      'Login failed. Please try again.';
      throw new Error(errorMsg);
    }
  };

  const register = async ({ username, email, password }) => {
    try {
      console.log('📝 Registering user...');
      
      const registerRes = await axios.post(`${API_URL}/register/`, { 
        username, 
        email, 
        password 
      });
      
      if (registerRes.data.success === false) {
        throw new Error(registerRes.data.error || 'Registration failed');
      }
      
      // Auto-login after successful registration
      console.log('🔄 Auto-logging in after registration...');
      return await login({ email, password });
      
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      
      // Throw readable error
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.detail || 
                      error.message || 
                      'Registration failed. Please try again.';
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    loading
  };

  if (loading) {
    return <Loader message="Loading Thinkora..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
