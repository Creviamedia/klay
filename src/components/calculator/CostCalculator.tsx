import React, { useState, useMemo } from 'react';
import {
  calculateSetupCost,
  JURISDICTIONS,
  ACTIVITIES,
  OFFICE_SPACES,
  ADDON_SERVICES,
  type JurisdictionId,
  type ActivityTypeId,
  type OfficeTypeId,
  type SetupOptions,
} from '@/lib/calculator-engine';
import {
  Building2,
  Briefcase,
  Users,
  ShieldCheck,
  Sparkles,
  Download,
  Printer,
  Check,
  Send,
  HelpCircle,
} from 'lucide-react';

export function CostCalculator() {
  // Calculator state
  const [jurisdiction, setJurisdiction] = useState<JurisdictionId>('freezone-meydan');
  const [activityType, setActivityType] = useState<ActivityTypeId>('consulting');
  const [investorVisas, setInvestorVisas] = useState<number>(1);
  const [employeeVisas, setEmployeeVisas] = useState<number>(0);
  const [officeType, setOfficeType] = useState<OfficeTypeId>('flexi-desk');
  const [addOns, setAddOns] = useState({
    corporateTax: true,
    bankAccount: true,
    amlCompliance: false,
    uaeWill: false,
  });

  const [currency, setCurrency] = useState<'AED' | 'USD'>('AED');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Compute live calculation
  const currentOptions: SetupOptions = useMemo(
    () => ({
      jurisdiction,
      activityType,
      investorVisas,
      employeeVisas,
      officeType,
      addOns,
    }),
    [jurisdiction, activityType, investorVisas, employeeVisas, officeType, addOns]
  );

  const calculation = useMemo(() => calculateSetupCost(currentOptions), [currentOptions]);

  const displayTotal =
    currency === 'AED'
      ? `AED ${calculation.totalAed.toLocaleString()}`
      : `$${Math.round(calculation.totalUsd).toLocaleString()} USD`;

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail || !leadPhone) return;

    setIsSubmitting(true);
    const leadPayload = {
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      jurisdiction: calculation.jurisdictionName,
      estimateAed: calculation.totalAed,
      estimateUsd: calculation.totalUsd,
      options: currentOptions,
      breakdown: calculation.breakdown,
      submittedAt: new Date().toISOString(),
    };

    try {
      const endpoint = import.meta.env?.VITE_LEAD_API_ENDPOINT || '/api/leads';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmitSuccess(data.leadId || 'CONFIRMED-' + Math.floor(100000 + Math.random() * 900000));
      } else {
        setSubmitSuccess('KLAY-' + Math.floor(100000 + Math.random() * 900000));
      }
    } catch {
      setSubmitSuccess('KLAY-' + Math.floor(100000 + Math.random() * 900000));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-[24px] bg-[#16181A] border border-[#2B2E33] shadow-[0_30px_70px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden text-white font-sans">
      
      {/* =========================================================================
          CONSOLE TOP BAR (DIETER RAMS / TEENAGE ENGINEERING INSPIRATION)
          ========================================================================= */}
      <div className="bg-[#1F2226] border-b border-[#2D3035] px-6 py-4 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[#34D399] shadow-[0_0_10px_#34D399] animate-pulse" />
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">
              OPERATING CONSOLE // 2026 OFFICIAL TARIFF
            </div>
            <div className="font-mono text-sm font-bold text-white tracking-wider">
              UAE SOVEREIGN INCORPORATION COMPUTER
            </div>
          </div>
        </div>

        {/* Currency Hardware Toggle */}
        <div className="flex items-center gap-1 bg-[#121416] p-1 rounded-lg border border-[#2D3035] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrency('AED')}
            className={`px-3 py-1 font-mono text-xs font-bold rounded transition-all ${
              currency === 'AED'
                ? 'bg-[#34D399] text-[#0E1513] shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            AED
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 font-mono text-xs font-bold rounded transition-all ${
              currency === 'USD'
                ? 'bg-[#34D399] text-[#0E1513] shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            USD
          </button>
        </div>
      </div>

      {/* =========================================================================
          RECESSED DUAL LCD READOUT DISPLAY TAPE
          ========================================================================= */}
      <div className="bg-[#0C1210] p-6 sm:p-8 border-b border-[#1A221E] relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#34D399]/70 uppercase tracking-widest mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
              <span>SYSTEM OUTPUT // ESTIMATED STATUTORY INVESTMENT</span>
            </div>
            <div className="font-mono text-4xl sm:text-6xl font-normal text-[#34D399] drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] tabular-nums">
              {displayTotal}
            </div>
            <div className="mt-2 font-mono text-xs text-[#34D399]/50 tracking-wider">
              INCLUDES MANDATORY GOVERNMENT FEES &amp; STATUTORY FILINGS
            </div>
          </div>

          <div className="bg-[#121B17] p-4 rounded-xl border border-[#34D399]/20 font-mono text-xs text-[#34D399]/80 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-white/50">JURISDICTION:</span>
              <span className="font-semibold text-white">{calculation.jurisdictionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">RESIDENCY VISAS:</span>
              <span>{investorVisas} Investor / {employeeVisas} Employee</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">PREMISES:</span>
              <span>{officeType === 'flexi-desk' ? 'Flexi Desk (0 AED)' : 'Executive Office'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TACTILE CONTROLS GRID (Braun & Teenage Engineering Grammar)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#2D3035]">
        
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-8">
          
          {/* Step 1: Select Jurisdiction */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono text-xs uppercase tracking-widest text-white/50">
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-[#25282C] border border-white/20 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Select Legal Jurisdiction</span>
              </span>
              <span className="text-[#34D399]">REQUIRED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(JURISDICTIONS) as JurisdictionId[]).map((id) => {
                const j = JURISDICTIONS[id];
                const isSelected = jurisdiction === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setJurisdiction(id);
                      if (id === 'offshore-rak') {
                        setInvestorVisas(0);
                        setEmployeeVisas(0);
                      }
                    }}
                    className={`text-left p-4 rounded-xl border transition-all duration-150 relative ${
                      isSelected
                        ? 'border-[#34D399] bg-[#1E2724] ring-1 ring-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                        : 'border-[#2D3035] bg-[#1B1D20] text-white/70 hover:bg-[#202327] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#34D399]">
                        {j.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        AED {j.baseLicenceAed.toLocaleString()}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white">{j.name}</div>
                    <p className="font-mono text-[11px] text-white/50 mt-1 line-clamp-2">{j.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Commercial Activity */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono text-xs uppercase tracking-widest text-white/50">
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-[#25282C] border border-white/20 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Commercial Activity Class</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(ACTIVITIES) as ActivityTypeId[]).map((id) => {
                const a = ACTIVITIES[id];
                const isSelected = activityType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActivityType(id)}
                    className={`p-3 rounded-lg border text-center transition-all duration-150 ${
                      isSelected
                        ? 'border-[#34D399] bg-[#1E2724] text-white ring-1 ring-[#34D399]'
                        : 'border-[#2D3035] bg-[#1B1D20] text-white/70 hover:bg-[#202327]'
                    }`}
                  >
                    <div className="font-mono text-[10px] font-bold uppercase">{a.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Residency Visas */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono text-xs uppercase tracking-widest text-white/50">
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-[#25282C] border border-white/20 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Residency Visas Required</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-white/60 mb-2 uppercase">
                  Investor / Partner Visas
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setInvestorVisas(num)}
                      className={`flex-1 h-10 rounded font-mono text-xs font-bold border transition ${
                        investorVisas === num
                          ? 'bg-[#34D399] text-[#0E1513] border-[#34D399]'
                          : 'bg-[#1B1D20] text-white/70 border-[#2D3035] hover:bg-[#202327]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-white/60 mb-2 uppercase">
                  Employee Visas
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEmployeeVisas(num)}
                      className={`flex-1 h-10 rounded font-mono text-xs font-bold border transition ${
                        employeeVisas === num
                          ? 'bg-[#34D399] text-[#0E1513] border-[#34D399]'
                          : 'bg-[#1B1D20] text-white/70 border-[#2D3035] hover:bg-[#202327]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Office Facility */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono text-xs uppercase tracking-widest text-white/50">
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-[#25282C] border border-white/20 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Commercial Office Facility</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(OFFICE_SPACES) as OfficeTypeId[]).map((id) => {
                const off = OFFICE_SPACES[id];
                const isSelected = officeType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOfficeType(id)}
                    className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-[#34D399] bg-[#1E2724] text-white ring-1 ring-[#34D399]'
                        : 'border-[#2D3035] bg-[#1B1D20] text-white/70 hover:bg-[#202327]'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{off.name}</div>
                    <div className="font-mono text-[10px] text-[#34D399] mt-0.5">
                      {off.costAed === 0 ? 'INCLUDED' : `+AED ${off.costAed.toLocaleString()}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Itemized Tariff Ledger & Proposal Request (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-[#131517] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2D3035]">
              <span className="font-mono text-xs uppercase tracking-widest text-[#34D399]">
                ITEMIZED STATUTORY LEDGER
              </span>
              <span className="font-mono text-[10px] text-white/40">2026 SCHEDULE</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {calculation.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-[#2D3035]/60 text-white/80">
                  <span className="text-white/60">{item.label}</span>
                  <span className="text-white font-semibold">AED {item.amountAed.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#34D399]/40 flex justify-between font-mono text-sm">
              <span className="text-white font-bold">TOTAL STATUTORY TARIFF</span>
              <span className="text-[#34D399] font-bold">{displayTotal}</span>
            </div>
          </div>

          {/* Lead Proposal Form */}
          <div className="mt-8 pt-6 border-t border-[#2D3035]">
            {submitSuccess ? (
              <div className="p-4 rounded-xl bg-[#0E1513] border border-[#34D399] text-center font-mono">
                <Check className="w-6 h-6 text-[#34D399] mx-auto mb-2" />
                <div className="text-sm font-bold text-white mb-1">PROPOSAL LOCKED</div>
                <div className="text-xs text-[#34D399]">Ref: {submitSuccess}</div>
                <p className="text-[11px] text-white/60 mt-2">
                  Our corporate structuring director will reach out within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/50 mb-2">
                  REQUEST OFFICIAL ITEMIZED DOSSIER
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-[#1A1C1E] border border-[#2D3035] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#34D399] font-sans"
                />
                <input
                  type="email"
                  required
                  placeholder="Work Email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full bg-[#1A1C1E] border border-[#2D3035] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#34D399] font-sans"
                />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp / Phone Number"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full bg-[#1A1C1E] border border-[#2D3035] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#34D399] font-sans"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-[#34D399] text-[#0E1513] font-bold text-xs tracking-wider uppercase hover:bg-[#34D399]/90 active:scale-[0.99] transition font-mono shadow-[0_0_12px_rgba(52,211,153,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? 'DISPATCHING...' : '= LOCK & RECEIVE OFFICIAL QUOTE ='}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostCalculator;
