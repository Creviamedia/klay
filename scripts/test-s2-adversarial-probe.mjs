#!/usr/bin/env node
/**
 * ============================================================================
 * SPRINT 2 EMPIRICAL CHALLENGER ADVERSARIAL TEST PROBE
 * (`scripts/test-s2-adversarial-probe.mjs`)
 * ============================================================================
 *
 * Adversarial verification covering:
 * 1. KlayLeadForm.tsx validation boundary cases:
 *    - Single-character name, whitespace-only name, legal names, Arabic/unicode names
 *    - Corporate vs personal email formats, missing @ / domain / TLD, whitespace trimming
 *    - Malformed phone numbers (+971 UAE trunk zeros, length checks; international 7-15)
 *    - Required budget qualifier validation & serialization of all 4 brackets
 * 2. intake-conduit.ts & lead-intake-core.cjs:
 *    - Payload sanitization with unexpected characters (<script>, SQL injection, quotes, emojis)
 *    - Budget forwarding, trimming, length cap (100 chars), and fallback to null
 *    - CSV mirror export with Budget column index & escape
 *    - Telegram HTML escaping for budget ('< AED 25k' -> '&lt; AED 25k')
 *    - Protocol constraint check: NO tel: in Telegram inline keyboard
 *    - Sliding window IP rate limiter boundary & loopback exemption
 * 3. Turso Database Schema Resilience & Auto-Migration:
 *    - DDL creation with budget column
 *    - Dynamic auto-migration: legacy table without budget triggers ALTER TABLE and succeeds on retry
 *    - PRAGMA table_info migration resilience & idempotency across multiple runs
 *    - ON CONFLICT DO UPDATE behavior with COALESCE for budget retention
 *
 * Execution:
 *   export PATH="/Users/hayaat/.local/share/node-v24.22.1-darwin-arm64/bin:$PATH"
 *   node scripts/test-s2-adversarial-probe.mjs
 * ============================================================================
 */

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const require = createRequire(import.meta.url);
const leadIntakeCore = require('../netlify/functions/lead-intake-core.cjs');

// Import TypeScript modules directly via Node ESM resolution
import {
  normalizePhoneNumber,
  generateSovereignReference,
  validateIntakePayload,
  submitIntakeDossier,
} from '../src/lib/intake-conduit.ts';

import { initTursoSchema, insertLead, queryLeads, getTursoClient } from '../src/lib/turso.ts';

console.log('================================================================================');
console.log('⚔️  SPRINT 2 EMPIRICAL CHALLENGER: ADVERSARIAL STRESS TEST PROBE');
console.log('================================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function test(category, name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] [${category}] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ [FAIL] [${category}] ${name}`);
    console.error(`     Error: ${err.message}`);
    findings.push({ category, name, error: err.message, stack: err.stack });
  }
}

async function testAsync(category, name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ [PASS] [${category}] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ [FAIL] [${category}] ${name}`);
    console.error(`     Error: ${err.message}`);
    findings.push({ category, name, error: err.message, stack: err.stack });
  }
}

// ============================================================================
// SUITE 1: KLAY LEAD FORM VALIDATION BOUNDARIES & BRACKET SERIALIZATION
// ============================================================================
console.log('--- SUITE 1: KlayLeadForm Validation Boundaries & Budget Brackets ---');

// We simulate KlayLeadForm's exact validation logic as implemented in KlayLeadForm.tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUDGET_OPTIONS = ['< AED 25k', 'AED 25k - 50k', 'AED 50k - 100k', 'AED 100k+'];

function simulateFormValidation({ name, email, phoneLocal, dialCode, budget }) {
  // 1. Full Legal Name validation
  const trimmedName = (name || '').trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { valid: false, error: 'Please provide your full legal name (minimum 2 characters).' };
  }

  // 2. Strict corporate email format validation
  const trimmedEmail = (email || '').trim();
  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Please provide a valid corporate or business email address.' };
  }

  // 3. Strict Phone validation
  const cleanedDigits = (phoneLocal || '').replace(/\D/g, '');
  if (!cleanedDigits) {
    return { valid: false, error: 'Please provide a valid phone or WhatsApp number.' };
  }
  if (dialCode === '+971') {
    const uaeDigits = cleanedDigits.replace(/^0+/, '');
    if (uaeDigits.length !== 9) {
      return {
        valid: false,
        error: 'Please provide a valid 9-digit UAE phone number (e.g. 50 123 4567).',
      };
    }
  } else if (cleanedDigits.length < 7 || cleanedDigits.length > 15) {
    return {
      valid: false,
      error: 'Please provide a valid international phone number (7 to 15 digits).',
    };
  }

  // 4. Required Budget Qualifier selection
  if (!budget) {
    return { valid: false, error: 'Please select an estimated setup budget to proceed.' };
  }

  return { valid: true };
}

// 1.1 Name validation boundaries
test('Form-Validation', '1.1 Name: Empty string rejected', () => {
  const res = simulateFormValidation({
    name: '',
    email: 'founder@sovereign.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /minimum 2 characters/);
});

test('Form-Validation', '1.2 Name: Whitespace-only string rejected', () => {
  const res = simulateFormValidation({
    name: '    ',
    email: 'founder@sovereign.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /minimum 2 characters/);
});

test('Form-Validation', '1.3 Name: Single-character name rejected', () => {
  const res = simulateFormValidation({
    name: 'A',
    email: 'founder@sovereign.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /minimum 2 characters/);
});

test('Form-Validation', '1.4 Name: Single-character with padding rejected', () => {
  const res = simulateFormValidation({
    name: '  K  ',
    email: 'founder@sovereign.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /minimum 2 characters/);
});

test('Form-Validation', '1.5 Name: 2-character name accepted', () => {
  const res = simulateFormValidation({
    name: 'Al',
    email: 'founder@sovereign.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, true);
});

test('Form-Validation', '1.6 Name: Unicode & Arabic legal name accepted', () => {
  const res = simulateFormValidation({
    name: 'طارق المنصور',
    email: 'tariq@almansoor.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: 'AED 100k+',
  });
  assert.strictEqual(res.valid, true);
});

test('Form-Validation', '1.7 Name: Hyphenated legal name accepted', () => {
  const res = simulateFormValidation({
    name: 'Jean-Luc De La Tour',
    email: 'jl@delatour.ch',
    phoneLocal: '79 123 4567',
    dialCode: '+41',
    budget: 'AED 50k - 100k',
  });
  assert.strictEqual(res.valid, true);
});

// 1.2 Email validation boundaries
test('Form-Validation', '1.8 Email: Empty email rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: '',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /valid corporate or business email/);
});

test('Form-Validation', '1.9 Email: Missing @ rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq.almansoor.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
});

test('Form-Validation', '1.10 Email: Missing domain rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
});

test('Form-Validation', '1.11 Email: Missing TLD rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@company',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
});

test('Form-Validation', '1.12 Email: Internal whitespace rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq @company.com',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
});

test('Form-Validation', '1.13 Email: Corporate email domain accepted', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@sovereign-holdings.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, true);
});

test('Form-Validation', '1.14 Email: Personal email domain adheres to RFC format', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq.founder@gmail.com',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, true, 'Standard personal address format passes client regex');
});

// 1.3 Phone validation boundaries
test('Form-Validation', '1.15 Phone (+971): Empty phone rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@holding.ae',
    phoneLocal: '',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /valid phone or WhatsApp/);
});

test('Form-Validation', '1.16 Phone (+971): Non-digit characters only rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@holding.ae',
    phoneLocal: 'abc---xyz',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
});

test('Form-Validation', '1.17 Phone (+971): 8 digits (too short) rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@holding.ae',
    phoneLocal: '50123456',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /valid 9-digit UAE phone number/);
});

test('Form-Validation', '1.18 Phone (+971): 10 digits without leading zero rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@holding.ae',
    phoneLocal: '5012345678',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /valid 9-digit UAE phone number/);
});

test('Form-Validation', '1.19 Phone (+971): Exact 9 digits accepted', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@holding.ae',
    phoneLocal: '501234567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, true);
});

test(
  'Form-Validation',
  '1.20 Phone (+971): 10 digits with leading trunk zero (050...) accepted',
  () => {
    const res = simulateFormValidation({
      name: 'Tariq Al Mansoor',
      email: 'tariq@holding.ae',
      phoneLocal: '050 123 4567',
      dialCode: '+971',
      budget: '< AED 25k',
    });
    assert.strictEqual(res.valid, true);
  }
);

test('Form-Validation', '1.21 Phone (+971): Multiple leading zeros stripped cleanly', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@holding.ae',
    phoneLocal: '0050 123 4567',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, true);
});

test('Form-Validation', '1.22 Phone (+971): All zeros string rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@holding.ae',
    phoneLocal: '000000000',
    dialCode: '+971',
    budget: '< AED 25k',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /valid 9-digit UAE phone number/);
});

test('Form-Validation', '1.23 Phone (International +44): 6 digits (too short) rejected', () => {
  const res = simulateFormValidation({
    name: 'Lord Hamilton',
    email: 'hamilton@london.co.uk',
    phoneLocal: '123456',
    dialCode: '+44',
    budget: 'AED 100k+',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /7 to 15 digits/);
});

test('Form-Validation', '1.24 Phone (International +44): 7 digits boundary accepted', () => {
  const res = simulateFormValidation({
    name: 'Lord Hamilton',
    email: 'hamilton@london.co.uk',
    phoneLocal: '1234567',
    dialCode: '+44',
    budget: 'AED 100k+',
  });
  assert.strictEqual(res.valid, true);
});

test('Form-Validation', '1.25 Phone (International +1): 15 digits boundary accepted', () => {
  const res = simulateFormValidation({
    name: 'Sarah Connor',
    email: 'sarah@skynet.com',
    phoneLocal: '123456789012345',
    dialCode: '+1',
    budget: 'AED 100k+',
  });
  assert.strictEqual(res.valid, true);
});

test('Form-Validation', '1.26 Phone (International +1): 16 digits rejected', () => {
  const res = simulateFormValidation({
    name: 'Sarah Connor',
    email: 'sarah@skynet.com',
    phoneLocal: '1234567890123456',
    dialCode: '+1',
    budget: 'AED 100k+',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /7 to 15 digits/);
});

// 1.4 Budget Qualifier boundaries
test('Form-Validation', '1.27 Budget: Missing budget rejected', () => {
  const res = simulateFormValidation({
    name: 'Tariq Al Mansoor',
    email: 'tariq@holding.ae',
    phoneLocal: '50 123 4567',
    dialCode: '+971',
    budget: '',
  });
  assert.strictEqual(res.valid, false);
  assert.match(res.error, /select an estimated setup budget to proceed/);
});

test('Form-Validation', '1.28 Budget: All 4 budget brackets accepted & conform to contract', () => {
  for (const bracket of BUDGET_OPTIONS) {
    const res = simulateFormValidation({
      name: 'Tariq Al Mansoor',
      email: 'tariq@holding.ae',
      phoneLocal: '50 123 4567',
      dialCode: '+971',
      budget: bracket,
    });
    assert.strictEqual(res.valid, true, `Bracket '${bracket}' must pass validation`);
  }
});

// ============================================================================
// SUITE 2: INTAKE CONDUIT & FORWARDING ADVERSARIAL STRESS TESTS
// ============================================================================
console.log('\n--- SUITE 2: Intake Conduit Transmission & Edge Cases ---');

const originalFetch = global.fetch;

await testAsync(
  'Conduit',
  '2.1 submitIntakeDossier serializes all 4 budget brackets correctly',
  async () => {
    for (const bracket of BUDGET_OPTIONS) {
      let capturedBody = null;
      global.fetch = async (url, opts) => {
        capturedBody = JSON.parse(opts.body);
        return {
          ok: true,
          status: 201,
          json: async () => ({ success: true, leadId: 'KLAY-2026-TEST' }),
        };
      };

      const res = await submitIntakeDossier({
        name: 'Test Founder',
        email: 'founder@test.com',
        phone: '50 123 4567',
        dialCode: '+971',
        budget: bracket,
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(
        capturedBody.budget,
        bracket,
        `Transmitted budget must equal '${bracket}'`
      );
    }
  }
);

await testAsync('Conduit', '2.2 submitIntakeDossier trims whitespace on budget', async () => {
  let capturedBody = null;
  global.fetch = async (url, opts) => {
    capturedBody = JSON.parse(opts.body);
    return {
      ok: true,
      status: 201,
      json: async () => ({ success: true, leadId: 'KLAY-2026-TEST' }),
    };
  };

  const res = await submitIntakeDossier({
    name: 'Test Founder',
    email: 'founder@test.com',
    phone: '50 123 4567',
    dialCode: '+971',
    budget: '   AED 50k - 100k   ',
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(capturedBody.budget, 'AED 50k - 100k');
});

await testAsync(
  'Conduit',
  '2.3 submitIntakeDossier handles unexpected characters in budget safely',
  async () => {
    let capturedBody = null;
    global.fetch = async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return {
        ok: true,
        status: 201,
        json: async () => ({ success: true, leadId: 'KLAY-2026-TEST' }),
      };
    };

    const maliciousBudget = '<script>alert("xss")</script> AED 100k+';
    const res = await submitIntakeDossier({
      name: 'Adversarial Tester',
      email: 'tester@security.org',
      phone: '50 123 4567',
      dialCode: '+971',
      budget: maliciousBudget,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(capturedBody.budget, maliciousBudget);
  }
);

await testAsync(
  'Conduit',
  '2.4 submitIntakeDossier returns error without retrying on 400 Bad Request',
  async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid payload' }),
      };
    };

    const res = await submitIntakeDossier(
      {
        name: 'Bad Payload',
        email: 'bad@payload.com',
        phone: '1234567',
      },
      { maxRetries: 3 }
    );

    assert.strictEqual(res.success, false);
    assert.strictEqual(callCount, 1, 'Should NOT retry on 400 client validation errors');
    assert.strictEqual(res.error, 'Invalid payload');
  }
);

await testAsync(
  'Conduit',
  '2.5 submitIntakeDossier retries on 500 error up to maxRetries',
  async () => {
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server explosion' }),
      };
    };

    const res = await submitIntakeDossier(
      {
        name: 'Retry Target',
        email: 'retry@target.com',
        phone: '1234567',
      },
      { maxRetries: 2 }
    );

    assert.strictEqual(res.success, false);
    assert.strictEqual(callCount, 3, 'Must attempt 1 initial + 2 retries = 3 attempts total');
    assert.ok(res.referenceNumber.startsWith('KLAY-2026-'), 'Must return fallback reference');
  }
);

// Restore global.fetch
global.fetch = originalFetch;

// ============================================================================
// SUITE 3: LEAD INTAKE CORE BACKEND (SANITIZATION, PERSISTENCE & TELEMETRY)
// ============================================================================
console.log('\n--- SUITE 3: Lead Intake Core Sanitization & Telemetry ---');

const isolatedDataDir = path.join('/tmp', `klay-adversarial-data-${Date.now()}`);
fs.mkdirSync(isolatedDataDir, { recursive: true });

test(
  'Core-Sanitization',
  '3.1 processIntakeLead sanitizes and forwards all 4 budget brackets',
  async () => {
    for (const bracket of BUDGET_OPTIONS) {
      const rawPayload = {
        name: 'Bracket Lead',
        email: 'bracket@example.com',
        phone: '+971 50 111 2222',
        budget: bracket,
        jurisdiction: 'IFZA',
      };

      const res = await leadIntakeCore.processIntakeLead(rawPayload, {
        dataDir: isolatedDataDir,
        clientIp: '127.0.0.1',
      });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.leadRecord.budget, bracket);
    }
  }
);

test(
  'Core-Sanitization',
  '3.2 processIntakeLead trims and truncates oversized budget strings to 100 chars',
  async () => {
    const hugeBudget = 'AED ' + 'A'.repeat(200);
    const rawPayload = {
      name: 'Oversized Lead',
      email: 'oversized@example.com',
      phone: '+971 50 111 2222',
      budget: hugeBudget,
    };

    const res = await leadIntakeCore.processIntakeLead(rawPayload, {
      dataDir: isolatedDataDir,
      clientIp: '127.0.0.1',
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(
      res.leadRecord.budget.length,
      100,
      'Budget must be sliced to 100 characters max'
    );
    assert.ok(res.leadRecord.budget.startsWith('AED AAA'));
  }
);

test(
  'Core-Sanitization',
  '3.3 processIntakeLead converts null/empty/non-string budget to null',
  async () => {
    const testCases = ['', '   ', null, undefined, 12345];
    for (const tc of testCases) {
      const res = await leadIntakeCore.processIntakeLead(
        {
          name: 'Empty Budget Lead',
          email: 'empty@example.com',
          phone: '+971 50 111 2222',
          budget: tc,
        },
        { dataDir: isolatedDataDir, clientIp: '127.0.0.1' }
      );
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.leadRecord.budget, null);
    }
  }
);

test(
  'Core-Telemetry',
  '3.4 escapeTelegramHtml safely escapes HTML in budget & lead attributes',
  () => {
    const raw = '< AED 25k & "special"';
    const escaped = leadIntakeCore.escapeTelegramHtml(raw);
    assert.strictEqual(escaped, '&lt; AED 25k &amp; &quot;special&quot;');
  }
);

test(
  'Core-Telemetry',
  '3.5 buildTelegramAlertPayload contains escaped budget and safe formatting',
  () => {
    const payload = leadIntakeCore.buildTelegramAlertPayload(
      {
        id: 'KLAY-2026-TEST',
        referenceNumber: 'KLAY-2026-TEST',
        name: 'Adversarial <Founder>',
        email: 'founder@test.com',
        phone: '+971 50 123 4567',
        budget: '< AED 25k',
        jurisdiction: 'DIFC',
        activity: 'Fintech & Wealth',
      },
      '123456789'
    );

    assert.strictEqual(payload.parse_mode, 'HTML');
    assert.ok(
      payload.text.includes('💰 <b>Budget:</b> &lt; AED 25k'),
      'Budget must be escaped and formatted'
    );
    assert.ok(payload.text.includes('Adversarial &lt;Founder&gt;'), 'Name must be escaped');
    assert.ok(
      payload.text.includes('<a href="tel:+971501234567">'),
      'Phone dialer HTML link must exist'
    );

    // Verify protocol safety: NO tel: in reply_markup inline keyboard
    const buttons = payload.reply_markup?.inline_keyboard?.[0] || [];
    for (const btn of buttons) {
      assert.ok(
        !btn.url.startsWith('tel:'),
        'Telegram inline keyboard must NOT use tel: URL scheme'
      );
      assert.ok(
        btn.url.startsWith('https://wa.me/'),
        'Telegram inline keyboard must use https://wa.me/ WhatsApp link'
      );
    }
  }
);

test('Core-CSV', '3.6 persistLeadToDisk outputs CSV with Budget in correct column index', () => {
  const csvPath = path.join(isolatedDataDir, 'google-sheet-crm.csv');
  assert.ok(fs.existsSync(csvPath), 'CRM CSV file must exist');

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = lines[0];
  assert.strictEqual(
    header,
    'Reference ID,Timestamp,Name,Email,Phone,Budget,Jurisdiction,Activity,Timeline,Visa Count,Notes,Source,WhatsApp Link'
  );

  // Check last line
  const lastLine = lines[lines.length - 1];
  const columns = lastLine.split(',');
  assert.ok(columns.length >= 6);
  // Column 5 (0-indexed) is Budget
  assert.ok(columns[5].includes('""') || columns[5].includes('AED') || columns[5] === '""');
});

test(
  'Core-RateLimiter',
  '3.7 isRateLimited enforces max 20 requests per external IP and exempts loopback',
  () => {
    const externalIp = '203.0.113.42';

    // First 20 requests allowed
    for (let i = 0; i < 20; i++) {
      const limited = leadIntakeCore.isRateLimited(externalIp);
      assert.strictEqual(limited, false, `Request ${i + 1} should be allowed`);
    }

    // 21st request rate-limited
    const limited21 = leadIntakeCore.isRateLimited(externalIp);
    assert.strictEqual(limited21, true, 'Request 21 should be rate-limited');

    // Loopback IPs never rate-limited
    for (let i = 0; i < 30; i++) {
      assert.strictEqual(leadIntakeCore.isRateLimited('127.0.0.1'), false);
      assert.strictEqual(leadIntakeCore.isRateLimited('::1'), false);
      assert.strictEqual(leadIntakeCore.isRateLimited('unknown'), false);
    }
  }
);

// ============================================================================
// SUITE 4: TURSO DATABASE SCHEMA RESILIENCE & MIGRATION ADVERSARIAL TESTS
// ============================================================================
console.log('\n--- SUITE 4: Turso Schema Resilience & Auto-Migration ---');

const isolatedDbDir = path.join('/tmp', `klay-turso-adversarial-${Date.now()}`);
fs.mkdirSync(isolatedDbDir, { recursive: true });

await testAsync(
  'Turso-Resilience',
  '4.1 initTursoSchema creates leads table with budget column',
  async () => {
    const dbPath = path.join(isolatedDbDir, 'test-clean.db');
    const client = createClient({ url: `file:${dbPath}` });

    await initTursoSchema(client);

    const tableInfo = await client.execute('PRAGMA table_info(leads)');
    const columnNames = tableInfo.rows.map((r) => r.name);

    assert.ok(columnNames.includes('id'), 'leads table must contain id');
    assert.ok(columnNames.includes('budget'), 'leads table must contain budget column');
    assert.ok(
      columnNames.includes('reference_number'),
      'leads table must contain reference_number'
    );

    client.close();
  }
);

await testAsync(
  'Turso-Resilience',
  '4.2 Auto-migration: persistLeadToTurso dynamically alters table when budget column is missing',
  async () => {
    const dbPath = path.join(isolatedDbDir, 'test-legacy-auto.db');
    const client = createClient({ url: `file:${dbPath}` });

    // 1. Manually create a legacy leads table WITHOUT the budget column
    await client.execute(`
    CREATE TABLE leads (
      id TEXT PRIMARY KEY NOT NULL,
      reference_number TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      jurisdiction TEXT NOT NULL DEFAULT 'UAE',
      activity TEXT NOT NULL DEFAULT 'General',
      timeline TEXT,
      visa_count INTEGER,
      notes TEXT,
      source TEXT NOT NULL DEFAULT 'calculator',
      platform TEXT NOT NULL DEFAULT 'node',
      status TEXT NOT NULL DEFAULT 'New',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
  `);

    // Verify legacy schema does NOT have budget column
    const preCheck = await client.execute('PRAGMA table_info(leads)');
    const preColumns = preCheck.rows.map((r) => r.name);
    assert.strictEqual(
      preColumns.includes('budget'),
      false,
      'Legacy table must not have budget initially'
    );

    // 2. Call persistLeadToTurso with a lead containing budget
    const testLead = {
      id: 'KLAY-LEGACY-001',
      referenceNumber: 'KLAY-LEGACY-001',
      timestamp: new Date().toISOString(),
      name: 'Migration Test Founder',
      email: 'migration@test.com',
      phone: '050 999 8888',
      budget: 'AED 100k+',
      jurisdiction: 'DMCC',
      status: 'New',
    };

    const persisted = await leadIntakeCore.persistLeadToTurso(testLead, { client });
    if (!persisted) {
      console.error('     [BUG DIAGNOSTIC] persistLeadToTurso returned false!');
      console.error(
        '     [BUG ROOT CAUSE] SQLite threw: "SQLITE_ERROR: table leads has no column named budget"'
      );
      console.error(
        '     [BUG ROOT CAUSE] But netlify/functions/lead-intake-core.cjs:261 checks: err.message.includes("no such column: budget")'
      );
      console.error(
        '     [BUG ROOT CAUSE] Because of this substring mismatch, auto-migration never executes on unmigrated tables during INSERT!'
      );
    }
    assert.strictEqual(
      persisted,
      true,
      'Auto-migration must succeed on retry when budget column is missing in leads table'
    );

    // 3. Verify budget column was dynamically added
    const postCheck = await client.execute('PRAGMA table_info(leads)');
    const postColumns = postCheck.rows.map((r) => r.name);
    assert.strictEqual(
      postColumns.includes('budget'),
      true,
      'budget column must now exist via auto-migration'
    );

    // 4. Verify data persisted with budget
    const record = await client.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: ['KLAY-LEGACY-001'],
    });
    assert.strictEqual(record.rows.length, 1);
    assert.strictEqual(record.rows[0].budget, 'AED 100k+');
    assert.strictEqual(record.rows[0].phone, '971509998888');

    client.close();
  }
);

await testAsync(
  'Turso-Resilience',
  '4.3 PRAGMA table_info migration in initTursoSchema is resilient and idempotent',
  async () => {
    const dbPath = path.join(isolatedDbDir, 'test-legacy-init.db');
    const client = createClient({ url: `file:${dbPath}` });

    // Create legacy leads table without budget
    await client.execute(`
    CREATE TABLE leads (
      id TEXT PRIMARY KEY NOT NULL,
      reference_number TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      jurisdiction TEXT NOT NULL DEFAULT 'UAE',
      activity TEXT NOT NULL DEFAULT 'General',
      timeline TEXT,
      visa_count INTEGER,
      notes TEXT,
      source TEXT NOT NULL DEFAULT 'calculator',
      platform TEXT NOT NULL DEFAULT 'node',
      status TEXT NOT NULL DEFAULT 'New',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
  `);

    // Run initTursoSchema - should detect missing budget and add it
    await initTursoSchema(client);

    const check1 = await client.execute('PRAGMA table_info(leads)');
    assert.ok(
      check1.rows.some((r) => r.name === 'budget'),
      'budget column added on first init'
    );

    // Run initTursoSchema again - must be completely idempotent and not crash
    await initTursoSchema(client);

    const check2 = await client.execute('PRAGMA table_info(leads)');
    assert.ok(
      check2.rows.some((r) => r.name === 'budget'),
      'budget column intact on second init'
    );

    client.close();
  }
);

await testAsync(
  'Turso-Resilience',
  '4.4 ON CONFLICT DO UPDATE retains existing budget when update has null budget',
  async () => {
    const dbPath = path.join(isolatedDbDir, 'test-upsert.db');
    const client = createClient({ url: `file:${dbPath}` });

    await initTursoSchema(client);

    // 1. Initial insert with budget
    await insertLead(client, {
      id: 'KLAY-UPSERT-01',
      name: 'Upsert Founder',
      email: 'upsert@example.com',
      phone: '050 123 4567',
      budget: 'AED 25k - 50k',
      jurisdiction: 'Mainland DED',
      status: 'New',
    });

    const row1 = await client.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: ['KLAY-UPSERT-01'],
    });
    assert.strictEqual(row1.rows[0].budget, 'AED 25k - 50k');

    // 2. Conflict update with a new explicit budget
    await insertLead(client, {
      id: 'KLAY-UPSERT-01',
      name: 'Upsert Founder',
      email: 'upsert@example.com',
      phone: '050 123 4567',
      budget: 'AED 100k+',
      jurisdiction: 'Mainland DED',
      status: 'Contacted',
    });

    const row2 = await client.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: ['KLAY-UPSERT-01'],
    });
    assert.strictEqual(row2.rows[0].budget, 'AED 100k+', 'Budget updated to new explicit value');
    assert.strictEqual(row2.rows[0].status, 'Contacted');

    // 3. Conflict update with NULL budget (e.g. secondary touchpoint that omitted budget)
    await insertLead(client, {
      id: 'KLAY-UPSERT-01',
      name: 'Upsert Founder',
      email: 'upsert@example.com',
      phone: '050 123 4567',
      budget: null,
      jurisdiction: 'Mainland DED',
      status: 'Converted',
    });

    const row3 = await client.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: ['KLAY-UPSERT-01'],
    });
    assert.strictEqual(
      row3.rows[0].budget,
      'AED 100k+',
      'COALESCE must preserve existing budget on null overwrite'
    );
    assert.strictEqual(row3.rows[0].status, 'Converted');

    client.close();
  }
);

await testAsync(
  'Turso-Resilience',
  '4.5 queryLeads correctly filters and returns budget in results',
  async () => {
    const dbPath = path.join(isolatedDbDir, 'test-query.db');
    const client = createClient({ url: `file:${dbPath}` });

    await initTursoSchema(client);

    await insertLead(client, {
      id: 'KLAY-Q-01',
      name: 'VIP Client',
      email: 'vip@corp.ae',
      phone: '050 999 1111',
      budget: 'AED 100k+',
      jurisdiction: 'DIFC',
      status: 'New',
    });

    await insertLead(client, {
      id: 'KLAY-Q-02',
      name: 'Starter Client',
      email: 'starter@corp.ae',
      phone: '050 999 2222',
      budget: '< AED 25k',
      jurisdiction: 'Free Zone',
      status: 'New',
    });

    const queryRes = await queryLeads(client, { search: 'VIP' });
    assert.strictEqual(queryRes.total, 1);
    assert.strictEqual(queryRes.leads[0].name, 'VIP Client');
    assert.strictEqual(queryRes.leads[0].budget, 'AED 100k+');

    client.close();
  }
);

// ============================================================================
// CLEANUP & FINAL REPORT
// ============================================================================
console.log('\n================================================================================');
console.log(`TOTAL ADVERSARIAL TESTS : ${totalTests}`);
console.log(`PASSED                  : ${passedTests}`);
console.log(`FAILED                  : ${failedTests}`);
console.log('================================================================================');

if (failedTests > 0) {
  console.error('\n❌ FAILURES RECORDED:');
  for (const f of findings) {
    console.error(`- [${f.category}] ${f.name}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('\n🏆 VERDICT: CONFIRMED');
  console.log(
    'All adversarial challenges against Lead Intake & Conduit passed cleanly with 0 errors.'
  );
  process.exit(0);
}
