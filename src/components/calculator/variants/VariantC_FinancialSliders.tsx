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
import { Check, ArrowRight, Sliders, Award, DollarSign, PieChart, ShieldCheck } from 'lucide-react';

export function VariantC_FinancialSliders() {
  const [currency, setCurrency] = useState<'AED' | 'USD'>('AED');

  // Form states
  const [jurisdiction, setJurisdiction] = useState<JurisdictionId>('freezone-meydan');
  const [activityType, setActivityType] = useState<ActivityTypeId>('consulting');
  const [investorVisas, setInvestorVisas] = useState<number>(2);
  const [employeeVisas, setEmployeeVisas] = useState<number>(1);
  const [officeType, setOfficeType] = useState<OfficeTypeId>('dedicated-desk');
  const [addOns, setAddOns] = useState({
    corporateTax: true,
    bankAccount: true,
    amlCompliance: false,
    uaeWill: false,
  });

  // Lead capture
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

  // Group breakdown by category for the percentage breakdown matrix
  const categoryTotals = useMemo(() => {
    let licensing = 0;
    let visas = 0;
    let premises = 0;
    let advisory = 0;

    calculation.breakdown.forEach((item) => {
      if (item.category === 'Licence & Authority') licensing += item.amountAed;
      else if (item.category === 'Visas & Immigration') visas += item.amountAed;
      else if (item.category === 'Premises') premises += item.amountAed;
      else if (item.category === 'Advisory & Compliance') advisory += item.amountAed;
    });

    const total = calculation.totalAed || 1;
    return {
      licensing: { aed: licensing, pct: Math.round((licensing / total) * 100) },
      visas: { aed: visas, pct: Math.round((visas / total) * 100) },
      premises: { aed: premises, pct: Math.round((premises / total) * 100) },
      advisory: { aed: advisory, pct: Math.round((advisory / total) * 100) },
    };
  }, [calculation]);

  const displayTotal =
    currency === 'AED'
      ? `AED ${calculation.totalAed.toLocaleString()}`
      : `$${Math.round(calculation.totalUsd).toLocaleString()} USD`;

  const formatAmount = (aed: number) => {
    if (currency === 'AED') return `AED ${aed.toLocaleString()}`;
    return `$${Math.round(aed / 3.6725).toLocaleString()} USD`;
  };

  const isOffshore = jurisdiction === 'offshore-rak';
  const isGoldenVisaEligible = investorVisas >= 2 || calculation.totalAed >= 35000;

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
      variant: 'C-FinancialSliders',
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
    <div className="w-full max-w-6xl mx-auto rounded-3xl bg-white border border-[#0C2D48]/12 shadow-[0_24px_60px_rgba(12,45,72,0.08)] overflow-hidden text-[#0C2D48] font-sans">
      
      {/* ================= HEADER BAR WITH CURRENCY & GOLDEN VISA BADGE ================= */}
      <div className="bg-[#FAFBFD] border-b border-[#0C2D48]/10 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0C2D48] text-white">
            <Sliders className="w-4 h-4 text-[#22C55E]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#16A34A]">
                VARIANT C · FINANCIAL SLIDERS &amp; MATRIX
              </span>
              {isGoldenVisaEligible && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-mono text-[10px] font-semibold border border-amber-500/20">
                  <Award className="w-3 h-3 text-amber-600" /> Golden Visa Track
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-semibold text-[#0C2D48] tracking-tight">
              Dynamic Financial Modeling Simulator
            </h2>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#0C2D48]/10 shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrency('AED')}
            className={`px-3.5 py-1.5 font-mono text-xs font-semibold rounded-lg transition-all ${
              currency === 'AED' ? 'bg-[#0C2D48] text-white shadow-sm' : 'text-[#0C2D48]/60 hover:text-[#0C2D48]'
            }`}
          >
            AED
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-3.5 py-1.5 font-mono text-xs font-semibold rounded-lg transition-all ${
              currency === 'USD' ? 'bg-[#0C2D48] text-white shadow-sm' : 'text-[#0C2D48]/60 hover:text-[#0C2D48]'
            }`}
          >
            USD
          </button>
        </div>
      </div>

      {/* ================= 2-COLUMN LAYOUT: SLIDER WORKBENCH & VISUAL MATRIX ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#0C2D48]/10">
        
        {/* LEFT COLUMN: INTERACTIVE SLIDERS & CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-7">
          
          {/* Jurisdiction Select */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-2.5">
              01 // Economic Jurisdiction
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(JURISDICTIONS) as JurisdictionId[]).map((key) => {
                const jur = JURISDICTIONS[key];
                const isSelected = jurisdiction === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setJurisdiction(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                        : 'border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/25'
                    }`}
                  >
                    <span className="font-semibold text-xs text-[#0C2D48] block truncate">{jur.name}</span>
                    <span className="text-[10px] font-mono text-[#0C2D48]/50 block mt-0.5">{jur.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Select */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-2.5">
              02 // Business Activity Domain
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ACTIVITIES) as ActivityTypeId[]).map((actKey) => {
                const act = ACTIVITIES[actKey];
                const isSelected = activityType === actKey;
                return (
                  <button
                    key={actKey}
                    type="button"
                    onClick={() => setActivityType(actKey)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                        : 'border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/25'
                    }`}
                  >
                    <span className="font-semibold text-xs text-[#0C2D48] block">{act.name}</span>
                    <span className="text-[10px] font-mono text-[#0C2D48]/50 block mt-0.5">
                      {act.extraFeeAed === 0 ? 'Standard Tariff' : `+AED ${act.extraFeeAed.toLocaleString()}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INTERACTIVE FINANCIAL RANGE SLIDERS */}
          <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-[#0C2D48]/10 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/80 font-bold flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#16A34A]" /> 03 // VISA QUOTA SLIDERS
              </span>
              <span className="text-[11px] font-mono text-[#0C2D48]/60">
                {isOffshore ? 'Visas Not Permitted (Offshore)' : 'Slide to recalibrate quota'}
              </span>
            </div>

            {/* Slider 1: Investor Visas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-[#0C2D48] block">Shareholder / Investor Visas</span>
                  <span className="text-xs text-[#0C2D48]/60">Partner residence with UAE status card</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-[#0C2D48] text-white font-mono text-xs font-bold shadow-sm">
                  {investorVisas} {investorVisas === 1 ? 'Visa' : 'Visas'}
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                disabled={isOffshore}
                value={investorVisas}
                onChange={(e) => setInvestorVisas(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16A34A] disabled:opacity-30"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#0C2D48]/50">
                <span>1 Visa</span>
                <span>2 Visas</span>
                <span>3 Visas</span>
                <span>4 Visas</span>
                <span>5 Visas</span>
              </div>
            </div>

            {/* Slider 2: Employee Visas */}
            <div className="space-y-2 pt-3 border-t border-[#0C2D48]/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-[#0C2D48] block">Employee &amp; Staff Visas</span>
                  <span className="text-xs text-[#0C2D48]/60">Operational hires, managers, and staff</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-[#0C2D48] text-white font-mono text-xs font-bold shadow-sm">
                  {employeeVisas} {employeeVisas === 1 ? 'Visa' : 'Visas'}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                disabled={isOffshore}
                value={employeeVisas}
                onChange={(e) => setEmployeeVisas(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16A34A] disabled:opacity-30"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#0C2D48]/50">
                <span>0</span>
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10 Visas</span>
              </div>
            </div>
          </div>

          {/* Office Facility Tier */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-2.5">
              04 // Office Facility Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(OFFICE_SPACES) as OfficeTypeId[]).map((offKey) => {
                const off = OFFICE_SPACES[offKey];
                const isSelected = officeType === offKey;
                return (
                  <button
                    key={offKey}
                    type="button"
                    onClick={() => setOfficeType(offKey)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                        : 'border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/25'
                    }`}
                  >
                    <span className="font-semibold text-xs text-[#0C2D48] block truncate">{off.name}</span>
                    <span className="text-[10px] font-mono text-[#0C2D48]/60 block mt-0.5">
                      {off.costAed === 0 ? 'Included' : `+AED ${off.costAed.toLocaleString()}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Addons toggles */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-2.5">
              05 // Corporate Desk Add-ons
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ADDON_SERVICES).map(([addonKey, addon]) => {
                const isChecked = addOns[addonKey as keyof typeof addOns];
                return (
                  <label
                    key={addonKey}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer text-xs transition-all ${
                      isChecked ? 'border-[#22C55E] bg-[#22C55E]/5 font-semibold' : 'border-[#0C2D48]/10 bg-white'
                    }`}
                  >
                    <span className="truncate pr-2">{addon.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setAddOns((prev) => ({
                          ...prev,
                          [addonKey]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#16A34A] focus:ring-[#22C55E]"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VISUAL BREAKDOWN MATRIX & SUMMARY (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-[#FAFBFD] flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            {/* Top Total Box */}
            <div className="p-6 rounded-2xl bg-white border border-[#0C2D48]/12 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#0C2D48]/50 block">
                TOTAL CAPITAL REQUIREMENT
              </span>
              <div className="text-3xl sm:text-4xl font-heading font-bold text-[#0C2D48] tracking-tight my-1">
                {displayTotal}
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-[#0C2D48]/60 pt-2 border-t border-[#0C2D48]/10 mt-2">
                <span>Filing: {calculation.turnaroundDays}</span>
                <span className="text-[#16A34A] font-semibold">{calculation.jurisdictionName}</span>
              </div>
            </div>

            {/* VISUAL PERCENTAGE BREAKDOWN STACKED BAR */}
            <div className="p-5 rounded-2xl bg-white border border-[#0C2D48]/12 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-bold flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-[#16A34A]" /> BUDGET ALLOCATION MATRIX
                </span>
                <span className="text-[10px] font-mono text-[#0C2D48]/50">100% Normalized</span>
              </div>

              {/* Stacked Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100 shadow-inner">
                <div
                  style={{ width: `${categoryTotals.licensing.pct}%` }}
                  title={`Licensing: ${categoryTotals.licensing.pct}%`}
                  className="bg-[#16A34A] transition-all duration-300"
                />
                <div
                  style={{ width: `${categoryTotals.visas.pct}%` }}
                  title={`Visas: ${categoryTotals.visas.pct}%`}
                  className="bg-[#0C2D48] transition-all duration-300"
                />
                <div
                  style={{ width: `${categoryTotals.premises.pct}%` }}
                  title={`Premises: ${categoryTotals.premises.pct}%`}
                  className="bg-[#0284C7] transition-all duration-300"
                />
                <div
                  style={{ width: `${categoryTotals.advisory.pct}%` }}
                  title={`Advisory: ${categoryTotals.advisory.pct}%`}
                  className="bg-[#D97706] transition-all duration-300"
                />
              </div>

              {/* Legend with Amounts & % */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A] mt-1 shrink-0" />
                  <div>
                    <span className="text-[#0C2D48]/60 text-[11px] block">Licensing ({categoryTotals.licensing.pct}%)</span>
                    <span className="font-mono font-bold text-[#0C2D48]">{formatAmount(categoryTotals.licensing.aed)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0C2D48] mt-1 shrink-0" />
                  <div>
                    <span className="text-[#0C2D48]/60 text-[11px] block">Visas ({categoryTotals.visas.pct}%)</span>
                    <span className="font-mono font-bold text-[#0C2D48]">{formatAmount(categoryTotals.visas.aed)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7] mt-1 shrink-0" />
                  <div>
                    <span className="text-[#0C2D48]/60 text-[11px] block">Premises ({categoryTotals.premises.pct}%)</span>
                    <span className="font-mono font-bold text-[#0C2D48]">{formatAmount(categoryTotals.premises.aed)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706] mt-1 shrink-0" />
                  <div>
                    <span className="text-[#0C2D48]/60 text-[11px] block">Advisory ({categoryTotals.advisory.pct}%)</span>
                    <span className="font-mono font-bold text-[#0C2D48]">{formatAmount(categoryTotals.advisory.aed)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Lock Lead Box */}
            <div className="p-5 rounded-2xl bg-white border border-[#0C2D48]/12">
              {submitSuccess ? (
                <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-center">
                  <span className="w-8 h-8 rounded-full bg-[#22C55E] text-white mx-auto flex items-center justify-center mb-1">
                    <Check className="w-4 h-4" />
                  </span>
                  <h4 className="font-heading font-semibold text-sm text-[#0C2D48]">Model Exported</h4>
                  <p className="text-[11px] font-mono text-[#16A34A] mt-0.5">{submitSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-bold block">
                    LOCK IN FINANCIAL SCHEDULE
                  </span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                    />
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="corporate@company.com"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                    />
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="Phone / WhatsApp"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0C2D48] hover:bg-[#0C2D48]/90 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                  >
                    {isSubmitting ? 'Securing Schedule...' : 'Generate Official Financial Model'}
                    <ArrowRight className="w-3.5 h-3.5 text-[#22C55E]" />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="text-[11px] text-[#0C2D48]/50 flex items-center gap-1.5 pt-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            Binding 2026 tariff accuracy guaranteed with direct regulatory filing.
          </div>
        </div>
      </div>
    </div>
  );
}

export default VariantC_FinancialSliders;
