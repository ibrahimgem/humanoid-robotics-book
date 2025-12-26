import React, { useEffect } from 'react';
import ChatWidget from '@site/src/components/ChatWidget/ChatWidget';

const ChatWidgetWrapper = () => {
  useEffect(() => {
    // Add any initialization code here if needed
    console.log('ChatWidget loaded');
  }, []);

  return <ChatWidget />;
};

export default ChatWidgetWrapper;