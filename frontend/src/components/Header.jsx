import React from 'react';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import loader from '../assets/loader.png'; // <-- import your logo

function Header({ user, onLogout }) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="dashboard-header">
      <div className="logo-user">
        <img
          src={loader}       // <-- use the imported logo
          alt="Logo"
          className="header-logo"
        />
        <span className="user-info">{user?.username || user?.email}</span>
      </div>

      {isAuthenticated && (
        <div className="header-actions">
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
