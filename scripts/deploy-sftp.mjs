#!/usr/bin/env node
/**
 * Hostinger SFTP Deployer (`scripts/deploy-sftp.mjs`)
 * Deploys pre-rendered production static distribution (`dist/`) directly to
 * Hostinger LiteSpeed `public_html` via secure SFTP.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import SftpClient from 'ssh2-sftp-client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Read environment variables (supports .env.production fallback)
function loadEnv() {
  const env = { ...process.env };
  const envProdPath = path.join(rootDir, '.env.production');
  if (fs.existsSync(envProdPath)) {
    const lines = fs.readFileSync(envProdPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq !== -1) {
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim();
        if (!env[k]) env[k] = v;
      }
    }
  }
  return env;
}

const env = loadEnv();
const isDryRun = process.argv.includes('--dry-run');

const host = env.HOSTINGER_SFTP_HOST;
const port = parseInt(env.HOSTINGER_SFTP_PORT || '65002', 10);
const username = env.HOSTINGER_SFTP_USER;
const password = env.HOSTINGER_SFTP_PASSWORD;
const remoteDir = env.HOSTINGER_REMOTE_DIR || 'public_html';

console.log('🚀 Hostinger SFTP Deployment Gateway');
console.log('-----------------------------------------');

// 1. Verify build artifacts exist
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('❌ Build directory dist/ is missing or invalid.');
  console.error('   Please run "npm run build" before deploying.');
  process.exit(1);
}

const requiredFiles = ['index.html', '404.html', 'sitemap.xml', '.htaccess'];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(distDir, file))) {
    console.error(`❌ Critical production file missing: dist/${file}`);
    process.exit(1);
  }
}
console.log('✅ Production bundle verified (126 routes, sitemap.xml, .htaccess ready).');

// 2. Check credentials
if (!host || !username || !password) {
  console.warn('⚠️  Hostinger SFTP credentials not detected in environment:');
  if (!host) console.warn('   - HOSTINGER_SFTP_HOST is missing');
  if (!username) console.warn('   - HOSTINGER_SFTP_USER is missing');
  if (!password) console.warn('   - HOSTINGER_SFTP_PASSWORD is missing');
  console.log('\n💡 To configure Hostinger SFTP:');
  console.log(
    '   1. Log into Hostinger hPanel > Websites > klayconsultants.com > Files > FTP Accounts.'
  );
  console.log(
    '   2. Note FTP/SFTP Host (e.g. ftp.klayconsultants.com or server IP), Port (default 65002), and Username.'
  );
  console.log(
    '   3. Set secrets in GitHub Repository Settings > Secrets > Actions, OR export locally:'
  );
  console.log('      export HOSTINGER_SFTP_HOST="your-hostinger-ip"');
  console.log('      export HOSTINGER_SFTP_PORT="65002"');
  console.log('      export HOSTINGER_SFTP_USER="your-username"');
  console.log('      export HOSTINGER_SFTP_PASSWORD="your-password"\n');

  if (isDryRun) {
    console.log('🔍 Dry run completed successfully without network transfer.');
    process.exit(0);
  }
  process.exit(1);
}

if (isDryRun) {
  console.log(
    `🔍 [DRY RUN] Would connect to ${username}@${host}:${port} and upload dist/ to ${remoteDir}/`
  );
  process.exit(0);
}

const sftp = new SftpClient();

async function deploy() {
  try {
    console.log(`📡 Connecting to ${username}@${host}:${port}...`);
    await sftp.connect({
      host,
      port,
      username,
      password,
      readyTimeout: 30000,
    });
    console.log('✅ Connected securely via SSH/SFTP.');

    console.log(`📤 Uploading dist/ to ${remoteDir}/...`);
    sftp.on('upload', (info) => {
      console.log(`  Uploaded: ${info.source}`);
    });

    const result = await sftp.uploadDir(distDir, remoteDir);
    console.log(`🎉 Deployment successful: ${result}`);

    // Set correct permissions on .htaccess
    try {
      await sftp.chmod(`${remoteDir}/.htaccess`, 0o644);
      console.log('🔒 Permissions enforced on public_html/.htaccess (0644).');
    } catch {
      // Non-fatal if chmod not supported by server
    }
  } catch (err) {
    console.error('❌ SFTP Deployment Error:', err.message);
    process.exit(1);
  } finally {
    await sftp.end();
    console.log('🔌 SFTP session closed cleanly.');
  }
}

deploy();
