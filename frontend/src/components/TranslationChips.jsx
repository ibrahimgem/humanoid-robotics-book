import React, { useState } from 'react';
import './TranslationChips.css';

const TranslationChips = ({ onTranslate }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { id: 'ur', label: '🇺🇸 English → 🇵🇰 Urdu', description: 'Translate to Urdu with technical terms preserved' },
    { id: 'en', label: '🇵🇰 Urdu → 🇺🇸 English', description: 'Translate from Urdu to English' }
  ];

  const handleTranslate = async (langId) => {
    if (selectedLanguage === langId) {
      // If clicking the same language, deselect it
      setSelectedLanguage(null);
      if (onTranslate) {
        onTranslate(null);
      }
      return;
    }

    setIsLoading(true);
    setSelectedLanguage(langId);

    try {
      // In a real implementation, this would call the backend API
      if (onTranslate) {
        await onTranslate(langId);
      }
    } catch (error) {
      console.error('Error translating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="translation-chips-container">
      <h4>🌐 Translation Options</h4>
      <div className="chips-wrapper">
        {languages.map((lang) => (
          <button
            key={lang.id}
            className={`chip ${selectedLanguage === lang.id ? 'chip-selected' : ''} ${
              isLoading ? 'chip-loading' : ''
            }`}
            onClick={() => handleTranslate(lang.id)}
            disabled={isLoading}
          >
            <span className="chip-label">{lang.label}</span>
            <span className="chip-description">{lang.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TranslationChips;