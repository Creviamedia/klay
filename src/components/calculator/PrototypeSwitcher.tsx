import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export interface VariantOption {
  key: string;
  name: string;
  description: string;
}

const DEFAULT_VARIANTS: VariantOption[] = [
  { key: 'A', name: 'Executive Ledger', description: 'Single-Fold Swiss Card + Live Fee Tape' },
  { key: 'B', name: 'Progressive Wizard', description: '4-Step Guided Flow (Stripe Atlas / Mercury)' },
  { key: 'C', name: 'Financial Slider & Matrix', description: 'Interactive Sliders + Visual Cost Breakdown' },
];

export function PrototypeSwitcher({
  current,
  variants = DEFAULT_VARIANTS,
  label = 'PROTOTYPE',
}: {
  current: string;
  variants?: VariantOption[];
  label?: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeKey = current.toUpperCase();
  const currentIndex = variants.findIndex((v) => v.key === activeKey);
  const activeVariant = variants[currentIndex >= 0 ? currentIndex : 0];

  const setVariant = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('variant', key);
    setSearchParams(next, { replace: true });
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + variants.length) % variants.length;
    setVariant(variants[prevIdx].key);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % variants.length;
    setVariant(variants[nextIdx].key);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form inputs
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <aside
      aria-label="Interactive Prototype Switcher"
      className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-[#0C2D48]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-white/20 select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-2 pr-3 border-r border-white/15">
        <span className="p-1 rounded-full bg-[#22C55E]/20 text-[#22C55E]">
          <Layers className="w-3.5 h-3.5" />
        </span>
        <span className="text-[11px] font-mono tracking-widest uppercase text-white/60">
          {label}
        </span>
      </div>

      {/* Prev button */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous Variant"
        className="p-1 rounded-full hover:bg-white/15 active:scale-95 transition-all text-white/80 hover:text-white"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Active variant label */}
      <div className="flex items-center gap-2 px-1 text-center min-w-[200px] justify-center">
        <span className="font-mono text-xs font-bold text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded">
          VARIANT {activeVariant.key}
        </span>
        <span className="text-xs font-medium text-white truncate max-w-[150px]">
          {activeVariant.name}
        </span>
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next Variant"
        className="p-1 rounded-full hover:bg-white/15 active:scale-95 transition-all text-white/80 hover:text-white"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Direct toggle pills */}
      <div className="hidden sm:flex items-center gap-1 pl-3 border-l border-white/15">
        {variants.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setVariant(v.key)}
            className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold transition-all ${
              v.key === activeVariant.key
                ? 'bg-[#22C55E] text-[#0C2D48] shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {v.key}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default PrototypeSwitcher;
