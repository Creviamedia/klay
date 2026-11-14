import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

console.log('🚀 Running Playwright End-to-End Browser Form Verification...\n');

const BASE_URL = 'http://localhost:5173';

const CHROME_PATH =
  '/Users/hayaat/Library/Caches/ms-playwright/chromium-1254/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    console.error('  [Browser Console Error]:', msg.text());
  }
});
page.on('pageerror', (err) => {
  console.error('  [Unhandled Page Exception]:', err.message);
});

try {
  // -------------------------------------------------------------------------
  // 1. Homepage Instant Calculator E2E
  // -------------------------------------------------------------------------
  console.log('1. Testing Homepage Instant Calculator form submission...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);

  const calcHeader = page.locator('text=Instant Formation Cost Calculator');
  await calcHeader.scrollIntoViewIfNeeded();

  await page.fill('input[placeholder="Your Name"]', 'Sir Arthur Conan');
  await page.fill('input[placeholder="Email Address"]', 'arthur@conan-investments.co.uk');
  await page.fill('input[placeholder="WhatsApp (+971...)"]', '+971 50 888 9999');

  await page.click('button:has-text("Get Official Quote")');
  await page.waitForTimeout(1500);

  const successBanner = page.locator('text=Estimate registered! Reference:');
  const isVisible = await successBanner.isVisible();
  assert.ok(isVisible, 'Homepage calculator must show success confirmation banner');
  const bannerText = await successBanner.innerText();
  console.log(`  ✓ Homepage calculator submitted successfully! [${bannerText}]`);

  // -------------------------------------------------------------------------
  // 2. Contact Page with DIFC / ADGM Pill Selection (DEF-02 verification)
  // -------------------------------------------------------------------------
  console.log('2. Testing Contact Page DIFC / ADGM selection and submission...');
  await page.goto(`${BASE_URL}/contact-us/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);

  const difcButton = page.locator('button:has-text("DIFC / ADGM")');
  await difcButton.click();
  await page.waitForTimeout(500);

  const tagText = page.locator('text=Common Law Financial Centre');
  assert.ok(await tagText.isVisible(), 'Must display DIFC / ADGM tag without crashing');

  await page.fill('input[placeholder="e.g. Tariq Al Mansoor"]', 'Beatrix Potter');
  await page.fill('input[placeholder="name@company.com"]', 'beatrix@potter-holdings.ae');
  await page.fill('input[placeholder="50 123 4567"]', '543210987');
  await page.fill('textarea', 'Testing DIFC / ADGM asset structuring inquiry.');

  await page.click('button:has-text("Request Sovereign Legal Consultation")');
  await page.waitForTimeout(2000);

  const contactConfirmation = page.locator('text=Inquiry Successfully Registered');
  assert.ok(await contactConfirmation.isVisible(), 'Contact form must show confirmation header');
  console.log('  ✓ Contact form with DIFC / ADGM submitted with zero errors!');

  // -------------------------------------------------------------------------
  // 3. Golden Visa Alias Route (/golden-visa-dubai) and Quiz Submission (DEF-04)
  // -------------------------------------------------------------------------
  console.log('3. Testing /golden-visa-dubai route and Variant C Quiz Qualifier...');
  await page.goto(`${BASE_URL}/golden-visa-dubai`, {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });
  await page.waitForTimeout(1500);

  const gvTitle = page.locator('text=Instant UAE Golden Visa Eligibility Assessment');
  assert.ok(
    await gvTitle.isVisible(),
    'Must load Golden Visa quiz qualifier on /golden-visa-dubai'
  );

  // Step 1: Click "Real Estate Owner"
  await page.click('button:has-text("Real Estate Owner")');
  await page.waitForTimeout(500);

  // Step 2: Click first bracket
  await page.click('button:has-text("Single Ready Property")');
  await page.waitForTimeout(500);

  // Step 3: Click first family scope
  await page.click('button:has-text("Full Family Sponsorship")');
  await page.waitForTimeout(500);

  // Step 4: Fill lead capture
  await page.fill('input[placeholder="Full Legal Name"]', 'Lord Henry Wotton');
  await page.fill('input[placeholder="Email Address"]', 'henry.wotton@mayfair-family.com');
  await page.fill('input[placeholder="WhatsApp / Phone"]', '+971 52 111 2222');

  await page.click('button:has-text("Claim Guaranteed Pre-Clearance File")');
  await page.waitForTimeout(2000);

  const preClearanceBanner = page.locator('text=Pre-Clearance File Created');
  assert.ok(await preClearanceBanner.isVisible(), 'Quiz must show Pre-Clearance File Created');
  console.log('  ✓ /golden-visa-dubai quiz completed and submitted successfully!');

  // -------------------------------------------------------------------------
  // 4. Cost Calculator Variant C Financial Sliders Submission
  // -------------------------------------------------------------------------
  console.log('4. Testing Cost Calculator Financial Sliders lead capture...');
  await page.goto(`${BASE_URL}/cost-calculator/`, {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });
  await page.waitForTimeout(1500);

  const calcTitle = page.locator('text=Dynamic Financial Modeling Simulator');
  await calcTitle.scrollIntoViewIfNeeded();

  await page.fill('input[placeholder="Full Name"]', 'Countess Olenska');
  await page.fill('input[placeholder="corporate@company.com"]', 'olenska@arch-consult.ae');
  await page.fill('input[placeholder="Phone / WhatsApp"]', '+971 50 333 4444');

  await page.click('button:has-text("Generate Official Financial Model")');
  await page.waitForTimeout(2000);

  const slidersConfirmation = page.locator('text=Model Exported');
  assert.ok(await slidersConfirmation.isVisible(), 'Financial sliders must show confirmation');
  console.log('  ✓ Cost Calculator Financial Sliders lead submitted successfully!');

  console.log('\n🎉 ALL 4 BROWSER E2E TESTS PASSED WITH 100% SUCCESS!');
} finally {
  await browser.close();
}
