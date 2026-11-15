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
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Building2,
  Users,
  FileText,
  Sparkles,
} from 'lucide-react';
import { submitIntakeDossier } from '@/lib/intake-conduit';

export function VariantB_ProgressiveWizard() {
  const [step, setStep] = useState<number>(1);
  const [currency, setCurrency] = useState<'AED' | 'USD'>('AED');

  // Setup form states
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

  // Lead capture states
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

  const isOffshore = jurisdiction === 'offshore-rak';

  const handleNext = () => setStep((s) => Math.min(4, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

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
      variant: 'B-ProgressiveWizard',
    });

    setSubmitSuccess(result.referenceNumber);
    setIsSubmitting(false);
  };

  const stepsMeta = [
    { num: 1, title: 'Jurisdiction', icon: Building2 },
    { num: 2, title: 'Activity & Visas', icon: Users },
    { num: 3, title: 'Premises & Compliance', icon: ShieldCheck },
    { num: 4, title: 'Executive Proposal', icon: FileText },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white border border-[#0C2D48]/12 shadow-[0_24px_60px_rgba(12,45,72,0.08)] overflow-hidden text-[#0C2D48] font-sans">
      {/* ================= TOP CONTROLS & WIZARD STEP HEADER ================= */}
      <div className="bg-[#FAFBFD] border-b border-[#0C2D48]/10 px-6 sm:px-10 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#22C55E]/15 text-[#16A34A]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#16A34A] block">
                VARIANT B · GUIDED 4-STEP WIZARD
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-semibold text-[#0C2D48] tracking-tight">
                Corporate Setup Discovery
              </h2>
            </div>
          </div>

          {/* Running total mini-pill & Currency toggle */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#0C2D48]/10 shadow-sm text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0C2D48]/50 block">
                ESTIMATE
              </span>
              <span className="font-mono text-sm font-bold text-[#0C2D48]">{displayTotal}</span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#0C2D48]/10 shadow-sm">
              <button
                type="button"
                onClick={() => setCurrency('AED')}
                className={`px-3 py-1 font-mono text-xs font-semibold rounded-lg transition-all ${
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
                className={`px-3 py-1 font-mono text-xs font-semibold rounded-lg transition-all ${
                  currency === 'USD'
                    ? 'bg-[#0C2D48] text-white shadow-sm'
                    : 'text-[#0C2D48]/60 hover:text-[#0C2D48]'
                }`}
              >
                USD
              </button>
            </div>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {stepsMeta.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            const Icon = s.icon;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex flex-col sm:flex-row items-center sm:items-center gap-2 p-2 sm:p-3 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? 'bg-white border-[#22C55E] shadow-sm'
                    : isCompleted
                      ? 'bg-white/60 border-[#0C2D48]/15 hover:bg-white'
                      : 'bg-transparent border-transparent opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'bg-[#22C55E] text-white'
                      : isCompleted
                        ? 'bg-[#0C2D48] text-white'
                        : 'bg-[#0C2D48]/10 text-[#0C2D48]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <span className="text-[10px] font-mono uppercase tracking-wider block text-[#0C2D48]/50">
                    STEP 0{s.num}
                  </span>
                  <span
                    className={`text-xs font-semibold truncate block ${isCurrent ? 'text-[#0C2D48]' : 'text-[#0C2D48]/70'}`}
                  >
                    {s.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STEP CONTENT BODY ================= */}
      <div className="p-6 sm:p-10 min-h-[420px] flex flex-col justify-between">
        {/* STEP 1: JURISDICTION SELECTION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-heading font-semibold text-[#0C2D48]">
                Select Primary Corporate Jurisdiction
              </h3>
              <p className="text-sm text-[#0C2D48]/70 mt-1">
                Choose the economic zone that best aligns with your target market, ownership
                requirements, and speed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(JURISDICTIONS) as JurisdictionId[]).map((key) => {
                const jur = JURISDICTIONS[key];
                const isSelected = jurisdiction === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setJurisdiction(key)}
                    className={`relative p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#22C55E] bg-[#22C55E]/5 ring-2 ring-[#22C55E]/20 shadow-md'
                        : 'border-[#0C2D48]/12 bg-white hover:border-[#0C2D48]/30 hover:bg-[#FAFBFD]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-[#0C2D48]/5 text-[#0C2D48]/80">
                          {jur.category}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#22C55E] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading font-semibold text-base text-[#0C2D48] mb-1">
                        {jur.name}
                      </h4>
                      <p className="text-xs text-[#0C2D48]/70 leading-relaxed mb-4">
                        {jur.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#0C2D48]/10 flex items-center justify-between font-mono text-xs">
                      <span className="text-[#0C2D48]/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {jur.turnaroundDays}
                      </span>
                      <span className="font-bold text-[#0C2D48]">
                        From AED {jur.baseLicenceAed.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: ACTIVITY & VISAS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-heading font-semibold text-[#0C2D48]">
                Commercial Scope &amp; Visa Allocations
              </h3>
              <p className="text-sm text-[#0C2D48]/70 mt-1">
                Select your permitted commercial activity and define your team residency quota.
              </p>
            </div>

            {/* Activity choices */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-3">
                PRIMARY BUSINESS ACTIVITY
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(ACTIVITIES) as ActivityTypeId[]).map((actId) => {
                  const act = ACTIVITIES[actId];
                  const isSelected = activityType === actId;
                  return (
                    <button
                      key={actId}
                      type="button"
                      onClick={() => setActivityType(actId)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                          : 'border-[#0C2D48]/12 bg-white hover:border-[#0C2D48]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-[#0C2D48]">{act.name}</span>
                        {act.extraFeeAed > 0 && (
                          <span className="text-[10px] font-mono text-[#0C2D48]/60">
                            +AED {act.extraFeeAed.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#0C2D48]/65">{act.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visa quotas */}
            <div className="pt-4 border-t border-[#0C2D48]/10">
              <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-3">
                RESIDENCY VISA ALLOCATIONS
              </label>

              {isOffshore ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <strong>Notice:</strong> RAK ICC Offshore entities do not issue UAE residency
                  visas. If you require UAE residence permits, select a Free Zone or Dubai Mainland
                  in Step 1.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Investor Visas */}
                  <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#0C2D48]/10 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-[#0C2D48] block">
                        Investor / Partner Visas
                      </span>
                      <span className="text-xs text-[#0C2D48]/60">
                        For shareholders &amp; company directors
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInvestorVisas((v) => Math.max(1, v - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-[#0C2D48]/15 font-mono font-bold hover:bg-[#0C2D48]/5"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-base w-6 text-center">
                        {investorVisas}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInvestorVisas((v) => Math.min(5, v + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-[#0C2D48]/15 font-mono font-bold hover:bg-[#0C2D48]/5"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Employee Visas */}
                  <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#0C2D48]/10 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-[#0C2D48] block">
                        Employee / Staff Visas
                      </span>
                      <span className="text-xs text-[#0C2D48]/60">
                        For hired managers &amp; operations team
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEmployeeVisas((v) => Math.max(0, v - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-[#0C2D48]/15 font-mono font-bold hover:bg-[#0C2D48]/5"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-base w-6 text-center">
                        {employeeVisas}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEmployeeVisas((v) => Math.min(10, v + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-[#0C2D48]/15 font-mono font-bold hover:bg-[#0C2D48]/5"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: PREMISES & COMPLIANCE */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-heading font-semibold text-[#0C2D48]">
                Office Facilities &amp; Strategic Advisory
              </h3>
              <p className="text-sm text-[#0C2D48]/70 mt-1">
                Configure registered office premises and essential banking, tax, and compliance
                services.
              </p>
            </div>

            {/* Office selection */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-3">
                REGISTERED OFFICE FACILITY
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(OFFICE_SPACES) as OfficeTypeId[]).map((offId) => {
                  const off = OFFICE_SPACES[offId];
                  const isSelected = officeType === offId;
                  return (
                    <button
                      key={offId}
                      type="button"
                      onClick={() => setOfficeType(offId)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                          : 'border-[#0C2D48]/12 bg-white hover:border-[#0C2D48]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-[#0C2D48]">{off.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#22C55E]" />}
                      </div>
                      <p className="text-xs text-[#0C2D48]/65 mb-3">{off.description}</p>
                      <div className="font-mono text-xs font-bold text-[#0C2D48]">
                        {off.costAed === 0
                          ? 'Included in Base'
                          : `+AED ${off.costAed.toLocaleString()}/yr`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advisory Addons */}
            <div className="pt-4 border-t border-[#0C2D48]/10">
              <label className="text-xs font-mono uppercase tracking-wider text-[#0C2D48]/70 font-semibold block mb-3">
                ESSENTIAL COMPLIANCE &amp; BANKING DESK
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(ADDON_SERVICES).map(([addonKey, addon]) => {
                  const isChecked = addOns[addonKey as keyof typeof addOns];
                  return (
                    <label
                      key={addonKey}
                      className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#22C55E] bg-[#22C55E]/5'
                          : 'border-[#0C2D48]/12 bg-white hover:border-[#0C2D48]/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setAddOns((prev) => ({
                            ...prev,
                            [addonKey]: e.target.checked,
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#16A34A] focus:ring-[#22C55E]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#0C2D48]">{addon.name}</span>
                          <span className="text-xs font-mono font-bold text-[#0C2D48]">
                            +AED {addon.costAed.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#0C2D48]/65 mt-0.5">{addon.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PROPOSAL SUMMARY & INSTANT CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#22C55E]/15 text-[#16A34A] font-mono text-xs font-semibold mb-2">
                <Check className="w-3.5 h-3.5" /> PROPOSAL VERIFIED · READY FOR FILING
              </div>
              <h3 className="text-2xl font-heading font-semibold text-[#0C2D48]">
                Itemized Formation Dossier
              </h3>
              <p className="text-sm text-[#0C2D48]/70">
                Official statutory estimate for{' '}
                <strong className="text-[#0C2D48]">{calculation.jurisdictionName}</strong>.
                Turnaround: <span className="font-mono">{calculation.turnaroundDays}</span>.
              </p>
            </div>

            {/* Split layout: Itemized line items left, Lead confirmation form right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Itemized ledger (7 cols) */}
              <div className="lg:col-span-7 bg-[#FAFBFD] p-5 rounded-2xl border border-[#0C2D48]/10 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#0C2D48]/10 text-[#0C2D48]/60 font-semibold uppercase tracking-wider">
                  <span>Component</span>
                  <span>Tariff ({currency})</span>
                </div>
                {calculation.breakdown.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1 text-[#0C2D48]/85"
                  >
                    <div>
                      <span className="font-medium text-[#0C2D48]">{item.label}</span>
                      {item.note && (
                        <span className="block text-[10px] text-[#0C2D48]/50">{item.note}</span>
                      )}
                    </div>
                    <span className="font-semibold text-right">
                      {currency === 'AED'
                        ? `AED ${item.amountAed.toLocaleString()}`
                        : `$${Math.round(item.amountAed / 3.6725).toLocaleString()}`}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-[#0C2D48]/15 flex items-center justify-between text-sm font-bold text-[#0C2D48]">
                  <span>Total Statutory Investment</span>
                  <span className="text-base text-[#16A34A]">{displayTotal}</span>
                </div>
              </div>

              {/* Instant proposal dispatch form (5 cols) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#0C2D48]/12 shadow-sm">
                {submitSuccess ? (
                  <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-center">
                    <span className="w-10 h-10 rounded-full bg-[#22C55E] text-white mx-auto flex items-center justify-center mb-2">
                      <Check className="w-5 h-5" />
                    </span>
                    <h4 className="font-heading font-semibold text-base text-[#0C2D48]">
                      Dossier Dispatched
                    </h4>
                    <p className="text-xs text-[#0C2D48]/75 mt-1">
                      Reference:{' '}
                      <strong className="font-mono text-[#16A34A]">{submitSuccess}</strong>
                    </p>
                    <p className="text-xs text-[#0C2D48]/60 mt-2">
                      Our corporate structuring director will email your binding contract within 2
                      business hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <h4 className="font-heading font-semibold text-sm text-[#0C2D48]">
                      Lock In This Schedule
                    </h4>
                    <p className="text-xs text-[#0C2D48]/60">
                      Receive an official government-stamped breakdown and booking clearance.
                    </p>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#0C2D48]/60 block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="e.g. Alexander Vance"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#0C2D48]/60 block mb-1">
                        Corporate Email
                      </label>
                      <input
                        type="email"
                        required
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        placeholder="alexander@holding.com"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#0C2D48]/60 block mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder="+971 50 000 0000"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0C2D48] hover:bg-[#0C2D48]/90 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                    >
                      {isSubmitting ? 'Generating Dossier...' : 'Lock In Sovereign Pricing'}
                      <ArrowRight className="w-3.5 h-3.5 text-[#22C55E]" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= BOTTOM NAVIGATION CONTROLS ================= */}
        <div className="pt-8 mt-8 pb-4 border-t border-[#0C2D48]/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#0C2D48]/15 text-xs font-semibold text-[#0C2D48] hover:bg-[#FAFBFD] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0C2D48] text-white text-xs font-semibold hover:bg-[#0C2D48]/90 transition-all shadow-sm"
            >
              Continue to Step {step + 1} <ArrowRight className="w-3.5 h-3.5 text-[#22C55E]" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default VariantB_ProgressiveWizard;
