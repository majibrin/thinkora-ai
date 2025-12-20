// frontend/src/components/Dashboard.jsx (WITH CHAT HISTORY)
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import GpaCalculator from './GpaCalculator.jsx';

function Dashboard() {
  const { user, logout } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load chat history from backend
  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      } : { 'Content-Type': 'application/json' };
      
      const response = await fetch('http://localhost:8000/api/chat/history/', {
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.history) {
          // Convert to frontend format
          const formattedMessages = data.history.map(msg => ({
            sender: msg.sender === 'user' ? 'user' : 'ai',
            text: msg.text,
            time: msg.time
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.log('No chat history or error:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => { 
    if (!isLoadingHistory) {
      scrollToBottom(); 
    }
  }, [messages, isLoadingHistory]);

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setInput('');
    setLoading(true);
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Token ${token}` })
      };
      
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          message: userMessage,
          context: 'student'  // Default to student mode
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Error: ' + (data.error || 'Unknown error') }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Error: Backend not running? Make sure Django server is running on port 8000.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    // Optional: Add backend endpoint to delete chat history
  };

  if (!user) return <div>Loading user data...</div>;

  return (
    <div style={{ 
      padding: isMobile ? '10px' : '20px',
      maxWidth: '100%',
      margin: 'auto'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        borderBottom: '1px solid #ccc',
        paddingBottom: '15px',
        marginBottom: '20px',
        gap: isMobile ? '10px' : '0'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? '1.3rem' : '1.5rem' }}>
            🤖 Thinkora MVP - {user.username}
          </h2>
          <p style={{ margin: '5px 0', color: '#666', fontSize: isMobile ? '0.9rem' : '1rem' }}>
            Email: {user.email} | Messages: {messages.length}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={clearChat}
            style={{
              background: '#6c757d',
              color: 'white',
              padding: '6px 12px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            Clear Chat
          </button>
          <button 
            onClick={logout}
            style={{ 
              background: '#dc3545', 
              color: 'white', 
              padding: '8px 15px', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '20px',
        minHeight: isMobile ? 'auto' : '70vh'
      }}>
        
        {/* CHAT SECTION */}
        <div style={{ 
          flex: isMobile ? 'none' : 3,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: isMobile ? '20px' : '0'
        }}>
          <div style={{ 
            background: '#007bff', 
            color: 'white', 
            padding: isMobile ? '10px' : '15px',
            fontWeight: 'bold',
            fontSize: isMobile ? '0.9rem' : '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>💬 Thinkora AI Assistant</span>
            <button
              onClick={loadChatHistory}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Reload
            </button>
          </div>
          
          {/* Chat Messages */}
          <div style={{ 
            flex: 1,
            padding: isMobile ? '10px' : '15px',
            overflowY: 'auto',
            background: '#f8f9fa',
            minHeight: isMobile ? '250px' : '300px',
            maxHeight: isMobile ? '300px' : 'none'
          }}>
            {isLoadingHistory ? (
              <div style={{ textAlign: 'center', color: '#666', paddingTop: '20px' }}>
                <p>Loading chat history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', paddingTop: '20px' }}>
                <p>💭 No chat history yet</p>
                <p>Start by sending a message below!</p>
                <div style={{ marginTop: '20px', textAlign: 'left', padding: '10px', background: '#e7f3ff', borderRadius: '5px' }}>
                  <p><strong>Try these:</strong></p>
                  <p>"How to calculate GPA?"</p>
                  <p>"Help with studying mathematics"</p>
                  <p>"Business plan template"</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '10px',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? '#007bff' : '#e9ecef',
                    color: msg.sender === 'user' ? 'white' : 'black',
                    wordBreak: 'break-word',
                    fontSize: isMobile ? '0.9rem' : '1rem'
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: '#666',
                    marginTop: '3px'
                  }}>
                    {msg.sender === 'user' ? 'You' : 'Thinkora'} • {msg.time ? new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'now'}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
            {loading && (
              <div style={{ textAlign: 'left', color: '#666', fontStyle: 'italic' }}>
                Thinking...
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div style={{ 
            borderTop: '1px solid #ccc', 
            padding: isMobile ? '10px' : '15px',
            background: 'white'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: isMobile ? '8px' : '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: isMobile ? '14px' : '16px'
                }}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  padding: isMobile ? '8px 15px' : '10px 20px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '14px' : '16px',
                  opacity: (loading || !input.trim()) ? 0.6 : 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {isMobile ? 'Send' : 'Send'}
              </button>
            </div>
            {/* Quick buttons */}
            <div style={{ 
              marginTop: '10px', 
              fontSize: '0.8rem',
              display: 'flex',
              gap: '8px',
              overflowX: isMobile ? 'auto' : 'visible',
              paddingBottom: isMobile ? '5px' : '0'
            }}>
              <button
                onClick={() => {
                  setInput("How to calculate my GPA?");
                  setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
                }}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                GPA Help
              </button>
              <button
                onClick={() => {
                  setInput("I need study assistance with mathematics");
                  setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
                }}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                Study Help
              </button>
              <button
                onClick={() => {
                  setInput("Business planning advice for SMEs");
                  setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
                }}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                Business Help
              </button>
            </div>
          </div>
        </div>

        {/* TOOLS SECTION */}
        <div style={{ 
          flex: isMobile ? 'none' : 2,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          
          {/* Tools Card */}
          <div style={{ 
            border: '1px solid #ccc', 
            borderRadius: '8px',
            padding: isMobile ? '15px' : '20px'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              marginBottom: '15px'
            }}>
              🛠️ Tools & Features
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '10px' : '20px',
              marginTop: '10px'
            }}>
              <button
                style={{ 
                  padding: isMobile ? '12px' : '10px 15px', 
                  background: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  fontSize: isMobile ? '14px' : '16px',
                  flex: 1
                }}
                onClick={() => setIsCalculating(true)}
              >
                {isMobile ? '📊 GPA Calculator' : 'Start GPA Calculator'}
              </button>
              <button
                style={{ 
                  padding: isMobile ? '12px' : '10px 15px', 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  fontSize: isMobile ? '14px' : '16px',
                  flex: 1
                }}
                onClick={() => {
                  setInput("I need AI prediction for my exam results");
                  setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
                }}
              >
                {isMobile ? '🤖 AI Predictor' : 'AI Predictor'}
              </button>
            </div>

            {/* GPA Calculator */}
            {isCalculating && (
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                padding: isMobile ? '10px' : '15px',
                marginTop: '15px',
                overflowX: 'auto'
              }}>
                <GpaCalculator onHide={() => setIsCalculating(false)} />
              </div>
            )}
          </div>

          {/* Status Card */}
          <div style={{ 
            border: '1px solid #ccc', 
            borderRadius: '8px',
            padding: isMobile ? '12px' : '15px',
            background: '#f8f9fa',
            fontSize: isMobile ? '0.85rem' : '0.9rem'
          }}>
            <h4 style={{ 
              marginTop: 0, 
              marginBottom: '10px',
              fontSize: isMobile ? '1rem' : '1.1rem'
            }}>
              🚀 System Status
            </h4>
            <p><strong>Backend:</strong> {window.navigator.onLine ? '🟢 Online' : '🔴 Offline'}</p>
            <p><strong>Messages:</strong> {messages.length} stored</p>
            <p><strong>User:</strong> {user.username}</p>
            <p><strong>Mode:</strong> Student Assistant</p>
            
            <div style={{ 
              marginTop: '10px', 
              padding: '8px', 
              background: '#e7f3ff', 
              borderRadius: '5px',
              fontSize: '0.8rem'
            }}>
              <strong>Note:</strong> Messages now save to database!
            </div>
            
            <div style={{ 
              marginTop: '10px', 
              padding: '8px', 
              background: '#fff3cd', 
              borderRadius: '5px',
              fontSize: '0.8rem'
            }}>
              <strong>Next:</strong> Real AI integration
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        color: '#666', 
        fontSize: isMobile ? '0.8rem' : '0.9rem',
        borderTop: '1px solid #ccc',
        paddingTop: '15px'
      }}>
        Thinkora MVP | Database: SQLite | Backend: localhost:8000 | Chat History: {messages.length} messages
      </div>
    </div>
  );
}

export default Dashboard;
