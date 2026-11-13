import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480';
const BASE_URL = 'http://localhost:5173';

const routes = [
  { name: 'golden_visa', path: '/golden-visa/' },
  { name: 'services', path: '/services/' },
  { name: 'business_setup', path: '/bussines-setup-page/' },
  { name: 'cost_calculator', path: '/cost-calculator/' },
  { name: 'contact', path: '/contact-us/' },
  { name: 'about', path: '/about/' },
  { name: 'blog', path: '/blog/' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();

  for (const route of routes) {
    console.log(`Capturing Desktop: ${route.name}`);
    await desktopPage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({
      path: path.join(ARTIFACT_DIR, `klay_redesign_desktop_${route.name}.png`),
      fullPage: false,
    });
  }

  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  for (const route of routes) {
    console.log(`Capturing Mobile: ${route.name}`);
    await mobilePage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({
      path: path.join(ARTIFACT_DIR, `klay_redesign_mobile_${route.name}.png`),
      fullPage: false,
    });
  }

  await browser.close();
  console.log('Finished capturing all verification screenshots!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
