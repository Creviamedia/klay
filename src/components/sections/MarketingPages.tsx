import { Check } from 'lucide-react';
import { COMPANY } from '@/lib/data';
import { ROUTES } from '@/lib/routes';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[#05131F] pb-16 pt-32 text-white border-b border-white/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-green-horizon-glow opacity-60"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
          {eyebrow}
        </div>
        <h1 className="font-heading text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/70">
          {description}
        </p>
      </div>
    </section>
  );
}

export function PageCTA({
  title = 'Ready to take the next step?',
  description = 'Talk with our team about your requirements and get clear guidance on the options available to you.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="bg-[#05131F] py-20 text-white lg:py-28 border-t border-white/10">
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="relative border border-white/10 bg-[#0C2D48]/30 p-8 text-center sm:p-14">
          <CornerCrosshairs />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-green-horizon-glow opacity-50"
          />
          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              START YOUR JOURNEY
            </span>
            <h2 className="font-heading text-3xl font-light tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <EquitifyButton href={ROUTES.contact} variant="green" size="lg">
                CONTACT OUR TEAM
              </EquitifyButton>
              <EquitifyButton
                href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}
                variant="outline"
                size="lg"
                showArrow={false}
              >
                CALL {COMPANY.phone}
              </EquitifyButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-[#0C2D48]/80">
          <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#16A34A]">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
