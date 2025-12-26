import React, { useState, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({
  onSendMessage,
  messages = [],
  isLoading = false,
  queryMode = 'global',
  onModeChange,
  selectedText = ''
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${message.sender}-message`}
          >
            <div className="message-content">{message.text}</div>
            {message.sources && message.sources.length > 0 && (
              <div className="message-sources">
                Sources: {message.sources.join(', ')}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {queryMode === 'selected_text' && selectedText && (
        <div className="selected-text-preview">
          <strong>Selected Text:</strong> "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-controls">
          <button
            type="button"
            className={`mode-toggle ${queryMode === 'selected_text' ? 'active' : ''}`}
            onClick={() => onModeChange && onModeChange(queryMode === 'global' ? 'selected_text' : 'global')}
          >
            {queryMode === 'global' ? '🌐 Global' : '📝 Selected Text'}
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={queryMode === 'selected_text'
              ? 'Ask about the selected text...'
              : 'Ask about the humanoid robotics book...'}
            className="chat-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;