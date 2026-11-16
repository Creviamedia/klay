import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('../netlify/functions/admin-core.cjs');
const gateway = require('../netlify/functions/admin.cjs');

const previous = {
  secret: process.env.KLAY_ADMIN_SECRET,
  legacySecret: process.env.ADMIN_JWT_SECRET,
  hash: process.env.ADMIN_PASSWORD_HASH,
  legacyHash: process.env.KLAY_ADMIN_PASSWORD_HASH,
};

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

  console.log('Security gates passed: explicit secret, revoked password, session rotation, origin policy.');
} finally {
  for (const [env, value] of [
    ['KLAY_ADMIN_SECRET', previous.secret],
    ['ADMIN_JWT_SECRET', previous.legacySecret],
    ['ADMIN_PASSWORD_HASH', previous.hash],
    ['KLAY_ADMIN_PASSWORD_HASH', previous.legacyHash],
  ]) {
    if (value === undefined) delete process.env[env];
    else process.env[env] = value;
  }
}
