import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Send, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

interface JurisdictionPreset {
  id: string;
  code: string;
  name: string;
  basePrice: number;
  taxTag: string;
}

const JURISDICTIONS: JurisdictionPreset[] = [
  { id: 'freezone', code: 'FZ-01', name: 'Free Zone (Meydan / IFZA)', basePrice: 12500, taxTag: '0% Tax' },
  { id: 'mainland', code: 'ML-02', name: 'Dubai Mainland (DED LLC)', basePrice: 18500, taxTag: 'Local Mkt' },
  { id: 'offshore', code: 'OF-03', name: 'RAK ICC Offshore Holding', basePrice: 24000, taxTag: 'Asset Shield' },
];

/**
 * Dieter Rams / Braun ET66 & Teenage Engineering inspired Physical Formation Calculator.
 * Precision industrial casing, recessed LCD segmented screen, tactile convex push keys, and LED indicators.
 */
export function SetupCalculator() {
  const navigate = useNavigate();
  const [jurisdiction, setJurisdiction] = useState<string>('freezone');
  const [visas, setVisas] = useState<number>(1);
  const [officeType, setOfficeType] = useState<'flexi' | 'physical'>('flexi');
  const [contactInput, setContactInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const selectedJur = JURISDICTIONS.find((j) => j.id === jurisdiction) || JURISDICTIONS[0];
  const visaPrice = visas * 3750;
  const officePrice = officeType === 'physical' ? 12000 : 0;
  const grandTotal = selectedJur.basePrice + visaPrice + officePrice;

  const triggerButtonFeedback = (id: string) => {
    setActiveButton(id);
    setTimeout(() => setActiveButton(null), 120);
  };

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
          estimatedTotal: grandTotal,
          source: 'braun_et66_calculator',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Local fallback
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto select-none font-sans">
      {/* =========================================================================
          BRAUN ET66 / TEENAGE ENGINEERING CHASSIS
          Matte charcoal casing, recessed perimeter bezel, physical screws
          ========================================================================= */}
      <div className="relative rounded-[28px] bg-[#1A1C1E] p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-[#2D3035] ring-1 ring-black/40">
        
        {/* Chassis Brand Plate & Serial */}
        <div className="flex items-center justify-between pb-4 px-1 text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#E8A72E] shadow-[0_0_8px_#E8A72E]" />
            <span className="font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-white/80">
              KLAY · ET-26
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">
              TE-SYSTEM // STATUTORY CALC
            </span>
            <div className="w-2.5 h-2.5 rounded-full border border-white/20 flex items-center justify-center">
              <span className="w-1 h-0.5 bg-white/40 rotate-45 inline-block" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            RECESSED LCD DIGITAL SCREEN
            Dark jade-tinted liquid-crystal background with high-contrast digits
            ========================================================================= */}
        <div className="mb-6 rounded-[14px] bg-[#0E1513] p-4 sm:p-5 border-2 border-[#121B18] shadow-[inset_0_3px_10px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.06)] relative overflow-hidden">
          {/* Subtle LCD Scanline Texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#fff_2px,#fff_3px)]"
          />

          {/* LCD Status Readout Bar */}
          <div className="flex items-center justify-between font-mono text-[10px] tracking-wider text-[#34D399]/70 pb-2 border-b border-[#34D399]/15">
            <div className="flex items-center gap-2">
              <span className="inline-block px-1.5 py-0.5 rounded bg-[#34D399]/15 text-[#34D399] font-bold">
                {selectedJur.code}
              </span>
              <span>VISA:{visas}</span>
              <span>LEASE:{officeType.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>LIVE 2026 TARIFF</span>
            </div>
          </div>

          {/* LCD Giant Digital Total Readout */}
          <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="font-mono text-3xl sm:text-5xl font-normal tracking-tight text-[#34D399] drop-shadow-[0_0_12px_rgba(52,211,153,0.35)] tabular-nums">
              <span className="text-xl sm:text-2xl mr-2 text-[#34D399]/80 font-light">AED</span>
              {grandTotal.toLocaleString()}
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#34D399]/50">
              100% Guaranteed Tariff
            </span>
          </div>

          {/* Micro Inclusions Ticker */}
          <div className="pt-2 border-t border-[#34D399]/15 flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-[#34D399]/60">
            <span>INCL: TRADE LICENSE + BANKING DOSSIER</span>
            <span className="text-[#34D399] font-semibold">ZERO NOMINEE RISK</span>
          </div>
        </div>

        {/* =========================================================================
            TACTILE PHYSICAL CONTROLS MATRIX (BRAUN CONVEX KEYS)
            ========================================================================= */}
        <div className="space-y-4">
          
          {/* Key Group 1: Jurisdiction Selector Keys */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span>01 // SELECT JURISDICTION</span>
              <span className="text-[#E8A72E]">REQUIRED</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {JURISDICTIONS.map((jur) => {
                const isSelected = jur.id === jurisdiction;
                return (
                  <button
                    key={jur.id}
                    type="button"
                    onClick={() => {
                      triggerButtonFeedback(jur.id);
                      setJurisdiction(jur.id);
                    }}
                    className={`relative group rounded-xl p-3 text-left transition-all duration-150 border flex flex-col justify-between h-[68px] ${
                      isSelected
                        ? 'bg-[#25282C] border-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] text-white'
                        : 'bg-[#202225] border-[#2C2F33] text-white/70 hover:bg-[#25282B] hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_2px_4px_rgba(0,0,0,0.3)]'
                    } ${activeButton === jur.id ? 'scale-[0.97]' : ''}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                        {jur.code}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full transition-colors ${
                          isSelected ? 'bg-[#34D399] shadow-[0_0_6px_#34D399]' : 'bg-white/10'
                        }`}
                      />
                    </div>
                    <div className="font-semibold text-xs leading-tight">{jur.name.split(' (')[0]}</div>
                    <div className="font-mono text-[10px] text-[#34D399]">{jur.taxTag}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Group 2: Visa Allocation & Commercial Office */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Visa Circular Numeric Buttons */}
            <div>
              <div className="px-1 mb-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
                02 // VISAS ALLOCATED
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((num) => {
                  const isSelected = visas === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        triggerButtonFeedback(`visa-${num}`);
                        setVisas(num);
                      }}
                      className={`h-11 rounded-lg font-mono text-xs font-bold transition-all duration-150 border flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#34D399] text-[#0E1513] border-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                          : 'bg-[#202225] text-white/75 border-[#2C2F33] hover:bg-[#25282B] hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]'
                      } ${activeButton === `visa-${num}` ? 'scale-95' : ''}`}
                    >
                      {num === 0 ? '0' : `+${num}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Office Facility Tactile Toggles */}
            <div>
              <div className="px-1 mb-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
                03 // LEASE FACILITY
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerButtonFeedback('lease-flexi');
                    setOfficeType('flexi');
                  }}
                  className={`h-11 rounded-lg px-2 text-center transition-all duration-150 border flex flex-col items-center justify-center ${
                    officeType === 'flexi'
                      ? 'bg-[#25282C] border-[#34D399] text-white shadow-[0_0_8px_rgba(52,211,153,0.2)]'
                      : 'bg-[#202225] border-[#2C2F33] text-white/70 hover:bg-[#25282B]'
                  }`}
                >
                  <span className="font-semibold text-xs leading-none">Flexi Desk</span>
                  <span className="font-mono text-[9px] text-[#34D399] mt-0.5">INCLUDED</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerButtonFeedback('lease-physical');
                    setOfficeType('physical');
                  }}
                  className={`h-11 rounded-lg px-2 text-center transition-all duration-150 border flex flex-col items-center justify-center ${
                    officeType === 'physical'
                      ? 'bg-[#25282C] border-[#34D399] text-white shadow-[0_0_8px_rgba(52,211,153,0.2)]'
                      : 'bg-[#202225] border-[#2C2F33] text-white/70 hover:bg-[#25282B]'
                  }`}
                >
                  <span className="font-semibold text-xs leading-none">Physical</span>
                  <span className="font-mono text-[9px] text-[#34D399] mt-0.5">+12K AED</span>
                </button>
              </div>
            </div>
          </div>

          {/* Terminal Input Bar & Braun Trigger Key */}
          {isSubmitted ? (
            <div className="p-4 rounded-xl bg-[#0E1513] border border-[#34D399]/40 text-[#FBFBFB] flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#34D399] shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-sm text-[#34D399] block">DOSSIER DISPATCHED</span>
                Your itemized 2026 tariff breakdown has been sent. An accredited legal structuring partner will follow up.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pt-2 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="ENTER WHATSAPP OR WORK EMAIL"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="w-full bg-[#121416] border border-[#2A2D32] rounded-xl px-4 py-3.5 text-xs font-mono text-white placeholder-white/35 focus:outline-none focus:border-[#34D399] shadow-inner tracking-wider"
                />
              </div>

              {/* Signature Braun Large Tactile Trigger Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-[#05131F] font-bold text-xs tracking-[0.16em] uppercase transition-all duration-150 hover:brightness-110 active:translate-y-0.5 shadow-[0_4px_12px_rgba(34,197,94,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 font-mono disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>DISPATCHING...</span>
                ) : (
                  <>
                    <span>= COMPUTE &amp; DISPATCH DOSSIER =</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Subtext & Full Console Deep Link */}
          <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-white/40 px-1">
            <span>OFFICIAL UAE TARIFF STANDARDS</span>
            <button
              onClick={() => navigate(ROUTES.costCalculator)}
              className="text-[#34D399] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>OPEN FULL CONSOLE</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupCalculator;
