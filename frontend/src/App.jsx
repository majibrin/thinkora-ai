// frontend/src/App.jsx (CONSOLIDATED & CORRECTED VERSION)

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AuthForm from './components/AuthForm.jsx';
import Dashboard from './components/Dashboard.jsx';

// The main App component containing the Router and all application logic.
// This component must be rendered *inside* AuthProvider (done in main.jsx).
function App() {
  // 🛑 FIX: useAuth is now called directly inside the main App component,
  // which is correctly placed within the <AuthProvider> in main.jsx.
  const { user, isAuthenticated, logout } = useAuth(); 

  // Optional: If you need to access 'logout', you should expose it through the useAuth hook,
  // but it's not strictly necessary for routing here.

  return (
    <Router>
      <div className="App" style={{ textAlign: 'center', padding: '20px' }}>
        <header>
          <h1>Thinkora</h1>
        </header>

        <Routes>
          <Route
            path="/"
            // Renders Dashboard if authenticated, otherwise redirects to /login
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            // Redirects to Dashboard if already logged in
            element={isAuthenticated ? <Navigate to="/" /> : <AuthForm />}
          />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
