// src/components/Loader.jsx
import React from 'react';
import './Loader.css';

const Loader = ({ 
  message = 'Loading...', 
  variant = 'default', // 'default', 'inline', 'small', 'overlay'
  className = '',
  showProgress = true
}) => {
  const containerClass = `loader-container ${variant === 'overlay' ? 'loader-overlay' : ''} ${className}`;
  
  // Use your actual logo image or a placeholder
  const logoImage = '../assets/loader.png'; // Update with your actual logo path
  
  return (
    <div 
      className={containerClass}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className={`loader-wrapper ${variant === 'small' ? 'loader-small' : ''} ${variant === 'inline' ? 'loader-inline' : ''}`}>
        {/* Glowing outer ring */}
        <div className="loader-glow-ring" aria-hidden="true"></div>
        
        {/* Spinning border */}
        <div className="loader-spinner" aria-hidden="true"></div>
        
        {/* Inner image container */}
        <div className="loader-image-container">
          <img 
            src={logoImage} 
            alt="Loading..." 
            className="loader-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 6v6l4 2'/%3E%3C/svg%3E";
            }}
          />
        </div>
      </div>
      
      {/* Loading text */}
      {message && (
        <div className={`loader-text ${variant === 'small' ? 'loader-small' : ''} ${variant === 'inline' ? 'loader-inline' : ''}`}>
          {message}
        </div>
      )}
      
      {/* Optional progress bar */}
      {showProgress && variant === 'default' && (
        <div className="loader-progress" aria-hidden="true"></div>
      )}
    </div>
  );
};

export default Loader;
