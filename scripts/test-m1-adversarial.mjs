import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// Global require polyfill for ESM execution of tailwind plugins
globalThis.require = createRequire(import.meta.url);

import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

console.log('======================================================================');
console.log('⚔️  STARTING M1 ADVERSARIAL STRESS TEST & TYPOGRAPHY VERIFICATION ⚔️');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    failureDetails.push({ name, error: err.message });
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    failureDetails.push({ name, error: err.message });
  }
}

// Helper: relative luminance and contrast ratio (WCAG 2.1)
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// -----------------------------------------------------------------------------
// SECTION 1: Binary Font Integrity & Preload Optimization
// -----------------------------------------------------------------------------
console.log('\n--- Section 1: Binary Font Integrity & Preload ---');

test('Aspekta WOFF2 binary signature & uncorrupted file structure', () => {
  const fontPath = path.join(root, 'public/fonts/aspekta-variable.woff2');
  assert(fs.existsSync(fontPath), 'public/fonts/aspekta-variable.woff2 must exist');
  
  const buf = fs.readFileSync(fontPath);
  assert(buf.length >= 25000 && buf.length <= 35000, `Expected ~30KB font, got ${buf.length} bytes`);
  
  // WOFF2 magic bytes: 0x774F4632 ("wOF2")
  const magic = buf.toString('ascii', 0, 4);
  assert.equal(magic, 'wOF2', `Magic bytes must be 'wOF2', got '${magic}'`);
  
  // Check header declared length equals actual buffer size
  const declaredLength = buf.readUInt32BE(8);
  assert.equal(declaredLength, buf.length, `Header length (${declaredLength}) must match file size (${buf.length})`);
  
  // Check tables count > 0
  const numTables = buf.readUInt16BE(12);
  assert(numTables > 0, `Expected > 0 font tables, got ${numTables}`);
});

test('index.html prioritizes Aspekta font preload ahead of existing fonts', () => {
  const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');
  assert(
    indexHtml.includes('<link rel="preload" href="/fonts/aspekta-variable.woff2" as="font" type="font/woff2" crossorigin />'),
    'index.html must contain exact preload link with type="font/woff2" and crossorigin'
  );
  
  const aspektaPos = indexHtml.indexOf('/fonts/aspekta-variable.woff2');
  const outfitPos = indexHtml.indexOf('/fonts/outfit-v15-latin.woff2');
  assert(aspektaPos < outfitPos, 'Aspekta preload must appear BEFORE Outfit preload to eliminate display CLS');
});

test('globals.css registers @font-face for Aspekta and Aspekta Fallback with overrides', () => {
  const globals = fs.readFileSync(path.join(root, 'src/styles/globals.css'), 'utf-8');
  assert(globals.includes("@font-face {\n  font-family: 'Aspekta';"), 'globals.css must register @font-face for Aspekta');
  assert(globals.includes("font-weight: 100 900;"), 'globals.css must support full variable axis 100 900');
  assert(globals.includes("font-display: swap;"), 'globals.css must specify font-display: swap');
  assert(globals.includes("src: url('/fonts/aspekta-variable.woff2') format('woff2');"), 'globals.css must point to /fonts/aspekta-variable.woff2');
  
  assert(globals.includes("@font-face {\n  font-family: 'Aspekta Fallback';"), 'globals.css must register Aspekta Fallback');
  assert(globals.includes("size-adjust: 100%;"), 'Fallback must have size-adjust: 100%');
  assert(globals.includes("ascent-override: 96%;"), 'Fallback must have ascent-override: 96%');
  assert(globals.includes("descent-override: 22%;"), 'Fallback must have descent-override: 22%');
});

// -----------------------------------------------------------------------------
// SECTION 2: Typography Metrics & Font-Weight 400 Enforcement
// -----------------------------------------------------------------------------
console.log('\n--- Section 2: Heading Rules & Typography Metrics ---');

test('globals.css base headings (h1-h6) enforce font-weight: 400 and var(--font-display)', () => {
  const globals = fs.readFileSync(path.join(root, 'src/styles/globals.css'), 'utf-8');
  
  const headingBlockMatch = globals.match(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{([^}]+)\}/);
  assert(headingBlockMatch, 'h1, h2, h3, h4, h5, h6 base selector block must exist in globals.css');
  const headingRules = headingBlockMatch[1];
  assert(headingRules.includes('font-family: var(--font-display);'), 'Headings must use var(--font-display)');
  assert(headingRules.includes('font-weight: 400;'), 'Headings must enforce font-weight: 400');
});

test('Display utility classes in globals.css enforce font-weight: 400', () => {
  const globals = fs.readFileSync(path.join(root, 'src/styles/globals.css'), 'utf-8');
  
  const displayClasses = [
    '.display-hero',
    '.display-section',
    '.display-card',
    '.display-step',
    '.display-stat',
    '.display-body',
    '.display-nav',
    '.display-eyebrow',
  ];
  
  for (const cls of displayClasses) {
    const regex = new RegExp(`\\${cls}\\s*\\{([^}]+)\\}`, 's');
    const match = globals.match(regex);
    assert(match, `Display utility class ${cls} must exist in globals.css`);
    assert(match[1].includes('font-weight: 400;'), `${cls} must enforce font-weight: 400;`);
  }
});

test('Compiled CSS in dist/ maintains font-weight: 400 on h1-h6 base layer and preserves utility overrides', () => {
  const assets = fs.readdirSync(path.join(root, 'dist/assets'));
  const cssFile = assets.find((f) => f.startsWith('index-') && f.endsWith('.css'));
  assert(cssFile, 'dist/assets must contain index-*.css');
  
  const compiledCss = fs.readFileSync(path.join(root, 'dist/assets', cssFile), 'utf-8');
  
  // Verify base rule is present in compiled CSS
  assert(
    compiledCss.includes('h1,h2,h3,h4,h5,h6{font-family:var(--font-display);font-weight:400}'),
    'Compiled CSS must contain base h1-h6 font-weight:400 rule'
  );
  
  // Verify utility classes exist and appear after base headings to ensure proper cascade overriding
  const basePos = compiledCss.indexOf('h1,h2,h3,h4,h5,h6{font-family:var(--font-display);font-weight:400}');
  const boldPos = compiledCss.indexOf('.font-bold{font-weight:700}');
  const semiboldPos = compiledCss.indexOf('.font-semibold{font-weight:600}');
  
  assert(boldPos !== -1, 'Compiled CSS must contain .font-bold utility');
  assert(semiboldPos !== -1, 'Compiled CSS must contain .font-semibold utility');
  assert(boldPos > basePos, '.font-bold must appear after base h1-h6 in CSS order for cascade precedence');
  assert(semiboldPos > basePos, '.font-semibold must appear after base h1-h6 in CSS order for cascade precedence');
});

// -----------------------------------------------------------------------------
// SECTION 3: Tailwind Negative Tracking & Sovereign Color Compilation
// -----------------------------------------------------------------------------
console.log('\n--- Section 3: Tailwind Negative Tracking & Sovereign Color Compilation ---');

await asyncTest('Tailwind compiles negative tracking utilities (-0.02em to -0.04em)', async () => {
  const mockContent = `
    <div class="tracking-tightest tracking-display-tight tracking-body-tight"></div>
  `;
  
  const baseConfig = (await import(path.join(root, 'tailwind.config.ts'))).default;
  const testConfig = {
    ...baseConfig,
    content: [{ raw: mockContent, extension: 'html' }],
  };
  
  const res = await postcss([tailwindcss(testConfig)]).process('@tailwind utilities;', { from: undefined });
  const css = res.css;
  
  assert(
    css.includes('.tracking-tightest') && css.includes('letter-spacing: -0.04em'),
    'Tailwind must produce .tracking-tightest with letter-spacing: -0.04em'
  );
  assert(
    css.includes('.tracking-display-tight') && css.includes('letter-spacing: -0.03em'),
    'Tailwind must produce .tracking-display-tight with letter-spacing: -0.03em'
  );
  assert(
    css.includes('.tracking-body-tight') && css.includes('letter-spacing: -0.02em'),
    'Tailwind must produce .tracking-body-tight with letter-spacing: -0.02em'
  );
});

await asyncTest('Tailwind compiles sovereign colors and hairline borders with exact values', async () => {
  const mockContent = `
    <div class="
      bg-obsidian text-obsidian
      bg-porcelain text-porcelain
      bg-klay-emerald text-klay-emerald
      bg-klay-midnight text-klay-midnight
      bg-klay-amber text-klay-amber
      border-hairline-dark border-hairline-light
      text-display-hero text-display-section text-display-card text-display-step text-display-stat text-display-body text-display-nav text-display-eyebrow text-display-caption
    "></div>
  `;
  
  const baseConfig = (await import(path.join(root, 'tailwind.config.ts'))).default;
  const testConfig = {
    ...baseConfig,
    content: [{ raw: mockContent, extension: 'html' }],
  };
  
  const res = await postcss([tailwindcss(testConfig)]).process('@tailwind utilities;', { from: undefined });
  const css = res.css;
  
  // Check Obsidian (#05131F -> rgb(5 19 31))
  assert(css.includes('rgb(5 19 31 / var(--tw-bg-opacity))'), 'bg-obsidian must compile to rgb(5 19 31)');
  assert(css.includes('rgb(5 19 31 / var(--tw-text-opacity))'), 'text-obsidian must compile to rgb(5 19 31)');
  
  // Check Porcelain (#FBFBFB -> rgb(251 251 251))
  assert(css.includes('rgb(251 251 251 / var(--tw-bg-opacity))'), 'bg-porcelain must compile to rgb(251 251 251)');
  assert(css.includes('rgb(251 251 251 / var(--tw-text-opacity))'), 'text-porcelain must compile to rgb(251 251 251)');
  
  // Check Emerald (#22C55E -> rgb(34 197 94))
  assert(css.includes('rgb(34 197 94 / var(--tw-bg-opacity))'), 'bg-klay-emerald must compile to rgb(34 197 94)');
  assert(css.includes('rgb(34 197 94 / var(--tw-text-opacity))'), 'text-klay-emerald must compile to rgb(34 197 94)');
  
  // Check Midnight Blue (#0C2D48 -> rgb(12 45 72))
  assert(css.includes('rgb(12 45 72 / var(--tw-bg-opacity))'), 'bg-klay-midnight must compile to rgb(12 45 72)');
  assert(css.includes('rgb(12 45 72 / var(--tw-text-opacity))'), 'text-klay-midnight must compile to rgb(12 45 72)');
  
  // Check Amber (#E8A72E -> rgb(232 167 46))
  assert(css.includes('rgb(232 167 46 / var(--tw-bg-opacity))'), 'bg-klay-amber must compile to rgb(232 167 46)');
  assert(css.includes('rgb(232 167 46 / var(--tw-text-opacity))'), 'text-klay-amber must compile to rgb(232 167 46)');
  
  // Check Hairline borders
  assert(css.includes('border-color: rgba(226, 226, 226, 0.15)'), 'border-hairline-dark must compile to rgba(226, 226, 226, 0.15)');
  assert(css.includes('border-color: rgba(0, 0, 0, 0.08)'), 'border-hairline-light must compile to rgba(0, 0, 0, 0.08)');
  
  // Check Display typography presets generated by Tailwind fontSize extension
  assert(css.includes('.text-display-hero') && css.includes('font-weight: 400'), 'text-display-hero utility must enforce font-weight: 400');
  assert(css.includes('.text-display-section') && css.includes('letter-spacing: -0.04em'), 'text-display-section utility must have -0.04em tracking');
  assert(css.includes('.text-display-card') && css.includes('letter-spacing: -0.04em'), 'text-display-card utility must have -0.04em tracking');
  assert(css.includes('.text-display-caption') && css.includes('font-size: 0.75rem'), 'text-display-caption utility must have 0.75rem font-size');
});

test('Sovereign brand color contrast ratios satisfy WCAG AAA standards', () => {
  const obsidian = [5, 19, 31];
  const porcelain = [251, 251, 251];
  const emerald = [34, 197, 94];
  const midnight = [12, 45, 72];
  
  const obsidianOnPorcelain = getContrast(obsidian, porcelain);
  assert(obsidianOnPorcelain > 14.0, `Obsidian on Porcelain must exceed 14:1 (actual: ${obsidianOnPorcelain.toFixed(2)})`);
  
  const obsidianOnEmerald = getContrast(obsidian, emerald);
  assert(obsidianOnEmerald > 7.0, `Obsidian text on Emerald button must exceed 7:1 for AAA (actual: ${obsidianOnEmerald.toFixed(2)})`);
  
  const midnightOnPorcelain = getContrast(midnight, porcelain);
  assert(midnightOnPorcelain > 10.0, `Midnight Blue on Porcelain must exceed 10:1 (actual: ${midnightOnPorcelain.toFixed(2)})`);
});

// -----------------------------------------------------------------------------
// SECTION 4: Component Primitives & Backward Compatibility
// -----------------------------------------------------------------------------
console.log('\n--- Section 4: Component Primitives & Micro-Interactions ---');

test('EquitifyButton provides 50px pill, double-capsule layout, backward compatibility, and reduced motion', () => {
  const content = fs.readFileSync(path.join(root, 'src/components/ui/EquitifyButton.tsx'), 'utf-8');
  
  assert(content.includes("h-[50px]"), 'EquitifyButton must implement default 50px height');
  assert(content.includes("group-hover:translate-x-1"), 'EquitifyButton arrow must translate on hover');
  assert(content.includes("motion-reduce:transform-none"), 'EquitifyButton must support motion-reduce');
  
  // Check backward compatibility aliases
  assert(content.includes("variant === 'green'"), 'EquitifyButton must alias variant "green"');
  assert(content.includes("variant === 'primary'"), 'EquitifyButton must alias variant "primary"');
  assert(content.includes("variant === 'blue'"), 'EquitifyButton must alias variant "blue"');
  assert(content.includes("to="), 'EquitifyButton must support React Router Link via "to" prop');
  assert(content.includes("href="), 'EquitifyButton must support anchor navigation via "href" prop');
});

test('HairlineDivider & HairlineGrid implement architectural drafting lines with exact tokens', () => {
  const divider = fs.readFileSync(path.join(root, 'src/components/ui/HairlineDivider.tsx'), 'utf-8');
  assert(divider.includes("bg-[rgba(226,226,226,0.15)]"), 'HairlineDivider dark canvas must use rgba(226,226,226,0.15)');
  assert(divider.includes("bg-[rgba(0,0,0,0.08)]"), 'HairlineDivider light canvas must use rgba(0,0,0,0.08)');
  assert(divider.includes("role=\"separator\""), 'HairlineDivider must include ARIA role="separator"');
  
  const grid = fs.readFileSync(path.join(root, 'src/components/ui/HairlineGrid.tsx'), 'utf-8');
  assert(grid.includes("border-[rgba(226,226,226,0.15)]"), 'HairlineGrid dark canvas must use rgba(226,226,226,0.15)');
  assert(grid.includes("border-[rgba(0,0,0,0.08)]"), 'HairlineGrid light canvas must use rgba(0,0,0,0.08)');
});

test('Section 4, 5, 6 Components (StatCounter, DivisionCard, PropertySetupCard) adhere to tokens', () => {
  const stat = fs.readFileSync(path.join(root, 'src/components/ui/StatCounter.tsx'), 'utf-8');
  assert(stat.includes("tabular-nums"), 'StatCounter must use tabular-nums');
  assert(stat.includes("IntersectionObserver"), 'StatCounter must use IntersectionObserver');
  assert(stat.includes("prefers-reduced-motion"), 'StatCounter must respect reduced motion');
  
  const division = fs.readFileSync(path.join(root, 'src/components/ui/DivisionCard.tsx'), 'utf-8');
  assert(division.includes("group-hover:translate-x-0.5"), 'DivisionCard arrow must have hover micro-interaction');
  assert(division.includes("border-[rgba(226,226,226,0.15)]"), 'DivisionCard must use neutral hairline');
  assert(division.includes("bg-[#05131F]"), 'DivisionCard must use Obsidian background');
  
  const property = fs.readFileSync(path.join(root, 'src/components/ui/PropertySetupCard.tsx'), 'utf-8');
  assert(property.includes("group-hover:scale-105"), 'PropertySetupCard must feature 1.05x image zoom');
  assert(property.includes("mix-blend-overlay"), 'PropertySetupCard must feature atmospheric overlay');
});

// -----------------------------------------------------------------------------
// SECTION 5: Stress Testing 101 Blog Articles & 126 Pre-Rendered Routes
// -----------------------------------------------------------------------------
console.log('\n--- Section 5: Stress Testing 101 Blog Articles & 126 Pre-Rendered Routes ---');

test('All 101 blog articles exist in dist/ with pre-rendered body and zero unhydrated skeletons', () => {
  const postsFile = fs.readFileSync(path.join(root, 'src/content/blog/posts.ts'), 'utf-8');
  const slugMatches = [...postsFile.matchAll(/slug:\s*["\x27]([^"\x27]+)["\x27]/g)].map((m) => m[1]);
  assert.equal(slugMatches.length, 101, `Expected 101 blog posts in posts.ts, found ${slugMatches.length}`);
  
  let verifiedArticles = 0;
  for (const slug of slugMatches) {
    let htmlPath = path.join(root, 'dist', slug, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(root, 'dist', 'blog', slug, 'index.html');
    }
    assert(fs.existsSync(htmlPath), `Pre-rendered HTML must exist for blog post slug: ${slug}`);
    
    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert(html.includes('data-prerendered="true"'), `${slug} must be prerendered`);
    assert(!html.includes('aria-busy="true"'), `${slug} must not be a loading skeleton`);
    assert(html.includes('<h1'), `${slug} must contain an <h1> title`);
    assert(html.includes('/fonts/aspekta-variable.woff2'), `${slug} must preload Aspekta font`);
    assert(html.includes('rel="stylesheet"'), `${slug} must link to stylesheets`);
    assert(html.length >= 5000, `${slug} HTML length must be substantial (> 5KB, actual: ${html.length})`);
    
    verifiedArticles++;
  }
  
  assert.equal(verifiedArticles, 101, 'All 101 blog articles verified intact with zero regressions');
});

test('Blog article headings preserve semantic emphasis (font-bold / font-semibold in body content)', () => {
  const postsFile = fs.readFileSync(path.join(root, 'src/content/blog/posts.ts'), 'utf-8');
  const slugMatches = [...postsFile.matchAll(/slug:\s*["\x27]([^"\x27]+)["\x27]/g)].map((m) => m[1]);
  
  let totalH2 = 0;
  let boldH2 = 0;
  
  for (const slug of slugMatches) {
    let htmlPath = path.join(root, 'dist', slug, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(root, 'dist', 'blog', slug, 'index.html');
    }
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const h2s = [...html.matchAll(/<h2([^>]*)>/g)];
    totalH2 += h2s.length;
    for (const h of h2s) {
      if (h[1].includes('font-bold') || h[1].includes('font-semibold')) {
        boldH2++;
      }
    }
  }
  
  assert(totalH2 > 1000, `Expected over 1000 h2 tags across 101 articles, got ${totalH2}`);
  const boldRatio = boldH2 / totalH2;
  assert(boldRatio > 0.9, `Over 90% of blog h2 headings should preserve explicit bold/semibold styles (actual: ${(boldRatio * 100).toFixed(1)}%)`);
});

test('All 126 pre-rendered routes exist in dist/ and validate SEO & structural readiness', () => {
  function findHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results = results.concat(findHtmlFiles(full));
      } else if (file.endsWith('.html')) {
        results.push(full);
      }
    }
    return results;
  }
  
  const allHtmlFiles = findHtmlFiles(path.join(root, 'dist'));
  // 126 pre-rendered routes + 1 404.html = 127 total HTML files
  assert(allHtmlFiles.length >= 127, `Expected at least 127 HTML files (126 routes + 404), got ${allHtmlFiles.length}`);
  
  const coreRoutes = [
    'dist/index.html',
    'dist/about/index.html',
    'dist/services/index.html',
    'dist/contact-us/index.html',
    'dist/cost-calculator/index.html',
    'dist/golden-visa/index.html',
    'dist/privacy/index.html',
    'dist/terms/index.html',
    'dist/bussines-setup-page/index.html',
    'dist/404.html',
  ];
  
  for (const relPath of coreRoutes) {
    const fullPath = path.join(root, relPath);
    assert(fs.existsSync(fullPath), `Core route ${relPath} must exist`);
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert(content.length > 1000, `${relPath} must have substantial content`);
    assert(!content.includes('%VITE_'), `${relPath} must not contain unreplaced %VITE_% tokens`);
  }
});

// -----------------------------------------------------------------------------
// SUMMARY & VERDICT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
if (failedTests === 0) {
  console.log('🏆 VERDICT: CONFIRMED');
  console.log('All Milestone 1 Design System & Typography implementations are verified.');
  console.log('======================================================================\n');
  process.exit(0);
} else {
  console.error('❌ VERDICT: REJECTED');
  console.error('Failures detected:');
  for (const f of failureDetails) {
    console.error(`- ${f.name}: ${f.error}`);
  }
  console.log('======================================================================\n');
  process.exit(1);
}
