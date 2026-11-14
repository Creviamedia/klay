import React from 'react';
import { CostCalculator } from '@/components/calculator/CostCalculator';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { NumberedAccordion, type AccordionItem } from '@/components/ui/NumberedAccordion';
import { AtmosphericBanner } from '@/components/ui/AtmosphericBanner';
import { ROUTES } from '@/lib/routes';

const CALCULATOR_FAQS: AccordionItem[] = [
  {
    number: '01',
    question: 'How accurate is the Dubai trade license cost estimate?',
    answer:
      'The calculator uses the official 2026 tariff schedules across UAE Mainland (DED) and major Free Zones (Meydan, IFZA, DMCC, RAK ICC). Exact fees are verified with the regulatory authority prior to filing based on your exact commercial activities.',
  },
  {
    number: '02',
    question: 'Does the estimated cost include UAE residency visas?',
    answer:
      'Yes. When you specify investor, partner, or employment visas, the calculation dynamically incorporates entry permits, medical VIP screening, Emirates ID fees, and immigration establishment card allocations.',
  },
  {
    number: '03',
    question: 'Can overseas international investors use this calculator?',
    answer:
      'Yes. The calculator supports both UAE residents and foreign founders worldwide. International investors can incorporate 100% foreign-owned entities remotely without traveling to Dubai for initial trade license issuance.',
  },
  {
    number: '04',
    question: 'Are external regulatory approvals included in the quote?',
    answer:
      'General commercial and consulting activities require zero external approvals. Specialized sectors (healthcare, legal, education, engineering, cryptocurrency) may require approvals from MOHAP, KHDA, or VARA, which our advisory desk pre-screens for you.',
  },
  {
    number: '05',
    question: 'How do I proceed once I receive my estimate?',
    answer:
      'You can submit your calculation directly to receive an official, line-item verified proposal from our senior corporate structuring directors with zero hidden fees.',
  },
];

export default function CostCalculatorPage() {
  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <div className="flex flex-col w-full bg-canvas-light text-text-primary-dark">
      {/* =========================================================================
          HERO & CALCULATOR SECTION: Obsidian Dark Canvas with Green Horizon Glow
          ========================================================================= */}
      <section className="relative isolate min-h-[560px] overflow-hidden bg-canvas-dark text-canvas-light py-16 md:py-24 border-b border-hairline-dark/40">
        {/* Ambient Green Horizon Glow at Baseline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-green-horizon-glow opacity-80 -z-10"
        />

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative corner-crosshair-wrap">
          <CornerCrosshairs color="text-brand-green/60" size={14} />

          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-3">
              INSTANT PRICING TRANSPARENCY
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-medium tracking-tight text-canvas-light leading-[1.08] mb-5">
              Plan Your Setup, <br />
              <span className="text-brand-green">Understand Your True Costs.</span>
            </h1>
            <p className="text-base text-canvas-light/80 font-normal leading-relaxed max-w-2xl mx-auto">
              Calculate exact government fees, trade licensing, shareholder quotas, and visa allocations across Dubai Mainland and Free Zones. Zero hidden markups.
            </p>
          </div>

          {/* Interactive Calculator Shell */}
          <div className="w-full max-w-4xl mx-auto relative corner-crosshair-wrap" id="calculator">
            <CornerCrosshairs color="text-brand-green/70" size={12} />
            <div className="bg-canvas-dark-card/90 border border-hairline-dark/60 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
              <CostCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 3-Step Execution Grid (Equitify Format)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-b border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-navy/60 uppercase mb-3">
              NEXT STEPS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy">
              What Happens After Your Cost Estimate.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#0C2D48]/10 border border-[#0C2D48]/10 relative corner-crosshair-wrap">
            <CornerCrosshairs color="text-[#0C2D48]/40" size={12} />

            <div className="bg-white p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 hover:bg-[#FDFDFD]">
              <div>
                <span className="font-mono text-xs font-bold text-[#0C2D48]/60 block mb-4">
                  PHASE // 01
                </span>
                <h3 className="text-xl font-heading font-semibold text-[#0C2D48] mb-3">
                  Review Structure &amp; Activity
                </h3>
                <p className="text-xs text-[#0C2D48]/70 leading-relaxed">
                  Review your breakdown and verify whether a Free Zone (DMCC, IFZA, Meydan) or Mainland DED structure best fits your trade scope.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0C2D48]/5 text-[11px] font-mono text-[#0C2D48]/40">
                Statutory Activity Mapping
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 hover:bg-[#FDFDFD]">
              <div>
                <span className="font-mono text-xs font-bold text-[#0C2D48]/60 block mb-4">
                  PHASE // 02
                </span>
                <h3 className="text-xl font-heading font-semibold text-[#0C2D48] mb-3">
                  Confirm Banking Eligibility
                </h3>
                <p className="text-xs text-[#0C2D48]/70 leading-relaxed">
                  Our compliance desk pre-screens your business activity to ensure smooth corporate bank account opening with tier-1 UAE banks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0C2D48]/5 text-[11px] font-mono text-[#0C2D48]/40">
                KYC / AML Pre-Clearance
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 hover:bg-[#FDFDFD]">
              <div>
                <span className="font-mono text-xs font-bold text-[#0C2D48]/60 block mb-4">
                  PHASE // 03
                </span>
                <h3 className="text-xl font-heading font-semibold text-[#0C2D48] mb-3">
                  Lock Fixed-Fee Agreement
                </h3>
                <p className="text-xs text-[#0C2D48]/70 leading-relaxed">
                  Receive an itemized official agreement with zero hidden typing or renewal fees. Company formation begins in under 24 hours.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0C2D48]/5 text-[11px] font-mono text-[#0C2D48]/40">
                Direct Sovereign Issuance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Numbered FAQ Accordion (Equitify Format)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-dark text-canvas-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <NumberedAccordion
            items={CALCULATOR_FAQS}
            eyebrow="FREQUENTLY ASKED"
            heading="Cost &amp; Setup Considerations"
            subheading="Clear answers regarding UAE company formation pricing, visa quotas, and banking fees."
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Atmospheric Amber Horizon Glow Banner
          ========================================================================= */}
      <AtmosphericBanner
        eyebrow="READY TO FORM YOUR COMPANY"
        headline="Lock Your 2026 Dubai Setup Package."
        subheadline="Speak directly with an accredited corporate structuring director today."
        ctaText="BOOK CONSULTATION"
        ctaTo={ROUTES.contact}
        glow="amber"
      />
    </div>
  );
}
