// src/components/AuthForm.jsx - MODERN USER-FRIENDLY VERSION
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
        {/* Logo with improved accessibility */}
        <div className="logo-container">

          <div className="logo-subtitle">
            {isLogin ? 'Welcome to Thinkora' : 'Join Thinkora'}
          </div>
        </div>

        {/* Main heading */}
        <header className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to continue your learning journey' 
              : 'Start your educational adventure today'
            }
          </p>
        </header>

        {/* Error message with improved styling */}
        {error && (
          <div
            className="auth-error"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Form with improved structure and labels */}
        <form 
          onSubmit={handleSubmit} 
          noValidate 
          className="auth-form"
          aria-label={isLogin ? 'Login form' : 'Sign up form'}
        >
          {/* Email field with proper label */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
              <span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">✉️</span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                aria-required="true"
                aria-describedby="email-help"
                disabled={loading}
                className="form-input"
                autoComplete="email"
              />
            </div>
            <small id="email-help" className="input-help">
              We'll never share your email with anyone else.
            </small>
          </div>

          {/* Username field (only for signup) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
                <span className="required-asterisk" aria-hidden="true"> *</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">👤</span>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Choose a username (min. 3 characters)"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength="3"
                  aria-required="true"
                  aria-describedby="username-help"
                  disabled={loading}
                  className="form-input"
                  autoComplete="username"
                />
              </div>
              <small id="username-help" className="input-help">
                This will be your public display name.
              </small>
            </div>
          )}

          {/* Password field with visibility toggle */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
              <span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">🔒</span>
              <input
                id="password"
                type="password"
                name="password"
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={isLogin ? "1" : "8"}
                aria-required="true"
                aria-describedby="password-help"
                disabled={loading}
                className="form-input"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              {!isLogin && formData.password && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => {
                    // Password visibility toggle logic would go here
                    console.log('Toggle password visibility');
                  }}
                  aria-label="Show password"
                  disabled={loading}
                >
                  👁️
                </button>
              )}
            </div>
            <small id="password-help" className="input-help">
              {isLogin 
                ? 'Enter your account password.' 
                : 'Use 8+ characters with mix of letters, numbers & symbols.'
              }
            </small>
          </div>

          {/* Password requirements (only for signup) */}
          {renderPasswordRequirements()}

          {/* Forgot password link (only for login) */}
          {isLogin && (
            <div className="forgot-password">
              <a 
                href="/forgot-password" 
                className="forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Forgot password clicked');
                  // Add your forgot password logic here
                }}
              >
                Forgot your password?
              </a>
            </div>
          )}

          {/* Submit button with loading state */}
          <div className="submit-container">
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="submit-button"
              aria-live="polite"
            >
              {loading ? (
                <span className="button-content">
                  <span className="button-spinner" aria-hidden="true"></span>
                  <span className="button-text">
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </span>
                </span>
              ) : (
                <span className="button-content">
                  <span className="button-icon" aria-hidden="true">
                    {isLogin ? '→' : '📝'}
                  </span>
                  <span className="button-text">
                    {isLogin ? 'Login to Your Account' : 'Create Account'}
                  </span>
                </span>
              )}
            </button>
            
            {/* Loading state announcement for screen readers */}
            {loading && (
              <div className="visually-hidden" role="status" aria-live="polite">
                {isLogin ? 'Logging in, please wait...' : 'Creating account, please wait...'}
              </div>
            )}
          </div>

          {/* Terms and conditions (only for signup) */}
          {!isLogin && (
            <div className="terms-agreement">
              <p className="terms-text">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="terms-link">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="terms-link">Privacy Policy</a>.
              </p>
            </div>
          )}
        </form>

        {/* Divider for visual separation */}
        <div className="auth-divider" aria-hidden="true">
          <span className="divider-text">or</span>
        </div>

        {/* Toggle between login/signup */}
        <div className="auth-toggle">
          <div className="toggle-text" aria-hidden="true">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', username: '', password: '' });
              setPasswordStrength({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false
              });
            }}
            disabled={loading}
            aria-label={isLogin ? 'Switch to sign up form' : 'Switch to login form'}
            className="toggle-button"
          >
            <span className="toggle-icon" aria-hidden="true">
              {isLogin ? '📝' : '←'}
            </span>
            <span className="toggle-label">
              {isLogin ? 'Sign Up for Free' : 'Back to Login'}
            </span>
          </button>
        </div>

        {/* Social login options (optional) */}
        <div className="social-login">
          <p className="social-text">Or continue with</p>
          <div className="social-buttons">
            <button 
              type="button" 
              className="social-button google"
              disabled={loading}
              aria-label="Sign in with Google"
            >
              <span className="social-icon" aria-hidden="true">G</span>
              <span>Google</span>
            </button>
            <button 
              type="button" 
              className="social-button github"
              disabled={loading}
              aria-label="Sign in with GitHub"
            >
              <span className="social-icon" aria-hidden="true">🐙</span>
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
