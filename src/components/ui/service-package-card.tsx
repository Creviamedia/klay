import { Check, ChevronDown } from 'lucide-react';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { Image } from '@/components/ui/image';

interface ServicePackageCardProps {
  number: string;
  title: string;
  features: string[];
  bookingHref: string;
  badge?: string;
  price?: string;
  pricingUnit?: string;
  image?: string;
  expandable?: boolean;
}

export function ServicePackageCard({
  number,
  title,
  image,
  features,
  bookingHref,
  badge,
  price,
  pricingUnit,
  expandable = false,
}: ServicePackageCardProps) {
  return (
    <article className="group relative flex h-full flex-col border border-[#0C2D48]/10 bg-white p-6 transition-all duration-300 hover:border-[#0C2D48]/30 hover:shadow-sm sm:p-7">
      <CornerCrosshairs color="text-[#22C55E]/50" size={12} />

      <div className="mb-4 flex items-center justify-between border-b border-[#0C2D48]/10 pb-4">
        <span className="font-mono text-xs font-semibold tracking-widest text-[#0C2D48]/60">
          PACKAGE // {number}
        </span>
        {badge && (
          <span className="border border-[#22C55E]/30 bg-[#22C55E]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#16A34A]">
            {badge}
          </span>
        )}
      </div>

      {image && (
        <div className="relative mb-5 aspect-[16/9] overflow-hidden border border-[#0C2D48]/10 bg-black/5">
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <h3 className="font-heading text-xl font-semibold leading-snug text-[#0C2D48] sm:text-2xl">
        {title}
      </h3>

      {(price || pricingUnit) && (
        <p className="mt-2 font-mono text-sm font-semibold text-[#0C2D48]">
          {price}
          {price && pricingUnit ? ' ' : ''}
          {pricingUnit && <span className="font-sans text-xs text-[#0C2D48]/60">{pricingUnit}</span>}
        </p>
      )}

      {expandable ? (
        <details className="group/details mt-5 flex-1 border-t border-[#0C2D48]/10 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-[#0C2D48] outline-none transition-colors hover:text-[#16A34A] [&::-webkit-details-marker]:hidden">
            <span>View {features.length} inclusions</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#0C2D48]/60 transition-transform duration-200 group-open/details:rotate-180" />
          </summary>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#0C2D48]/80">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#16A34A]">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <ul className="mt-5 flex-1 space-y-3 border-t border-[#0C2D48]/10 pt-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#0C2D48]/80">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#16A34A]">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 pt-4 border-t border-[#0C2D48]/5">
        <EquitifyButton href={bookingHref} variant="dark" size="sm" className="w-full justify-between">
          BOOK A CONSULTATION
        </EquitifyButton>
      </div>
    </article>
  );
}
