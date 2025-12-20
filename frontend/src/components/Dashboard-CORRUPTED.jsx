// frontend/src/components/Dashboard.jsx - MOBILE OPTIMIZED
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
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'tools'
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        document.body.style.overflowX = 'hidden';
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load chat history
  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 
        'Authorization': `Token ${token}` 
      } : {};
      
      const response = await fetch('http://localhost:8000/api/chat/history/', {
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.history) {
          const formattedMessages = data.history.map(msg => ({
            sender: msg.sender === 'user' ? 'user' : 'ai',
            text: msg.text,
            time: msg.time
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.log('No chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => { 
    if (!isLoadingHistory) {
      scrollToBottom(); 
    }
  }, [messages, isLoadingHistory]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setInput('');
    setLoading(true);
    
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
          context: 'student'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Error: ' + (data.error || 'Unknown') }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: '⚠️ Check backend connection' 
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

  // Clear chat
  const clearChat = () => {
    if (window.confirm('Clear chat history?')) {
      setMessages([]);
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'GPA Help', text: 'How to calculate my GPA?', emoji: '📊' },
    { label: 'Study Help', text: 'I need study assistance', emoji: '📚' },
    { label: 'Business Help', text: 'Business planning advice', emoji: '💼' },
    { label: 'Hello', text: 'Hello Thinkora!', emoji: '👋' },
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
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: isMobile ? '#fff' : '#f8f9fa',
      padding: 0,
      margin: 0,
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      
      {/* MOBILE HEADER - Fixed at top */}
      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        background: '#007bff',
        color: 'white',
        padding: isMobile ? '12px 15px' : '15px 20px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              fontWeight: '600'
            }}>
              🤖 Thinkora
            </h1>
            <div style={{ 
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              opacity: 0.9,
              marginTop: '3px'
            }}>
              {user.username} • {isMobile ? 'Mobile' : 'Desktop'}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={clearChat}
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
              Clear
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

      {/* MOBILE TABS - Only show on mobile */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          background: 'white',
          zIndex: 999,
          borderBottom: '1px solid #e9ecef',
          display: 'flex'
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

      {/* MAIN CONTENT */}
      <div style={{
        paddingTop: isMobile ? '130px' : '20px',
        paddingBottom: isMobile ? '80px' : '20px',
        paddingLeft: isMobile ? '10px' : '20px',
        paddingRight: isMobile ? '10px' : '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* DESKTOP LAYOUT (side by side) */}
        {!isMobile && (
          <div style={{ 
            display: 'flex', 
            gap: '20px',
            height: 'calc(100vh - 100px)'
          }}>
            
            {/* CHAT SECTION - Desktop */}
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
                fontSize: '1.1rem'
              }}>
                💬 AI Assistant
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
                      Welcome to Thinkora!
                    </div>
                    <div style={{ color: '#6c757d', marginBottom: '30px' }}>
                      Your AI assistant for students and SMEs
                    </div>
                    <div style={{ 
                      background: '#e7f3ff', 
                      padding: '15px', 
                      borderRadius: '10px',
                      textAlign: 'left',
                      marginBottom: '20px'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '10px' }}>Try asking:</div>
                      <div>• "How to calculate GPA?"</div>
                      <div>• "Study tips for exams"</div>
                      <div>• "Business plan template"</div>
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
                        {msg.sender === 'user' ? 'You' : 'Thinkora'}
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
                    padding: '10px 5px'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid #e9ecef',
                        borderTopColor: '#007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Thinking...
                    </span>
                  </div>
                )}
              </div>
              
              {/* Chat Input - Desktop */}
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
                
                {/* Quick Actions - Desktop */}
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

            {/* TOOLS SECTION - Desktop */}
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
                  🛠️ Tools
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
                      setInput("I need AI assistance");
                      setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 100);
                    }}
                  >
                    <span style={{ fontSize: '1.5em' }}>🤖</span>
                    <span>AI Predictor</span>
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
        )}

        {/* MOBILE LAYOUT - Tab based */}
        {isMobile && (
          <div style={{ minHeight: 'calc(100vh - 180px)' }}>
            
            {/* CHAT TAB - Mobile */}
            {activeTab === 'chat' && (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 220px)'
              }}>
                
                {/* Chat Messages - Mobile */}
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
                
                {/* Chat Input - Mobile */}
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

            {/* TOOLS TAB - Mobile */}
            {activeTab === 'tools' && (
              <div style={{ padding: '15px 0' }}>
                
                {/* GPA Calculator Card - Mobile */}
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

                {/* Quick Actions - Mobile */}
                <div style={{ 
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>
                    ⚡ Quick Actions
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => {
                        setInput("Calculate my GPA");
                        setActiveTab('chat');
                      }}
                      style={{
                        padding: '15px 10px',
                        background: '#e7f3ff',
                        color: '#0056b3',
                        border: '1px solid #b3d7ff',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '1.5em' }}>📊</span>
                      <span>Calculate GPA</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setInput("Study tips for exams");
                        setActiveTab('chat');
                      }}
                      style={{
                        padding: '15px 10px',
                        background: '#f0f9ff',
                        color: '#0c5460',
                        border: '1px solid #bee5eb',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '1.5em' }}>📚</span>
                      <span>Study Help</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setInput("Business plan template");
                        setActiveTab('chat');
                      }}
                      style={{
                        padding: '15px 10px',
                        background: '#f4f4f4',
                        color: '#383d41',
                        border: '1px solid #d6d8db',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '1.5em' }}>💼</span>
                      <span>Business Help</span>
                    </button>
                    
                    <button
                      onClick={clearChat}
                      style={{
                        padding: '15px 10px',
                        background: '#fff5f5',
                        color: '#721c24',
                        border: '1px solid #f5c6cb',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '1.5em' }}>🗑️</span>
                      <span>Clear Chat</span>
                    </button>
                  </div>
                </div>

                {/* Status Card - Mobile */}
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
                    <strong>💡 Tip:</strong> Tap any quick action to switch to chat!
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Mobile only */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e9ecef',
          padding: '10px 15px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#6c757d',
            textAlign: 'center'
          }}>
            Thinkora MVP • Chat: {messages.length} messages • GPA: 5.00 Scale
          </div>
        </div>
      )}

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Better scrollbar for mobile */
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
        
        /* Better touch targets */
        input, button {
          font-size: 16px !important; /* Prevents zoom on iOS */
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
