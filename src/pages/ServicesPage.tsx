import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, BriefcaseBusiness, Building2, Globe2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ServicePackageCard } from '@/components/ui/service-package-card';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { AtmosphericBanner } from '@/components/ui/AtmosphericBanner';
import { Link } from '@/components/ui/link';
import { Image } from '@/components/ui/image';
import { JURISDICTION_SERVICES, SERVICE_PACKAGES } from '@/lib/data';
import { ROUTES } from '@/lib/routes';

const bookingHref = ROUTES.contact;

const heroServices = [
  {
    title: 'Company Formation',
    description: 'Build your UAE business on the right foundation.',
    href: '/services/mainland-company-setup/',
    icon: Building2,
  },
  {
    title: 'Free Zone Solutions',
    description: 'Find the right jurisdiction for your plans.',
    href: '/services/free-zone-company-setup/',
    icon: Globe2,
  },
  {
    title: 'Corporate Advisory',
    description: 'Get guidance tailored to your business goals.',
    href: ROUTES.contact,
    icon: BriefcaseBusiness,
  },
];

export default function ServicesPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate overflow-hidden bg-[#FBFBFB] text-[#0C2D48]">
      {/* 1. OBSIDIAN HERO */}
      <section className="relative isolate flex min-h-[600px] items-center overflow-hidden bg-[#05131F] pb-16 pt-32 text-white">
        <Image
          src="/images/site/services-dubai-sunset.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          priority
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] opacity-25 xl:object-center"
        />
        {/* Ambient Horizon Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-green-horizon-glow opacity-80"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 lg:px-12">
          <div className="grid items-center gap-12 xl:grid-cols-[minmax(0,1.3fr)_minmax(380px,0.8fr)] xl:gap-16">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
                Our Institutional Services
              </div>
              <h1 className="font-heading text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
                UAE Business Setup &amp; <br />
                <span className="font-semibold text-white">Corporate Services.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                Explore our UAE company formation packages, free zone solutions, corporate advisory
                and business support services. Find the right option for your business goals with
                guidance from Klay Consultants.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <EquitifyButton href={ROUTES.contact} variant="green" size="lg">
                  BOOK A MEETING
                </EquitifyButton>
                <EquitifyButton href="#packages" variant="outline" size="lg" showArrow={false}>
                  <span>EXPLORE SERVICES</span>
                  <ArrowDown className="ml-2 h-4 w-4" />
                </EquitifyButton>
              </div>
            </motion.div>

            {/* Quick overview sidecard */}
            <div className="relative mx-auto w-full max-w-xl xl:ml-auto">
              <div className="relative border border-white/10 bg-[#0C2D48]/40 p-6 backdrop-blur-xl">
                <CornerCrosshairs />
                <div className="mb-6 border-b border-white/10 pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                    How We Can Help
                  </p>
                  <p className="mt-1 text-sm text-white/70">The right support for your next venture.</p>
                </div>
                <div className="space-y-3">
                  {heroServices.map(({ title, description, href, icon: Icon }, index) => (
                    <motion.div
                      key={title}
                      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.18 + index * 0.12 }}
                    >
                      <Link
                        href={href}
                        className="group flex min-h-[76px] items-center gap-4 border border-white/10 bg-white/[0.02] px-4 py-4 text-white transition-all duration-300 hover:border-[#22C55E]/50 hover:bg-white/[0.06]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-white">{title}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-white/60">{description}</span>
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-[#22C55E] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-6 border-t border-white/10 pt-4 text-center text-xs uppercase tracking-widest text-white/40">
                  Clear guidance · Thoughtful setup · UAE-wide support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PACKAGES (PORCELAIN) */}
      <section id="packages" className="border-b border-[#0C2D48]/10 bg-[#FBFBFB] py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <ScrollReveal className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Business Setup Packages
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#0C2D48] sm:text-4xl lg:text-5xl">
              Turnkey UAE Business Setup <span className="font-semibold">Packages</span>
            </h2>
            <p className="mt-4 text-lg text-[#0C2D48]/70">
              Explore packages and comprehensive legal inclusions designed to support your UAE commercial launch.
            </p>
          </ScrollReveal>

          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_PACKAGES.map((service, index) => (
              <ScrollReveal key={service.title} delay={(index % 3) * 65} className="h-full">
                <ServicePackageCard
                  number={String(index + 1).padStart(2, '0')}
                  title={service.title}
                  badge={service.badge}
                  features={service.features}
                  bookingHref={service.href || '/services/free-zone-company-setup/'}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. JURISDICTIONS (OBSIDIAN) */}
      <section id="jurisdictions" className="bg-[#05131F] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <ScrollReveal className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                Explore Your Options
              </p>
              <h2 className="mt-3 font-heading text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl">
                Explore UAE Free Zones &amp; <span className="font-semibold text-white">Business Jurisdictions</span>
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Explore jurisdiction-specific licenses, visas and support. Expand each card to view listed inclusions.
              </p>
            </div>
            <Link
              href="#packages"
              className="inline-flex w-fit items-center gap-2 border-b border-[#22C55E] pb-1 text-xs font-semibold uppercase tracking-widest text-[#22C55E] transition-colors hover:text-white"
            >
              Back to packages <ArrowUpRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
            {JURISDICTION_SERVICES.map((service, index) => (
              <ScrollReveal key={service.number} delay={(index % 3) * 55} className="h-full">
                <ServicePackageCard
                  number={service.number}
                  title={service.title}
                  features={service.features}
                  bookingHref={service.href || '/services/free-zone-company-setup/'}
                  expandable
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection layout="marquee" />

      {/* 4. ATMOSPHERIC CALL TO ACTION */}
      <AtmosphericBanner
        eyebrow="READY TO LAUNCH IN THE UAE?"
        headline="Start Your Corporate Setup with Absolute Precision."
        subheadline="Talk with our senior legal consultants about your commercial activities and get clear, transparent cost estimates."
        ctaText="SCHEDULE ADVISORY SESSION"
        ctaTo={ROUTES.contact}
        glow="green"
      />
    </div>
  );
}
