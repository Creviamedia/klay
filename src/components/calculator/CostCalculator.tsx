import React, { useState, useMemo } from 'react';
import {
  calculateSetupCost,
  formatCurrency,
  JURISDICTIONS,
  ACTIVITIES,
  OFFICE_SPACES,
  ADDON_SERVICES,
  type JurisdictionId,
  type ActivityTypeId,
  type OfficeTypeId,
  type SetupOptions,
  type CurrencyCode,
} from '@/lib/calculator-engine';
import { Check, ArrowRight } from 'lucide-react';
import { submitIntakeDossier } from '@/lib/intake-conduit';

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

  const [currency, setCurrency] = useState<CurrencyCode>('AED');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Compute live calculation via unified ledger engine
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
  const displayTotal = formatCurrency(calculation.totalAed, currency);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail || !leadPhone) return;

    setIsSubmitting(true);
    const result = await submitIntakeDossier({
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      jurisdiction: calculation.jurisdictionName,
      estimateAed: calculation.totalAed,
      estimateUsd: calculation.totalUsd,
      options: currentOptions,
      breakdown: calculation.breakdown,
    });

    setSubmitSuccess(result.referenceNumber);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl bg-white border border-[#0C2D48]/12 shadow-[0_20px_50px_rgba(12,45,72,0.06)] overflow-hidden text-[#0C2D48] font-sans">
      {/* =========================================================================
          TOP EXECUTIVE HEADER BAR
          ========================================================================= */}
      <div className="bg-[#FAFBFD] border-b border-[#0C2D48]/10 px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#16A34A]">
              2026 STATUTORY TARIFF SCHEDULE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-semibold text-[#0C2D48] tracking-tight">
            UAE Company Formation Cost Calculator
          </h2>
        </div>

        {/* Currency Switch */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#0C2D48]/10 shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrency('AED')}
            className={`px-3.5 py-1.5 font-mono text-xs font-semibold rounded-lg transition-all ${
              currency === 'AED'
                ? 'bg-[#0C2D48] text-white shadow-sm'
                : 'text-[#0C2D48]/60 hover:text-[#0C2D48]'
            }`}
          >
            AED
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-3.5 py-1.5 font-mono text-xs font-semibold rounded-lg transition-all ${
              currency === 'USD'
                ? 'bg-[#0C2D48] text-white shadow-sm'
                : 'text-[#0C2D48]/60 hover:text-[#0C2D48]'
            }`}
          >
            USD
          </button>
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN EXECUTIVE WORKSPACE (ONE-FOLD FRIENDLY)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#0C2D48]/10">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-7">
          {/* Step 1: Select Jurisdiction */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-[#0C2D48] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select Jurisdiction</span>
              </label>
              <span className="text-[11px] font-mono text-[#16A34A] bg-[#22C55E]/10 px-2 py-0.5 rounded">
                VERIFIED TARIFFS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(JURISDICTIONS).map((jur) => {
                const isSelected = jurisdiction === jur.id;
                return (
                  <button
                    key={jur.id}
                    type="button"
                    onClick={() => setJurisdiction(jur.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#0C2D48] bg-[#0C2D48]/[0.03] ring-2 ring-[#0C2D48]/10 shadow-sm'
                        : 'border-[#0C2D48]/10 hover:border-[#0C2D48]/25 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-medium text-[#0C2D48]/60 uppercase">
                        {jur.category.toUpperCase()}
                      </span>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22C55E] text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-[#0C2D48] leading-tight">
                      {jur.name}
                    </div>
                    <div className="text-[11px] text-[#0C2D48]/65 mt-1 leading-snug">
                      {jur.description}
                    </div>
                    <div className="mt-2 text-xs font-mono font-semibold text-[#16A34A]">
                      Base: AED {jur.baseLicenceAed.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Activity Category */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold flex items-center gap-2 mb-3">
              <span className="h-5 w-5 rounded bg-[#0C2D48] text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Primary Commercial Activity</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(ACTIVITIES).map((act) => {
                const isSelected = activityType === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityType(act.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#0C2D48] bg-[#0C2D48] text-white shadow-sm'
                        : 'border-[#0C2D48]/10 bg-white text-[#0C2D48] hover:border-[#0C2D48]/25'
                    }`}
                  >
                    <div className="text-xs font-semibold leading-tight">{act.name}</div>
                    <div
                      className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-[#22C55E]' : 'text-[#0C2D48]/60'}`}
                    >
                      {act.extraFeeAed === 0
                        ? 'Included'
                        : `+AED ${act.extraFeeAed.toLocaleString()}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Visas & Office (Side by Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Investor & Employee Visas */}
            <div className="p-4 rounded-xl border border-[#0C2D48]/10 bg-[#FAFBFD]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold mb-3 flex items-center justify-between">
                <span>Residency Visas</span>
                <span className="text-[10px] text-[#0C2D48]/50">+AED 3,750/ea</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0C2D48] font-medium">Investor / Partner:</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setInvestorVisas(v)}
                        className={`w-7 h-7 rounded text-xs font-semibold ${
                          investorVisas === v
                            ? 'bg-[#0C2D48] text-white'
                            : 'bg-white border border-[#0C2D48]/15 text-[#0C2D48]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#0C2D48]/10">
                  <span className="text-xs text-[#0C2D48] font-medium">Employee Quota:</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEmployeeVisas(v)}
                        className={`w-7 h-7 rounded text-xs font-semibold ${
                          employeeVisas === v
                            ? 'bg-[#0C2D48] text-white'
                            : 'bg-white border border-[#0C2D48]/15 text-[#0C2D48]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Office Premises */}
            <div className="p-4 rounded-xl border border-[#0C2D48]/10 bg-[#FAFBFD]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold mb-3">
                Workspace / Facility
              </div>
              <div className="space-y-2">
                {Object.values(OFFICE_SPACES).map((off) => {
                  const isSelected = officeType === off.id;
                  return (
                    <button
                      key={off.id}
                      type="button"
                      onClick={() => setOfficeType(off.id)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#0C2D48] bg-white ring-1 ring-[#0C2D48] shadow-sm'
                          : 'border-[#0C2D48]/10 bg-white/70 hover:bg-white text-[#0C2D48]/80'
                      }`}
                    >
                      <span className="text-xs font-medium text-[#0C2D48]">{off.name}</span>
                      <span className="text-[11px] font-mono text-[#16A34A] font-semibold">
                        {off.costAed === 0 ? 'Included' : `+AED ${off.costAed.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 4: Statutory Compliance Services */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-2.5">
              Statutory Services &amp; Banking
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(ADDON_SERVICES).map((addon) => {
                const isChecked = addOns[addon.id as keyof typeof addOns];
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() =>
                      setAddOns((prev) => ({
                        ...prev,
                        [addon.id]: !prev[addon.id as keyof typeof prev],
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'border-[#22C55E] bg-[#22C55E]/5 text-[#0C2D48]'
                        : 'border-[#0C2D48]/10 bg-white text-[#0C2D48]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold truncate">{addon.name}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
                    </div>
                    <div className="text-[10px] font-mono text-[#16A34A]">
                      {addon.costAed === 0
                        ? 'Complimentary'
                        : `+AED ${addon.costAed.toLocaleString()}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Price Ledger & 1-Tap Proposal (5 cols) */}
        <div className="lg:col-span-5 bg-[#FAFBFD] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Live Fee Ledger */}
            <div className="rounded-2xl bg-[#0C2D48] text-white p-6 shadow-md mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#22C55E] block mb-1">
                ESTIMATED STATUTORY INVESTMENT
              </span>
              <div className="text-3xl sm:text-4xl font-heading font-semibold text-white tracking-tight tabular-nums">
                {displayTotal}
              </div>
              <div className="mt-1 text-xs font-mono text-white/60">
                Official Government Tariff Schedule
              </div>

              {/* Mini Summary */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-xs font-mono text-white/80">
                <div className="flex justify-between">
                  <span className="text-white/60">Jurisdiction:</span>
                  <span className="font-semibold text-white">{calculation.jurisdictionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Residency Visas:</span>
                  <span>
                    {investorVisas} Investor / {employeeVisas} Employee
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Premises:</span>
                  <span>
                    {officeType === 'flexi-desk' ? 'Flexi Desk (0 AED)' : 'Executive Office'}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Item Breakdown */}
            <div className="bg-white rounded-xl border border-[#0C2D48]/10 p-4 mb-6 shadow-sm">
              <div className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold mb-3">
                Itemized Statutory Fees
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {calculation.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs py-1 border-b border-[#0C2D48]/5 last:border-b-0"
                  >
                    <span className="text-[#0C2D48]/75 truncate max-w-[200px]">{item.label}</span>
                    <span className="font-mono font-medium text-[#0C2D48]">
                      {currency === 'AED' ? item.formattedAed : item.formattedUsd}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead Dispatch Form */}
          <div className="bg-white rounded-xl border border-[#0C2D48]/10 p-5 shadow-sm">
            {!submitSuccess ? (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div className="text-xs font-semibold text-[#0C2D48] mb-1">
                  Request Official Proposal &amp; Dossier
                </div>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#0C2D48]/15 text-xs text-[#0C2D48] placeholder:text-[#0C2D48]/40 focus:outline-none focus:border-[#22C55E]"
                />
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="Work Email"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#0C2D48]/15 text-xs text-[#0C2D48] placeholder:text-[#0C2D48]/40 focus:outline-none focus:border-[#22C55E]"
                />
                <input
                  type="tel"
                  required
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="WhatsApp / Phone (+971...)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#0C2D48]/15 text-xs text-[#0C2D48] placeholder:text-[#0C2D48]/40 focus:outline-none focus:border-[#22C55E]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Preparing Official Dossier...'
                  ) : (
                    <>
                      <span>Receive Verified Breakdown &amp; PDF</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-center space-y-2">
                <div className="inline-flex p-2 rounded-full bg-[#22C55E] text-white">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="text-sm font-semibold text-[#16A34A]">Proposal Dispatched!</div>
                <p className="text-xs text-[#0C2D48]/75 leading-relaxed">
                  Your reference ID is{' '}
                  <span className="font-mono font-bold text-[#0C2D48]">{submitSuccess}</span>. A
                  senior corporate director has been notified and will deliver your verified
                  regulatory dossier.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="text-xs text-[#16A34A] underline font-mono pt-1"
                >
                  New Calculation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostCalculator;
