import React from 'react';

/**
 * @param {'matched'|'missing'|'bonus'|'default'|'success'|'warning'|'danger'|'info'} variant
 */
const Badge = ({ children, variant = 'default', dot = false, className = '' }) => {
  const variants = {
    default: 'bg-elevated border border-border text-text-secondary',
    matched: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400',
    missing: 'bg-red-500/10 border border-red-500/25 text-red-400',
    bonus: 'bg-blue-500/10 border border-blue-500/25 text-blue-400',
    success: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400',
    warning: 'bg-amber-500/10 border border-amber-500/25 text-amber-400',
    danger: 'bg-red-500/10 border border-red-500/25 text-red-400',
    info: 'bg-blue-500/10 border border-blue-500/25 text-blue-400',
    accent: 'bg-accent/15 border border-accent/30 text-indigo-300',
    google: 'bg-amber-500/10 border border-amber-500/25 text-amber-400',
    internshala: 'bg-teal-500/10 border border-teal-500/25 text-teal-400',
  };

  const dotColors = {
    default: 'bg-text-muted',
    matched: 'bg-emerald-400',
    missing: 'bg-red-400',
    bonus: 'bg-blue-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    accent: 'bg-indigo-400',
    google: 'bg-amber-400',
    internshala: 'bg-teal-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-2xs px-2 py-0.5 rounded-md ${variants[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;