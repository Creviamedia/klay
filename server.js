const express = require('express');
const compression = require('compression');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const app = express();
const port = Number(process.env.PORT) || 3001;
const distPath = path.join(__dirname, 'dist');
const notFoundPath = path.join(distPath, '404.html');
const productionStart = process.argv.includes('--production');
const hasBuild = fs.existsSync(distPath);
// Optional, for a Node deployment behind a TLS-terminating proxy: CANONICAL_HOST=klayconsultants.com sends every
// request for another host name, or over plain http (per X-Forwarded-Proto), to https://CANONICAL_HOST in one
// redirect. The proxy must set X-Forwarded-Proto, or every request would be redirected. Unset: no host redirect.
const canonicalHost = (process.env.CANONICAL_HOST || '').trim().toLowerCase().replace(/\.$/, '');

if (productionStart && !hasBuild) {
  console.error('Production build not found. Run "npm run build" before starting the server.');
  process.exit(1);
}

// Keep in sync with the "/*" [[headers]] block in netlify.toml (except its Netlify-only X-Robots-Tag) and with
// SECURITY_HEADERS in scripts/seo.cjs (Hostinger .htaccess).
// No enforcing Content-Security-Policy yet: GTM, the Fillout/zite.com form iframes (Cloudflare Turnstile),
// and images.pexels.com need a tested allow-list first (start with Content-Security-Policy-Report-Only).
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'accelerometer=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), ' +
    'magnetometer=(), microphone=(), midi=(), payment=(), serial=(), usb=(), xr-spatial-tracking=()',
  'X-Frame-Options': 'SAMEORIGIN',
};

// Keep in sync with the Cache-Control [[headers]] blocks in netlify.toml and CACHE in scripts/seo.cjs.
const CACHE_HTML = 'public, max-age=0, must-revalidate';
const CACHE_IMMUTABLE = 'public, max-age=31536000, immutable';
const CACHE_MEDIA = 'public, max-age=2592000';
const CACHE_ICONS = 'public, max-age=86400';
const CACHE_SHORT = 'public, max-age=3600';
const ICON_FILES = new Set([
  'favicon.ico',
  'favicon-48.png',
  'apple-touch-icon.png',
  'site.webmanifest',
]);
// Netlify reads these as configuration and never serves them; do the same here.
const NETLIFY_CONFIG_PATHS = new Set(['/_redirects', '/_headers']);

function cacheControlFor(filePath) {
  const relative = path.relative(distPath, filePath).split(path.sep).join('/');
  const [topLevel] = relative.split('/');
  if (relative.endsWith('.html')) return CACHE_HTML;
  if (topLevel === 'assets') return CACHE_IMMUTABLE;
  if (topLevel === 'images' || topLevel === 'videos' || topLevel === 'fonts') return CACHE_MEDIA;
  if (relative === 'robots.txt' || relative === 'llms.txt' || /^sitemap[\w-]*\.xml$/.test(relative))
    return CACHE_SHORT;
  if (ICON_FILES.has(relative) || /^icon-\d+\.png$/.test(relative)) return CACHE_ICONS;
  return CACHE_HTML; // other unhashed root files: same as Netlify's default (always revalidate)
}

/** Decoded path without a trailing slash, so "/a%2Cb/" and "/a,b" match the same rule (as on Netlify). */
function redirectKey(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // malformed escape sequence: match the raw path
  }
  return decoded.replace(/\/+$/, '') || '/';
}

function sendNotFound(_request, response, next) {
  if (hasBuild && fs.existsSync(notFoundPath)) {
    return response
      .status(404)
      .sendFile(notFoundPath, { headers: { 'Cache-Control': CACHE_HTML } }, (error) => {
        if (error) next(error);
      });
  }
  return response.status(404).type('text/plain').send('Page not found');
}

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((_request, response, next) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.setHeader(name, value);
  next();
});

function requestProtocol(request) {
  const forwarded = String(request.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  return forwarded || (request.socket.encrypted ? 'https' : 'http');
}

if (canonicalHost) {
  app.use((request, response, next) => {
    // Health checks and certificate validation often arrive over plain http on an internal host name.
    if (request.path === '/api/health' || request.path.startsWith('/.well-known/')) return next();
    const host = String(request.headers.host || '')
      .toLowerCase()
      .replace(/:\d+$/, '')
      .replace(/\.$/, '');
    if (host === canonicalHost && requestProtocol(request) === 'https') return next();
    // 301 for GET/HEAD (HEAD gets no body); 308 keeps the method and body of anything else.
    const status = request.method === 'GET' || request.method === 'HEAD' ? 301 : 308;
    return response.redirect(status, `https://${canonicalHost}${request.originalUrl}`);
  });
}

// gzip/brotli for compressible responses (HTML, JS, CSS, JSON, XML, SVG); images and video are skipped.
app.use(compression());

// Same as the dist/.htaccess rules from buildHtaccess() in scripts/seo.cjs: /index.html and /<path>/index.html
// 301 to the folder URL (no duplicate pages), and old WordPress sitemaps 301 to the sitemap index.
// Keep OLD_WORDPRESS_SITEMAP in sync with OLD_WORDPRESS_SITEMAP_PATTERN there.
const OLD_WORDPRESS_SITEMAP =
  /^\/(?:sitemap_index|wp-sitemap[a-z0-9_-]*|[a-z0-9_]+-sitemap[0-9]*)\.xml$/;
app.use((request, response, next) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();
  const queryIndex = request.originalUrl.indexOf('?');
  const query = queryIndex >= 0 ? request.originalUrl.slice(queryIndex) : '';
  if (/\/index\.html$/i.test(request.path)) {
    // Collapse leading slashes so "//host/index.html" can never become a protocol-relative redirect.
    const folder = request.path.replace(/index\.html$/i, '').replace(/^\/+/, '/');
    return response.redirect(301, `${folder}${query}`);
  }
  if (OLD_WORDPRESS_SITEMAP.test(request.path))
    return response.redirect(301, `/sitemap.xml${query}`);
  return next();
});

// Apply the same 301 redirects Netlify reads from dist/_redirects (generated by scripts/seo.cjs).
const redirectsPath = path.join(distPath, '_redirects');
const redirects = new Map();
if (fs.existsSync(redirectsPath)) {
  for (const line of fs.readFileSync(redirectsPath, 'utf8').split(/\r?\n/)) {
    const [from, to, status] = line.trim().split(/\s+/);
    if (!from || from.startsWith('#') || !to) continue;
    redirects.set(redirectKey(from), { to, status: Number.parseInt(status, 10) || 301 });
  }
}
app.use((request, response, next) => {
  // Only GET and HEAD are redirected (HEAD gets the same 301 without a body); other methods fall through.
  if (!redirects.size || (request.method !== 'GET' && request.method !== 'HEAD')) return next();
  const redirect = redirects.get(redirectKey(request.path));
  if (!redirect) return next();
  // Netlify passes the query string on to the target; keep it here too.
  const queryIndex = request.originalUrl.indexOf('?');
  const query = queryIndex >= 0 ? request.originalUrl.slice(queryIndex) : '';
  return response.redirect(redirect.status, `${redirect.to}${query}`);
});

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', environment: process.env.VITE_ENVIRONMENT || 'production' });
});

const { processIntakeLead } = require('./netlify/functions/lead-intake-core.cjs');

app.post('/api/leads', async (request, response) => {
  const clientIp =
    request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    request.socket.remoteAddress ||
    'unknown';

  const result = await processIntakeLead(request.body, {
    clientIp,
    platform: 'express',
    dataDir: path.join(__dirname, 'data'),
  });

  return response.status(result.statusCode).json(result.body);
});

const {
  resolveClientIp,
  requireAdminAuth,
  handleAdminLogin,
  handleAdminLogout,
  handleGetLeads,
  handlePatchLead,
  handleGetBlogs,
  handlePostBlog,
  handleDeleteBlog,
} = require('./netlify/functions/admin-core.cjs');

// Admin Authentication & Session routes
app.post('/api/admin/login', async (request, response) => {
  const clientIp = resolveClientIp(request);
  const result = await handleAdminLogin(request.body, clientIp);
  for (const [key, value] of Object.entries(result.headers || {})) {
    response.setHeader(key, value);
  }
  return response.status(result.statusCode).json(result.body);
});

app.post('/api/admin/logout', (request, response) => {
  const result = handleAdminLogout();
  for (const [key, value] of Object.entries(result.headers || {})) {
    response.setHeader(key, value);
  }
  return response.status(result.statusCode).json(result.body);
});

// Admin Authorization Middleware
function requireAdmin(request, response, next) {
  const auth = requireAdminAuth(request);
  if (!auth.authenticated) {
    return response.status(auth.status || 401).json({ error: auth.error || 'Unauthorized' });
  }
  request.adminUser = auth.user;
  next();
}

// Protected Admin API Endpoints
app.get('/api/admin/leads', requireAdmin, (request, response) => {
  const result = handleGetLeads(request.query);
  return response.status(result.statusCode).json(result.body);
});

app.patch('/api/admin/leads/:id', requireAdmin, (request, response) => {
  const result = handlePatchLead(request.params.id, request.body);
  return response.status(result.statusCode).json(result.body);
});

app.get('/api/admin/blogs', requireAdmin, (request, response) => {
  const result = handleGetBlogs();
  return response.status(result.statusCode).json(result.body);
});

app.post('/api/admin/blogs', requireAdmin, (request, response) => {
  const result = handlePostBlog(request.body);
  return response.status(result.statusCode).json(result.body);
});

app.delete('/api/admin/blogs/:slug', requireAdmin, (request, response) => {
  const result = handleDeleteBlog(request.params.slug);
  return response.status(result.statusCode).json(result.body);
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

// SPA fallback for /admin* routes so direct browser hits or refreshes do not 404
app.get(/^\/admin(\/.*)?$/, (_request, response, next) => {
  const indexPath = path.join(distPath, 'index.html');
  if (hasBuild && fs.existsSync(indexPath)) {
    return response.sendFile(indexPath, { headers: { 'Cache-Control': CACHE_HTML } }, (error) => {
      if (error) next(error);
    });
  }
  return response
    .status(200)
    .type('text/html')
    .send(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Klay Admin Portal</title></head><body><div id="root">Admin Portal Loading...</div></body></html>'
    );
});

if (hasBuild) {
  app.use((request, response, next) =>
    NETLIFY_CONFIG_PATHS.has(request.path) ? sendNotFound(request, response, next) : next()
  );
  app.use(
    express.static(distPath, {
      index: 'index.html',
      cacheControl: false,
      setHeaders(response, filePath) {
        response.setHeader('Cache-Control', cacheControlFor(filePath));
      },
    })
  );
}

app.use(sendNotFound);

// Last resort: log the error and answer without a stack trace (Express prints one unless NODE_ENV=production).
app.use((error, _request, response, next) => {
  console.error(error);
  if (response.headersSent) return next(error);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  return response
    .status(status)
    .type('text/plain')
    .send(http.STATUS_CODES[status] ?? 'Error');
});

app.listen(port, () => {
  console.log(`Klay Consultants server listening on port ${port}`);
});
