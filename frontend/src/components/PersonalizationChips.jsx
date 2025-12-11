import React, { useState } from 'react';
import './PersonalizationChips.css';

const PersonalizationChips = ({ onPersonalize }) => {
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [isLoading, setIsLoading] = useState(false);

  const levels = [
    { id: 'beginner', label: '👶 Beginner', description: 'Basic concepts, more explanations' },
    { id: 'intermediate', label: '👨‍💻 Intermediate', description: 'Standard content, balanced approach' },
    { id: 'advanced', label: '🧠 Advanced', description: 'Deep insights, technical details' }
  ];

  const handlePersonalize = async (level) => {
    setIsLoading(true);
    setSelectedLevel(level);

    try {
      // In a real implementation, this would call the backend API
      if (onPersonalize) {
        await onPersonalize(level);
      }
    } catch (error) {
      console.error('Error personalizing content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="personalization-chips-container">
      <h4>🎯 Adjust Difficulty Level</h4>
      <div className="chips-wrapper">
        {levels.map((level) => (
          <button
            key={level.id}
            className={`chip ${selectedLevel === level.id ? 'chip-selected' : ''} ${
              isLoading ? 'chip-loading' : ''
            }`}
            onClick={() => handlePersonalize(level.id)}
            disabled={isLoading}
          >
            <span className="chip-label">{level.label}</span>
            <span className="chip-description">{level.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PersonalizationChips;