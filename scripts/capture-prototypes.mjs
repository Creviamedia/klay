import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480';
const BASE_URL = 'http://localhost:5173';

async function main() {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();

  // 1. Variant A: Single-Fold Ledger
  console.log('Capturing Variant A...');
  await page.goto(`${BASE_URL}/cost-calculator?variant=A`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await (await page.$('#calculator'))?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'prototype_variant_a_ledger.png'),
  });

  // 2. Variant B: Step 1 (Jurisdiction)
  console.log('Capturing Variant B (Step 1)...');
  await page.goto(`${BASE_URL}/cost-calculator?variant=B`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await (await page.$('#calculator'))?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'prototype_variant_b_wizard_step1.png'),
  });

  // 3. Variant B: Step 4 (Proposal & Dossier)
  console.log('Navigating Variant B to Step 4...');
  // Click step 4 button directly
  const step4Btn = await page.$('button:has-text("Executive Proposal")');
  if (step4Btn) {
    await step4Btn.click();
    await page.waitForTimeout(600);
    await (await page.$('#calculator'))?.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'prototype_variant_b_wizard_step4.png'),
    });
  }

  // 4. Variant C: Financial Sliders & Visual Breakdown Matrix
  console.log('Capturing Variant C...');
  await page.goto(`${BASE_URL}/cost-calculator?variant=C`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await (await page.$('#calculator'))?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'prototype_variant_c_sliders.png'),
  });

  await browser.close();
  console.log('All detailed prototype verification screenshots captured successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
