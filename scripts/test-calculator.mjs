import assert from 'node:assert/strict';
import {
  calculateSetupCost,
  calculateInstantSetup,
  formatCurrency,
  formatAed,
  formatUsd,
  JURISDICTIONS,
  INSTANT_SETUP_PRESETS,
  USD_PEG_RATE,
} from '../src/lib/calculator-engine.ts';

console.log('🧪 Starting UAE Company Formation Cost Calculator & Pipeline Tests...');

// 1. Base Free Zone Calculation (Meydan, 0 visas, flexi desk)
{
  const result = calculateSetupCost({
    jurisdiction: 'freezone-meydan',
    activityType: 'consulting',
    investorVisas: 0,
    employeeVisas: 0,
    officeType: 'flexi-desk',
    addOns: { corporateTax: false, bankAccount: false, amlCompliance: false, uaeWill: false },
  });

  assert.equal(result.totalAed, 12500, 'Base Meydan licence must equal 12,500 AED');
  assert.equal(
    result.totalUsd,
    Math.round((12500 / USD_PEG_RATE) * 100) / 100,
    'USD peg conversion must be accurate'
  );
  assert.equal(result.breakdown.length, 2, 'Should have base licence and flexi-desk line items');
  assert.equal(
    result.goldenVisaEligible,
    false,
    'Standard consulting with 0 visas is not golden visa eligible'
  );
  console.log('  ✓ Meydan Free Zone baseline calculation passed');
}

// 2. IFZA with Visas and Commercial Activity
{
  const result = calculateSetupCost({
    jurisdiction: 'freezone-ifza',
    activityType: 'commercial', // +2,000 AED
    investorVisas: 1, // 1 * 3,500 AED
    employeeVisas: 1, // 1 * (3,500 + 500) = 4,000 AED
    officeType: 'dedicated-desk', // +7,500 AED
    addOns: { corporateTax: true, bankAccount: true, amlCompliance: false, uaeWill: false }, // 1,500 + 2,500
  });

  // Expected: 11,900 + 2,000 + 7,500 + 3,500 + 4,000 + 1,500 + 2,500 = 32,900 AED
  assert.equal(
    result.totalAed,
    32900,
    'IFZA total with commercial + visas + desk + add-ons must equal 32,900 AED'
  );
  console.log('  ✓ IFZA multi-visa and commercial activity calculation passed');
}

// 3. RAK ICC Offshore (No visas allowed, only base licence + add-ons)
{
  const result = calculateSetupCost({
    jurisdiction: 'offshore-rak',
    activityType: 'consulting',
    investorVisas: 2, // Must be ignored for offshore
    employeeVisas: 3, // Must be ignored for offshore
    officeType: 'flexi-desk',
    addOns: { corporateTax: false, bankAccount: false, amlCompliance: false, uaeWill: true }, // +3,500
  });

  // Expected: 9,500 + 3,500 = 13,000 AED
  assert.equal(result.totalAed, 13000, 'RAK ICC Offshore must ignore visas and charge 13,000 AED');
  assert.equal(
    result.goldenVisaEligible,
    false,
    'Offshore setups must never be Golden Visa eligible under UAE ICP rules'
  );
  console.log('  ✓ RAK ICC Offshore visa exclusion passed');
}

// 4. Dubai Mainland with Physical Office
{
  const result = calculateSetupCost({
    jurisdiction: 'mainland-dubai',
    activityType: 'industrial', // +5,000 AED
    investorVisas: 1, // 4,200 AED
    employeeVisas: 0,
    officeType: 'physical-office', // +24,000 AED
    addOns: { corporateTax: true, bankAccount: true, amlCompliance: true, uaeWill: false }, // 1500 + 2500 + 2000
  });

  // Expected: 18,500 + 5,000 + 24,000 + 4,200 + 6,000 = 57,700 AED
  assert.equal(
    result.totalAed,
    57700,
    'Dubai Mainland with physical premises must equal 57,700 AED'
  );
  console.log('  ✓ Dubai Mainland industrial and premises calculation passed');
}

// 5. UAE Trunk Zero Stripping Test
{
  function formatWhatsApp(phone) {
    let cleanDigits = (phone || '').replace(/\D/g, '');
    if (cleanDigits.startsWith('9710')) {
      cleanDigits = '971' + cleanDigits.slice(4);
    }
    return cleanDigits;
  }

  assert.equal(
    formatWhatsApp('+971 050 123 4567'),
    '971501234567',
    'Must strip leading trunk 0 after 971'
  );
  assert.equal(
    formatWhatsApp('+971 50 123 4567'),
    '971501234567',
    'Must preserve valid UAE international format'
  );
  assert.equal(
    formatWhatsApp('+44 7911 123456'),
    '447911123456',
    'Must preserve international numbers'
  );
  console.log('  ✓ Phone trunk zero normalization passed');
}

// 6. Currency Formatting & Peg Consistency Test
{
  assert.equal(formatAed(12500), 'AED 12,500');
  assert.equal(formatUsd(36725), '$10,000 USD');
  assert.equal(formatCurrency(18500, 'AED'), 'AED 18,500');
  assert.equal(
    formatCurrency(18500, 'USD'),
    `$${Math.round(18500 / USD_PEG_RATE).toLocaleString()} USD`
  );
  console.log('  ✓ Currency formatting and USD peg consistency passed');
}

// 7. Budget Allocation Matrix & Category Totals Test
{
  const result = calculateSetupCost({
    jurisdiction: 'freezone-meydan',
    activityType: 'commercial', // 2000
    investorVisas: 2, // 2 * 3750 = 7500
    employeeVisas: 1, // 4250
    officeType: 'dedicated-desk', // 7500
    addOns: { corporateTax: true, bankAccount: true, amlCompliance: false, uaeWill: false }, // 1500 + 2500
  });

  // Licensing: 12500 + 2000 = 14500
  // Visas: 7500 + 4250 = 11750
  // Premises: 7500
  // Advisory: 4000
  // Total: 37750
  assert.equal(result.totalAed, 37750);
  assert.equal(result.allocations.licensing.aed, 14500);
  assert.equal(result.allocations.visas.aed, 11750);
  assert.equal(result.allocations.premises.aed, 7500);
  assert.equal(result.allocations.advisory.aed, 4000);

  // Check percentages sum roughly to 100%
  const totalPct =
    result.allocations.licensing.pct +
    result.allocations.visas.pct +
    result.allocations.premises.pct +
    result.allocations.advisory.pct;
  assert.ok(totalPct >= 99 && totalPct <= 101, 'Normalized allocation percentages must sum ~100%');

  // Verify line item formatted properties
  for (const item of result.breakdown) {
    assert.ok(item.formattedAed.startsWith('AED '), 'Line item must have pre-formatted AED string');
    assert.ok(item.formattedUsd.startsWith('$'), 'Line item must have pre-formatted USD string');
  }
  console.log('  ✓ Budget allocation matrix and line item formatting passed');
}

// 8. Instant Setup Engine & Offshore Visa Restriction Test
{
  const fz = calculateInstantSetup({ preset: 'freezone', visas: 2, officeType: 'flexi' });
  assert.equal(fz.totalAed, 12500 + 2 * 3750); // 20000
  assert.equal(fz.formattedTotalAed, 'AED 20,000');

  const mainland = calculateInstantSetup({ preset: 'mainland', visas: 1, officeType: 'physical' });
  assert.equal(mainland.totalAed, 18500 + 3750 + 12000); // 34250

  // Offshore statutory rule: visas must be 0 AED regardless of input
  const offshore = calculateInstantSetup({ preset: 'offshore', visas: 3, officeType: 'flexi' });
  assert.equal(offshore.visaPriceAed, 0, 'Offshore entities must never have visa surcharges');
  assert.equal(offshore.totalAed, 24000);
  console.log('  ✓ Instant setup calculations and offshore statutory restrictions passed');
}

console.log('🎉 ALL 8 TEST SUITES PASSED CLEANLY (100% assertions verified)!');
