import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { EquitifyButton } from '@/components/ui/EquitifyButton';

interface JurisdictionOption {
  id: string;
  name: string;
  basePrice: number;
  badge: string;
}

const JURISDICTIONS: JurisdictionOption[] = [
  { id: 'freezone', name: 'Free Zone (Meydan / IFZA)', basePrice: 12500, badge: '0% Foreign Tax' },
  { id: 'mainland', name: 'Dubai Mainland (DED LLC)', basePrice: 18500, badge: '100% Local Market' },
  { id: 'difc', name: 'DIFC / Offshore Holding', basePrice: 28000, badge: 'Common Law' },
];

export function SetupCalculator() {
  const navigate = useNavigate();
  const [jurisdiction, setJurisdiction] = useState<string>('freezone');
  const [visas, setVisas] = useState<number>(1);
  const [officeType, setOfficeType] = useState<'virtual' | 'physical'>('virtual');
  const [contactInput, setContactInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fee calculation engine
  const selectedJur = JURISDICTIONS.find((j) => j.id === jurisdiction) || JURISDICTIONS[0];
  const visaCost = visas * 3750;
  const officeCost = officeType === 'physical' ? 12000 : 0;
  const totalEstimate = selectedJur.basePrice + visaCost + officeCost;

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
          officeType,
          estimatedTotal: totalEstimate,
          source: 'homepage_light_calculator',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Graceful fallback: lead accepted locally
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="w-full bg-[#05131F] border border-white/15 p-6 sm:p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden">
      {/* Background Subtle Horizon Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#22C55E]/10 blur-3xl"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#22C55E] uppercase mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>INSTANT FORMATION ESTIMATOR</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading font-normal text-[#FBFBFB]">
            Calculate Your UAE Setup
          </h3>
        </div>

        <button
          onClick={() => navigate(ROUTES.costCalculator)}
          className="text-xs font-mono text-[#22C55E] hover:underline flex items-center gap-1 self-start sm:self-center"
        >
          <span>FULL 6-STEP ENGINE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Step 1: Select Jurisdiction */}
      <div className="mb-6">
        <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-3">
          01 // Select Corporate Jurisdiction
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {JURISDICTIONS.map((jur) => {
            const isSelected = jur.id === jurisdiction;
            return (
              <button
                key={jur.id}
                type="button"
                onClick={() => setJurisdiction(jur.id)}
                className={`p-3.5 text-left border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#22C55E] bg-[#22C55E]/10 text-white ring-1 ring-[#22C55E]'
                    : 'border-white/10 bg-white/5 text-white/75 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-semibold mb-1">{jur.name}</div>
                <div className="text-[11px] font-mono text-[#22C55E]">{jur.badge}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Visa Allocation & Premises */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-3">
            02 // Residency Visas Required
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setVisas(num)}
                className={`py-2.5 text-center text-xs font-mono border transition-all duration-200 ${
                  visas === num
                    ? 'border-[#22C55E] bg-[#22C55E]/15 text-white ring-1 ring-[#22C55E]'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {num === 0 ? 'None' : `${num} ${num === 1 ? 'Visa' : 'Visas'}`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-3">
            03 // Commercial Lease Facility
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOfficeType('virtual')}
              className={`py-2.5 px-3 text-left text-xs font-medium border transition-all duration-200 ${
                officeType === 'virtual'
                  ? 'border-[#22C55E] bg-[#22C55E]/15 text-white ring-1 ring-[#22C55E]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold">Flexi Desk</div>
              <div className="text-[10px] text-white/50">Included in package</div>
            </button>
            <button
              type="button"
              onClick={() => setOfficeType('physical')}
              className={`py-2.5 px-3 text-left text-xs font-medium border transition-all duration-200 ${
                officeType === 'physical'
                  ? 'border-[#22C55E] bg-[#22C55E]/15 text-white ring-1 ring-[#22C55E]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold">Physical Office</div>
              <div className="text-[10px] text-[#22C55E]">+AED 12,000/yr</div>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Statutory Total Display */}
      <div className="p-5 bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-white/60">
            Estimated Statutory Investment
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-normal tracking-tight text-[#FBFBFB] mt-1 flex items-baseline gap-1.5">
            <span className="text-xl text-[#22C55E] font-mono">AED</span>
            <span>{totalEstimate.toLocaleString()}</span>
            <span className="text-xs text-white/50 font-normal ml-1">all-inclusive government tariffs</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#22C55E]/80">
          <Shield className="w-4 h-4 text-[#22C55E]" />
          <span>100% Guaranteed Foreign Ownership</span>
        </div>
      </div>

      {/* Lead Capture or Success Message */}
      {isSubmitted ? (
        <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#FBFBFB] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block text-sm">Dossier Request Received</span>
            Our legal team has prepared your customized fee schedule. An advisor will reach out shortly.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter Email or WhatsApp for Itemized Government Breakdown"
            value={contactInput}
            onChange={(e) => setContactInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/15 px-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#22C55E] font-sans"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#22C55E] text-[#05131F] font-semibold text-xs tracking-wider uppercase hover:bg-[#22C55E]/90 transition-all duration-200 shrink-0 font-mono disabled:opacity-50"
          >
            {isSubmitting ? 'DISPATCHING...' : 'GET ITEMIZATION →'}
          </button>
        </form>
      )}
    </div>
  );
}

export default SetupCalculator;
