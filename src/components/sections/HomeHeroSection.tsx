import React, { useRef, useEffect, useState } from 'react';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { RotatingTicker } from '@/components/ui/RotatingTicker';
import { Image } from '@/components/ui/image';
import { IMAGES } from '@/lib/data';
import { ROUTES } from '@/lib/routes';

export interface HomeHeroSectionProps {
  /** Optional override for rotating ticker words */
  tickerWords?: string[];
  /** Optional override for primary headline line 1 */
  leadText?: string;
  /** Optional override for primary headline line 2 */
  subText?: string;
  /** Optional override for CTA destination route */
  ctaRoute?: string;
  /** Optional override for CTA label */
  ctaLabel?: string;
  /** Optional container class overrides */
  className?: string;
}

const DEFAULT_TICKER_WORDS = ['Foreign Ownership', 'Tax Exemption', 'Asset Protection'];

/**
 * 100vh Full-Bleed Cinematic Hero Fold matching Equitify Asset architectural specifications,
 * configured with Klay Consulting's authentic brand colors (Obsidian Dark #05131F & Emerald Green #22C55E).
 */
export const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({
  tickerWords = DEFAULT_TICKER_WORDS,
  leadText = 'We structure sovereign corporate entities and Dubai company formation engineered around your vision.',
  subText = 'Direct institutional banking, Tax Exemption, and Accredited Sovereign advisory. 100% Foreign Ownership with zero friction.',
  ctaRoute = ROUTES.contact,
  ctaLabel = 'START YOUR SETUP',
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only mount and stream video on confirmed desktop viewports (>=768px)
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsDesktop(true);
    }
  }, []);

  useEffect(() => {
    if (isDesktop && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay policy prevented playback; video falls back to poster image gracefully
      });
    }
  }, [isDesktop]);

  return (
    <section
      aria-label="Hero capability showcase"
      className={`relative w-full h-screen min-h-[640px] max-h-[1080px] overflow-hidden bg-[#05131F] text-[#FBFBFB] flex flex-col justify-end border-b border-white/10 ${className}`}
    >
      {/* 1. Cinematic Background Layer: Loop Video on Desktop, High-Res WebP on Mobile */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {isDesktop && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            onPlaying={() => setVideoPlaying(true)}
            className="hidden md:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-85"
            aria-hidden="true"
          >
            <source
              src="/videos/equitify-hero-bg.mp4"
              type="video/mp4"
              media="(min-width: 768px)"
            />
            <source src="/videos/klay-dubai-loop.mp4" type="video/mp4" media="(min-width: 768px)" />
          </video>
        )}
        {/* Preloaded static image fallback for SSR, mobile devices, and instant initial paint */}
        <Image
          src={IMAGES.heroSkyline}
          alt="Dubai architectural waterfront and skyline"
          fill
          priority
          sizes="100vw"
          // This responsive image is also the desktop video fallback. A video poster
          // would download its full-size image even when the video is hidden on phones.
          className={`object-cover opacity-85 ${videoPlaying ? 'md:opacity-20' : ''} filter saturate-50 pointer-events-none -z-10`}
        />
      </div>

      {/* 2. Dark Vignette & Ambient Horizon Glow Overlays */}
      <div
        className="hero-vignette absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-[#05131F] via-[#05131F]/40 to-transparent"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-green-horizon-glow opacity-50 z-[2]"
      />

      {/* 3. Bottom-Left Content Container with generous breathing room above floating dock */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 pb-20 sm:pb-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-12 items-end">
          {/* Column 1: Monospace Eyebrow Badge & Rotating Ticker Display Heading */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#22C55E]/30 bg-[#05131F]/70 backdrop-blur-md mb-6 font-mono">
              <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-mono tracking-wider uppercase text-[#22C55E]">
                SOVEREIGN UAE ADVISORY · DUBAI
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[72px] text-[#FBFBFB] mb-2 font-heading font-normal tracking-[-0.03em] leading-tight flex flex-wrap items-baseline gap-x-3 sm:gap-x-4">
              <span className="sr-only">Shaping Ideas, Transforming Businesses — </span>
              <span className="text-[#FBFBFB] shrink-0">100%</span>
              <RotatingTicker words={tickerWords} />
            </h1>
          </div>

          {/* Column 2: 2-Line Subtitle & Single 50px Emerald Pill CTA */}
          <div className="max-w-xl lg:pb-2">
            <p className="text-base sm:text-lg text-[#FBFBFB]/85 mb-8 max-w-lg leading-relaxed font-normal">
              <span className="block">{leadText}</span>
              <span className="block mt-1 text-[#FBFBFB]/60">{subText}</span>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <EquitifyButton
                to={ctaRoute}
                variant="emerald"
                size="md"
                layout="double-capsule"
                showArrow={true}
                className="EquitifyButton"
                aria-label="Start your UAE company setup with Klay Consultants"
              >
                {ctaLabel}
              </EquitifyButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
