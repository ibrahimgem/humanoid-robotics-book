import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ChatWidget.css';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    // Generate a unique session ID or retrieve from localStorage
    const savedSessionId = localStorage.getItem('chat_session_id');
    if (savedSessionId) {
      return savedSessionId;
    }
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', newSessionId);
    return newSessionId;
  });

  // Show chat widget to all users, but with limited functionality for non-logged-in users
  const isUserLoggedIn = !!user;

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if user is logged in for full functionality
    if (!isUserLoggedIn && messages.length === 0) {
      // For first-time users who aren't logged in, show a welcome message with login prompt
      const welcomeMessage = {
        id: Date.now(),
        text: "Welcome! I'm your AI assistant for Humanoid Robotics. To access personalized features and maintain your chat history, please log in. For now, I can still answer general questions about robotics!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }

    const userMessage = { id: Date.now() + 1000, text: inputValue, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the backend API to get the response
      const apiService = await import('../../services/api.js');
      const data = await apiService.default.sendQuery(inputValue, sessionId);
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        sources: data.sources || []
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const startNewSession = () => {
    setMessages([]);
    // Generate a new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
  };

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">🤖 Robotics Assistant</div>
            <div className="chat-controls">
              {!isUserLoggedIn && (
                <button
                  onClick={() => {
                    // Close the chat widget and trigger the login modal via a custom event
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent('openLoginModal'));
                  }}
                  className="login-prompt-btn"
                  title="Login to access personalized features"
                >
                  Login
                </button>
              )}
              <button onClick={startNewSession} className="new-session-btn" title="New Session">
                🔄
              </button>
              <button onClick={toggleChat} className="close-btn">
                ×
              </button>
            </div>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h3>Hello! I'm your AI assistant for Humanoid Robotics.</h3>
                <p>Ask me anything about ROS 2, Gazebo, Unity, NVIDIA Isaac, VLA, or humanoid development!</p>
                {!isUserLoggedIn && (
                  <p style={{marginTop: '10px', fontSize: '13px', color: '#4b5563'}}>
                    <em>Log in to access personalized features and maintain chat history.</em>
                  </p>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="message-sources">
                        <details>
                          <summary>Sources:</summary>
                          <ul>
                            {message.sources.map((source, idx) => (
                              <li key={idx}>{source}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about humanoid robotics..."
              className="chat-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              className={`send-button ${isLoading ? 'loading' : ''}`}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? 'Sending...' : '➤'}
            </button>
          </div>
        </div>
      ) : (
        <button className="chat-toggle" onClick={toggleChat}>
          <span>🤖</span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;