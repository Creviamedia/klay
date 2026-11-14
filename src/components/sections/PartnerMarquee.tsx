import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface PartnerLogo {
  id: string;
  name: string;
  category: 'Free Zone' | 'Mainland' | 'Banking' | 'Offshore';
  svg: React.ReactNode;
}

export const PARTNER_LOGOS: PartnerLogo[] = [
  {
    id: 'meydan',
    name: 'Meydan Free Zone',
    category: 'Free Zone',
    svg: (
      <svg
        viewBox="0 0 180 44"
        fill="currentColor"
        className="h-8 w-auto max-w-[150px] transition-transform duration-300"
        aria-label="Meydan Free Zone Dubai Logo"
      >
        <g transform="translate(4, 4)">
          <path d="M 0 32 L 6 8 L 14 26 L 22 8 L 28 32 L 22 32 L 18 16 L 14 26 L 10 16 L 6 32 Z" />
          <path d="M 28 8 L 34 32 L 31 32 L 26 12 Z" opacity="0.6" />
        </g>
        <text
          x="44"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fontWeight="700"
          letterSpacing="0.12em"
        >
          MEYDAN
        </text>
        <text
          x="44"
          y="33"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="7.5"
          fontWeight="500"
          letterSpacing="0.16em"
          opacity="0.65"
        >
          FREE ZONE · DUBAI
        </text>
      </svg>
    ),
  },
  {
    id: 'ifza',
    name: 'IFZA Dubai',
    category: 'Free Zone',
    svg: (
      <svg
        viewBox="0 0 170 44"
        fill="currentColor"
        className="h-8 w-auto max-w-[145px] transition-transform duration-300"
        aria-label="IFZA Dubai Logo"
      >
        <g transform="translate(6, 6)">
          <rect x="0" y="0" width="7" height="30" rx="1.5" />
          <rect x="11" y="0" width="7" height="18" rx="1.5" />
          <rect x="11" y="22" width="7" height="8" rx="1.5" />
          <rect x="22" y="0" width="7" height="30" rx="1.5" />
        </g>
        <text
          x="44"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="17"
          fontWeight="800"
          letterSpacing="0.08em"
        >
          IFZA
        </text>
        <text
          x="44"
          y="33"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="7.5"
          fontWeight="600"
          letterSpacing="0.22em"
          opacity="0.65"
        >
          DUBAI
        </text>
      </svg>
    ),
  },
  {
    id: 'dmcc',
    name: 'DMCC',
    category: 'Free Zone',
    svg: (
      <svg
        viewBox="0 0 175 44"
        fill="currentColor"
        className="h-8 w-auto max-w-[150px] transition-transform duration-300"
        aria-label="DMCC Dubai Multi Commodities Centre Logo"
      >
        <g transform="translate(4, 6)">
          <polygon points="14,0 28,14 14,28 0,14" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <polygon points="14,6 22,14 14,22 6,14" />
        </g>
        <text
          x="40"
          y="22"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="16"
          fontWeight="800"
          letterSpacing="0.1em"
        >
          DMCC
        </text>
        <text
          x="40"
          y="33"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.8"
          fontWeight="500"
          letterSpacing="0.12em"
          opacity="0.65"
        >
          GOVERNMENT OF DUBAI
        </text>
      </svg>
    ),
  },
  {
    id: 'rak-icc',
    name: 'RAK ICC',
    category: 'Offshore',
    svg: (
      <svg
        viewBox="0 0 180 44"
        fill="currentColor"
        className="h-8 w-auto max-w-[150px] transition-transform duration-300"
        aria-label="RAK ICC Offshore Logo"
      >
        <g transform="translate(4, 5)">
          <path
            d="M 14 0 L 28 6 L 28 18 C 28 26 14 32 14 32 C 14 32 0 26 0 18 L 0 6 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M 8 16 L 14 8 L 20 16 Z" />
          <rect x="12" y="18" width="4" height="6" />
        </g>
        <text
          x="38"
          y="21"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14.5"
          fontWeight="700"
          letterSpacing="0.08em"
        >
          RAK ICC
        </text>
        <text
          x="38"
          y="32"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.8"
          fontWeight="500"
          letterSpacing="0.12em"
          opacity="0.65"
        >
          GOV. OF RAS AL KHAIMAH
        </text>
      </svg>
    ),
  },
  {
    id: 'ded',
    name: 'Dubai Economy & Tourism (DET / DED)',
    category: 'Mainland',
    svg: (
      <svg
        viewBox="0 0 190 44"
        fill="currentColor"
        className="h-8 w-auto max-w-[160px] transition-transform duration-300"
        aria-label="Dubai Economy & Tourism Logo"
      >
        <g transform="translate(4, 5)">
          <circle cx="15" cy="15" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 8 15 C 8 11 11 8 15 8 C 19 8 22 11 22 15 C 22 19 19 22 15 22 Z" />
          <circle cx="15" cy="15" r="3" fill="#FBFBFB" />
        </g>
        <text
          x="38"
          y="21"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="13"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          DUBAI ECONOMY
        </text>
        <text
          x="38"
          y="32"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="7"
          fontWeight="600"
          letterSpacing="0.14em"
          opacity="0.65"
        >
          &amp; TOURISM · DED
        </text>
      </svg>
    ),
  },
  {
    id: 'emirates-nbd',
    name: 'Emirates NBD',
    category: 'Banking',
    svg: (
      <svg
        viewBox="0 0 195 44"
        fill="currentColor"
        className="h-8 w-auto max-w-[165px] transition-transform duration-300"
        aria-label="Emirates NBD Bank Logo"
      >
        <g transform="translate(4, 6)">
          <polygon points="0,0 8,0 18,14 8,28 0,28 10,14" />
          <polygon points="12,0 20,0 30,14 20,28 12,28 22,14" opacity="0.6" />
        </g>
        <text
          x="42"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.04em"
        >
          Emirates NBD
        </text>
        <text
          x="42"
          y="33"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.8"
          fontWeight="500"
          letterSpacing="0.14em"
          opacity="0.65"
        >
          INSTITUTIONAL BANKING
        </text>
      </svg>
    ),
  },
  {
    id: 'mashreq',
    name: 'Mashreq Bank',
    category: 'Banking',
    svg: (
      <svg
        viewBox="0 0 175 44"
        fill="currentColor"
        className="h-8 w-auto max-w-[150px] transition-transform duration-300"
        aria-label="Mashreq Bank Logo"
      >
        <g transform="translate(6, 6)">
          <path
            d="M 0 28 C 14 28 26 16 26 0 C 18 10 10 18 0 20 Z"
            fill="currentColor"
          />
          <circle cx="18" cy="8" r="4" fill="currentColor" opacity="0.8" />
        </g>
        <text
          x="40"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="16"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          mashreq
        </text>
        <text
          x="40"
          y="33"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="7"
          fontWeight="500"
          letterSpacing="0.16em"
          opacity="0.65"
        >
          بنك المشرق · BANK
        </text>
      </svg>
    ),
  },
  {
    id: 'wio',
    name: 'Wio Bank',
    category: 'Banking',
    svg: (
      <svg
        viewBox="0 0 160 44"
        fill="currentColor"
        className="h-8 w-auto max-w-[135px] transition-transform duration-300"
        aria-label="Wio Bank Logo"
      >
        <g transform="translate(6, 7)">
          <path d="M 0 6 L 4 22 L 9 8 L 14 22 L 18 6 L 22 6 L 16 26 L 12 26 L 9 14 L 6 26 L 0 26 Z" />
          <circle cx="27" cy="4" r="2.5" />
          <rect x="25" y="9" width="4" height="17" rx="1" />
          <ellipse cx="40" cy="17" rx="7" ry="8.5" fill="none" stroke="currentColor" strokeWidth="3.5" />
        </g>
        <text
          x="62"
          y="25"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.18em"
          opacity="0.75"
        >
          BANK
        </text>
      </svg>
    ),
  },
];

export interface PartnerMarqueeProps {
  logos?: PartnerLogo[];
  velocity?: number; // pixels per second (default: 50)
  eyebrowText?: string;
  className?: string;
}

/**
 * Accredited Partners Logo Marquee matching Equitify Asset Section 2 architecture:
 * - Velocity: 50px/sec right-to-left
 * - Pause on hover
 * - Draggable on touch / pointer with pointer capture
 * - Monochromatic partner SVGs with hairline borders
 * - Accessible and SSR-safe for SSG pre-rendering
 */
export const PartnerMarquee: React.FC<PartnerMarqueeProps> = ({
  logos = PARTNER_LOGOS,
  velocity = 50,
  eyebrowText = 'ACCREDITED PARTNERS',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Offset tracking for seamless infinite loop and drag
  const offsetRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const startDragXRef = useRef<number>(0);
  const startDragOffsetRef = useRef<number>(0);
  const singleSetWidthRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Measure single track width
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const firstChild = trackRef.current.children[0] as HTMLElement | undefined;
    if (firstChild) {
      singleSetWidthRef.current = firstChild.offsetWidth;
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics]);

  // RequestAnimationFrame smooth tick loop
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const tick = (time: number) => {
      if (lastTimeRef.current !== null && !isPaused && !isDragging) {
        const delta = (time - lastTimeRef.current) / 1000;
        const move = velocity * delta;
        offsetRef.current -= move;

        const setWidth = singleSetWidthRef.current;
        if (setWidth > 0 && Math.abs(offsetRef.current) >= setWidth) {
          offsetRef.current += setWidth;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }
      lastTimeRef.current = time;
      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [velocity, isPaused, isDragging]);

  // Pointer / Touch drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startDragXRef.current = e.clientX;
    startDragOffsetRef.current = offsetRef.current;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startDragXRef.current;
    let nextOffset = startDragOffsetRef.current + deltaX;

    const setWidth = singleSetWidthRef.current;
    if (setWidth > 0) {
      if (nextOffset > 0) {
        nextOffset -= setWidth;
      } else if (nextOffset < -setWidth) {
        nextOffset += setWidth;
      }
    }

    offsetRef.current = nextOffset;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${nextOffset}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full border-y border-[#E2E2E2] bg-porcelain bg-[#FBFBFB] flex items-stretch overflow-hidden select-none',
        'h-[100px] md:h-[115px]',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Accredited banking and free zone partners marquee"
    >
      {/* Fixed Eyebrow Column on Left */}
      <div className="shrink-0 w-auto md:w-[213px] border-r border-[#E2E2E2] flex items-center justify-center px-4 md:px-6 bg-porcelain z-10">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full bg-klay-emerald animate-pulse shrink-0"
            aria-hidden="true"
          />
          <span className="text-[11px] md:text-[13px] font-mono uppercase tracking-[0.12em] text-[#05131F]/70 font-semibold whitespace-nowrap">
            {eyebrowText}
          </span>
        </div>
      </div>

      {/* Draggable Marquee Viewport */}
      <div
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className="flex flex-row flex-nowrap will-change-transform h-full items-stretch"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          {/* Repeat copies for seamless continuous wrapping */}
          {[0, 1, 2].map((copyIndex) => (
            <div
              key={copyIndex}
              aria-hidden={copyIndex > 0 ? true : undefined}
              className="flex flex-row shrink-0 h-full items-stretch"
            >
              {logos.map((logo) => (
                <div
                  key={`${copyIndex}-${logo.id}`}
                  className="w-[180px] sm:w-[200px] md:w-[220px] h-full shrink-0 border-r border-[#E2E2E2] flex flex-col items-center justify-center px-6 py-4 text-[#05131F] grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:text-klay-midnight transition-all duration-300"
                  title={logo.name}
                >
                  {logo.svg}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerMarquee;
