import React from 'react';
import Mermaid from '@docusaurus/theme-classic/src/theme/Mermaid';

export default function Diagram({ children, type = 'mermaid', title, className = '' }) {
  if (type === 'mermaid') {
    return (
      <div className={`mermaid-diagram ${className}`} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        {title && <h4>{title}</h4>}
        <Mermaid chart={children.trim()} />
      </div>
    );
  }

  // For future custom diagram types
  return (
    <div className={`diagram ${className}`} style={{ margin: '1rem 0' }}>
      {title && <h4>{title}</h4>}
      {children}
    </div>
  );
}