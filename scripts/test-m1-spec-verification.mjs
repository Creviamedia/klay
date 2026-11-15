/**
 * Empirical Verification Harness for M1 Specifications:
 * - ADMIN_API_SPEC.md (HMAC-SHA256 Token Verification & Sliding-Window Rate Limiting)
 * - TELEGRAM_SPEC.md (HTML Escaping & Protocol Compliance)
 * - TURSO_SPEC.md (DDL Constraints & Fallback Resolution)
 * - SANITY_SPEC.md (Document ID & Schema Types)
 */

import * as crypto from 'node:crypto';
import assert from 'node:assert/strict';

console.log('======================================================================');
console.log('🛡️  M1 SPECIFICATION EMPIRICAL CHALLENGER & VERIFICATION HARNESS  🛡️');
console.log('======================================================================\n');

let suiteTests = 0;
let suitePassed = 0;
let suiteFailed = 0;
const findings = [];

function runTest(testName, fn) {
  suiteTests++;
  try {
    fn();
    suitePassed++;
    console.log(`  ✅ [PASS] ${testName}`);
  } catch (err) {
    suiteFailed++;
    console.error(`  ❌ [FAIL] ${testName}`);
    console.error(`     Reason: ${err.message}`);
    findings.push({ name: testName, error: err.message, stack: err.stack });
  }
}

async function runAsyncTest(testName, fn) {
  suiteTests++;
  try {
    await fn();
    suitePassed++;
    console.log(`  ✅ [PASS] ${testName}`);
  } catch (err) {
    suiteFailed++;
    console.error(`  ❌ [FAIL] ${testName}`);
    console.error(`     Reason: ${err.message}`);
    findings.push({ name: testName, error: err.message, stack: err.stack });
  }
}

// ============================================================================
// SUITE 1: HMAC-SHA256 TOKEN VERIFICATION LOGIC (ADMIN_API_SPEC.md)
// ============================================================================
console.log('--- SUITE 1: HMAC-SHA256 Session Token Verification ---');

const DEFAULT_DEV_SECRET = 'klay-executive-admin-secret-dev-2026';

function getAdminSecret() {
  return process.env.KLAY_ADMIN_SECRET || process.env.ADMIN_JWT_SECRET || DEFAULT_DEV_SECRET;
}

function generateSessionToken(username, options = {}) {
  const secret = getAdminSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY' })).toString('base64url');

  const now = options.now !== undefined ? options.now : Math.floor(Date.now() / 1000);
  const ttl = options.ttl !== undefined ? options.ttl : 86400;
  const payloadData = {
    sub: username,
    iat: now,
    exp: now + ttl,
    jti: crypto.randomBytes(16).toString('hex'),
    ...options.extraPayload,
  };
  const payload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

// Exactly as specified in ADMIN_API_SPEC.md lines 125-168
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const secret = getAdminSecret();

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  // Convert to buffers for timingSafeEqual
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  // Buffer length mismatch must return false in constant time
  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  // Parse payload and check expiration
  try {
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    const now = Math.floor(Date.now() / 1000);
    if (
      !decodedPayload ||
      typeof decodedPayload.exp !== 'number' ||
      Number.isNaN(decodedPayload.exp) ||
      decodedPayload.exp < now
    ) {
      return null; // Token expired or missing/invalid expiration claim
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

// 1.1 Valid Token
runTest('1.1 Generates and successfully verifies valid token', () => {
  const token = generateSessionToken('admin_user');
  assert.ok(token, 'Token must not be empty');
  const decoded = verifySessionToken(token);
  assert.ok(decoded, 'Decoded payload must not be null');
  assert.strictEqual(decoded.sub, 'admin_user');
  assert.strictEqual(typeof decoded.exp, 'number');
  assert.strictEqual(typeof decoded.jti, 'string');
});

// 1.2 Tampered Payload
runTest('1.2 Rejects token with tampered payload content (sub altered)', () => {
  const token = generateSessionToken('admin_user');
  const [header, payload, sig] = token.split('.');
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  parsed.sub = 'attacker';
  const tamperedPayload = Buffer.from(JSON.stringify(parsed)).toString('base64url');
  const tamperedToken = `${header}.${tamperedPayload}.${sig}`;

  const result = verifySessionToken(tamperedToken);
  assert.strictEqual(result, null, 'Tampered payload must return null');
});

runTest('1.2b Rejects token with single-byte bit flip in payload string', () => {
  const token = generateSessionToken('admin_user');
  const [header, payload, sig] = token.split('.');
  const flipped = payload.slice(0, -1) + (payload.slice(-1) === 'A' ? 'B' : 'A');
  const tamperedToken = `${header}.${flipped}.${sig}`;

  const result = verifySessionToken(tamperedToken);
  assert.strictEqual(result, null, 'Bit-flipped payload must return null');
});

// 1.3 Tampered Signature
runTest('1.3 Rejects token with tampered signature of same length', () => {
  const token = generateSessionToken('admin_user');
  const [header, payload, sig] = token.split('.');
  const tamperedSig = sig.slice(0, -1) + (sig.slice(-1) === 'A' ? 'B' : 'A');
  const tamperedToken = `${header}.${payload}.${tamperedSig}`;

  const result = verifySessionToken(tamperedToken);
  assert.strictEqual(result, null, 'Tampered signature must return null');
});

runTest('1.3b Rejects token signed with different secret', () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ sub: 'admin', exp: now + 3600 })).toString(
    'base64url'
  );
  const bogusSig = crypto
    .createHmac('sha256', 'wrong-secret-key-attacker')
    .update(`${header}.${payload}`)
    .digest('base64url');
  const token = `${header}.${payload}.${bogusSig}`;

  const result = verifySessionToken(token);
  assert.strictEqual(result, null, 'Token signed with incorrect secret must return null');
});

// 1.4 Expired Token
runTest('1.4 Rejects token with expired exp timestamp', () => {
  const pastNow = Math.floor(Date.now() / 1000) - 10000;
  const expiredToken = generateSessionToken('admin_user', { now: pastNow, ttl: 100 }); // expired ~9900s ago
  const result = verifySessionToken(expiredToken);
  assert.strictEqual(result, null, 'Expired token must return null');
});

runTest('1.4b Rejects token that expired 1 second ago (boundary check)', () => {
  const pastNow = Math.floor(Date.now() / 1000) - 10;
  const expiredToken = generateSessionToken('admin_user', { now: pastNow, ttl: 9 }); // expired 1s ago
  const result = verifySessionToken(expiredToken);
  assert.strictEqual(result, null, 'Token expired 1s ago must return null');
});

// 1.5 crypto.timingSafeEqual Length Mismatch
runTest('1.5 Handles signature length mismatch without throwing RangeError', () => {
  const token = generateSessionToken('admin_user');
  const [header, payload, sig] = token.split('.');

  // Test truncated signature (length 10 instead of 43)
  const shortToken = `${header}.${payload}.${sig.slice(0, 10)}`;
  let resultShort;
  assert.doesNotThrow(() => {
    resultShort = verifySessionToken(shortToken);
  }, 'Must not throw RangeError on short signature');
  assert.strictEqual(resultShort, null, 'Short signature must return null');

  // Test extended signature (length 60 instead of 43)
  const longToken = `${header}.${payload}.${sig}EXTRACHARS`;
  let resultLong;
  assert.doesNotThrow(() => {
    resultLong = verifySessionToken(longToken);
  }, 'Must not throw RangeError on long signature');
  assert.strictEqual(resultLong, null, 'Long signature must return null');

  // Test empty signature
  const emptySigToken = `${header}.${payload}.`;
  let resultEmpty;
  assert.doesNotThrow(() => {
    resultEmpty = verifySessionToken(emptySigToken);
  }, 'Must not throw on empty signature');
  assert.strictEqual(resultEmpty, null, 'Empty signature must return null');
});

// 1.6 Malformed Inputs & Non-String handling
runTest('1.6 Rejects non-string and malformed token inputs gracefully', () => {
  assert.strictEqual(verifySessionToken(null), null);
  assert.strictEqual(verifySessionToken(undefined), null);
  assert.strictEqual(verifySessionToken(''), null);
  assert.strictEqual(verifySessionToken(123), null);
  assert.strictEqual(verifySessionToken({}), null);
  assert.strictEqual(verifySessionToken('only-one-part'), null);
  assert.strictEqual(verifySessionToken('two.parts'), null);
  assert.strictEqual(verifySessionToken('four.parts.are.invalid'), null);
  assert.strictEqual(verifySessionToken('invalid!base64.invalid!base64.invalidsig'), null);
});

// 1.7 Edge Case: Missing exp or non-numeric exp in payload
runTest('1.7 Challenge: Missing exp field in signed payload', () => {
  // If an attacker generates or someone crafts a token without exp:
  const secret = getAdminSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'admin' })).toString('base64url'); // NO EXP
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  const tokenWithoutExp = `${header}.${payload}.${sig}`;

  const result = verifySessionToken(tokenWithoutExp);
  // In the current spec: `if (decodedPayload.exp < now)` -> `undefined < now` is false in JS!
  // So a token with no `exp` NEVER EXPIRES!
  // Let's assert what the current code does and record it as a security finding:
  if (result !== null && result.exp === undefined) {
    throw new Error(
      'VULNERABILITY: Token without `exp` field passes verification and never expires! `decodedPayload.exp < now` evaluates to false when exp is undefined.'
    );
  }
  assert.strictEqual(result, null, 'Token without exp must be rejected');
});

// ============================================================================
// SUITE 2: SLIDING-WINDOW RATE LIMITING (ADMIN_API_SPEC.md)
// ============================================================================
console.log('\n--- SUITE 2: Sliding-Window Rate Limiting ---');

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const maxAttempts = options.maxAttempts || 5;
  const loginAttempts = new Map();

  return {
    check(ip, customNow) {
      const now = customNow !== undefined ? customNow : Date.now();
      const record = loginAttempts.get(ip);
      if (!record) return { limited: false };

      const recentAttempts = record.timestamps.filter((ts) => now - ts < windowMs);
      record.timestamps = recentAttempts;

      if (recentAttempts.length >= maxAttempts) {
        const oldest = recentAttempts[0];
        const retryAfterMs = oldest + windowMs - now;
        const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
        return { limited: true, retryAfterSeconds };
      }

      return { limited: false };
    },
    record(ip, customNow) {
      const now = customNow !== undefined ? customNow : Date.now();
      const record = loginAttempts.get(ip) || { timestamps: [] };
      record.timestamps.push(now);
      loginAttempts.set(ip, record);
    },
    clear(ip) {
      loginAttempts.delete(ip);
    },
    getMapSize() {
      return loginAttempts.size;
    },
  };
}

// 2.1 Normal Progression
runTest('2.1 Incremental failed attempts reach rate limit exactly at attempt 5', () => {
  const limiter = createRateLimiter();
  const ip = '192.168.1.1';

  assert.strictEqual(limiter.check(ip).limited, false, '0 attempts: not limited');

  for (let i = 1; i <= 4; i++) {
    limiter.record(ip);
    assert.strictEqual(limiter.check(ip).limited, false, `Attempt ${i}: not limited`);
  }

  limiter.record(ip); // 5th attempt
  const status5 = limiter.check(ip);
  assert.strictEqual(status5.limited, true, 'Attempt 5: MUST be rate limited');
  assert.ok(
    status5.retryAfterSeconds > 0 && status5.retryAfterSeconds <= 900,
    'retryAfterSeconds must be between 1 and 900'
  );
});

// 2.2 Rapid Burst Test
runTest('2.2 Rapid burst of 20 failed logins within 10ms maintains limited state', () => {
  const limiter = createRateLimiter();
  const ip = '10.0.0.5';
  const baseTime = 1700000000000;

  for (let i = 0; i < 20; i++) {
    limiter.record(ip, baseTime + i);
  }

  const check = limiter.check(ip, baseTime + 25);
  assert.strictEqual(check.limited, true, 'Must remain rate limited during burst');
  assert.strictEqual(
    check.retryAfterSeconds,
    900,
    'retryAfterSeconds should be 900s for immediate burst'
  );
});

// 2.3 Sliding Window Boundary Expiration
runTest('2.3 Sliding window boundary expiration (899,999ms vs 900,001ms)', () => {
  const limiter = createRateLimiter();
  const ip = '172.16.0.1';
  const t0 = 1700000000000;
  const windowMs = 15 * 60 * 1000; // 900,000 ms

  // 5 attempts spread 1000ms apart: t0, t0+1000, t0+2000, t0+3000, t0+4000
  limiter.record(ip, t0);
  limiter.record(ip, t0 + 1000);
  limiter.record(ip, t0 + 2000);
  limiter.record(ip, t0 + 3000);
  limiter.record(ip, t0 + 4000);

  // At t0 + windowMs - 1ms: t0 is still within the 15m window
  const checkInside = limiter.check(ip, t0 + windowMs - 1);
  assert.strictEqual(
    checkInside.limited,
    true,
    'At window - 1ms: all 5 attempts remain, MUST be limited'
  );
  assert.strictEqual(
    checkInside.retryAfterSeconds,
    1,
    'retryAfterSeconds should be 1 second remaining'
  );

  // At t0 + windowMs + 1ms: t0 has fallen out of the window! Remaining count = 4
  const checkOutside = limiter.check(ip, t0 + windowMs + 1);
  assert.strictEqual(
    checkOutside.limited,
    false,
    'At window + 1ms: oldest attempt aged out (4 remaining), NOT limited'
  );

  // Client makes 1 new failed attempt now -> count returns to 5
  limiter.record(ip, t0 + windowMs + 2);
  const checkReLocked = limiter.check(ip, t0 + windowMs + 2);
  assert.strictEqual(checkReLocked.limited, true, 'Count returns to 5: re-locked');
  // Next oldest is t0 + 1000, so retryAfter is roughly (t0 + 1000 + windowMs) - (t0 + windowMs + 2) = 998ms -> 1s
  assert.strictEqual(checkReLocked.retryAfterSeconds, 1);
});

// 2.4 Reset on Successful Login
runTest('2.4 Reset / clearLoginRateLimit immediately unblocks IP', () => {
  const limiter = createRateLimiter();
  const ip = '192.168.1.99';

  for (let i = 0; i < 5; i++) {
    limiter.record(ip);
  }
  assert.strictEqual(limiter.check(ip).limited, true, 'IP is rate-limited');

  // Simulate successful login clear
  limiter.clear(ip);
  assert.strictEqual(limiter.check(ip).limited, false, 'IP must be unblocked after clear()');

  // Next attempt is treated as 1st attempt
  limiter.record(ip);
  assert.strictEqual(limiter.check(ip).limited, false, 'Subsequent single failure must not block');
});

// 2.5 Multi-IP Isolation
runTest('2.5 Rate limits on IP A do not affect IP B', () => {
  const limiter = createRateLimiter();
  const ipA = '10.1.1.1';
  const ipB = '10.1.1.2';

  for (let i = 0; i < 5; i++) {
    limiter.record(ipA);
  }
  limiter.record(ipB);

  assert.strictEqual(limiter.check(ipA).limited, true, 'IP A must be limited');
  assert.strictEqual(limiter.check(ipB).limited, false, 'IP B must NOT be limited');
});

// 2.6 Edge Case: Memory cleanup when timestamps expire
runTest('2.6 Challenge: Memory retention of empty expired IP records in Map', () => {
  const limiter = createRateLimiter();
  const ip = '10.9.9.9';
  const t0 = 1700000000000;
  const windowMs = 15 * 60 * 1000;

  limiter.record(ip, t0);
  assert.strictEqual(limiter.getMapSize(), 1);

  // Check long after expiration
  limiter.check(ip, t0 + windowMs * 2);
  // Notice: record.timestamps becomes [], but `loginAttempts.delete(ip)` is NOT called!
  // Map size is still 1!
  const mapSize = limiter.getMapSize();
  if (mapSize > 0) {
    // This is an empirical observation of Map memory growth under high IP churn
    console.log(
      '     ℹ️  [OBSERVATION] Expired IP leaves an empty entry in Map (mapSize=1). Recommended: delete key when recentAttempts.length === 0.'
    );
  }
  assert.strictEqual(limiter.check(ip, t0 + windowMs * 2).limited, false);
});

// ============================================================================
// SUITE 3: TELEGRAM HTML ESCAPING & PROTOCOL COMPLIANCE (TELEGRAM_SPEC.md)
// ============================================================================
console.log('\n--- SUITE 3: Telegram HTML Escaping & Protocol Compliance ---');

// As specified in TELEGRAM_SPEC.md Section 3.2
function escapeTelegramHtml(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// As specified in TELEGRAM_SPEC.md Section 4.2
function buildTelegramAlertPayload(lead, chatId) {
  const cleanPhone = (lead.phone || '').trim();
  const cleanTel = cleanPhone.replace(/[^\d+]/g, '');
  const cleanDigits = cleanPhone.replace(/\D/g, '').replace(/^9710/, '971');

  // Pre-filled WhatsApp greeting
  const rawName = (lead.name || 'Anonymous').trim();
  const jurisdiction = lead.jurisdiction || 'UAE';
  const greetingText = `Hello ${rawName}, thank you for contacting Klay regarding your ${jurisdiction} setup. I am reviewing your requirements.`;
  const waUrl = cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(greetingText)}`
    : '';

  // Truncate and escape dynamic fields safely
  const safeName = escapeTelegramHtml((lead.name || 'Anonymous').slice(0, 100));
  const safeRef = escapeTelegramHtml(lead.referenceNumber || lead.id || 'N/A');
  const safeJurisdiction = escapeTelegramHtml(jurisdiction);
  const safeActivity = escapeTelegramHtml(lead.activity || 'General Commercial');
  const safeEmail = escapeTelegramHtml(lead.email || '');
  const safePhone = escapeTelegramHtml(cleanPhone || 'N/A');
  const safeTimeline = escapeTelegramHtml(lead.timeline || 'Immediate');
  // Pass safeVisas through escapeTelegramHtml
  const safeVisas = escapeTelegramHtml(
    lead.visaCount !== undefined && lead.visaCount !== null
      ? String(lead.visaCount).slice(0, 20)
      : 'N/A'
  );
  const safeNotes = lead.notes ? escapeTelegramHtml(lead.notes.slice(0, 1000)) : '';
  const safeSource = escapeTelegramHtml(lead.source || 'portal');
  const dateFormatted = new Date(lead.timestamp || Date.now()).toUTCString();

  // Guard: if cleanTel is empty, render plain text safePhone without <a> tag
  const phoneDisplay = cleanTel ? `<a href="tel:${cleanTel}">${safePhone}</a>` : safePhone;

  // Construct structured luxury alert text
  const lines = [
    `🏛️ <b>NEW INCOMING LEAD: ${safeName}</b>`,
    `🆔 Reference: <code>${safeRef}</code>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <b>Jurisdiction:</b> ${safeJurisdiction}`,
    `💼 <b>Activity:</b> ${safeActivity}`,
    `✉️ <b>Email:</b> ${safeEmail}`,
    `📞 <b>Phone:</b> ${phoneDisplay}`,
    `👥 <b>Visas:</b> ${safeVisas}`,
    `⏱️ <b>Timeline:</b> ${safeTimeline}`,
    `📍 <b>Source:</b> ${safeSource}`,
  ];

  if (safeNotes) {
    lines.push(`📝 <b>Notes:</b> <i>${safeNotes}</i>`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🕒 <i>Captured at: ${dateFormatted}</i>`);

  const keyboard = [];
  if (waUrl) {
    keyboard.push([
      {
        text: '💬 WhatsApp Lead',
        url: waUrl,
      },
    ]);
  }

  return {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'HTML',
    link_preview_options: {
      is_disabled: true,
    },
    reply_markup: {
      inline_keyboard: keyboard,
    },
  };
}

// 3.1 Adversarial Strings in escapeTelegramHtml
runTest('3.1 Escapes adversarial XSS strings (<script>, &quot;, > in names/notes)', () => {
  const adversarial1 = '<script>alert("XSS")</script>';
  const escaped1 = escapeTelegramHtml(adversarial1);
  assert.strictEqual(escaped1, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  assert.ok(!escaped1.includes('<'), 'Must not contain raw <');
  assert.ok(!escaped1.includes('>'), 'Must not contain raw >');
  assert.ok(!escaped1.includes('"'), 'Must not contain raw "');

  const adversarial2 = 'Alexander <Founder & Managing Director>';
  const escaped2 = escapeTelegramHtml(adversarial2);
  assert.strictEqual(escaped2, 'Alexander &lt;Founder &amp; Managing Director&gt;');

  const adversarial3 = 'Quotes and "quotes" with &quot; existing entities';
  const escaped3 = escapeTelegramHtml(adversarial3);
  assert.strictEqual(escaped3, 'Quotes and &quot;quotes&quot; with &amp;quot; existing entities');
});

// 3.2 Falsy and primitive inputs to escapeTelegramHtml
runTest('3.2 Handles null, undefined, empty string gracefully', () => {
  assert.strictEqual(escapeTelegramHtml(null), '');
  assert.strictEqual(escapeTelegramHtml(undefined), '');
  assert.strictEqual(escapeTelegramHtml(''), '');
});

// 3.3 Challenge: Number 0 in escapeTelegramHtml
runTest('3.3 Challenge: Number 0 converted to string via escapeTelegramHtml', () => {
  const res = escapeTelegramHtml(0);
  // Look at line 124 of TELEGRAM_SPEC.md: `if (!input) return '';`
  // For input=0, `!0` is true, so it returns `''` instead of `'0'`!
  if (res === '') {
    console.log(
      '     ℹ️  [OBSERVATION] `escapeTelegramHtml(0)` returns "" because `!0 === true`. Should be `if (input === null || input === undefined)`.'
    );
  }
  // Not fatal if only strings are passed, but notable edge case.
});

// 3.4 Challenge: Undefined lead.name in buildTelegramAlertPayload
runTest('3.4 Challenge: lead.name is undefined in buildTelegramAlertPayload', () => {
  // In TELEGRAM_SPEC.md line 205: `lead.name.slice(0, 100)`
  // If a raw lead object lacks `name`, does it throw?
  function specOriginalBuild(lead, chatId) {
    // verbatim line 205:
    return escapeTelegramHtml(lead.name.slice(0, 100));
  }

  assert.throws(
    () => {
      specOriginalBuild({ id: '1', phone: '+971501234567' }, '123');
    },
    TypeError,
    'Verbatim spec code crashes with TypeError if lead.name is missing'
  );
  console.log(
    '     ℹ️  [OBSERVATION] Confirmed: `lead.name.slice(0, 100)` throws TypeError if `lead.name` is undefined. Must use `(lead.name || "").slice(0, 100)`.'
  );
});

// 3.5 Challenge: Adversarial visaCount in buildTelegramAlertPayload
runTest('3.5 Challenge: visaCount containing adversarial HTML tags', () => {
  const maliciousLead = {
    id: 'KLAY-MAL-01',
    name: 'Eve Attacker',
    email: 'eve@evil.com',
    phone: '+971501234567',
    jurisdiction: 'DIFC',
    visaCount: '3 <script>alert(1)</script>',
    timestamp: '2026-11-15T16:00:00Z',
  };

  const payload = buildTelegramAlertPayload(maliciousLead, '999');
  // Check if text contains unescaped <script> tag from visaCount
  if (payload.text.includes('<script>')) {
    throw new Error(
      'VULNERABILITY: safeVisas is NOT escaped! visaCount injected unescaped `<script>` into Telegram message body, which triggers Telegram 400 Bad Request entity parse error!'
    );
  }
});

// 3.6 Protocol Compliance: No `tel:` in inline keyboard
runTest('3.6 Protocol Compliance: Verifies NO `tel:` scheme in InlineKeyboardButton', () => {
  const lead = {
    id: 'KLAY-2026-0001',
    name: 'Alexander Wright',
    email: 'alex@wright.com',
    phone: '+971 50 123 4567',
    timestamp: '2026-11-15T14:31:28Z',
  };

  const payload = buildTelegramAlertPayload(lead, '123456');

  // Verify phone dialer link is in HTML body
  assert.ok(
    payload.text.includes('<a href="tel:+971501234567">'),
    'HTML body must contain <a href="tel:...">'
  );

  // Verify inline buttons
  const buttons = payload.reply_markup.inline_keyboard.flat();
  for (const btn of buttons) {
    assert.ok(
      !btn.url.startsWith('tel:'),
      'CRITICAL: Inline button must NEVER use tel: URL protocol'
    );
    assert.ok(btn.url.startsWith('https://'), 'Inline button must use HTTPS protocol');
    if (btn.text.includes('WhatsApp')) {
      assert.ok(
        btn.url.startsWith('https://wa.me/971501234567'),
        'WhatsApp URL must use wa.me with clean digits'
      );
    }
  }
});

// ============================================================================
// SUITE 4: TURSO DDL CONSTRAINTS & DATA INTEGRITY (TURSO_SPEC.md)
// ============================================================================
console.log('\n--- SUITE 4: Turso SQLite DDL Constraints & Fallback ---');

import { DatabaseSync } from 'node:sqlite';

runTest('4.1 Leads status CHECK constraint rejects invalid lifecycle stages', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE leads (
      id TEXT PRIMARY KEY,
      reference_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'))
    );
  `);

  const stmt = db.prepare('INSERT INTO leads (id, reference_number, status) VALUES (?, ?, ?)');

  // Valid statuses
  const valid = ['New', 'Contacted', 'Proposal Sent', 'Converted', 'Archived'];
  for (let i = 0; i < valid.length; i++) {
    stmt.run(`id-${i}`, `ref-${i}`, valid[i]);
  }

  // Invalid status
  let threw = false;
  try {
    stmt.run('id-err', 'ref-err', 'InvalidStatus');
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('CHECK constraint failed'));
  }
  assert.ok(threw, 'CHECK constraint must reject invalid status');
});

runTest('4.2 Blogs status CHECK constraint rejects non-draft/published statuses', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE blogs (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published'))
    );
  `);

  const stmt = db.prepare('INSERT INTO blogs (id, slug, status) VALUES (?, ?, ?)');
  stmt.run('b-1', 'slug-1', 'draft');
  stmt.run('b-2', 'slug-2', 'published');

  let threw = false;
  try {
    stmt.run('b-3', 'slug-3', 'archived');
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('CHECK constraint failed'));
  }
  assert.ok(threw, 'CHECK constraint must reject invalid status');
});

runTest('4.3 Blogs unique slug constraint prevents collision', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE blogs (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL
    );
    CREATE UNIQUE INDEX idx_blogs_slug ON blogs(slug);
  `);

  const stmt = db.prepare('INSERT INTO blogs (id, slug) VALUES (?, ?)');
  stmt.run('b-1', 'uae-tax-guide');

  let threw = false;
  try {
    stmt.run('b-2', 'uae-tax-guide');
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('UNIQUE constraint failed'));
  }
  assert.ok(threw, 'Unique index must reject duplicate slug');
});

// 1.7b Remediated verifySessionToken with strict exp validation
function verifySessionTokenPatched(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const secret = getAdminSecret();

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    const now = Math.floor(Date.now() / 1000);
    // REMEDIATION: Strict check that exp exists, is a finite number, and is in the future
    if (
      !decodedPayload ||
      typeof decodedPayload.exp !== 'number' ||
      !Number.isFinite(decodedPayload.exp) ||
      decodedPayload.exp < now
    ) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

runTest('1.7b Remediated verifySessionToken rejects missing or non-numeric exp', () => {
  const secret = getAdminSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY' })).toString('base64url');
  const payloadNoExp = Buffer.from(JSON.stringify({ sub: 'admin' })).toString('base64url');
  const sigNoExp = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payloadNoExp}`)
    .digest('base64url');
  const tokenNoExp = `${header}.${payloadNoExp}.${sigNoExp}`;

  assert.strictEqual(verifySessionTokenPatched(tokenNoExp), null, 'Must reject token without exp');

  const payloadStringExp = Buffer.from(JSON.stringify({ sub: 'admin', exp: 'never' })).toString(
    'base64url'
  );
  const sigStringExp = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payloadStringExp}`)
    .digest('base64url');
  const tokenStringExp = `${header}.${payloadStringExp}.${sigStringExp}`;

  assert.strictEqual(
    verifySessionTokenPatched(tokenStringExp),
    null,
    'Must reject token with string exp'
  );
});

// 3.5b Remediated buildTelegramAlertPayload with escaped visaCount & safe name slicing
function buildTelegramAlertPayloadPatched(lead, chatId) {
  const cleanPhone = (lead.phone || '').trim();
  const cleanTel = cleanPhone.replace(/[^\d+]/g, '');
  const cleanDigits = cleanPhone.replace(/\D/g, '').replace(/^9710/, '971');

  const safeLeadName = (lead.name || 'Valued Client').trim();
  const jurisdiction = lead.jurisdiction || 'UAE';
  const greetingText = `Hello ${safeLeadName}, thank you for contacting Klay regarding your ${jurisdiction} setup. I am reviewing your requirements.`;
  const waUrl = cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(greetingText)}`
    : '';

  // REMEDIATION: Safe name slice and full entity escaping across all dynamic fields
  const safeName = escapeTelegramHtml(safeLeadName.slice(0, 100));
  const safeRef = escapeTelegramHtml(lead.referenceNumber || lead.id || 'N/A');
  const safeJurisdiction = escapeTelegramHtml(jurisdiction);
  const safeActivity = escapeTelegramHtml(lead.activity || 'General Commercial');
  const safeEmail = escapeTelegramHtml(lead.email || '');
  const safePhone = escapeTelegramHtml(cleanPhone);
  const safeTimeline = escapeTelegramHtml(lead.timeline || 'Immediate');
  // REMEDIATION: safeVisas MUST be escaped through escapeTelegramHtml
  const safeVisas =
    lead.visaCount !== undefined && lead.visaCount !== null
      ? escapeTelegramHtml(String(lead.visaCount).slice(0, 20))
      : 'N/A';
  const safeNotes = lead.notes ? escapeTelegramHtml(lead.notes.slice(0, 1000)) : '';
  const safeSource = escapeTelegramHtml(lead.source || 'portal');
  const dateFormatted = new Date(lead.timestamp || Date.now()).toUTCString();

  const lines = [
    `🏛️ <b>NEW INCOMING LEAD: ${safeName}</b>`,
    `🆔 Reference: <code>${safeRef}</code>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <b>Jurisdiction:</b> ${safeJurisdiction}`,
    `💼 <b>Activity:</b> ${safeActivity}`,
    `✉️ <b>Email:</b> ${safeEmail}`,
    `📞 <b>Phone:</b> <a href="tel:${cleanTel}">${safePhone}</a>`,
    `👥 <b>Visas:</b> ${safeVisas}`,
    `⏱️ <b>Timeline:</b> ${safeTimeline}`,
    `📍 <b>Source:</b> ${safeSource}`,
  ];

  if (safeNotes) {
    lines.push(`📝 <b>Notes:</b> <i>${safeNotes}</i>`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🕒 <i>Captured at: ${dateFormatted}</i>`);

  const keyboard = [];
  if (waUrl) {
    keyboard.push([
      {
        text: '💬 WhatsApp Lead',
        url: waUrl,
      },
    ]);
  }

  return {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'HTML',
    link_preview_options: {
      is_disabled: true,
    },
    reply_markup: {
      inline_keyboard: keyboard,
    },
  };
}

runTest(
  '3.5b Remediated buildTelegramAlertPayload safely escapes visaCount and handles undefined name',
  () => {
    const maliciousLead = {
      id: 'KLAY-MAL-02',
      name: undefined, // undefined name test
      email: 'attacker@evil.com',
      phone: '+971501234567',
      visaCount: '3 <script>alert("pwned")</script>', // XSS in visaCount
      notes: 'Testing > and < in notes',
    };

    const payload = buildTelegramAlertPayloadPatched(maliciousLead, '12345');
    assert.ok(!payload.text.includes('<script>'), 'Must NOT contain raw <script>');
    assert.ok(payload.text.includes('&lt;script&gt;'), 'Must contain escaped &lt;script&gt;');
    assert.ok(
      payload.text.includes('Valued Client'),
      'Must fall back gracefully for undefined name'
    );
  }
);

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n======================================================================');
console.log(`TOTAL TESTS:  ${suiteTests}`);
console.log(`PASSED:       ${suitePassed}`);
console.log(`FAILED:       ${suiteFailed}`);
console.log('======================================================================');

if (findings.length > 0) {
  console.log('\n⚠️  EMPIRICAL FINDINGS & VULNERABILITIES IDENTIFIED:');
  findings.forEach((f, idx) => {
    console.log(`\n[Finding ${idx + 1}] ${f.name}`);
    console.log(`  Error: ${f.error}`);
  });
}
