import React from 'react';
import { cn } from '@/lib/utils';

export interface HairlineDividerProps {
  orientation?: 'horizontal' | 'vertical';
  canvas?: 'dark' | 'light';
  className?: string;
}

export const HairlineDivider: React.FC<HairlineDividerProps> = ({
  orientation = 'horizontal',
  canvas = 'dark',
  className = '',
}) => {
  const isHorizontal = orientation === 'horizontal';
  const colorClass =
    canvas === 'dark' ? 'bg-[rgba(226,226,226,0.15)]' : 'bg-[rgba(0,0,0,0.08)]';

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 pointer-events-none select-none',
        isHorizontal ? 'h-px w-full' : 'w-px h-full self-stretch',
        colorClass,
        className
      )}
    />
  );
};
