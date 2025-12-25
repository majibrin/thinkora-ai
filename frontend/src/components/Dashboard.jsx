// src/components/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import GpaCalculator from './GpaCalculator.jsx';
import Header from './Header.jsx';
import axios from 'axios';
import './Dashboard.css';

// React Icons
import { FaCommentDots, FaTools, FaRobot, FaUser } from 'react-icons/fa';

function Dashboard() {
  const { user, logout, token } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);

  // Set axios defaults
  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [token]);

  // Handle window resize for mobile tabs
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load chat history
  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setError('');
      const res = await axios.get('/chat/history/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data.success && res.data.history) {
        setMessages(
          res.data.history.map((msg) => ({
            sender: msg.sender === 'user' ? 'user' : 'ai',
            text: msg.text,
            time: msg.time,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setError('Could not load chat history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingHistory]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input;
    setInput('');
    setLoading(true);
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);

    try {
      const res = await axios.post(
        '/chat/',
        { message: userMessage, context: 'student' },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.data.error || 'Error' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: '⚠️ Connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user)
    return (
      <div className="dashboard-loading">
        <div>Loading...</div>
      </div>
    );

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={logout} />

      {isMobile && (
        <div className="mobile-tabs">
          <button
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            <FaCommentDots size={16} style={{ marginRight: 4 }} /> Chat
          </button>
          <button
            className={activeTab === 'tools' ? 'active' : ''}
            onClick={() => setActiveTab('tools')}
          >
            <FaTools size={16} style={{ marginRight: 4 }} /> Tools
          </button>
        </div>
      )}

      <div className="dashboard-main">
        {/* Chat Section */}
        {(!isMobile || activeTab === 'chat') && (
          <div className="chat-section">
            {!isMobile && (
              <div className="chat-header">
                <span>
                  <FaRobot style={{ marginRight: 6 }} /> Thinkora Assistant
                </span>
                <button
                  onClick={() => setMessages([])}
                  style={{ fontSize: '0.7rem' }}
                >
                  Clear
                </button>
              </div>
            )}

            <div className="chat-messages">
              {isLoadingHistory ? (
                <div className="chat-loading">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  Hello {user.username}, how can I help?
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.sender}`}>
                    <div className="bubble">
                      {msg.sender === 'user' ? (
                        <FaUser style={{ marginRight: 4 }} />
                      ) : (
                        <FaRobot style={{ marginRight: 4 }} />
                      )}
                      {msg.text}
                    </div>
                    <div className="bubble-info">
                      {msg.sender === 'user' ? 'You' : 'Thinkora AI'}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
              {loading && (
                <div className="chat-message ai">
                  <div className="bubble">Typing...</div>
                </div>
              )}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Tools Section */}
        {(!isMobile || activeTab === 'tools') && (
          <div className="tools-section">
            <div className="card">
              <h3>
                <FaTools style={{ marginRight: 4 }} /> Tools
              </h3>
              <button
                onClick={() => setIsCalculating(!isCalculating)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '10px' }}
              >
                {isCalculating ? 'Close GPA Calc' : 'Open GPA Calc'}
              </button>
              {isCalculating && <GpaCalculator onHide={() => setIsCalculating(false)} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
