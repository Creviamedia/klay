import React from 'react';
import { Image } from '@/components/ui/image';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { KlayLeadForm } from '@/components/forms/KlayLeadForm';
import { COMPANY, IMAGES } from '@/lib/data';
import { CONTACT_CHANNELS } from '@/lib/contact';

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full bg-canvas-light text-text-primary-dark">
      {/* =========================================================================
          HERO & SPLIT FORM SECTION: Equitify /contact format
          ========================================================================= */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Heading & Context */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-brand-green inline-block" aria-hidden="true" />
                <span className="text-xs font-mono uppercase tracking-widest text-brand-green font-semibold">
                  CONTACT US
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-medium tracking-tight text-brand-navy mb-6 leading-[1.05]">
                Connect With Our Team.
              </h1>

              <p className="text-base text-text-secondary-dark leading-relaxed mb-8">
                Have a question about establishing your business, licensing criteria, or Golden Visa eligibility in the UAE? Our corporate structuring team is here to review your requirements with complete confidentiality.
              </p>

              <div className="border-t border-hairline-light/40 pt-6 space-y-4 text-xs font-mono text-text-muted-dark">
                <div className="flex items-center gap-3">
                  <span className="text-brand-green font-bold text-sm">✓</span>
                  <span>Direct government liaison with DED, DIFC &amp; Freezones</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-brand-green font-bold text-sm">✓</span>
                  <span>Fixed-fee transparent proposal with zero hidden charges</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-brand-green font-bold text-sm">✓</span>
                  <span>Same-day confidential consultation response</span>
                </div>
              </div>

              {/* VIP WhatsApp Direct Button */}
              <div className="mt-8">
                <a
                  href={CONTACT_CHANNELS.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-brand-green/40 bg-brand-green/10 text-brand-navy font-semibold text-xs tracking-wider uppercase hover:bg-brand-green hover:text-brand-navy-deep transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4 text-brand-green" />
                  <span>Message Us Directly on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Sovereign Form */}
            <div className="lg:col-span-7 relative corner-crosshair-wrap">
              <CornerCrosshairs color="text-brand-green/60" size={12} />
              <div className="bg-canvas-light-card border border-hairline-light/50 p-6 sm:p-10 shadow-sm">
                <KlayLeadForm
                  variant="light"
                  source="contact-page"
                  title="Send An Inquiry"
                  subtitle="Fill out your details below and a senior advisor will reach out."
                  eyebrow="LEGAL ADVISORY DESK"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 4-Column Office Information Grid (Equitify Signature)
          ========================================================================= */}
      <section className="py-12 md:py-16 bg-canvas-light border-b border-hairline-light/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline-light/30 border border-hairline-light/40 relative corner-crosshair-wrap">
            <CornerCrosshairs color="text-brand-green/70" size={10} />

            {/* Location */}
            <div className="bg-canvas-light-card p-8">
              <span className="w-10 h-10 rounded-full border border-brand-green/30 flex items-center justify-center text-brand-green mb-6">
                <MapPin className="w-5 h-5" />
              </span>
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted-dark mb-2">Office Location</h3>
              <p className="text-sm font-medium text-brand-navy leading-relaxed">
                {COMPANY.address}
              </p>
            </div>

            {/* Phone */}
            <div className="bg-canvas-light-card p-8">
              <span className="w-10 h-10 rounded-full border border-brand-green/30 flex items-center justify-center text-brand-green mb-6">
                <Phone className="w-5 h-5" />
              </span>
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted-dark mb-2">Direct Phone</h3>
              <a
                href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}
                className="text-sm font-medium text-brand-navy hover:text-brand-green transition-colors"
              >
                {COMPANY.phone}
              </a>
            </div>

            {/* Email */}
            <div className="bg-canvas-light-card p-8">
              <span className="w-10 h-10 rounded-full border border-brand-green/30 flex items-center justify-center text-brand-green mb-6">
                <Mail className="w-5 h-5" />
              </span>
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted-dark mb-2">Corporate Email</h3>
              <a
                href={`mailto:${COMPANY.email}`}
                className="text-sm font-medium text-brand-navy hover:text-brand-green transition-colors"
              >
                {COMPANY.email}
              </a>
            </div>

            {/* Hours */}
            <div className="bg-canvas-light-card p-8">
              <span className="w-10 h-10 rounded-full border border-brand-green/30 flex items-center justify-center text-brand-green mb-6">
                <Clock className="w-5 h-5" />
              </span>
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted-dark mb-2">Advisory Hours</h3>
              <p className="text-sm font-medium text-brand-navy">
                Monday – Saturday <br />
                <span className="text-xs text-text-muted-dark font-normal">9:00 AM – 6:00 PM GST</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Photographic Editorial Banner
          ========================================================================= */}
      <section className="relative w-full aspect-[21/9] sm:aspect-[24/8] overflow-hidden bg-canvas-dark border-b border-hairline-dark/40">
        <Image
          src={IMAGES.meeting}
          alt="Klay executive consulting suite in Dubai"
          fill
          className="object-cover opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas-dark/90 via-canvas-dark/40 to-transparent flex items-end p-8 md:p-16">
          <div className="max-w-xl text-canvas-light">
            <span className="text-xs font-mono text-brand-green uppercase tracking-widest block mb-2">
              DUBAI · DIFC · DOWNTOWN
            </span>
            <p className="text-lg md:text-2xl font-heading font-medium">
              Private consultations available by appointment at our executive office suite in Dubai.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
