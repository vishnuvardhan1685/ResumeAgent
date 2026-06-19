import React from 'react';

export const Tabs = ({ tabs, active, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-border ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150
            border-b-2 -mb-px focus-visible:outline-none
            ${
              active === tab.id
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }
          `}
        >
          {tab.icon && <span className="text-base">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`text-2xs px-1.5 py-0.5 rounded font-mono ${
                active === tab.id
                  ? 'bg-accent/20 text-indigo-300'
                  : 'bg-elevated text-text-muted'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;