import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EquitifyButtonProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'green' | 'primary' | 'dark' | 'amber' | 'blue' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'double-capsule' | 'unified';
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
 * Authentic 50px double-capsule pill CTA matching Equitify Asset's signature design,
 * configured with Klay's authentic brand colors (Emerald #22C55E and Obsidian Dark #05131F).
 */
export const EquitifyButton: React.FC<EquitifyButtonProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  layout = 'double-capsule',
  href,
  to,
  onClick,
  className = '',
  showArrow = true,
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  // Normalize variant aliases for backward compatibility
  const normalizedVariant =
    variant === 'green' || variant === 'primary'
      ? 'emerald'
      : variant === 'blue'
      ? 'dark'
      : variant;

  // Height and padding dimensions
  const heightClass = size === 'sm' ? 'h-[42px]' : size === 'lg' ? 'h-[56px]' : 'h-[50px]';
  const labelPadClass = size === 'sm' ? 'px-4 text-xs' : size === 'lg' ? 'px-8 text-base' : 'px-6 text-[15px]';
  const arrowDimClass = size === 'sm' ? 'w-[42px] h-[42px]' : size === 'lg' ? 'w-[56px] h-[56px]' : 'w-[50px] h-[50px]';
  const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-4 h-4';

  // Variant styling
  const variantStyles = {
    emerald: {
      capsule: 'bg-[#22C55E] text-[#05131F]',
      hover: 'group-hover:brightness-105 group-hover:shadow-[0_0_24px_rgba(34,197,94,0.35)]',
      border: 'border-transparent',
    },
    dark: {
      capsule: 'bg-[#05131F] text-[#FBFBFB]',
      hover: 'group-hover:bg-[#0A1E30] group-hover:border-[#22C55E]/50 group-hover:shadow-[0_0_24px_rgba(34,197,94,0.2)]',
      border: 'border border-white/15',
    },
    amber: {
      capsule: 'bg-[#E8A72E] text-[#05131F]',
      hover: 'group-hover:brightness-105 group-hover:shadow-[0_0_24px_rgba(232,167,46,0.35)]',
      border: 'border-transparent',
    },
    outline: {
      capsule: 'bg-transparent text-current',
      hover: 'group-hover:bg-white/5',
      border: 'border border-current',
    },
    ghost: {
      capsule: 'bg-transparent text-current',
      hover: 'group-hover:text-[#22C55E]',
      border: 'border-transparent',
    },
  }[normalizedVariant] || {
    capsule: 'bg-[#22C55E] text-[#05131F]',
    hover: 'group-hover:brightness-105 group-hover:shadow-[0_0_24px_rgba(34,197,94,0.35)]',
    border: 'border-transparent',
  };

  // Outer container
  const outerClasses = cn(
    'group inline-flex items-center select-none cursor-pointer tracking-[-0.02em] font-normal uppercase leading-none transition-transform duration-200 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2',
    layout === 'double-capsule' ? 'gap-1' : '',
    disabled && 'opacity-40 pointer-events-none cursor-not-allowed',
    className
  );

  // Inner layout
  const innerContent = layout === 'double-capsule' ? (
    <>
      <span
        className={cn(
          heightClass,
          labelPadClass,
          'rounded-full flex items-center justify-center font-normal uppercase tracking-[-0.02em] transition-all duration-300 ease-out flex-1 sm:flex-initial',
          variantStyles.capsule,
          variantStyles.border,
          variantStyles.hover
        )}
      >
        {children}
      </span>
      {showArrow && (
        <span
          aria-hidden="true"
          className={cn(
            arrowDimClass,
            'rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ease-out',
            variantStyles.capsule,
            variantStyles.border,
            variantStyles.hover
          )}
        >
          <ArrowRight
            className={cn(
              iconSizeClass,
              'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 motion-reduce:transform-none'
            )}
          />
        </span>
      )}
    </>
  ) : (
    <span
      className={cn(
        heightClass,
        'px-6 rounded-full flex items-center justify-center gap-3 font-normal uppercase tracking-[-0.02em] transition-all duration-300 ease-out',
        variantStyles.capsule,
        variantStyles.border,
        variantStyles.hover
      )}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          className={cn(
            iconSizeClass,
            'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 motion-reduce:transform-none'
          )}
        />
      )}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={outerClasses} aria-label={ariaLabel} onClick={onClick}>
        {innerContent}
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
        className={outerClasses}
        aria-label={ariaLabel}
        onClick={onClick}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={outerClasses}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {innerContent}
    </button>
  );
};
