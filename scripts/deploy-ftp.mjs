import * as ftp from 'basic-ftp';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { pathToFileURL } from 'node:url';

export function deploymentConfig(env = process.env) {
  const host = env.HOSTINGER_SFTP_HOST?.trim();
  const user = env.HOSTINGER_SFTP_USER?.trim();
  const password = env.HOSTINGER_SFTP_PASSWORD;
  if (!host || !user || !password) {
    throw new Error('Set HOSTINGER_SFTP_HOST, HOSTINGER_SFTP_USER and HOSTINGER_SFTP_PASSWORD.');
  }
  const servername = env.HOSTINGER_FTP_TLS_SERVERNAME?.trim() || host;
  if (net.isIP(servername)) {
    throw new Error('An IP endpoint requires HOSTINGER_FTP_TLS_SERVERNAME matching its verified TLS certificate.');
  }
  return {
    host, user, password, port: 21, secure: true,
    secureOptions: { servername, rejectUnauthorized: true, minVersion: 'TLSv1.2' },
  };
}

function filesIn(directory, relative = '') {
  return fs.readdirSync(path.join(directory, relative), { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Deployment artifacts must not contain symbolic links.');
    return entry.isDirectory() ? filesIn(directory, file) : [file];
  });
}

export async function deploy() {
  const distDir = path.resolve('./dist');
  for (const file of ['index.html', '404.html', '.htaccess', 'sitemap.xml']) {
    if (!fs.existsSync(path.join(distDir, file))) throw new Error(`Missing production artifact: ${file}`);
  }
  const config = deploymentConfig();
  const files = filesIn(distDir).sort((a, b) => Number(a.endsWith('.html')) - Number(b.endsWith('.html')) || a.localeCompare(b));
  const client = new ftp.Client(60000);
  // FTP command logging can reveal credentials. TLS is mandatory; no plaintext fallback.
  client.ftp.verbose = false;
  try {
    await client.access(config);
    console.log('Connected with certificate-verified FTPS.');
    if (process.argv.includes('--check')) {
      await client.list('/public_html');
      console.log('Read-only connection check passed; no files were uploaded.');
      return;
    }
    for (const file of files) {
      const remote = `/public_html/${file.split(path.sep).join('/')}`;
      await client.ensureDir(path.posix.dirname(remote));
      await client.uploadFrom(path.join(distDir, file), remote);
    }
    console.log(`Uploaded ${files.length} files; assets preceded HTML. Existing remote files were preserved.`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  deploy().catch(() => {
    // Third-party errors can contain connection details; keep CLI failure output bounded.
    console.error('Secure deployment failed. Check TLS hostname, credentials, connectivity and build artifacts.');
    process.exitCode = 1;
  });
}
