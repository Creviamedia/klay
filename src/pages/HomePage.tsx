import React from 'react';
import { Image } from '@/components/ui/image';
import { Link } from '@/components/ui/link';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { ProcessTabs, type ProcessStep } from '@/components/ui/ProcessTabs';
import { ComparisonMatrix } from '@/components/ui/ComparisonMatrix';
import { NumberedAccordion, type AccordionItem } from '@/components/ui/NumberedAccordion';
import { AtmosphericBanner } from '@/components/ui/AtmosphericBanner';
import { HomeHeroContactForm } from '@/components/sections/HomeHeroContactForm';
import { SetupCalculator } from '@/components/sections/SetupCalculator';
import { HomepagePackagesStack } from '@/components/sections/HomepagePackagesStack';
import { CircularServicesCarousel } from '@/components/sections/CircularServicesCarousel';
import {
  HOMEPAGE_ADVANTAGES,
  HOMEPAGE_PACKAGES,
  HOMEPAGE_SERVICES,
  HOMEPAGE_SETUP_FACTORS,
  IMAGES,
} from '@/lib/data';
import { ROUTES } from '@/lib/routes';

const HOMEPAGE_PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Jurisdiction & Structure Underwriting',
    duration: 'Day 1',
    summary:
      'We assess your business activity, target banking profile, and regional trade scope to select the ideal jurisdiction—whether Dubai Mainland (DED), Free Zone (DMCC, DIFC, IFZA, Meydan), or Offshore.',
    details: [
      'Trade name reservation and initial government pre-approval',
      'Corporate structuring ensuring 100% foreign ownership with zero nominee risk',
      'Tax residency and qualifying corporate tax exemption roadmap',
    ],
  },
  {
    number: '02',
    title: 'Trade License & Legal Incorporation',
    duration: 'Days 2–3',
    summary:
      'Our direct government liaison drafts the Memorandum of Association (MOA), prepares notarised legal resolutions, and secures the official UAE Trade License.',
    details: [
      'Drafting and digital notarisation of Articles & MOA',
      'Direct issuance of commercial trade license and Chamber of Commerce registration',
      'Establishment Card issuance for corporate visa quota',
    ],
  },
  {
    number: '03',
    title: 'Residency Visa & VIP Medical Stamping',
    duration: 'Days 3–5',
    summary:
      'Fast-track UAE Investor or Employment Visa processing with VIP concierge medical examination and biometrics for Emirates ID issuance.',
    details: [
      'Electronic entry permit issuance and status change',
      'VIP lounge medical fitness testing and fingerprint biometrics appointment',
      'Emirates ID card stamping with multi-year residency validity',
    ],
  },
  {
    number: '04',
    title: 'Tier-1 Corporate Banking Activation',
    duration: 'Week 2',
    summary:
      'Direct banker introductions with pre-screened compliance dossiers across premier UAE financial institutions (Emirates NBD, Mashreq, FAB, Wio).',
    details: [
      'Pre-underwritten AML and KYC compliance pack preparation',
      'Dedicated relationship manager appointment and face-to-face verification',
      'Multi-currency account activation (AED, USD, EUR, GBP) with online banking',
    ],
  },
];

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

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-canvas-light text-text-primary-dark">
      {/* =========================================================================
          HERO SECTION: Obsidian Dark Canvas with Ambient Amber Horizon Glow
          ========================================================================= */}
      <section className="relative isolate min-h-[calc(100vh-4.5rem)] overflow-hidden bg-canvas-dark text-canvas-light py-12 md:py-20 lg:py-24 border-b border-hairline-dark/40 flex items-center">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={IMAGES.heroSkyline}
            alt="Dubai architectural waterfront and skyline"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20 filter saturate-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-canvas-dark/95 via-canvas-dark/85 to-canvas-dark" />
        </div>

        {/* Ambient Green & Amber Horizon Glow at Baseline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-green-horizon-glow opacity-80 -z-10"
        />

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative corner-crosshair-wrap">
          <CornerCrosshairs color="text-brand-green/60" size={14} />

          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {/* Left Narrative Hero Column */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-green/30 bg-canvas-dark-card/60 backdrop-blur-md mb-6">
                <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-xs font-mono tracking-wider uppercase text-brand-green">
                  SOVEREIGN UAE ADVISORY · DUBAI
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-medium tracking-tight text-canvas-light leading-[1.04] mb-6">
                Shaping Ideas, <br />
                <span className="text-brand-green">Transforming Businesses.</span>
              </h1>

              <p className="text-base sm:text-lg text-canvas-light/80 font-normal leading-relaxed mb-8 max-w-xl">
                Dreaming of starting a business in Dubai, UAE? Klay Consultants helps entrepreneurs
                and investors with company formation, trade licensing, free zone and mainland
                business setup, and ongoing business support. Get expert guidance to establish your
                business in the UAE.
              </p>

              {/* Dual Equitify CTAs in Klay Green & Blue */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <EquitifyButton
                  to={ROUTES.contact}
                  variant="green"
                  size="lg"
                  aria-label="Book a confidential consultation"
                >
                  Book a Consultation
                </EquitifyButton>
                <EquitifyButton
                  to={ROUTES.costCalculator}
                  variant="dark"
                  size="lg"
                  aria-label="Estimate UAE setup cost"
                >
                  Estimate Setup Cost
                </EquitifyButton>
              </div>

              {/* Trust Indicators Bar */}
              <div className="mt-10 pt-8 border-t border-hairline-dark/30 grid grid-cols-3 gap-4 text-xs font-mono text-text-muted-light/80">
                <div>
                  <span className="block text-brand-green font-bold text-base sm:text-lg">100%</span>
                  <span>Foreign Ownership</span>
                </div>
                <div>
                  <span className="block text-brand-green font-bold text-base sm:text-lg">3-5 Days</span>
                  <span>License Turnaround</span>
                </div>
                <div>
                  <span className="block text-brand-green font-bold text-base sm:text-lg">DED & Freezone</span>
                  <span>Accredited Channel</span>
                </div>
              </div>
            </div>

            {/* Right Hero Contact Form in Architectural Frame */}
            <div className="relative w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-lg relative corner-crosshair-wrap">
                <CornerCrosshairs color="text-brand-green/50" size={10} />
                <HomeHeroContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 2-Column Architectural Pillars (Light Canvas #FBFBFB)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-b border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12 md:mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-navy/60 uppercase mb-3">
              INSTITUTIONAL FOUNDATION
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy">
              Where Capital Becomes Sovereign Ownership.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline-light/30 border border-hairline-light/40 relative corner-crosshair-wrap">
            <CornerCrosshairs color="text-brand-green/70" size={12} />

            {/* Card 1 */}
            <div className="bg-canvas-light-card p-8 md:p-12 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-8">
                <span className="w-10 h-10 rounded-full border border-brand-green/40 flex items-center justify-center text-brand-green">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <span className="font-mono text-sm text-text-muted-dark">01</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-semibold text-brand-navy mb-4">
                Exclusive Direct Access
              </h3>
              <p className="text-sm md:text-base text-text-secondary-dark leading-relaxed">
                Direct government-accredited liaison across Dubai Economy &amp; Tourism (DED) and premier Free Zones (DIFC, ADGM, DMCC, Meydan). Zero intermediary markups, transparent licensing, and vetted sovereign compliance.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-canvas-light-card p-8 md:p-12 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-8">
                <span className="w-10 h-10 rounded-full border border-brand-green/40 flex items-center justify-center text-brand-green">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <span className="font-mono text-sm text-text-muted-dark">02</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-semibold text-brand-navy mb-4">
                Institutional Terms &amp; Banking
              </h3>
              <p className="text-sm md:text-base text-text-secondary-dark leading-relaxed">
                Pre-underwritten corporate bank account dossiers guaranteed in tier-1 UAE financial institutions. Multi-currency facilities (AED, USD, EUR) with dedicated relationship management and zero capital freeze.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Core Services Carousel Section
          ========================================================================= */}
      <section id="services" className="py-16 md:py-24 bg-canvas-light text-text-primary-dark">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-gold uppercase mb-3">
              SERVICES DIRECTORY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy mb-4">
              Company Formation &amp; Business Setup
            </h2>
            <p className="text-base text-text-secondary-dark leading-relaxed max-w-2xl mx-auto">
              Set up your company in Dubai, UAE with experts who handle approvals, paperwork, and guide you through every regulation.
            </p>
          </div>

          <CircularServicesCarousel items={HOMEPAGE_SERVICES} />
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Interactive 4-Step Process Tabs (Equitify Format)
          ========================================================================= */}
      <section id="process" className="py-16 md:py-24 bg-canvas-dark text-canvas-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ProcessTabs
            steps={HOMEPAGE_PROCESS_STEPS}
            eyebrow="TRANSPARENT EXECUTION"
            heading="From First Consultation to Full Sovereign Ownership"
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Institutional Comparison Matrix ("On Your Own" vs "With Klay")
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-dark text-canvas-light border-t border-hairline-dark/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ComparisonMatrix />
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: Setup Packages Stack
          ========================================================================= */}
      <section id="packages" className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-t border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-gold uppercase mb-3">
              SETUP PACKAGES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy">
              Choose the Right UAE Business Structure
            </h2>
          </div>
          <HomepagePackagesStack packages={HOMEPAGE_PACKAGES} bookingHref={ROUTES.contact} />
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: Cost Calculator Section
          ========================================================================= */}
      <section id="cost-estimate" className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-t border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div className="relative border border-hairline-light/50 bg-canvas-light-card p-7 sm:p-10 shadow-sm corner-crosshair-wrap">
              <CornerCrosshairs color="text-brand-gold/60" size={10} />
              <span className="mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-mono uppercase tracking-wider text-brand-gold bg-brand-gold/10 rounded-full border border-brand-gold/20">
                INSTANT UAE SETUP ESTIMATE
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-brand-navy mb-3">
                UAE Business Setup Packages and Costs
              </h2>
              <p className="text-sm text-text-secondary-dark leading-relaxed mb-6">
                Setting up a company in the UAE doesn’t have a one-size-fits-all price. Your cost
                depends on multiple factors like jurisdiction, business activity, visa requirements,
                and premises.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {HOMEPAGE_SETUP_FACTORS.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3 rounded-none border border-hairline-light/40 bg-canvas-light p-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-gold">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="block text-xs font-semibold text-brand-navy">{title}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-text-muted-dark">{text}</span>
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
          SECTION 8: Atmospheric Amber Horizon Glow Banner
          ========================================================================= */}
      <AtmosphericBanner
        eyebrow="SOVEREIGN ADVANTAGE"
        headline="Start Your UAE Journey, Skip The Friction."
        subheadline="Direct government liaison, zero nominee risk, and institutional corporate structuring. Speak directly with a Senior Advisory Partner today."
        ctaText="START YOUR SETUP IN DUBAI"
        ctaTo={ROUTES.costCalculator}
      />

      {/* =========================================================================
          SECTION 9: Numbered FAQ Accordion (Equitify Format)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-dark text-canvas-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <NumberedAccordion
            items={HOMEPAGE_FAQS}
            eyebrow="FREQUENTLY ASKED"
            heading="What to Know Before You Establish"
            subheading="Direct answers to the questions that matter most before incorporating and long after your license is active."
          />
        </div>
      </section>
    </div>
  );
}
