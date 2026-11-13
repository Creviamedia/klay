import { AnimatePresence, motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  Building2,
  Check,
  FileText,
  GraduationCap,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AdmitOneTicket from '@/components/sections/AdmitOneTicket';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { EquitifyButton } from '@/components/ui/EquitifyButton';
import { NumberedAccordion } from '@/components/ui/NumberedAccordion';
import { AtmosphericBanner } from '@/components/ui/AtmosphericBanner';
import { Link } from '@/components/ui/link';
import { ROUTES } from '@/lib/routes';

const eligibilityCategories = [
  {
    id: 'investors',
    label: '01 — Investors',
    title: 'Investors (Real Estate & Business)',
    description:
      'Property investment, business ownership or structured portfolios can create a pathway to long-term residency when the underlying structure is aligned.',
    points: [
      'Property investment (typically AED 2 million+)',
      'Business ownership or company shares',
      'Structured investment portfolios',
    ],
    icon: Landmark,
  },
  {
    id: 'entrepreneurs',
    label: '02 — Entrepreneurs',
    title: 'Entrepreneurs',
    description:
      'Founders and owners of active businesses may qualify when their venture is properly positioned and documented.',
    points: [
      'Startup founders',
      'Owners of UAE-registered businesses',
      'Scalable or innovation-driven ventures',
    ],
    icon: BriefcaseBusiness,
  },
  {
    id: 'professionals',
    label: '03 — Skilled Professionals',
    title: 'Skilled Professionals',
    description:
      'Professionals in approved roles can qualify depending on the category, salary thresholds and supporting documentation.',
    points: [
      'Salary typically AED 30,000+',
      'Approved job roles (engineers, executives, etc.)',
      'Employment documentation and legal structure',
    ],
    icon: Users,
  },
  {
    id: 'students',
    label: '04 — Students & Graduates',
    title: 'Students & Graduates',
    description:
      'High-performing graduates may qualify through recognized university pathways when eligibility is met.',
    points: [
      'High-performing UAE or international graduates',
      'Recognized universities (top 100 / 500 lists)',
      'Academic records and supporting proof',
    ],
    icon: GraduationCap,
  },
  {
    id: 'talent',
    label: '05 — Specialized Talent',
    title: 'Specialized Talent',
    description:
      'Exceptional talent in fields such as science, medicine, media and creative industries may be considered under specific categories.',
    points: [
      'Doctors',
      'Scientists',
      'Creatives',
      'Influencers',
    ],
    icon: Stethoscope,
  },
  {
    id: 'nomination',
    label: '06 — Nomination-based',
    title: 'Nomination-Based Golden Visa UAE',
    description:
      'Some pathways are nomination-led and depend on profile positioning, supporting documents and authority review.',
    points: [
      'Government-backed nominations',
      'Requires strong profile positioning and documentation',
      'Outcome depends on structure and authority assessment',
    ],
    icon: Sparkles,
  },
];

const requirementGroups = [
  {
    id: 'investors',
    label: 'Investors',
    items: [
      'Valid passport',
      'Clean financial records',
      'Property valuation or business capital proof',
      'Supporting legal documentation',
      'Emirates ID & medical fitness',
      'Health insurance',
    ],
  },
  {
    id: 'professionals',
    label: 'Professionals',
    items: [
      'Valid passport',
      'Clean financial records',
      'Employment contract + salary proof',
      'Approved activity alignment',
      'Emirates ID & medical fitness',
      'Health insurance',
    ],
  },
  {
    id: 'entrepreneurs',
    label: 'Entrepreneurs',
    items: [
      'Valid passport',
      'Clean financial records',
      'Trade license and financials',
      'Ownership structure and legal alignment',
      'Emirates ID & medical fitness',
      'Health insurance',
    ],
  },
];

const costBreakdown = [
  { label: 'Government fees', value: 'AED 3,000 – AED 7,000+' },
  { label: 'Medical & Emirates ID', value: 'Additional charges' },
  { label: 'Legal & structuring fees', value: 'Varies by profile' },
];

const investmentRoutes = [
  'AED 2 million property investment',
  'Business investment or ownership',
  'Salary-based eligibility',
];

const processSteps = [
  'Eligibility assessment',
  'Structuring (business / investment / employment)',
  'Document preparation',
  'Application submission',
  'Approval & Emirates ID issuance',
];

const rejectionReasons = [
  'Poor company structuring',
  'Weak or incomplete documentation',
  'AML or compliance misalignment',
  'Incorrect activity selection in trade license',
  'Unclear source of funds',
];

const advantagesList = [
  'Long-term stability (10 years)',
  'No local sponsor required',
  'Sponsor family members easily',
  'Freedom to live outside the UAE without losing residency (conditions apply)',
  'Business ownership flexibility',
  'Access to UAE banking and investment ecosystem',
];

const disadvantagesList = [
  'High entry threshold (investment or salary)',
  'Strict compliance checks',
  'Documentation-heavy process',
  'Not a citizenship pathway',
];

const familyBenefits = [
  'Sponsor spouse, children, and parents',
  'No age restriction for children in some cases',
  'Long-term security for dependents',
];

const comparisonRoutes = [
  {
    route: 'Investment',
    bestFor: 'Investors, property buyers',
    details: 'Typically relevant when capital or ownership structure is already in place and documents are aligned.',
  },
  {
    route: 'Salary-based',
    bestFor: 'Executives, professionals',
    details: 'A common route for eligible specialists, provided the role, salary and legal status fit the category.',
  },
  {
    route: 'Nomination-based',
    bestFor: 'Unique profiles',
    details: 'Often dependent on profile positioning, authority review and careful preparation of supporting evidence.',
  },
];

const differentiation = [
  {
    title: 'Lawyer-led process',
    text: 'Your application is handled by professionals who understand UAE immigration law, not just paperwork.',
  },
  {
    title: 'Structure before application',
    text: 'We align company setup, business activity, financial records and compliance framework before filing anything.',
  },
  {
    title: 'Risk mitigation',
    text: 'We identify issues early, including weak documentation, incorrect structuring and compliance gaps.',
  },
  {
    title: 'End-to-end advisory',
    text: 'From company formation to Golden Visa approval, the process is managed as one coordinated strategy.',
  },
];

const faqItems = [
  {
    question: 'What is the UAE Golden Visa?',
    answer:
      'The UAE Golden Visa is a long-term residency program for eligible investors, entrepreneurs, professionals and talented individuals, offering renewable residency without the need for a local sponsor.',
  },
  {
    question: 'Who can apply for Golden Visa UAE?',
    answer:
      'Eligibility varies by category and can include investors, entrepreneurs, skilled professionals, students or graduates, and recognized talent, subject to the applicable authority requirements and documentation.',
  },
  {
    question: 'Is the UAE Golden Visa valid for 10 years?',
    answer:
      'The program commonly supports renewable long-term residency, and the precise duration depends on the specific category and authority processes involved.',
  },
  {
    question: 'What is the minimum investment for property investors?',
    answer:
      'Requirements can vary, and property-related eligibility often depends on valuation, title deed documentation and the applicable conditions for the route being considered.',
  },
  {
    question: 'How much does the UAE Golden Visa cost?',
    answer:
      'Government fees, medical and Emirates ID charges, and legal or advisory costs are different, so it is best to review the specific route and supporting costs before making assumptions.',
  },
  {
    question: 'Can Golden Visa holders sponsor their family?',
    answer:
      'Family sponsorship is generally a key benefit of the program, but the specific rules and dependent conditions depend on the applicable regulations and circumstances.',
  },
  {
    question: 'What documents are required?',
    answer:
      'A typical application requires a valid passport, financial records, relevant supporting documents for the category, health insurance and the necessary legal paperwork for the chosen route.',
  },
  {
    question: 'Can a Golden Visa application be rejected?',
    answer:
      'Yes. Incomplete documentation, weak structure, non-alignment of records and compliance issues can create problems, which is why careful preparation matters.',
  },
  {
    question: 'What is the difference between Dubai and Abu Dhabi processing?',
    answer:
      'The overall eligibility is federal in character, but the application route and authority handling can differ by emirate and by the specific category.',
  },
  {
    question: 'How can I discuss my eligibility?',
    answer:
      'The best next step is to speak with an adviser to review your profile, category, documents and the most suitable route before filing anything.',
  },
];

function ResponsiveGoldenVisaTicket() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(741);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.min(741, entry.contentRect.width));
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto w-full min-w-0 max-w-[741px]" style={{ aspectRatio: '741 / 425' }}>
      <div className="absolute left-0 top-0">
        <AdmitOneTicket
          name="GOLDEN VISA"
          presenter="KLAY CONSULTANTS"
          event="UAE RESIDENCY ADVISORY"
          venue="UAE"
          dates="ELIGIBILITY · STRUCTURE"
          stubText="GOLDEN"
          watermark=""
          width={width}
          texture={{
            engine: 'generative',
            colorBack: '#05131F',
            colorFront: '#22C55E',
            colorHighlight: '#E8A72E',
            shape: 'warp',
            type: 'random',
            size: 0.5,
            colorSteps: 4,
            originalColors: false,
            scale: 1,
            rotation: 0,
            offsetX: 0,
            offsetY: 0,
            speed: 0.4,
          }}
        />
      </div>
    </div>
  );
}

export default function GoldenVisaPage() {
  const [selectedCategory, setSelectedCategory] = useState(eligibilityCategories[0].id);
  const [selectedRequirements, setSelectedRequirements] = useState(requirementGroups[0].id);

  const activeCategory = eligibilityCategories.find((category) => category.id === selectedCategory) ?? eligibilityCategories[0];
  const activeRequirements =
    requirementGroups.find((group) => group.id === selectedRequirements) ?? requirementGroups[0];

  return (
    <div className="golden-visa-page relative bg-[#FBFBFB] text-[#0C2D48]">
      {/* 1. OBSIDIAN HERO */}
      <section className="relative isolate overflow-hidden bg-[#05131F] pb-20 pt-32 text-white">
        {/* Atmospheric horizon glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,197,94,0.18),rgba(232,167,46,0.08)_50%,transparent_80%)]"
        />

        <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid items-center gap-12 xl:grid-cols-[1fr_1.1fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
                UAE Golden Visa · Residency Advisory
              </div>
              <h1 className="font-heading text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
                UAE Golden Visa. <br />
                <span className="font-semibold text-white">Structure First. Apply with Confidence.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Explore your potential UAE Golden Visa pathway with a clearer understanding of
                eligibility, legal structuring, documentation and institutional next steps.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <EquitifyButton href={ROUTES.contact} variant="green" size="lg">
                  DISCUSS YOUR ELIGIBILITY
                </EquitifyButton>
                <EquitifyButton href={ROUTES.contact} variant="outline" size="lg">
                  SPEAK TO LEGAL TEAM
                </EquitifyButton>
              </div>
              <p className="mt-6 text-xs leading-relaxed text-white/40">
                Eligibility, residency duration and approval depend on the applicable category,
                regulatory requirements and decisions of the relevant UAE federal immigration authorities.
              </p>
            </div>

            <ResponsiveGoldenVisaTicket />
          </div>
        </div>
      </section>

      {/* 2. STRUCTURE FIRST (PORCELAIN CANVASES) */}
      <section className="border-b border-[#0C2D48]/10 bg-[#FBFBFB] py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                Legal alignment
              </p>
              <h2 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#0C2D48] sm:text-4xl lg:text-5xl">
                Approvals are built on <br />
                <span className="font-semibold">structure, not paperwork.</span>
              </h2>
            </div>
            <div className="space-y-6 text-lg leading-relaxed text-[#0C2D48]/80">
              <p>
                Planning long-term residency in the UAE isn’t just about submitting a form. The Golden Visa UAE is a powerful pathway to 10-year residency, but approvals are not random. They are built on verified structure, documentation, and statutory alignment.
              </p>
              <p className="font-medium text-[#0C2D48]">
                At Klay Consultants, your Golden Visa UAE application is handled by lawyers, not typing center agents. That changes everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT IS THE UAE GOLDEN VISA (OBSIDIAN SPLIT) */}
      <section className="relative bg-[#05131F] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Strategic Overview
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl">
              What is the <span className="font-semibold text-white">UAE Golden Visa?</span>
            </h2>
            <p className="mt-4 text-lg text-white/70">
              A sovereign long-term residency program that allows investors, entrepreneurs, professionals, and exceptional talent to live, work, and scale in the UAE without needing a local national sponsor.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Card 1: Key Privileges */}
            <div className="relative border border-white/10 bg-[#0C2D48]/40 p-8 lg:p-10">
              <CornerCrosshairs />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8A72E]">
                Key Privileges
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">10-Year Renewable Framework</h3>
              <ul className="mt-8 space-y-4">
                {[
                  '10-year renewable residency self-sponsored status',
                  '100% full business ownership across mainland & free zones',
                  'Family sponsorship (spouse, children, and parents without age cap)',
                  'Freedom to live outside the UAE with no six-month expiry rule',
                  'Direct eligibility for VIP private banking and asset financing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 border-b border-white/5 pb-3 text-base text-white/80 last:border-b-0">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#22C55E]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Strategy note */}
            <div className="relative border border-white/10 bg-[#0C2D48]/20 p-8 lg:p-10 flex flex-col justify-between">
              <CornerCrosshairs />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                  Strategic Positioning
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Residency as a Strategic Asset</h3>
                <p className="mt-4 text-base leading-relaxed text-white/70">
                  The UAE Golden Visa is not merely an entry permit; it is an institutional platform for wealth preservation, tax optimization, and generational family security. Structuring the right category upfront ensures compliance with federal immigration guidelines and bank AML standards.
                </p>
                <div className="mt-6 border-l-2 border-[#22C55E] bg-white/[0.02] p-4 text-sm text-white/90">
                  "Most applications do not fail at the immigration desk. They fail weeks earlier in the corporate structuring and activity classification stage."
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <EquitifyButton href={ROUTES.contact} variant="green" size="md">
                  CHECK YOUR CATEGORY FIT
                </EquitifyButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHO CAN APPLY — 6 CATEGORIES WITH TABS (PORCELAIN) */}
      <section className="bg-[#FBFBFB] py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Eligibility Framework
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#0C2D48] sm:text-4xl lg:text-5xl">
              Who Can Apply for <span className="font-semibold">Golden Visa UAE?</span>
            </h2>
            <p className="mt-4 text-lg text-[#0C2D48]/70">
              Eligibility is not one-size-fits-all. Select a category below to view specific qualification parameters and documentation blueprints:
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Category selection column */}
            <div className="space-y-2">
              {eligibilityCategories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative flex w-full items-center justify-between border p-5 text-left transition-all ${
                      isActive
                        ? 'border-[#0C2D48] bg-[#0C2D48] text-white shadow-md'
                        : 'border-[#0C2D48]/10 bg-white text-[#0C2D48] hover:border-[#0C2D48]/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none border ${
                          isActive
                            ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]'
                            : 'border-[#0C2D48]/10 bg-[#0C2D48]/5 text-[#0C2D48]'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isActive ? 'text-[#22C55E]' : 'text-[#0C2D48]/60'}`}>
                          {category.label}
                        </p>
                        <p className="font-medium text-base leading-tight mt-0.5">{category.title}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Category details pane */}
            <div className="relative border border-[#0C2D48]/10 bg-white p-8 lg:p-12 shadow-sm">
              <CornerCrosshairs />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                    {activeCategory.label}
                  </span>
                  <h3 className="mt-2 font-heading text-2xl font-semibold text-[#0C2D48] sm:text-3xl">
                    {activeCategory.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[#0C2D48]/75">
                    {activeCategory.description}
                  </p>

                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0C2D48]/50">
                      Standard Qualification Parameters
                    </p>
                    <ul className="mt-4 space-y-3">
                      {activeCategory.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-3 border-b border-[#0C2D48]/5 pb-3 text-base text-[#0C2D48]">
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#22C55E]">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 border-l-2 border-[#E8A72E] bg-[#E8A72E]/5 p-4 text-sm text-[#0C2D48]">
                    <span className="font-semibold text-[#0C2D48]">Crucial Legal Note:</span> Eligibility alone does not guarantee approval. Proper corporate structuring, AML clearance, and documentation sequencing are mandatory.
                  </div>

                  <div className="mt-8">
                    <EquitifyButton href={ROUTES.contact} variant="green" size="md">
                      START {activeCategory.title.toUpperCase()} ASSESSMENT
                    </EquitifyButton>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REQUIREMENTS CHECKLIST (OBSIDIAN) */}
      <section className="bg-[#05131F] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Compliance &amp; Filing
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl">
              Golden Visa UAE <span className="font-semibold text-white">Requirements</span>
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Clear document preparation prevents costly delays. Choose your profile to review mandatory paperwork:
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-2">
              {requirementGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedRequirements(group.id)}
                  className={`w-full border p-4 text-left font-medium transition-all ${
                    selectedRequirements === group.id
                      ? 'border-[#22C55E] bg-white/[0.06] text-white'
                      : 'border-white/10 bg-transparent text-white/60 hover:border-white/30'
                  }`}
                >
                  <span className="text-base font-semibold">{group.label} Filing Checklist</span>
                </button>
              ))}
            </div>

            <div className="relative border border-white/10 bg-[#0C2D48]/30 p-8 lg:p-10">
              <CornerCrosshairs />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRequirements.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#E8A72E]">Target Applicant</p>
                      <h3 className="text-2xl font-semibold text-white">{activeRequirements.label} Pathway</h3>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeRequirements.items.map((item) => (
                      <div key={item} className="flex items-start gap-3 border border-white/5 bg-white/[0.02] p-4 text-sm text-white/80">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-black">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-l-2 border-[#E8A72E] bg-white/[0.02] p-4 text-sm text-white/80">
                    <span className="font-semibold text-white">Risk Warning:</span> Missing alignment between trade license activity, salary certificates, and bank statements is the #1 reason for authority rejections.
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COST & INVESTMENT (PORCELAIN) */}
      <section className="bg-[#FBFBFB] py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Fee Transparency
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#0C2D48] sm:text-4xl lg:text-5xl">
              Golden Visa UAE <span className="font-semibold">Cost &amp; Investment</span>
            </h2>
            <p className="mt-4 text-lg text-[#0C2D48]/70">
              Clear breakdown of government statutory tariffs versus capital allocation:
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Government fees */}
            <div className="relative border border-[#0C2D48]/10 bg-white p-8 lg:p-10 shadow-sm">
              <CornerCrosshairs />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
                Statutory &amp; Legal Breakdown
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#0C2D48]">Standard Processing Costs</h3>
              <div className="mt-6 divide-y divide-[#0C2D48]/10">
                {costBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-4">
                    <span className="font-medium text-[#0C2D48]">{item.label}</span>
                    <span className="font-mono text-sm font-semibold text-[#0C2D48]">{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-l-2 border-[#0C2D48]/20 bg-[#0C2D48]/5 p-4 text-sm text-[#0C2D48]/80">
                Notice: Beware of misleading promotional claims like "23 Lakh Golden Visa." Statutory fees and actual investment capital thresholds are separate requirements under federal law.
              </p>
            </div>

            {/* Investment pathways */}
            <div className="relative border border-[#0C2D48]/10 bg-white p-8 lg:p-10 shadow-sm">
              <CornerCrosshairs />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8A72E]">
                Capital Routes
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#0C2D48]">Primary Investment Pathways</h3>
              <div className="mt-6 space-y-4">
                {investmentRoutes.map((route, i) => (
                  <div key={route} className="flex items-center gap-4 border border-[#0C2D48]/10 p-4">
                    <span className="flex h-8 w-8 items-center justify-center bg-[#0C2D48] text-xs font-bold text-white">
                      0{i + 1}
                    </span>
                    <span className="font-medium text-[#0C2D48]">{route}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-[#0C2D48]/70">
                Government application fees, medical exams, Emirates ID processing, and advisory retainers are distinct and structured cleanly in our initial proposal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 5-STEP APPLICATION TIMELINE (OBSIDIAN) */}
      <section className="bg-[#05131F] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Execution Protocol
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl">
              How to Apply for <span className="font-semibold text-white">Golden Visa UAE</span>
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Our 5-stage institutional workflow ensures complete legal compliance and predictable turnaround:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <div key={step} className="relative border border-white/10 bg-[#0C2D48]/30 p-6">
                <CornerCrosshairs />
                <span className="font-mono text-2xl font-light text-[#22C55E]">0{index + 1}</span>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/40">Phase 0{index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{step}</h3>
              </div>
            ))}
          </div>

          <p className="mt-10 border-l border-[#22C55E] pl-4 text-sm text-white/70">
            * Most delays across amateur filings happen during Stage 2 (Structuring). Having legal counsel ensure title deed, trade license, and AML alignment eliminates friction.
          </p>
        </div>
      </section>

      {/* 8. COMMON REASONS FOR REJECTION (PORCELAIN) */}
      <section className="bg-[#FBFBFB] py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8A72E]">
              Risk Mitigation
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#0C2D48] sm:text-4xl lg:text-5xl">
              Common Reasons for <span className="font-semibold">Golden Visa Rejection</span>
            </h2>
            <p className="mt-4 text-lg text-[#0C2D48]/70">
              Submissions handled like generic paperwork frequently fail due to these preventable structural missteps:
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {rejectionReasons.map((reason, index) => (
              <div key={reason} className="relative border border-[#0C2D48]/10 bg-white p-6 shadow-sm">
                <CornerCrosshairs />
                <div className="mb-4 flex h-10 w-10 items-center justify-center border border-red-200 bg-red-50 text-red-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
                  Risk 0{index + 1}
                </span>
                <h3 className="mt-2 text-base font-semibold text-[#0C2D48]">{reason}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. ADVANTAGES & TRANSPARENCY (OBSIDIAN) */}
      <section className="bg-[#05131F] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Advantages */}
            <div className="relative border border-white/10 bg-[#0C2D48]/30 p-8 lg:p-10">
              <CornerCrosshairs />
              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">Strategic Advantages</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Why Establish 10-Year UAE Residency</h3>
              <ul className="mt-6 space-y-3">
                {advantagesList.map((item) => (
                  <li key={item} className="flex items-start gap-3 border-b border-white/5 pb-2.5 text-sm text-white/80">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-black">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Frank Disadvantages */}
            <div className="relative border border-white/10 bg-[#0C2D48]/20 p-8 lg:p-10">
              <CornerCrosshairs />
              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#E8A72E]/30 bg-[#E8A72E]/10 text-[#E8A72E]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8A72E]">Honest Evaluation</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">What You Must Weigh Honestly</h3>
              <ul className="mt-6 space-y-3">
                {disadvantagesList.map((item) => (
                  <li key={item} className="flex items-start gap-3 border-b border-white/5 pb-2.5 text-sm text-white/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#E8A72E]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-white/60">
                If an agency promises an "instant, guaranteed" Golden Visa without reviewing your banking or corporate structure, they are cutting legal corners that jeopardize your standing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ABU DHABI VS DUBAI & ROUTE COMPARISON (PORCELAIN) */}
      <section className="bg-[#FBFBFB] py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Jurisdiction Intelligence
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#0C2D48] sm:text-4xl lg:text-5xl">
              Abu Dhabi vs Dubai <span className="font-semibold">Processing</span>
            </h2>
            <p className="mt-4 text-lg text-[#0C2D48]/70">
              Golden Visa eligibility is federal law, but administrative workflows differ significantly between emirates:
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="relative border border-[#0C2D48]/10 bg-white p-8 lg:p-10 shadow-sm">
              <CornerCrosshairs />
              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#0C2D48]/10 bg-[#0C2D48]/5 text-[#0C2D48]">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0C2D48]/60">Emirate of Abu Dhabi</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#0C2D48]">TAMM &amp; ADRO Nomination Framework</h3>
              <p className="mt-4 text-base leading-relaxed text-[#0C2D48]/80">
                Routed prominently through TAMM and Abu Dhabi Residents Office (ADRO). Often emphasizes structured government endorsement and nomination prerequisites for commercial founders.
              </p>
            </div>

            <div className="relative border border-[#0C2D48]/10 bg-white p-8 lg:p-10 shadow-sm">
              <CornerCrosshairs />
              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#0C2D48]/10 bg-[#0C2D48]/5 text-[#0C2D48]">
                <Landmark className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">Emirate of Dubai</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#0C2D48]">GDRFA &amp; Dedicated Visa Centers</h3>
              <p className="mt-4 text-base leading-relaxed text-[#0C2D48]/80">
                Processed through the General Directorate of Residency and Foreigners Affairs (GDRFA) Dubai, featuring expedited digital tracking and specialized physical VIP biometric lounges.
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="mt-16 overflow-x-auto border border-[#0C2D48]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#0C2D48]/10 bg-[#0C2D48]/5 text-xs uppercase tracking-[0.2em] text-[#0C2D48]">
                <tr>
                  <th className="px-6 py-4">Residency Route</th>
                  <th className="px-6 py-4">Primary Candidate Profile</th>
                  <th className="px-6 py-4">Key Legal &amp; Asset Prerequisite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0C2D48]/10">
                {comparisonRoutes.map((r) => (
                  <tr key={r.route} className="hover:bg-[#0C2D48]/[0.02]">
                    <td className="px-6 py-5 font-semibold text-[#0C2D48]">{r.route}</td>
                    <td className="px-6 py-5 text-[#0C2D48]/80">{r.bestFor}</td>
                    <td className="px-6 py-5 text-[#0C2D48]/70">{r.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION (PORCELAIN) */}
      <section className="border-t border-[#0C2D48]/10 bg-[#FBFBFB] py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
              Frequently Asked Questions
            </p>
            <h2 className="mt-3 font-heading text-3xl font-light tracking-tight text-[#0C2D48] sm:text-4xl lg:text-5xl">
              Golden Visa UAE <span className="font-semibold">Intelligence</span>
            </h2>
            <p className="mt-4 text-lg text-[#0C2D48]/70">
              Clear, definitive legal answers for investors, business owners, and corporate executives:
            </p>
          </div>

          <NumberedAccordion items={faqItems.map((item, i) => ({ number: String(i + 1).padStart(2, '0'), ...item }))} />
        </div>
      </section>

      {/* 12. ATMOSPHERIC CALL TO ACTION */}
      <AtmosphericBanner
        eyebrow="YOUR 10-YEAR UAE RESIDENCY"
        headline="Structure Your UAE Residency with Legal Precision."
        subheadline="Book a confidential consultation with our senior immigration and corporate legal advisors to evaluate your eligibility."
        ctaText="SCHEDULE ADVISORY SESSION"
        ctaTo={ROUTES.contact}
        glow="green"
      />
    </div>
  );
}
