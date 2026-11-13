import React from 'react';
import { Link } from 'react-router-dom';

export interface EquitifyButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'green' | 'amber' | 'blue' | 'dark' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  to?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  showArrow?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

/**
 * High-contrast 50px full-pill CTA button matching Equitify Asset's signature design,
 * configured with Klay's authentic vibrant Green (#22C55E) and Midnight Blue (#0C2D48).
 */
export const EquitifyButton: React.FC<EquitifyButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  className = '',
  showArrow = true,
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  const sizeClasses = {
    sm: 'text-xs py-2 px-4 gap-2',
    md: 'text-sm py-2.5 px-6 gap-3',
    lg: 'text-base py-3.5 px-8 gap-3.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-brand-green hover:bg-brand-green-hover text-brand-navy-deep font-semibold shadow-green-glow',
    green:
      'bg-brand-green hover:bg-brand-green-hover text-brand-navy-deep font-semibold shadow-green-glow',
    amber:
      'bg-accent-amber hover:bg-accent-amber-hover text-brand-navy-deep font-semibold shadow-amber-glow',
    blue:
      'bg-brand-navy hover:bg-brand-navy-surface text-canvas-light border border-brand-green/40 shadow-green-glow font-medium',
    dark:
      'bg-canvas-dark border border-brand-green/40 text-canvas-light hover:border-brand-green shadow-green-glow font-medium',
    outline:
      'bg-transparent border border-brand-navy/30 dark:border-brand-green/40 text-brand-navy dark:text-canvas-light hover:border-brand-green font-medium',
    ghost:
      'bg-transparent text-brand-navy dark:text-canvas-light hover:text-brand-green font-medium',
  }[variant];

  const baseClasses = `group inline-flex items-center justify-center rounded-full tracking-tight transition-transform duration-200 ease-out active:scale-95 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-brand-green focus-visible:outline-offset-2 motion-reduce:transform-none select-none ${sizeClasses} ${variantClasses} ${
    disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'cursor-pointer'
  } ${className}`;

  const content = (
    <>
      <span className="font-semibold uppercase tracking-wider text-xs md:text-sm">{children}</span>
      {showArrow && (
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-navy-deep/20 dark:bg-canvas-light/20 text-current transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transform-none"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses} aria-label={ariaLabel} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (href) {
    const isExternal =
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('https://wa.me');
    return (
      <a
        href={href}
        className={baseClasses}
        aria-label={ariaLabel}
        onClick={onClick}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
