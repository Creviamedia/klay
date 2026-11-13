import React, { useState } from 'react';
import { CornerCrosshairs } from './CornerCrosshairs';

export interface ProcessStep {
  number: string; // e.g. "01"
  title: string;
  summary: string;
  details?: string[];
  duration?: string;
}

export interface ProcessTabsProps {
  steps: ProcessStep[];
  className?: string;
  eyebrow?: string;
  heading?: string;
}

/**
 * 4-Step Numbered Process Tabs matching Equitify Asset's structural layout.
 * Features numbered column triggers, gold active underlines, and smooth tab switching.
 */
export const ProcessTabs: React.FC<ProcessTabsProps> = ({
  steps,
  className = '',
  eyebrow = 'OUR PROCESS',
  heading = 'From First Consultation to Full Sovereign Ownership',
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!steps || steps.length === 0) return null;
  const currentStep = steps[activeIdx] || steps[0];

  return (
    <div className={`relative border border-hairline-dark/30 dark:border-hairline-dark bg-canvas-dark text-canvas-light p-6 md:p-12 corner-crosshair-wrap ${className}`}>
      <CornerCrosshairs color="text-brand-green/60" size={12} />

      {/* Header section */}
      <div className="mb-8 md:mb-12">
        {eyebrow && (
          <span className="inline-block text-xs font-mono tracking-widest text-brand-green uppercase mb-3">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium tracking-tight text-canvas-light">
          {heading}
        </h2>
      </div>

      {/* Tabs navigation list */}
      <div
        role="tablist"
        aria-label="Process steps"
        className="grid grid-cols-2 md:grid-cols-4 border-b border-hairline-dark/40 mb-8"
      >
        {steps.map((step, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={step.number}
              role="tab"
              aria-selected={isActive}
              aria-controls={`step-panel-${idx}`}
              id={`step-tab-${idx}`}
              onClick={() => setActiveIdx(idx)}
              className={`text-left p-4 md:p-6 transition-colors duration-200 cursor-pointer relative focus-visible:outline-2 focus-visible:outline-brand-green ${
                isActive
                  ? 'bg-canvas-dark-card/60 text-canvas-light'
                  : 'text-text-muted-light/70 hover:text-canvas-light hover:bg-canvas-dark-card/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-mono text-sm md:text-base font-semibold ${
                    isActive ? 'text-brand-green' : 'text-brand-green/60'
                  }`}
                >
                  {step.number}
                </span>
                {step.duration && (
                  <span className="text-[11px] font-mono text-text-muted-light/60 uppercase">
                    {step.duration}
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base font-medium line-clamp-1">{step.title}</p>

              {/* Active bottom border indicator */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green shadow-green-glow"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active step content pane */}
      <div
        role="tabpanel"
        id={`step-panel-${activeIdx}`}
        aria-labelledby={`step-tab-${activeIdx}`}
        className="p-4 md:p-8 bg-canvas-dark-card/40 border border-hairline-dark/20 relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 items-start">
          <div className="md:col-span-1">
            <span className="font-mono text-3xl md:text-5xl font-bold text-brand-green block mb-2">
              {currentStep.number}
            </span>
            <h3 className="text-xl md:text-2xl font-heading font-semibold text-canvas-light mb-2">
              {currentStep.title}
            </h3>
            {currentStep.duration && (
              <span className="inline-block px-3 py-1 text-xs font-mono text-brand-green bg-brand-green/10 rounded-full border border-brand-green/20">
                Timeline: {currentStep.duration}
              </span>
            )}
          </div>
          <div className="md:col-span-2">
            <p className="text-base md:text-lg text-canvas-light/90 leading-relaxed mb-6">
              {currentStep.summary}
            </p>
            {currentStep.details && currentStep.details.length > 0 && (
              <ul className="space-y-3 border-t border-hairline-dark/30 pt-4">
                {currentStep.details.map((item, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-3 text-sm text-canvas-light/80">
                    <span className="text-brand-green font-bold" aria-hidden="true">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
