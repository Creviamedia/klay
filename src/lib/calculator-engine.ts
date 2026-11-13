/**
 * UAE Company Formation Cost Calculator Engine
 * Models realistic first-year costs across Dubai Mainland, Free Zones, and Offshore jurisdictions.
 * Fixed peg: 1 USD = 3.6725 AED.
 */

export type JurisdictionId = 'freezone-meydan' | 'freezone-ifza' | 'freezone-dmcc' | 'mainland-dubai' | 'offshore-rak';

export type ActivityTypeId = 'consulting' | 'commercial' | 'ecommerce' | 'industrial';

export type OfficeTypeId = 'flexi-desk' | 'dedicated-desk' | 'physical-office';

export interface SetupOptions {
  jurisdiction: JurisdictionId;
  activityType: ActivityTypeId;
  investorVisas: number;
  employeeVisas: number;
  officeType: OfficeTypeId;
  addOns: {
    corporateTax: boolean;
    bankAccount: boolean;
    amlCompliance: boolean;
    uaeWill: boolean;
  };
}

export interface CostLineItem {
  id: string;
  label: string;
  category: 'Licence & Authority' | 'Visas & Immigration' | 'Premises' | 'Advisory & Compliance';
  amountAed: number;
  isMandatory: boolean;
  note?: string;
}

export interface CalculationResult {
  totalAed: number;
  totalUsd: number;
  jurisdictionName: string;
  breakdown: CostLineItem[];
  turnaroundDays: string;
  goldenVisaEligible: boolean;
  summaryText: string;
}

export const JURISDICTIONS: Record<JurisdictionId, {
  id: JurisdictionId;
  name: string;
  category: 'Free Zone' | 'Mainland' | 'Offshore';
  description: string;
  baseLicenceAed: number;
  visaCostAed: number;
  turnaroundDays: string;
  popularFor: string;
  maxVisasFlexi: number;
}> = {
  'freezone-meydan': {
    id: 'freezone-meydan',
    name: 'Meydan Free Zone (Dubai)',
    category: 'Free Zone',
    description: 'Central Dubai location near Downtown; 100% foreign ownership, ideal for tech, consulting, and e-commerce.',
    baseLicenceAed: 12500,
    visaCostAed: 3750,
    turnaroundDays: '3–5 business days',
    popularFor: 'Consulting, Tech & Digital Businesses',
    maxVisasFlexi: 3,
  },
  'freezone-ifza': {
    id: 'freezone-ifza',
    name: 'IFZA Dubai',
    category: 'Free Zone',
    description: 'Cost-effective, flexible multi-activity licensing with streamlined digital onboarding.',
    baseLicenceAed: 11900,
    visaCostAed: 3500,
    turnaroundDays: '4–6 business days',
    popularFor: 'Startups & Cost-Conscious Founders',
    maxVisasFlexi: 2,
  },
  'freezone-dmcc': {
    id: 'freezone-dmcc',
    name: 'DMCC (Dubai Multi Commodities Centre)',
    category: 'Free Zone',
    description: 'Premier global trade hub located in JLT. Ideal for commodities, crypto, gold, and large trading houses.',
    baseLicenceAed: 28500,
    visaCostAed: 4500,
    turnaroundDays: '7–10 business days',
    popularFor: 'Commodities, Crypto, Global Trading',
    maxVisasFlexi: 3,
  },
  'mainland-dubai': {
    id: 'mainland-dubai',
    name: 'Dubai Mainland (DET / DED)',
    category: 'Mainland',
    description: 'Direct trade across the entire UAE market & government contracts. Requires Ejari virtual or physical office.',
    baseLicenceAed: 18500,
    visaCostAed: 4200,
    turnaroundDays: '5–8 business days',
    popularFor: 'Local UAE market trade, retail, onshore contracts',
    maxVisasFlexi: 2,
  },
  'offshore-rak': {
    id: 'offshore-rak',
    name: 'RAK ICC Offshore',
    category: 'Offshore',
    description: 'Non-resident entity for international asset protection, global holding structures, and IP rights. No local visas.',
    baseLicenceAed: 9500,
    visaCostAed: 0,
    turnaroundDays: '3–4 business days',
    popularFor: 'Holding Companies, Real Estate Assets, IP',
    maxVisasFlexi: 0,
  },
};

export const ACTIVITIES: Record<ActivityTypeId, { id: ActivityTypeId; name: string; extraFeeAed: number; description: string }> = {
  consulting: {
    id: 'consulting',
    name: 'Consulting & Professional Services',
    extraFeeAed: 0,
    description: 'Management, IT, marketing, media, engineering, or advisory activities.',
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial & General Trading',
    extraFeeAed: 2000,
    description: 'Import, export, distribution, and wholesale trade of permitted goods.',
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce & Digital Marketplace',
    extraFeeAed: 1000,
    description: 'Online store, digital services, and portal operation.',
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial & Light Manufacturing',
    extraFeeAed: 5000,
    description: 'Assembly, packaging, workshop, or light production (requires premises review).',
  },
};

export const OFFICE_SPACES: Record<OfficeTypeId, { id: OfficeTypeId; name: string; costAed: number; description: string }> = {
  'flexi-desk': {
    id: 'flexi-desk',
    name: 'Virtual Flexi-Desk / Smart Desk',
    costAed: 0, // usually bundled in base licence
    description: 'Compliant registered address and shared flexi-desk usage included with licensing.',
  },
  'dedicated-desk': {
    id: 'dedicated-desk',
    name: 'Dedicated Co-Working Desk',
    costAed: 7500,
    description: 'Assigned fixed desk in an executive co-working centre with higher visa eligibility.',
  },
  'physical-office': {
    id: 'physical-office',
    name: 'Private Physical Office (Annual Est.)',
    costAed: 24000,
    description: 'Private locked office space with custom Ejari / tenancy lease required for larger teams.',
  },
};

export const ADDON_SERVICES = {
  corporateTax: {
    id: 'corporateTax',
    name: 'Corporate Tax Registration & TRN Issuance',
    costAed: 1500,
    description: 'Mandatory FTA registration under UAE Corporate Tax law to secure tax number.',
  },
  bankAccount: {
    id: 'bankAccount',
    name: 'Corporate Bank Account Opening Advisory',
    costAed: 2500,
    description: 'Pre-screening of KYC dossiers, business plan alignment, and introductions to tier-1 UAE banks.',
  },
  amlCompliance: {
    id: 'amlCompliance',
    name: 'AML / CFT & GoAML Compliance Setup',
    costAed: 2000,
    description: 'Anti-money laundering registration and compliance manual drafting where applicable.',
  },
  uaeWill: {
    id: 'uaeWill',
    name: 'UAE Will & Succession Planning',
    costAed: 3500,
    description: 'DIFC or Abu Dhabi Judicial Department will registration advisory to protect company shares.',
  },
};

export const USD_PEG_RATE = 3.6725;

export function calculateSetupCost(options: SetupOptions): CalculationResult {
  const jur = JURISDICTIONS[options.jurisdiction];
  const act = ACTIVITIES[options.activityType];
  const office = OFFICE_SPACES[options.officeType];

  const breakdown: CostLineItem[] = [];

  // 1. Base Licence & Registration
  breakdown.push({
    id: 'base-licence',
    label: `${jur.name} — Trade Licence & Registration`,
    category: 'Licence & Authority',
    amountAed: jur.baseLicenceAed,
    isMandatory: true,
    note: 'Includes initial name approval, company registration, and authority charter',
  });

  // 2. Activity surcharges if any
  if (act.extraFeeAed > 0) {
    breakdown.push({
      id: 'activity-surcharge',
      label: `Activity Classification: ${act.name}`,
      category: 'Licence & Authority',
      amountAed: act.extraFeeAed,
      isMandatory: true,
      note: 'Specific authority fee for regulated commercial/industrial activity',
    });
  }

  // 3. Office Premises
  if (office.costAed > 0) {
    breakdown.push({
      id: 'office-space',
      label: `Premises: ${office.name}`,
      category: 'Premises',
      amountAed: office.costAed,
      isMandatory: false,
      note: office.description,
    });
  } else {
    breakdown.push({
      id: 'office-flexi',
      label: 'Registered Flexi-Desk / Address',
      category: 'Premises',
      amountAed: 0,
      isMandatory: true,
      note: 'Compliant registered address included in baseline licence',
    });
  }

  // 4. Investor Visas (Not applicable for offshore)
  if (jur.id !== 'offshore-rak' && options.investorVisas > 0) {
    const investorTotal = options.investorVisas * jur.visaCostAed;
    breakdown.push({
      id: 'investor-visas',
      label: `Investor / Partner Visa (${options.investorVisas}x)`,
      category: 'Visas & Immigration',
      amountAed: investorTotal,
      isMandatory: false,
      note: `Includes entry permit, medical test, Emirates ID registration & 2-year residency stamping`,
    });
  }

  // 5. Employee Visas
  if (jur.id !== 'offshore-rak' && options.employeeVisas > 0) {
    const employeeTotal = options.employeeVisas * (jur.visaCostAed + 500); // slight surcharge for labor/establishment
    breakdown.push({
      id: 'employee-visas',
      label: `Employee Residence Visas (${options.employeeVisas}x)`,
      category: 'Visas & Immigration',
      amountAed: employeeTotal,
      isMandatory: false,
      note: `Includes MOHRE/Authority quota, entry permit, medical & Emirates ID processing`,
    });
  }

  // 6. Add-Ons
  if (options.addOns.corporateTax) {
    breakdown.push({
      id: 'addon-tax',
      label: ADDON_SERVICES.corporateTax.name,
      category: 'Advisory & Compliance',
      amountAed: ADDON_SERVICES.corporateTax.costAed,
      isMandatory: false,
      note: ADDON_SERVICES.corporateTax.description,
    });
  }

  if (options.addOns.bankAccount) {
    breakdown.push({
      id: 'addon-bank',
      label: ADDON_SERVICES.bankAccount.name,
      category: 'Advisory & Compliance',
      amountAed: ADDON_SERVICES.bankAccount.costAed,
      isMandatory: false,
      note: ADDON_SERVICES.bankAccount.description,
    });
  }

  if (options.addOns.amlCompliance) {
    breakdown.push({
      id: 'addon-aml',
      label: ADDON_SERVICES.amlCompliance.name,
      category: 'Advisory & Compliance',
      amountAed: ADDON_SERVICES.amlCompliance.costAed,
      isMandatory: false,
      note: ADDON_SERVICES.amlCompliance.description,
    });
  }

  if (options.addOns.uaeWill) {
    breakdown.push({
      id: 'addon-will',
      label: ADDON_SERVICES.uaeWill.name,
      category: 'Advisory & Compliance',
      amountAed: ADDON_SERVICES.uaeWill.costAed,
      isMandatory: false,
      note: ADDON_SERVICES.uaeWill.description,
    });
  }

  const totalAed = breakdown.reduce((sum, item) => sum + item.amountAed, 0);
  const totalUsd = Math.round((totalAed / USD_PEG_RATE) * 100) / 100;

  // 10-year UAE Golden Visa qualification check (business investors with share capital >= AED 2M)
  const goldenVisaEligible = totalAed >= 50000 || options.investorVisas >= 2;

  const summaryText = `Your calculated estimate for a ${act.name} company in ${jur.name} with ${options.investorVisas} investor visa(s) and ${options.employeeVisas} employee visa(s) is AED ${totalAed.toLocaleString()} (approx. $${Math.round(totalUsd).toLocaleString()} USD).`;

  return {
    totalAed,
    totalUsd,
    jurisdictionName: jur.name,
    breakdown,
    turnaroundDays: jur.turnaroundDays,
    goldenVisaEligible,
    summaryText,
  };
}
