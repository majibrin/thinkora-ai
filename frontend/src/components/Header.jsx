import React from 'react';
import './Header.css';

const Header = ({ user, onLogout, reloadChat }) => {
  return (
    <header className="header-container">
      <div className="header-left">
        <h1>🤖 Thinkora AI</h1>
        <span className="user-info">{user.username} • Messages: {user.messagesCount}</span>
      </div>
      <div className="header-actions">
        <button onClick={reloadChat}>↻ Reload</button>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
