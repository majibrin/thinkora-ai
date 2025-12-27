// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';
import logoImage from '../assets/loader.png';

const AuthForm = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check password strength on password change
    if (name === 'password' && !isLogin) {
      const strength = {
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
      };
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }
      navigate('/');
    } catch (err) {
      console.error('Auth error:', err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordRequirements = () => {
    if (isLogin) return null;

    return (
      <div className="password-requirements">
        <p>Password must contain:</p>
        <ul>
          <li className={passwordStrength.length ? 'valid' : ''}>
            At least 8 characters
          </li>
          <li className={passwordStrength.uppercase ? 'valid' : ''}>
            One uppercase letter
          </li>
          <li className={passwordStrength.lowercase ? 'valid' : ''}>
            One lowercase letter
          </li>
          <li className={passwordStrength.number ? 'valid' : ''}>
            One number
          </li>
          <li className={passwordStrength.special ? 'valid' : ''}>
            One special character
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="auth-container" role="main" aria-label="Authentication">
      <div className="auth-card">
        <img
          src={logoImage}
          alt="Thinkora Logo"
          className="auth-logo"
        />
        <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>

        {error && (
          <div
            className="auth-error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            aria-required="true"
            aria-label="Email address"
            disabled={loading}
          />

          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              aria-required="true"
              aria-label="Username"
              disabled={loading}
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={isLogin ? "1" : "8"}
            aria-required="true"
            aria-label="Password"
            disabled={loading}
          />

          {renderPasswordRequirements()}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="button-spinner"></span>
                <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
              </span>
            ) : (
              <span>{isLogin ? 'Login' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          <span aria-hidden="true">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', username: '', password: '' });
            }}
            disabled={loading}
            aria-label={isLogin ? 'Switch to sign up form' : 'Switch to login form'}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
