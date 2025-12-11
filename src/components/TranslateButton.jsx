import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './TranslateButton.css';

const TranslateButton = ({ content, onContentChange }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [originalContent, setOriginalContent] = useState('');

  const handleTranslate = async () => {
    if (!user) {
      setError('Please sign in to use translation features');
      return;
    }

    if (!content) {
      setError('No content available to translate');
      return;
    }

    if (!isTranslated) {
      // Save original content before translation
      setOriginalContent(content);

      setIsLoading(true);
      setError('');

      try {
        const response = await apiService.translateToUrdu(content);

        if (response.translated_text) {
          onContentChange && onContentChange(response.translated_text);
          setIsTranslated(true);
        } else {
          setError('No translation returned from server');
        }
      } catch (err) {
        console.error('Error translating content:', err);
        setError(err.message || 'Failed to translate content');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Switch back to original content
      onContentChange && onContentChange(originalContent);
      setIsTranslated(false);
    }
  };

  return (
    <div className="translate-button-container">
      <button
        className={`translate-button ${isLoading ? 'loading' : ''} ${isTranslated ? 'translated' : ''}`}
        onClick={handleTranslate}
        disabled={isLoading || !user}
        title={user ? 'Translate this content to Urdu' : 'Sign in to access translation'}
      >
        {isLoading
          ? 'Translating...'
          : isTranslated
            ? 'Show Original'
            : 'Translate to Urdu'}
      </button>
      {error && <div className="translate-error">{error}</div>}
    </div>
  );
};

export default TranslateButton;