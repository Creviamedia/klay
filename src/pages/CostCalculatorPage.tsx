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
  return (
    <div className="flex flex-col w-full bg-[#FBFBFB] text-[#0C2D48] pb-24 md:pb-28">
      {/* =========================================================================
          HERO & CALCULATOR SECTION: Porcelain Light Executive Canvas
          ========================================================================= */}
      <section className="relative isolate overflow-hidden bg-[#FAFBFD] py-16 md:py-20 border-b border-[#0C2D48]/10">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative corner-crosshair-wrap">
          <CornerCrosshairs color="text-[#22C55E]/60" size={14} />

          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="inline-block text-xs font-mono tracking-widest text-[#16A34A] uppercase mb-3 bg-[#22C55E]/10 px-3 py-1 rounded-full font-semibold">
              INSTANT PRICING TRANSPARENCY · 2026 TARIFFS
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-semibold tracking-tight text-[#0C2D48] leading-[1.08] mb-4">
              Plan Your Setup, <br />
              <span className="text-[#16A34A]">Understand Your True Costs.</span>
            </h1>
            <p className="text-base text-[#0C2D48]/75 font-normal leading-relaxed max-w-2xl mx-auto">
              Calculate exact government fees, trade licensing, shareholder quotas, and visa allocations across Dubai Mainland and Free Zones. Zero hidden markups.
            </p>
          </div>

          {/* Interactive Calculator Shell (One-Fold Friendly) */}
          <div className="w-full max-w-6xl mx-auto relative corner-crosshair-wrap" id="calculator">
            <CornerCrosshairs color="text-[#0C2D48]/30" size={12} />
            <CostCalculator />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 3-Step Execution Grid (Equitify Format)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-white text-[#0C2D48] border-b border-[#0C2D48]/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="inline-block text-xs font-mono tracking-widest text-[#0C2D48]/60 uppercase mb-3">
              NEXT STEPS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-[#0C2D48]">
              What Happens After Your Cost Estimate.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#0C2D48]/10 border border-[#0C2D48]/10 relative corner-crosshair-wrap">
            <CornerCrosshairs color="text-[#0C2D48]/40" size={12} />

            <div className="bg-white p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 hover:bg-[#FAFBFD]">
              <div>
                <span className="font-mono text-xs font-bold text-[#0C2D48]/60 block mb-4">
                  PHASE // 01
                </span>
                <h3 className="text-xl font-heading font-semibold text-[#0C2D48] mb-3">
                  Scope &amp; Activity Verification
                </h3>
                <p className="text-sm text-[#0C2D48]/75 leading-relaxed mb-6">
                  Our regulatory desk reviews your target business activities against the official Department of Economy (DED) or Free Zone activity lists to ensure 100% compliance.
                </p>
              </div>
              <div className="pt-4 border-t border-[#0C2D48]/10 font-mono text-xs text-[#0C2D48]/50">
                TIMEFRAME: 2–4 HOURS
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 hover:bg-[#FAFBFD]">
              <div>
                <span className="font-mono text-xs font-bold text-[#0C2D48]/60 block mb-4">
                  PHASE // 02
                </span>
                <h3 className="text-xl font-heading font-semibold text-[#0C2D48] mb-3">
                  Name Reservation &amp; Security Clearance
                </h3>
                <p className="text-sm text-[#0C2D48]/75 leading-relaxed mb-6">
                  We submit your trade name for initial approval, prepare founding resolutions, and complete digital identity verification without requiring your physical presence.
                </p>
              </div>
              <div className="pt-4 border-t border-[#0C2D48]/10 font-mono text-xs text-[#0C2D48]/50">
                TIMEFRAME: 24–48 HOURS
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 hover:bg-[#FAFBFD]">
              <div>
                <span className="font-mono text-xs font-bold text-[#0C2D48]/60 block mb-4">
                  PHASE // 03
                </span>
                <h3 className="text-xl font-heading font-semibold text-[#0C2D48] mb-3">
                  License Issuance &amp; Bank Account
                </h3>
                <p className="text-sm text-[#0C2D48]/75 leading-relaxed mb-6">
                  Your commercial trade license is issued. We immediately dispatch your pre-cleared compliance dossier to tier-1 UAE banks (Emirates NBD, Wio, Mashreq) for rapid activation.
                </p>
              </div>
              <div className="pt-4 border-t border-[#0C2D48]/10 font-mono text-xs text-[#0C2D48]/50">
                TIMEFRAME: 3–5 BUSINESS DAYS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Calculator FAQs (Accordion)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-[#FAFBFD] text-[#0C2D48] border-b border-[#0C2D48]/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <NumberedAccordion
            items={CALCULATOR_FAQS}
            eyebrow="TRANSPARENT ANSWERS"
            heading="Frequently Asked Cost Questions"
            subheading="Clear details regarding statutory licensing, residency fees, and ongoing maintenance."
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Pre-Footer Banner
          ========================================================================= */}
      <AtmosphericBanner
        eyebrow="READY TO FORM?"
        headline="Lock In Your 2026 Sovereign Pricing Today."
        subheadline="Speak directly with our senior corporate structuring directors to receive your binding itemized proposal."
        ctaText="SCHEDULE CONSULTATION"
        ctaTo={ROUTES.contact}
        glow="green"
      />
    </div>
  );
}
