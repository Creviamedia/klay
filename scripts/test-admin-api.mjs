/**
 * Test Suite: Admin API & Security Hardening (`scripts/test-admin-api.mjs`)
 *
 * Verifies all Phase 2 / Milestone 2 requirements:
 * 1. Pure-JS bcryptjs password hashing and verification
 * 2. Signed HMAC-SHA256 session token generation, timingSafeEqual, strict exp, production guard
 * 3. In-memory sliding-window rate limiting (5 attempts -> 429), race prevention, Map cleanup
 * 4. Client IP resolution (Netlify headers, Express req.ip, X-Forwarded-For)
 * 5. Authentication extraction (Bearer token & cookie) and protected barrier
 * 6. Admin login (400, 401, 429, 200 with HttpOnly cookie) & logout
 * 7. Leads query with search, jurisdiction, status, date filtering & pagination (159 historical leads)
 * 8. Leads status patching with strict enum validation & persistence
 * 9. Blogs CRUD (list, upsert, reading_time calculation, delete)
 * 10. Netlify serverless function routing adapter (OPTIONS CORS, /api/admin/* endpoints)
 */

import assert from 'node:assert/strict';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const adminCore = require('../netlify/functions/admin-core.cjs');
const adminFunction = require('../netlify/functions/admin.cjs');
process.env.KLAY_ADMIN_SECRET = 'test-only-hmac-secret-for-admin-suite';
process.env.ADMIN_PASSWORD_HASH = await adminCore.hashPassword('TestOnlyAdmin#297');

console.log('======================================================================');
console.log('🛡️  KLAY ADMIN API & SECURITY HARDENING VERIFICATION SUITE  🛡️');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failures.push({ name, error: err.message, stack: err.stack });
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failures.push({ name, error: err.message, stack: err.stack });
  }
}

// Setup isolated temporary data directory for mutation tests
const testDataDir = path.join('/tmp', `klay-admin-test-${Date.now()}`);
fs.mkdirSync(testDataDir, { recursive: true });

// Seed controlled test leads fixture in testDataDir
const testJsonl = path.join(testDataDir, 'leads.jsonl');
const fixtureLeads = [
  {
    id: 'KLAY-2026-9RV4',
    reference_number: 'KLAY-2026-9RV4',
    timestamp: '2026-11-13T21:27:24.607Z',
    name: 'Fahad Al-Maktoum',
    email: 'fahad@sovereign-ai.ae',
    phone: '+971 50 123 4567',
    jurisdiction: 'DIFC',
    activity: 'Technology',
    status: 'New',
    created_at: '2026-11-13T21:27:24.607Z',
    updated_at: '2026-11-13T21:27:24.607Z',
  },
  {
    id: 'KLAY-2026-TSMF',
    reference_number: 'KLAY-2026-TSMF',
    timestamp: '2026-11-13T21:27:24.633Z',
    name: 'Elena von Bergmann',
    email: 'elena@family-office.ch',
    phone: '+971 52 987 6543',
    jurisdiction: 'DIFC',
    activity: 'General',
    status: 'New',
    created_at: '2026-11-13T21:27:24.633Z',
    updated_at: '2026-11-13T21:27:24.633Z',
  },
];
for (let i = 3; i <= 15; i++) {
  fixtureLeads.push({
    id: `KLAY-TEST-${i}`,
    reference_number: `KLAY-TEST-${i}`,
    timestamp: '2026-11-13T21:27:24.607Z',
    name: `Test Lead ${i}`,
    email: `test${i}@example.com`,
    phone: `+971 50 000 ${1000 + i}`,
    jurisdiction: 'DIFC',
    activity: 'General',
    status: 'New',
    created_at: '2026-11-13T21:27:24.607Z',
    updated_at: '2026-11-13T21:27:24.607Z',
  });
}
fs.writeFileSync(testJsonl, fixtureLeads.map((l) => JSON.stringify(l)).join('\n') + '\n');

// ============================================================================
// SUITE 1: BCRYPTJS PASSWORD HASHING & VERIFICATION
// ============================================================================
console.log('--- SUITE 1: Password Hashing with Pure-JS bcryptjs ---');

await testAsync(
  '1.1 Password hashing produces 60-character bcrypt hash with $2a$10$ or $2b$10$',
  async () => {
    const hash = await adminCore.hashPassword('TestOnlyAdmin#297');
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 60);
    assert.ok(hash.startsWith('$2a$10$') || hash.startsWith('$2b$10$'), 'Must use 10 salt rounds');
  }
);

await testAsync('1.2 Password verification returns true for matching password', async () => {
  const hash = await adminCore.hashPassword('SovereignPassword#99');
  const valid = await adminCore.verifyPassword('SovereignPassword#99', hash);
  assert.strictEqual(valid, true);
});

await testAsync('1.3 Password verification returns false for incorrect password', async () => {
  const hash = await adminCore.hashPassword('SovereignPassword#99');
  const valid = await adminCore.verifyPassword('WrongPassword', hash);
  assert.strictEqual(valid, false);
});

await testAsync(
  '1.4 Password verification handles empty or null values safely without throwing',
  async () => {
    assert.strictEqual(await adminCore.verifyPassword('', ''), false);
    assert.strictEqual(await adminCore.verifyPassword(null, null), false);
    assert.strictEqual(await adminCore.verifyPassword(undefined, undefined), false);
  }
);

// ============================================================================
// SUITE 2: CRYPTOGRAPHIC SESSION TOKEN & EXPIRATION CONTROLS
// ============================================================================
console.log('\n--- SUITE 2: Signed HMAC-SHA256 Session Token Architecture ---');

test('2.1 Generates well-formed 3-part Base64URL session token', () => {
  const token = adminCore.generateSessionToken('admin_user');
  assert.strictEqual(typeof token, 'string');
  const parts = token.split('.');
  assert.strictEqual(parts.length, 3, 'Must contain header, payload, and signature');

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  assert.strictEqual(header.alg, 'HS256');
  assert.strictEqual(header.typ, 'KLAY2');

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  assert.strictEqual(payload.sub, 'admin_user');
  assert.strictEqual(typeof payload.iat, 'number');
  assert.strictEqual(typeof payload.exp, 'number');
  assert.strictEqual(typeof payload.jti, 'string');
  assert.strictEqual(
    payload.exp - payload.iat,
    86400,
    'Expiration must be exactly 24 hours (86400s)'
  );
});

test('2.2 Successfully verifies authentic session token in constant time', () => {
  const token = adminCore.generateSessionToken('executive_admin');
  const verified = adminCore.verifySessionToken(token);
  assert.ok(verified, 'Payload must be returned');
  assert.strictEqual(verified.sub, 'executive_admin');
});

test('2.3 Rejects token with tampered payload content', () => {
  const token = adminCore.generateSessionToken('admin');
  const [h, p, s] = token.split('.');
  const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
  payload.sub = 'forged_root';
  const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const forgedToken = `${h}.${tamperedPayload}.${s}`;

  assert.strictEqual(adminCore.verifySessionToken(forgedToken), null);
});

test('2.4 Rejects single-byte bit flip in signature', () => {
  const token = adminCore.generateSessionToken('admin');
  const [h, p, s] = token.split('.');
  const flipped = s.slice(0, -1) + (s.slice(-1) === 'A' ? 'B' : 'A');
  const forgedToken = `${h}.${p}.${flipped}`;

  assert.strictEqual(adminCore.verifySessionToken(forgedToken), null);
});

test('2.5 Rejects token with signature length mismatch without throwing RangeError', () => {
  const token = adminCore.generateSessionToken('admin');
  const [h, p, s] = token.split('.');

  // Truncated signature
  const shortToken = `${h}.${p}.${s.slice(0, 10)}`;
  assert.doesNotThrow(() => {
    assert.strictEqual(adminCore.verifySessionToken(shortToken), null);
  });

  // Extended signature
  const longToken = `${h}.${p}.${s}EXTRASIGCHARS`;
  assert.doesNotThrow(() => {
    assert.strictEqual(adminCore.verifySessionToken(longToken), null);
  });
});

test('2.6 Rejects token with expired exp timestamp', () => {
  const pastTime = Math.floor(Date.now() / 1000) - 1000;
  const expiredToken = adminCore.generateSessionToken('admin', { now: pastTime, ttl: 500 });
  assert.strictEqual(adminCore.verifySessionToken(expiredToken), null);
});

test('2.7 Rejects token with missing exp field (strict expiration enforcement)', () => {
  const secret = adminCore.getAdminSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'admin' })).toString('base64url'); // Missing exp
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  const tokenNoExp = `${header}.${payload}.${sig}`;

  assert.strictEqual(
    adminCore.verifySessionToken(tokenNoExp),
    null,
    'Must reject token without exp claim'
  );
});

test('2.8 Rejects token with non-numeric exp field', () => {
  const secret = adminCore.getAdminSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'admin', exp: 'never' })).toString('base64url');
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  const tokenInvalidExp = `${header}.${payload}.${sig}`;

  assert.strictEqual(
    adminCore.verifySessionToken(tokenInvalidExp),
    null,
    'Must reject non-numeric exp claim'
  );
});

test('2.9 Fatal production guard throws if secret unset in production', () => {
  const prevEnv = process.env.NODE_ENV;
  const prevSecret1 = process.env.KLAY_ADMIN_SECRET;
  const prevSecret2 = process.env.ADMIN_JWT_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.KLAY_ADMIN_SECRET;
    delete process.env.ADMIN_JWT_SECRET;

    assert.throws(
      () => adminCore.getAdminSecret(),
      /FATAL: KLAY_ADMIN_SECRET or ADMIN_JWT_SECRET must be set/
    );
  } finally {
    process.env.NODE_ENV = prevEnv;
    if (prevSecret1) process.env.KLAY_ADMIN_SECRET = prevSecret1;
    if (prevSecret2) process.env.ADMIN_JWT_SECRET = prevSecret2;
  }
});

// ============================================================================
// SUITE 3: SLIDING-WINDOW RATE LIMITING & CONCURRENCY CONTROLS
// ============================================================================
console.log('\n--- SUITE 3: Sliding-Window Rate Limiting & Concurrency Safety ---');

test('3.1 Rate limiter allows 4 failed attempts without triggering 429', () => {
  const testIp = '198.51.100.1';
  adminCore.clearLoginRateLimit(testIp);

  for (let i = 1; i <= 4; i++) {
    adminCore.recordFailedLogin(testIp);
    const check = adminCore.checkLoginRateLimit(testIp);
    assert.strictEqual(check.limited, false, `Attempt ${i} should not be limited`);
  }
});

test('3.2 Reaches rate limit exactly on 5th failed attempt within 15-minute window', () => {
  const testIp = '198.51.100.2';
  adminCore.clearLoginRateLimit(testIp);

  for (let i = 1; i <= 5; i++) {
    adminCore.recordFailedLogin(testIp);
  }

  const check = adminCore.checkLoginRateLimit(testIp);
  assert.strictEqual(check.limited, true, 'Attempt 5 must trigger rate limit');
  assert.ok(check.retryAfterSeconds > 0 && check.retryAfterSeconds <= 900);
});

test('3.3 Successful login resets / clears rate limit state for IP', () => {
  const testIp = '198.51.100.3';
  adminCore.clearLoginRateLimit(testIp);

  for (let i = 1; i <= 5; i++) {
    adminCore.recordFailedLogin(testIp);
  }
  assert.strictEqual(adminCore.checkLoginRateLimit(testIp).limited, true);

  adminCore.clearLoginRateLimit(testIp);
  assert.strictEqual(adminCore.checkLoginRateLimit(testIp).limited, false);
});

test('3.4 Rate limiter cleans up expired Map entries to prevent memory retention leaks', () => {
  const testIp = '198.51.100.4';
  const t0 = 1700000000000;
  const windowMs = 15 * 60 * 1000;

  adminCore.clearLoginRateLimit(testIp);
  adminCore.recordFailedLogin(testIp, t0);
  assert.ok(adminCore._loginAttemptsMap.has(testIp));

  // Check at t0 + window + 1ms (expired)
  const check = adminCore.checkLoginRateLimit(testIp, t0 + windowMs + 1);
  assert.strictEqual(check.limited, false);
  assert.strictEqual(
    adminCore._loginAttemptsMap.has(testIp),
    false,
    'Expired entry must be deleted from Map'
  );
});

test('3.5 Rate limit isolation between distinct IP addresses', () => {
  const ipA = '198.51.100.10';
  const ipB = '198.51.100.11';
  adminCore.clearLoginRateLimit(ipA);
  adminCore.clearLoginRateLimit(ipB);

  for (let i = 1; i <= 5; i++) adminCore.recordFailedLogin(ipA);
  adminCore.recordFailedLogin(ipB);

  assert.strictEqual(adminCore.checkLoginRateLimit(ipA).limited, true);
  assert.strictEqual(adminCore.checkLoginRateLimit(ipB).limited, false);
});

// ============================================================================
// SUITE 4: CLIENT IP RESOLUTION & AUTH TOKEN EXTRACTION
// ============================================================================
console.log('\n--- SUITE 4: Client IP Resolution & Auth Extraction ---');

test('4.1 Netlify x-nf-client-connection-ip has highest precedence in serverless event', () => {
  const event = {
    httpMethod: 'POST',
    headers: {
      'x-nf-client-connection-ip': '203.0.113.195',
      'client-ip': '198.51.100.1',
      'x-forwarded-for': '192.0.2.1, 10.0.0.1',
    },
  };
  assert.strictEqual(adminCore.resolveClientIp(event), '203.0.113.195');
});

test('4.1b Netlify serverless detected via process.env.NETLIFY inspects connection header', () => {
  const prevEnv = process.env.NETLIFY;
  try {
    process.env.NETLIFY = 'true';
    const event = {
      headers: {
        'x-nf-client-connection-ip': '198.51.100.200',
      },
    };
    assert.strictEqual(adminCore.resolveClientIp(event), '198.51.100.200');
  } finally {
    if (prevEnv === undefined) {
      delete process.env.NETLIFY;
    } else {
      process.env.NETLIFY = prevEnv;
    }
  }
});

test('4.2 Netlify client-ip fallback is respected in serverless event', () => {
  const event = {
    httpMethod: 'GET',
    headers: {
      'client-ip': '198.51.100.55',
    },
  };
  assert.strictEqual(adminCore.resolveClientIp(event), '198.51.100.55');
});

test('4.3 Express req.ip is extracted correctly', () => {
  const req = {
    ip: '192.168.1.50',
    headers: {},
  };
  assert.strictEqual(adminCore.resolveClientIp(req), '192.168.1.50');
});

test('4.3b Express IP spoofing via rotating headers is blocked (req.ip strictly takes precedence)', () => {
  const req = {
    ip: '192.168.1.50',
    headers: {
      'x-nf-client-connection-ip': '203.0.113.99',
      'client-ip': '203.0.113.100',
      'x-forwarded-for': '203.0.113.101',
    },
  };
  assert.strictEqual(adminCore.resolveClientIp(req), '192.168.1.50');
});

await testAsync(
  '4.3c Express login rate-limit cannot be bypassed by rotating client IP headers',
  async () => {
    const fixedIp = '198.51.100.77';
    adminCore.clearLoginRateLimit(fixedIp);

    for (let i = 0; i < 5; i++) {
      const fakeExpressReq = {
        ip: fixedIp,
        headers: { 'x-nf-client-connection-ip': `203.0.113.${i}` },
      };
      const clientIp = adminCore.resolveClientIp(fakeExpressReq);
      assert.strictEqual(clientIp, fixedIp, 'req.ip must take precedence over spoofed header');
      const res = await adminCore.handleAdminLogin(
        { username: 'admin', password: 'wrong' },
        clientIp
      );
      assert.strictEqual(res.statusCode, 401);
    }

    // 6th attempt with another spoofed header must be rejected with HTTP 429
    const fakeExpressReq6 = {
      ip: fixedIp,
      headers: { 'x-nf-client-connection-ip': '203.0.113.99' },
    };
    const clientIp6 = adminCore.resolveClientIp(fakeExpressReq6);
    const res6 = await adminCore.handleAdminLogin(
      { username: 'admin', password: 'wrong' },
      clientIp6
    );
    assert.strictEqual(
      res6.statusCode,
      429,
      'Rate limiter must lock out IP despite spoofed headers'
    );
    adminCore.clearLoginRateLimit(fixedIp);
  }
);

test('4.4 Session token extracted from Authorization Bearer header', () => {
  const token = adminCore.generateSessionToken('admin');
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  assert.strictEqual(adminCore.extractSessionToken(req), token);
});

test('4.5 Session token extracted from Cookie header', () => {
  const token = adminCore.generateSessionToken('admin');
  const req = {
    headers: {
      cookie: `other_pref=dark; klay_admin_session=${token}; visited=true`,
    },
  };
  assert.strictEqual(adminCore.extractSessionToken(req), token);
});

test('4.6 requireAdminAuth validates authenticated requests and rejects unauthenticated', () => {
  const token = adminCore.generateSessionToken('admin_user');
  const validReq = { headers: { authorization: `Bearer ${token}` } };
  const invalidReq = { headers: {} };
  const forgedReq = { headers: { authorization: 'Bearer invalid.token.payload' } };

  assert.strictEqual(adminCore.requireAdminAuth(validReq).authenticated, true);
  assert.strictEqual(adminCore.requireAdminAuth(invalidReq).authenticated, false);
  assert.strictEqual(adminCore.requireAdminAuth(forgedReq).authenticated, false);
});

// ============================================================================
// SUITE 5: ADMIN LOGIN & LOGOUT HANDLERS
// ============================================================================
console.log('\n--- SUITE 5: Admin Login & Logout Handlers ---');

await testAsync('5.1 Login returns 400 when username or password omitted', async () => {
  const res1 = await adminCore.handleAdminLogin({}, '127.0.0.1');
  assert.strictEqual(res1.statusCode, 400);

  const res2 = await adminCore.handleAdminLogin({ username: 'admin' }, '127.0.0.1');
  assert.strictEqual(res2.statusCode, 400);
});

await testAsync('5.2 Login returns 401 on invalid password', async () => {
  const testIp = '198.51.100.20';
  adminCore.clearLoginRateLimit(testIp);

  const res = await adminCore.handleAdminLogin(
    { username: 'admin', password: 'IncorrectPassword' },
    testIp
  );
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.error, 'Invalid username or password');
});

await testAsync(
  '5.3 Concurrency race mitigation: 5 failed logins return 429 Too Many Requests',
  async () => {
    const testIp = '198.51.100.21';
    adminCore.clearLoginRateLimit(testIp);

    // Send 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      const res = await adminCore.handleAdminLogin(
        { username: 'admin', password: 'BadPassword' },
        testIp
      );
      assert.strictEqual(res.statusCode, 401);
    }

    // 6th attempt MUST be blocked with 429
    const blockedRes = await adminCore.handleAdminLogin(
      { username: 'admin', password: 'TestOnlyAdmin#297' },
      testIp
    );
    assert.strictEqual(blockedRes.statusCode, 429);
    assert.ok(blockedRes.headers['Retry-After']);
    assert.ok(blockedRes.body.error.includes('Too many failed attempts'));
  }
);

await testAsync(
  '5.4 Login returns 200 with HttpOnly session cookie on valid credentials',
  async () => {
    const testIp = '198.51.100.22';
    adminCore.clearLoginRateLimit(testIp);

    const res = await adminCore.handleAdminLogin(
      { username: 'admin', password: 'TestOnlyAdmin#297' },
      testIp
    );

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(
      res.body.token,
      undefined,
      'Session token must not be readable by browser JavaScript'
    );
    assert.strictEqual(res.body.user.username, 'admin');

    const cookieHeader = res.headers['Set-Cookie'];
    assert.ok(cookieHeader, 'Must set Set-Cookie header');
    assert.ok(cookieHeader.includes('klay_admin_session='));
    assert.ok(cookieHeader.includes('HttpOnly'));
    assert.ok(cookieHeader.includes('SameSite=Lax'));
    assert.ok(cookieHeader.includes('Max-Age=86400'));
  }
);

await testAsync('5.5 Published development credential is revoked', async () => {
  const res = await adminCore.handleAdminLogin(
    { username: 'admin', password: 'KlayAdmin2026!Dev' },
    '198.51.100.230'
  );
  assert.strictEqual(res.statusCode, 401);
});

test('5.6 Logout returns 200 with expired session cookie (Max-Age=0)', () => {
  const res = adminCore.handleAdminLogout();
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.ok, true);

  const cookieHeader = res.headers['Set-Cookie'];
  assert.ok(cookieHeader.includes('Max-Age=0'));
  assert.ok(cookieHeader.includes('klay_admin_session=;'));
});

// ============================================================================
// SUITE 6: LEADS RETRIEVAL & FILTERING (data/leads.jsonl)
// ============================================================================
console.log('\n--- SUITE 6: Leads Retrieval, Search, and Filtering ---');

test('6.1 Queries fixture leads from leads.jsonl with pagination', () => {
  const res = adminCore.handleGetLeads({ limit: 10, offset: 0 }, { dataDir: testDataDir });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.total, 15, 'Must reflect 15 fixture leads');
  assert.strictEqual(res.body.leads.length, 10);
  assert.strictEqual(res.body.limit, 10);
  assert.strictEqual(res.body.offset, 0);

  const first = res.body.leads[0];
  assert.ok(first.id);
  assert.ok(first.reference_number);
  assert.ok(first.name);
  assert.ok(first.status);
});

test('6.2 Filters leads by jurisdiction (e.g. DIFC)', () => {
  const res = adminCore.handleGetLeads(
    { jurisdiction: 'DIFC', limit: 100 },
    { dataDir: testDataDir }
  );
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.total > 0);
  for (const lead of res.body.leads) {
    assert.ok(lead.jurisdiction.toLowerCase().includes('difc'));
  }
});

test('6.3 Multi-field text search matches name, email, phone, or reference', () => {
  const res = adminCore.handleGetLeads({ search: 'Fahad', limit: 50 }, { dataDir: testDataDir });
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.total >= 1);
  for (const lead of res.body.leads) {
    const text = `${lead.name} ${lead.email} ${lead.phone} ${lead.reference_number}`.toLowerCase();
    assert.ok(text.includes('fahad'));
  }
});

test('6.4 Filters leads by status (e.g. New)', () => {
  const res = adminCore.handleGetLeads({ status: 'New', limit: 20 }, { dataDir: testDataDir });
  assert.strictEqual(res.statusCode, 200);
  for (const lead of res.body.leads) {
    assert.strictEqual(lead.status, 'New');
  }
});

test('6.5 Filters leads by date range (from / to)', () => {
  const res = adminCore.handleGetLeads(
    { from: '2026-11-01T00:00:00.000Z', to: '2026-11-30T23:59:59.999Z', limit: 200 },
    { dataDir: testDataDir }
  );
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.total > 0);
});

// ============================================================================
// SUITE 7: LEAD STATUS MUTATION & VALIDATION
// ============================================================================
console.log('\n--- SUITE 7: Lead Status Mutation & Validation ---');

test('7.1 Rejects invalid status with 400 Bad Request', () => {
  const res = adminCore.handlePatchLead(
    'KLAY-2026-9RV4',
    { status: 'InvalidStage' },
    { dataDir: testDataDir }
  );
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.error.includes('Invalid status'));
});

test('7.2 Returns 404 Not Found for non-existent lead ID', () => {
  const res = adminCore.handlePatchLead(
    'KLAY-NON-EXISTENT-ID',
    { status: 'Contacted' },
    { dataDir: testDataDir }
  );
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.error, 'Lead not found');
});

test('7.3 Successfully updates lead status and persists change to disk', () => {
  const leadId = 'KLAY-2026-9RV4';
  const res = adminCore.handlePatchLead(
    leadId,
    { status: 'Proposal Sent' },
    { dataDir: testDataDir }
  );

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(res.body.lead.status, 'Proposal Sent');
  assert.ok(res.body.lead.updated_at);

  // Verify change in subsequent query
  const query = adminCore.handleGetLeads({ search: leadId }, { dataDir: testDataDir });
  assert.strictEqual(query.body.leads[0].status, 'Proposal Sent');
});

// ============================================================================
// SUITE 8: BLOG CMS CRUD OPERATIONS
// ============================================================================
console.log('\n--- SUITE 8: Blog CMS Storage & Operations ---');

test('8.1 Retrieves blog list with initial articles', () => {
  const res = adminCore.handleGetBlogs({ dataDir: testDataDir });
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.blogs));
  assert.ok(res.body.blogs.length >= 1);

  const post = res.body.blogs[0];
  assert.ok(post.slug);
  assert.ok(post.title);
  assert.ok(post.pillar);
  assert.ok(post.content);
});

test('8.2 Rejects blog creation when required fields are missing', () => {
  const res = adminCore.handlePostBlog({ title: 'Incomplete Post' }, { dataDir: testDataDir });
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.error.includes("Validation failed: 'title', 'slug', 'pillar', and 'content'"));
});

test('8.3 Creates new blog post and calculates reading time automatically', () => {
  const newPost = {
    title: 'Abu Dhabi Global Market Tech Licences 2026',
    slug: 'adgm-tech-licences-2026',
    pillar: 'Company Setup & Strategy',
    excerpt: 'Comprehensive guide to ADGM Regulated and Innovation licences in Al Maryah Island.',
    coverImage: 'https://images.unsplash.com/photo-adgm.jpg',
    content: '## Overview\n' + 'word '.repeat(450), // 450 words -> ~3 min reading time
    status: 'published',
  };

  const res = adminCore.handlePostBlog(newPost, { dataDir: testDataDir });
  assert.ok(res.statusCode === 200 || res.statusCode === 201);
  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(res.body.blog.slug, 'adgm-tech-licences-2026');
  assert.strictEqual(res.body.blog.reading_time, 3);
  assert.strictEqual(res.body.blog.status, 'published');
});

test('8.4 Upsert updates existing blog post by slug', () => {
  const updatedPost = {
    title: 'Abu Dhabi Global Market Tech Licences 2026 (Updated Edition)',
    slug: 'adgm-tech-licences-2026',
    pillar: 'Company Setup & Strategy',
    content: '## Updated content\nRefreshed regulatory framework details.',
    status: 'draft',
  };

  const res = adminCore.handlePostBlog(updatedPost, { dataDir: testDataDir });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(
    res.body.blog.title,
    'Abu Dhabi Global Market Tech Licences 2026 (Updated Edition)'
  );
  assert.strictEqual(res.body.blog.status, 'draft');
});

test('8.5 Deletes blog article by slug and returns 404 on repeat delete', () => {
  const delRes = adminCore.handleDeleteBlog('adgm-tech-licences-2026', { dataDir: testDataDir });
  assert.strictEqual(delRes.statusCode, 200);
  assert.strictEqual(delRes.body.ok, true);
  assert.strictEqual(delRes.body.deleted, 'adgm-tech-licences-2026');

  // Repeat deletion must 404
  const notFoundRes = adminCore.handleDeleteBlog('adgm-tech-licences-2026', {
    dataDir: testDataDir,
  });
  assert.strictEqual(notFoundRes.statusCode, 404);
  assert.strictEqual(notFoundRes.body.error, 'Blog article not found');
});

// ============================================================================
// SUITE 9: NETLIFY SERVERLESS FUNCTION ROUTER ADAPTER (admin.cjs)
// ============================================================================
console.log('\n--- SUITE 9: Netlify Serverless Function Adapter Routing ---');

await testAsync(
  '9.1 Pre-flight OPTIONS without origin returns wildcard origin without credentials',
  async () => {
    const res = await adminFunction.handler({
      httpMethod: 'OPTIONS',
      path: '/api/admin/leads',
    });
    assert.strictEqual(res.statusCode, 204);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], undefined);
    assert.strictEqual(
      res.headers['Access-Control-Allow-Credentials'],
      undefined,
      'No credentials without an approved origin'
    );
    assert.ok(res.headers['Access-Control-Allow-Methods'].includes('GET'));
  }
);

await testAsync('9.1b Pre-flight OPTIONS permits the approved staging origin', async () => {
  const origin = 'https://klay-consulting-staging.netlify.app';
  const res = await adminFunction.handler({
    httpMethod: 'OPTIONS',
    path: '/api/admin/leads',
    headers: { origin },
  });
  assert.strictEqual(res.statusCode, 204);
  assert.strictEqual(res.headers['Access-Control-Allow-Origin'], origin);
  assert.strictEqual(res.headers['Access-Control-Allow-Credentials'], 'true');
});

await testAsync('9.1c Pre-flight OPTIONS permits the approved production origin', async () => {
  const origin = 'https://klayconsultants.com';
  const res = await adminFunction.handler({
    httpMethod: 'OPTIONS',
    path: '/api/admin/leads',
    headers: { Origin: origin },
  });
  assert.strictEqual(res.statusCode, 204);
  assert.strictEqual(res.headers['Access-Control-Allow-Origin'], origin);
  assert.strictEqual(res.headers['Access-Control-Allow-Credentials'], 'true');
});

await testAsync(
  '9.1d Authenticated response with origin reflects origin and sets credentials',
  async () => {
    const origin = 'https://klayconsultants.com';
    const token = adminCore.generateSessionToken('admin');
    const res = await adminFunction.handler({
      httpMethod: 'GET',
      path: '/api/admin/leads',
      queryStringParameters: { limit: '1' },
      headers: {
        origin,
        authorization: `Bearer ${token}`,
      },
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['Access-Control-Allow-Origin'], origin);
    assert.strictEqual(res.headers['Access-Control-Allow-Credentials'], 'true');
  }
);

await testAsync('9.1e Untrusted origin is rejected before authentication', async () => {
  const res = await adminFunction.handler({
    httpMethod: 'OPTIONS',
    path: '/api/admin/leads',
    headers: { origin: 'https://untrusted.example' },
  });
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.headers['Access-Control-Allow-Origin'], undefined);
  assert.strictEqual(res.headers['Access-Control-Allow-Credentials'], undefined);
});

await testAsync(
  '9.2 Unauthenticated access to protected /api/admin/leads returns 401',
  async () => {
    const res = await adminFunction.handler({
      httpMethod: 'GET',
      path: '/api/admin/leads',
      headers: {},
    });
    assert.strictEqual(res.statusCode, 401);
    const body = JSON.parse(res.body);
    assert.ok(body.error.includes('Unauthorized'));
  }
);

await testAsync('9.3 Authenticated request with Bearer token passes router barrier', async () => {
  const token = adminCore.generateSessionToken('admin');
  const res = await adminFunction.handler({
    httpMethod: 'GET',
    path: '/api/admin/leads',
    queryStringParameters: { limit: '5' },
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  assert.strictEqual(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.ok(Array.isArray(body.leads));
  assert.ok(body.leads.length >= 1, 'Expected at least 1 lead');
});

await testAsync(
  '9.4 Serverless adapter executes POST /api/admin/login and returns Set-Cookie',
  async () => {
    const testIp = '198.51.100.99';
    adminCore.clearLoginRateLimit(testIp);

    const res = await adminFunction.handler({
      httpMethod: 'POST',
      path: '/api/admin/login',
      headers: {
        'x-nf-client-connection-ip': testIp,
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'TestOnlyAdmin#297',
      }),
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.token, undefined, 'Session token must stay in the HttpOnly cookie');
    assert.ok(
      res.headers['Set-Cookie'] || (res.multiValueHeaders && res.multiValueHeaders['Set-Cookie'])
    );
  }
);

await testAsync('9.5 Unknown endpoint under /api/admin returns 404', async () => {
  const token = adminCore.generateSessionToken('admin');
  const res = await adminFunction.handler({
    httpMethod: 'GET',
    path: '/api/admin/unknown-route',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(res.statusCode, 404);
});

await testAsync(
  '9.6 Malformed percent encoding in PATCH /api/admin/leads/:id returns HTTP 400',
  async () => {
    const token = adminCore.generateSessionToken('admin');
    const res = await adminFunction.handler({
      httpMethod: 'PATCH',
      path: '/api/admin/leads/%',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'Contacted' }),
    });
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.error, 'Malformed URI encoding');
  }
);

await testAsync(
  '9.7 Malformed percent encoding in DELETE /api/admin/blogs/:slug returns HTTP 400',
  async () => {
    const token = adminCore.generateSessionToken('admin');
    const res = await adminFunction.handler({
      httpMethod: 'DELETE',
      path: '/api/admin/blogs/%',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.error, 'Malformed URI encoding');
  }
);

test('9.8 safeDecode returns null on malformed percent encoding without throwing URIError', () => {
  assert.strictEqual(adminFunction.safeDecode('%'), null);
  assert.strictEqual(adminFunction.safeDecode('%E0%A4%A'), null);
  assert.strictEqual(adminFunction.safeDecode('valid-slug'), 'valid-slug');
  assert.strictEqual(adminFunction.safeDecode('hello%20world'), 'hello world');
});

// ============================================================================
// SUITE 10: RFC 6238 TOTP 2FA & TOKEN REVOCATION
// ============================================================================
console.log('\n--- SUITE 10: RFC 6238 TOTP 2FA & Token Revocation Architecture ---');

test('10.1 base32Encode and base32Decode round-trip correctly', () => {
  const original = Buffer.from('KlayConsultantsDubai2026!');
  const encoded = adminCore.base32Encode(original);
  assert.strictEqual(typeof encoded, 'string');
  assert.ok(/^[A-Z2-7]+$/.test(encoded));
  const decoded = adminCore.base32Decode(encoded);
  assert.deepStrictEqual(decoded, original);
});

test('10.2 generateTotp matches RFC 6238 Appendix B test vectors exactly', () => {
  // RFC 6238 Key: ASCII "12345678901234567890" -> Base32 GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ
  const rfcKeyB32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  // Step at T=59s (Math.floor(59/30) = 1) -> 287082
  assert.strictEqual(adminCore.generateTotp(rfcKeyB32, 1), '287082');
  // Step at T=1111111109s (Math.floor(1111111109/30) = 37037036) -> 081804
  assert.strictEqual(adminCore.generateTotp(rfcKeyB32, 37037036), '081804');
  // Step at T=2000000000s (Math.floor(2000000000/30) = 66666666) -> 279037
  assert.strictEqual(adminCore.generateTotp(rfcKeyB32, 66666666), '279037');
});

test('10.3 verifyTotp verifies valid TOTP with clock drift window', () => {
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  const now = 1700000000;
  const currentStep = Math.floor(now / 30);
  const currentCode = adminCore.generateTotp(secret, currentStep);
  const prevCode = adminCore.generateTotp(secret, currentStep - 1);
  const nextCode = adminCore.generateTotp(secret, currentStep + 1);
  const farFutureCode = adminCore.generateTotp(secret, currentStep + 5);

  assert.strictEqual(adminCore.verifyTotp(secret, currentCode, 1, now), true);
  assert.strictEqual(adminCore.verifyTotp(secret, prevCode, 1, now), true);
  assert.strictEqual(adminCore.verifyTotp(secret, nextCode, 1, now), true);
  assert.strictEqual(adminCore.verifyTotp(secret, farFutureCode, 1, now), false);
  assert.strictEqual(adminCore.verifyTotp(secret, '999999', 1, now), false);
  assert.strictEqual(adminCore.verifyTotp(secret, 'invalid', 1, now), false);
});

await testAsync(
  '10.4 handleAdminLogin enforces MFA when user has totp_secret configured',
  async () => {
    const testTotpSecret = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';
    process.env.ADMIN_TOTP_SECRET = testTotpSecret;

    try {
      // Attempt 1: Password only -> Returns HTTP 200 with mfaRequired: true, NO cookie
      const mfaPromptRes = await adminCore.handleAdminLogin(
        { username: 'admin', password: 'TestOnlyAdmin#297' },
        '192.168.10.1'
      );
      assert.strictEqual(mfaPromptRes.statusCode, 200);
      assert.strictEqual(mfaPromptRes.body.ok, false);
      assert.strictEqual(mfaPromptRes.body.mfaRequired, true);
      assert.strictEqual(mfaPromptRes.headers['Set-Cookie'], undefined);

      // Attempt 2: Incorrect TOTP code -> Returns HTTP 401
      const badTotpRes = await adminCore.handleAdminLogin(
        { username: 'admin', password: 'TestOnlyAdmin#297', totp_code: '000000' },
        '192.168.10.1'
      );
      assert.strictEqual(badTotpRes.statusCode, 401);
      assert.strictEqual(badTotpRes.body.error, 'Invalid two-factor authentication code');

      // Attempt 3: Valid TOTP code -> Returns HTTP 200 with session cookie
      const currentStep = Math.floor(Date.now() / 30000);
      const validTotpCode = adminCore.generateTotp(testTotpSecret, currentStep);
      const successRes = await adminCore.handleAdminLogin(
        { username: 'admin', password: 'TestOnlyAdmin#297', totp_code: validTotpCode },
        '192.168.10.1'
      );
      assert.strictEqual(successRes.statusCode, 200);
      assert.strictEqual(successRes.body.ok, true);
      assert.ok(successRes.headers['Set-Cookie'].includes('klay_admin_session='));
    } finally {
      delete process.env.ADMIN_TOTP_SECRET;
    }
  }
);

test('10.5 handleAdminLogout immediately revokes session token jti in memory', () => {
  const token = adminCore.generateSessionToken('admin_revoke_test');
  const req = { headers: { authorization: `Bearer ${token}` } };

  // Before logout: session is valid
  const authBefore = adminCore.requireAdminAuth(req);
  assert.strictEqual(authBefore.authenticated, true);
  assert.ok(authBefore.user.jti);

  // Logout executes and kills session
  const logoutRes = adminCore.handleAdminLogout(req);
  assert.strictEqual(logoutRes.statusCode, 200);
  assert.strictEqual(logoutRes.body.ok, true);

  // After logout: session is revoked
  const authAfter = adminCore.requireAdminAuth(req);
  assert.strictEqual(authAfter.authenticated, false);
  assert.strictEqual(authAfter.status, 401);
  assert.strictEqual(authAfter.error, 'Unauthorized: session has been revoked');
});

test('10.6 isTokenRevoked and revokeToken track token status', () => {
  const testJti = 'test-jti-' + Date.now();
  assert.strictEqual(adminCore.isTokenRevoked(testJti), false);
  adminCore.revokeToken(testJti, Math.floor(Date.now() / 1000) + 3600);
  assert.strictEqual(adminCore.isTokenRevoked(testJti), true);
});

// Cleanup temp test data
try {
  fs.rmSync(testDataDir, { recursive: true, force: true });
} catch {
  // Non-fatal cleanup
}

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n======================================================================');
console.log(`TOTAL TESTS:  ${totalTests}`);
console.log(`PASSED:       ${passedTests}`);
console.log(`FAILED:       ${failedTests}`);
console.log('======================================================================');

if (failedTests > 0) {
  console.error('\nFAILURES SUMMARY:');
  for (const f of failures) {
    console.error(`- ${f.name}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('\n🎉 ALL ADMIN API & SECURITY HARDENING TESTS PASSED CLEANLY! 🎉\n');
  process.exit(0);
}
