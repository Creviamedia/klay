import React from 'react';
import { Image } from '@/components/ui/image';
import { Link } from '@/components/ui/link';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { NumberedAccordion, type AccordionItem } from '@/components/ui/NumberedAccordion';
import { AtmosphericBanner } from '@/components/ui/AtmosphericBanner';
import { HomeHeroSection } from '@/components/sections/HomeHeroSection';
import { SectionSovereignStructure } from '@/components/sections/SectionSovereignStructure';
import { StatCounter } from '@/components/ui/StatCounter';
import { DivisionCard } from '@/components/ui/DivisionCard';
import { PropertySetupCard } from '@/components/ui/PropertySetupCard';
import { SetupCalculator } from '@/components/sections/SetupCalculator';
import {
  HOMEPAGE_SETUP_FACTORS,
  IMAGES,
} from '@/lib/data';
import { ROUTES } from '@/lib/routes';

const HOMEPAGE_FAQS: AccordionItem[] = [
  {
    number: '01',
    question: 'Can foreign nationals own 100% of a UAE company?',
    answer:
      'Yes. Under UAE Federal Decree-Law No. 26 of 2020, foreign investors can own 100% of companies across both Free Zones and most Dubai Mainland (DED) commercial activities without requiring an Emirati national shareholder or local nominee.',
  },
  {
    number: '02',
    question: 'What is the main difference between Mainland and Free Zone setup?',
    answer:
      'A Dubai Mainland (DED) license allows your company to trade directly across all 7 UAE emirates, open retail/office premises anywhere, and bid for UAE government contracts. A Free Zone license offers 100% customs duty exemptions and 0% corporate tax on qualifying foreign income, making it ideal for international consulting, tech, trade, and export services.',
  },
  {
    number: '03',
    question: 'How fast can a UAE business license be issued?',
    answer:
      'With Klay Consultants, pre-approved Free Zone licenses can be issued within 24 to 48 hours. Dubai Mainland licenses typically take 3 to 5 business days once trade name approvals and digital MOA notarisation are completed.',
  },
  {
    number: '04',
    question: 'How do you guarantee corporate bank account opening?',
    answer:
      'UAE banking regulations require rigorous KYC and AML compliance. Klay prepares an institutional compliance profile of your company, business activities, and ultimate beneficial owners (UBOs) prior to submission. We partner directly with senior relationship managers at Emirates NBD, Mashreq, FAB, and Wio to ensure seamless account approval.',
  },
  {
    number: '05',
    question: 'Can I sponsor my family and obtain a UAE Golden Visa?',
    answer:
      'Yes. Company shareholders and investors holding a trade license can sponsor their spouse, children, and parents for UAE residency visas. Qualifying investors with setup capital of AED 2M+ or real estate assets may also apply for the prestigious 10-year UAE Golden Visa.',
  },
];

const STRATEGY_WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'We Underwrite',
    description: 'We assess your trade scope, regional contracts, and ultimate banking profile to select the optimal jurisdiction with zero nominee exposure.',
    details: 'Initial government name approval, activity classification, and tax residency qualification.',
  },
  {
    number: '02',
    title: 'You Choose',
    description: 'Review pre-vetted corporate structures across Dubai Mainland (DED) or premier Free Zones (DIFC, ADGM, DMCC, Meydan) tailored to your capital.',
    details: 'Transparent government fee schedules with zero hidden agency surcharges.',
  },
  {
    number: '03',
    title: 'We Incorporate',
    description: 'Our accredited legal counsel drafts Articles, notarises the digital MOA, and secures the official trade license with sovereign pre-approval.',
    details: 'Establishment card issuance, corporate quota allocation, and Chamber of Commerce registration.',
  },
  {
    number: '04',
    title: 'You Own',
    description: 'Gain 100% sovereign ownership of an active UAE company with VIP investor residency visas and pre-cleared tier-1 corporate banking.',
    details: 'Multi-currency facilities activated in days with dedicated relationship managers.',
  },
];

const JURISDICTION_SHOWCASES = [
  {
    title: 'Dubai Mainland (DED)',
    jurisdiction: 'Dubai Mainland',
    structure: '100% Foreign Owned LLC',
    taxStatus: '0% Qualifying Foreign Income',
    imageSrc: '/images/site/services-dubai-sunset.webp',
    imageAlt: 'Dubai Mainland skyline architecture',
    to: '/services/mainland-company-setup/',
  },
  {
    title: 'DIFC Financial Centre',
    jurisdiction: 'DIFC Innovation Hub',
    structure: 'Global Asset Holding',
    taxStatus: 'Common Law Framework',
    imageSrc: '/images/site/dubai-twilight.webp',
    imageAlt: 'DIFC financial district at twilight',
    to: '/services/free-zone-company-setup/',
  },
  {
    title: 'DMCC Commodities Hub',
    jurisdiction: 'Jumeirah Lakes Towers',
    structure: 'International Trade & Tech',
    taxStatus: '100% Capital Repatriation',
    imageSrc: '/images/site/dubai-marina.webp',
    imageAlt: 'DMCC waterfront commercial towers',
    to: '/services/free-zone-company-setup/',
  },
  {
    title: 'Meydan Free Zone',
    jurisdiction: 'Meydan Dubai',
    structure: 'Consulting & Digital Commerce',
    taxStatus: 'Direct Banking Pre-Clearance',
    imageSrc: '/images/site/hero-skyline.webp',
    imageAlt: 'Meydan Dubai cityscape',
    to: '/services/free-zone-company-setup/',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-[#FBFBFB] text-[#0C2D48]">
      {/* =========================================================================
          SECTION 1: 100vh Full-Bleed Cinematic Hero Fold with Rotating Ticker
          ========================================================================= */}
      <HomeHeroSection />

      {/* =========================================================================
          SECTION 2: Where Vision Becomes Sovereign Structure & Partner Marquee
          ========================================================================= */}
      <SectionSovereignStructure />

      {/* =========================================================================
          SECTION 3: Incorporate With Strategy (Obsidian Dark Canvas #05131F)
          4 Full-Height Column Cards Side-by-Side Simultaneously with Hairlines
          ========================================================================= */}
      <section className="py-20 lg:py-32 bg-[#05131F] text-white border-b border-white/10 relative overflow-hidden">
        {/* Subtle Ambient Horizon Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-green-horizon-glow opacity-40"
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-16 lg:mb-20">
            <span className="inline-block text-xs font-mono tracking-widest text-[#22C55E] uppercase mb-4">
              EXECUTION STRATEGY
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-normal tracking-[-0.03em] text-[#FBFBFB] leading-[1.08]">
              Incorporate With Strategy, <br />
              <span className="text-white">Scale With Confidence.</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-white/70 font-normal leading-relaxed max-w-2xl">
              At Klay Consultants, every entity is legally structured, underwritten, and pre-cleared for corporate banking before filing. Our institutional model ensures you own 100% of your venture from day one.
            </p>
          </div>

          {/* 4 Sequential Vertical Column Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 relative corner-crosshair-wrap">
            <CornerCrosshairs color="text-[#22C55E]/60" size={14} />

            {STRATEGY_WORKFLOW_STEPS.map((step) => (
              <div
                key={step.number}
                className="bg-[#05131F] p-8 lg:p-10 flex flex-col justify-between transition-colors duration-300 hover:bg-[#0A1E30]"
              >
                <div>
                  <span className="font-mono text-xs text-[#22C55E] tracking-widest uppercase block mb-8">
                    PHASE // {step.number}
                  </span>
                  <h3 className="text-3xl lg:text-4xl font-heading font-normal tracking-[-0.03em] text-[#FBFBFB] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-sm lg:text-base text-white/75 font-normal leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>
                <div className="pt-6 border-t border-white/10 text-xs font-mono text-white/50 leading-relaxed">
                  {step.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Proven Record (Porcelain Ivory Canvas #FBFBFB)
          3 Large Numerical Stat Counters (96px Tabular) + Pill CTA
          ========================================================================= */}
      <section className="py-20 lg:py-32 bg-[#FBFBFB] text-[#0C2D48] border-b border-[#0C2D48]/10 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-24">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-mono tracking-widest text-[#22C55E] uppercase mb-4">
                PROVEN RECORD
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-normal tracking-[-0.03em] text-[#0C2D48] leading-[1.08]">
                Regulations Shift, <br />
                <span className="font-medium">Our Standards Don't.</span>
              </h2>
              <p className="mt-6 text-base sm:text-lg text-[#0C2D48]/75 font-normal leading-relaxed">
                Every incorporation behind these figures was structured under rigorous legal standards: zero local nominee risk, verified banking dossiers, and sovereign title protection.
              </p>
            </div>
            <div>
              <EquitifyButton to={ROUTES.contact} variant="green" size="lg">
                START YOUR SETUP
              </EquitifyButton>
            </div>
          </div>

          {/* 3 Stat Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 border-t border-[#0C2D48]/10">
            <StatCounter
              value={500}
              prefix="AED "
              suffix="M+"
              label="In Corporate Assets Structured"
              description="Audited client operating capital across UAE mainland and premier financial free zones."
            />
            <StatCounter
              value={100}
              suffix="%"
              label="Foreign Ownership Retained"
              description="Statutory legal protection ensuring 100% sovereign equity without nominee arrangements."
            />
            <StatCounter
              value={1200}
              suffix="+"
              label="Formations & Family Offices"
              description="Entrepreneurs, enterprise subsidiaries, and institutional investors established in the UAE."
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Institutional Divisions (Obsidian Dark Canvas #05131F)
          4 Division Cards with Directional Arrow Links
          ========================================================================= */}
      <section className="py-20 lg:py-32 bg-[#05131F] text-white border-b border-white/10 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-16 lg:mb-20">
            <span className="inline-block text-xs font-mono tracking-widest text-[#22C55E] uppercase mb-4">
              DIVISIONS
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-normal tracking-[-0.03em] text-[#FBFBFB] leading-[1.08]">
              Full Lifecycle Under <br />
              <span className="text-white">One Institutional Roof.</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-white/70 font-normal leading-relaxed max-w-2xl">
              We eliminate disconnected service fragmentation. Your licensing, corporate banking, residency visas, and succession planning are unified under one point of contact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DivisionCard
              index="01 // FORMATION"
              title="Mainland & Free Zone Setup"
              description="Comprehensive corporate structuring across Dubai Economy (DED), DIFC, ADGM, and premier UAE free zones."
              features={['DED Commercial', 'DIFC / ADGM Hubs', '100% Foreign Equity']}
              to="/services/mainland-company-setup/"
            />
            <DivisionCard
              index="02 // RESIDENCY"
              title="Golden Visa Advisory"
              description="10-year sovereign UAE residency advisory for investors, founders, executives, and high-net-worth families."
              features={['10-Year Self-Sponsored', 'VIP Medical Concierge', 'Family Visa Inclusions']}
              to="/golden-visa/"
            />
            <DivisionCard
              index="03 // BANKING"
              title="Corporate Banking Activation"
              description="Direct introductions and pre-underwritten compliance packs for tier-1 UAE banks (Emirates NBD, FAB, Mashreq, Wio)."
              features={['Pre-Underwritten AML', 'Multi-Currency Accounts', 'Zero Capital Freeze']}
              to="/services/corporate-bank-account/"
            />
            <DivisionCard
              index="04 // SUCCESSION"
              title="Estate & Will Registration"
              description="Protect your UAE commercial shares, real estate, and financial assets through common law will registration."
              features={['DIFC Wills Registry', 'ADGM Estate Trusts', 'Probate Protection']}
              to="/services/pro-services/"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: Jurisdictions Structured (Porcelain Ivory Canvas #FBFBFB)
          Property-Style Architectural Cards with 4-Layer Photo Overlays
          ========================================================================= */}
      <section className="py-20 lg:py-32 bg-[#FBFBFB] text-[#0C2D48] border-b border-[#0C2D48]/10 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-20">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-mono tracking-widest text-[#22C55E] uppercase mb-4">
                PORTFOLIO
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-normal tracking-[-0.03em] text-[#0C2D48] leading-[1.08]">
                Jurisdictions Structured.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-[#0C2D48]/75 font-normal leading-relaxed">
                Explore active commercial platforms and sovereign entities structured across premier UAE financial centres.
              </p>
            </div>
            <div>
              <EquitifyButton to="/services/" variant="dark" size="lg">
                EXPLORE ALL JURISDICTIONS
              </EquitifyButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {JURISDICTION_SHOWCASES.map((item) => (
              <PropertySetupCard
                key={item.title}
                title={item.title}
                jurisdiction={item.jurisdiction}
                structure={item.structure}
                taxStatus={item.taxStatus}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                to={item.to}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: Pre-Footer Atmospheric Banner (Obsidian Dark Canvas #05131F)
          Signature Equitify Two-Line Statement + Pill CTA
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#05131F] text-[#FBFBFB] py-24 lg:py-36 border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-green-horizon-glow opacity-60"
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center corner-crosshair-wrap">
          <CornerCrosshairs color="text-[#22C55E]/60" size={14} />
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-xs font-mono tracking-widest text-[#22C55E] uppercase mb-6">
              SOVEREIGN ADVANTAGE
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-normal tracking-[-0.03em] text-[#FBFBFB] leading-[1.08] mb-6">
              What We Built for Ourselves <br />
              <span className="text-white">We Now Build for You.</span>
            </h2>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Direct government liaison, zero nominee risk, and institutional corporate structuring. Speak with our Senior Advisory Partners to architect your UAE presence.
            </p>
            <div className="flex justify-center">
              <EquitifyButton to={ROUTES.contact} variant="green" size="lg">
                START YOUR SETUP
              </EquitifyButton>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: Instant Cost Estimation Engine
          ========================================================================= */}
      <section id="cost-estimate" className="py-20 lg:py-28 bg-[#FBFBFB] text-[#0C2D48] border-b border-[#0C2D48]/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div className="relative border border-[#0C2D48]/10 bg-white p-8 sm:p-10 shadow-sm corner-crosshair-wrap">
              <CornerCrosshairs color="text-[#22C55E]/60" size={10} />
              <span className="mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-mono uppercase tracking-wider text-[#16A34A] bg-[#22C55E]/10 border border-[#22C55E]/20">
                INSTANT SETUP ESTIMATE
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-normal tracking-tight text-[#0C2D48] mb-3">
                UAE Business Formation Pricing
              </h2>
              <p className="text-sm text-[#0C2D48]/75 leading-relaxed mb-6">
                Your investment is determined by jurisdiction, activity category, visa allocation, and premises requirements. Calculate statutory fees with full transparency.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {HOMEPAGE_SETUP_FACTORS.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3 border border-[#0C2D48]/10 bg-[#FBFBFB] p-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0C2D48] text-[#22C55E]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="block text-xs font-semibold text-[#0C2D48]">{title}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-[#0C2D48]/60">{text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full">
              <SetupCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: Numbered FAQ Accordion (Equitify Format)
          ========================================================================= */}
      <section className="py-20 lg:py-28 bg-[#05131F] text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <NumberedAccordion
            items={HOMEPAGE_FAQS}
            eyebrow="FREQUENTLY ASKED"
            heading="What to Know Before You Establish"
            subheading="Direct legal answers to critical questions regarding 100% foreign ownership, banking activation, and corporate tax structuring."
          />
        </div>
      </section>
    </div>
  );
}
