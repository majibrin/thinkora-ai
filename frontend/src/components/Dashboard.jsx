// src/components/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import GpaCalculator from './GpaCalculator';
import Loader from './Loader';
import axios from 'axios';
import './Dashboard.css';
import './GpaCalculator.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);

  // Mobile detection and viewport fix
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Fix mobile viewport height (address bar issue)
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial
    handleResize();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Handle visual viewport changes (mobile keyboards)
    if (window.visualViewport) {
      const handleVisualResize = () => {
        setTimeout(handleResize, 100); // Small delay for iOS
      };
      window.visualViewport.addEventListener('resize', handleVisualResize);
      
      return () => {
        window.visualViewport.removeEventListener('resize', handleVisualResize);
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Prevent desktop overflow
  useEffect(() => {
    const preventOverflow = () => {
      if (window.innerWidth >= 769) {
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';
      } else {
        document.body.style.overflowX = 'auto';
        document.documentElement.style.overflowX = 'auto';
      }
    };
    
    preventOverflow();
    window.addEventListener('resize', preventOverflow);
    
    return () => {
      window.removeEventListener('resize', preventOverflow);
      document.body.style.overflowX = 'auto';
      document.documentElement.style.overflowX = 'auto';
    };
  }, []);

  // Load chat history
  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setError('');
      
      const res = await axios.get('/chat/history/');
      
      if (res.data.success && res.data.history) {
        setMessages(res.data.history.map(msg => ({
          sender: msg.sender === 'user' ? 'user' : 'ai',
          text: msg.text,
          time: msg.time || new Date().toISOString()
        })));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Could not load chat history. Backend may be offline.');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingHistory]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userMessage,
      time: new Date().toISOString()
    }]);
    setError('');

    try {
      const res = await axios.post('/chat/', {
        message: userMessage,
        context: 'student'
      });

      if (res.data.success) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: res.data.reply,
          time: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: res.data.error || 'Unknown error',
          time: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Send message error:', err);
      
      let msg = '⚠️ Could not connect to server.';
      if (err.response?.status === 401) {
        msg = 'Session expired. Please refresh the page and login again.';
      } else if (err.response) {
        msg = `Server error: ${err.response.status} - ${err.response.data?.error || ''}`;
      } else if (err.request) {
        msg = 'No response from server. Backend may be offline.';
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: msg,
        time: new Date().toISOString()
      }]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) setMessages([]);
  };

  const reloadChat = () => loadChatHistory();

  const quickActions = [
    { label: 'GPA Help', text: 'How to calculate my GPA with 5.00 scale?', emoji: '📊' },
    { label: 'Study Help', text: 'I need study assistance for exams', emoji: '📚' },
    { label: 'Business Help', text: 'Business planning advice for SMEs', emoji: '💼' },
    { label: 'Features', text: 'What features does Thinkora have?', emoji: '🤔' },
  ];

  if (!user) {
    return <Loader message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard-container">
      <Header logout={logout} />

      {/* Mobile Tabs */}
      {isMobile && (
        <div className="mobile-tabs">
          <button
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
            aria-label="Chat tab"
          >
            💬 Chat
          </button>
          <button
            className={activeTab === 'tools' ? 'active' : ''}
            onClick={() => setActiveTab('tools')}
            aria-label="Tools tab"
          >
            🛠️ Tools
          </button>
        </div>
      )}

      <div className="dashboard-main">
        {/* Error Alert */}
        {error && (
          <div className="dashboard-error">
            {error}
            <button 
              onClick={() => setError('')}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* Desktop Layout */}
        {!isMobile ? (
          <div className="dashboard-desktop">
            {/* Chat Section */}
            <div className="chat-section">
              <div className="chat-header">
                <div className="chat-header-title">
                  💬 AI Assistant
                  <span className="chat-user-info">Welcome, {user.username}</span>
                </div>
                <div className="chat-header-actions">
                  <button onClick={reloadChat} aria-label="Reload chat">
                    🔄 Reload
                  </button>
                  <button onClick={clearChat} aria-label="Clear chat">
                    🗑️ Clear
                  </button>
                </div>
              </div>
              
              <div className="chat-messages">
                {isLoadingHistory ? (
                  <div className="chat-loading">
                    <Loader message="Loading chat history..." variant="small" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-chat-state">
                    <h3>Welcome to Thinkora, {user.username}! 👋</h3>
                    <p>Start a conversation with the AI assistant or try a quick action:</p>
                    <div className="quick-actions">
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput(action.text);
                            document.querySelector('.chat-input input')?.focus();
                          }}
                          aria-label={`Quick action: ${action.label}`}
                        >
                          {action.emoji} {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.sender}`}>
                      <div className="bubble">{msg.text}</div>
                      <div className="bubble-info">
                        {msg.sender === 'user' ? 'You' : 'Thinkora AI'} • {
                          new Date(msg.time).toLocaleTimeString([], {
                            hour: '2-digit', 
                            minute: '2-digit'
                          })
                        }
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
                {loading && (
                  <div className="thinking-loader">
                    <Loader message="Thinking..." variant="inline" showProgress={false} />
                  </div>
                )}
              </div>
              
              <div className="chat-input">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                  aria-label="Chat input"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Tools Section */}
            <div className="tools-section">
              <div className="card">
                <h3>🛠️ Tools & Features</h3>
                <div className="tools-grid">
                  <button 
                    onClick={() => setIsCalculating(!isCalculating)}
                    aria-label="Open GPA Calculator"
                  >
                    📊 GPA Calculator
                  </button>
                  <button 
                    onClick={() => { 
                      setInput("What AI features do you have?");
                      document.querySelector('.chat-input input')?.focus();
                    }}
                    aria-label="Ask about AI features"
                  >
                    🤖 AI Features
                  </button>
                </div>
                {isCalculating && <GpaCalculator onHide={() => setIsCalculating(false)} />}
              </div>
              
              <div className="card">
                <h4>📊 System Status</h4>
                <div className="status-item">
                  <strong>Backend:</strong> {error ? '🔴 Offline' : '🟢 Online'}
                </div>
                <div className="status-item">
                  <strong>Messages:</strong> {messages.length}
                </div>
                <div className="status-item">
                  <strong>GPA Scale:</strong> 5.00
                </div>
                <div className="status-item">
                  <strong>User:</strong> {user.username}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mobile Layout */
          <>
            {activeTab === 'chat' && (
              <div className="chat-section active">
                <div className="chat-messages">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.sender}`}>
                      <div className="bubble">{msg.text}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                  {loading && (
                    <div className="thinking-loader">
                      <Loader message="Thinking..." variant="inline" showProgress={false} />
                    </div>
                  )}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type message..."
                    disabled={loading}
                    aria-label="Chat input"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                  >
                    {loading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'tools' && (
              <div className="tools-section active">
                <div className="card">
                  <h3>📊 GPA Calculator</h3>
                  <button 
                    onClick={() => setIsCalculating(!isCalculating)}
                    aria-label={isCalculating ? 'Close calculator' : 'Open calculator'}
                  >
                    {isCalculating ? 'Close' : 'Open Calculator'}
                  </button>
                  {isCalculating && <GpaCalculator onHide={() => setIsCalculating(false)} />}
                </div>
                
                <div className="card">
                  <h4>Quick Actions</h4>
                  <div className="quick-actions">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(action.text);
                          setActiveTab('chat');
                          setTimeout(() => {
                            document.querySelector('.chat-input input')?.focus();
                          }, 100);
                        }}
                        aria-label={`Quick action: ${action.label}`}
                      >
                        {action.emoji} {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
