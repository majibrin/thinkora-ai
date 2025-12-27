// src/components/Loader.jsx - SIMPLIFIED VERSION
import React from 'react';
import './Loader.css';

const Loader = ({ 
  message = 'Loading...', 
  variant = 'default',
  className = '',
  showProgress = false
}) => {
  const containerClass = `loader-container ${variant === 'overlay' ? 'loader-overlay' : ''} ${className}`;
  
  return (
    <div className={containerClass} role="status" aria-label={message}>
      <div className={`loader-spinner ${variant}`}>
        {/* Simple spinner ring */}
        <div className="spinner-ring"></div>
        {/* Logo/Image in center */}
        <div className="spinner-center">
          <img 
            src="/assets/logo.png"  // Your logo
            alt="Loading"
            className="spinner-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = 'T';
            }}
          />
        </div>
      </div>
      
      {message && (
        <div className={`loader-text ${variant}`}>
          {message}
          <span className="loading-dots">...</span>
        </div>
      )}
      
      {showProgress && variant === 'default' && (
        <div className="loader-progress"></div>
      )}
    </div>
  );
};

export default Loader;
