import React from 'react';

const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    {icon && (
      <div className="w-14 h-14 rounded-2xl bg-elevated border border-border flex items-center justify-center text-text-muted mb-4">
        {icon}
      </div>
    )}
    <p className="text-base font-medium text-text-primary mb-1">{title}</p>
    {description && (
      <p className="text-sm text-text-secondary max-w-xs leading-relaxed">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;