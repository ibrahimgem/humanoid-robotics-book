import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

const ChatWidget = ({ initialMode = 'global' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryMode, setQueryMode] = useState(initialMode);
  const [sessionId, setSessionId] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch('/api/session', {
          method: 'POST',
        });
        const data = await response.json();
        setSessionId(data.session_id);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error initializing session:', error);
        setError(error.message || 'Failed to initialize session');
      }
    };

    initSession();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare the query data based on mode
      const queryData = {
        question_text: inputValue,
        query_mode: queryMode,
        session_id: sessionId,
      };

      // Include selected text if in selected-text mode
      if (queryMode === 'selected_text' && selectedText) {
        queryData.selected_text = selectedText;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryData),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now(),
        text: data.response,
        sender: 'bot',
        sources: data.sources || [],
        follow_up_questions: data.follow_up_questions || [],
        tone_analysis: data.tone_analysis || {}
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'An unknown error occurred');
      const errorMessage = {
        id: Date.now(),
        text: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`,
        sender: 'bot',
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

  const toggleMode = async () => {
    const newMode = queryMode === 'global' ? 'selected_text' : 'global';
    setQueryMode(newMode);

    try {
      await fetch('/api/query-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          mode: newMode,
        }),
      });
    } catch (error) {
      console.error('Error setting query mode:', error);
    }
  };

  const handleTextSelection = () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      setSelectedText(selectedText);
      if (queryMode === 'selected_text') {
        setInputValue(selectedText); // Pre-fill the input with selected text
      }
    }
  };

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div
          className="chat-window"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-title"
        >
          <div className="chat-header">
            <div className="chat-title" id="chat-title">AI Assistant</div>
            <div className="chat-controls">
              <button
                className={`mode-toggle ${queryMode === 'selected_text' ? 'active' : ''}`}
                onClick={toggleMode}
                title={queryMode === 'global' ? 'Switch to Selected Text Mode' : 'Switch to Global Mode'}
                aria-label={queryMode === 'global' ? 'Switch to Selected Text Mode' : 'Switch to Global Mode'}
                aria-pressed={queryMode === 'selected_text'}
              >
                {queryMode === 'global' ? '📖 Global' : '📝 Selected'}
              </button>
              <button
                className="chat-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {error && (
            <div
              className="error-message"
              role="alert"
              aria-live="polite"
            >
              <span className="error-icon" aria-hidden="true">⚠️</span>
              <span className="error-text">{error}</span>
              <button
                className="error-close"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div
            className="chat-messages"
            role="log"
            aria-live="polite"
            onMouseUp={handleTextSelection}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender}-message`}
                role="status"
                aria-live="polite"
              >
                <div className="message-text">{message.text}</div>
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources">
                    Sources: {message.sources.join(', ')}
                  </div>
                )}
                {message.follow_up_questions && message.follow_up_questions.length > 0 && (
                  <div className="follow-up-questions" role="region" aria-label="Suggested follow-up questions">
                    <div className="follow-up-title">Related Questions:</div>
                    {message.follow_up_questions.map((question, idx) => (
                      <div key={idx} className="follow-up-question">
                        <button
                          className="follow-up-btn"
                          onClick={() => setInputValue(question)}
                          aria-label={`Ask: ${question}`}
                        >
                          {question}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message" role="status" aria-live="polite">
                <div className="message-text">
                  <div className="typing-indicator" aria-label="AI is typing" role="img">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <div className="chat-input-area">
            {queryMode === 'selected_text' && selectedText && (
              <div
                className="selected-text-preview"
                aria-label={`Selected text preview: ${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}`}
              >
                Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
              </div>
            )}
            <div className="chat-input-container">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={queryMode === 'selected_text'
                  ? 'Ask about the selected text...'
                  : 'Ask about the humanoid robotics book...'}
                className="chat-input"
                rows="3"
                aria-label={queryMode === 'selected_text'
                  ? 'Ask about the selected text'
                  : 'Ask about the humanoid robotics book'}
                disabled={isLoading}
                autoFocus
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="chat-send-button"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="chat-toggle-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI assistant chat"
          aria-expanded="false"
          title="Ask AI Assistant"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.38 14.99 3.05 16.28L2 22L7.72 20.95C9.01 21.62 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
              fill="currentColor"
              opacity="0.9"
            />
            <circle cx="9" cy="11" r="1.5" fill="white" />
            <circle cx="12" cy="11" r="1.5" fill="white" />
            <circle cx="15" cy="11" r="1.5" fill="white" />
            <path
              d="M7 14.5C7.5 15.5 9 17 12 17C15 17 16.5 15.5 17 14.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;