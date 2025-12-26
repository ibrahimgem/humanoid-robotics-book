import React from 'react';
import ChatWidgetWrapper from './ChatWidgetWrapper';

// Root component that wraps the entire Docusaurus app
const Root = ({ children }) => {
  return (
    <div className="humanoid-robotics-root">
      {children}
      <ChatWidgetWrapper />
    </div>
  );
};

export default Root;