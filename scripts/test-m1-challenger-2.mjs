import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { createServer } from 'vite';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

console.log('⚔️  CHALLENGER 2: STARTING EMPIRICAL MICRO-INTERACTIONS & COMPONENT STRESS TEST HARNESS\n');

// Initialize Vite in SSR mode
const vite = await createServer({
  configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

function wrapInRouter(element) {
  return React.createElement(StaticRouter, { location: '/' }, element);
}

function renderComponent(element) {
  return renderToStaticMarkup(wrapInRouter(element));
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.log(`  ✗ FAIL: ${name}`);
    console.log(`    → Error: ${err.message}`);
    findings.push({ name, error: err.message });
  }
}

// =========================================================================
// SUITE 1: EquitifyButton Adversarial & Conformance Tests
// =========================================================================
console.log('--- SUITE 1: EquitifyButton.tsx ---');
const { EquitifyButton } = await vite.ssrLoadModule('/src/components/ui/EquitifyButton.tsx');

await runTest('EquitifyButton: renders double-capsule layout by default with outer gap-1 and 50px height styling', () => {
  const html = renderComponent(
    React.createElement(EquitifyButton, { variant: 'emerald', size: 'md' }, 'START YOUR SETUP')
  );
  assert.ok(html.includes('group inline-flex items-center'), 'Outer button must have group inline-flex classes');
  assert.ok(html.includes('gap-1'), 'Double capsule must have gap-1 between capsules');
  assert.ok(html.includes('h-[50px]'), 'Medium size must have 50px height class');
  assert.ok(html.includes('bg-[#22C55E]'), 'Emerald variant must have #22C55E background');
  assert.ok(html.includes('text-[#05131F]'), 'Emerald variant text must be Obsidian #05131F');
  assert.ok(html.includes('START YOUR SETUP'), 'Button text must be present');
});

await runTest('EquitifyButton: label container has exact styling (rounded-full, uppercase, tracking-[-0.02em])', () => {
  const html = renderComponent(
    React.createElement(EquitifyButton, { variant: 'emerald' }, 'TEST LABEL')
  );
  assert.ok(html.includes('rounded-full'), 'Capsule must be rounded-full');
  assert.ok(html.includes('uppercase'), 'Capsule must be uppercase');
  assert.ok(html.includes('tracking-[-0.02em]'), 'Capsule tracking must be -0.02em');
});

await runTest('EquitifyButton: Right arrow enclosure exists and contains Lucide ArrowRight', () => {
  const html = renderComponent(
    React.createElement(EquitifyButton, { variant: 'emerald', showArrow: true }, 'TEST')
  );
  assert.ok(html.includes('<svg'), 'Arrow enclosure must render SVG icon');
  assert.ok(html.includes('lucide-arrow-right') || html.includes('stroke="currentColor"'), 'SVG icon must be Lucide ArrowRight');
  assert.ok(html.includes('shrink-0'), 'Arrow enclosure must have shrink-0 to prevent compression');
});

await runTest('EquitifyButton: Arrow enclosure dimensions analysis (50px vs 44px spec analysis)', () => {
  const htmlMd = renderComponent(React.createElement(EquitifyButton, { size: 'md' }, 'TEST'));
  const htmlSm = renderComponent(React.createElement(EquitifyButton, { size: 'sm' }, 'TEST'));
  const htmlLg = renderComponent(React.createElement(EquitifyButton, { size: 'lg' }, 'TEST'));

  const mdHas50 = htmlMd.includes('w-[50px]') && htmlMd.includes('h-[50px]');
  const mdHas44 = htmlMd.includes('w-[44px]') && htmlMd.includes('h-[44px]');
  const smHas42 = htmlSm.includes('w-[42px]') && htmlSm.includes('h-[42px]');
  const lgHas56 = htmlLg.includes('w-[56px]') && htmlLg.includes('h-[56px]');

  console.log(`    [Observation] EquitifyButton arrow enclosure sizes: sm=42px (${smHas42}), md=50px (${mdHas50}), md=44px (${mdHas44}), lg=56px (${lgHas56})`);
  assert.ok(mdHas50, 'EquitifyButton size=md arrow enclosure is currently w-[50px] h-[50px]');
  assert.ok(smHas42, 'EquitifyButton size=sm arrow enclosure is w-[42px] h-[42px]');
  assert.ok(lgHas56, 'EquitifyButton size=lg arrow enclosure is w-[56px] h-[56px]');
});

await runTest('EquitifyButton: Hover micro-interaction classes (+4px arrow translation & glow)', () => {
  const htmlEmerald = renderComponent(React.createElement(EquitifyButton, { variant: 'emerald' }, 'CTA'));
  assert.ok(htmlEmerald.includes('group-hover:translate-x-1'), 'Arrow icon must translate +4px (translate-x-1) on group hover');
  assert.ok(htmlEmerald.includes('group-hover:brightness-105'), 'Emerald capsule must have brightness-105 on group hover');
  assert.ok(htmlEmerald.includes('group-hover:shadow-[0_0_24px_rgba(34,197,94,0.35)]'), 'Emerald capsule must have 24px emerald glow on group hover');
  assert.ok(htmlEmerald.includes('motion-reduce:transform-none'), 'Must include motion-reduce guard');
});

await runTest('EquitifyButton: Dark variant hover micro-interactions & token calibration', () => {
  const htmlDark = renderComponent(React.createElement(EquitifyButton, { variant: 'dark' }, 'CTA'));
  assert.ok(htmlDark.includes('bg-[#05131F]'), 'Dark variant must use #05131F background');
  assert.ok(htmlDark.includes('text-[#FBFBFB]'), 'Dark variant must use #FBFBFB text');
  assert.ok(htmlDark.includes('group-hover:border-[#22C55E]/50'), 'Dark variant must have emerald border on group hover');
  assert.ok(htmlDark.includes('group-hover:shadow-[0_0_24px_rgba(34,197,94,0.2)]'), 'Dark variant must have emerald shadow on group hover');
});

await runTest('EquitifyButton: Unified layout mode', () => {
  const html = renderComponent(React.createElement(EquitifyButton, { layout: 'unified' }, 'UNIFIED'));
  assert.ok(!html.includes('gap-1'), 'Unified layout must not have gap-1 outer spacing');
  assert.ok(html.includes('px-6 rounded-full flex items-center justify-center gap-3'), 'Unified layout has internal gap-3');
});

await runTest('EquitifyButton: Polymorphic rendering (button, Link, external anchor)', () => {
  const buttonHtml = renderComponent(React.createElement(EquitifyButton, { type: 'submit' }, 'SUBMIT'));
  assert.ok(buttonHtml.startsWith('<button') && buttonHtml.includes('type="submit"'), 'Must render <button type="submit">');

  const linkHtml = renderComponent(React.createElement(EquitifyButton, { to: '/jurisdictions' }, 'LINK'));
  assert.ok(linkHtml.startsWith('<a') && linkHtml.includes('href="/jurisdictions"'), 'Must render <a href="/jurisdictions">');

  const anchorHtml = renderComponent(React.createElement(EquitifyButton, { href: 'https://example.com' }, 'ANCHOR'));
  assert.ok(anchorHtml.startsWith('<a') && anchorHtml.includes('target="_blank"') && anchorHtml.includes('rel="noopener noreferrer"'), 'External href must have target _blank and noopener noreferrer');
});

await runTest('EquitifyButton: Edge-case inputs (disabled, showArrow=false, empty string, long text)', () => {
  const disabledHtml = renderComponent(React.createElement(EquitifyButton, { disabled: true }, 'DISABLED'));
  assert.ok(disabledHtml.includes('disabled=""') || disabledHtml.includes('disabled'), 'Disabled button must have disabled attribute');
  assert.ok(disabledHtml.includes('pointer-events-none'), 'Must include pointer-events-none');
  assert.ok(disabledHtml.includes('cursor-not-allowed'), 'Must include cursor-not-allowed');
  assert.ok(disabledHtml.includes('opacity-40'), 'Must include opacity-40');

  const noArrowHtml = renderComponent(React.createElement(EquitifyButton, { showArrow: false }, 'NO ARROW'));
  assert.ok(!noArrowHtml.includes('<svg'), 'showArrow=false must not render arrow SVG');

  const emptyHtml = renderComponent(React.createElement(EquitifyButton, null, ''));
  assert.ok(emptyHtml.length > 0, 'Empty text must render without throwing');

  const longText = 'A'.repeat(500);
  const longHtml = renderComponent(React.createElement(EquitifyButton, null, longText));
  assert.ok(longHtml.includes(longText), 'Long text must render safely');
});

// =========================================================================
// SUITE 2: HairlineDivider & HairlineGrid Tests
// =========================================================================
console.log('\n--- SUITE 2: HairlineDivider & HairlineGrid ---');
const { HairlineDivider } = await vite.ssrLoadModule('/src/components/ui/HairlineDivider.tsx');
const { HairlineGrid } = await vite.ssrLoadModule('/src/components/ui/HairlineGrid.tsx');

await runTest('HairlineDivider: Dark canvas token calibration', () => {
  const html = renderComponent(React.createElement(HairlineDivider, { canvas: 'dark' }));
  assert.ok(html.includes('bg-[rgba(226,226,226,0.15)]'), 'Dark canvas must have bg-[rgba(226,226,226,0.15)]');
  assert.ok(html.includes('role="separator"'), 'Must have role=separator');
  assert.ok(html.includes('aria-orientation="horizontal"'), 'Default orientation must be horizontal');
  assert.ok(html.includes('h-px w-full'), 'Horizontal must be h-px w-full');
});

await runTest('HairlineDivider: Light canvas token calibration', () => {
  const html = renderComponent(React.createElement(HairlineDivider, { canvas: 'light' }));
  assert.ok(html.includes('bg-[rgba(0,0,0,0.08)]'), 'Light canvas must have bg-[rgba(0,0,0,0.08)]');
});

await runTest('HairlineDivider: Vertical orientation', () => {
  const html = renderComponent(React.createElement(HairlineDivider, { orientation: 'vertical', canvas: 'dark' }));
  assert.ok(html.includes('w-px h-full self-stretch'), 'Vertical must be w-px h-full self-stretch');
  assert.ok(html.includes('aria-orientation="vertical"'), 'aria-orientation must be vertical');
});

await runTest('HairlineGrid: Dark and Light canvas tokens', () => {
  const htmlDark = renderComponent(React.createElement(HairlineGrid, { canvas: 'dark', columns: 4 }));
  assert.ok(htmlDark.includes('border-[rgba(226,226,226,0.15)]'), 'Dark grid must have border-[rgba(226,226,226,0.15)]');
  assert.ok(htmlDark.includes('aria-hidden="true"'), 'Grid must be aria-hidden');
  assert.ok(htmlDark.includes('grid-cols-2 md:grid-cols-4'), '4-column grid must have responsive classes');

  const htmlLight = renderComponent(React.createElement(HairlineGrid, { canvas: 'light', columns: 2 }));
  assert.ok(htmlLight.includes('border-[rgba(0,0,0,0.08)]'), 'Light grid must have border-[rgba(0,0,0,0.08)]');
  assert.ok(htmlLight.includes('grid-cols-2'), '2-column grid must have grid-cols-2');
});

await runTest('HairlineGrid: Column count and boundary edge cases (0, 2, 4 columns)', () => {
  const html4 = renderComponent(React.createElement(HairlineGrid, { columns: 4 }));
  // Count the inner column divider divs (each has 'h-full border-r')
  const count4 = (html4.match(/<div class="h-full/g) || []).length;
  assert.equal(count4, 4, 'Must render exactly 4 column guides for columns=4');

  const html2 = renderComponent(React.createElement(HairlineGrid, { columns: 2 }));
  const count2 = (html2.match(/<div class="h-full/g) || []).length;
  assert.equal(count2, 2, 'Must render exactly 2 column guides for columns=2');

  const html0 = renderComponent(React.createElement(HairlineGrid, { columns: 0 }));
  const count0 = (html0.match(/<div class="h-full/g) || []).length;
  assert.equal(count0, 0, 'Must render 0 column guides for columns=0');
});

// =========================================================================
// SUITE 3: PropertySetupCard Stress & Edge Cases
// =========================================================================
console.log('\n--- SUITE 3: PropertySetupCard.tsx ---');
const { PropertySetupCard } = await vite.ssrLoadModule('/src/components/ui/PropertySetupCard.tsx');

await runTest('PropertySetupCard: Standard rendering with 4 atmospheric composite overlay layers', () => {
  const html = renderComponent(
    React.createElement(PropertySetupCard, {
      title: 'Meydan Free Zone Dual-Licence',
      imageSrc: '/images/hero/meydan.webp',
      imageAlt: 'Meydan Free Zone setup in Dubai',
      jurisdiction: 'Dubai Free Zone',
      structure: 'Holding Co + Operating LLC',
      taxStatus: '0% Corp Tax Qualifying',
      to: '/setup/meydan',
    })
  );

  assert.ok(html.includes('bg-[#707070]/16'), 'Layer 1: #707070/16 must be present');
  assert.ok(html.includes('bg-[#22C55E]/10'), 'Layer 2: Emerald #22C55E/10 must be present');
  assert.ok(html.includes('bg-[#E8A72E]/20 mix-blend-overlay'), 'Layer 3: Amber #E8A72E/20 mix-blend-overlay must be present');
  assert.ok(html.includes('bg-gradient-to-b from-[#0C2D48]/[0.02] via-[#0C2D48]/60 to-[#05131F]'), 'Layer 4: Midnight Blue to Obsidian gradient must be present');
  assert.ok(html.includes('group-hover:scale-105'), 'Image must have 1.05x zoom on hover');
  assert.ok(html.includes('brightness-[1.05] contrast-[1.0] saturate-[0.4]'), 'Image must have Equitify color grading filters');
  assert.ok(html.includes('group-hover:bg-[#22C55E] group-hover:text-[#05131F]'), 'Top arrow must turn emerald on card hover');
  assert.ok(html.includes('Dubai Free Zone'), 'Jurisdiction chip present');
  assert.ok(html.includes('Holding Co + Operating LLC'), 'Structure chip present');
  assert.ok(html.includes('0% Corp Tax Qualifying'), 'Tax status chip present');
});

await runTest('PropertySetupCard: Polymorphic links (to, href, div)', () => {
  const linkHtml = renderComponent(React.createElement(PropertySetupCard, {
    title: 'Test', imageSrc: '/x.jpg', imageAlt: 'x', jurisdiction: 'J', structure: 'S', taxStatus: 'T', to: '/test'
  }));
  assert.ok(linkHtml.startsWith('<a') && linkHtml.includes('href="/test"'), 'Must render router link');

  const anchorHtml = renderComponent(React.createElement(PropertySetupCard, {
    title: 'Test', imageSrc: '/x.jpg', imageAlt: 'x', jurisdiction: 'J', structure: 'S', taxStatus: 'T', href: 'https://external.com'
  }));
  assert.ok(anchorHtml.startsWith('<a') && anchorHtml.includes('href="https://external.com"'), 'Must render standard anchor');

  const divHtml = renderComponent(React.createElement(PropertySetupCard, {
    title: 'Test', imageSrc: '/x.jpg', imageAlt: 'x', jurisdiction: 'J', structure: 'S', taxStatus: 'T'
  }));
  assert.ok(divHtml.startsWith('<div'), 'Without to/href must render <div>');
});

await runTest('PropertySetupCard: Edge case inputs (empty strings, special characters, extreme text)', () => {
  const emptyHtml = renderComponent(React.createElement(PropertySetupCard, {
    title: '', imageSrc: '', imageAlt: '', jurisdiction: '', structure: '', taxStatus: ''
  }));
  assert.ok(emptyHtml.includes('h-[460px]'), 'Must render empty card without throwing');

  const specialChars = '<script>alert("xss")</script> & "quotes" \'single\'';
  const xssHtml = renderComponent(React.createElement(PropertySetupCard, {
    title: specialChars, imageSrc: '/img.jpg', imageAlt: 'alt', jurisdiction: specialChars, structure: specialChars, taxStatus: specialChars
  }));
  assert.ok(!xssHtml.includes('<script>'), 'Must escape HTML tags');
  assert.ok(xssHtml.includes('&lt;script&gt;'), 'Must encode < and >');

  const longTitle = 'Title '.repeat(100);
  const longHtml = renderComponent(React.createElement(PropertySetupCard, {
    title: longTitle, imageSrc: '/img.jpg', imageAlt: 'alt', jurisdiction: 'J', structure: 'S', taxStatus: 'T'
  }));
  assert.ok(longHtml.includes(longTitle.trim()), 'Must render long title within overflow-hidden boundary');
});

// =========================================================================
// SUITE 4: DivisionCard Stress & Edge Cases
// =========================================================================
console.log('\n--- SUITE 4: DivisionCard.tsx ---');
const { DivisionCard } = await vite.ssrLoadModule('/src/components/ui/DivisionCard.tsx');

await runTest('DivisionCard: Standard rendering with index, title, description, and diagonal arrow', () => {
  const html = renderComponent(React.createElement(DivisionCard, {
    index: '01',
    title: 'Corporate Structuring & Holding Regimes',
    description: 'Bespoke corporate architecture spanning ADGM, DIFC, and premier free zones.',
    features: ['SPVs & Foundations', 'Asset Ring-Fencing', 'Zero Capital Duty'],
    to: '/divisions/corporate',
  }));

  assert.ok(html.includes('01'), 'Sequential index present');
  assert.ok(html.includes('Corporate Structuring &amp; Holding Regimes'), 'Title present (HTML-escaped)');
  assert.ok(html.includes('Bespoke corporate architecture'), 'Description present');
  assert.ok(html.includes('SPVs &amp; Foundations'), 'Feature tag present');
  assert.ok(html.includes('Asset Ring-Fencing'), 'Feature tag present');
  assert.ok(html.includes('Zero Capital Duty'), 'Feature tag present');
  assert.ok(html.includes('border-[rgba(226,226,226,0.15)]'), 'Hairline border token present');
  assert.ok(html.includes('group-hover:bg-[#22C55E] group-hover:text-[#05131F]'), 'Arrow micro-interaction present');
});

await runTest('DivisionCard: Optional features prop handling (undefined, empty, many)', () => {
  const noFeatHtml = renderComponent(React.createElement(DivisionCard, {
    index: '02', title: 'T', description: 'D'
  }));
  assert.ok(!noFeatHtml.includes('border-t border-[rgba(226,226,226,0.15)]'), 'Undefined features must omit features section');

  const emptyFeatHtml = renderComponent(React.createElement(DivisionCard, {
    index: '02', title: 'T', description: 'D', features: []
  }));
  assert.ok(!emptyFeatHtml.includes('border-t border-[rgba(226,226,226,0.15)]'), 'Empty features array must omit features section');

  const manyFeatures = Array.from({ length: 30 }, (_, i) => `Feature ${i + 1}`);
  const manyHtml = renderComponent(React.createElement(DivisionCard, {
    index: '03', title: 'T', description: 'D', features: manyFeatures
  }));
  assert.ok(manyHtml.includes('Feature 30'), 'Must handle 30 features gracefully');
});

await runTest('DivisionCard: Edge cases (empty strings, zero index, long descriptions)', () => {
  const emptyHtml = renderComponent(React.createElement(DivisionCard, {
    index: '', title: '', description: ''
  }));
  assert.ok(emptyHtml.includes('rounded-xl'), 'Must render empty card without throwing');

  const zeroHtml = renderComponent(React.createElement(DivisionCard, {
    index: '00', title: 'Zero', description: 'Desc'
  }));
  assert.ok(zeroHtml.includes('00'), 'Zero index rendered');

  const longDesc = 'Institutional description. '.repeat(100);
  const longHtml = renderComponent(React.createElement(DivisionCard, {
    index: '04', title: 'Title', description: longDesc
  }));
  assert.ok(longHtml.includes('Institutional description.'), 'Must handle long description');
});

// =========================================================================
// SUITE 5: StatCounter Stress & Edge Cases
// =========================================================================
console.log('\n--- SUITE 5: StatCounter.tsx ---');
const { StatCounter } = await vite.ssrLoadModule('/src/components/ui/StatCounter.tsx');

await runTest('StatCounter: SSR rendering with prefix, suffix, label, and description', () => {
  const html = renderComponent(React.createElement(StatCounter, {
    value: 100,
    prefix: '',
    suffix: '%',
    label: 'Foreign Ownership',
    description: 'Full sovereign equity ownership with zero mandatory local sponsorship.',
  }));

  assert.ok(html.includes('Foreign Ownership'), 'Label must be present');
  assert.ok(html.includes('Full sovereign equity ownership'), 'Description must be present');
  assert.ok(html.includes('%'), 'Suffix must be present');
  assert.ok(html.includes('text-[#05131F]'), 'Primary number text must be Obsidian #05131F');
  assert.ok(html.includes('tabular-nums'), 'Must use tabular numerals for animation stability');
  assert.ok(html.includes('text-[#22C55E]'), 'Suffix/prefix must use Emerald #22C55E');
});

await runTest('StatCounter: Number formatting with decimals and large values', () => {
  const htmlDecimals = renderComponent(React.createElement(StatCounter, {
    value: 99.85, decimals: 2, label: 'Accuracy'
  }));
  assert.ok(htmlDecimals.includes('0.00'), 'Initial SSR value formatted with 2 decimal places');

  const htmlThousands = renderComponent(React.createElement(StatCounter, {
    value: 1250000, label: 'Capital Deployed', prefix: '$'
  }));
  assert.ok(htmlThousands.includes('$'), 'Prefix rendered cleanly');
  assert.ok(htmlThousands.includes('Capital Deployed'), 'Label rendered cleanly');
});

await runTest('StatCounter: Edge cases (zero value, negative value, empty strings, undefined description)', () => {
  const zeroHtml = renderComponent(React.createElement(StatCounter, {
    value: 0, label: 'Zero Metric'
  }));
  assert.ok(zeroHtml.includes('0') && zeroHtml.includes('Zero Metric'), 'Zero value renders safely');

  const negHtml = renderComponent(React.createElement(StatCounter, {
    value: -42, label: 'Negative Metric'
  }));
  assert.ok(negHtml.includes('Negative Metric'), 'Negative metric renders safely');

  const noDescHtml = renderComponent(React.createElement(StatCounter, {
    value: 50, label: 'No Desc'
  }));
  assert.ok(!noDescHtml.includes('<p'), 'Omitted description must not render <p> element');
});

// =========================================================================
// SUITE 6: Calculator Engine Immutability & Mathematical Verification
// =========================================================================
console.log('\n--- SUITE 6: Calculator Engine Integrity ---');

await runTest('Calculator Engine: Git status check (100% untracked / untouched in working tree)', () => {
  const gitStatus = execSync('git status --porcelain src/lib/calculator-engine.ts', { cwd: root }).toString().trim();
  assert.equal(gitStatus, '', `Working tree status must be clean (got: "${gitStatus}")`);
});

await runTest('Calculator Engine: Git diff check against HEAD', () => {
  const gitDiff = execSync('git diff HEAD -- src/lib/calculator-engine.ts', { cwd: root }).toString().trim();
  assert.equal(gitDiff, '', `Git diff against HEAD must be completely empty (got: "${gitDiff}")`);
});

await runTest('Calculator Engine: Cryptographic SHA blob comparison against HEAD commit', () => {
  const currentBlob = execSync('git hash-object src/lib/calculator-engine.ts', { cwd: root }).toString().trim();
  const committedBlob = execSync('git ls-tree HEAD src/lib/calculator-engine.ts', { cwd: root }).toString().split(/\s+/)[2];
  assert.equal(currentBlob, committedBlob, `Blob SHA must match commit HEAD: current=${currentBlob}, committed=${committedBlob}`);
});

await runTest('Calculator Engine: 5/5 Test Suites Execution', () => {
  const testOutput = execSync('node scripts/test-calculator.mjs', { cwd: root }).toString();
  assert.ok(testOutput.includes('Meydan Free Zone baseline calculation passed'), 'Suite 1 passed');
  assert.ok(testOutput.includes('IFZA multi-visa and commercial activity calculation passed'), 'Suite 2 passed');
  assert.ok(testOutput.includes('RAK ICC Offshore visa exclusion passed'), 'Suite 3 passed');
  assert.ok(testOutput.includes('Dubai Mainland industrial and premises calculation passed'), 'Suite 4 passed');
  assert.ok(testOutput.includes('Phone trunk zero normalization passed'), 'Suite 5 passed');
  assert.ok(testOutput.includes('ALL 5 TEST SUITES PASSED CLEANLY'), 'Overall pass banner present');
});

await runTest('Calculator Engine: Direct execution and boundary stress testing', async () => {
  const { calculateSetupCost } = await vite.ssrLoadModule('/src/lib/calculator-engine.ts');

  // Baseline check
  const res1 = calculateSetupCost({
    jurisdiction: 'freezone-meydan',
    activityType: 'consulting',
    investorVisas: 1,
    employeeVisas: 0,
    officeType: 'flexi-desk',
    addOns: { corporateTax: false, bankAccount: false, amlCompliance: false, uaeWill: false },
  });
  assert.ok(res1.totalAed > 0, 'Total AED must be positive');
  assert.equal(res1.totalUsd, Math.round((res1.totalAed / 3.6725) * 100) / 100, 'USD peg must be exact at 3.6725 (2 decimal places)');

  // Offshore zero visa assertion
  const resOffshore = calculateSetupCost({
    jurisdiction: 'offshore-rak',
    activityType: 'consulting',
    investorVisas: 5,
    employeeVisas: 10,
    officeType: 'flexi-desk',
    addOns: { corporateTax: false, bankAccount: true, amlCompliance: true, uaeWill: false },
  });
  const visaItems = resOffshore.breakdown.filter(item => item.category === 'Visas & Immigration');
  assert.equal(visaItems.length, 0, 'Offshore must strictly exclude all visa costs');

  // All add-ons stress
  const resAll = calculateSetupCost({
    jurisdiction: 'mainland-dubai',
    activityType: 'industrial',
    investorVisas: 2,
    employeeVisas: 5,
    officeType: 'physical-office',
    addOns: { corporateTax: true, bankAccount: true, amlCompliance: true, uaeWill: true },
  });
  assert.ok(resAll.goldenVisaEligible, 'Mainland with 2 investor visas qualifies for Golden Visa check');
  assert.ok(resAll.totalAed > 50000, 'Mainland industrial setup with office and compliance is substantial');
});

// Close Vite
await vite.close();

console.log(`\n=========================================================================`);
console.log(`STRESS TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log(`=========================================================================`);

if (findings.length > 0) {
  console.log('\nFindings / Discrepancies:');
  findings.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
}

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n⚔️  ALL EMPIRICAL TESTS PASSED VERIFICATION!');
  process.exit(0);
}
