import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Root component that wraps the entire Docusaurus app
const Root = ({ children }) => {
  return (
    <div className="humanoid-robotics-root">
      {children}
      <BrowserOnly>
        {() => {
          const ChatWidgetWrapper = require('./ChatWidgetWrapper').default;
          return <ChatWidgetWrapper />;
        }}
      </BrowserOnly>
    </div>
  );
};

export default Root;