import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AuthProvider } from '../contexts/AuthContext';

// Import the chat widget component
import ChatWidgetComponent from '../components/ChatWidget';
import AuthModal from '../components/AuthModal';

// The actual ChatWidget component implementation
const ChatWidget = () => {
  // Show the chat widget on all pages (it will check for auth inside)
  const showChatWidget = true;

  if (!showChatWidget) {
    return null;
  }

  return (
    <BrowserOnly>
      {() => <ChatWidgetComponent />}
    </BrowserOnly>
  );
};

// Root component that wraps the entire Docusaurus app
const Root = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setAuthMode('login');
      setShowAuthModal(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  return (
    <AuthProvider>
      {children}
      <ChatWidget />
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
        />
      )}
    </AuthProvider>
  );
};

export default Root;