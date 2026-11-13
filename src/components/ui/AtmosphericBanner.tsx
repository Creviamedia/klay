import React from 'react';
import { CornerCrosshairs } from './CornerCrosshairs';
import { EquitifyButton } from './EquitifyButton';

export interface AtmosphericBannerProps {
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaTo?: string;
  onCtaClick?: () => void;
  className?: string;
  eyebrow?: string;
  glow?: 'green' | 'amber';
}

/**
 * Signature Atmospheric Section Divider matching Equitify Asset's dramatic dark canvas breaks,
 * infused with Klay's Green & Blue and signature Amber Glow lighting.
 */
export const AtmosphericBanner: React.FC<AtmosphericBannerProps> = ({
  headline,
  subheadline,
  ctaText = 'START YOUR SETUP',
  ctaHref,
  ctaTo = '/cost-calculator',
  onCtaClick,
  className = '',
  eyebrow,
  glow = 'green',
}) => {
  return (
    <section
      className={`relative w-full overflow-hidden bg-canvas-dark text-canvas-light py-20 md:py-32 border-y border-hairline-dark/40 ${className}`}
    >
      {/* Ambient Horizon Glow Effect */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-72 md:h-96 opacity-75 ${
          glow === 'amber' ? 'bg-amber-horizon-glow' : 'bg-green-horizon-glow'
        }`}
      />

      {/* Grid crosshairs at outer corners */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative corner-crosshair-wrap">
        <CornerCrosshairs color="text-brand-green/60" size={14} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {eyebrow && (
            <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-4">
              {eyebrow}
            </span>
          )}

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tight text-canvas-light mb-6 leading-tight">
            {headline}
          </h2>

          {subheadline && (
            <p className="text-base md:text-xl text-canvas-light/80 font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}

          {ctaText && (
            <div>
              <EquitifyButton
                size="lg"
                to={ctaTo}
                href={ctaHref}
                onClick={onCtaClick}
                variant={glow === 'amber' ? 'amber' : 'green'}
              >
                {ctaText}
              </EquitifyButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
