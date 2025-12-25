// src/services/authService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

const authService = {
  login: async ({ email, password }) => {
    const res = await api.post('/token/', { email, password });
    const { access, user } = res.data;

    // Save token & user
    localStorage.setItem('token', access);
    localStorage.setItem('user', JSON.stringify(user || { email, username: '' }));

    return user || { email, username: '' };
  },

  register: async ({ username, email, password }) => {
    await api.post('/register/', { username, email, password });
    // Auto-login after registration
    return await authService.login({ email, password });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  refreshToken: async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token stored');

    const res = await api.post('/token/refresh/', { refresh });
    const { access } = res.data;
    localStorage.setItem('token', access);
    return access;
  },
};

export default authService;
