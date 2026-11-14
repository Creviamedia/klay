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

  // 1. Golden Visa page with Variant C locked as default
  console.log('Capturing Golden Visa (Variant C default)...');
  await page.goto(`${BASE_URL}/golden-visa`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await (await page.$('#qualification-explorer'))?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'golden_visa_variant_c_default.png'),
  });

  // 2. Option 3 Pricing Engine Demo: Default View
  console.log('Capturing Pricing Engine Demo (Default view)...');
  await page.goto(`${BASE_URL}/pricing-engine-demo.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'pricing_engine_demo_default.png'),
    fullPage: false,
  });

  // 3. Option 3 Pricing Engine Demo: Click Scenario Mainland + Ejari
  console.log('Testing Scenario: Dubai Mainland + Physical Ejari...');
  const mainlandBtn = await page.$('button:has-text("Dubai Mainland + Physical Ejari")');
  if (mainlandBtn) {
    await mainlandBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pricing_engine_demo_mainland.png'),
      fullPage: false,
    });
  }

  // 4. Option 3 Pricing Engine Demo: Scroll to Test Assertions & JSON Panel
  console.log('Capturing Test Assertions & JSON Panel...');
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'pricing_engine_demo_assertions.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('Finished capturing all Option 3 verification screenshots!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
