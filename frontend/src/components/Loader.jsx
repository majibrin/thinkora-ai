import React from 'react';
import './Loader.css';
import loader from '../assets/loader.png';

function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className="loader-circle">
        <img src={loader} alt="Logo" className="loader-logo" />
        <div className="loader-ring"></div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
}

export default Loader;
