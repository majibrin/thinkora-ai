// src/components/Loader.jsx
import React from 'react';
import loader from '../assets/loader.png';
import './Loader.css';

const Loader = ({ size = 32 }) => {
  return (
    <div className="loader-container">
      <img src={loader} alt="Loading..." style={{ width: size, height: size }} />
    </div>
  );
};

export default Loader;
