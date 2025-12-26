import React from 'react';
import Mermaid from '@docusaurus/theme-classic/src/theme/Mermaid';

export default function Diagram({ children, type = 'mermaid', title, className = '' }) {
  if (type === 'mermaid') {
    return (
      <div className={`robotics-diagram mermaid-diagram ${className}`}>
        {title && <h4 style={{ marginTop: 0 }}>{title}</h4>}
        <Mermaid chart={children.trim()} />
      </div>
    );
  }

  // For future custom diagram types
  return (
    <div className={`robotics-diagram diagram ${className}`}>
      {title && <h4 style={{ marginTop: 0 }}>{title}</h4>}
      {children}
    </div>
  );
}