// src/components/AuthForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';
import loader from '../assets/loader.png';

const API_URL = import.meta.env.VITE_API_URL;

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userObj;

      if (isLogin) {
        const res = await axios.post(`${API_URL}/token/`, {
          email: formData.email,
          password: formData.password
        });
        const user = res.data.user || { email: formData.email, username: '' };
        localStorage.setItem('user', JSON.stringify(user));
        onAuthSuccess(user, res.data.access);
      } else {
        await axios.post(`${API_URL}/register/`, {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        const loginRes = await axios.post(`${API_URL}/token/`, {
          email: formData.email,
          password: formData.password
        });
        userObj = loginRes.data.user || { email: formData.email, username: formData.username };
        localStorage.setItem('user', JSON.stringify(userObj));
        onAuthSuccess(userObj, loginRes.data.access);
      }

    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.detail || err.response?.data?.error || err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={loader} alt="Thinkora Logo" className="auth-logo" />
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          {!isLogin && <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />}
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="submit" disabled={loading}>
            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
