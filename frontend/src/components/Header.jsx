// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import Loader from './Loader';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  // Show loader if user data is not yet loaded
  if (!user) {
    return <Loader size={32} />;
  }

  return (
    <header className="dashboard-header">
      {/* Left: Logo + User Info */}
      <div className="logo-user">
        <img src={logo} alt="Thinkora Logo" className="header-logo" />
        <div className="user-info">
          Welcome, {user.username || user.email}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="header-actions">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
