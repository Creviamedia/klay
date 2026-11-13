import React from 'react';
import { CornerCrosshairs } from './CornerCrosshairs';

export interface ComparisonRow {
  dimension: string;
  onYourOwn: string;
  withKlay: string;
  icon?: React.ReactNode;
}

export interface ComparisonMatrixProps {
  rows?: ComparisonRow[];
  className?: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
}

const DEFAULT_ROWS: ComparisonRow[] = [
  {
    dimension: 'Ownership Structure',
    onYourOwn: 'Often forced into local sponsorship or complex nominee structures with risk exposure.',
    withKlay: '100% direct sovereign foreign ownership across Mainland & Free Zone jurisdictions.',
  },
  {
    dimension: 'Jurisdiction & Licensing',
    onYourOwn: 'Sorting through 40+ freezones blindly without clarity on tax treaties or banking viability.',
    withKlay: 'Pre-underwritten jurisdiction selection tailored precisely to your banking and trade scope.',
  },
  {
    dimension: 'Setup Turnaround',
    onYourOwn: '4 to 8 weeks navigating fragmented government portals, document rejections, and delays.',
    withKlay: 'Rapid 3 to 5 day VIP processing with direct government liaison channel.',
  },
  {
    dimension: 'Corporate Bank Account',
    onYourOwn: 'Up to 3-6 months with frequent compliance rejections and locked capital.',
    withKlay: 'Guaranteed banker introduction with pre-screened compliance dossier in tier-1 UAE banks.',
  },
  {
    dimension: 'Fee Transparency',
    onYourOwn: 'Hidden government fees, unexpected typing charges, and unpredictable annual renewals.',
    withKlay: 'Single fixed-fee contract. Zero hidden markups. Complete annual renewal transparency.',
  },
  {
    dimension: 'Dedicated Accountability',
    onYourOwn: 'Dealing with uncoordinated third parties, agents, and offshore typists.',
    withKlay: 'One senior corporate advisory director managing your account end-to-end.',
  },
];

/**
 * Institutional Side-by-Side Comparison Matrix ("On Your Own" vs "With Klay")
 * Styled in the Equitify Asset architectural comparison format with Klay champagne tints and gold checkmarks.
 */
export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  rows = DEFAULT_ROWS,
  className = '',
  eyebrow = 'OUR ADVANTAGE',
  heading = 'Why Institutional Clients Choose Klay',
  subheading = 'Most advisory firms treat each stage as a disconnected transaction. We engineer the entire company lifecycle under one sovereign point of contact.',
}) => {
  return (
    <div className={`relative border border-hairline-dark/30 dark:border-hairline-dark bg-canvas-dark text-canvas-light p-6 md:p-12 corner-crosshair-wrap ${className}`}>
      <CornerCrosshairs color="text-brand-green/60" size={12} />

      {/* Section Heading */}
      <div className="max-w-3xl mb-10 md:mb-14">
        {eyebrow && (
          <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-3">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium tracking-tight text-canvas-light mb-4">
          {heading}
        </h2>
        {subheading && (
          <p className="text-sm md:text-base text-canvas-light/70 leading-relaxed">
            {subheading}
          </p>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="border border-hairline-dark/30 divide-y divide-hairline-dark/30 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 bg-canvas-dark-card/80 font-medium text-xs md:text-sm tracking-wider uppercase">
          <div className="p-4 md:col-span-3 text-text-muted-light">Dimension</div>
          <div className="p-4 md:col-span-4 text-text-muted-light/70 border-t md:border-t-0 md:border-l border-hairline-dark/30">
            On Your Own
          </div>
          <div className="p-4 md:col-span-5 bg-brand-green/10 border-t md:border-t-0 md:border-l border-brand-green/30 text-brand-green font-semibold flex items-center justify-between">
            <span>With Klay Consulting</span>
            <span className="text-[10px] font-mono tracking-normal bg-brand-green/20 text-brand-green px-2 py-0.5 rounded-full border border-brand-green/40">
              Institutional
            </span>
          </div>
        </div>

        {/* Table Rows */}
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-12 transition-colors duration-150 hover:bg-canvas-dark-card/30"
          >
            <div className="p-4 md:p-5 md:col-span-3 font-semibold text-sm md:text-base text-canvas-light flex items-center">
              {row.dimension}
            </div>
            <div className="p-4 md:p-5 md:col-span-4 text-sm text-text-muted-light leading-relaxed border-t md:border-t-0 md:border-l border-hairline-dark/20">
              {row.onYourOwn}
            </div>
            <div className="p-4 md:p-5 md:col-span-5 bg-brand-green/[0.06] text-sm text-canvas-light leading-relaxed border-t md:border-t-0 md:border-l border-brand-green/25 font-medium flex items-start gap-3">
              <span className="text-brand-green font-bold text-base mt-0.5 flex-shrink-0" aria-hidden="true">
                ✓
              </span>
              <span>{row.withKlay}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
