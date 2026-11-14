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

  // 1. Cost Calculator (Variant C kept as default)
  console.log('Capturing Cost Calculator (Variant C default)...');
  await page.goto(`${BASE_URL}/cost-calculator`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await (await page.$('#calculator'))?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'cost_calculator_variant_c_default.png'),
  });

  // 2. Golden Visa Variant A (VIP Gold Dossier)
  console.log('Capturing Golden Visa Variant A (VIP Gold Dossier)...');
  await page.goto(`${BASE_URL}/golden-visa?variant=A`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await (await page.$('#qualification-explorer'))?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'prototype_golden_visa_variant_a_dossier.png'),
  });

  // 3. Golden Visa Variant B (Statutory Matrix)
  console.log('Capturing Golden Visa Variant B (Statutory Matrix)...');
  await page.goto(`${BASE_URL}/golden-visa?variant=B`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await (await page.$('#qualification-explorer'))?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'prototype_golden_visa_variant_b_matrix.png'),
  });

  // 4. Golden Visa Variant C (30-Sec Quiz Qualifier - Step 1)
  console.log('Capturing Golden Visa Variant C (Quiz Step 1)...');
  await page.goto(`${BASE_URL}/golden-visa?variant=C`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await (await page.$('#qualification-explorer'))?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'prototype_golden_visa_variant_c_quiz.png'),
  });

  // 5. Golden Visa Variant C (Quiz Step 4 - Result)
  console.log('Simulating Golden Visa Variant C Quiz click to Step 4...');
  // Click first card (Real Estate Owner)
  const propCard = await page.$('h5:has-text("Real Estate Owner")');
  if (propCard) {
    await propCard.click();
    await page.waitForTimeout(400);
    // Click ready property
    const readyBtn = await page.$('button:has-text("Single Ready Property")');
    if (readyBtn) {
      await readyBtn.click();
      await page.waitForTimeout(400);
      // Click family all
      const famBtn = await page.$('h5:has-text("Full Family Sponsorship")');
      if (famBtn) {
        await famBtn.click();
        await page.waitForTimeout(600);
        await (await page.$('#qualification-explorer'))?.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, 'prototype_golden_visa_variant_c_quiz_step4.png'),
        });
      }
    }
  }

  await browser.close();
  console.log('Finished capturing all Golden Visa Option 2 prototype screenshots!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
