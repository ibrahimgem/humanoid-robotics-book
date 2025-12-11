import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './PersonalizeButton.css';

const PersonalizeButton = ({ chapterId, content, onContentChange }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePersonalize = async () => {
    if (!user) {
      setError('Please sign in to use personalization features');
      return;
    }

    if (!content) {
      setError('No content available to personalize');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.personalizeChapter(chapterId || 'current', content);

      if (response.personalized_content) {
        onContentChange && onContentChange(response.personalized_content);
      } else {
        setError('No personalized content returned from server');
      }
    } catch (err) {
      console.error('Error personalizing content:', err);
      setError(err.message || 'Failed to personalize content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="personalize-button-container">
      <button
        className={`personalize-button ${isLoading ? 'loading' : ''}`}
        onClick={handlePersonalize}
        disabled={isLoading || !user}
        title={user ? 'Personalize this content based on your profile' : 'Sign in to access personalization'}
      >
        {isLoading ? 'Personalizing...' : 'Personalize This Chapter'}
      </button>
      {error && <div className="personalize-error">{error}</div>}
    </div>
  );
};

export default PersonalizeButton;