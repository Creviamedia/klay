/**
 * UAE Company Formation Cost Calculator Engine
 * Models realistic first-year costs across Dubai Mainland, Free Zones, and Offshore jurisdictions.
 * Fixed peg: 1 USD = 3.6725 AED.
 */

export type JurisdictionId =
  'freezone-meydan' | 'freezone-ifza' | 'freezone-dmcc' | 'mainland-dubai' | 'offshore-rak';

export type ActivityTypeId = 'consulting' | 'commercial' | 'ecommerce' | 'industrial';

export type OfficeTypeId = 'flexi-desk' | 'dedicated-desk' | 'physical-office';

export type CurrencyCode = 'AED' | 'USD';

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

export interface CategoryAllocation {
  aed: number;
  usd: number;
  pct: number;
  formattedAed: string;
  formattedUsd: string;
}

export interface BudgetAllocationMatrix {
  licensing: CategoryAllocation;
  visas: CategoryAllocation;
  premises: CategoryAllocation;
  advisory: CategoryAllocation;
}

export interface CostLineItem {
  id: string;
  label: string;
  category: 'Licence & Authority' | 'Visas & Immigration' | 'Premises' | 'Advisory & Compliance';
  amountAed: number;
  amountUsd: number;
  formattedAed: string;
  formattedUsd: string;
  isMandatory: boolean;
  note?: string;
}

export interface CalculationResult {
  totalAed: number;
  totalUsd: number;
  formattedTotalAed: string;
  formattedTotalUsd: string;
  jurisdictionName: string;
  jurisdictionCategory: 'Free Zone' | 'Mainland' | 'Offshore';
  breakdown: CostLineItem[];
  turnaroundDays: string;
  goldenVisaEligible: boolean;
  summaryText: string;
  allocations: BudgetAllocationMatrix;
  categoryTotals: BudgetAllocationMatrix;
}

export type LedgerSummary = CalculationResult;

export const USD_PEG_RATE = 3.6725;

export function formatAed(amount: number): string {
  return `AED ${Math.round(amount).toLocaleString()}`;
}

export function formatUsd(amountAed: number): string {
  return `$${Math.round(amountAed / USD_PEG_RATE).toLocaleString()} USD`;
}

export function formatCurrency(amountAed: number, currency: CurrencyCode): string {
  return currency === 'AED' ? formatAed(amountAed) : formatUsd(amountAed);
}

export function createLineItem(
  id: string,
  label: string,
  category: 'Licence & Authority' | 'Visas & Immigration' | 'Premises' | 'Advisory & Compliance',
  amountAed: number,
  isMandatory: boolean,
  note?: string
): CostLineItem {
  const amountUsd = Math.round((amountAed / USD_PEG_RATE) * 100) / 100;
  return {
    id,
    label,
    category,
    amountAed,
    amountUsd,
    formattedAed: formatAed(amountAed),
    formattedUsd: formatUsd(amountAed),
    isMandatory,
    note,
  };
}

export function computeBudgetAllocations(
  breakdown: CostLineItem[],
  totalAed: number
): BudgetAllocationMatrix {
  let licensing = 0;
  let visas = 0;
  let premises = 0;
  let advisory = 0;

  for (const item of breakdown) {
    if (item.category === 'Licence & Authority') licensing += item.amountAed;
    else if (item.category === 'Visas & Immigration') visas += item.amountAed;
    else if (item.category === 'Premises') premises += item.amountAed;
    else if (item.category === 'Advisory & Compliance') advisory += item.amountAed;
  }

  const safeTotal = totalAed > 0 ? totalAed : 1;
  const buildAlloc = (aed: number): CategoryAllocation => ({
    aed,
    usd: Math.round((aed / USD_PEG_RATE) * 100) / 100,
    pct: Math.round((aed / safeTotal) * 100),
    formattedAed: formatAed(aed),
    formattedUsd: formatUsd(aed),
  });

  return {
    licensing: buildAlloc(licensing),
    visas: buildAlloc(visas),
    premises: buildAlloc(premises),
    advisory: buildAlloc(advisory),
  };
}

export const JURISDICTIONS: Record<
  JurisdictionId,
  {
    id: JurisdictionId;
    name: string;
    category: 'Free Zone' | 'Mainland' | 'Offshore';
    description: string;
    baseLicenceAed: number;
    visaCostAed: number;
    turnaroundDays: string;
    popularFor: string;
    maxVisasFlexi: number;
  }
> = {
  'freezone-meydan': {
    id: 'freezone-meydan',
    name: 'Meydan Free Zone (Dubai)',
    category: 'Free Zone',
    description:
      'Central Dubai location near Downtown; 100% foreign ownership, ideal for tech, consulting, and e-commerce.',
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
    description:
      'Cost-effective, flexible multi-activity licensing with streamlined digital onboarding.',
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
    description:
      'Premier global trade hub located in JLT. Ideal for commodities, crypto, gold, and large trading houses.',
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
    description:
      'Direct trade across the entire UAE market & government contracts. Requires Ejari virtual or physical office.',
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
    description:
      'Non-resident entity for international asset protection, global holding structures, and IP rights. No local visas.',
    baseLicenceAed: 9500,
    visaCostAed: 0,
    turnaroundDays: '3–4 business days',
    popularFor: 'Holding Companies, Real Estate Assets, IP',
    maxVisasFlexi: 0,
  },
};

export const ACTIVITIES: Record<
  ActivityTypeId,
  { id: ActivityTypeId; name: string; extraFeeAed: number; description: string }
> = {
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

export const OFFICE_SPACES: Record<
  OfficeTypeId,
  { id: OfficeTypeId; name: string; costAed: number; description: string }
> = {
  'flexi-desk': {
    id: 'flexi-desk',
    name: 'Virtual Flexi-Desk / Smart Desk',
    costAed: 0, // usually bundled in base licence
    description:
      'Compliant registered address and shared flexi-desk usage included with licensing.',
  },
  'dedicated-desk': {
    id: 'dedicated-desk',
    name: 'Dedicated Co-Working Desk',
    costAed: 7500,
    description:
      'Assigned fixed desk in an executive co-working centre with higher visa eligibility.',
  },
  'physical-office': {
    id: 'physical-office',
    name: 'Private Physical Office (Annual Est.)',
    costAed: 24000,
    description:
      'Private locked office space with custom Ejari / tenancy lease required for larger teams.',
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
    description:
      'Pre-screening of KYC dossiers, business plan alignment, and introductions to tier-1 UAE banks.',
  },
  amlCompliance: {
    id: 'amlCompliance',
    name: 'AML / CFT & GoAML Compliance Setup',
    costAed: 2000,
    description:
      'Anti-money laundering registration and compliance manual drafting where applicable.',
  },
  uaeWill: {
    id: 'uaeWill',
    name: 'UAE Will & Succession Planning',
    costAed: 3500,
    description:
      'DIFC or Abu Dhabi Judicial Department will registration advisory to protect company shares.',
  },
};

export function calculateSetupCost(options: SetupOptions): CalculationResult {
  const jur = JURISDICTIONS[options.jurisdiction];
  const act = ACTIVITIES[options.activityType];
  const office = OFFICE_SPACES[options.officeType];

  const breakdown: CostLineItem[] = [];

  // 1. Base Licence & Registration
  breakdown.push(
    createLineItem(
      'base-licence',
      `${jur.name} — Trade Licence & Registration`,
      'Licence & Authority',
      jur.baseLicenceAed,
      true,
      'Includes initial name approval, company registration, and authority charter'
    )
  );

  // 2. Activity surcharges if any
  if (act.extraFeeAed > 0) {
    breakdown.push(
      createLineItem(
        'activity-surcharge',
        `Activity Classification: ${act.name}`,
        'Licence & Authority',
        act.extraFeeAed,
        true,
        'Specific authority fee for regulated commercial/industrial activity'
      )
    );
  }

  // 3. Office Premises
  if (office.costAed > 0) {
    breakdown.push(
      createLineItem(
        'office-space',
        `Premises: ${office.name}`,
        'Premises',
        office.costAed,
        false,
        office.description
      )
    );
  } else {
    breakdown.push(
      createLineItem(
        'office-flexi',
        'Registered Flexi-Desk / Address',
        'Premises',
        0,
        true,
        'Compliant registered address included in baseline licence'
      )
    );
  }

  // 4. Investor Visas (Not applicable for offshore)
  if (jur.id !== 'offshore-rak' && options.investorVisas > 0) {
    const investorTotal = options.investorVisas * jur.visaCostAed;
    breakdown.push(
      createLineItem(
        'investor-visas',
        `Investor / Partner Visa (${options.investorVisas}x)`,
        'Visas & Immigration',
        investorTotal,
        false,
        'Includes entry permit, medical test, Emirates ID registration & 2-year residency stamping'
      )
    );
  }

  // 5. Employee Visas
  if (jur.id !== 'offshore-rak' && options.employeeVisas > 0) {
    const employeeTotal = options.employeeVisas * (jur.visaCostAed + 500); // slight surcharge for labor/establishment
    breakdown.push(
      createLineItem(
        'employee-visas',
        `Employee Residence Visas (${options.employeeVisas}x)`,
        'Visas & Immigration',
        employeeTotal,
        false,
        'Includes MOHRE/Authority quota, entry permit, medical & Emirates ID processing'
      )
    );
  }

  // 6. Add-Ons
  if (options.addOns.corporateTax) {
    breakdown.push(
      createLineItem(
        'addon-tax',
        ADDON_SERVICES.corporateTax.name,
        'Advisory & Compliance',
        ADDON_SERVICES.corporateTax.costAed,
        false,
        ADDON_SERVICES.corporateTax.description
      )
    );
  }

  if (options.addOns.bankAccount) {
    breakdown.push(
      createLineItem(
        'addon-bank',
        ADDON_SERVICES.bankAccount.name,
        'Advisory & Compliance',
        ADDON_SERVICES.bankAccount.costAed,
        false,
        ADDON_SERVICES.bankAccount.description
      )
    );
  }

  if (options.addOns.amlCompliance) {
    breakdown.push(
      createLineItem(
        'addon-aml',
        ADDON_SERVICES.amlCompliance.name,
        'Advisory & Compliance',
        ADDON_SERVICES.amlCompliance.costAed,
        false,
        ADDON_SERVICES.amlCompliance.description
      )
    );
  }

  if (options.addOns.uaeWill) {
    breakdown.push(
      createLineItem(
        'addon-will',
        ADDON_SERVICES.uaeWill.name,
        'Advisory & Compliance',
        ADDON_SERVICES.uaeWill.costAed,
        false,
        ADDON_SERVICES.uaeWill.description
      )
    );
  }

  const totalAed = breakdown.reduce((sum, item) => sum + item.amountAed, 0);
  const totalUsd = Math.round((totalAed / USD_PEG_RATE) * 100) / 100;
  const formattedTotalAed = formatAed(totalAed);
  const formattedTotalUsd = formatUsd(totalAed);

  // 10-year UAE Golden Visa qualification check (business investors in Free Zone or Mainland with >= 2 investor visas or high-capital setup; Offshore entities cannot sponsor UAE residency visas)
  const goldenVisaEligible =
    options.jurisdiction !== 'offshore-rak' && (totalAed >= 50000 || options.investorVisas >= 2);

  const allocations = computeBudgetAllocations(breakdown, totalAed);

  const summaryText = `Your calculated estimate for a ${act.name} company in ${jur.name} with ${options.investorVisas} investor visa(s) and ${options.employeeVisas} employee visa(s) is ${formattedTotalAed} (approx. ${formattedTotalUsd}).`;

  return {
    totalAed,
    totalUsd,
    formattedTotalAed,
    formattedTotalUsd,
    jurisdictionName: jur.name,
    jurisdictionCategory: jur.category,
    breakdown,
    turnaroundDays: jur.turnaroundDays,
    goldenVisaEligible,
    summaryText,
    allocations,
    categoryTotals: allocations,
  };
}

// =========================================================================
// EXECUTIVE INSTANT SETUP PRESETS & ENGINE (Pure Statutory Model)
// =========================================================================

export type InstantPresetId = 'freezone' | 'mainland' | 'offshore';

export interface InstantPreset {
  id: InstantPresetId;
  name: string;
  subtitle: string;
  basePriceAed: number;
  badge: string;
  turnaroundDays: string;
}

export const INSTANT_SETUP_PRESETS: Record<InstantPresetId, InstantPreset> = {
  freezone: {
    id: 'freezone',
    name: 'Free Zone',
    subtitle: 'Meydan / IFZA / DMCC',
    basePriceAed: 12500,
    badge: '100% Tax Exemption',
    turnaroundDays: '3–5 business days',
  },
  mainland: {
    id: 'mainland',
    name: 'Dubai Mainland',
    subtitle: 'DED Commercial LLC',
    basePriceAed: 18500,
    badge: 'Local UAE Market',
    turnaroundDays: '5–8 business days',
  },
  offshore: {
    id: 'offshore',
    name: 'Offshore Holding',
    subtitle: 'RAK ICC / JAFZA',
    basePriceAed: 24000,
    badge: 'Asset Protection',
    turnaroundDays: '3–4 business days',
  },
};

export interface InstantSetupOptions {
  preset: InstantPresetId;
  visas: number;
  officeType: 'flexi' | 'physical';
}

export interface InstantSetupResult {
  preset: InstantPreset;
  visas: number;
  officeType: 'flexi' | 'physical';
  basePriceAed: number;
  visaPriceAed: number;
  officePriceAed: number;
  totalAed: number;
  totalUsd: number;
  formattedTotalAed: string;
  formattedTotalUsd: string;
  formattedBasePrice: string;
  formattedVisaPrice: string;
  formattedOfficePrice: string;
}

export function calculateInstantSetup(options: InstantSetupOptions): InstantSetupResult {
  const preset = INSTANT_SETUP_PRESETS[options.preset] || INSTANT_SETUP_PRESETS.freezone;
  const isOffshore = preset.id === 'offshore';
  // Statutory rule: Offshore companies cannot sponsor UAE residency visas under ICP regulations
  const visaPriceAed = isOffshore ? 0 : Math.max(0, options.visas) * 3750;
  const officePriceAed = options.officeType === 'physical' ? 12000 : 0;
  const totalAed = preset.basePriceAed + visaPriceAed + officePriceAed;
  const totalUsd = Math.round((totalAed / USD_PEG_RATE) * 100) / 100;

  return {
    preset,
    visas: isOffshore ? 0 : options.visas,
    officeType: options.officeType,
    basePriceAed: preset.basePriceAed,
    visaPriceAed,
    officePriceAed,
    totalAed,
    totalUsd,
    formattedTotalAed: formatAed(totalAed),
    formattedTotalUsd: formatUsd(totalAed),
    formattedBasePrice: formatAed(preset.basePriceAed),
    formattedVisaPrice: formatAed(visaPriceAed),
    formattedOfficePrice: formatAed(officePriceAed),
  };
}
