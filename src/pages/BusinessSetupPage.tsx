import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Globe2,
  Layers3,
  CheckCircle2,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Link } from '@/components/ui/link';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { AtmosphericBanner } from '@/components/ui/AtmosphericBanner';
import { KlayLeadForm } from '@/components/forms/KlayLeadForm';
import { IMAGES, COMPANY } from '@/lib/data';
import { ROUTES } from '@/lib/routes';

const journeySteps = [
  {
    number: '01',
    category: 'PLAN',
    title: 'Define Your Business Activity',
    description:
      'Identify what your company will do, products/services you plan to offer, and intended markets to pinpoint the exact license category.',
  },
  {
    number: '02',
    category: 'CHOOSE',
    title: 'Select Your Business Structure',
    description:
      'Explore Mainland, Free Zone or Offshore structures comparing permitted activities, ownership rules, operating scope and banking readiness.',
  },
  {
    number: '03',
    category: 'REGISTER',
    title: 'Reserve & Register Your Trade Name',
    description:
      'Select a compliant company name and submit it for swift initial approval with the relevant Department of Economy or Free Zone authority.',
  },
  {
    number: '04',
    category: 'APPROVALS',
    title: 'Complete Initial Approvals & MOA',
    description:
      'Prepare application documents, shareholder passport records, and digital notarisation of Articles & Memorandum of Association.',
  },
  {
    number: '05',
    category: 'PREPARE',
    title: 'Arrange Your Business Premises',
    description:
      'Select a flexi-desk, executive office suite, or warehouse facility permitted for your chosen commercial license.',
  },
  {
    number: '06',
    category: 'LAUNCH',
    title: 'Obtain License & Activate Banking',
    description:
      'Receive your official commercial license, establish your Establishment Card for visa quotas, and activate tier-1 corporate banking.',
  },
];

const formationServices = [
  {
    number: '01',
    category: 'FREE ZONE',
    title: 'Free Zone Company Formation',
    description:
      '100% foreign ownership, 0% corporate tax on qualifying foreign income, and full customs duty exemptions across DMCC, DIFC, IFZA, and Meydan.',
    idealFor: 'Tech startups, global consultancies, e-commerce, and export businesses.',
    href: '/services/free-zone-company-setup',
    image: IMAGES.dubaiTwilight,
    turnaround: '24–48 Hours',
  },
  {
    number: '02',
    category: 'MAINLAND',
    title: 'Mainland DED Company Formation',
    description:
      'Unrestricted trade across all 7 UAE emirates, direct government procurement eligibility, and unrestricted commercial retail/office leasing.',
    idealFor: 'Enterprises selling directly within the UAE, general trading, and construction.',
    href: '/services/mainland-company-setup',
    image: IMAGES.meeting,
    turnaround: '3–5 Days',
  },
  {
    number: '03',
    category: 'OFFSHORE',
    title: 'Offshore Company Formation',
    description:
      'Specialized international asset holding vehicles, intellectual property isolation, and succession planning through RAK ICC and JAFZA.',
    idealFor: 'International holding companies, family offices, and cross-border IP assets.',
    href: '/services/offshore-company-setup',
    image: IMAGES.skylineAerial,
    turnaround: '2–4 Days',
  },
];

const benefits = [
  {
    number: '01',
    title: 'Direct Government Accredited',
    description: 'We liaise directly with DED, ICP, and Freezone Registrars with zero intermediary markups.',
  },
  {
    number: '02',
    title: '100% Sovereign Foreign Ownership',
    description: 'Direct foreign ownership structures eliminating nominee risks and local sponsor dependencies.',
  },
  {
    number: '03',
    title: 'Pre-Underwritten Banking Dossiers',
    description: 'Guaranteed corporate banker introductions in tier-1 UAE banks with verified compliance packs.',
  },
  {
    number: '04',
    title: 'Fixed Transparent Fees',
    description: 'Complete cost certainty from day one with zero hidden renewal markups or typing surprises.',
  },
];

export default function BusinessSetupPage() {
  const [filter, setFilter] = useState<'ALL' | 'FREE ZONE' | 'MAINLAND' | 'OFFSHORE'>('ALL');

  const filteredServices =
    filter === 'ALL'
      ? formationServices
      : formationServices.filter((s) => s.category === filter);

  return (
    <div className="flex flex-col w-full bg-canvas-light text-text-primary-dark">
      {/* =========================================================================
          HERO SECTION: Obsidian Dark Canvas with Green & Amber Horizon Glow
          ========================================================================= */}
      <section className="relative isolate min-h-[520px] lg:min-h-[620px] flex items-center overflow-hidden bg-canvas-dark text-canvas-light py-20 md:py-28 border-b border-hairline-dark/40">
        <div className="absolute inset-0 -z-20">
          <Image
            src={IMAGES.heroSkyline}
            alt="Dubai business district skyline"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25 filter saturate-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-canvas-dark/95 via-canvas-dark/85 to-canvas-dark" />
        </div>

        {/* Ambient Green Horizon Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-green-horizon-glow opacity-80 -z-10"
        />

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative corner-crosshair-wrap">
          <CornerCrosshairs color="text-brand-green/60" size={14} />

          <div className="max-w-3xl">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-4">
              COMMERCIAL STRUCTURING · DUBAI
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-medium tracking-tight text-canvas-light leading-[1.05] mb-6">
              Start Your UAE Business <br />
              With <span className="text-brand-green">Clarity &amp; Confidence.</span>
            </h1>
            <p className="text-base sm:text-lg text-canvas-light/80 font-normal leading-relaxed mb-8 max-w-2xl">
              Turning an enterprise vision into an operational UAE entity starts with the right decisions. From choosing your business activity and jurisdiction to complete trade licensing, visa stamping, and corporate banking.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <EquitifyButton to={ROUTES.contact} variant="green" size="lg">
                Book a Structuring Consultation
              </EquitifyButton>
              <EquitifyButton to={ROUTES.costCalculator} variant="dark" size="lg">
                Calculate Setup Costs
              </EquitifyButton>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: Equitify Filterable Formation Routes (Equitify /properties format)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-b border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-block text-xs font-mono tracking-widest text-brand-navy/60 uppercase mb-3">
                JURISDICTIONS &amp; STRUCTURES
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy">
                Which UAE Structure Fits Your Vision?
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'FREE ZONE', 'MAINLAND', 'OFFSHORE'] as const).map((cat) => {
                const isActive = filter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-brand-green text-brand-navy-deep font-bold shadow-green-glow'
                        : 'border border-hairline-light/50 bg-canvas-light-card text-brand-navy/70 hover:text-brand-navy hover:border-brand-green'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Column Photographic Cards Grid (Equitify Signature) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <Link
                key={service.number}
                href={service.href}
                className="group relative border border-hairline-light/40 bg-canvas-light-card overflow-hidden transition-transform duration-200 hover:-translate-y-1 corner-crosshair-wrap"
              >
                <CornerCrosshairs color="text-brand-green/60" size={10} />

                {/* Card Visual with warm amber gradient vignette on bottom */}
                <div className="relative aspect-[16/10] overflow-hidden bg-canvas-dark">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas-dark/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-canvas-light bg-brand-navy/80 rounded-full border border-hairline-dark/30 backdrop-blur-sm">
                      {service.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-brand-green">
                    <span>Turnaround: {service.turnaround}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* Card Copy */}
                <div className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-brand-navy mb-2 group-hover:text-brand-green transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-text-secondary-dark leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="border-t border-hairline-light/30 pt-3">
                    <span className="block text-[10px] font-mono text-brand-navy/60 uppercase">Ideal for:</span>
                    <span className="text-xs text-brand-navy/90 font-medium">{service.idealFor}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: 6-Step Journey Grid (Equitify Format)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-dark text-canvas-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12 md:mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-3">
              JOURNEY OVERVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-canvas-light mb-4">
              How to Set Up a Business in the UAE.
            </h2>
            <p className="text-sm md:text-base text-canvas-light/75 leading-relaxed">
              A structured overview of the typical company formation journey. Sourcing, legal drafting, licensing, and corporate bank accounts under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline-dark/40 border border-hairline-dark/40 relative corner-crosshair-wrap">
            <CornerCrosshairs color="text-brand-green/60" size={12} />

            {journeySteps.map((step) => (
              <div
                key={step.number}
                className="bg-canvas-dark-card/90 p-8 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-semibold text-brand-green">
                    {step.number}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-brand-green bg-brand-green/10 rounded-full border border-brand-green/20">
                    {step.category}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-semibold text-canvas-light mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-text-muted-light/90 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Why Work With Us + Sovereign Lead Form Integration
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-t border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6">
              <span className="inline-block text-xs font-mono tracking-widest text-brand-navy/60 uppercase mb-3">
                INSTITUTIONAL ADVANTAGE
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy mb-6">
                Your Business Goals. Our Guidance. One Accountable Path.
              </h2>
              <p className="text-base text-text-secondary-dark leading-relaxed mb-8">
                Setting up in the UAE should feel confident, not overwhelming. At Klay Consultants, we underwrite your business activity, jurisdiction, and banking requirements before filing a single document.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((b) => (
                  <div key={b.number} className="border border-hairline-light/50 bg-canvas-light-card p-5">
                    <span className="font-mono text-xs text-brand-green font-bold block mb-1">{b.number}</span>
                    <h4 className="text-sm font-semibold text-brand-navy mb-2">{b.title}</h4>
                    <p className="text-xs text-text-secondary-dark leading-relaxed">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative corner-crosshair-wrap">
              <CornerCrosshairs color="text-brand-green/60" size={12} />
              <KlayLeadForm
                variant="light"
                source="business-setup-page"
                title="Request Structuring Proposal"
                subtitle="Share your intended activity to receive a pre-underwritten jurisdiction breakdown."
                eyebrow="CONFIDENTIAL ADVISORY"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Atmospheric Amber Horizon Glow Banner
          ========================================================================= */}
      <AtmosphericBanner
        eyebrow="NEXT STEPS"
        headline="Estimate Your Dubai Setup Cost in 60 Seconds."
        subheadline="Compare mainland, free zone, and visa pricing across all major UAE jurisdictions instantly."
        ctaText="LAUNCH CALCULATOR"
        ctaTo={ROUTES.costCalculator}
        glow="amber"
      />
    </div>
  );
}
