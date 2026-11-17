import React from 'react';
import { ArrowUpRight, MapPin, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Image } from '@/components/ui/image';

export interface PropertySetupCardProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  jurisdiction: string;
  structure: string;
  taxStatus: string;
  href?: string;
  to?: string;
  className?: string;
}

export const PropertySetupCard: React.FC<PropertySetupCardProps> = ({
  title,
  imageSrc,
  imageAlt,
  jurisdiction,
  structure,
  taxStatus,
  href,
  to,
  className = '',
}) => {
  const cardContent = (
    <>
      {/* Zoomable Image Layer */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        loading="lazy"
        sizes="(min-width: 1280px) 286px, (min-width: 1024px) calc((100vw - 136px) / 4), (min-width: 768px) calc((100vw - 72px) / 2), calc(100vw - 48px)"
        className="absolute inset-0 h-full w-full object-cover filter brightness-[1.05] contrast-[1.0] saturate-[0.4] transition-transform duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105 motion-reduce:transform-none"
      />

      {/* 4-Layer Atmospheric Composite Overlay */}
      <div className="absolute inset-0 bg-[#707070]/16 pointer-events-none" />
      <div className="absolute inset-0 bg-[#22C55E]/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[#E8A72E]/20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C2D48]/[0.02] via-[#0C2D48]/60 to-[#05131F] opacity-90 pointer-events-none" />

      {/* Top Action / Arrow Enclosure */}
      <div className="absolute top-6 right-6 z-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white transition-all duration-300 group-hover:bg-[#22C55E] group-hover:text-[#05131F] group-hover:scale-105">
          <ArrowUpRight className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      {/* Bottom Content & Meta Chips */}
      <div className="absolute bottom-0 inset-x-0 p-6 z-10 transition-transform duration-300 ease-out group-hover:-translate-y-1">
        <h4 className="text-2xl font-heading font-normal tracking-[-0.03em] text-[#FBFBFB] mb-4">
          {title}
        </h4>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90">
            <MapPin className="w-3 h-3 text-[#22C55E]" />
            <span>{jurisdiction}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90">
            <Shield className="w-3 h-3 text-[#E8A72E]" />
            <span>{structure}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[#22C55E]">
            <CheckCircle className="w-3 h-3 text-[#22C55E]" />
            <span>{taxStatus}</span>
          </span>
        </div>
      </div>
    </>
  );

  const containerClasses = cn(
    'group relative h-[460px] w-full overflow-hidden rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#05131F] select-none block transition-all duration-300 hover:shadow-[0_16px_36px_rgba(12,45,72,0.15)] hover:border-[#22C55E]/40',
    className
  );

  if (to) {
    return (
      <Link to={to} className={containerClasses}>
        {cardContent}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={containerClasses}>
        {cardContent}
      </a>
    );
  }

  return <div className={containerClasses}>{cardContent}</div>;
};
