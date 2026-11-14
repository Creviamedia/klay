import React from 'react';
import { cn } from '@/lib/utils';

export interface HairlineGridProps {
  canvas?: 'dark' | 'light';
  columns?: 2 | 4;
  className?: string;
}

export const HairlineGrid: React.FC<HairlineGridProps> = ({
  canvas = 'dark',
  columns = 4,
  className = '',
}) => {
  const borderClass =
    canvas === 'dark' ? 'border-[rgba(226,226,226,0.15)]' : 'border-[rgba(0,0,0,0.08)]';

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 max-w-7xl mx-auto px-6 lg:px-8 grid h-full z-0',
        columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2',
        className
      )}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-full border-r last:border-r-0',
            borderClass
          )}
        />
      ))}
    </div>
  );
};
