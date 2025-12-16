// frontend/src/components/AuthForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🛑 NEW: Import useNavigate
import { useAuth } from '../context/AuthContext.jsx';
// NOTE: Assuming this path is correct for your custom registration service
import { registerUser } from '../services/authService.js';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🛑 NEW: Initialize the navigate hook
  const navigate = useNavigate(); 
  
  // Destructure the function from your context
  const { login, register } = useAuth(); // Assuming 'register' is also available in useAuth

  const handleSubmit = async (e) => {
    // 🛑 CRITICAL FIX: Stops the default page reload
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (isLogin) {
      // --- LOGIN LOGIC (Correctly using try...catch for thrown errors) ---
      try {
        // The context's login function takes (email, password) and throws on failure
        await login(email, password);

        // If the code reaches here, login was successful
        setMessage('Login successful! Redirecting...');
        
        // 🛑 NEW: Add the redirection command after a short delay
        setTimeout(() => {
            navigate('/'); // Redirect to the home page or dashboard
        }, 500); 

      } catch (error) {
        // This catches the error object thrown from AuthContext (e.g., "Login failed")
        console.error("Login Error:", error);
        // Ensure you are using the correct error property, which we found was `message` in a previous step
        setMessage(`Login Failed: ${error.message || 'Check credentials'}`);

      }
    } else {
      // --- REGISTRATION LOGIC ---
      try {
        // Option B: Keep using external service if necessary (current code structure)
        await registerUser({ email, username, password });

        setMessage('Registration successful! Please log in.');
        setIsLogin(true);

      } catch (error) {
        // Handle external registration service errors (e.g., Axios/fetch response objects)
        const errorData = error.response?.data || (error instanceof Error ? null : error);
        let errorMessage = 'Registration failed.';

        if (errorData) {
            errorMessage = Object.entries(errorData)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('; ');
        } else if (error.message) {
             errorMessage = error.message;
        }

        console.error("Registration Error:", error);
        setMessage(errorMessage);
      }
    }

    // GUARANTEE the loading state is turned OFF
    // Note: Delaying this slightly in the success case for better UX might be helpful, 
    // but keeping it here ensures the button is released quickly.
    setIsSubmitting(false);
  };

  const formTitle = isLogin ? 'Login' : 'Register';
  const submitButtonText = isSubmitting
    ? (isLogin ? 'Logging In...' : 'Registering...')
    : formTitle;

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{formTitle} to Thinkora</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {!isLogin && (
          <div style={{ marginBottom: '10px' }}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}
        <div style={{ marginBottom: '20px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 15px', width: '100%', background: isSubmitting ? '#ccc' : 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {submitButtonText}
        </button>

        {message && <p style={{ marginTop: '15px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
