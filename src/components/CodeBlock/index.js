import React from 'react';
import CodeBlock from '@theme/CodeBlock';

export default function CustomCodeBlock({ children, language, title, showLineNumbers = true, ...props }) {
  return (
    <div style={{ margin: '1rem 0' }}>
      {title && <h4 style={{ margin: '0 0 0.5rem 0' }}>{title}</h4>}
      <CodeBlock
        children={children}
        language={language}
        showLineNumbers={showLineNumbers}
        {...props}
      />
    </div>
  );
}