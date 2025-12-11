import React, { useState } from 'react';
import './FloatingChatbot.css';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => setIsChatVisible(true), 10);
    } else {
      setIsChatVisible(false);
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  return (
    <div className={`floating-chatbot ${isOpen ? 'open' : ''}`}>
      {isChatVisible && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>🤖 Robotics Assistant</h3>
            <button className="close-btn" onClick={toggleChat}>×</button>
          </div>
          <div className="chat-messages">
            <div className="message bot-message">
              Hello! I'm your Humanoid Robotics learning assistant. How can I help you today?
            </div>
          </div>
          <div className="chat-input">
            <input type="text" placeholder="Ask about humanoid robotics..." />
            <button>Send</button>
          </div>
        </div>
      )}
      <button className="chat-toggle-btn" onClick={toggleChat}>
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
};

export default FloatingChatbot;