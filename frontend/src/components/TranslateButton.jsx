import React, { useState } from 'react';
import TranslationChips from './TranslationChips';
import UrduContent from './UrduContent';
import './TranslateButton.css';

const TranslateButton = ({ content, onContentChange }) => {
  const [showChips, setShowChips] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUrdu, setIsUrdu] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(null);

  const handleTranslate = async (langId) => {
    if (!langId) {
      // If no language selected, reset to English
      setIsUrdu(false);
      setTranslatedContent(null);
      if (onContentChange) {
        onContentChange(content, false);
      }
      return;
    }

    setIsProcessing(true);

    try {
      // In a real implementation, this would call the backend API
      const response = await simulateTranslationAPI(content, langId);

      if (response.translated_text) {
        setTranslatedContent(response.translated_text);
        setIsUrdu(langId === 'ur');

        if (onContentChange) {
          onContentChange(response.translated_text, langId === 'ur');
        }
      }
    } catch (error) {
      console.error('Error translating content:', error);
    } finally {
      setIsProcessing(false);
      setShowChips(false);
    }
  };

  // Simulate API call to backend
  const simulateTranslationAPI = (text, targetLang) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is a simulation - in real implementation, content would be translated
        const translatedText = targetLang === 'ur'
          ? `[URDU MOCK] ترجمہ: ${text.substring(0, 50)}... [END MOCK]`
          : text;

        resolve({
          original_text: text,
          translated_text: translatedText,
          cache_key: `translation_${Date.now()}`
        });
      }, 1500);
    });
  };

  const toggleChips = () => {
    setShowChips(!showChips);
  };

  const resetTranslation = () => {
    setIsUrdu(false);
    setTranslatedContent(null);
    setShowChips(false);
    if (onContentChange) {
      onContentChange(content, false);
    }
  };

  return (
    <div className="translate-button-container">
      <button
        className={`translate-btn ${isProcessing ? 'processing' : ''} ${isUrdu ? 'urdu-mode' : ''}`}
        onClick={isUrdu ? resetTranslation : toggleChips}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="loading">🔄 Translating...</span>
        ) : isUrdu ? (
          <span>🇬🇧 Show in English</span>
        ) : (
          <span>🇵🇰 Translate to Urdu</span>
        )}
      </button>

      {showChips && !isUrdu && (
        <div className="translation-panel">
          <TranslationChips onTranslate={handleTranslate} />
        </div>
      )}

      {isUrdu && translatedContent && (
        <div className="urdu-display">
          <UrduContent content={translatedContent} isUrdu={true} />
        </div>
      )}
    </div>
  );
};

export default TranslateButton;