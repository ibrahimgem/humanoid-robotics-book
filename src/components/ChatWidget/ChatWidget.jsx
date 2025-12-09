import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryMode, setQueryMode] = useState('global'); // 'global' or 'local'
  const [selectedText, setSelectedText] = useState('');
  const [sessionId, setSessionId] = useState(() => {
    // Generate or retrieve session ID
    const savedSessionId = localStorage.getItem('chatbot-session-id');
    if (savedSessionId) {
      return savedSessionId;
    }
    const newSessionId = 'chat-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatbot-session-id', newSessionId);
    return newSessionId;
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Get selected text from the page
  useEffect(() => {
    const handleSelection = () => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        setSelectedText(selectedText);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle chat with Ctrl/Cmd + Shift + C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if (!isOpen && inputRef.current) {
          setTimeout(() => inputRef.current.focus(), 100);
        }
      }

      // Focus input when chat is open with Ctrl/Cmd + Shift + K
      if (isOpen && (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Close chat with Escape key when open
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Accessibility: Manage focus and ARIA attributes
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Function to send message to backend
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare the request payload
      const requestBody = {
        message: inputValue,
        session_id: sessionId,
        query_mode: queryMode,
      };

      // Include selected text if in local mode
      if (queryMode === 'local' && selectedText) {
        requestBody.selected_text = selectedText;
      }

      // Call the backend API
      // Using a dynamic API base URL for flexibility
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || window.chatbotConfig?.apiBaseUrl || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/chat/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        sources: data.sources || [],
        citations: data.citations || [],
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot',
        isError: true,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle chat widget open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  };

  // Switch query mode
  const switchQueryMode = (mode) => {
    setQueryMode(mode);
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div
      className={`chat-widget ${isOpen ? 'open' : 'closed'}`}
      aria-label="Book Assistant Chat"
      role="complementary"
    >
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          className="chat-toggle-button"
          onClick={toggleChat}
          aria-label="Open chat assistant"
          title="Open chat assistant (Ctrl+Shift+C)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 4H3C2.44772 4 2 4.44772 2 5V16C2 16.5523 2.44772 17 3 17H7L9 21H16C16.3788 21 16.5988 20.7945 16.7239 20.6643C16.8439 20.5393 17.0182 20.4311 17.22 20.3455C17.2266 20.3428 17.2333 20.3401 17.24 20.3374L21.9953 18.2387C22.0728 18.2054 22.1453 18.1683 22.2121 18.1276C22.4929 17.954 22.6667 17.7333 22.6667 17.3333V5C22.6667 4.44772 22.22 4 21.6667 4H21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 9H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="chat-window"
          ref={chatWindowRef}
          role="dialog"
          aria-modal="true"
          aria-label="Book Assistant Chat"
          tabIndex={-1}
        >
          {/* Chat header */}
          <div className="chat-header" role="banner">
            <div className="chat-header-left">
              <h3>Book Assistant</h3>
              <div className="query-mode-selector" role="radiogroup" aria-label="Query mode">
                <button
                  className={queryMode === 'global' ? 'active' : ''}
                  onClick={() => switchQueryMode('global')}
                  title="Ask about the entire book"
                  role="radio"
                  aria-checked={queryMode === 'global'}
                >
                  Global
                </button>
                <button
                  className={queryMode === 'local' ? 'active' : ''}
                  onClick={() => switchQueryMode('local')}
                  title="Ask about selected text"
                  disabled={!selectedText}
                  role="radio"
                  aria-checked={queryMode === 'local'}
                >
                  Local
                </button>
              </div>
            </div>
            <div className="chat-header-right">
              <button
                className="clear-chat-btn"
                onClick={clearChat}
                title="Clear chat history"
                aria-label="Clear chat history"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6L18.3995 5.44822C18.3995 5.44822 18.2375 5.2986 18.0111 5.16135C17.7847 5.0241 17.507 4.90719 17.194 4.81833L17.194 4.81833C16.3741 4.58435 15.48 4.58435 14.6601 4.81833L14.6601 4.81833C14.3471 4.90719 14.0694 5.0241 13.843 5.16135C13.6166 5.2986 13.4546 5.44822 13.4546 5.44822L13 6M5 6L5.60051 5.44822C5.60051 5.44822 5.7625 5.2986 5.98891 5.16135C6.21531 5.0241 6.49304 4.90719 6.80604 4.81833L6.80604 4.81833C7.62594 4.58435 8.52001 4.58435 9.33994 4.81833L9.33994 4.81833C9.65294 4.90719 9.93067 5.0241 10.1571 5.16135C10.3835 5.2986 10.5455 5.44822 10.5455 5.44822L11 6M15 10V16M9 10V16M19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16V8C21 6.89543 20.1046 6 19 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="close-chat-btn"
                onClick={toggleChat}
                aria-label="Close chat"
                title="Close chat (Esc)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="chat-messages" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <div className="welcome-message" role="status" aria-live="polite">
                <p>Hello! I'm your Humanoid Robotics Book assistant.</p>
                <p>Ask me anything about the book content:</p>
                <ul>
                  <li>General questions about any book topic</li>
                  <li>Specific questions about selected text</li>
                </ul>
                {selectedText && (
                  <div className="selected-text-preview">
                    <p><strong>Selected text:</strong> {selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}</p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                  role="listitem"
                  aria-label={`${message.sender === 'user' ? 'User' : 'Assistant'} message`}
                >
                  <div className="message-content">
                    {message.sender === 'bot' && message.isError ? (
                      <div className="error-message" role="alert">{message.text}</div>
                    ) : (
                      <div className="message-text">{message.text}</div>
                    )}

                    {message.sender === 'bot' && message.sources && message.sources.length > 0 && (
                      <div className="message-sources">
                        <details>
                          <summary>Sources</summary>
                          <ul>
                            {message.sources.map((source, idx) => (
                              <li key={idx}>{source}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}

                    {message.sender === 'bot' && message.citations && message.citations.length > 0 && (
                      <div className="message-citations">
                        <details>
                          <summary>Citations</summary>
                          <ul>
                            {message.citations.map((citation, idx) => (
                              <li key={idx}>
                                <strong>{citation.section}:</strong> {citation.text}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                  <div className="message-timestamp" aria-label={`Sent at ${new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message bot-message" role="status" aria-label="Assistant is typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          {/* Chat input */}
          <div className="chat-input-area">
            {queryMode === 'local' && selectedText && (
              <div className="selected-text-indicator" aria-label={`Asking about selected text: ${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}`}>
                <small>Asking about: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"</small>
              </div>
            )}
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={queryMode === 'local' && selectedText ? "Ask about the selected text..." : "Ask about the book content..."}
                disabled={isLoading}
                rows={1}
                aria-label={queryMode === 'local' && selectedText ? "Ask about the selected text" : "Ask about the book content"}
                role="textbox"
                aria-multiline="true"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75001 16.25M4.92157 4.99994L7.75001 7.82837" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;