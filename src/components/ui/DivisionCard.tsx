import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface DivisionCardProps {
  index: string; // e.g. "01"
  title: string;
  description: string;
  features?: string[];
  href?: string;
  to?: string;
  className?: string;
}

/**
 * Section 5 Institutional Division Card featuring sequential index numbering,
 * 32px display heading, hairline structural borders, and diagonal arrow micro-interaction.
 */
export const DivisionCard: React.FC<DivisionCardProps> = ({
  index,
  title,
  description,
  features,
  href,
  to,
  className = '',
}) => {
  const cardContent = (
    <div className="flex flex-col justify-between h-full p-8 relative z-10">
      <div>
        <div className="flex items-center justify-between mb-8">
          <span className="font-mono text-xs tracking-widest uppercase text-white/40">
            {index}
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 transition-all duration-300 group-hover:bg-[#22C55E] group-hover:text-[#05131F] group-hover:border-[#22C55E] group-hover:scale-105">
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        <h3 className="text-2xl lg:text-3xl font-heading font-normal tracking-[-0.03em] text-[#FBFBFB] mb-4 group-hover:text-white transition-colors duration-200">
          {title}
        </h3>

        <p className="text-sm lg:text-base text-white/70 font-normal leading-relaxed tracking-[-0.02em] mb-6">
          {description}
        </p>
      </div>

      {features && features.length > 0 && (
        <div className="pt-6 border-t border-[rgba(226,226,226,0.15)] flex flex-wrap gap-2">
          {features.map((feat, i) => (
            <span
              key={i}
              className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-white/80 border border-white/10"
            >
              {feat}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const containerClasses = cn(
    'group relative rounded-xl border border-[rgba(226,226,226,0.15)] bg-[#05131F] hover:bg-[#0A1E30] transition-all duration-300 hover:border-[#22C55E]/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_24px_rgba(34,197,94,0.12)] block overflow-hidden select-none',
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
