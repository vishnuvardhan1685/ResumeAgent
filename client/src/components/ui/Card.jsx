import React from 'react';

const Card = ({ children, className = '', hover = false, active = false, ...props }) => {
  return (
    <div
      className={`
        bg-surface border rounded-xl transition-all duration-150
        ${hover ? 'hover:border-border-active hover:bg-elevated cursor-pointer' : ''}
        ${active ? 'border-border-active bg-elevated' : 'border-border'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-b border-border ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

export default Card;