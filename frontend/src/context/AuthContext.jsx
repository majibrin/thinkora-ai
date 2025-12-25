import React, { createContext, useContext, useEffect, useState } from 'react';

// =======================
// ENV CONFIG
// =======================
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

// =======================
// CUSTOM HOOK
// =======================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// =======================
// PROVIDER
// =======================
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('thinkora_token'));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('thinkora_user'))
  );
  const [loading, setLoading] = useState(true);

  // =======================
  // INITIAL AUTH CHECK
  // =======================
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('thinkora_token');

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/test/`, {
          headers: {
            Authorization: `Bearer ${savedToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        // Token is valid
        setToken(savedToken);

        // Minimal user info (until /me endpoint exists)
        const savedUser = localStorage.getItem('thinkora_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('thinkora_token');
        localStorage.removeItem('thinkora_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // =======================
  // LOGIN
  // =======================
  const login = async ({ username, password }) => {
    const response = await fetch(`${API_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Invalid username or password');
    }

    localStorage.setItem('thinkora_token', data.access);
    setToken(data.access);

    const userData = { username };
    localStorage.setItem('thinkora_user', JSON.stringify(userData));
    setUser(userData);

    return { success: true };
  };

  // =======================
  // REGISTER
  // =======================
  const register = async ({ username, password }) => {
    const response = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.username?.[0] ||
        data.password?.[0] ||
        'Registration failed'
      );
    }

    // Auto-login after successful registration
    return await login({ username, password });
  };

  // =======================
  // LOGOUT
  // =======================
  const logout = () => {
    localStorage.removeItem('thinkora_token');
    localStorage.removeItem('thinkora_user');
    setToken(null);
    setUser(null);
  };

  // =======================
  // CONTEXT VALUE
  // =======================
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
