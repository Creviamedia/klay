import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('../netlify/functions/admin-core.cjs');
const gateway = require('../netlify/functions/admin.cjs');
const intake = require('../netlify/functions/lead-intake-core.cjs');
const leadGateway = require('../netlify/functions/leads.cjs');

const previous = {
  secret: process.env.KLAY_ADMIN_SECRET,
  legacySecret: process.env.ADMIN_JWT_SECRET,
  hash: process.env.ADMIN_PASSWORD_HASH,
  legacyHash: process.env.KLAY_ADMIN_PASSWORD_HASH,
  ntfy: process.env.NTFY_TOPIC_URL,
};
const originalFetch = global.fetch;

try {
  delete process.env.KLAY_ADMIN_SECRET;
  delete process.env.ADMIN_JWT_SECRET;
  assert.throws(() => admin.getAdminSecret(), /must be set/);

  process.env.KLAY_ADMIN_SECRET = 'test-only-session-key';
  delete process.env.ADMIN_PASSWORD_HASH;
  delete process.env.KLAY_ADMIN_PASSWORD_HASH;

  const noUserClient = { execute: async () => ({ rows: [] }) };
  const login = await admin.handleAdminLogin(
    { username: 'admin', password: admin.REVOKED_DEVELOPMENT_PASSWORD },
    '198.51.100.200',
    { client: noUserClient }
  );
  assert.equal(login.statusCode, 401);

  process.env.ADMIN_PASSWORD_HASH = await admin.hashPassword('RecoveryOnly#297');
  const staleUserClient = { execute: async () => ({ rows: [{ id: 1, username: 'admin', password_hash: await admin.hashPassword('OldOnly#297') }] }) };
  const recovered = await admin.handleAdminLogin(
    { username: 'admin', password: 'RecoveryOnly#297' },
    '198.51.100.201',
    { client: staleUserClient }
  );
  assert.equal(recovered.statusCode, 200, 'Environment credential should recover a stale Turso admin');
  assert.equal(recovered.body.token, undefined);
  delete process.env.ADMIN_PASSWORD_HASH;

  const token = admin.generateSessionToken('admin');
  assert.equal(admin.verifySessionToken(token)?.sub, 'admin');
  const [header, payload] = token.split('.');
  const oldHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'KLAY' })).toString('base64url');
  const oldSignature = crypto.createHmac('sha256', process.env.KLAY_ADMIN_SECRET)
    .update(`${oldHeader}.${payload}`).digest('base64url');
  assert.equal(admin.verifySessionToken(`${oldHeader}.${payload}.${oldSignature}`), null);

  const allowed = await gateway.handler({
    httpMethod: 'OPTIONS', path: '/api/admin/leads',
    headers: { origin: 'https://klay-consulting-staging.netlify.app' },
  });
  assert.equal(allowed.statusCode, 204);
  assert.equal(allowed.headers['Access-Control-Allow-Credentials'], 'true');

  const denied = await gateway.handler({
    httpMethod: 'OPTIONS', path: '/api/admin/leads',
    headers: { origin: 'https://untrusted.example' },
  });
  assert.equal(denied.statusCode, 403);
  assert.equal(denied.headers['Access-Control-Allow-Origin'], undefined);
  assert.equal(denied.headers['Access-Control-Allow-Credentials'], undefined);

  const sampleLead = { id: 'KLAY-TEST-123', name: 'Private Person', email: 'private@example.com', phone: '12345', notes: 'Private note' };
  let notification;
  global.fetch = async (_url, options) => { notification = JSON.parse(options.body); return { ok: true }; };
  delete process.env.NTFY_TOPIC_URL;
  await intake.sendPushNotification(sampleLead);
  assert.equal(notification, undefined, 'No public notification should be sent by default');
  process.env.NTFY_TOPIC_URL = 'https://ntfy.sh/private-test-topic';
  await intake.sendPushNotification(sampleLead);
  assert.equal(notification.message, 'Reference: KLAY-TEST-123');
  assert.doesNotMatch(JSON.stringify(notification), /Private Person|private@example.com|12345|Private note/);

  const oversized = await leadGateway.handler({ httpMethod: 'POST', body: 'x'.repeat(32769), headers: {} });
  assert.equal(oversized.statusCode, 413);
  const invalid = await intake.processIntakeLead({ name: 'a'.repeat(121) });
  assert.equal(invalid.statusCode, 400);

  console.log('Security gates passed: admin auth, origin policy, private alerts, input limits.');
} finally {
  global.fetch = originalFetch;
  for (const [env, value] of [
    ['KLAY_ADMIN_SECRET', previous.secret],
    ['ADMIN_JWT_SECRET', previous.legacySecret],
    ['ADMIN_PASSWORD_HASH', previous.hash],
    ['KLAY_ADMIN_PASSWORD_HASH', previous.legacyHash],
    ['NTFY_TOPIC_URL', previous.ntfy],
  ]) {
    if (value === undefined) delete process.env[env];
    else process.env[env] = value;
  }
}
