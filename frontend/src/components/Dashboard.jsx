// src/components/Dashboard.jsx - FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import GpaCalculator from './GpaCalculator';
import Loader from './Loader';
import axios from 'axios';
import './Dashboard.css';
import './GpaCalculator.css';

const Dashboard = () => {
  const { user, logout } = useAuth(); // Removed token - not needed
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add this to your Dashboard.jsx component
useEffect(() => {
  // Fix for mobile viewport height (address bar issue)
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Set on load and resize
  setVh();
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);

  // Handle visual viewport changes (mobile keyboards)
  if (window.visualViewport) {
    const handleResize = () => {
      setTimeout(setVh, 100); // Small delay for iOS
    };
    window.visualViewport.addEventListener('resize', handleResize);
    
    return () => {
      window.visualViewport.removeEventListener('resize', handleResize);
    };
  }

  return () => {
    window.removeEventListener('resize', setVh);
    window.removeEventListener('orientationchange', setVh);
  };
}, []);

  // Load chat history - FIXED: No manual headers
  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setError('');
      
      // AuthContext already set axios headers globally
      const res = await axios.get('/chat/history/');
      
      if (res.data.success && res.data.history) {
        setMessages(res.data.history.map(msg => ({
          sender: msg.sender === 'user' ? 'user' : 'ai',
          text: msg.text,
          time: msg.time
        })));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      
      // Check if it's an auth error
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
  }, [user]); // Only load when user exists

  // Auto-scroll
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isLoadingHistory]);

  // Send message - FIXED: No manual headers
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setError('');

    try {
      // AuthContext already set axios headers globally
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
          >
            💬 Chat
          </button>
          <button 
            className={activeTab === 'tools' ? 'active' : ''} 
            onClick={() => setActiveTab('tools')}
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
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Desktop Layout */}
        {!isMobile ? (
          <div className="dashboard-desktop">
            {/* Chat Section */}
            <div className="chat-section">
              <div className="chat-header">
                💬 AI Assistant
                <div className="chat-header-actions">
                  <button onClick={reloadChat}>🔄 Reload</button>
                  <button onClick={clearChat}>🗑️ Clear</button>
                </div>
              </div>
              
              <div className="chat-messages">
                {isLoadingHistory ? (
                  <Loader message="Loading chat history..." variant="small" />
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
                          }}
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
                        {msg.sender === 'user' ? 'You' : 'Thinkora AI'} • {new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
                {loading && <Loader message="Thinking..." variant="inline" showProgress={false} />}
              </div>
              
              <div className="chat-input">
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyPress={handleKeyPress} 
                  placeholder="Type your message..." 
                  disabled={loading}
                />
                <button 
                  onClick={sendMessage} 
                  disabled={loading || !input.trim()}
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
                  <button onClick={() => setIsCalculating(!isCalculating)}>
                    📊 GPA Calculator
                  </button>
                  <button onClick={() => { setInput("What AI features do you have?"); }}>
                    🤖 AI Features
                  </button>
                </div>
                {isCalculating && <GpaCalculator onHide={() => setIsCalculating(false)} />}
              </div>
              
              <div className="card">
                <h4>📊 System Status</h4>
                <div><strong>Backend:</strong> {error ? '🔴 Offline' : '🟢 Online'}</div>
                <div><strong>Messages:</strong> {messages.length}</div>
                <div><strong>GPA Scale:</strong> 5.00</div>
                <div><strong>User:</strong> {user.username}</div>
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
                  {loading && <Loader message="Thinking..." />}
                </div>
                <div className="chat-input">
                  <input 
                    type="text" 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyPress={handleKeyPress} 
                    placeholder="Type message..."
                    disabled={loading}
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={loading || !input.trim()}
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
                  <button onClick={() => setIsCalculating(!isCalculating)}>
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
                          setActiveTab('chat'); // Switch to chat tab
                        }}
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
