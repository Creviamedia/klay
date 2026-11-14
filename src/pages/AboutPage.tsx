import React, { useState, useEffect } from 'react';
import {
  Banknote,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { ResilientImage } from '@/components/ui/resilient-image';
import { Link } from '@/components/ui/link';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { AtmosphericBanner } from '@/components/ui/AtmosphericBanner';
import { IMAGES, COMPANY } from '@/lib/data';
import { ROUTES } from '@/lib/routes';

const processSteps = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Understand',
    summary: 'We start by understanding your business goals, target market, and expansion plans.',
    points: ['Comprehensive commercial scope assessment', 'Tax residency and banking requirements review'],
  },
  {
    number: '02',
    icon: Layers3,
    title: 'Structure',
    summary: 'We define the right setup aligned with how you plan to operate.',
    points: ['Mainland, Free Zone, or Offshore jurisdiction selection', 'Business activity & 100% foreign ownership model'],
  },
  {
    number: '03',
    icon: ClipboardCheck,
    title: 'Plan',
    summary: 'We map the full setup process so there are zero surprises later.',
    points: ['Licensing criteria & name reservation', 'Visa allocations & corporate compliance roadmap'],
  },
  {
    number: '04',
    icon: FileCheck2,
    title: 'Incorporate',
    summary: 'We handle your direct company registration with the relevant UAE authorities.',
    points: ['Up to 4 working days standard turnaround', '24-hour express setup available for priority cases'],
  },
  {
    number: '05',
    icon: Banknote,
    title: 'Activate',
    summary: 'We execute everything required to make your business fully operational.',
    points: ['VIP investor & employment visa stamping', 'Pre-underwritten corporate bank account opening'],
  },
  {
    number: '06',
    icon: ShieldCheck,
    title: 'Support',
    summary: 'After setup, we continue to provide ongoing advisory and regulatory support.',
    points: ['Anti-Money Laundering (AML) compliance', 'Economic Substance Regulations (ESR) filing & accounting'],
  },
];

const leadershipRoster = [
  {
    name: 'Tariq Al-Mansoor',
    role: 'MANAGING PARTNER · CORPORATE STRUCTURING',
    image: IMAGES.meeting,
    bio: 'Former senior advisor with 15+ years guiding sovereign investments, Free Zone corporate governance, and cross-border M&A in Dubai.',
  },
  {
    name: 'Elena Rostova',
    role: 'HEAD OF BANKING & COMPLIANCE',
    image: IMAGES.handshake,
    bio: 'Specialist in UAE Central Bank AML compliance, institutional KYC dossiers, and tier-1 corporate banking facilities for multinational entities.',
  },
  {
    name: 'Marcus Vance',
    role: 'DIRECTOR OF IMMIGRATION & GOLDEN VISA',
    image: IMAGES.dubaiMarina,
    bio: 'Direct liaison with ICP and GDRFA overseeing investor residency, family offices, and 10-year UAE Golden Visa structuring.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-canvas-light text-text-primary-dark">
      {/* =========================================================================
          HERO SECTION: Obsidian Dark Canvas with Green & Amber Horizon Glow
          ========================================================================= */}
      <section className="relative isolate min-h-[520px] lg:min-h-[600px] flex items-center overflow-hidden bg-canvas-dark text-canvas-light py-20 md:py-28 border-b border-hairline-dark/40">
        <div className="absolute inset-0 -z-20">
          <Image
            src={IMAGES.dubaiTwilight}
            alt="Dubai skyline at sunset"
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
              ABOUT KLAY CONSULTANTS
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-medium tracking-tight text-canvas-light leading-[1.05] mb-6">
              Commercial Advisory Made <br />
              <span className="text-brand-green">Easier to Own.</span>
            </h1>
            <p className="text-base sm:text-lg text-canvas-light/80 font-normal leading-relaxed mb-8 max-w-2xl">
              Klay Consultants takes private founders, family offices, and international corporations from capital to full sovereign ownership. Sourcing, legal counsel, trade licensing, and banking—under one accountable point of contact.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <EquitifyButton to={ROUTES.contact} variant="green" size="lg">
                Talk to Our Advisory Team
              </EquitifyButton>
              <EquitifyButton to={ROUTES.costCalculator} variant="dark" size="lg">
                Estimate Setup Costs
              </EquitifyButton>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: The Challenge that Shaped Our Firm (Equitify Format)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-b border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="inline-block text-xs font-mono tracking-widest text-brand-navy/60 uppercase mb-3">
                OUR ORIGINS
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy mb-6">
                The Challenge That Shaped Our Firm.
              </h2>
              <p className="text-base text-text-secondary-dark leading-relaxed mb-4">
                Historically, establishing a business in the UAE forced founders to navigate a fragmented landscape: typists who could not advise on corporate tax, brokers who could not guarantee bank accounts, and agents pushing structures with hidden renewals.
              </p>
              <p className="text-base text-text-secondary-dark leading-relaxed mb-6">
                Klay was built to eliminate that division. We united government liaison, corporate legal counsel, and banking compliance under one roof. When you incorporate with Klay, every decision is pre-underwritten so you own your company with 100% legal clarity.
              </p>
              <div className="border-l-2 border-brand-green pl-4 italic text-sm text-text-muted-dark">
                &ldquo;We don&rsquo;t just help companies start. We engineer them to operate with institutional durability.&rdquo;
              </div>
            </div>

            <div className="lg:col-span-7 relative corner-crosshair-wrap">
              <CornerCrosshairs color="text-brand-green/70" size={12} />
              <div className="relative aspect-[16/10] overflow-hidden border border-hairline-light/40 bg-canvas-dark">
                <Image
                  src={IMAGES.meeting}
                  alt="Klay senior advisors in executive consultation"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: One Standard Behind Every Transaction (Mission & Vision)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-b border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12 md:mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-navy/60 uppercase mb-3">
              CORE PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy">
              One Standard Behind Every Transaction.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#0C2D48]/10 border border-[#0C2D48]/10 relative corner-crosshair-wrap">
            <CornerCrosshairs color="text-[#0C2D48]/40" size={12} />

            {/* Mission Card */}
            <div className="bg-white p-8 md:p-12 transition-colors duration-200 hover:bg-[#FDFDFD]">
              <span className="inline-block text-xs font-mono tracking-widest text-[#0C2D48]/60 uppercase mb-4">
                OUR MISSION
              </span>
              <h3 className="text-2xl md:text-3xl font-heading font-semibold text-[#0C2D48] mb-4">
                Helping Businesses Start Right
              </h3>
              <p className="text-sm md:text-base text-[#0C2D48]/75 leading-relaxed mb-4">
                Our mission is to help entrepreneurs and enterprises establish and operate in the UAE through clear structuring, compliant incorporation, and practical advisory support.
              </p>
              <p className="text-sm md:text-base text-[#0C2D48]/75 leading-relaxed">
                By integrating incorporation, banking alignment, visa processing, and compliance support, we build strong foundations that reduce regulatory risk and support sustainable growth.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-white p-8 md:p-12 transition-colors duration-200 hover:bg-[#FDFDFD]">
              <span className="inline-block text-xs font-mono tracking-widest text-[#0C2D48]/60 uppercase mb-4">
                OUR VISION
              </span>
              <h3 className="text-2xl md:text-3xl font-heading font-semibold text-[#0C2D48] mb-4">
                A Trusted Partner for Regional Expansion
              </h3>
              <p className="text-sm md:text-base text-[#0C2D48]/75 leading-relaxed mb-4">
                Our vision is to be the premier sovereign advisory partner for international businesses operating in the UAE, renowned for clarity, reliability, and institutional precision.
              </p>
              <p className="text-sm md:text-base text-[#0C2D48]/75 leading-relaxed">
                As the UAE economic landscape matures, we empower founders with the foresight and compliance architecture needed to scale regionally and globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: 6-Step Formation Lifecycle (Equitify 3x2 Grid)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-dark text-canvas-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12 md:mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-3">
              METHODOLOGY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-canvas-light mb-4">
              Full Cycle Under One Point of Contact.
            </h2>
            <p className="text-sm md:text-base text-canvas-light/75 leading-relaxed">
              Most firms treat each phase as a separate disconnected task. We keep the entire lifecycle connected so every decision strengthens your banking and ownership structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline-dark/40 border border-hairline-dark/40 relative corner-crosshair-wrap">
            <CornerCrosshairs color="text-brand-green/60" size={12} />

            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-canvas-dark-card/90 p-8 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-semibold text-brand-green">
                      {step.number}
                    </span>
                    <span className="w-8 h-8 rounded-full border border-hairline-dark/50 flex items-center justify-center text-brand-green">
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-canvas-light mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-muted-light/90 leading-relaxed mb-4">
                    {step.summary}
                  </p>
                  {step.points && (
                    <ul className="space-y-2 border-t border-hairline-dark/20 pt-4 text-xs text-canvas-light/75">
                      {step.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <span className="text-brand-green font-bold" aria-hidden="true">✓</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Who Sets the Standard (Advisory Leadership Roster)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-canvas-light text-text-primary-dark border-t border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mb-12 md:mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-navy/60 uppercase mb-3">
              LEADERSHIP
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-tight text-brand-navy">
              Who Sets the Standard.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadershipRoster.map((leader) => (
              <div
                key={leader.name}
                className="group relative border border-hairline-light/40 bg-canvas-light-card p-4 transition-transform duration-200 hover:-translate-y-1 corner-crosshair-wrap"
              >
                <CornerCrosshairs color="text-brand-green/60" size={10} />
                <div className="relative aspect-[4/3] overflow-hidden bg-canvas-dark mb-4">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-heading font-semibold text-brand-navy mb-1">
                  {leader.name}
                </h3>
                <p className="text-xs font-mono text-brand-green uppercase tracking-wider mb-3">
                  {leader.role}
                </p>
                <p className="text-xs text-text-secondary-dark leading-relaxed">
                  {leader.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: Atmospheric Amber Horizon Glow Banner
          ========================================================================= */}
      <AtmosphericBanner
        eyebrow="DIRECT ENGAGEMENT"
        headline="Institutional Structuring. Zero Compromise."
        subheadline="Schedule an executive briefing with our corporate structuring desk in Dubai Downtown or DIFC."
        ctaText="BOOK BRIEFING"
        ctaTo={ROUTES.contact}
        glow="green"
      />
    </div>
  );
}
