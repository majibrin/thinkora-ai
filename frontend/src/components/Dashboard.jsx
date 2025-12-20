// frontend/src/components/Dashboard.jsx - COMPLETE WITH AXIOS
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import GpaCalculator from './GpaCalculator.jsx';
import axios from 'axios';

function Dashboard() {
  const { user, logout, token } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:8000';
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) document.body.style.overflowX = 'hidden';
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load chat history with axios
  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setError('');
      
      const response = await axios.get('/api/chat/history/', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.data.success && response.data.history) {
        const formattedMessages = response.data.history.map(msg => ({
          sender: msg.sender === 'user' ? 'user' : 'ai',
          text: msg.text,
          time: msg.time
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.log('No chat history:', err);
      setError('Could not load chat history. Backend may be offline.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => { 
    loadChatHistory(); 
  }, []);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => { 
    if (!isLoadingHistory) scrollToBottom(); 
  }, [messages, isLoadingHistory]);

  // Send message with axios
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);
    setError('');
    
    // Add user message immediately
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);

    try {
      const response = await axios.post('/api/chat/', {
        message: userMessage,
        context: 'student'
      }, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: `Error: ${response.data.error || 'Unknown error'}` 
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      
      let errorMessage = '⚠️ Could not connect to server. ';
      if (err.response) {
        // Server responded with error
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.error || 'Unknown'}`;
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Is backend running on port 8000?';
      } else {
        // Request setup error
        errorMessage = `Request error: ${err.message}`;
      }
      
      setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages from this chat?')) {
      setMessages([]);
      setError('');
    }
  };

  const reloadChat = async () => {
    await loadChatHistory();
  };

  const quickActions = [
    { label: 'GPA Help', text: 'How to calculate my GPA with 5.00 scale?', emoji: '📊' },
    { label: 'Study Help', text: 'I need study assistance for exams', emoji: '📚' },
    { label: 'Business Help', text: 'Business planning advice for SMEs', emoji: '💼' },
    { label: 'Features', text: 'What features does Thinkora have?', emoji: '🤔' },
  ];

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2em', marginBottom: '20px' }}>🤖</div>
          <div>Loading your dashboard...</div>
          <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
            Please wait while we authenticate...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isMobile ? '#fff' : '#f8f9fa', 
      padding: 0, 
      margin: 0 
    }}>

      {/* Fixed Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#007bff',
        color: 'white',
        padding: isMobile ? '12px 15px' : '15px 20px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        height: isMobile ? '70px' : '80px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '100%'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              fontWeight: '600'
            }}>
              🤖 Thinkora AI
            </h1>
            <div style={{ 
              fontSize: isMobile ? '0.75rem' : '0.85rem', 
              opacity: 0.9,
              marginTop: '3px'
            }}>
              {user.username} • {messages.length} messages
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={reloadChat}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: isMobile ? '0.75rem' : '0.85rem',
                cursor: 'pointer'
              }}
            >
              ↻ Reload
            </button>
            <button 
              onClick={logout}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 15px',
                fontSize: isMobile ? '0.85rem' : '0.9rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tabs - Sticky */}
      {isMobile && (
        <div style={{
          position: 'sticky',
          top: '70px',
          left: 0,
          right: 0,
          background: 'white',
          zIndex: 999,
          display: 'flex',
          borderBottom: '1px solid #e9ecef',
          height: '50px'
        }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              flex: 1,
              padding: '15px',
              background: activeTab === 'chat' ? '#007bff' : 'white',
              color: activeTab === 'chat' ? 'white' : '#495057',
              border: 'none',
              borderBottom: activeTab === 'chat' ? '3px solid #0056b3' : 'none',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            style={{
              flex: 1,
              padding: '15px',
              background: activeTab === 'tools' ? '#007bff' : 'white',
              color: activeTab === 'tools' ? 'white' : '#495057',
              border: 'none',
              borderBottom: activeTab === 'tools' ? '3px solid #0056b3' : 'none',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🛠️ Tools
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        paddingTop: isMobile ? '120px' : '90px',
        paddingBottom: isMobile ? '20px' : '20px',
        paddingLeft: isMobile ? '10px' : '20px',
        paddingRight: isMobile ? '10px' : '20px',
        minHeight: 'calc(100vh - 100px)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>

        {/* Error Alert */}
        {error && !isMobile && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid #ffeaa7',
            fontSize: '0.9em',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#856404',
                cursor: 'pointer',
                fontSize: '1.2em'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Desktop Layout */}
        {!isMobile ? (
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            height: 'calc(100vh - 150px)' 
          }}>
            
            {/* Chat Section - Left */}
            <div style={{ 
              flex: 3,
              display: 'flex',
              flexDirection: 'column',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}>
              
              {/* Chat Header */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                padding: '18px 20px',
                fontWeight: '600',
                fontSize: '1.1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>💬 AI Assistant</span>
                <button
                  onClick={clearChat}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '15px',
                    padding: '5px 12px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear Chat
                </button>
              </div>
              
              {/* Chat Messages */}
              <div style={{ 
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                background: '#fafafa',
                minHeight: '300px'
              }}>
                {isLoadingHistory ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '2em', marginBottom: '10px' }}>💭</div>
                    <div>Loading chat history...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '2.5em', marginBottom: '15px' }}>🤖</div>
                    <div style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#495057' }}>
                      Welcome to Thinkora, {user.username}!
                    </div>
                    <div style={{ color: '#6c757d', marginBottom: '30px' }}>
                      Your AI assistant for students and SMEs
                    </div>
                    <div style={{ 
                      background: '#e7f3ff', 
                      padding: '15px', 
                      borderRadius: '10px',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '10px' }}>Try asking:</div>
                      <div>• "How to calculate GPA with 5.00 scale?"</div>
                      <div>• "Study tips for mathematics"</div>
                      <div>• "Business plan template for SMEs"</div>
                      <div>• "Help with WAEC/NECO preparation"</div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} style={{ 
                      marginBottom: '15px',
                      textAlign: msg.sender === 'user' ? 'right' : 'left'
                    }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        maxWidth: '80%',
                        background: msg.sender === 'user' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : '#f1f3f4',
                        color: msg.sender === 'user' ? 'white' : '#202124',
                        wordBreak: 'break-word',
                        lineHeight: '1.4',
                        boxShadow: msg.sender === 'user' 
                          ? '0 2px 5px rgba(102, 126, 234, 0.3)' 
                          : '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        {msg.text}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6c757d',
                        marginTop: '4px',
                        padding: '0 5px'
                      }}>
                        {msg.sender === 'user' ? 'You' : 'Thinkora AI'}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
                {loading && (
                  <div style={{ 
                    textAlign: 'left', 
                    color: '#6c757d', 
                    fontStyle: 'italic',
                    padding: '10px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid #e9ecef',
                      borderTopColor: '#007bff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Thinking...
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div style={{ 
                borderTop: '1px solid #e9ecef', 
                padding: '20px',
                background: 'white'
              }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '25px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    style={{
                      padding: '14px 25px',
                      background: loading || !input.trim() ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      minWidth: '100px',
                      transition: 'background 0.3s'
                    }}
                  >
                    Send
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div style={{ 
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(action.text);
                        setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
                      }}
                      style={{
                        padding: '8px 12px',
                        background: '#f8f9fa',
                        color: '#495057',
                        border: '1px solid #dee2e6',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span>{action.emoji}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools Section - Right */}
            <div style={{ 
              flex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              
              {/* GPA Calculator Card */}
              <div style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ 
                  margin: '0 0 20px 0',
                  color: '#212529',
                  fontSize: '1.3rem'
                }}>
                  🛠️ Tools & Features
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <button
                    style={{ 
                      padding: '15px',
                      background: isCalculating ? '#dc3545' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setIsCalculating(!isCalculating)}
                  >
                    <span style={{ fontSize: '1.5em' }}>📊</span>
                    <span>{isCalculating ? 'Close GPA' : 'GPA Calculator'}</span>
                  </button>
                  
                  <button
                    style={{ 
                      padding: '15px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => {
                      setInput("What AI features do you have?");
                      setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
                    }}
                  >
                    <span style={{ fontSize: '1.5em' }}>🤖</span>
                    <span>AI Features</span>
                  </button>
                </div>

                {isCalculating && (
                  <div style={{ 
                    borderTop: '1px solid #e9ecef',
                    paddingTop: '20px',
                    marginTop: '20px'
                  }}>
                    <GpaCalculator onHide={() => setIsCalculating(false)} />
                  </div>
                )}
              </div>

              {/* Status Card */}
              <div style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <h4 style={{ 
                  margin: '0 0 15px 0',
                  color: '#212529'
                }}>
                  📊 System Status
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Backend:</span>
                    <span style={{ color: '#28a745', fontWeight: '500' }}>🟢 Online</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Messages:</span>
                    <span style={{ fontWeight: '500' }}>{messages.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GPA Scale:</span>
                    <span>5.00 (Nigerian)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>User:</span>
                    <span>{user.username}</span>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '20px',
                  padding: '12px',
                  background: '#e7f3ff',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}>
                  <strong>💡 Tip:</strong> Try "Calculate GPA: A=5, B=4, C=3" in chat
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mobile Layout */
          <div style={{ minHeight: 'calc(100vh - 180px)' }}>
            
            {/* Error Alert - Mobile */}
            {error && (
              <div style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                border: '1px solid #ffeaa7',
                fontSize: '0.85em'
              }}>
                ⚠️ {error}
                <button
                  onClick={() => setError('')}
                  style={{
                    float: 'right',
                    background: 'none',
                    border: 'none',
                    color: '#856404',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 200px)'
              }}>
                
                {/* Chat Messages */}
                <div style={{ 
                  flex: 1,
                  padding: '15px 0',
                  overflowY: 'auto',
                  background: '#fff',
                  marginBottom: '10px'
                }}>
                  {isLoadingHistory ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: '2em', marginBottom: '10px' }}>💭</div>
                      <div>Loading chat...</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                      <div style={{ fontSize: '2.5em', marginBottom: '15px' }}>🤖</div>
                      <div style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#495057' }}>
                        Hello {user.username}!
                      </div>
                      <div style={{ color: '#6c757d', marginBottom: '25px' }}>
                        I'm your AI assistant. How can I help?
                      </div>
                      
                      {/* Quick Action Grid */}
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '20px'
                      }}>
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInput(action.text);
                              setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
                            }}
                            style={{
                              padding: '15px 10px',
                              background: '#f8f9fa',
                              color: '#495057',
                              border: '1px solid #dee2e6',
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span style={{ fontSize: '1.5em' }}>{action.emoji}</span>
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} style={{ 
                        marginBottom: '12px',
                        padding: '0 15px'
                      }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '12px 15px',
                          borderRadius: '18px',
                          maxWidth: '85%',
                          background: msg.sender === 'user' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : '#f1f3f4',
                          color: msg.sender === 'user' ? 'white' : '#202124',
                          float: msg.sender === 'user' ? 'right' : 'left',
                          clear: 'both',
                          wordBreak: 'break-word',
                          lineHeight: '1.4'
                        }}>
                          {msg.text}
                        </div>
                        <div style={{ clear: 'both' }}></div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                  {loading && (
                    <div style={{ 
                      textAlign: 'left', 
                      color: '#6c757d',
                      padding: '10px 15px',
                      fontStyle: 'italic'
                    }}>
                      Thinking...
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <div style={{ 
                  background: 'white',
                  padding: '15px',
                  borderTop: '1px solid #e9ecef',
                  position: 'sticky',
                  bottom: 0
                }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type message..."
                      style={{
                        flex: 1,
                        padding: '14px 16px',
                        border: '2px solid #e9ecef',
                        borderRadius: '25px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      style={{
                        padding: '14px 20px',
                        background: loading || !input.trim() ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        minWidth: '80px'
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div style={{ padding: '15px 0' }}>
                
                {/* GPA Calculator Card */}
                <div style={{ 
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                      📊 GPA Calculator
                    </h3>
                    <button
                      onClick={() => setIsCalculating(!isCalculating)}
                      style={{
                        padding: '10px 20px',
                        background: isCalculating ? '#dc3545' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      {isCalculating ? 'Close' : 'Open'}
                    </button>
                  </div>
                  
                  {isCalculating && (
                    <div style={{ marginTop: '15px' }}>
                      <GpaCalculator onHide={() => setIsCalculating(false)} />
                    </div>
                  )}
                </div>

                {/* Status Card */}
                <div style={{ 
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>
                    📱 System Info
                  </h4>
                  
                  <div style={{ 
                    background: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Status:</span>
                      <span style={{ color: '#28a745', fontWeight: '500' }}>🟢 Online</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Messages:</span>
                      <span>{messages.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Scale:</span>
                      <span>5.00 (A=5)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Backend:</span>
                      <span>localhost:8000</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: '15px',
                    padding: '12px',
                    background: '#e7f3ff',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <strong>💡 Tip:</strong> Tap any quick action in chat tab!
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Better scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Prevent text selection on buttons */
        button {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
