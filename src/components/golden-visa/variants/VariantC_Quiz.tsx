import React, { useState } from 'react';
import {
  Landmark,
  Building2,
  BriefcaseBusiness,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Award,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { submitIntakeDossier } from '@/lib/intake-conduit';

interface QuizState {
  profileType: 'property' | 'business' | 'executive' | 'tech';
  financialTier: string;
  familyGoal: string;
}

export function VariantC_Quiz() {
  const [step, setStep] = useState<number>(1);
  const [quiz, setQuiz] = useState<QuizState>({
    profileType: 'property',
    financialTier: 'aed-2m-ready',
    familyGoal: 'family-all',
  });

  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Derive calculated qualification result
  const qualificationResult = (() => {
    switch (quiz.profileType) {
      case 'property':
        return {
          matchRate: '98% ELIGIBLE',
          pathwayTitle: '10-Year Real Estate Investor Golden Visa',
          authority: 'Dubai Land Department (DLD) · Cube VIP',
          turnaround: '5–7 Business Days',
          validity: '10 Years Renewable',
          keyRequisite: 'Title deed(s) totaling AED 2,000,000+ (Single or combined assets)',
          inclusions: 'Spouse, Sons of any age, Unmarried Daughters, Domestic Staff',
          categoryBadge: 'REAL ESTATE TRACK',
        };
      case 'business':
        return {
          matchRate: '95% ELIGIBLE',
          pathwayTitle: '10-Year Corporate Founder & Investor Pass',
          authority: 'Federal Authority for Identity & Citizenship (ICP / GDRFA)',
          turnaround: '7–10 Business Days',
          validity: '10 Years Renewable',
          keyRequisite: 'Company share capital of AED 2M+ or AED 250k annual corporate tax',
          inclusions: 'Up to 3 Founding Partners + Full Family Sponsorship',
          categoryBadge: 'CORPORATE FOUNDER TRACK',
        };
      case 'executive':
        return {
          matchRate: '96% ELIGIBLE',
          pathwayTitle: '10-Year Senior Executive & Specialized Professional Pass',
          authority: 'Ministry of Human Resources and Emiratisation (MoHRE)',
          turnaround: '3–5 Business Days',
          validity: '10 Years Renewable',
          keyRequisite: 'Basic salary AED 30,000+/mo + Attested Bachelor’s Degree',
          inclusions: 'Independent 10-year residency not tied to employer visa cancellation',
          categoryBadge: 'EXECUTIVE TALENT TRACK',
        };
      case 'tech':
        return {
          matchRate: '92% ELIGIBLE',
          pathwayTitle: '10-Year Tech Entrepreneur & Innovation Creator Pass',
          authority: 'Dubai Future Foundation / Ministry of Economy',
          turnaround: '10–14 Business Days',
          validity: '10 Years Renewable',
          keyRequisite: 'Incubator endorsement letter or founder of AED 500k+ valuation venture',
          inclusions: 'Founder + 3 Senior Technical Co-Founders + Family',
          categoryBadge: 'INNOVATION & AI TRACK',
        };
    }
  })();

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail || !leadPhone) return;

    setIsSubmitting(true);
    const result = await submitIntakeDossier(
      {
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        quizAnswers: quiz,
        result: qualificationResult,
        variant: 'C-GoldenVisaQuiz',
      },
      { referencePrefix: 'KLAY-GV' }
    );

    setSubmitSuccess(result.referenceNumber);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white border border-[#0C2D48]/12 shadow-[0_24px_60px_rgba(12,45,72,0.08)] overflow-hidden text-[#0C2D48] font-sans">
      {/* Top Header */}
      <div className="bg-[#FAFBFD] border-b border-[#0C2D48]/10 px-6 sm:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-[#22C55E]/15 text-[#16A34A] flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-[#16A34A] block">
              VARIANT C · 30-SECOND INTERACTIVE QUALIFIER
            </span>
            <h3 className="text-base sm:text-lg font-heading font-semibold text-[#0C2D48]">
              Instant UAE Golden Visa Eligibility Assessment
            </h3>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-white border border-[#0C2D48]/10 shadow-sm text-[#0C2D48]">
          STEP 0{step} / 04
        </div>
      </div>

      {/* Quiz Body */}
      <div className="p-6 sm:p-10 min-h-[400px] flex flex-col justify-between">
        {/* STEP 1: Primary Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h4 className="text-xl sm:text-2xl font-heading font-semibold text-[#0C2D48]">
                What best represents your primary profile in the UAE?
              </h4>
              <p className="text-sm text-[#0C2D48]/70 mt-1">
                Select your primary economic base. We will tailor the statutory legal criteria
                accordingly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setQuiz((q) => ({ ...q, profileType: 'property' }));
                  setStep(2);
                }}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  quiz.profileType === 'property'
                    ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                    : 'border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/30 hover:bg-[#FAFBFD]'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0C2D48]/5 text-[#0C2D48] flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-base text-[#0C2D48]">
                      Real Estate Owner
                    </h5>
                    <span className="text-[10px] font-mono uppercase text-[#0C2D48]/60">
                      Property Investment
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#0C2D48]/70 leading-relaxed">
                  You own or are acquiring Dubai properties (ready or off-plan) with minimum AED 2M
                  aggregate value.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuiz((q) => ({ ...q, profileType: 'business' }));
                  setStep(2);
                }}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  quiz.profileType === 'business'
                    ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                    : 'border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/30 hover:bg-[#FAFBFD]'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0C2D48]/5 text-[#0C2D48] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-base text-[#0C2D48]">
                      Corporate Founder / Investor
                    </h5>
                    <span className="text-[10px] font-mono uppercase text-[#0C2D48]/60">
                      Business Ownership
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#0C2D48]/70 leading-relaxed">
                  You hold shares in an onshore or Free Zone enterprise with AED 2M+ capital or pay
                  corporate tax.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuiz((q) => ({ ...q, profileType: 'executive' }));
                  setStep(2);
                }}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  quiz.profileType === 'executive'
                    ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                    : 'border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/30 hover:bg-[#FAFBFD]'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0C2D48]/5 text-[#0C2D48] flex items-center justify-center">
                    <BriefcaseBusiness className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-base text-[#0C2D48]">
                      Salaried Executive / Professional
                    </h5>
                    <span className="text-[10px] font-mono uppercase text-[#0C2D48]/60">
                      MoHRE Level 1 or 2
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#0C2D48]/70 leading-relaxed">
                  Senior director, physician, or technology leader earning AED 30,000+/mo under an
                  active employment contract.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuiz((q) => ({ ...q, profileType: 'tech' }));
                  setStep(2);
                }}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  quiz.profileType === 'tech'
                    ? 'border-[#22C55E] bg-[#22C55E]/5 ring-1 ring-[#22C55E]'
                    : 'border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/30 hover:bg-[#FAFBFD]'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0C2D48]/5 text-[#0C2D48] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-base text-[#0C2D48]">
                      Innovation, AI or Elite Talent
                    </h5>
                    <span className="text-[10px] font-mono uppercase text-[#0C2D48]/60">
                      Incubator / Scholar
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#0C2D48]/70 leading-relaxed">
                  Tech innovator with incubator backing, certified patent holder, or top 100 global
                  university graduate.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Financial Tier Selection */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h4 className="text-xl sm:text-2xl font-heading font-semibold text-[#0C2D48]">
                Select your financial or qualification bracket:
              </h4>
              <p className="text-sm text-[#0C2D48]/70 mt-1">
                Criteria specific to your selected profile:{' '}
                <strong className="capitalize text-[#0C2D48]">{quiz.profileType}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              {quiz.profileType === 'property' && (
                <>
                  {[
                    {
                      id: 'aed-2m-ready',
                      label: 'Single Ready Property valued at AED 2,000,000+ (Full Title Deed)',
                    },
                    {
                      id: 'aed-2m-multiple',
                      label: 'Multiple Properties totaling AED 2,000,000+ in combined equity',
                    },
                    {
                      id: 'aed-2m-offplan',
                      label:
                        'Off-Plan Property under construction with AED 2M+ value (Oqood certificate)',
                    },
                    {
                      id: 'aed-2m-mortgaged',
                      label: 'Mortgaged Property with AED 2M+ value and Bank NOC letter',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQuiz((q) => ({ ...q, financialTier: opt.id }));
                        setStep(3);
                      }}
                      className="w-full p-4 rounded-xl border border-[#0C2D48]/12 bg-white hover:border-[#22C55E] hover:bg-[#22C55E]/5 text-left flex items-center justify-between text-sm font-medium transition-all"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#22C55E]" />
                    </button>
                  ))}
                </>
              )}

              {quiz.profileType === 'business' && (
                <>
                  {[
                    {
                      id: 'biz-2m-capital',
                      label: 'AED 2,000,000+ paid-up share capital in a UAE registered company',
                    },
                    {
                      id: 'biz-250k-tax',
                      label: 'Company paying AED 250,000+ annually in UAE Federal Corporate Tax',
                    },
                    {
                      id: 'biz-new-syndicate',
                      label: 'Planning to establish a new corporate entity with AED 2M capital',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQuiz((q) => ({ ...q, financialTier: opt.id }));
                        setStep(3);
                      }}
                      className="w-full p-4 rounded-xl border border-[#0C2D48]/12 bg-white hover:border-[#22C55E] hover:bg-[#22C55E]/5 text-left flex items-center justify-between text-sm font-medium transition-all"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#22C55E]" />
                    </button>
                  ))}
                </>
              )}

              {quiz.profileType === 'executive' && (
                <>
                  {[
                    {
                      id: 'exec-30k-plus',
                      label: 'Basic Monthly Salary of AED 30,000+ under MoHRE contract',
                    },
                    {
                      id: 'exec-managing-dir',
                      label: 'Managing Director / GM role with executive company authorization',
                    },
                    {
                      id: 'exec-under-30k',
                      label:
                        'Currently earning under AED 30k but eligible via specialized degree attestation',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQuiz((q) => ({ ...q, financialTier: opt.id }));
                        setStep(3);
                      }}
                      className="w-full p-4 rounded-xl border border-[#0C2D48]/12 bg-white hover:border-[#22C55E] hover:bg-[#22C55E]/5 text-left flex items-center justify-between text-sm font-medium transition-all"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#22C55E]" />
                    </button>
                  ))}
                </>
              )}

              {quiz.profileType === 'tech' && (
                <>
                  {[
                    {
                      id: 'tech-incubator',
                      label: 'Project approved or incubated by Dubai Future District / Area 2071',
                    },
                    {
                      id: 'tech-exit',
                      label:
                        'Previous successful business exit of AED 7,000,000+ in tech/commercial',
                    },
                    {
                      id: 'tech-patents',
                      label: 'Holder of registered intellectual property or certified scientist',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQuiz((q) => ({ ...q, financialTier: opt.id }));
                        setStep(3);
                      }}
                      className="w-full p-4 rounded-xl border border-[#0C2D48]/12 bg-white hover:border-[#22C55E] hover:bg-[#22C55E]/5 text-left flex items-center justify-between text-sm font-medium transition-all"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#22C55E]" />
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Goals & Dependent Sponsorship */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h4 className="text-xl sm:text-2xl font-heading font-semibold text-[#0C2D48]">
                What is your primary relocation &amp; family scope?
              </h4>
              <p className="text-sm text-[#0C2D48]/70 mt-1">
                All UAE Golden Visas allow indefinite stay outside the country without invalidation.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'family-all',
                  title: 'Full Family Sponsorship (Spouse, Sons of Any Age, Daughters)',
                  desc: 'Includes domestic workers and private driver sponsorship under 10-year term.',
                },
                {
                  id: 'tax-banking',
                  title: 'Tax Residency Certificate & Tier-1 UAE Bank Account',
                  desc: 'Obtain 0% personal tax status while maintaining global travel flexibility.',
                },
                {
                  id: 'solo-investor',
                  title: 'Individual Sovereign Investor Pass (Self Only)',
                  desc: 'Fastest issuance (5 days) with option to add dependents later.',
                },
              ].map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => {
                    setQuiz((q) => ({ ...q, familyGoal: goal.id }));
                    setStep(4);
                  }}
                  className="w-full p-5 rounded-2xl border border-[#0C2D48]/12 bg-white hover:border-[#22C55E] hover:bg-[#22C55E]/5 text-left flex items-start justify-between transition-all"
                >
                  <div>
                    <h5 className="font-heading font-semibold text-base text-[#0C2D48]">
                      {goal.title}
                    </h5>
                    <p className="text-xs text-[#0C2D48]/65 mt-1">{goal.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#22C55E] shrink-0 mt-1 ml-4" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: INSTANT QUALIFICATION ASSESSMENT & DOSSIER DISPATCH */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Qualification Result Banner */}
            <div className="p-6 rounded-2xl bg-[#05131F] text-white border border-[#D4AF37]/50 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] font-mono text-xs font-bold border border-[#22C55E]/30">
                      {qualificationResult.matchRate}
                    </span>
                    <span className="font-mono text-xs text-[#D4AF37]">
                      {qualificationResult.categoryBadge}
                    </span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-heading font-semibold text-white tracking-tight">
                    {qualificationResult.pathwayTitle}
                  </h4>
                  <p className="text-xs text-white/70 mt-1 max-w-xl">
                    Authority:{' '}
                    <strong className="text-[#F6DF98]">{qualificationResult.authority}</strong> ·
                    Filing Turnaround:{' '}
                    <span className="font-mono">{qualificationResult.turnaround}</span>
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-white/15 sm:pl-6 shrink-0">
                  <span className="text-[10px] font-mono uppercase text-white/50 block">
                    RESIDENCY TERM
                  </span>
                  <span className="font-mono text-lg font-bold text-[#F6DF98]">10 YEARS</span>
                  <span className="text-[10px] text-[#22C55E] block font-mono">100% Renewable</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>{qualificationResult.keyRequisite}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>{qualificationResult.inclusions}</span>
                </div>
              </div>
            </div>

            {/* Confirmation Form */}
            <div className="p-6 rounded-2xl bg-[#FAFBFD] border border-[#0C2D48]/12">
              {submitSuccess ? (
                <div className="p-6 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-center">
                  <span className="w-10 h-10 rounded-full bg-[#22C55E] text-white mx-auto flex items-center justify-center mb-2">
                    <Check className="w-5 h-5" />
                  </span>
                  <h5 className="font-heading font-semibold text-base text-[#0C2D48]">
                    Pre-Clearance File Created
                  </h5>
                  <p className="text-xs font-mono text-[#16A34A] mt-1">
                    Application ID: <strong>{submitSuccess}</strong>
                  </p>
                  <p className="text-xs text-[#0C2D48]/70 mt-2">
                    Our Senior Immigration Legal Director will verify your title deed / corporate
                    documents and contact you within 2 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-heading font-semibold text-sm text-[#0C2D48]">
                        Lock In Your Priority Pre-Clearance
                      </h5>
                      <p className="text-xs text-[#0C2D48]/60">
                        Receive official document submission guidance and direct immigration filing
                        slot.
                      </p>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-[#16A34A] shrink-0" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Full Legal Name"
                      className="px-3.5 py-2.5 text-xs rounded-xl border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                    />
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="Email Address"
                      className="px-3.5 py-2.5 text-xs rounded-xl border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                    />
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="WhatsApp / Phone"
                      className="px-3.5 py-2.5 text-xs rounded-xl border border-[#0C2D48]/15 focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-5 rounded-xl bg-[#0C2D48] hover:bg-[#0C2D48]/90 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                  >
                    {isSubmitting
                      ? 'Verifying Credentials...'
                      : 'Claim Guaranteed Pre-Clearance File'}
                    <ArrowRight className="w-4 h-4 text-[#22C55E]" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="pt-6 mt-6 border-t border-[#0C2D48]/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0C2D48]/15 text-xs font-semibold text-[#0C2D48] hover:bg-[#FAFBFD]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0C2D48] text-white text-xs font-semibold hover:bg-[#0C2D48]/90 shadow-sm"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5 text-[#22C55E]" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default VariantC_Quiz;
