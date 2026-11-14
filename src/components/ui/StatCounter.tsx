import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description?: string;
  durationMs?: number;
  decimals?: number;
  className?: string;
}

/**
 * Section 4 Numerical Stat Counter featuring 96px light display typography,
 * tabular figures, and fluid IntersectionObserver counter animation.
 */
export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  label,
  description,
  durationMs = 1800,
  decimals = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();

          const updateCounter = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / durationMs, 1);
            // Ease out quart: 1 - Math.pow(1 - progress, 4)
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = easeProgress * value;

            setDisplayValue(current);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(updateCounter);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [value, durationMs, hasAnimated]);

  const formattedNumber = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div
      ref={elementRef}
      className={cn('flex flex-col items-start select-none', className)}
    >
      <div className="flex items-baseline font-heading font-normal tracking-normal text-[#05131F] tabular-nums text-5xl md:text-7xl lg:text-8xl leading-none">
        {prefix && <span className="mr-1 text-4xl md:text-6xl text-[#22C55E]">{prefix}</span>}
        <span>{formattedNumber}</span>
        {suffix && <span className="ml-0.5 text-3xl md:text-5xl text-[#22C55E]">{suffix}</span>}
      </div>
      <div className="mt-4 text-base md:text-lg font-heading font-normal tracking-[-0.02em] text-[#05131F]/90">
        {label}
      </div>
      {description && (
        <p className="mt-1 text-xs md:text-sm text-black/60 font-normal leading-relaxed max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
};
