import React, { useState } from 'react';
import { CornerCrosshairs } from './CornerCrosshairs';

export interface AccordionItem {
  number: string;
  question: string;
  answer: string | React.ReactNode;
}

export interface NumberedAccordionProps {
  items: AccordionItem[];
  className?: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
}

/**
 * Hairline Numbered FAQ Accordion matching Equitify Asset's format.
 * Features two-digit gold indices ("01", "02"...), smooth height disclosure, and corner crosshairs.
 */
export const NumberedAccordion: React.FC<NumberedAccordionProps> = ({
  items,
  className = '',
  eyebrow = 'FAQ',
  heading = 'What to Know Before You Establish',
  subheading = 'Direct answers to the questions that matter most before incorporating and long after your license is active.',
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={`relative border border-hairline-dark/30 dark:border-hairline-dark bg-canvas-dark text-canvas-light p-6 md:p-12 corner-crosshair-wrap ${className}`}>
      <CornerCrosshairs color="text-brand-green/60" size={12} />

      {/* Header */}
      <div className="max-w-2xl mb-10 md:mb-14">
        {eyebrow && (
          <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-3">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium tracking-tight text-canvas-light mb-4">
          {heading}
        </h2>
        {subheading && (
          <p className="text-sm md:text-base text-canvas-light/70 leading-relaxed">
            {subheading}
          </p>
        )}
      </div>

      {/* Accordion Stack */}
      <div className="border-t border-hairline-dark/30 divide-y divide-hairline-dark/30">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={item.number} className="transition-colors duration-150">
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${idx}`}
                id={`accordion-trigger-${idx}`}
                className="w-full py-6 md:py-8 flex items-center justify-between text-left group focus-visible:outline-2 focus-visible:outline-brand-green cursor-pointer"
              >
                <div className="flex items-baseline gap-4 md:gap-8 pr-4">
                  <span className="font-mono text-xs md:text-sm font-semibold text-brand-green/80 group-hover:text-brand-green transition-colors">
                    {item.number}
                  </span>
                  <span className="text-base md:text-xl font-heading font-medium text-canvas-light group-hover:text-brand-green transition-colors">
                    {item.question}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-hairline-dark/40 text-brand-green group-hover:border-brand-green group-hover:text-brand-green transition-transform duration-200 ${
                    isOpen ? 'rotate-45' : 'rotate-0'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div
                  id={`accordion-content-${idx}`}
                  role="region"
                  aria-labelledby={`accordion-trigger-${idx}`}
                  className="pb-6 md:pb-8 pl-8 md:pl-16 pr-4 text-sm md:text-base text-canvas-light/80 leading-relaxed"
                >
                  {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
