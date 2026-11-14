import { chromium } from 'playwright';

const ARTIFACT_DIR = '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480';
const BASE_URL = 'https://klay-consulting-staging.netlify.app';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  console.log('Capturing Netlify Staging Live - Cost Calculator...');
  await page.goto(`${BASE_URL}/cost-calculator/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const calc = await page.$('#calculator');
  if (calc) await calc.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${ARTIFACT_DIR}/netlify_live_staging_calculator.png` });

  console.log('Capturing Netlify Staging Live - Golden Visa...');
  await page.goto(`${BASE_URL}/golden-visa/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const qe = await page.$('#qualification-explorer');
  if (qe) await qe.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${ARTIFACT_DIR}/netlify_live_staging_golden_visa.png` });

  console.log('Capturing Netlify Staging Live - Option 3 Pricing Engine Demo...');
  await page.goto(`${BASE_URL}/pricing-engine-demo.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${ARTIFACT_DIR}/netlify_live_staging_pricing_demo.png` });

  await browser.close();
  console.log('Done capturing live Netlify staging screenshots!');
}

main().catch(console.error);
