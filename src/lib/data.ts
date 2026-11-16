import {
  Building2,
  Globe2,
  Anchor,
  ShieldCheck,
  Plane,
  FileText,
  Users,
  Landmark,
  Banknote,
  BriefcaseBusiness,
  ClipboardCheck,
  Clock3,
  Layers3,
  Sparkles,
  Stamp,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { ROUTES } from './routes';

export const SERVICES = [
  {
    slug: 'mainland-company-setup',
    icon: Building2,
    title: 'Mainland Company Setup',
    short:
      'Establish your business in the UAE Mainland with full commercial rights and the ability to trade across all Emirates.',
    description:
      'Mainland companies are licensed by the Department of Economic Development (DED) and can operate across the entire UAE market without restriction. Ideal for businesses that need to serve the local market, bid on government contracts, or open physical branches anywhere in the country.',
    features: [
      '100% foreign ownership available',
      'Trade across all UAE Emirates',
      'Eligible for government contracts',
      'No restriction on office location',
    ],
    benefits: [
      'Unrestricted market access across the UAE',
      'Ability to bid for government tenders',
      'Flexibility to open multiple branches',
      'Diverse license activity options',
    ],
    process: [
      'Consultation & activity selection',
      'Trade name reservation & initial approval',
      'Documentation & MOA drafting',
      'Office space lease agreement (Ejari)',
      'License issuance & establishment card',
    ],
    requirements: [
      'Passport copy of shareholder(s)',
      'Passport-size photograph',
      'Proposed trade name options',
      'Business activity details',
    ],
  },
  {
    slug: 'free-zone-company-setup',
    icon: Globe2,
    title: 'Free Zone Company Setup',
    short:
      'Set up in a UAE Free Zone with 100% foreign ownership, tax benefits and streamlined licensing.',
    description:
      'UAE Free Zones are special economic zones designed for international business, offering 100% foreign ownership, zero corporate tax (in most cases), full repatriation of profits, and fast-track licensing. Each Free Zone caters to specific industries and activity types.',
    features: [
      '100% foreign ownership',
      'Zero or low corporate tax',
      'Fast-track licensing process',
      'Repatriation of all profits',
    ],
    benefits: [
      'Full ownership without a local sponsor',
      'Simplified setup and licensing',
      'World-class infrastructure & facilities',
      'Access to warehousing and co-working spaces',
    ],
    process: [
      'Free Zone selection based on activity',
      'Application & license type determination',
      'Lease agreement & documentation',
      'License & visa processing',
    ],
    requirements: [
      'Passport copy of shareholder(s)',
      'Business plan (for certain zones)',
      'Proposed company name',
      'Activity details & license type',
    ],
  },
  {
    slug: 'offshore-company-setup',
    icon: Anchor,
    title: 'Offshore Company Setup',
    short:
      'Register an offshore company for international business, asset protection and holding structures.',
    description:
      'UAE offshore companies are non-resident entities incorporated under specific Free Zone authorities. They cannot conduct business within the UAE mainland but are powerful vehicles for international trade, asset holding, and tax-efficient corporate structuring.',
    features: [
      'International asset protection',
      'No physical office required',
      'Confidential ownership structures',
      'Ideal for holding companies',
    ],
    benefits: [
      'Confidentiality of ownership',
      'No UAE corporate tax on offshore income',
      'No minimum capital requirement',
      'Holding & intellectual property structures',
    ],
    process: [
      'Structure & jurisdiction consultation',
      'Name reservation & application',
      'Due diligence & documentation',
      'Registration & certificate issuance',
    ],
    requirements: [
      'Passport copy & proof of address',
      'Bank reference letter',
      'Detailed CV of shareholder(s)',
      'Business activity description',
    ],
  },
  {
    slug: 'golden-visa',
    icon: Plane,
    title: 'Golden Visa',
    short:
      'Long-term residency for investors, entrepreneurs, skilled professionals and exceptional talents.',
    description:
      'The UAE Golden Visa grants long-term residency (5 or 10 years) to investors, entrepreneurs, skilled professionals, scientists, outstanding students and humanitarian pioneers. It provides stability and a clear path to building a life in the UAE.',
    features: [
      '5 or 10 year residency',
      'No sponsor required',
      'Family sponsorship included',
      'Path to long-term settlement',
    ],
    benefits: [
      'Long-term stability in the UAE',
      'Sponsor family members including dependents',
      'No restriction on maximum stay outside the UAE',
      'Full right to work and live in the UAE',
    ],
    process: [
      'Eligibility assessment',
      'Document preparation & attestation',
      'Application submission to ICP',
      'Medical & biometrics appointment',
      'Visa stamping & Emirates ID',
    ],
    requirements: [
      'Passport copy with 6+ months validity',
      'Passport-size photographs',
      'Eligibility category documentation',
      'Proof of income or investment',
    ],
  },
  {
    slug: 'pro-services',
    icon: FileText,
    title: 'PRO Services',
    short: 'Government liaison, document processing and visa applications handled end-to-end.',
    description:
      'Our PRO (Public Relations Officer) services cover all government-related transactions, from visa and labour card processing to license renewals, document attestation, and chamber of commerce registrations.',
    features: [
      'Visa & labour card processing',
      'Document attestation services',
      'License renewals & amendments',
      'Government liaison representation',
    ],
    benefits: [
      'Save time on government transactions',
      'Avoid application errors & rejections',
      'Dedicated PRO representation',
      'Compliance with all regulations',
    ],
    process: [
      'Service requirement assessment',
      'Document collection & verification',
      'Government portal submission',
      'Processing & delivery',
    ],
    requirements: [
      'Passport copy of applicant',
      'Emirates ID (if applicable)',
      'Company documents (if sponsored)',
      'Application-specific requirements',
    ],
  },
  {
    slug: 'corporate-bank-account',
    icon: Landmark,
    title: 'Corporate Bank Account',
    short: 'Assistance opening corporate bank accounts with leading UAE and international banks.',
    description:
      'We guide you through the UAE banking landscape, helping you select the right bank, prepare compliance documentation, and complete the account opening process with confidence.',
    features: [
      'Bank selection guidance',
      'Compliance & KYC preparation',
      'Account opening assistance',
      'Multi-currency account options',
    ],
    benefits: [
      'Access to top-tier UAE banking',
      'Multi-currency account capabilities',
      'Online & mobile banking access',
      'Trade finance & business credit facilities',
    ],
    process: [
      'Bank selection & eligibility check',
      'Documentation & compliance preparation',
      'Bank submission & compliance review',
      'Account activation',
    ],
    requirements: [
      'Company license & MOA',
      'Shareholder passport & visa',
      'Business plan & financials (some banks)',
      'Proof of business address',
    ],
  },
  {
    slug: 'trademark-registration',
    icon: ShieldCheck,
    title: 'Trademark Registration',
    short: 'Protect your brand identity with UAE and international trademark registration.',
    description:
      'Register your trademark to protect your brand, products, and services. We handle the entire registration process with the UAE Ministry of Economy, including search, filing, and prosecution.',
    features: [
      'UAE & international trademark filing',
      'Trademark search & clearance',
      'Opposition & renewal management',
      'Brand portfolio management',
    ],
    benefits: [
      'Exclusive brand protection',
      'Legal right to prevent infringement',
      'Valuable business asset',
      'Foundation for franchise expansion',
    ],
    process: [
      'Trademark search & clearance',
      'Application filing',
      'Examination & publication',
      'Registration certificate',
    ],
    requirements: [
      'Logo or word mark image',
      'List of classes & goods/services',
      'Power of Attorney',
      'Company license copy',
    ],
  },
  {
    slug: 'meydan-free-zone',
    icon: Building2,
    title: 'Meydan Free Zone Setup Dubai',
    short:
      'Form your business in Meydan Free Zone with fast Fawri 60-minute licensing, 100% foreign ownership, and prime Dubai location.',
    description:
      "Meydan Free Zone is strategically located near Downtown Dubai, offering a modern, digital-first licensing authority. With guaranteed 100% foreign ownership, flexible flexi-desk and physical office facilities, instant Fawri trade licenses, and seamless eligibility for UAE residency visas and corporate bank accounts, Meydan is one of Dubai's most competitive business hubs.",
    features: [
      'Instant 60-minute Fawri license option',
      '100% foreign ownership & capital repatriation',
      'Central Dubai location near Downtown & Business Bay',
      'Zero paid-up share capital requirement',
    ],
    benefits: [
      'Central Dubai registered business address (The Meydan Hotel)',
      'Multi-year license packages with bundled visa allocations',
      'Over 1,500 approved commercial, consulting, and media activities',
      'Fast-track partner & employment visa quotas',
      'Direct gateway to top UAE Tier-1 corporate bank accounts',
    ],
    process: [
      'Activity selection & trade name clearance',
      'KYC documentation & security pre-approval',
      'Digital license issuance (standard 24h or Fawri 60-min)',
      'Establishment card & e-Channel registration',
      'Medical VIP test & Emirates ID biometrics',
      'Corporate bank account opening assistance',
    ],
    requirements: [
      'Passport copy with 6+ months validity for all partners',
      'UAE entry stamp or residency visa copy (if resident)',
      'Proposed trade names (minimum 3 options in order of preference)',
      'Detailed description of planned commercial activities',
      'Passport-sized digital photograph with white background',
    ],
  },
  {
    slug: 'ifza-free-zone',
    icon: Globe2,
    title: 'IFZA Free Zone Setup Dubai',
    short:
      'Cost-effective, highly scalable business setup in the International Free Zone Authority (Dubai Silicon Oasis) with flexible visa allocations.',
    description:
      'The International Free Zone Authority (IFZA), operating in Dubai Silicon Oasis, provides an internationally recognized, agile, and cost-effective ecosystem. IFZA allows entrepreneurs to combine commercial, professional, and industrial activities under a single license with flexible office and visa packages, making it an ideal choice for global startups, consultancies, and digital agencies.',
    features: [
      'Cost-effective multi-activity licensing under one license',
      '0 to 6+ visa allocation packages',
      '100% foreign ownership with 0% corporate tax on qualifying income',
      'No physical office requirement (dedicated virtual flexi-desks)',
    ],
    benefits: [
      'Combine professional, commercial, and consulting activities on one license',
      'Streamlined digital incorporation without physical presence required for license',
      'Strategic access to Dubai Silicon Oasis tech infrastructure',
      'Predictable renewal fees and transparent package pricing',
      'Dedicated assistance for UAE investor and employee residency visas',
    ],
    process: [
      'Consultation on activity bundling and visa quota selection',
      'Trade name reservation and passport compliance submission',
      'Digital signing of Articles of Association (MOA)',
      'Official IFZA trade license issuance within 48 to 72 hours',
      'Immigration file activation & e-Visa issuance',
      'Emirates ID biometrics, medical VIP screening & bank onboarding',
    ],
    requirements: [
      'Shareholder and manager passport copies',
      'Clear color passport-size digital photographs',
      'Proof of residential address (utility bill or bank statement)',
      'Selected business activities from the official IFZA registry',
      'Emirates ID and cancellation papers (if already in UAE on previous visa)',
    ],
  },
  {
    slug: 'dmcc-free-zone',
    icon: Anchor,
    title: 'DMCC Free Zone Setup Dubai',
    short:
      'Incorporate in Dubai Multi Commodities Centre (DMCC) at JLT—voted Global Free Zone of the Year nine times.',
    description:
      "Dubai Multi Commodities Centre (DMCC) is the premier interconnected business district in Jumeirah Lakes Towers (JLT), Dubai. Ranked as the world's top free zone by Financial Times fDi Intelligence, DMCC is the global benchmark for international commodities, energy, technology, Web3 crypto, financial services, and global consulting corporations seeking prestigious corporate presence and world-class infrastructure.",
    features: [
      'Voted #1 Free Zone in the world for 9 consecutive years',
      'Prestigious JLT Dubai address with freehold commercial property options',
      'Specialized Crypto Centre, Gaming Centre, and Sustainability Hubs',
      'Full capital and profit repatriation with 0% personal tax',
    ],
    benefits: [
      'Global prestige and immediate credibility with international tier-1 banks',
      'Access to DMCC trade platforms (Dubai Gold & Commodities Exchange)',
      'Customized physical office spaces from serviced desks to full corporate floors',
      'World-class networking, trade delegations, and institutional events',
      'Fast-track digital visa processing and family sponsorship',
    ],
    process: [
      'Pre-incorporation review, activity selection & initial name approval',
      'Company registration documentation & DMCC portal onboarding',
      'Office lease selection (Flexi-desk, DMCC business centre, or physical lease)',
      'Issuance of DMCC Electronic License & Memorandum of Association',
      'Establishment card registration & investor/employee visa processing',
      'Corporate bank account introduction with primary UAE and international banks',
    ],
    requirements: [
      'Shareholder passport copies & proof of address (last 3 months)',
      'Comprehensive CV / professional profile of beneficial owners',
      'Brief business plan or summary of corporate operations',
      'Selected DMCC licensed activities and designated manager appointment',
      'Tenancy contract or DMCC business centre flexi-desk agreement',
    ],
  },
  {
    slug: 'difc-company-setup',
    icon: Landmark,
    title: 'DIFC Company Formation Dubai',
    short:
      'Establish your financial institution, tech startup, holding company, or family office in the DIFC common-law jurisdiction.',
    description:
      'Dubai International Financial Centre (DIFC) is the leading independent financial jurisdiction in the Middle East, Africa, and South Asia (MEASA). Governed by an independent common-law judicial system based on English common law, DIFC is home to premier global banks, asset managers, fintech innovators, private wealth family offices, and holding structures requiring sovereign-grade legal certainty.',
    features: [
      'Independent English common-law jurisdiction and DIFC Courts',
      'Subsidised Innovation Hub licenses for fintech, Web3, and AI startups',
      'Prescribed Companies, SPVs, and Family Office holding structures',
      'Regulated by DFSA for financial institutions and asset management',
    ],
    benefits: [
      'World-class institutional reputation recognized by international regulators',
      'Unrivaled access to institutional capital, venture funds, and sovereign investors',
      'Flexible SPV regimes for regional asset holding and estate planning',
      'Direct access to DIFC FinTech Hive and global acceleration ecosystems',
      'Long-term 10-year UAE Golden Visa sponsorship for founders and executives',
    ],
    process: [
      'Structural consultation & determination of regulatory scope (DFSA vs Non-regulated)',
      'Initial submission & letter of intent to the DIFC Registrar of Companies (ROC)',
      'Drafting DIFC-compliant Articles of Association and registry filings',
      'Office space lease agreement (Innovation hub desk or DIFC commercial office)',
      'Commercial license issuance by the DIFC ROC',
      'Establishment card, DIFC portal onboarding & executive visa processing',
    ],
    requirements: [
      'Passports and detailed profiles of UBOs, Directors, and Authorized Signatories',
      'Institutional business plan detailing operations, capital, and compliance',
      'Proof of source of funds / wealth documentation for regulated structures',
      'Registry name reservation & proposed DIFC legal structure (Ltd, SPV, Branch)',
      'DIFC registered office lease or co-working membership agreement',
    ],
  },
] as const;

export const NAV_LINKS = [
  { label: 'Home', href: ROUTES.home },
  { label: 'About', href: ROUTES.about },
  { label: 'Services', href: ROUTES.services },
  { label: 'Golden Visa', href: ROUTES.goldenVisa },
  { label: 'Business Setup', href: ROUTES.businessSetup },
  { label: 'Blog', href: ROUTES.blog },
  { label: 'Contact', href: ROUTES.contact },
];

export const COMPANY = {
  name: 'Klay Consultants',
  tagline: 'Your UAE Business Starts With One Smart Decision',
  phone: '+971 56 229 2260',
  email: 'info@klayconsultants.com',
  address: 'THE EXCHANGE TOWER - Office No.2522, Business Bay, DUBAI, UNITED ARAB EMIRATES',
  website: 'https://klayconsultants.com',
  hours: 'Sunday – Thursday, 9:00 AM – 6:00 PM (GST)',
};

// Self-hosted copies of free Pexels photos: name.webp is 1600px wide, name-800.webp 800px (see components/ui/image.tsx).
export const IMAGES = {
  heroSkyline: '/images/site/hero-skyline.webp',
  heroSkylineAlt: '/images/site/hero-skyline-alt.webp',
  dubaiMarina: '/images/site/dubai-marina.webp',
  dubaiMarinaNight: '/images/site/dubai-marina-night.webp',
  burjKhalifa: '/images/site/burj-khalifa.webp',
  dubaiCreek: '/images/site/dubai-creek.webp',
  dubaiTwilight: '/images/site/dubai-twilight.webp',
  handshake: '/images/site/handshake.webp',
  meeting: '/images/site/meeting.webp',
  dubaiSkylineWide: '/images/site/dubai-skyline-wide.webp',
  burjAlArab: '/images/site/burj-al-arab.webp',
  skylineAerial: '/images/site/skyline-aerial.webp',
};

export const HOMEPAGE_SERVICES = [
  {
    icon: Building2,
    title: 'UAE Business Formation',
    description:
      'Set up your company in Dubai, UAE with experts who can handle approvals and paperwork and help guide you through any red tape.',
    href: '/services/mainland-company-setup',
  },
  {
    icon: WalletCards,
    title: 'Corporate Taxes and VAT',
    description:
      'We can provide expert insights on UAE tax laws, accounting, VAT compliance, corporate tax filing, and tax advisory services.',
    href: '/services',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Dubai Business Visa',
    description:
      'Acquire your Dubai business visa to set up and conduct business, conferences, and explore networking opportunities in Dubai with ease.',
    href: '/golden-visa',
  },
  {
    icon: Stamp,
    title: 'Trade Licensing',
    description:
      'Secure your trade license with our expert trade licensing services to conduct business in Dubai.',
    href: '/services/mainland-company-setup',
  },
  {
    icon: Plane,
    title: 'Golden Visa',
    description:
      'Get long-term residency as an Indian expat that gives the ability to live, work and access various services in Dubai, UAE.',
    href: '/golden-visa',
  },
  {
    icon: FileText,
    title: 'PRO Services for Entrepreneurs',
    description:
      'Let our experts interface with government authorities and help you navigate renewals and regulations.',
    href: '/services/pro-services',
  },
] as const;

export const HOMEPAGE_PACKAGES = [
  {
    name: 'UAE Free Zone',
    badge: 'LOWEST PRICE OFFER',
    features: [
      'Zero Visa Package',
      'Up to 5 Business Activities',
      'Trade License & Approvals',
      'Free Corporate Tax Registration',
      'Bank Account Opening',
    ],
  },
  {
    name: 'All-Inclusive UAE Free Zone',
    badge: 'ALL-INCLUSIVE',
    features: [
      'One Visa Package',
      'Business License + Approvals',
      'Free Digital Bank Account',
      'Excise Files',
      'Free Flexi Desk',
      'Free VAT & Corporate Tax Registration',
      'Full Lifetime Access',
    ],
  },
  {
    name: 'Dubai Free Zone',
    badge: undefined,
    features: [
      'Zero Visa Package',
      'Business License + Approvals',
      'Free Digital Bank Account',
      'Free Flexi Desk',
      'Free VAT & Corporate Tax Registration',
    ],
  },
  {
    name: 'Ras Al Khaimah Economic Zone (RAKEZ)',
    badge: undefined,
    features: [
      'Biz Starter Package (0 Visa)',
      'All-Inclusive Package (1 Visa)',
      'Additional Visa Processing',
      'Investor / Partner Visa Assistance',
      'Employment Visa Support',
      'Optional Premium Service Upgrades',
    ],
  },
  {
    name: 'Creative City Fujairah',
    badge: undefined,
    features: [
      'Entrepreneur Package (0 Visa)',
      'Smart Package (1 Visa)',
      'Business One Visa (5 Quota)',
      'Business Multi Visa (15 Quota)',
      'Investor / Partner Visa',
      'Employment Visa',
      'Klay Consultants Fees',
    ],
  },
] as const;

export const HOMEPAGE_SETUP_FACTORS = [
  { icon: Globe2, title: 'Jurisdiction', text: 'Mainland, Free Zone, Offshore' },
  { icon: BriefcaseBusiness, title: 'Business Activity', text: 'License type & approvals' },
  { icon: Users, title: 'Visa Needs', text: '0 visa, 1 visa or team setup' },
  { icon: Landmark, title: 'Tax & Banking', text: 'Registration & account setup' },
] as const;

export const HOMEPAGE_ADVANTAGES = [
  {
    number: '01',
    icon: Layers3,
    title: 'Structure First, Not Just Setup',
    description:
      'We focus on the right jurisdiction, activity, and structure before incorporation.',
    points: [
      'Banking delays',
      'Visa complications',
      'Operational restrictions',
      'Costly restructuring later',
    ],
    closing: undefined,
    emphasis: undefined,
  },
  {
    number: '02',
    icon: Globe2,
    title: 'Multi-Jurisdiction Expertise',
    description: 'Mainland, Free Zone, Offshore — each has different rules.',
    points: [
      'Business activity',
      'Expansion plans',
      'Ownership structure',
      'Compliance requirements',
    ],
    closing: undefined,
    emphasis: undefined,
  },
  {
    number: '03',
    icon: Clock3,
    title: 'Fast and Predictable Timelines',
    description: undefined,
    points: [
      'Defined timelines for each stage of setup',
      'Clear expectations from day one, no vague promises',
      'Parallel processing wherever possible to save time',
      'Proactive follow-ups with authorities and banks',
      'Minimal back-and-forth through proper documentation upfront',
      'Regular progress updates so you’re never in the dark',
    ],
    closing: 'No unnecessary back and forth. No confusion.',
    emphasis: undefined,
  },
  {
    number: '04',
    icon: Banknote,
    title: 'Flat Fee. No Surprises',
    description: 'Clear pricing. No hidden charges. No unexpected add-ons.',
    points: undefined,
    closing: undefined,
    emphasis: 'You know exactly what you’re paying for.',
  },
  {
    number: '05',
    icon: ShieldCheck,
    title: 'End-to-End Support',
    description: undefined,
    points: [
      'Bank account opening',
      'AML compliance guidance',
      'ESR filing support',
      'Structuring for growth',
    ],
    closing: undefined,
    emphasis: undefined,
  },
  {
    number: '06',
    icon: TrendingUp,
    title: 'Built for Scale',
    description: 'We build your setup to grow with you.',
    points: undefined,
    closing: undefined,
    emphasis: undefined,
  },
  {
    number: '07',
    icon: Sparkles,
    title: 'Advisory-Led Approach',
    description: undefined,
    points: ['Long-term scalability', 'Operational flexibility', 'Cost efficiency'],
    closing: undefined,
    emphasis: undefined,
  },
] as const;

export const HOMEPAGE_PROCESS_STEPS = [
  {
    icon: Clock3,
    title: 'Fast-Tracked Visa & License',
    description:
      'Faster processing and approvals. A dedicated manager who handles everything for you.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Choose up to 5 Activities',
    description:
      'Faster processing and approvals. A dedicated manager who handles everything for you.',
  },
  {
    icon: ClipboardCheck,
    title: 'Free VAT & C.T Registration',
    description:
      'Mandatory VAT & Corporate Tax registration worth AED 1,000 each – at no extra cost.',
  },
  {
    icon: Building2,
    title: 'Free Flexi Desk',
    description: 'Your official UAE address with a smart, shared workspace.',
  },
  {
    icon: Landmark,
    title: 'Free Digital Bank Account',
    description: 'We handle the paperwork, approvals, and setup – all worth AED 3,000.',
  },
  {
    icon: Users,
    title: 'Dedicated Support',
    description: 'Our experts are on hand to give your business the attention it needs to succeed.',
  },
] as const;

export const SERVICE_PACKAGES: {
  title: string;
  badge?: string;
  href: string;
  features: string[];
}[] = [
  {
    title: 'UAE Free Zone Starter',
    badge: 'LOWEST STATUTORY COST',
    href: '/services/free-zone-company-setup/',
    features: [
      'Zero Visa Baseline Package',
      'Up To 5 Commercial Activities',
      'Official Trade License & Chamber Registration',
      'Corporate Tax Registration Included',
      'Digital Bank Account Assistance',
    ],
  },
  {
    title: 'All-Inclusive Free Zone',
    badge: 'MOST POPULAR',
    href: '/services/free-zone-company-setup/',
    features: [
      'One 3-Year Investor Residency Visa',
      'Business License + Sovereign Pre-Approvals',
      'VIP Corporate Bank Account Opening',
      'Registered Office Flexi-Desk Address',
      'VAT & Corporate Tax Structuring',
      'Dedicated Corporate Account Director',
    ],
  },
  {
    title: 'Mainland DED LLC Formation',
    badge: '100% LOCAL MARKET TRADE',
    href: '/services/mainland-company-setup/',
    features: [
      '100% Sovereign Foreign Ownership',
      'Unrestricted Trade Across All 7 Emirates',
      'Direct UAE Government Procurement Access',
      'Commercial Lease Registration (Ejari)',
      'Tier-1 Corporate Banking Activation',
    ],
  },
  {
    title: 'Offshore Holding & Asset Shield',
    badge: 'GLOBAL PROTECTION',
    href: '/services/offshore-company-setup/',
    features: [
      'RAK ICC & JAFZA International Holding',
      '0% Corporate Tax on Foreign Income',
      'Strict Statutory Confidentiality',
      'Cross-Border Intellectual Property Protection',
      'Succession & Multi-Currency Banking',
    ],
  },
  {
    title: 'Corporate Banking Priority',
    badge: 'PRE-CLEARED DOSSIER',
    href: '/services/corporate-bank-account/',
    features: [
      'Institutional KYC & AML Profile Underwriting',
      'Direct Escalation to Senior Bank Relationship Managers',
      'Emirates NBD, Mashreq, FAB & Wio Coverage',
      'Multi-Currency Accounts (AED, USD, EUR, GBP)',
      'Zero Nominee Exposure Guarantee',
    ],
  },
];

export const JURISDICTION_SERVICES: {
  number: string;
  title: string;
  href?: string;
  features: string[];
}[] = [
  {
    number: '06',
    title: 'Meydan Free Zone – Dubai',
    href: '/services/meydan-free-zone',
    features: [
      'Regular Business License (per annum)',
      'Fawri License – Instant, 60 mins (per annum)',
      'Additional Business Activity (per activity)',
      'Investor / Partner Visa (per person, 3-year)',
      'Employment (Work) Visa (per person, 3-year)',
      'Klay Consultants professional fees',
    ],
  },
  {
    number: '07',
    title: 'International Free Zone Authority (IFZA) – Dubai Silicon Oasis',
    href: '/services/ifza-free-zone',
    features: [
      '0-Visa License Package (per annum)',
      '1-Visa License Package (per annum)',
      '2-Visa License Package (per annum)',
      'Additional Business Activity (per activity)',
      'Investor / Partner Visa (per person, 2-year)',
      'Employment (Work) Visa (per person, 2-year)',
      'Medical Test – Standard (per person)',
      'Medical Test – VIP / Priority (per person)',
      'Klay Consultants professional fees*',
    ],
  },
  {
    number: '08',
    title: 'Dubai Multi Commodities Centre (DMCC) – JLT Dubai',
    href: '/services/dmcc-free-zone',
    features: [
      'Global Free Zone of the Year Accreditation',
      'Flexi-desk & Physical Office Commercial Leases',
      'Specialized Crypto, AI & Gaming Innovation Hubs',
      '100% Capital Repatriation & 0% Personal Tax',
      'Investor / Partner Visa (per person, 2-year)',
      'Employment (Work) Visa (per person, 2-year)',
      'Corporate Bank Account Introduction Support',
    ],
  },
  {
    number: '09',
    title: 'Dubai International Financial Centre – Dubai',
    href: '/services/difc-company-setup',
    features: [
      'Innovation License – Subsidised (Per Annum, 2 Years)',
      'Innovation Holding License (Per Annum)',
      'Standard Commercial License (Per Annum)',
      'Company Registration / Incorporation (One-Time)',
      'Branch Registration (One-Time)',
      'Establishment Card (Per Annum)',
      'Data Protection Registration – Initial',
      'Data Protection Registration – Annual Renewal',
      'Investor / Partner Visa (Per Person, 3-Year)',
      'Employment (Work) Visa (Per Person, 3-Year)',
    ],
  },
  {
    number: '10',
    title: 'Ras Al Khaimah Economic Zone (RAKEZ)',
    features: [
      'Biz Starter Package – Includes 0 Visa (Per Annum)',
      'All-Inclusive Package – Includes 1 Visa (Per Annum)',
      'Additional Visa Processing (Per Individual)',
      'Investor / Partner Visa Assistance',
      'Employment (Work) Visa Support (Per Employee)',
      'Optional Premium Service Upgrades Available',
    ],
  },
  {
    number: '09',
    title: 'Creative City Free Zone – Fujairah',
    features: [
      'Entrepreneur Package (0 Visa, up to 2 Owners)',
      'Smart Package (1 Visa Included, Up to 3 Owners)',
      'Business One Visa Package (5 Visa Quota)',
      'Business Multi Visa Package (15 Visa Quota)',
      'Investor / Partner Visa (Per Person)',
      'Employment (Work) Visa (Per Person)',
    ],
  },
  {
    number: '10',
    title: 'SPC Free Zone (Sharjah Publishing City) – Sharjah',
    features: [
      'Business License – 1 Year (0 Visa)',
      'Visa Allocation (Per Visa Slot)',
      'Establishment Card',
      'E-Channel Registration',
      'Investor Visa with Emirates ID (Per Person)',
      'Employment (Work) Visa with Emirates ID',
      'Change of Status (If Already in UAE)',
      'Medical Test (Per Person)',
    ],
  },
  {
    number: '11',
    title: 'Ajman Free Zone (AFZ) – Ajman',
    features: [
      'Commercial / Trading License – AED 5,555/-',
      'Service / Professional License',
      'Freelance Package – AED 12,121/-',
      'Industrial License – AED 9,175/-',
      'E-Commerce License',
      'Investor / Partner Visa (2-Year, Per Person) – To Be Confirmed',
      'Employment (Work) Visa (2-Year, Per Person) – To Be Confirmed',
    ],
  },
  {
    number: '12',
    title: 'Dubai International Financial Centre – Dubai',
    features: [
      'Innovation License – Subsidised (Per Annum, 2 Years)',
      'Innovation Holding License (Per Annum)',
      'Standard Commercial License (Per Annum)',
      'Company Registration / Incorporation (One-Time)',
      'Branch Registration (One-Time)',
      'Establishment Card (Per Annum)',
      'Data Protection Registration – Initial',
      'Data Protection Registration – Annual Renewal',
      'Investor / Partner Visa (Per Person, 3-Year)',
      'Employment (Work) Visa (Per Person, 3-Year)',
    ],
  },
  {
    number: '13',
    title: 'Abu Dhabi Global Market (ADGM) – Abu Dhabi',
    features: [
      'Financial Activities – Initial Registration',
      'Financial Activities – Annual Renewal',
      'Non-Financial Activities – Initial Registration',
      'Non-Financial Activities – Annual Renewal',
      'Retail Activities – Initial Registration',
      'Retail Activities – Annual Renewal',
      'Tech Start-up – Incentivized (Per Annum, 3 Years)',
      'DLT Foundation (Blockchain/Web3) – Initial Registration',
      'DLT Foundation – Annual Renewal',
      'Special Purpose Vehicle (SPV) – Initial Registration',
      'Investor / Partner Visa (Per Person)',
      'Employment (Work) Visa (Per Person)',
    ],
  },
];

export {
  HOMEPAGE_FAQS,
  CALCULATOR_FAQS,
  GOLDEN_VISA_FAQS,
  type FaqItem,
  type NumberedFaqItem,
} from './faqs';
