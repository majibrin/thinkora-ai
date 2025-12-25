// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

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

  const API_URL = import.meta.env.VITE_API_URL;

  // Sync axios auth header
  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const res = await axios.post(`${API_URL}/token/`, { email, password });
    const { access, user } = res.data;
    localStorage.setItem('token', access);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(access);
    setUser(user);
    return user;
  };

  const register = async ({ username, email, password }) => {
    await axios.post(`${API_URL}/register/`, { username, email, password });
    // Auto-login after registration
    return await login({ email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = { user, token, login, register, logout, isAuthenticated: !!user };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <img src="/favicon.ico" alt="Loading..." style={{ width: 64, height: 64 }} />
        <span style={{ marginTop: 10 }}>Loading Thinkora...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
