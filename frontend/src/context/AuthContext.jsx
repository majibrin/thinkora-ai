// frontend/src/context/AuthContext.jsx (FINAL, FULLY CORRECTED VERSION)

import { createContext, useContext, useState, useEffect } from 'react';

// Create the context instance
const AuthContext = createContext(null);

// Define the API base URL for your Django Backend
const API_BASE_URL = 'http://127.0.0.1:8000/api/';


/**
 * Provides authentication state and functions to its children components.
 */
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Clears all authentication data and logs the user out.
   */
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  /**
   * Fetches user details from a protected Django endpoint using the access token.
   */
  const fetchUser = async (token) => {
    try {
      // 🛑 FIXED: Uses the simple path /api/test/
      const response = await fetch(`${API_BASE_URL}test/`, { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ email: data.user_email, username: data.username });
      } else {
        console.error("Token validation failed in fetchUser. Status:", response.status);
        logout();
      }
    } catch (error) {
      console.error('Network or parsing error during user fetch:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Runs once on mount
  useEffect(() => {
    if (authToken) {
      fetchUser(authToken);
    } else {
      setLoading(false);
    }
  }, [authToken]); 

  // Handlers for login and registration
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setAuthToken(data.access);
        await fetchUser(data.access);
      } else {
        throw new Error(data.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, username, password) => {
    try {
      // 🛑 FIXED: Uses the simple path /api/register/
      const response = await fetch(`${API_BASE_URL}register/`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.email?.[0] || errorData.username?.[0] || errorData.password?.[0] || 'Registration failed';
        throw new Error(errorMessage);
      }
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Function for CGPA integration: Fetching user-specific courses
  const fetchUserCourses = async () => {
    if (!authToken) return [];

    try {
      const response = await fetch(`${API_BASE_URL}courses/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        return await response.json(); // Returns an array of course objects
      } else {
        if (response.status === 401) {
          logout(); 
          console.error("Token expired. Logging out.");
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  };

  const isAuthenticated = !!user && !!authToken;

  // Include the new fetchUserCourses function in the context value
  const contextValue = { user, isAuthenticated, loading, login, logout, register, fetchUserCourses };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* CRITICAL CONDITIONAL RENDERING */}
      {loading ? (
        <div style={{ padding: '50px', fontSize: '24px' }}>Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
