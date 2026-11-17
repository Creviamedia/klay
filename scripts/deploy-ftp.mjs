import * as ftp from 'basic-ftp';
import fs from 'node:fs';
import path from 'node:path';

async function deploy() {
  const distDir = path.resolve('./dist');
  if (!fs.existsSync(distDir)) {
    console.error('Error: ./dist directory does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  const client = new ftp.Client(60000);
  client.ftp.verbose = true;

  const host = process.env.HOSTINGER_SFTP_HOST || '217.196.55.88';
  const user = process.env.HOSTINGER_SFTP_USER || 'u505970159.klayconsultants.com';
  const password = process.env.HOSTINGER_SFTP_PASSWORD || 'Klay@2024';

  try {
    console.log(`📡 Connecting to Hostinger FTP (${host}:21)...`);
    await client.access({
      host,
      user,
      password,
      port: 21,
      secure: false,
    });
    console.log('✅ FTP Connected successfully!');

    console.log('🚀 Synchronizing ./dist into /public_html...');
    await client.uploadFromDir(distDir, '/public_html');
    console.log('✅ Directory upload complete!');

    // Explicitly upload dotfiles and critical configs
    const htaccessFiles = [
      { local: path.join(distDir, '.htaccess'), remote: '/public_html/.htaccess' },
      { local: path.join(distDir, 'assets/.htaccess'), remote: '/public_html/assets/.htaccess' },
      { local: path.join(distDir, 'images/.htaccess'), remote: '/public_html/images/.htaccess' },
      { local: path.join(distDir, 'robots.txt'), remote: '/public_html/robots.txt' },
      { local: path.join(distDir, 'sitemap.xml'), remote: '/public_html/sitemap.xml' },
      { local: path.join(distDir, 'sitemap-index.xml'), remote: '/public_html/sitemap-index.xml' },
      { local: path.join(distDir, 'sitemap-pages.xml'), remote: '/public_html/sitemap-pages.xml' },
      {
        local: path.join(distDir, 'sitemap-services.xml'),
        remote: '/public_html/sitemap-services.xml',
      },
      {
        local: path.join(distDir, 'sitemap-articles.xml'),
        remote: '/public_html/sitemap-articles.xml',
      },
      { local: path.join(distDir, 'llms.txt'), remote: '/public_html/llms.txt' },
      { local: path.join(distDir, 'api/leads.php'), remote: '/public_html/api/leads.php' },
    ];

    for (const item of htaccessFiles) {
      if (fs.existsSync(item.local)) {
        console.log(`🔒 Ensuring critical file is uploaded: ${item.remote}`);
        await client.uploadFrom(item.local, item.remote);
      }
    }

    console.log('🎉 Production deployment to Hostinger completed successfully!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
