#!/usr/bin/env node

/**
 * scripts/google-indexing.mjs
 *
 * Automated Google Indexing API batch push script for Klay Consultants.
 * Ingests all canonical public routes from src/lib/seo.ts and pushes
 * URL_UPDATED notifications to Google Indexing API v3.
 *
 * Authentication Environment Variables:
 * - GOOGLE_INDEXING_CREDENTIALS: JSON string or file path to service account key
 * - GOOGLE_INDEXING_SERVICE_ACCOUNT_KEY: Alternative JSON string or file path
 * - GOOGLE_APPLICATION_CREDENTIALS: Standard GCP credentials file path fallback
 *
 * Execution Modes:
 * - Live: If credentials present and not in dry-run mode, authenticates via RS256 JWT
 *   and pushes batches to https://indexing.googleapis.com/v3/urlNotifications:publish.
 * - Mock / Dry-Run: If no credentials present or --dry-run passed, gracefully operates
 *   in mock mode, simulating batch submission and exiting with code 0.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const require = createRequire(import.meta.url);
const ts = require('typescript');

// Hook TypeScript compilation for src/lib/seo.ts
require.extensions['.ts'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  }).outputText;
  module._compile(output, filename);
};

const { getPublicSeoRoutes, getPageSeo, SITE_ORIGIN } = require(
  path.join(root, 'src', 'lib', 'seo.ts')
);

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    type: 'URL_UPDATED',
    batchSize: 100,
    limit: null,
    delayMs: 50,
    verbose: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg.startsWith('--type=')) {
      const val = arg.split('=')[1].toUpperCase();
      if (val !== 'URL_UPDATED' && val !== 'URL_DELETED') {
        console.error(
          `Error: Invalid notification type "${val}". Must be URL_UPDATED or URL_DELETED.`
        );
        process.exit(1);
      }
      options.type = val;
    } else if (arg.startsWith('--batch-size=')) {
      const size = parseInt(arg.split('=')[1], 10);
      if (isNaN(size) || size < 1 || size > 100) {
        console.error(`Error: Invalid batch size "${arg}". Must be an integer between 1 and 100.`);
        process.exit(1);
      }
      options.batchSize = size;
    } else if (arg.startsWith('--limit=')) {
      const limit = parseInt(arg.split('=')[1], 10);
      if (isNaN(limit) || limit < 1) {
        console.error(`Error: Invalid limit "${arg}". Must be a positive integer.`);
        process.exit(1);
      }
      options.limit = limit;
    } else if (arg.startsWith('--delay-ms=')) {
      const delay = parseInt(arg.split('=')[1], 10);
      if (isNaN(delay) || delay < 0) {
        console.error(`Error: Invalid delay-ms "${arg}". Must be a non-negative integer.`);
        process.exit(1);
      }
      options.delayMs = delay;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Google Indexing API Batch Push Utility
Usage: node scripts/google-indexing.mjs [options]

Options:
  --dry-run             Operate in simulation mode without publishing live HTTP requests to Google
  --type=<type>         Notification type: URL_UPDATED (default) or URL_DELETED
  --batch-size=<N>      Batch size per chunk (default: 100, max: 100)
  --limit=<N>           Limit total URLs pushed (useful for testing or quota control)
  --delay-ms=<N>        Milliseconds delay between requests to respect rate limits (default: 50)
  --verbose, -v         Display detailed individual URL publishing results
  --help, -h            Show this help manual

Environment Variables:
  GOOGLE_INDEXING_CREDENTIALS          JSON string or file path to Google service account key
  GOOGLE_INDEXING_SERVICE_ACCOUNT_KEY  Alternative env var for service account JSON or file path
  GOOGLE_APPLICATION_CREDENTIALS       Standard GCP credentials file path fallback

Behavior:
  - If credentials are not configured, the script automatically operates in safe mock/dry-run mode
    and exits cleanly with code 0.
  - Automatically loads all canonical routes from src/lib/seo.ts.
`);
}

function loadCredentials() {
  const raw =
    process.env.GOOGLE_INDEXING_CREDENTIALS ||
    process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!raw) return null;

  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      throw new Error(
        `Failed to parse Google credentials JSON from environment variable: ${err.message}`,
        { cause: err }
      );
    }
  }

  const resolved = path.isAbsolute(trimmed) ? trimmed : path.resolve(root, trimmed);
  if (fs.existsSync(resolved)) {
    try {
      return JSON.parse(fs.readFileSync(resolved, 'utf8'));
    } catch (err) {
      throw new Error(`Failed to parse credentials file at ${resolved}: ${err.message}`, {
        cause: err,
      });
    }
  }

  throw new Error(`Specified Google credentials file does not exist: ${resolved}`);
}

async function getAccessToken(credentials) {
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Invalid service account key: missing client_email or private_key.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const privateKey = credentials.private_key.replace(/\\n/g, '\n');
  const signature = signer.sign(privateKey, 'base64url');
  const assertion = `${header}.${claim}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Google OAuth2 token exchange failed (${response.status} ${response.statusText}): ${text}`
    );
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const options = parseArgs();
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log('='.repeat(80));
  console.log('Google Indexing API Batch Push');
  console.log('='.repeat(80));

  let credentials = null;
  try {
    credentials = loadCredentials();
  } catch (err) {
    console.error(`\x1b[31mCredentials Error:\x1b[0m ${err.message}`);
    process.exit(1);
  }

  const isMockMode = !credentials || options.dryRun;
  const modeLabel = !credentials
    ? 'MOCK (No credentials present — safe fallback)'
    : options.dryRun
      ? 'DRY-RUN (Credentials loaded, live mutation suppressed)'
      : 'LIVE (Production API calls)';

  console.log(`Execution Mode   : \x1b[36m${modeLabel}\x1b[0m`);
  console.log(`Notification Type: \x1b[33m${options.type}\x1b[0m`);
  console.log(`Batch Size       : ${options.batchSize} URLs per chunk`);
  if (credentials) {
    console.log(`Service Account  : ${credentials.client_email || 'Present'}`);
  }

  // Load canonical URLs from src/lib/seo.ts
  const rawRoutes = getPublicSeoRoutes();
  let urls = Array.from(new Set(rawRoutes.map((r) => getPageSeo(r.path).canonical)));

  if (options.limit && options.limit < urls.length) {
    urls = urls.slice(0, options.limit);
    console.log(`Limit Applied    : Ingesting first ${options.limit} URLs`);
  } else {
    console.log(`Discovered URLs  : ${urls.length} public canonical routes`);
  }

  console.log('-'.repeat(80));

  // Chunking
  const chunks = [];
  for (let i = 0; i < urls.length; i += options.batchSize) {
    chunks.push(urls.slice(i, i + options.batchSize));
  }

  let accessToken = null;
  if (!isMockMode) {
    try {
      console.log('Authenticating with Google OAuth2 (RS256 JWT assertion)...');
      accessToken = await getAccessToken(credentials);
      console.log('Authentication successful. Bearer token acquired.\n');
    } catch (authErr) {
      console.error(`\x1b[31mAuthentication Failed:\x1b[0m ${authErr.message}`);
      process.exit(1);
    }
  }

  const results = {
    total: urls.length,
    success: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  const startTime = Date.now();

  for (let batchIdx = 0; batchIdx < chunks.length; batchIdx++) {
    const chunk = chunks[batchIdx];
    const batchNum = batchIdx + 1;
    console.log(`[Batch ${batchNum}/${chunks.length}] Submitting ${chunk.length} URLs...`);

    for (let urlIdx = 0; urlIdx < chunk.length; urlIdx++) {
      const url = chunk[urlIdx];

      if (isMockMode) {
        // Mock / Dry-Run Mode
        results.success++;
        if (options.verbose || urlIdx < 3 || urlIdx === chunk.length - 1) {
          console.log(`  ✓ [MOCK] ${url}`);
        } else if (urlIdx === 3) {
          console.log(`  ... (${chunk.length - 4} more URLs in this batch simulated)`);
        }
      } else {
        // Live Mode
        try {
          const apiResponse = await fetch(
            'https://indexing.googleapis.com/v3/urlNotifications:publish',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                url,
                type: options.type,
              }),
            }
          );

          if (apiResponse.ok) {
            results.success++;
            if (options.verbose) {
              console.log(`  ✓ [200 OK] ${url}`);
            }
          } else {
            results.failed++;
            const errText = await apiResponse.text();
            console.error(
              `  ✗ [${apiResponse.status} ${apiResponse.statusText}] ${url}: ${errText}`
            );
            results.details.push({ url, error: errText, status: apiResponse.status });
          }
        } catch (fetchErr) {
          results.failed++;
          console.error(`  ✗ [Network Error] ${url}: ${fetchErr.message}`);
          results.details.push({ url, error: fetchErr.message });
        }

        if (options.delayMs > 0) {
          await sleep(options.delayMs);
        }
      }
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('-'.repeat(80));
  console.log('Google Indexing Summary:');
  console.log(`- Total URLs Scanned    : ${results.total}`);
  console.log(`- Successfully Processed: ${results.success}`);
  console.log(`- Failed Submissions    : ${results.failed}`);
  console.log(`- Elapsed Duration      : ${durationSec}s`);
  console.log(`- Execution Mode        : ${isMockMode ? 'Mock / Dry-Run (Code 0)' : 'Live Push'}`);
  console.log('='.repeat(80));

  if (results.failed > 0 && !isMockMode) {
    console.error(`\x1b[31mIndexing finished with ${results.failed} failures.\x1b[0m`);
    process.exit(1);
  }

  console.log('\x1b[32mGoogle Indexing batch operation completed successfully.\x1b[0m');
  process.exit(0);
}

main().catch((fatal) => {
  console.error(`Fatal script exception: ${fatal.message}`);
  process.exit(1);
});
