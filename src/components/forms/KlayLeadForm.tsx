import React, { useId, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Lock,
  Mail,
  Phone,
  RotateCcw,
  Sparkles,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type JurisdictionOption = 'Free Zone' | 'Mainland DED' | 'DIFC / ADGM';
export type TimelineOption = 'Immediate (1-2 weeks)' | '1-3 months' | 'Planning stage';

export interface KlayLeadFormProps {
  /**
   * Visual theme:
   * - 'dark': Frosted glass navy backdrop for deep hero sections (default)
   * - 'light': Clean architectural card for bright content pages
   */
  variant?: 'dark' | 'light';
  /** Tracking source passed to /api/leads payload */
  source?: string;
  /** Custom outer container classes */
  className?: string;
  /** Explicitly toggle the card header */
  showHeader?: boolean;
  /** Custom header title */
  title?: string;
  /** Custom header subtitle */
  subtitle?: string;
  /** Custom header eyebrow */
  eyebrow?: string;
}

const JURISDICTION_DETAILS: Record<JurisdictionOption, { label: string; tag: string; desc: string }> = {
  'Free Zone': {
    label: 'Free Zone',
    tag: '100% Foreign Ownership',
    desc: 'Cost-effective, zero corporate tax on qualifying income, rapid setup.',
  },
  'Mainland DED': {
    label: 'Mainland DED',
    tag: 'Direct UAE Trade',
    desc: 'Trade unrestricted across all 7 emirates & bid for government tenders.',
  },
  'DIFC / ADGM': {
    label: 'DIFC / ADGM',
    tag: 'Common Law Hub',
    desc: 'Premier financial jurisdiction with independent English common law courts.',
  },
};

const COUNTRY_DIAL_CODES = [
  { code: '+971', label: 'UAE (+971)', flag: '🇦🇪' },
  { code: '+966', label: 'Saudi Arabia (+966)', flag: '🇸🇦' },
  { code: '+44', label: 'UK (+44)', flag: '🇬🇧' },
  { code: '+1', label: 'US / Canada (+1)', flag: '🇺🇸' },
  { code: '+91', label: 'India (+91)', flag: '🇮🇳' },
  { code: '+65', label: 'Singapore (+65)', flag: '🇸🇬' },
  { code: '+41', label: 'Switzerland (+41)', flag: '🇨🇭' },
  { code: '+49', label: 'Germany (+49)', flag: '🇩🇪' },
  { code: '+33', label: 'France (+33)', flag: '🇫🇷' },
  { code: '+61', label: 'Australia (+61)', flag: '🇦🇺' },
  { code: '+974', label: 'Qatar (+974)', flag: '🇶🇦' },
  { code: '+965', label: 'Kuwait (+965)', flag: '🇰🇼' },
  { code: '+973', label: 'Bahrain (+973)', flag: '🇧🇭' },
  { code: '+968', label: 'Oman (+968)', flag: '🇴🇲' },
  { code: '+852', label: 'Hong Kong (+852)', flag: '🇭🇰' },
  { code: '+31', label: 'Netherlands (+31)', flag: '🇳🇱' },
  { code: '+353', label: 'Ireland (+353)', flag: '🇮🇪' },
  { code: '+27', label: 'South Africa (+27)', flag: '🇿🇦' },
];

const COMMERCIAL_ACTIVITIES = [
  'Consulting & Professional Services',
  'Commercial Trading & General Trade',
  'Technology, AI & Software Development',
  'E-Commerce & Digital Marketplace',
  'Holding Company & Asset Structuring',
  'Financial Services & FinTech',
  'Media, Marketing & Creative Services',
  'Healthcare, Medical & Life Sciences',
  'Real Estate Brokerage & Development',
  'Industrial & Light Manufacturing',
  'Other / Specialized Commercial Activity',
];

const TIMELINE_OPTIONS: TimelineOption[] = [
  'Immediate (1-2 weeks)',
  '1-3 months',
  'Planning stage',
];

export function KlayLeadForm({
  variant = 'dark',
  source = 'direct',
  className,
  showHeader,
  title,
  subtitle,
  eyebrow,
}: KlayLeadFormProps) {
  const isDark = variant === 'dark';
  const shouldRenderHeader = showHeader ?? true;

  const defaultEyebrow = eyebrow || (isDark ? 'Get in touch' : source === 'contact-page' ? 'Direct Legal Inquiry' : 'Your next step');
  const defaultTitle = title || (isDark ? 'Tell us about your plans' : 'Send Us a Message');
  const defaultSubtitle =
    subtitle ||
    (isDark
      ? 'Share your business setup requirements for an expedited legal assessment.'
      : 'Share your business setup requirements with our senior advisory team.');

  // Unique IDs for form accessibility
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const dialCodeId = useId();
  const activityId = useId();
  const timelineId = useId();
  const notesId = useId();

  // Form State
  const [jurisdiction, setJurisdiction] = useState<JurisdictionOption>('Free Zone');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+971');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [activity, setActivity] = useState(COMMERCIAL_ACTIVITIES[0]);
  const [timeline, setTimeline] = useState<TimelineOption>('Immediate (1-2 weeks)');
  const [notes, setNotes] = useState('');

  // Submission State Machine
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [leadId, setLeadId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleCopyLeadId = async () => {
    if (!leadId) return;
    try {
      await navigator.clipboard.writeText(leadId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhoneLocal('');
    setNotes('');
    setJurisdiction('Free Zone');
    setActivity(COMMERCIAL_ACTIVITIES[0]);
    setTimeline('Immediate (1-2 weeks)');
    setStatus('idle');
    setLeadId('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    // Validate phone number has digits
    const cleanedDigits = phoneLocal.replace(/\D/g, '');
    if (!cleanedDigits) {
      setErrorMessage('Please provide a valid phone or WhatsApp number.');
      setStatus('error');
      return;
    }

    let cleanedLocal = phoneLocal.trim();
    if (cleanedLocal.startsWith('0')) {
      cleanedLocal = cleanedLocal.replace(/^0+/, '');
    }
    const fullPhone = `${dialCode} ${cleanedLocal}`;
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: fullPhone,
      jurisdiction,
      activity,
      timeline,
      notes: notes.trim(),
      source,
    };

    setStatus('submitting');
    setErrorMessage('');

    try {
      const endpoint = import.meta.env?.VITE_LEAD_API_ENDPOINT || '/api/leads';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setLeadId(data.leadId || data.referenceNumber);
        setStatus('success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(
          errorData.message || 'Unable to register your request with the Legal Desk. Please try again or call us directly.'
        );
        setStatus('error');
      }
    } catch {
      setErrorMessage(
        'Unable to connect to the Legal Advisory Desk due to a network error. Please try again or call us directly.'
      );
      setStatus('error');
    }
  };

  return (
    <div
      className={cn(
        'w-full transition-all duration-300',
        isDark
          ? 'rounded-[1.75rem] border border-white/20 bg-[#0C2D48]/85 p-4 sm:p-5 text-white shadow-[0_24px_60px_rgba(4,17,29,0.35)] backdrop-blur-xl'
          : 'rounded-[1.75rem] border border-[#0C2D48]/15 bg-white/95 p-4 sm:p-5 text-[#0C2D48] shadow-[0_16px_40px_rgba(12,45,72,0.08)] backdrop-blur-md',
        className
      )}
    >
      {/* Optional Card Header */}
      {shouldRenderHeader && status !== 'success' && (
        <div className="mb-2.5 sm:mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-[0.14em] text-[#E8C37A] bg-[#E8C37A]/15 border border-[#E8C37A]/30">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {defaultEyebrow}
          </div>
          <h2
            className={cn(
              'mt-1 font-display text-xl font-bold tracking-tight sm:text-2xl',
              isDark ? 'text-white' : 'text-[#0C2D48]'
            )}
          >
            {defaultTitle}
          </h2>
          <p
            className={cn(
              'mt-0.5 text-xs leading-relaxed',
              isDark ? 'text-white/80' : 'text-[#424E5A]'
            )}
          >
            {defaultSubtitle}
          </p>
        </div>
      )}

      {/* STATE: SUCCESS */}
      {status === 'success' && (
        <div className="py-2 text-center motion-safe:animate-fadeIn">
          {/* Animated checkmark circle */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8C37A]/20 border-2 border-[#E8C37A] text-[#E8C37A] shadow-[0_0_20px_rgba(232,195,122,0.35)]">
            <CheckCircle2 className="h-7 w-7 text-[#E8A72E]" aria-hidden="true" />
          </div>

          <h3
            className={cn(
              'mt-2.5 font-display text-xl font-bold tracking-tight sm:text-2xl',
              isDark ? 'text-white' : 'text-[#0C2D48]'
            )}
          >
            Inquiry Successfully Registered
          </h3>
          <p
            className={cn(
              'mt-1 text-xs max-w-md mx-auto',
              isDark ? 'text-white/80' : 'text-[#424E5A]'
            )}
          >
            Your sovereign entity brief has been submitted to the Klay Legal Advisory Desk.
          </p>

          {/* Reference Badge */}
          <div
            className={cn(
              'mt-3.5 rounded-xl p-3.5 text-left border',
              isDark
                ? 'bg-white/[0.06] border-white/15'
                : 'bg-[#0C2D48]/[0.04] border-[#0C2D48]/12'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold tracking-[0.14em] uppercase text-[#E8A72E]">
                  Intake Reference
                </span>
                <p
                  className={cn(
                    'mt-0.5 font-mono text-base font-bold tracking-wide sm:text-lg',
                    isDark ? 'text-white' : 'text-[#0C2D48]'
                  )}
                >
                  {leadId}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyLeadId}
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-[#0C2D48]/10 hover:bg-[#0C2D48]/15 text-[#0C2D48]'
                )}
                aria-label="Copy reference number to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Next steps timeline */}
            <div
              className={cn(
                'mt-2.5 pt-2.5 border-t space-y-1.5 text-xs',
                isDark ? 'border-white/10 text-white/75' : 'border-[#0C2D48]/10 text-[#424E5A]'
              )}
            >
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8C37A] text-xs font-bold text-[#0C2D48]">
                  1
                </span>
                <span>
                  <strong>Jurisdiction Verification:</strong> Reviewing selected{' '}
                  <span className="text-[#E8A72E] font-medium">{jurisdiction}</span> requirements.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8C37A] text-xs font-bold text-[#0C2D48]">
                  2
                </span>
                <span>
                  <strong>Direct Contact:</strong> Senior Consultant will reach out via WhatsApp / Email.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8C37A] text-xs font-bold text-[#0C2D48]">
                  3
                </span>
                <span>
                  <strong>Turnaround:</strong> Within 2 hours during UAE business hours (09:00 - 18:00 GST).
                </span>
              </div>
            </div>
          </div>

          {/* Reset Action */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                isDark
                  ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                  : 'border border-[#0C2D48]/20 bg-white text-[#0C2D48] hover:bg-[#0C2D48]/5'
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Submit Another Inquiry
            </button>
          </div>
        </div>
      )}

      {/* STATE: IDLE / SUBMITTING / ERROR FORM */}
      {status !== 'success' && (
        <form onSubmit={handleSubmit} noValidate className="space-y-2.5 sm:space-y-3">
          {/* ERROR BANNER */}
          {status === 'error' && errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-500 motion-safe:animate-fadeIn"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold">Submission Incomplete</p>
                <p className="mt-0.5 text-rose-600 dark:text-rose-400">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* 1. SEGMENTED JURISDICTION PILLS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={cn('text-xs font-bold uppercase tracking-wider', isDark ? 'text-white/90' : 'text-[#0C2D48]')}>
                Target Jurisdiction <span className="text-[#E8A72E]">*</span>
              </label>
              <span className={cn('text-xs font-medium', isDark ? 'text-[#E8C37A]' : 'text-[#0C2D48]/80')}>
                {JURISDICTION_DETAILS[jurisdiction].tag}
              </span>
            </div>

            <div
              role="radiogroup"
              aria-label="Target Jurisdiction"
              className={cn(
                'grid grid-cols-3 gap-1 rounded-xl p-1 transition-colors',
                isDark
                  ? 'bg-black/25 border border-white/15'
                  : 'bg-[#0C2D48]/[0.05] border border-[#0C2D48]/12'
              )}
            >
              {(['Free Zone', 'Mainland DED', 'DIFC / ADGM'] as JurisdictionOption[]).map((opt) => {
                const isSelected = jurisdiction === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={status === 'submitting'}
                    onClick={() => setJurisdiction(opt)}
                    className={cn(
                      'relative flex items-center justify-center rounded-lg py-1.5 px-2 text-center text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                      isSelected
                        ? isDark
                          ? 'bg-[#E8C37A] text-[#0C2D48] font-bold shadow-[0_2px_8px_rgba(232,195,122,0.3)]'
                          : 'bg-[#0C2D48] text-[#E8C37A] font-bold shadow-[0_2px_8px_rgba(12,45,72,0.2)]'
                        : isDark
                          ? 'text-white/75 hover:text-white hover:bg-white/[0.08]'
                          : 'text-[#0C2D48]/75 hover:text-[#0C2D48] hover:bg-white/80'
                    )}
                  >
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. NAME & EMAIL ROW */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label
                htmlFor={nameId}
                className={cn('block text-xs font-bold uppercase tracking-wider mb-1', isDark ? 'text-white/90' : 'text-[#0C2D48]')}
              >
                Full Name <span className="text-[#E8A72E]">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className={cn('h-3.5 w-3.5', isDark ? 'text-white/40' : 'text-[#64748B]')} aria-hidden="true" />
                </div>
                <input
                  id={nameId}
                  type="text"
                  required
                  autoComplete="name"
                  disabled={status === 'submitting'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Al Mansoor"
                  className={cn(
                    'w-full rounded-xl py-2 pl-8 pr-3 text-xs sm:text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                    isDark
                      ? 'border border-white/20 bg-white/[0.08] text-white placeholder-white/40 focus:border-[#E8C37A] focus:bg-white/[0.14]'
                      : 'border border-[#0C2D48]/20 bg-white text-[#0C2D48] placeholder-[#64748B]/60 focus:border-[#0C2D48]'
                  )}
                />
              </div>
            </div>

            {/* Business Email */}
            <div>
              <label
                htmlFor={emailId}
                className={cn('block text-xs font-bold uppercase tracking-wider mb-1', isDark ? 'text-white/90' : 'text-[#0C2D48]')}
              >
                Business Email <span className="text-[#E8A72E]">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className={cn('h-3.5 w-3.5', isDark ? 'text-white/40' : 'text-[#64748B]')} aria-hidden="true" />
                </div>
                <input
                  id={emailId}
                  type="email"
                  required
                  autoComplete="email"
                  disabled={status === 'submitting'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={cn(
                    'w-full rounded-xl py-2 pl-8 pr-3 text-xs sm:text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                    isDark
                      ? 'border border-white/20 bg-white/[0.08] text-white placeholder-white/40 focus:border-[#E8C37A] focus:bg-white/[0.14]'
                      : 'border border-[#0C2D48]/20 bg-white text-[#0C2D48] placeholder-[#64748B]/60 focus:border-[#0C2D48]'
                  )}
                />
              </div>
            </div>
          </div>

          {/* 3. PHONE / WHATSAPP WITH DIAL CODE PREFIX */}
          <div>
            <label
              htmlFor={phoneId}
              className={cn('block text-xs font-bold uppercase tracking-wider mb-1', isDark ? 'text-white/90' : 'text-[#0C2D48]')}
            >
              Phone / WhatsApp <span className="text-[#E8A72E]">*</span>
            </label>
            <div className="flex rounded-xl shadow-sm">
              <label htmlFor={dialCodeId} className="sr-only">
                Country Dial Code
              </label>
              <select
                id={dialCodeId}
                value={dialCode}
                disabled={status === 'submitting'}
                onChange={(e) => setDialCode(e.target.value)}
                className={cn(
                  'w-[100px] sm:w-[115px] rounded-l-xl border-r-0 py-2 pl-2.5 pr-1.5 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                  isDark
                    ? 'border border-white/20 bg-[#071E33] text-white focus:border-[#E8C37A]'
                    : 'border border-[#0C2D48]/20 bg-slate-50 text-[#0C2D48] focus:border-[#0C2D48]'
                )}
              >
                {COUNTRY_DIAL_CODES.map((item) => (
                  <option key={item.code} value={item.code} className="bg-[#071E33] text-white py-1">
                    {item.code} {item.label.split(' ')[0]}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                  <Phone className={cn('h-3.5 w-3.5', isDark ? 'text-white/40' : 'text-[#64748B]')} aria-hidden="true" />
                </div>
                <input
                  id={phoneId}
                  type="tel"
                  required
                  autoComplete="tel"
                  disabled={status === 'submitting'}
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value)}
                  placeholder="50 123 4567"
                  className={cn(
                    'w-full rounded-r-xl py-2 pl-8 pr-3 text-xs sm:text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                    isDark
                      ? 'border border-white/20 bg-white/[0.08] text-white placeholder-white/40 focus:border-[#E8C37A] focus:bg-white/[0.14]'
                      : 'border border-[#0C2D48]/20 bg-white text-[#0C2D48] placeholder-[#64748B]/60 focus:border-[#0C2D48]'
                  )}
                />
              </div>
            </div>
          </div>

          {/* 4. ACTIVITY & TIMELINE ROW (Clean native dropdowns without overlapping icons) */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Primary Commercial Activity */}
            <div>
              <label
                htmlFor={activityId}
                className={cn('block text-xs font-bold uppercase tracking-wider mb-1', isDark ? 'text-white/90' : 'text-[#0C2D48]')}>
                Commercial Activity
              </label>
              <select
                id={activityId}
                disabled={status === 'submitting'}
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className={cn(
                  'w-full rounded-xl py-2 px-3 text-xs sm:text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                  isDark
                    ? 'border border-white/20 bg-[#071E33] text-white focus:border-[#E8C37A]'
                    : 'border border-[#0C2D48]/20 bg-white text-[#0C2D48] focus:border-[#0C2D48]'
                )}
              >
                {COMMERCIAL_ACTIVITIES.map((act) => (
                  <option key={act} value={act} className="bg-[#071E33] text-white py-1">
                    {act}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Timeline */}
            <div>
              <label
                htmlFor={timelineId}
                className={cn('block text-xs font-bold uppercase tracking-wider mb-1', isDark ? 'text-white/90' : 'text-[#0C2D48]')}>
                Estimated Timeline
              </label>
              <select
                id={timelineId}
                disabled={status === 'submitting'}
                value={timeline}
                onChange={(e) => setTimeline(e.target.value as TimelineOption)}
                className={cn(
                  'w-full rounded-xl py-2 px-3 text-xs sm:text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                  isDark
                    ? 'border border-white/20 bg-[#071E33] text-white focus:border-[#E8C37A]'
                    : 'border border-[#0C2D48]/20 bg-white text-[#0C2D48] focus:border-[#0C2D48]'
                )}
              >
                {TIMELINE_OPTIONS.map((time) => (
                  <option key={time} value={time} className="bg-[#071E33] text-white py-1">
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. SPECIFIC REQUIREMENTS / NOTES (OPTIONAL) */}
          <div>
            <label
              htmlFor={notesId}
              className={cn('block text-xs font-bold uppercase tracking-wider mb-1', isDark ? 'text-white/90' : 'text-[#0C2D48]')}>
              Requirements / Notes <span className="font-normal text-xs normal-case opacity-70">(Optional)</span>
            </label>
            <textarea
              id={notesId}
              rows={2}
              disabled={status === 'submitting'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Visas, corporate bank account, office needs..."
              className={cn(
                'w-full rounded-xl py-1.5 px-3 text-xs sm:text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A]',
                isDark
                  ? 'border border-white/20 bg-white/[0.08] text-white placeholder-white/40 focus:border-[#E8C37A] focus:bg-white/[0.14]'
                  : 'border border-[#0C2D48]/20 bg-white text-[#0C2D48] placeholder-[#64748B]/60 focus:border-[#0C2D48]'
              )}
            />
          </div>

          {/* 6. SUBMIT CTA */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className={cn(
              'group relative flex w-full items-center justify-center gap-2 rounded-full py-2.5 sm:py-3 px-5 text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C37A] focus-visible:ring-offset-2',
              'bg-[#E8C37A] hover:bg-[#E8A72E] text-[#0C2D48] shadow-[0_6px_20px_rgba(232,195,122,0.30)] hover:shadow-[0_8px_24px_rgba(232,167,46,0.38)]',
              isDark ? 'focus-visible:ring-offset-[#0C2D48]' : 'focus-visible:ring-offset-white',
              status === 'submitting' && 'opacity-85 cursor-wait'
            )}
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#0C2D48]" aria-hidden="true" />
                <span>Registering with Legal Desk...</span>
              </>
            ) : (
              <>
                <span>Request Sovereign Legal Consultation</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </>
            )}
          </button>

          {/* 7. TRUST BADGES */}
          <div
            className={cn(
              'flex flex-wrap items-center justify-center gap-2 rounded-lg py-1.5 px-2.5 text-center text-xs font-medium border',
              isDark
                ? 'bg-white/[0.04] border-white/10 text-white/75'
                : 'bg-[#0C2D48]/[0.03] border-[#0C2D48]/10 text-[#424E5A]'
            )}
          >
            <span className="inline-flex items-center gap-1 font-semibold text-[#E8A72E]">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Backed by Klay Legal
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>Attorney-Client Privilege</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>2-Hour Response</span>
          </div>
        </form>
      )}
    </div>
  );
}

export default KlayLeadForm;
