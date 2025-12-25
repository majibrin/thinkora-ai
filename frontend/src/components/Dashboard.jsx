import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import GpaCalculator from './GpaCalculator.jsx';
import Header from './Header.jsx';
import axios from 'axios';
import './Dashboard.css';

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

  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [token]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setError('Could not load chat history. Backend may be offline.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => loadChatHistory(), []);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, isLoadingHistory]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input;
    setInput('');
    setLoading(true);
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setError('');

    try {
      const res = await axios.post(
        '/chat/',
        { message: userMessage, context: 'student' },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data.success) setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
      else setMessages((prev) => [...prev, { sender: 'ai', text: res.data.error || 'Unknown error' }]);
    } catch (err) {
      let msg = '⚠️ Could not connect to server.';
      if (err.response) msg = `Server error: ${err.response.status}`;
      else if (err.request) msg = 'No response from server.';
      setMessages((prev) => [...prev, { sender: 'ai', text: msg }]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const clearChat = () => { if (window.confirm('Clear all messages?')) setMessages([]); };
  const reloadChat = () => loadChatHistory();

  if (!user) return <div className="dashboard-loading"><div><div className="loading-icon">🤖</div>Loading your dashboard...</div></div>;

  return (
    <div className="dashboard-container">
      <Header user={{ ...user, messagesCount: messages.length }} onLogout={logout} reloadChat={reloadChat} />

      {isMobile && (
        <div className="mobile-tabs">
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>💬 Chat</button>
          <button className={activeTab === 'tools' ? 'active' : ''} onClick={() => setActiveTab('tools')}>🛠️ Tools</button>
        </div>
      )}

      <div className="dashboard-main">
        {error && <div className="dashboard-error">{error} <button onClick={() => setError('')}>×</button></div>}

        {!isMobile ? (
          <>
            <div className="dashboard-desktop">
              <div className="chat-section">
                <div className="chat-header">💬 AI Assistant <button onClick={clearChat}>Clear Chat</button></div>
                <div className="chat-messages">
                  {isLoadingHistory ? <div className="chat-loading">Loading chat history...</div>
                  : messages.length === 0 ? <div className="chat-empty">Welcome, {user.username}!</div>
                  : messages.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.sender}`}>
                        <div className="bubble">{msg.text}</div>
                        <div className="bubble-info">{msg.sender === 'user' ? 'You' : 'Thinkora AI'}</div>
                      </div>
                  ))}
                  <div ref={messagesEndRef} />
                  {loading && <div className="chat-loading">Thinking...</div>}
                </div>
                <div className="chat-input">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." disabled={loading}/>
                  <button onClick={sendMessage} disabled={loading || !input.trim()}>Send</button>
                </div>
              </div>

              <div className="tools-section">
                <div className="card">
                  <h3>🛠️ Tools & Features</h3>
                  <div className="tools-grid">
                    <button onClick={() => setIsCalculating(!isCalculating)}>📊 GPA Calculator</button>
                    <button onClick={() => setInput('What AI features do you have?')}>🤖 AI Features</button>
                  </div>
                  {isCalculating && <GpaCalculator onHide={() => setIsCalculating(false)} />}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {activeTab === 'chat' && (
              <div className="chat-section">
                <div className="chat-messages">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.sender}`}><div className="bubble">{msg.text}</div></div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="chat-input">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type message..." />
                  <button onClick={sendMessage} disabled={loading || !input.trim()}>Send</button>
                </div>
              </div>
            )}
            {activeTab === 'tools' && (
              <div className="tools-section">
                <div className="card">
                  <h3>📊 GPA Calculator</h3>
                  <button onClick={() => setIsCalculating(!isCalculating)}>{isCalculating ? 'Close' : 'Open'}</button>
                  {isCalculating && <GpaCalculator onHide={() => setIsCalculating(false)} />}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
