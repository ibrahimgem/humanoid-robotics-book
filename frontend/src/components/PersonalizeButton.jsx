import React, { useState } from 'react';
import PersonalizationChips from './PersonalizationChips';
import './PersonalizeButton.css';

const PersonalizeButton = ({ chapterId, content, onContentChange }) => {
  const [showChips, setShowChips] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePersonalize = async (level) => {
    setIsProcessing(true);

    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the personalization
      const response = await simulatePersonalizationAPI(chapterId, content, level);

      if (onContentChange && response.personalized_content) {
        onContentChange(response.personalized_content);
      }
    } catch (error) {
      console.error('Error personalizing content:', error);
    } finally {
      setIsProcessing(false);
      setShowChips(false);
    }
  };

  // Simulate API call to backend
  const simulatePersonalizationAPI = (chapterId, content, level) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is a simulation - in real implementation, content would be personalized
        const personalizedContent = `${content} [Personalized for ${level} level users]`;
        resolve({
          personalized_content: personalizedContent,
          cache_key: `user_123_chapter_${chapterId}_level_${level}`,
          user_level: level
        });
      }, 1000);
    });
  };

  const toggleChips = () => {
    setShowChips(!showChips);
  };

  return (
    <div className="personalize-button-container">
      <button
        className={`personalize-btn ${isProcessing ? 'processing' : ''}`}
        onClick={toggleChips}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="loading">🔄 Processing...</span>
        ) : showChips ? (
          <span>❌ Close</span>
        ) : (
          <span>🎯 Personalize This Chapter</span>
        )}
      </button>

      {showChips && (
        <div className="personalization-panel">
          <PersonalizationChips onPersonalize={handlePersonalize} />
        </div>
      )}
    </div>
  );
};

export default PersonalizeButton;