// frontend/src/components/Dashboard.jsx (Modular Update)

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// 🛑 CRITICAL: Import the new modular component
import GpaCalculator from './GpaCalculator.jsx'; 

function Dashboard() {
  const { user, logout } = useAuth();
  
  // State to toggle the calculator view
  const [isCalculating, setIsCalculating] = useState(false); 

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // Define the style object for the email text
  const emailStyle = {
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%',
    display: 'inline-block' 
  };

  return (
    <div className="dashboard-container" style={{ textAlign: 'left', maxWidth: '800px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      
      <h2>🎓 Welcome, {user.username}!</h2>
      <p>
        <b>Email:</b> <span style={emailStyle}>{user.email}</span>
      </p>

      <hr style={{ margin: '20px 0' }} />

      <h3>Your AI Student Assistant</h3>
      <p>This is the starting point for calculating your Grade Point Average (GPA/CGPA).</p>

      {/* Conditional rendering based on isCalculating state */}
      {!isCalculating ? (
        <div className="feature-section" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <button
            style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            onClick={() => setIsCalculating(true)} // Toggles the state to show calculator
          >
            Start GPA
          </button>
          <button
            style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            onClick={() => alert("Launching AI Predictor...")}
          >
            AI Predictor
          </button>
        </div>
      ) : (
        // 🛑 Render the new modular component
        // Pass the function to hide the component as the 'onHide' prop
        <GpaCalculator onHide={() => setIsCalculating(false)} /> 
      )}

      <div style={{ marginTop: '30px' }}>
        <button onClick={logout} className="logout-button" style={{ background: '#dc3545', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

    </div>
  );
}

export default Dashboard;
