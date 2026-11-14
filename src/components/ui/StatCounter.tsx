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
 * Section 4 Numerical Stat Counter featuring fluid responsive display typography,
 * tabular figures, and fluid IntersectionObserver counter animation that never overflows its container.
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
      className={cn('flex flex-col items-start select-none w-full min-w-0', className)}
    >
      <div className="flex flex-wrap items-baseline font-heading font-normal tracking-tight text-[#05131F] tabular-nums text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl leading-none">
        {prefix && (
          <span className="mr-1 text-2xl sm:text-3xl md:text-3xl lg:text-4xl text-[#22C55E] font-normal">
            {prefix}
          </span>
        )}
        <span className="font-normal">{formattedNumber}</span>
        {suffix && (
          <span className="ml-0.5 text-2xl sm:text-3xl md:text-3xl lg:text-4xl text-[#22C55E] font-normal">
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-4 text-base md:text-lg font-heading font-medium tracking-tight text-[#05131F]/90 leading-snug">
        {label}
      </div>
      {description && (
        <p className="mt-2 text-sm text-[#0C2D48]/70 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatCounter;
