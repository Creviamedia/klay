import React, { useState } from 'react';
import { Instagram, Mail, MapPin, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';
import { Link } from '@/components/ui/link';
import { Image } from '@/components/ui/image';
import { COMPANY, NAV_LINKS } from '@/lib/data';
import { CONTACT_CHANNELS } from '@/lib/contact';
import { ROUTES } from '@/lib/routes';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';

export function Footer({ flushTop = false }: { flushTop?: boolean }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    // Optional: could push to newsletter or lead endpoint
  };

  return (
    <footer className={`relative overflow-hidden bg-canvas-dark text-canvas-light border-t border-hairline-dark/30 ${flushTop ? '' : 'mt-16 md:mt-24'}`}>
      {/* Ambient Green Horizon Glow Effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 md:h-[32rem] bg-green-horizon-glow opacity-60"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        {/* Massive Editorial Headline (Equitify Signature) */}
        <div className="relative border-b border-hairline-dark/30 pb-16 md:pb-24 mb-16 corner-crosshair-wrap">
          <CornerCrosshairs color="text-brand-green/60" size={12} />
          <div className="max-w-4xl">
            <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-4">
              SOVEREIGN UAE ADVISORY
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-medium tracking-tight text-canvas-light leading-[1.05] mb-8">
              Start Your UAE Journey, <br className="hidden sm:inline" />
              <span className="text-brand-green">Skip The Friction.</span>
            </h2>
            <p className="max-w-2xl text-base md:text-lg text-canvas-light/75 font-normal leading-relaxed mb-8">
              {COMPANY.tagline}. Institutional commercial structuring, direct government liaison, and 100% foreign ownership—delivered under one accountable point of contact.
            </p>

            {/* Quick newsletter / consultation inquiry */}
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your corporate email..."
                className="flex-1 bg-canvas-dark-card/80 border border-hairline-dark/50 px-4 py-3 text-sm text-canvas-light placeholder:text-text-muted-light/60 rounded-full focus:outline-none focus:border-brand-green transition-colors"
              />
              <EquitifyButton type="submit" variant="green" size="md">
                {submitted ? 'REQUEST SENT' : 'GET ADVICE'}
              </EquitifyButton>
            </form>
            {submitted && (
              <p className="mt-3 text-xs font-mono text-brand-green">
                ✓ Thank you. A senior corporate advisory partner will connect within 24 hours.
              </p>
            )}
          </div>
        </div>

        {/* 4-Column Structured Directory */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 pb-16 border-b border-hairline-dark/20 text-sm">
          {/* Col 1: Brand */}
          <div>
            <Link href="/" aria-label={`${COMPANY.name} home`} className="inline-flex mb-6">
              <Image
                src="/klay-logo.png"
                alt="Klay Consultants"
                width={144}
                height={50}
                className="h-auto w-32 brightness-0 invert"
              />
            </Link>
            <p className="text-xs font-mono text-brand-gold/80 uppercase tracking-widest mb-3">
              Dubai · Abu Dhabi · RAK
            </p>
            <p className="text-xs text-text-muted-light/80 leading-relaxed max-w-xs">
              Premier corporate setup, residency structuring, and sovereign wealth consulting in the United Arab Emirates.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="text-xs font-mono tracking-widest text-brand-green uppercase mb-5">
              Explore
            </h3>
            <ul className="space-y-3 font-medium">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-canvas-light/80 hover:text-brand-green transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Direct Contact */}
          <div>
            <h3 className="text-xs font-mono tracking-widest text-brand-green uppercase mb-5">
              Direct Contact
            </h3>
            <address className="space-y-3.5 not-italic text-canvas-light/80">
              <a
                href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 hover:text-brand-green transition-colors"
              >
                <Phone className="h-4 w-4 text-brand-green shrink-0" aria-hidden="true" />
                <span>{COMPANY.phone}</span>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-3 hover:text-brand-green transition-colors"
              >
                <Mail className="h-4 w-4 text-brand-green shrink-0" aria-hidden="true" />
                <span>{COMPANY.email}</span>
              </a>
              <div className="flex items-start gap-3 text-xs leading-relaxed text-text-muted-light">
                <MapPin className="h-4 w-4 text-brand-green shrink-0 mt-0.5" aria-hidden="true" />
                <span>{COMPANY.address}</span>
              </div>
            </address>
          </div>

          {/* Col 4: Channels & VIP WhatsApp */}
          <div>
            <h3 className="text-xs font-mono tracking-widest text-brand-green uppercase mb-5">
              VIP Channels
            </h3>
            <p className="text-xs text-text-muted-light/80 mb-4">
              Need immediate advisory on license eligibility or Golden Visa requirements? Message directly on WhatsApp:
            </p>
            <div className="flex items-center gap-3 mb-6">
              <a
                href={CONTACT_CHANNELS.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Direct WhatsApp consultation"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-green/40 text-xs font-mono text-brand-green hover:bg-brand-green/10 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp VIP</span>
              </a>
              <a
                href={CONTACT_CHANNELS.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Klay Consultants on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline-dark/50 text-canvas-light/80 hover:text-brand-green hover:border-brand-green transition-colors"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <p className="text-[11px] font-mono text-text-muted-light/60">
              Hours: Mon - Sat, 9:00 AM - 6:00 PM GST
            </p>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-text-muted-light/70 font-mono">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href={ROUTES.privacy} className="hover:text-canvas-light transition-colors">
              Privacy Policy
            </Link>
            <Link href={ROUTES.terms} className="hover:text-canvas-light transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
