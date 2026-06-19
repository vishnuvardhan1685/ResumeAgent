import React from 'react';
import Spinner from './Spinner';

/**
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:opacity-40 disabled:pointer-events-none rounded-lg select-none';

  const variants = {
    primary:
      'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 active:scale-[0.98]',
    secondary:
      'bg-elevated border border-border hover:bg-hover hover:border-border-active text-text-primary active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-elevated text-text-secondary hover:text-text-primary',
    danger:
      'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 h-7',
    md: 'text-sm px-4 py-2 h-9',
    lg: 'text-sm px-5 py-2.5 h-10',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 12 : 14} />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;