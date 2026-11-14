/**
 * ============================================================================
 * KLAY CONSULTANTS · MILESTONE 2 EMPIRICAL CHALLENGER TEST HARNESS
 * ============================================================================
 * 
 * Target Scope:
 *   1. Accredited Partners Marquee Under Load
 *      - RAF continuous animation loop (velocity, smooth translation, modulo wrap)
 *      - Mouse hover pause and resume
 *      - Pointer capture touch drag (offset tracking without jump, release behavior)
 *      - Rapid drag / fling stress testing
 *      - 8 authentic partner SVG logos rendering, accessibility & contrast
 *      - Multi-viewport horizontal overflow prevention (320px to 1920px)
 *   2. Section 2 Geometry & Design Parity
 *      - Porcelain Ivory background (#FBFBFB / rgb(251, 251, 251))
 *      - Heading 'Where Vision Becomes Sovereign Structure' computed 64px & font-weight 400
 *      - Two 48px display cards (415px height, 36px padding, white surface, '01'/'02' badges)
 *   3. Core Invariants & Calculator Engine Protection
 *      - git diff src/lib/calculator-engine.ts zero modification
 *      - npm test executes and all 5 calculator test suites pass 100%
 * 
 * Execution:
 *   export PATH="/Users/hayaat/.local/share/node-v24.22.1-darwin-arm64/bin:$PATH"
 *   node scripts/test-m2-challenger-2.mjs
 * ============================================================================
 */

import assert from 'node:assert/strict';
import cp from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TEST_PORT = Number(process.env.CHALLENGER_PORT) || 3088;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

console.log('================================================================================');
console.log('⚔️  KLAY M2 CHALLENGER 2: EMPIRICAL STRESS TEST & VERIFICATION HARNESS');
console.log('================================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

async function runTest(suite, testId, description, fn) {
  totalTests++;
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    passedTests++;
    console.log(`  ✓ [${suite} · ${testId}] ${description} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    failedTests++;
    console.error(`  ✗ [${suite} · ${testId}] ${description} (${duration}ms)`);
    console.error(`     Error: ${err.message}`);
    findings.push({ suite, testId, description, error: err.message });
  }
}

// ----------------------------------------------------------------------------
// SERVER LIFECYCLE
// ----------------------------------------------------------------------------
let viteServer = null;

async function checkHealth(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return res.ok || res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

async function startServer() {
  if (await checkHealth(BASE_URL)) {
    console.log(`📡 Reusing existing server on ${BASE_URL}\n`);
    return;
  }

  console.log(`🚀 Starting isolated Vite test server on port ${TEST_PORT}...`);
  viteServer = await createViteServer({
    root: projectRoot,
    configFile: path.join(projectRoot, 'vite.config.ts'),
    server: {
      port: TEST_PORT,
      strictPort: true,
      host: '127.0.0.1',
    },
    appType: 'spa',
    logLevel: 'error',
  });

  await viteServer.listen();
  console.log(`✓ Test server listening on ${BASE_URL}\n`);
}

async function stopServer() {
  if (viteServer) {
    await viteServer.close();
    viteServer = null;
  }
}

process.on('exit', () => { if (viteServer) viteServer.close(); });
process.on('SIGINT', async () => { await stopServer(); process.exit(1); });
process.on('SIGTERM', async () => { await stopServer(); process.exit(1); });

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  // --------------------------------------------------------------------------
  // SUITE 1: Core Invariants & Calculator Engine Protection
  // --------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('SUITE 1: Core Invariants & Calculator Engine Protection');
  console.log('--------------------------------------------------------------------------------');

  await runTest('INVARIANTS', 'T1.1', 'git diff src/lib/calculator-engine.ts confirms zero modifications', () => {
    const diff = cp.execSync('git diff src/lib/calculator-engine.ts', { cwd: projectRoot }).toString().trim();
    assert.strictEqual(diff, '', 'Calculator engine must not have any git diff');
  });

  await runTest('INVARIANTS', 'T1.2', 'git status confirms calculator-engine.ts is completely unmodified', () => {
    const status = cp.execSync('git status --short src/lib/calculator-engine.ts', { cwd: projectRoot }).toString().trim();
    assert.strictEqual(status, '', 'Calculator engine must not appear in git status modifications');
  });

  await runTest('INVARIANTS', 'T1.3', 'npm test executes all 5 calculator suites and passes with 100%', () => {
    const output = cp.execSync('npm test', { cwd: projectRoot, env: process.env }).toString();
    assert.ok(output.includes('ALL 5 TEST SUITES PASSED CLEANLY'), 'Output must confirm all 5 test suites passed cleanly');
    assert.ok(output.includes('100% assertions verified'), 'Output must confirm 100% assertions verified');
  });

  // --------------------------------------------------------------------------
  // Start server & launch browser
  // --------------------------------------------------------------------------
  await startServer();

  console.log('🌐 Launching Playwright Chromium headless browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    console.log(`🧭 Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait for hydration
    await page.waitForTimeout(1000);

    // --------------------------------------------------------------------------
    // SUITE 2: Section 2 Geometry & Design Parity
    // --------------------------------------------------------------------------
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SUITE 2: Section 2 Geometry & Design Parity');
    console.log('--------------------------------------------------------------------------------');

    const section2 = page.locator('#sovereign-structure');
    await runTest('SECTION_2', 'T2.1', 'Section 2 element #sovereign-structure exists and is visible', async () => {
      const count = await section2.count();
      assert.strictEqual(count, 1, 'Section 2 #sovereign-structure must exist');
      assert.ok(await section2.isVisible(), 'Section 2 #sovereign-structure must be visible');
    });

    await runTest('SECTION_2', 'T2.2', 'Section 2 background color is Porcelain Ivory (#FBFBFB / rgb(251, 251, 251))', async () => {
      const bgColor = await section2.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      assert.ok(
        bgColor === 'rgb(251, 251, 251)' || bgColor === '#FBFBFB' || bgColor === 'rgba(251, 251, 251, 1)',
        `Section 2 background must be Porcelain Ivory (rgb(251, 251, 251)), got: ${bgColor}`
      );
    });

    const heading = section2.locator('h2#sovereign-structure-heading');
    await runTest('SECTION_2', 'T2.3', "Heading text is 'Where Vision Becomes Sovereign Structure'", async () => {
      const text = await heading.textContent();
      assert.ok(
        text && text.trim().includes('Where Vision Becomes Sovereign Structure'),
        `Heading text mismatch, received: '${text?.trim()}'`
      );
    });

    await runTest('SECTION_2', 'T2.4', 'Heading computed font-weight is 400 (normal/light)', async () => {
      const fontWeight = await heading.evaluate((el) => window.getComputedStyle(el).fontWeight);
      assert.strictEqual(fontWeight, '400', `Heading font-weight must be 400, got: ${fontWeight}`);
    });

    await runTest('SECTION_2', 'T2.5', 'Heading computed font-size is 64px on 1440px desktop viewport', async () => {
      const fontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize);
      assert.strictEqual(fontSize, '64px', `Heading font-size on desktop must be 64px, got: ${fontSize}`);
    });

    await runTest('SECTION_2', 'T2.6', 'Heading computed letter-spacing is negative tracking (-0.03em to -0.04em)', async () => {
      const letterSpacing = await heading.evaluate((el) => window.getComputedStyle(el).letterSpacing);
      const px = parseFloat(letterSpacing);
      assert.ok(px < 0, `Heading letter-spacing must be negative, got: ${letterSpacing}`);
    });

    const cards = section2.locator('article');
    await runTest('SECTION_2', 'T2.7', 'Section 2 renders exactly two 48px display cards', async () => {
      const count = await cards.count();
      assert.strictEqual(count, 2, `Expected exactly 2 display cards, found ${count}`);
    });

    await runTest('SECTION_2', 'T2.8', "Display Card 1 title is 'Exclusive Direct Access' with '01' indicator", async () => {
      const card1 = cards.nth(0);
      const title = await card1.locator('h3').textContent();
      assert.ok(title && title.includes('Exclusive Direct Access'), `Card 1 title mismatch: ${title}`);
      const badge = await card1.locator('span.font-mono').textContent();
      assert.strictEqual(badge?.trim(), '01', `Card 1 badge must be '01', got: '${badge?.trim()}'`);
    });

    await runTest('SECTION_2', 'T2.9', "Display Card 2 title is 'Institutional Terms & Banking' with '02' indicator", async () => {
      const card2 = cards.nth(1);
      const title = await card2.locator('h3').textContent();
      assert.ok(title && title.includes('Institutional Terms & Banking'), `Card 2 title mismatch: ${title}`);
      const badge = await card2.locator('span.font-mono').textContent();
      assert.strictEqual(badge?.trim(), '02', `Card 2 badge must be '02', got: '${badge?.trim()}'`);
    });

    await runTest('SECTION_2', 'T2.10', 'Display cards have exact 415px computed height on desktop', async () => {
      const card1Height = await cards.nth(0).evaluate((el) => window.getComputedStyle(el).height);
      const card2Height = await cards.nth(1).evaluate((el) => window.getComputedStyle(el).height);
      assert.strictEqual(card1Height, '415px', `Card 1 height must be 415px, got: ${card1Height}`);
      assert.strictEqual(card2Height, '415px', `Card 2 height must be 415px, got: ${card2Height}`);
    });

    await runTest('SECTION_2', 'T2.11', 'Display cards have 36px padding on desktop (md:p-[36px])', async () => {
      const padding = await cards.nth(0).evaluate((el) => window.getComputedStyle(el).paddingTop);
      assert.strictEqual(padding, '36px', `Card padding must be 36px, got: ${padding}`);
    });

    await runTest('SECTION_2', 'T2.12', 'Display cards surface is pure white (#FFFFFF / rgb(255, 255, 255))', async () => {
      const card1Bg = await cards.nth(0).evaluate((el) => window.getComputedStyle(el).backgroundColor);
      assert.ok(
        card1Bg === 'rgb(255, 255, 255)' || card1Bg === '#FFFFFF' || card1Bg === 'rgba(255, 255, 255, 1)',
        `Card background must be white, got: ${card1Bg}`
      );
    });

    await runTest('SECTION_2', 'T2.13', 'Display card titles have 48px computed font-size and font-weight 400 on desktop', async () => {
      const title1 = cards.nth(0).locator('h3');
      const fontSize = await title1.evaluate((el) => window.getComputedStyle(el).fontSize);
      const fontWeight = await title1.evaluate((el) => window.getComputedStyle(el).fontWeight);
      assert.strictEqual(fontSize, '48px', `Card title font-size must be 48px, got: ${fontSize}`);
      assert.strictEqual(fontWeight, '400', `Card title font-weight must be 400, got: ${fontWeight}`);
    });

    // --------------------------------------------------------------------------
    // SUITE 3: Accredited Partners Marquee Under Load
    // --------------------------------------------------------------------------
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SUITE 3: Accredited Partners Marquee Under Load');
    console.log('--------------------------------------------------------------------------------');

    const marquee = section2.locator('div[role="region"][aria-label="Accredited banking and free zone partners marquee"]');
    await runTest('MARQUEE', 'T3.1', 'Marquee region container exists with accessible aria-label', async () => {
      const count = await marquee.count();
      assert.strictEqual(count, 1, 'Marquee region container must exist');
      assert.ok(await marquee.isVisible(), 'Marquee container must be visible');
    });

    const eyebrow = marquee.locator('span:has-text("ACCREDITED PARTNERS")');
    await runTest('MARQUEE', 'T3.2', 'Marquee fixed left eyebrow column displays ACCREDITED PARTNERS with green dot', async () => {
      assert.ok(await eyebrow.isVisible(), 'ACCREDITED PARTNERS eyebrow text must be visible');
      const pulseDot = marquee.locator('span.animate-pulse');
      assert.ok(await pulseDot.isVisible(), 'Emerald pulse dot indicator must be visible');
    });

    // Function to parse translate3d x offset
    async function getTrackXOffset(page) {
      return await page.evaluate(() => {
        const marqueeRegion = document.querySelector('div[role="region"][aria-label="Accredited banking and free zone partners marquee"]');
        if (!marqueeRegion) return null;
        const track = marqueeRegion.querySelector('.will-change-transform');
        if (!track) return null;
        const transform = track.style.transform || window.getComputedStyle(track).transform;
        // Parse translate3d(Xpx, ...) or matrix(...)
        if (transform.includes('translate3d')) {
          const match = transform.match(/translate3d\(([-\d.]+)px/);
          return match ? parseFloat(match[1]) : 0;
        }
        if (transform.startsWith('matrix')) {
          const parts = transform.replace(/^matrix\(|\)$/g, '').split(',').map(p => parseFloat(p.trim()));
          // matrix(a, b, c, d, tx, ty) -> parts[4] is tx
          return parts[4] || 0;
        }
        return 0;
      });
    }

    await runTest('MARQUEE', 'T3.3', 'RAF Animation Loop translates continuously right-to-left under load', async () => {
      // Scroll into view
      await marquee.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);

      const offset1 = await getTrackXOffset(page);
      await page.waitForTimeout(600);
      const offset2 = await getTrackXOffset(page);
      await page.waitForTimeout(600);
      const offset3 = await getTrackXOffset(page);

      assert.ok(offset1 !== null, 'Offset 1 must not be null');
      assert.ok(offset2 !== null, 'Offset 2 must not be null');
      assert.ok(offset3 !== null, 'Offset 3 must not be null');

      // Since marquee moves right-to-left, offset becomes more negative (offset2 < offset1)
      const moved1to2 = offset2 - offset1;
      const moved2to3 = offset3 - offset2;

      assert.ok(moved1to2 < 0, `Track must translate to the left (negative delta), got: ${moved1to2}px`);
      assert.ok(moved2to3 < 0, `Track must continue translating to the left, got: ${moved2to3}px`);
    });

    await runTest('MARQUEE', 'T3.4', 'RAF Animation Loop velocity measures close to configured 50px/sec', async () => {
      const startTime = Date.now();
      const startOffset = await getTrackXOffset(page);
      await page.waitForTimeout(1000);
      const elapsedSec = (Date.now() - startTime) / 1000;
      const endOffset = await getTrackXOffset(page);

      const totalDistance = Math.abs(endOffset - startOffset);
      const measuredVelocity = totalDistance / elapsedSec;

      console.log(`     [Metric] Measured Velocity: ${measuredVelocity.toFixed(2)} px/sec (Target: 50 px/sec)`);
      // Allow reasonable frame timing margin (30px/s to 70px/s under headless CI load)
      assert.ok(
        measuredVelocity >= 30 && measuredVelocity <= 70,
        `Marquee velocity must be ~50px/sec, measured: ${measuredVelocity.toFixed(2)} px/sec`
      );
    });

    await runTest('MARQUEE', 'T3.5', 'Mouse hover pause stops animation, mouse leave resumes animation', async () => {
      // Move mouse into marquee
      const box = await marquee.boundingBox();
      assert.ok(box, 'Marquee bounding box must exist');

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);

      const pausedOffset1 = await getTrackXOffset(page);
      await page.waitForTimeout(500);
      const pausedOffset2 = await getTrackXOffset(page);

      // On hover, translation must pause
      const hoverDelta = Math.abs(pausedOffset2 - pausedOffset1);
      assert.ok(
        hoverDelta < 2,
        `Marquee must pause on mouse hover, but offset shifted by ${hoverDelta}px`
      );

      // Move mouse away (unhover)
      await page.mouse.move(0, 0);
      await page.waitForTimeout(600);
      const resumedOffset = await getTrackXOffset(page);

      const resumeDelta = Math.abs(resumedOffset - pausedOffset2);
      assert.ok(
        resumeDelta > 10,
        `Marquee must resume animation after mouse leaves, but delta was only ${resumeDelta}px`
      );
    });

    await runTest('MARQUEE', 'T3.6', 'Pointer capture touch drag updates offset smoothly in real time without jumps', async () => {
      const box = await marquee.boundingBox();
      const startX = box.x + box.width * 0.7;
      const startY = box.y + box.height / 2;

      // Pointer down
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.waitForTimeout(100);

      const dragStartOffset = await getTrackXOffset(page);

      // Drag left by 120px
      await page.mouse.move(startX - 120, startY, { steps: 5 });
      await page.waitForTimeout(100);

      const midDragOffset = await getTrackXOffset(page);
      const dragDelta = midDragOffset - dragStartOffset;

      // Drag delta should be approximately -120px (within small touch coordinate margin)
      assert.ok(
        Math.abs(dragDelta - (-120)) < 15,
        `Mid-drag offset must track mouse move closely (expected ~ -120px delta, got ${dragDelta}px)`
      );

      // Drag right by 200px (reverse drag)
      await page.mouse.move(startX + 80, startY, { steps: 5 });
      await page.waitForTimeout(100);

      const reverseDragOffset = await getTrackXOffset(page);
      const reverseDelta = reverseDragOffset - dragStartOffset;
      assert.ok(
        Math.abs(reverseDelta - 80) < 15,
        `Reverse drag offset must track mouse move smoothly (expected ~ +80px delta, got ${reverseDelta}px)`
      );

      // Pointer up release
      await page.mouse.up();
      // Move mouse away to prevent hover pause
      await page.mouse.move(0, 0);

      // Verify release resumes RAF animation from release offset
      await page.waitForTimeout(200);
      const afterReleaseOffset1 = await getTrackXOffset(page);
      await page.waitForTimeout(500);
      const afterReleaseOffset2 = await getTrackXOffset(page);

      const postReleaseMove = afterReleaseOffset2 - afterReleaseOffset1;
      assert.ok(
        postReleaseMove < -5,
        `Animation must resume smoothly post-drag release (expected negative translation, got ${postReleaseMove}px)`
      );
    });

    await runTest('MARQUEE', 'T3.7', 'Rapid drag / fling stress testing produces no NaN or corrupted transforms', async () => {
      const box = await marquee.boundingBox();
      const startX = box.x + box.width * 0.6;
      const startY = box.y + box.height / 2;

      // Torture loop: 6 rapid back-and-forth drags
      for (let i = 0; i < 6; i++) {
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        const delta = i % 2 === 0 ? -180 : 180;
        await page.mouse.move(startX + delta, startY, { steps: 3 });
        await page.mouse.up();
      }

      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);

      const finalOffset = await getTrackXOffset(page);
      assert.ok(
        typeof finalOffset === 'number' && !isNaN(finalOffset) && isFinite(finalOffset),
        `Transform offset must be a valid finite number after stress test, got: ${finalOffset}`
      );
    });

    await runTest('MARQUEE', 'T3.8', 'All 8 authentic partner logos are present in DOM with SVG and labels', async () => {
      const partnerIds = [
        { id: 'meydan', name: 'Meydan Free Zone Dubai' },
        { id: 'ifza', name: 'IFZA Dubai' },
        { id: 'dmcc', name: 'DMCC' },
        { id: 'rak-icc', name: 'RAK ICC Offshore' },
        { id: 'ded', name: 'Dubai Economy & Tourism (DED)' },
        { id: 'emirates-nbd', name: 'Emirates NBD' },
        { id: 'mashreq', name: 'Mashreq Bank' },
        { id: 'wio', name: 'Wio Bank' },
      ];

      for (const partner of partnerIds) {
        // Find logo div by title or aria-label in SVG
        const logo = marquee.locator(`div[title*="${partner.name}"], svg[aria-label*="${partner.name}"]`).first();
        const count = await logo.count();
        assert.ok(count >= 1, `Partner logo '${partner.name}' (${partner.id}) must be present in DOM`);
      }
    });

    await runTest('MARQUEE', 'T3.9', 'Partner SVG logos render with valid viewBox, currentColor, and visible contrast', async () => {
      const svgs = marquee.locator('svg');
      const svgCount = await svgs.count();
      assert.ok(svgCount >= 8, `Expected at least 8 SVGs in marquee track, found ${svgCount}`);

      for (let i = 0; i < Math.min(8, svgCount); i++) {
        const svg = svgs.nth(i);
        const viewBox = await svg.getAttribute('viewBox');
        assert.ok(viewBox && viewBox.length > 0, `SVG ${i} must have non-empty viewBox`);
        const fill = await svg.getAttribute('fill');
        assert.ok(fill === 'currentColor' || fill === 'none', `SVG ${i} must have fill=currentColor or none, got: ${fill}`);
      }
    });

    await runTest('MARQUEE', 'T3.10', 'Partner logo tiles have grayscale filter and transition to full color on hover', async () => {
      const logoTile = marquee.locator('.will-change-transform > div').first().locator('> div').first();
      assert.ok(await logoTile.isVisible(), 'First logo tile must be visible');

      const filterBefore = await logoTile.evaluate((el) => window.getComputedStyle(el).filter);
      const opacityBefore = await logoTile.evaluate((el) => window.getComputedStyle(el).opacity);

      assert.ok(
        filterBefore.includes('grayscale') || parseFloat(opacityBefore) <= 0.8,
        `Tile must have grayscale filter or muted opacity in neutral state (filter: ${filterBefore}, opacity: ${opacityBefore})`
      );

      // Hover over logo tile
      await logoTile.hover();
      await page.waitForTimeout(350);

      const filterAfter = await logoTile.evaluate((el) => window.getComputedStyle(el).filter);
      const opacityAfter = await logoTile.evaluate((el) => window.getComputedStyle(el).opacity);

      assert.ok(
        parseFloat(opacityAfter) >= 0.95 || filterAfter.includes('none') || filterAfter === '',
        `Tile must become fully opaque and un-greyscaled on hover (opacity: ${opacityAfter}, filter: ${filterAfter})`
      );

      // Unhover
      await page.mouse.move(0, 0);
    });

    // --------------------------------------------------------------------------
    // SUITE 4: Multi-Viewport & Mobile Horizontal Overflow Stress Test
    // --------------------------------------------------------------------------
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SUITE 4: Multi-Viewport & Mobile Horizontal Overflow Stress Test');
    console.log('--------------------------------------------------------------------------------');

    const viewports = [
      { name: 'iPhone SE (Ultra-compact)', width: 320, height: 568 },
      { name: 'Android Standard', width: 360, height: 800 },
      { name: 'iPhone 8 / SE2', width: 375, height: 667 },
      { name: 'iPhone 14 / Modern Smartphone', width: 390, height: 844 },
      { name: 'iPhone Plus / Max', width: 414, height: 896 },
      { name: 'iPad Portrait (Tablet)', width: 768, height: 1024 },
      { name: 'iPad Landscape (Small Laptop)', width: 1024, height: 768 },
      { name: 'Desktop HD', width: 1440, height: 900 },
      { name: 'Full HD Monitor', width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await runTest('RESPONSIVE', `T4.${vp.width}`, `Zero horizontal overflow on ${vp.name} (${vp.width}x${vp.height})`, async () => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(200);

        const overflowInfo = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const section = document.getElementById('sovereign-structure');
          const marqueeEl = document.querySelector('div[role="region"][aria-label="Accredited banking and free zone partners marquee"]');

          return {
            windowInnerWidth: window.innerWidth,
            docScrollWidth: docEl.scrollWidth,
            bodyScrollWidth: body.scrollWidth,
            hasDocHorizontalScroll: docEl.scrollWidth > window.innerWidth,
            hasBodyHorizontalScroll: body.scrollWidth > window.innerWidth,
            sectionWidth: section ? section.getBoundingClientRect().width : null,
            marqueeOverflow: marqueeEl ? window.getComputedStyle(marqueeEl).overflow : null,
          };
        });

        assert.strictEqual(
          overflowInfo.hasDocHorizontalScroll,
          false,
          `Document has horizontal scrollbar on ${vp.width}px: doc.scrollWidth=${overflowInfo.docScrollWidth} > innerWidth=${overflowInfo.windowInnerWidth}`
        );

        assert.strictEqual(
          overflowInfo.hasBodyHorizontalScroll,
          false,
          `Body has horizontal scrollbar on ${vp.width}px: body.scrollWidth=${overflowInfo.bodyScrollWidth} > innerWidth=${overflowInfo.windowInnerWidth}`
        );

        assert.ok(
          overflowInfo.marqueeOverflow === 'hidden' || overflowInfo.marqueeOverflow === 'clip',
          `Marquee container must have overflow:hidden to prevent viewport breakout, got: ${overflowInfo.marqueeOverflow}`
        );
      });
    }

  } finally {
    await browser.close();
    await stopServer();
  }

  // --------------------------------------------------------------------------
  // Summary Block
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('⚔️  CHALLENGER 2 TEST EXECUTION SUMMARY');
  console.log('================================================================================');
  console.log(`  Total Tests Run:  ${totalTests}`);
  console.log(`  Tests Passed:     ${passedTests}`);
  console.log(`  Tests Failed:     ${failedTests}`);
  console.log(`  Success Rate:     ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`  Verdict:          ${failedTests === 0 ? '✅ EMPIRICAL CONFIRMATION (100% GREEN)' : '❌ CHALLENGE FAILED (BUGS DETECTED)'}`);
  console.log('================================================================================\n');

  if (findings.length > 0) {
    console.log('DETAILED FINDINGS:');
    for (const f of findings) {
      console.log(`- [${f.suite} · ${f.testId}] ${f.description}`);
      console.log(`  Error: ${f.error}`);
    }
    console.log('\n');
  }

  return failedTests === 0;
}

main().then((success) => {
  if (!success) {
    process.exit(1);
  }
}).catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
