import React, { useState } from 'react';
import {
  Landmark,
  Building2,
  BriefcaseBusiness,
  Users,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowRight,
  Award,
  Clock,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';

interface VisaTrack {
  id: string;
  badge: string;
  title: string;
  categoryName: string;
  statutoryThreshold: string;
  governingAuthority: string;
  processingTimeline: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  privileges: string[];
  requiredDocs: string[];
  legalCitation: string;
}

const GOLDEN_VISA_TRACKS: VisaTrack[] = [
  {
    id: 'real-estate',
    badge: 'MOST FREQUENTLY FILED',
    title: '10-Year Real Estate Investor Pass',
    categoryName: 'Property Investment Category',
    statutoryThreshold: 'AED 2,000,000 (Title Deed or Off-Plan)',
    governingAuthority: 'Dubai Land Department (DLD) · Cube Center',
    processingTimeline: '5–7 Business Days',
    icon: Landmark,
    summary:
      'Direct 10-year residency for individuals owning residential or commercial properties in Dubai with an aggregate equity value of AED 2,000,000 or more. Joint spousal titles and bank-mortgaged properties with NOC are fully eligible.',
    privileges: [
      '10-Year self-sponsored residency with zero local national requirement',
      'No minimum UAE stay requirement (can remain outside UAE > 6 consecutive months)',
      'Sponsor spouse, sons of any age, unmarried daughters, and domestic support staff',
      'Direct issuance of VIP Emirates ID and Dubai driving license conversion',
      'Unrestricted ability to open resident personal and corporate bank accounts',
    ],
    requiredDocs: [
      'Original title deed(s) totaling AED 2M+ issued by Dubai Land Department',
      'Bank NOC letter (if property is mortgaged) confirming principal paid',
      'Passport copy with minimum 6 months validity',
      'UAE health insurance pre-clearance certificate',
    ],
    legalCitation: 'Cabinet Resolution No. 65 of 2022 (Executive Regulations)',
  },
  {
    id: 'business-investor',
    badge: 'CORPORATE STRUCTURING',
    title: '10-Year Corporate Founder & Shareholder Pass',
    categoryName: 'Public & Private Investment Category',
    statutoryThreshold: 'AED 2,000,000 Capital Share or AED 250k Tax / Year',
    governingAuthority: 'Federal Authority for Identity & Citizenship (ICP / GDRFA)',
    processingTimeline: '7–10 Business Days',
    icon: Building2,
    summary:
      'Engineered for corporate investors and business owners holding a minimum of AED 2M capital contribution in a UAE Free Zone or Mainland enterprise, or companies contributing AED 250k+ in annual corporate tax to the Federal Tax Authority (FTA).',
    privileges: [
      '10-Year multi-partner executive residency for up to 3 founding shareholders',
      '100% legal ownership of onshore commercial entities without a local nominee',
      'Direct qualification for high-tier corporate banking with Emirates NBD, Wio & Mashreq',
      'Comprehensive family sponsorship including dependent parents',
      'Exempt from corporate quota limits on employment visas',
    ],
    requiredDocs: [
      'Valid UAE Commercial Trade License and Memorandum of Association (MOA)',
      'Audited financial statement or bank balance confirmation showing AED 2M capital',
      'Establishment card and company immigration profile proof',
      'Share certificate and corporate resolution of shareholding',
    ],
    legalCitation: 'Federal Decree-Law No. 29 of 2021 on Entry & Residence of Foreigners',
  },
  {
    id: 'executive-talent',
    badge: 'SALARIED EXECUTIVES',
    title: '10-Year Senior Executive & Professional Pass',
    categoryName: 'High-Level Specialized Talent Category',
    statutoryThreshold: 'AED 30,000 / Month Basic Salary',
    governingAuthority: 'Ministry of Human Resources and Emiratisation (MoHRE)',
    processingTimeline: '3–5 Business Days',
    icon: BriefcaseBusiness,
    summary:
      'For senior corporate executives, managing directors, Chief Technology Officers, and department heads employed under an active MoHRE Occupational Level 1 or 2 contract earning a verifiable monthly salary of AED 30,000 or more.',
    privileges: [
      'Independent 10-year residency not bound to employer visa cancellation',
      'Grace period of 6 months after employment transition to secure new role',
      'Sponsor family members for the entire 10-year tenure regardless of job shifts',
      'Priority fast-track processing through GDRFA executive VIP counters',
    ],
    requiredDocs: [
      'MoHRE approved employment contract with AED 30k+ basic salary',
      'Last 6 months official bank statements showing direct salary transfers (WPS)',
      'Attested Bachelor’s degree (Ministry of Foreign Affairs & UAE Embassy legalisation)',
      'Company NOC and valid corporate trade license copy',
    ],
    legalCitation: 'MoHRE Ministerial Resolution No. 43 of 2022 on Occupational Levels',
  },
  {
    id: 'tech-entrepreneur',
    badge: 'INNOVATION & AI',
    title: '10-Year Certified Entrepreneur & AI Founder Pass',
    categoryName: 'Innovative Startup Category',
    statutoryThreshold: 'AED 500,000 Valuation or Incubator Endorsement',
    governingAuthority: 'Dubai Future Foundation / Ministry of Economy',
    processingTimeline: '10–14 Business Days',
    icon: Sparkles,
    summary:
      'Tailored for technology innovators, Web3/AI creators, and scalable startup founders endorsed by Dubai Future District Fund, Area 2071, in5, Hub71, or founders who have executed a prior company exit of AED 7M+.',
    privileges: [
      '10-Year residency for founder and up to 3 senior technical co-founders',
      'Direct fast-track licensing through Dubai AI Campus and DIFC Innovation Hub',
      'Access to government innovation sandbox and sovereign tech grants',
      'Full family and dependent sponsorship with zero sponsor bond',
    ],
    requiredDocs: [
      'Official letter of endorsement from an accredited UAE incubator or Dubai Future Foundation',
      'Audited pitch deck and cap table verifying founder equity',
      'Proof of prior enterprise exit or AED 500k minimum project valuation',
      'Valid passport and founder background dossier',
    ],
    legalCitation: 'UAE National Agenda for Entrepreneurship & Innovation 2031',
  },
  {
    id: 'exceptional-talent',
    badge: 'SPECIALIZED MINDS',
    title: '10-Year Outstanding Scholar & Scientist Pass',
    categoryName: 'Exceptional Academics & Healthcare Category',
    statutoryThreshold: 'GPA 3.8+ / Top 100 University / Healthcare Consultant',
    governingAuthority: 'Emirates Scientists Council · Dubai Culture · MoE',
    processingTimeline: '7–12 Business Days',
    icon: Users,
    summary:
      'Awarded to exceptional medical consultants, scientific researchers with published H-index records, prominent cultural figures endorsed by Dubai Culture, and elite university graduates with GPA 3.8+ from top 100 global institutions.',
    privileges: [
      'Prestige federal classification under the Emirates Council of Scientists',
      'Dual practice privileges across UAE private and public hospital networks',
      'Unrestricted creative licensing and studio establishment rights',
      'Generational 10-year family stability with zero employer dependency',
    ],
    requiredDocs: [
      'Official letter of recommendation from Emirates Scientists Council or Dubai Culture',
      'Certified academic transcripts and global university rank validation',
      'MOHAP / DHA specialist medical consultant license (for medical candidates)',
      'Portfolio of patented intellectual property or peer-reviewed citations',
    ],
    legalCitation: 'Prime Minister’s Office Specialized Talent Decree 2022',
  },
];

export function VariantA_Dossier() {
  const [selectedTrackId, setSelectedTrackId] = useState<string>('real-estate');
  const activeTrack =
    GOLDEN_VISA_TRACKS.find((t) => t.id === selectedTrackId) || GOLDEN_VISA_TRACKS[0];
  const Icon = activeTrack.icon;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      
      {/* ================= CATEGORY SELECTOR CAROUSEL TABS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {GOLDEN_VISA_TRACKS.map((track) => {
          const isSelected = track.id === activeTrack.id;
          const TrackIcon = track.icon;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => setSelectedTrackId(track.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#05131F] border-[#D4AF37] shadow-[0_12px_32px_rgba(212,175,55,0.18)] ring-1 ring-[#D4AF37]/50'
                  : 'bg-white border-[#0C2D48]/12 hover:border-[#D4AF37]/60 hover:bg-[#FAFBFD]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#D4AF37]/20 text-[#F6DF98]'
                        : 'bg-[#0C2D48]/5 text-[#0C2D48] group-hover:text-[#D4AF37]'
                    }`}
                  >
                    <TrackIcon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider block font-semibold ${
                    isSelected ? 'text-[#D4AF37]' : 'text-[#0C2D48]/50'
                  }`}
                >
                  {track.badge}
                </span>
                <span
                  className={`font-heading font-semibold text-xs sm:text-sm block mt-1 line-clamp-2 ${
                    isSelected ? 'text-white' : 'text-[#0C2D48]'
                  }`}
                >
                  {track.title.replace('10-Year ', '')}
                </span>
              </div>

              <div
                className={`pt-2.5 mt-3 border-t text-[11px] font-mono truncate ${
                  isSelected
                    ? 'border-white/10 text-white/70'
                    : 'border-[#0C2D48]/10 text-[#0C2D48]/60'
                }`}
              >
                {track.processingTimeline}
              </div>
            </button>
          );
        })}
      </div>

      {/* ================= LUXURY SOVEREIGN DOSSIER CARD ================= */}
      <div className="rounded-3xl bg-gradient-to-br from-[#05131F] via-[#0C2D48] to-[#05131F] border border-[#D4AF37]/40 shadow-[0_24px_70px_rgba(5,19,31,0.4)] text-white overflow-hidden relative">
        
        {/* Subtle Gold Guilloche Pattern Watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Gold Header Banner */}
        <div className="border-b border-[#D4AF37]/25 px-6 sm:px-10 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 to-[#E8A72E]/10 border border-[#D4AF37]/50 flex items-center justify-center text-[#F6DF98] shadow-inner">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#F6DF98] border border-[#D4AF37]/40">
                  {activeTrack.badge}
                </span>
                <span className="text-xs font-mono text-white/60">
                  {activeTrack.categoryName}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-semibold text-white tracking-tight mt-1">
                {activeTrack.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
            <div>
              <span className="text-[10px] font-mono text-white/50 uppercase block">STATUTORY BENCHMARK</span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#F6DF98]">{activeTrack.statutoryThreshold}</span>
            </div>
            <div className="pl-6 border-l border-white/15">
              <span className="text-[10px] font-mono text-white/50 uppercase block">TIMELINE</span>
              <span className="font-mono text-sm sm:text-base font-bold text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#22C55E]" /> {activeTrack.processingTimeline}
              </span>
            </div>
          </div>
        </div>

        {/* Dossier Content Grid */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Left Column: Scope, Authority & Privileges (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold block mb-2">
                01 // EXECUTIVE PROFILE SCOPE
              </span>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed font-normal">
                {activeTrack.summary}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/60">Governing Approval Authority:</span>
              <span className="text-[#F6DF98] font-semibold">{activeTrack.governingAuthority}</span>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold block mb-3">
                02 // STATUTORY 10-YEAR PRIVILEGES
              </span>
              <ul className="space-y-2.5">
                {activeTrack.privileges.map((privilege, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-white/90">
                    <span className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{privilege}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Pre-Clearance Checklist & Booking Action (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-black/25 p-6 rounded-2xl border border-white/10">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#D4AF37]" /> REQUIRED DOCUMENTATION
                </span>
                <span className="text-[10px] font-mono text-white/50">ICP / GDRFA Blueprint</span>
              </div>

              <ul className="space-y-2">
                {activeTrack.requiredDocs.map((doc, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80 flex items-start gap-2">
                    <span className="font-mono text-[#D4AF37] font-bold text-[10px] mt-0.5">{`0${idx + 1}`}</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Booking CTA */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Zero Risk: 100% Pre-Screened by Senior Legal Counsel</span>
              </div>
              <a
                href={`${ROUTES.contact}?topic=golden-visa&category=${activeTrack.id}`}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8A72E] hover:brightness-110 text-[#05131F] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(212,175,55,0.3)] transition-all active:scale-[0.99]"
              >
                <span>Request {activeTrack.badge} Pre-Clearance</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="block text-[10px] font-mono text-center text-white/40">
                Statutory Authority: {activeTrack.legalCitation}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VariantA_Dossier;
