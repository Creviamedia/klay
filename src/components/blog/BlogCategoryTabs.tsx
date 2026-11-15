import React from 'react';
import type { CategoryPillar } from '@/lib/blog-engine';

interface Props {
  pillars: CategoryPillar[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function BlogCategoryTabs({ pillars, activeCategory, onSelectCategory }: Props) {
  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {pillars.map((pillar) => {
          const isSelected = activeCategory === pillar.name;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => onSelectCategory(pillar.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#0C2D48] text-white shadow-sm ring-1 ring-[#0C2D48]'
                  : 'bg-white border border-[#0C2D48]/12 text-[#0C2D48]/75 hover:border-[#0C2D48]/30 hover:text-[#0C2D48]'
              }`}
            >
              <span>{pillar.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#0C2D48]/5 text-[#0C2D48]/60'
                }`}
              >
                {pillar.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
