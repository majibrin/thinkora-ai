// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import logo from '../assets/logo.png'; // logo.png = logo WITH text
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Loader message="Checking authentication..." />;
  }

  return (
    <header className="dashboard-header">
      <div className="logo-user">
        GPA Calculator
        <div className="user-info">
          Welcome, {user.username || user.email}
        </div>
      </div>

      <div className="header-actions">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
