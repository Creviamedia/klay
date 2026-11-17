import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface RotatingTickerProps {
  /**
   * Value phrases or words to cycle through.
   * Default: ['Foreign Ownership', 'Tax Exemption', 'Asset Protection']
   */
  phrases?: string[];
  words?: string[];

  /**
   * Optional static prefix rendered immediately before the rotating ticker.
   */
  prefix?: string;

  /**
   * Cycle interval in milliseconds between transitions.
   * Default: 2800ms
   */
  cycleInterval?: number;

  /**
   * Semantic HTML tag. Default: 'span'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';

  /**
   * Additional CSS classes.
   */
  className?: string;
}

const DEFAULT_ITEMS = ['Foreign Ownership', 'Tax Exemption', 'Asset Protection'];

/**
 * Precision Rotating Value Ticker matching Equitify Asset Staggered Cycle architecture:
 * - Fluid baseline alignment with static prefix
 * - Smooth vertical slide transition with zero Cumulative Layout Shift
 * - Character/word-level overflow containment preventing awkward flight paths
 * - Powered by CSS compositor animations: eliminates Framer Motion from critical above-the-fold path.
 */
export function RotatingTicker({
  phrases,
  words,
  prefix,
  cycleInterval = 2800,
  as: Component = 'span',
  className,
}: RotatingTickerProps) {
  const items = words || phrases || DEFAULT_ITEMS;
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)', false);

  useEffect(() => {
    if (shouldReduceMotion || items.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, cycleInterval);

    return () => clearInterval(interval);
  }, [items.length, cycleInterval, shouldReduceMotion]);

  const currentItem = items[index] || items[0];

  return (
    <Component
      className={cn(
        'relative inline-flex items-baseline align-baseline select-none overflow-hidden',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Screen-reader full sentence announcement */}
      <span className="sr-only">{prefix ? `${prefix} ${currentItem}` : currentItem}</span>

      {/* Optional static prefix */}
      {prefix && (
        <span aria-hidden="true" className="mr-[0.25em] whitespace-nowrap">
          {prefix}
        </span>
      )}

      {/* Sizer containing the longest string invisibly to lock container dimensions */}
      <span
        aria-hidden="true"
        className="invisible pointer-events-none opacity-0 select-none whitespace-nowrap"
      >
        {items.reduce((longest, curr) => (curr.length > longest.length ? curr : longest), items[0])}
      </span>

      {/* Animated smooth vertical slide layer (Pure CSS GPU-accelerated) */}
      <span aria-hidden="true" className="absolute inset-0 flex items-center overflow-hidden">
        <span
          key={index}
          className={cn(
            'inline-block whitespace-nowrap text-[#FBFBFB] font-heading font-normal',
            shouldReduceMotion ? 'transition-opacity duration-300' : 'animate-ticker-slide'
          )}
        >
          {currentItem}
        </span>
      </span>
    </Component>
  );
}

export default RotatingTicker;
