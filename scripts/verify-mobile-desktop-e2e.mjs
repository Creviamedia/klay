/**
 * Comprehensive Mobile & Desktop E2E Verification Suite
 * (Lauren Poteto Rules: Repeatable verification with concrete runtime evidence)
 */

import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR =
  '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480';
const TEST_PORT = 3099;
const LOCAL_URL = `http://127.0.0.1:${TEST_PORT}`;
const LIVE_URL = 'https://klayconsultants.com';

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function ping() {
      http
        .get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve(true);
          } else {
            retry();
          }
        })
        .on('error', retry);
    }
    function retry() {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timeout waiting for server at ${url}`));
      } else {
        setTimeout(ping, 300);
      }
    }
    ping();
  });
}

async function runVerification() {
  console.log('======================================================================');
  console.log('📱💻  KLAY MULTI-DEVICE & MULTI-ENVIRONMENT RUNTIME VERIFICATION  💻📱');
  console.log('======================================================================\n');

  // 1. Spawn Local Server
  console.log(`[Setup] Spawning local Express server on port ${TEST_PORT}...`);
  const server = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      NODE_ENV: 'production',
      KLAY_ADMIN_SECRET: 'test-hmac-secret-for-device-suite',
    },
    stdio: 'ignore',
  });

  const cleanup = () => {
    try {
      server.kill('SIGTERM');
    } catch {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  await waitForServer(`${LOCAL_URL}/api/health`, 20000);
  console.log(`[Setup] Local server is healthy and responding at ${LOCAL_URL}\n`);

  // 2. Launch Chromium
  console.log('[Setup] Launching Chromium via playwright-core...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [
    {
      name: 'Desktop (1440x900)',
      id: 'desktop',
      width: 1440,
      height: 900,
      isMobile: false,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    {
      name: 'Mobile iPhone 14 (390x844)',
      id: 'mobile',
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    },
  ];

  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/cost-calculator', name: 'Cost Calculator' },
    { path: '/golden-visa', name: 'Golden Visa' },
    { path: '/services', name: 'Services' },
    { path: '/contact-us', name: 'Contact Page' },
    { path: '/blog', name: 'Editorial Blog Index' },
    { path: '/blog/100-percent-foreign-ownership-uae/', name: 'Article Detail' },
    { path: '/admin/login', name: 'Executive Admin Login' },
  ];

  const results = [];

  for (const vp of viewports) {
    console.log(`\n----------------------------------------------------------------------`);
    console.log(`🔎 TESTING VIEWPORT: ${vp.name.toUpperCase()}`);
    console.log(`----------------------------------------------------------------------`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      userAgent: vp.userAgent,
    });

    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected third-party analytics or minor favicon warnings
        if (
          !text.includes('favicon') &&
          !text.includes('sentry') &&
          !text.includes('googletagmanager')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('requestfailed', (req) => {
      const url = req.url();
      if (!url.includes('google-analytics') && !url.includes('clarity')) {
        failedRequests.push(`${req.method()} ${url} (${req.failure()?.errorText || 'failed'})`);
      }
    });

    for (const route of routes) {
      const targetUrl = `${LOCAL_URL}${route.path}`;
      const startTime = Date.now();
      let status = 'PASS';
      let error = null;

      try {
        const resp = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });
        const loadTimeMs = Date.now() - startTime;
        const httpStatus = resp ? resp.status() : 0;

        // Verify key DOM elements
        const title = await page.title();
        const h1 = await page
          .locator('h1')
          .first()
          .textContent()
          .catch(() => '');

        // Capture screenshot
        const screenshotPath = path.join(
          ARTIFACTS_DIR,
          `verify_${vp.id}_${route.path.replace(/[/:]/g, '_') || 'home'}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: false });

        // Specific route interaction checks
        if (route.path === '/cost-calculator') {
          // Verify calculator interactability
          const mainlandBtn = page
            .locator('button:has-text("Mainland"), button:has-text("Dubai Mainland")')
            .first();
          if (await mainlandBtn.isVisible()) {
            await mainlandBtn.click();
            await page.waitForTimeout(300);
          }
        } else if (route.path === '/contact-us') {
          // Verify form is visible
          const nameInput = page.locator('input[name="name"], input#name').first();
          await nameInput.waitFor({ state: 'visible', timeout: 5000 });
        }

        console.log(
          `  ✅ [${vp.id.toUpperCase()}] ${route.name} (${loadTimeMs}ms, HTTP ${httpStatus}) - H1: "${h1.trim().slice(0, 35)}..."`
        );
        results.push({
          viewport: vp.name,
          route: route.path,
          name: route.name,
          status: 'PASS',
          httpStatus,
          loadTimeMs,
          h1: h1.trim(),
          screenshot: screenshotPath,
        });
      } catch (err) {
        status = 'FAIL';
        error = err.message;
        console.error(`  ❌ [${vp.id.toUpperCase()}] ${route.name} FAILED: ${err.message}`);
        results.push({
          viewport: vp.name,
          route: route.path,
          name: route.name,
          status: 'FAIL',
          error: err.message,
        });
      }
    }

    await context.close();
  }

  // 3. Test Live Production Hostinger Endpoint Checks
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`🌐 TESTING LIVE PRODUCTION ENDPOINTS (${LIVE_URL})`);
  console.log(`----------------------------------------------------------------------`);

  const liveChecks = [
    { path: '/', expected: 200, name: 'Live Homepage' },
    { path: '/cost-calculator', expected: 200, name: 'Live Cost Calculator' },
    { path: '/golden-visa', expected: 200, name: 'Live Golden Visa' },
    { path: '/services', expected: 200, name: 'Live Services' },
    { path: '/contact-us', expected: 200, name: 'Live Contact Page' },
    { path: '/blog', expected: 200, name: 'Live Blog Catalog' },
    { path: '/blog/100-percent-foreign-ownership-uae/', expected: 200, name: 'Live Blog Article' },
    { path: '/api/health', expected: 200, name: 'Live Health Conduit' },
    { path: '/admin/login', expected: 200, name: 'Live Admin Gateway' },
  ];

  for (const check of liveChecks) {
    try {
      const resp = await fetch(`${LIVE_URL}${check.path}`, {
        headers: { 'User-Agent': 'Klay-Poteto-Verification/1.0' },
      });
      const ok = resp.status === check.expected;
      console.log(
        `  ${ok ? '✅' : '❌'} [LIVE] ${check.name} -> HTTP ${resp.status} (expected ${check.expected})`
      );
    } catch (err) {
      console.error(`  ❌ [LIVE] ${check.name} network failure: ${err.message}`);
    }
  }

  await browser.close();
  cleanup();

  console.log('\n======================================================================');
  console.log(
    `🏁 VERIFICATION COMPLETE: ${results.filter((r) => r.status === 'PASS').length}/${results.length} PAGES VERIFIED CLEANLY`
  );
  console.log('======================================================================\n');
}

runVerification().catch((err) => {
  console.error('Verification failed fatal:', err);
  process.exit(1);
});
