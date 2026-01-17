// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import GpaCalculator from './GpaCalculator';
import Loader from './Loader';
import './Dashboard.css';
import './GpaCalculator.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Mobile detection and viewport fix
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return <Loader message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard-container">
      <Header logout={logout} />

      <main className="dashboard-main">
        <div className="calculator-wrapper">
          <header className="utility-header">
            <h1>📊 GPA & CGPA Calculator</h1>
            <p>Calculate your academic performance with the 5.00 scale.</p>
          </header>
          
          <div className="card">
            <GpaCalculator />
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>© {new Date().getFullYear()} Study Assistant - Built for Students</p>
      </footer>
    </div>
  );
};

export default Dashboard;
