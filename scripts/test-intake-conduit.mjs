#!/usr/bin/env node
/**
 * Test Suite: Intake Conduit Deep Module (`scripts/test-intake-conduit.mjs`)
 */

import assert from 'node:assert';
import {
  normalizePhoneNumber,
  generateSovereignReference,
  validateIntakePayload,
  submitIntakeDossier,
} from '../src/lib/intake-conduit.ts';

console.log('🧪 Starting Intake Dossier Conduit Tests...');

// 1. Phone number normalization
const p1 = normalizePhoneNumber('050 123 4567', '+971');
assert.strictEqual(p1, '+971 50 123 4567', 'Trunk zero should be stripped when dialCode provided');
const p2 = normalizePhoneNumber('+44 7911 123456');
assert.strictEqual(p2, '+44 7911 123456', 'Bare phone should remain untouched');
console.log('  ✓ Phone normalization passed');

// 2. Sovereign reference generation
const ref1 = generateSovereignReference();
assert.match(ref1, /^KLAY-2026-\d{4}$/, 'Default reference should match KLAY-2026-XXXX');
const ref2 = generateSovereignReference('KLAY-GV');
assert.match(ref2, /^KLAY-GV-\d{4}$/, 'Custom prefix reference should match KLAY-GV-XXXX');
console.log('  ✓ Sovereign reference generation passed');

// 3. Validation
const vFail1 = validateIntakePayload({ name: '', email: 'test@example.com', phone: '123' });
assert.strictEqual(vFail1.isValid, false, 'Missing name should fail validation');
const vFail2 = validateIntakePayload({ name: 'Alex', email: 'invalid-email', phone: '123' });
assert.strictEqual(vFail2.isValid, false, 'Invalid email should fail validation');
const vPass = validateIntakePayload({
  name: 'Alex Vance',
  email: 'alex@example.com',
  phone: '+971501234567',
});
assert.strictEqual(vPass.isValid, true, 'Valid payload should pass');
console.log('  ✓ Payload validation passed');

// 4. Transmission with Mock Fetch
const originalFetch = global.fetch;

// 4a. Success scenario
global.fetch = async (url, opts) => {
  const body = JSON.parse(opts.body);
  assert.strictEqual(body.name, 'Sovereign Founder');
  assert.strictEqual(body.phone, '+971 55 987 6543');
  return {
    ok: true,
    status: 201,
    json: async () => ({ success: true, leadId: 'KLAY-2026-9999' }),
  };
};

const resSuccess = await submitIntakeDossier({
  name: '  Sovereign Founder  ',
  email: 'founder@sovereign.ae',
  phone: '055 987 6543',
  dialCode: '+971',
  jurisdiction: 'DIFC',
});
assert.strictEqual(resSuccess.success, true);
assert.strictEqual(resSuccess.referenceNumber, 'KLAY-2026-9999');
console.log('  ✓ Transmission success scenario verified');

// 4b. Rejection on 400
global.fetch = async () => ({
  ok: false,
  status: 400,
  json: async () => ({ error: 'Invalid jurisdiction' }),
});
const res400 = await submitIntakeDossier({
  name: 'Test',
  email: 'test@example.com',
  phone: '123',
});
assert.strictEqual(res400.success, false);
assert.strictEqual(res400.error, 'Invalid jurisdiction');
console.log('  ✓ Transmission 400 rejection verified');

// Restore fetch
global.fetch = originalFetch;

console.log('🎉 ALL INTAKE CONDUIT TESTS PASSED CLEANLY (100% assertions verified)!');
