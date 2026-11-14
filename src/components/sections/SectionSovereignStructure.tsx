import React from 'react';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { HairlineGrid } from '@/components/ui/HairlineGrid';
import { PartnerMarquee } from './PartnerMarquee';

export interface DisplayCardData {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const SOVEREIGN_DISPLAY_CARDS: DisplayCardData[] = [
  {
    step: '01',
    title: 'Exclusive Direct Access',
    description:
      'Direct government-accredited liaison across Dubai Economy & Tourism (DED) and premier Free Zones (DIFC, ADGM, DMCC, Meydan). Zero intermediary markups, transparent licensing, and vetted sovereign compliance.',
    icon: (
      <svg
        className="w-5 h-5 text-klay-emerald"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
        />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Institutional Terms & Banking',
    description:
      'Pre-underwritten corporate bank account dossiers guaranteed in tier-1 UAE financial institutions. Multi-currency facilities (AED, USD, EUR) with dedicated relationship management and zero capital freeze.',
    icon: (
      <svg
        className="w-5 h-5 text-klay-emerald"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5m-15 10.5V10.5M3 21h18M4.5 10.5h15"
        />
      </svg>
    ),
  },
];

export interface SectionSovereignStructureProps {
  cards?: DisplayCardData[];
  heading?: string;
  eyebrow?: string;
  className?: string;
}

/**
 * Section 2: 'Where Vision Becomes Sovereign Structure'
 * Architectural light canvas (#FBFBFB / Porcelain Ivory) featuring:
 * - 64px font-weight 400 heading (.display-section)
 * - Two 48px display cards (415px height, #E2E2E2 hairline borders, white background, 01/02 indicators)
 * - 50px/sec draggable accredited partners marquee
 */
export const SectionSovereignStructure: React.FC<SectionSovereignStructureProps> = ({
  cards = SOVEREIGN_DISPLAY_CARDS,
  heading = 'Where Vision Becomes Sovereign Structure',
  eyebrow = 'INSTITUTIONAL FOUNDATION',
  className = '',
}) => {
  return (
    <section
      id="sovereign-structure"
      className={`relative isolate bg-porcelain bg-canvas-light text-[#05131F] pt-20 md:pt-32 pb-16 md:pb-24 overflow-hidden border-b border-[#E2E2E2] ${className}`}
      aria-labelledby="sovereign-structure-heading"
    >
      {/* 4-Column Architectural Drafting-Table Hairlines */}
      <HairlineGrid columns={4} canvas="light" className="opacity-70 pointer-events-none" />

      {/* Section Content Container */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        {/* Eyebrow & Display Section Heading */}
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#05131F]/10 bg-white/80 backdrop-blur-sm mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-klay-emerald animate-pulse" aria-hidden="true" />
            <span className="text-[11px] font-mono tracking-widest text-[#05131F]/70 uppercase">
              {eyebrow}
            </span>
          </div>

          <h2
            id="sovereign-structure-heading"
            className="display-section text-[#05131F] text-balance font-normal"
          >
            {heading}
          </h2>
        </div>

        {/* Two 48px Display Cards (415px Height) with 1px hairline divider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline-light/30 border border-hairline-light/40 relative corner-crosshair-wrap max-w-6xl mx-auto mb-20 md:mb-28">
          <CornerCrosshairs color="text-klay-emerald/40" size={12} />

          {cards.map((card) => (
            <article
              key={card.step}
              className="group relative flex flex-col justify-between h-[415px] p-8 md:p-[36px] bg-white bg-canvas-light-card transition-all duration-300 hover:-translate-y-0.5 hover:border-klay-emerald/40 hover:shadow-[0_16px_40px_rgba(12,45,72,0.06)]"
            >
              {/* Top Row: Icon + Step Indicator */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full border border-klay-emerald/30 bg-klay-emerald/[0.04] flex items-center justify-center transition-colors duration-300 group-hover:border-klay-emerald group-hover:bg-klay-emerald/10">
                  {card.icon}
                </div>
                <span className="font-mono text-sm tracking-widest text-[#05131F]/40 group-hover:text-klay-emerald transition-colors duration-300">
                  {card.step}
                </span>
              </div>

              {/* Bottom Block: 48px Display Heading + Paragraph */}
              <div className="mt-auto">
                <h3 className="display-card text-[#05131F] mb-4 group-hover:text-klay-midnight transition-colors duration-300 font-normal">
                  {card.title}
                </h3>
                <p className="display-body text-[#534F4D] text-sm md:text-base leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Accredited Partners Logo Marquee (Velocity 50px/sec, Draggable on Touch, Pause on Hover) */}
      <div className="relative w-full z-10">
        <PartnerMarquee velocity={50} eyebrowText="ACCREDITED PARTNERS" />
      </div>
    </section>
  );
};

export default SectionSovereignStructure;
