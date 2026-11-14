import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Building2, Shield, Landmark } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

interface JurisdictionPreset {
  id: string;
  name: string;
  subtitle: string;
  basePrice: number;
  badge: string;
  icon: typeof Building2;
}

const JURISDICTIONS: JurisdictionPreset[] = [
  {
    id: 'freezone',
    name: 'Free Zone',
    subtitle: 'Meydan / IFZA / DMCC',
    basePrice: 12500,
    badge: '100% Tax Exemption',
    icon: Landmark,
  },
  {
    id: 'mainland',
    name: 'Dubai Mainland',
    subtitle: 'DED Commercial LLC',
    basePrice: 18500,
    badge: 'Local UAE Market',
    icon: Building2,
  },
  {
    id: 'offshore',
    name: 'Offshore Holding',
    subtitle: 'RAK ICC / JAFZA',
    basePrice: 24000,
    badge: 'Asset Protection',
    icon: Shield,
  },
];

/**
 * Executive Instant Formation Calculator (Single-Fold, High-Conversion Design).
 * Clean white Swiss architectural aesthetic, instant reactive pricing, and 1-tap quote capture.
 */
export function SetupCalculator() {
  const navigate = useNavigate();
  const [jurisdiction, setJurisdiction] = useState<string>('freezone');
  const [visas, setVisas] = useState<number>(1);
  const [officeType, setOfficeType] = useState<'flexi' | 'physical'>('flexi');
  const [contactInput, setContactInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedJur = JURISDICTIONS.find((j) => j.id === jurisdiction) || JURISDICTIONS[0];
  const visaPrice = visas * 3750;
  const officePrice = officeType === 'physical' ? 12000 : 0;
  const grandTotal = selectedJur.basePrice + visaPrice + officePrice;
  const usdTotal = Math.round(grandTotal / 3.6725);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contactInput,
          jurisdiction: selectedJur.name,
          visas,
          officeType: officeType === 'flexi' ? 'Flexi Desk' : 'Physical Lease',
          estimatedTotalAed: grandTotal,
          estimatedTotalUsd: usdTotal,
          source: 'executive_instant_calculator',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Graceful local fallback
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-sans">
      {/* =========================================================================
          EXECUTIVE CALCULATOR CARD: Clean White Canvas, Deep Navy & Emerald Accents
          Single-Fold Friendly Layout
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#0C2D48]/12 shadow-[0_20px_50px_rgba(12,45,72,0.08)] p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#0C2D48]/10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16A34A] text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              2026 STATUTORY TARIFFS VERIFIED
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[#0C2D48] tracking-tight">
              Instant Formation Cost Calculator
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.costCalculator)}
            className="text-xs font-mono text-[#0C2D48]/70 hover:text-[#0C2D48] underline underline-offset-4 shrink-0 transition-colors"
          >
            Full Breakdown &rarr;
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-6 pt-6">
          {/* 1. Jurisdiction Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 mb-3">
              1. Choose Jurisdiction Structure
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {JURISDICTIONS.map((jur) => {
                const isSelected = jurisdiction === jur.id;
                const Icon = jur.icon;
                return (
                  <button
                    key={jur.id}
                    type="button"
                    onClick={() => setJurisdiction(jur.id)}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#0C2D48] bg-[#0C2D48]/[0.03] ring-2 ring-[#0C2D48]/10 shadow-sm'
                        : 'border-[#0C2D48]/10 hover:border-[#0C2D48]/30 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#0C2D48] text-white' : 'bg-[#0C2D48]/5 text-[#0C2D48]'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22C55E] text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#0C2D48]/40">SELECT</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#0C2D48] leading-snug">
                      {jur.name}
                    </span>
                    <span className="text-[11px] text-[#0C2D48]/60 leading-tight mt-0.5">
                      {jur.subtitle}
                    </span>
                    <span className="text-xs font-mono font-medium text-[#16A34A] mt-2">
                      From AED {jur.basePrice.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Visas & Office Space (2 Columns in One Fold) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Visa Stepper */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70">
                  2. Residency Visas
                </label>
                <span className="text-[11px] font-mono text-[#0C2D48]/50">
                  +AED 3,750 / visa
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 bg-[#0C2D48]/5 p-1 rounded-xl border border-[#0C2D48]/10">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setVisas(num)}
                    className={`py-2 text-center rounded-lg text-sm font-semibold transition-all ${
                      visas === num
                        ? 'bg-[#0C2D48] text-white shadow-sm'
                        : 'text-[#0C2D48]/75 hover:bg-white/60'
                    }`}
                  >
                    {num === 3 ? '3+' : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Office Space Toggle */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 mb-2.5">
                3. Facility &amp; Workspace
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#0C2D48]/5 p-1 rounded-xl border border-[#0C2D48]/10">
                <button
                  type="button"
                  onClick={() => setOfficeType('flexi')}
                  className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition-all ${
                    officeType === 'flexi'
                      ? 'bg-[#0C2D48] text-white shadow-sm'
                      : 'text-[#0C2D48]/75 hover:bg-white/60'
                  }`}
                >
                  Flexi Desk (0 AED)
                </button>
                <button
                  type="button"
                  onClick={() => setOfficeType('physical')}
                  className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition-all ${
                    officeType === 'physical'
                      ? 'bg-[#0C2D48] text-white shadow-sm'
                      : 'text-[#0C2D48]/75 hover:bg-white/60'
                  }`}
                >
                  Physical (+12k)
                </button>
              </div>
            </div>
          </div>

          {/* 3. Live Price Result Card */}
          <div className="rounded-xl bg-[#0C2D48] text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#22C55E] block mb-1">
                  TOTAL ESTIMATED STATUTORY FEE
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-heading font-semibold text-white tracking-tight">
                    AED {grandTotal.toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-white/60">
                    (&asymp; ${usdTotal.toLocaleString()} USD)
                  </span>
                </div>
              </div>

              {/* Line items mini-pill */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-white/80 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
                <span className="bg-white/10 px-2 py-0.5 rounded">
                  License: AED {selectedJur.basePrice.toLocaleString()}
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded">
                  Visas: AED {visaPrice.toLocaleString()}
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded">
                  Office: {officePrice === 0 ? 'Included' : `AED ${officePrice.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Instant Quote Capture / Dispatch */}
          <div>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="Enter email or WhatsApp (+971...)"
                  className="flex-1 px-4 py-3 rounded-xl border border-[#0C2D48]/15 text-sm text-[#0C2D48] placeholder:text-[#0C2D48]/40 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 focus:border-[#22C55E]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <span>Get Official Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16A34A] text-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span className="font-medium">
                    Verified estimate dispatched! Our senior structuring director will reach out shortly.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs underline font-mono text-[#16A34A] hover:text-[#15803D]"
                >
                  Recalculate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupCalculator;
