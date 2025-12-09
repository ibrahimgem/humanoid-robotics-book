import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useLocation } from '@docusaurus/router';

// Import the chat widget component and its styles
import ChatWidgetComponent from '../components/ChatWidget';
import '../components/ChatWidget/ChatWidget.css';

// The actual ChatWidget component implementation
const ChatWidget = () => {
  const location = useLocation();

  // Don't show the chat widget on certain pages if needed
  // For now, show it on all pages
  const showChatWidget = true; // You can customize this logic based on path

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
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
};

export default Root;