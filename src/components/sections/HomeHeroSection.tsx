import React from 'react';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { RotatingTicker } from '@/components/ui/RotatingTicker';
import { Image } from '@/components/ui/image';
import { IMAGES } from '@/lib/data';
import { ROUTES } from '@/lib/routes';

export interface HomeHeroSectionProps {
  /** Optional override for rotating ticker phrases */
  tickerPhrases?: string[];
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

const DEFAULT_TICKER_PHRASES = [
  '100% Foreign Ownership',
  'Tax Exemption',
  'Asset Protection',
];

/**
 * 100vh Full-Bleed Cinematic Hero Fold matching Equitify Asset architectural specifications,
 * configured with Klay Consulting's authentic brand colors (Obsidian Dark #05131F & Emerald Green #22C55E).
 */
export const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({
  tickerPhrases = DEFAULT_TICKER_PHRASES,
  leadText = 'We structure sovereign corporate entities and Dubai company formation engineered around your vision.',
  subText = 'Direct institutional banking, Tax Exemption, and Accredited Sovereign advisory. 100% Foreign Ownership with zero friction.',
  ctaRoute = ROUTES.contact,
  ctaLabel = 'START YOUR SETUP',
  className = '',
}) => {
  return (
    <section
      aria-label="Hero capability showcase"
      className={`relative w-full h-screen min-h-[640px] max-h-[1080px] overflow-hidden bg-obsidian bg-canvas-dark text-porcelain text-canvas-light flex flex-col justify-end border-b border-hairline-dark/40 ${className}`}
    >
      {/* 1. Cinematic Background Layer: Loop Video with Poster Image Fallback */}
      <div className="absolute inset-0 pointer-events-none select-none -z-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={IMAGES.heroSkyline}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none -z-20"
          aria-hidden="true"
        >
          <source src="/videos/klay-dubai-loop.mp4" type="video/mp4" />
        </video>
        {/* Preloaded static image fallback for SSR and instant initial paint */}
        <Image
          src={IMAGES.heroSkyline}
          alt="Dubai architectural waterfront and skyline"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25 filter saturate-50 pointer-events-none -z-30"
        />
      </div>

      {/* 2. Dark Vignette & Ambient Horizon Glow Overlays */}
      <div className="hero-vignette absolute inset-0 z-[1] pointer-events-none" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-green-horizon-glow opacity-60 z-[2]"
      />

      {/* 3. Bottom-Left Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-16 items-end">
          {/* Column 1: Monospace Eyebrow Badge & Rotating Ticker Display Heading */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-klay-emerald/30 bg-obsidian-card/60 backdrop-blur-md mb-6 font-mono">
              <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
              <span className="text-xs font-mono tracking-wider uppercase text-brand-green">
                SOVEREIGN UAE ADVISORY · DUBAI
              </span>
            </div>

            <h1 className="display-hero text-porcelain mb-2 font-display font-normal">
              <span className="sr-only">Shaping Ideas, Transforming Businesses — </span>
              <RotatingTicker phrases={tickerPhrases} />
            </h1>
          </div>

          {/* Column 2: 2-Line Subtitle & Single 50px Emerald Pill CTA */}
          <div className="max-w-xl lg:pb-2">
            <p className="display-body text-porcelain/85 mb-8 max-w-lg leading-relaxed font-normal">
              <span className="block">{leadText}</span>
              <span className="block mt-1 text-porcelain/60">{subText}</span>
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
