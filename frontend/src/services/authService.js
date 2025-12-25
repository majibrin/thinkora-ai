// src/services/authService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const authService = {
    // =========================
    // LOGIN
    // =========================
    login: async ({ username, password }) => {
        const response = await api.post('/token/', {
            username,
            password,
        });

        const { access, refresh } = response.data;

        // Store tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Minimal user object (JWT-based auth)
        const user = { username };
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    },

    // =========================
    // REGISTER
    // =========================
    register: async ({ username, email, password }) => {
        const response = await api.post('/register/', {
            username,
            email,
            password,
        });

        return response.data;
    },

    // =========================
    // LOGOUT
    // =========================
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    // =========================
    // GET CURRENT USER
    // =========================
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // =========================
    // AUTH CHECK
    // =========================
    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    // =========================
    // TOKEN REFRESH (for later use)
    // =========================
    refreshToken: async () => {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');

        const response = await api.post('/token/refresh/', {
            refresh,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        return access;
    },
};

export default authService;
