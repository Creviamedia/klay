#!/usr/bin/env node
/**
 * Environment Ruleset Validator (`scripts/validate-env.mjs`)
 * Strictly verifies schema and safety rulesets across all environments:
 * - production (.env.production)
 * - staging (.env.staging)
 * - uat (.env.uat)
 * - development (.env.development)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_KEYS = [
  'VITE_SITE_URL',
  'VITE_CANONICAL_HOST',
  'VITE_ENVIRONMENT',
  'VITE_LEAD_API_ENDPOINT',
  'VITE_ENABLE_MOCK_LEADS',
  'VITE_ENABLE_ROBOTS_INDEX',
];

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing environment file: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const errors = [];

// 1. Validate Production Ruleset
try {
  const prod = parseEnv(path.join(rootDir, '.env.production'));
  for (const key of REQUIRED_KEYS) {
    if (prod[key] === undefined) errors.push(`[.env.production] Missing required key: ${key}`);
  }
  if (prod.VITE_ENVIRONMENT !== 'production') {
    errors.push(
      `[.env.production] VITE_ENVIRONMENT must be 'production', got '${prod.VITE_ENVIRONMENT}'`
    );
  }
  if (prod.VITE_ENABLE_ROBOTS_INDEX !== 'true') {
    errors.push(`[.env.production] VITE_ENABLE_ROBOTS_INDEX must be 'true' to allow SEO indexing.`);
  }
  if (prod.VITE_ENABLE_MOCK_LEADS !== 'false') {
    errors.push(`[.env.production] VITE_ENABLE_MOCK_LEADS must be 'false' in production.`);
  }
  if (prod.VITE_CANONICAL_HOST !== 'klayconsultants.com') {
    errors.push(`[.env.production] VITE_CANONICAL_HOST must be 'klayconsultants.com'.`);
  }
} catch (e) {
  errors.push(e.message);
}

// 2. Validate Staging Ruleset
try {
  const staging = parseEnv(path.join(rootDir, '.env.staging'));
  if (staging.VITE_ENVIRONMENT !== 'staging') {
    errors.push(
      `[.env.staging] VITE_ENVIRONMENT must be 'staging', got '${staging.VITE_ENVIRONMENT}'`
    );
  }
  if (staging.VITE_ENABLE_ROBOTS_INDEX !== 'false') {
    errors.push(
      `[.env.staging] VITE_ENABLE_ROBOTS_INDEX must be 'false' to prevent search indexing.`
    );
  }
} catch (e) {
  errors.push(e.message);
}

// 3. Validate UAT Ruleset
try {
  const uat = parseEnv(path.join(rootDir, '.env.uat'));
  if (uat.VITE_ENVIRONMENT !== 'uat') {
    errors.push(`[.env.uat] VITE_ENVIRONMENT must be 'uat', got '${uat.VITE_ENVIRONMENT}'`);
  }
  if (uat.VITE_ENABLE_ROBOTS_INDEX !== 'false') {
    errors.push(`[.env.uat] VITE_ENABLE_ROBOTS_INDEX must be 'false' to prevent search indexing.`);
  }
} catch (e) {
  errors.push(e.message);
}

// 4. Validate Development Ruleset
try {
  const dev = parseEnv(path.join(rootDir, '.env.development'));
  if (dev.VITE_ENVIRONMENT !== 'development') {
    errors.push(
      `[.env.development] VITE_ENVIRONMENT must be 'development', got '${dev.VITE_ENVIRONMENT}'`
    );
  }
} catch (e) {
  errors.push(e.message);
}

if (errors.length > 0) {
  console.error('❌ Environment ruleset validation failed:');
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
} else {
  console.log(
    '✅ Environment ruleset validated: production, staging, uat, development comply with policy.'
  );
}
