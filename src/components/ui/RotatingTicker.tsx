import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface RotatingTickerProps {
  /**
   * The list of sovereign value phrases to cycle through.
   * Default: ['100% Foreign Ownership', 'Tax Exemption', 'Asset Protection']
   */
  phrases?: string[];

  /**
   * Optional static prefix rendered immediately before the rotating ticker.
   */
  prefix?: string;

  /**
   * Overall cycle interval in milliseconds between phrase transitions.
   * Equitify Staggered Cycle default: 2750ms (2.75s)
   */
  cycleInterval?: number;

  /**
   * Transition duration for each character roll in seconds.
   * Equitify Staggered Cycle default: 1.375s (cycleSpeed / 2)
   */
  transitionDuration?: number;

  /**
   * Stagger delay factor across characters (0.0 to 1.0).
   * Equitify Staggered Cycle default: 0.5
   */
  staggerFactor?: number;

  /**
   * Custom cubic-bezier easing curve tuple.
   * Equitify Staggered Cycle default: [0.11, 0.72, 0, 1]
   */
  easing?: [number, number, number, number];

  /**
   * Semantic HTML tag to render.
   * Default: 'span'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';

  /**
   * Additional CSS classes.
   */
  className?: string;

  /**
   * Whether to pause animation on mouse hover.
   * Default: false
   */
  pauseOnHover?: boolean;
}

const DEFAULT_PHRASES: string[] = [
  '100% Foreign Ownership',
  'Tax Exemption',
  'Asset Protection',
];

const EQUITIFY_EASING: [number, number, number, number] = [0.11, 0.72, 0, 1];
const EQUITIFY_CYCLE_SPEED = 2.75; // 2.75s
const EQUITIFY_DURATION = EQUITIFY_CYCLE_SPEED / 2; // 1.375s
const EQUITIFY_STAGGER = 0.5;

interface WordGroup {
  text: string;
  chars: {
    char: string;
    originalIndex: number;
  }[];
}

/**
 * Animated Rotating Value Ticker matching Equitify Asset Staggered Cycle architecture:
 * - 78.88px light display typography (.display-hero, font-weight 400, -0.03em tracking)
 * - Cycle speed: 2.75s, Character duration: 1.375s, Stagger factor: 0.5
 * - Easing: cubic-bezier(0.11, 0.72, 0, 1)
 * - Static SSR render with initial={false} to ensure valid pre-rendering and hydration
 * - Invisible sizer element ensuring zero Cumulative Layout Shift (CLS = 0)
 * - Accessible: aria-live, aria-atomic, screen reader announcements, prefers-reduced-motion
 */
export function RotatingTicker({
  phrases = DEFAULT_PHRASES,
  prefix,
  cycleInterval = 2750,
  transitionDuration = EQUITIFY_DURATION,
  staggerFactor = EQUITIFY_STAGGER,
  easing = EQUITIFY_EASING,
  as: Component = 'span',
  className,
  pauseOnHover = false,
  ...rest
}: RotatingTickerProps & React.HTMLAttributes<HTMLElement>) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  const currentPhrase = phrases[currentIndex] || '';

  // Calculate the longest phrase to render an invisible sizer that locks dimensions
  // and completely eliminates layout shift (CLS = 0)
  const longestPhrase = useMemo(() => {
    return phrases.reduce((longest, current) => {
      return current.length > longest.length ? current : longest;
    }, phrases[0] || '');
  }, [phrases]);

  const longestWords = useMemo(() => {
    return longestPhrase.split(' ');
  }, [longestPhrase]);

  // Group characters by word to preserve natural word wrapping at responsive breakpoints
  const words = useMemo<WordGroup[]>(() => {
    let charCounter = 0;
    return currentPhrase.split(' ').map((wordText) => ({
      text: wordText,
      chars: wordText.split('').map((c) => ({
        char: c,
        originalIndex: charCounter++,
      })),
    }));
  }, [currentPhrase]);

  const totalChars = words.reduce((acc, w) => acc + w.chars.length, 0);

  // Interval timer for cycling phrases with visibility & pause handling
  useEffect(() => {
    if (shouldReduceMotion || phrases.length <= 1) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!isPaused) {
          setIsInitial(false);
          setCurrentIndex((prev) => (prev + 1) % phrases.length);
        }
      }, cycleInterval);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timer) clearInterval(timer);
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [phrases.length, cycleInterval, shouldReduceMotion, isPaused]);

  return (
    <Component
      className={cn(
        'display-hero relative inline-block text-porcelain text-canvas-light text-left select-none',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
      {...rest}
    >
      {/* Accessible screen-reader announcement of the complete phrase */}
      <span className="sr-only">
        {prefix ? `${prefix} ${currentPhrase}` : currentPhrase}
      </span>

      {/* Optional static prefix */}
      {prefix && (
        <span aria-hidden="true" className="inline-block mr-[0.25em]">
          {prefix}
        </span>
      )}

      {/* Invisible sizer element: reserves maximum intrinsic space to guarantee zero CLS */}
      <span
        aria-hidden="true"
        className="pointer-events-none opacity-0 select-none inline-flex flex-wrap gap-x-[0.25em]"
      >
        {longestWords.map((word, idx) => (
          <span key={idx} className="inline-flex">
            {word}
          </span>
        ))}
      </span>

      {/* Active animated character roll-up layer */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 w-full inline-flex flex-wrap gap-x-[0.25em]"
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.span
            key={currentPhrase}
            className="inline-flex flex-wrap gap-x-[0.25em]"
          >
            {words.map((w, wIdx) => (
              <span
                key={wIdx}
                className="inline-flex overflow-hidden leading-none"
              >
                {w.chars.map(({ char, originalIndex }) => {
                  const i = totalChars > 1 ? originalIndex / (totalChars - 1) : 0;
                  const cycleSpeed = transitionDuration * 2;

                  return (
                    <motion.span
                      key={originalIndex}
                      className="inline-block"
                      variants={
                        shouldReduceMotion
                          ? undefined
                          : {
                              initial: {
                                transform: 'translate(0px, 150%)',
                                transition: {
                                  ease: easing,
                                  duration: transitionDuration,
                                  delay: cycleSpeed * 0.3 * i * staggerFactor,
                                },
                              },
                              animate: {
                                transform: 'translate(0px, 0px)',
                                transition: {
                                  ease: easing,
                                  duration: transitionDuration,
                                  delay: cycleSpeed * 0.4 * i * staggerFactor,
                                },
                              },
                              exit: {
                                transform: 'translate(0px, -150%)',
                                transition: {
                                  ease: easing,
                                  duration: transitionDuration,
                                  delay: cycleSpeed * 0.3 * i * staggerFactor,
                                },
                              },
                            }
                      }
                      initial={!isInitial ? 'initial' : false}
                      animate={!isInitial ? 'animate' : false}
                      exit="exit"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </Component>
  );
}

export default RotatingTicker;
