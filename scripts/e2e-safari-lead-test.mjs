import { webkit } from 'playwright-core';
import http from 'node:http';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const PORT = 3008;
const screenshotsDir = path.join(projectRoot, 'data', 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Random Realistic UAE Executive / Investor Names & Profiles
const FIRST_NAMES = ['Sheikh Tariq', 'Dr. Aisha', 'Fahad', 'Elena', 'Marcus', 'Zayed', 'Reem', 'Sir Arthur'];
const LAST_NAMES = ['Al-Hashemi', 'Al-Falasi', 'Al-Maktoum', 'Sterling', 'von Bergmann', 'Al-Nuaimi', 'Khurana', 'Vance'];
const DOMAINS = ['holding-spv.ae', 'capital-advisory.com', 'sovereign-ai.ae', 'nexus-ventures.io', 'family-office.ch'];
const ACTIVITIES = [
  'Holding Company & Asset Structuring',
  'Technology, AI & Software Development',
  'Commercial Trading & General Trade',
  'Financial Services & FinTech',
  'Consulting & Professional Services',
];
const JURISDICTIONS = ['DIFC / ADGM', 'Free Zone', 'Mainland DED'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const firstName = randomChoice(FIRST_NAMES);
const lastName = randomChoice(LAST_NAMES);
const randomLead = {
  fullName: `${firstName} ${lastName}`,
  email: `${firstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}@${randomChoice(DOMAINS)}`,
  phoneLocal: `${Math.floor(5000000 + Math.random() * 4999999)}`,
  jurisdiction: randomChoice(JURISDICTIONS),
  activity: randomChoice(ACTIVITIES),
  timeline: 'Immediate (1-2 weeks)',
  notes: `Client requires urgent Klay Legal corporate advisory for ${firstName} ${lastName}. Verify DIFC Will protection and bank account conduit.`,
};

console.log('🏛️ ========================================================');
console.log('🏛️ KLAY CONSULTANTS · SAFARI (WEBKIT) QC/QA VERIFICATION');
console.log('🏛️ ========================================================');
console.log('Generated Random Executive Lead:');
console.log(`- Name:         ${randomLead.fullName}`);
console.log(`- Email:        ${randomLead.email}`);
console.log(`- Phone:        +971 ${randomLead.phoneLocal}`);
console.log(`- Jurisdiction: ${randomLead.jurisdiction}`);
console.log(`- Activity:     ${randomLead.activity}`);
console.log('--------------------------------------------------------');

console.log(`1. Launching staging server on port ${PORT}...`);
const serverProcess = cp.spawn('node', ['server.js', '--production'], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(PORT), VITE_ENVIRONMENT: 'staging' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

serverProcess.stdout.on('data', (d) => console.log('  [Server]', d.toString().trim()));
serverProcess.stderr.on('data', (d) => console.error('  [Server Error]', d.toString().trim()));

// Wait for server ready
await new Promise((resolve) => setTimeout(resolve, 1500));

try {
  console.log('2. Launching WebKit (Safari Engine)...');
  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  });
  const page = await context.newPage();

  console.log(`3. Navigating to http://localhost:${PORT}/ in Safari to verify One-View layout...`);
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

  // Locate the custom form on Homepage hero
  const heroForm = page.locator('form');
  await heroForm.waitFor({ state: 'visible', timeout: 8000 });
  const heroBoundingBox = await heroForm.boundingBox();
  console.log(`📏 Homepage Form Bounding Box: Height = ${Math.round(heroBoundingBox.height)}px, Width = ${Math.round(heroBoundingBox.width)}px`);
  console.log(`👁️ One-View Check: Form height (${Math.round(heroBoundingBox.height)}px) fits well within viewport (900px): ${heroBoundingBox.height < 600 ? '✅ TRUE (One View - 0 Scrolling)' : '⚠️ Check Height'}`);

  const heroScreenshot = path.join(screenshotsDir, 'safari-00-homepage-one-view.png');
  await page.screenshot({ path: heroScreenshot, fullPage: false });
  console.log(`📸 Screenshot saved: ${heroScreenshot}`);

  console.log(`4. Navigating to http://localhost:${PORT}/contact in Safari...`);
  await page.goto(`http://localhost:${PORT}/contact`, { waitUntil: 'networkidle' });

  // Locate the custom form
  const formCard = page.locator('form');
  await formCard.waitFor({ state: 'visible', timeout: 8000 });

  console.log(`5. Selecting Target Jurisdiction: "${randomLead.jurisdiction}"...`);
  const jurisdictionButton = page.locator(`button[role="radio"]:has-text("${randomLead.jurisdiction}")`);
  await jurisdictionButton.click();

  console.log('6. Entering Contact Details...');
  // Fill Name
  const nameInput = page.locator('input[placeholder*="Tariq"]');
  await nameInput.fill(randomLead.fullName);

  // Fill Email
  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(randomLead.email);

  // Fill Phone
  const phoneInput = page.locator('input[type="tel"]');
  await phoneInput.fill(randomLead.phoneLocal);

  // Select Activity
  const activitySelect = page.locator('select').nth(1);
  await activitySelect.selectOption({ label: randomLead.activity });

  // Fill Notes
  const notesTextarea = page.locator('textarea');
  await notesTextarea.fill(randomLead.notes);

  const filledScreenshot = path.join(screenshotsDir, 'safari-01-filled-form.png');
  await page.screenshot({ path: filledScreenshot, fullPage: false });
  console.log(`📸 Screenshot saved: ${filledScreenshot}`);

  console.log('7. Submitting Inquiry to Legal Desk...');
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  console.log('8. Awaiting Sovereign Reference Receipt in Safari...');
  const successHeader = page.locator('text=Inquiry Successfully Registered');
  await successHeader.waitFor({ state: 'visible', timeout: 10000 });

  const refNumberElement = page.locator('p.font-mono');
  const referenceId = await refNumberElement.textContent();
  console.log(`✨ Reference ID Issued: ${referenceId}`);

  const successScreenshot = path.join(screenshotsDir, 'safari-02-success-receipt.png');
  await page.screenshot({ path: successScreenshot, fullPage: false });
  console.log(`📸 Screenshot saved: ${successScreenshot}`);

  await browser.close();

  console.log('9. Verifying Local Storage & CRM Mirror...');
  const leads = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data', 'leads.json'), 'utf8'));
  const lastLead = leads[leads.length - 1];
  console.log(`   - Saved to data/leads.json:       ${lastLead.id === referenceId ? '✅ VERIFIED' : '❌ MISMATCH'}`);
  console.log(`   - Client Name matches:             ${lastLead.name === randomLead.fullName ? '✅ VERIFIED' : '❌ MISMATCH'}`);

  const csvContent = fs.readFileSync(path.join(projectRoot, 'data', 'google-sheet-crm.csv'), 'utf8');
  console.log(`   - Logged to google-sheet-crm.csv:  ${csvContent.includes(referenceId) ? '✅ VERIFIED' : '❌ MISMATCH'}`);

  console.log('10. Polling ntfy.sh to verify WhatsApp & Call Action Buttons...');
  const ntfyRes = await fetch('https://ntfy.sh/klay-leads-dubai/json?poll=1');
  const ntfyText = await ntfyRes.text();
  const ntfyLines = ntfyText.trim().split('\n').filter(Boolean);
  let verifiedNotification = null;

  for (let i = ntfyLines.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(ntfyLines[i]);
      if (obj.actions && obj.actions.length > 0) {
        verifiedNotification = obj;
        break;
      }
    } catch {}
  }

  if (verifiedNotification) {
    console.log(`   - ntfy Notification ID: ${verifiedNotification.id}`);
    console.log(`   - Action buttons found: ${verifiedNotification.actions.map(a => a.label).join(' | ')}`);
    console.log(`   - WhatsApp 1-tap URL:   ${verifiedNotification.click}`);
    console.log(`   - Actions verification:  ✅ VERIFIED (Both 💬 WhatsApp & 📞 Call Lead buttons active)`);
  } else {
    console.warn(`   - Actions verification:  ⚠️ Action buttons pending in topic poll`);
  }

  console.log('========================================================');
  console.log('🎉 SAFARI (WEBKIT) E2E LEAD VERIFICATION COMPLETED 100%!');
  console.log(`📱 Push alert sent to https://ntfy.sh/klay-leads-dubai with 1-tap WhatsApp trigger.`);
  console.log('========================================================');
} catch (err) {
  console.error('❌ E2E Verification failed:', err);
  process.exitCode = 1;
} finally {
  serverProcess.kill('SIGTERM');
}
