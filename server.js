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

const dataDir = path.join(__dirname, 'data');
const leadsFilePath = path.join(dataDir, 'leads.json');
const leadsJsonlPath = path.join(dataDir, 'leads.jsonl');
const leadsCsvPath = path.join(dataDir, 'google-sheet-crm.csv');

// Lightweight in-memory sliding window rate limiter (max 20 requests per 15 min per external IP)
const submissionRateMap = new Map();
function isRateLimited(ip) {
  // Allow local loopback addresses (automated testing, development, and UAT verification)
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'unknown') {
    return false;
  }
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 20;
  const timestamps = (submissionRateMap.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) return true;
  timestamps.push(now);
  submissionRateMap.set(ip, timestamps);
  return false;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateSovereignReference() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KLAY-${year}-${randomPart}`;
}

function formatWhatsAppDetails(phone, name, jurisdiction) {
  let cleanDigits = (phone || '').replace(/\D/g, '');
  // UAE trunk prefix fix: e.g. +971 050 123 4567 -> 9710501234567 -> 971501234567
  if (cleanDigits.startsWith('9710')) {
    cleanDigits = '971' + cleanDigits.slice(4);
  }
  const cleanTel = (phone || '').replace(/[^\d+]/g, '');
  const waUrl = cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(`Hello ${name}, thank you for contacting Klay Consultants regarding your ${jurisdiction || 'UAE'} setup. How may our legal desk assist you?`)}`
    : '';
  const callUrl = cleanTel ? `tel:${cleanTel}` : '';
  return { cleanDigits, cleanTel, waUrl, callUrl };
}

function persistLeadToDisk(leadRecord) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    // Atomic append to JSONL (immune to concurrent read-modify-write overwrite)
    fs.appendFileSync(leadsJsonlPath, JSON.stringify(leadRecord) + '\n', 'utf8');

    try {
      let leads = [];
      if (fs.existsSync(leadsFilePath)) {
        const raw = fs.readFileSync(leadsFilePath, 'utf8');
        leads = JSON.parse(raw);
        if (!Array.isArray(leads)) leads = [];
      }
      leads.push(leadRecord);
      fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch (parseErr) {
      console.warn(`[LEADS DB] Warning updating ${leadsFilePath}:`, parseErr.message);
    }

    // Also maintain a local Google Sheets compatible CSV mirror for testing
    const { waUrl } = formatWhatsAppDetails(
      leadRecord.phone,
      leadRecord.name,
      leadRecord.jurisdiction
    );

    if (!fs.existsSync(leadsCsvPath)) {
      const csvHeader =
        'Reference ID,Timestamp,Name,Email,Phone,Jurisdiction,Activity,Timeline,Visa Count,Notes,Source,WhatsApp Link\r\n';
      fs.writeFileSync(leadsCsvPath, csvHeader, 'utf8');
    }
    const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
    const csvRow =
      [
        escapeCsv(leadRecord.id),
        escapeCsv(leadRecord.timestamp),
        escapeCsv(leadRecord.name),
        escapeCsv(leadRecord.email),
        escapeCsv(leadRecord.phone),
        escapeCsv(leadRecord.jurisdiction),
        escapeCsv(leadRecord.activity),
        escapeCsv(leadRecord.timeline),
        escapeCsv(leadRecord.visaCount),
        escapeCsv(leadRecord.notes),
        escapeCsv(leadRecord.source),
        escapeCsv(waUrl),
      ].join(',') + '\r\n';
    fs.appendFileSync(leadsCsvPath, csvRow, 'utf8');

    return true;
  } catch (err) {
    console.error(`[LEADS DB ERROR] Failed to save lead ${leadRecord.id}:`, err.message);
    return false;
  }
}

function forwardLeadToGoogleSheet(leadRecord) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) return;

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadRecord),
    signal: AbortSignal.timeout(10000),
  })
    .then((res) => {
      if (!res.ok) {
        console.warn(`[GOOGLE SHEET WEBHOOK WARNING] HTTP ${res.status} for lead ${leadRecord.id}`);
      } else {
        console.log(`[GOOGLE SHEET WEBHOOK SUCCESS] Dispatched lead ${leadRecord.id}`);
      }
    })
    .catch((err) => {
      console.warn(`[GOOGLE SHEET WEBHOOK ERROR] Lead ${leadRecord.id}:`, err.message);
    });
}

function sendPushNotification(leadRecord) {
  const ntfyTarget = (process.env.NTFY_TOPIC_URL || 'https://ntfy.sh/klay-leads-dubai').trim();
  if (!ntfyTarget) return;

  let targetUrl = 'https://ntfy.sh';
  let topic = 'klay-leads-dubai';

  try {
    if (ntfyTarget.startsWith('http://') || ntfyTarget.startsWith('https://')) {
      const parsed = new URL(ntfyTarget);
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        topic = segments[segments.length - 1];
        targetUrl = parsed.origin;
      } else {
        targetUrl = parsed.origin;
      }
    } else {
      topic = ntfyTarget;
    }
  } catch (err) {
    console.warn(
      `[NTFY TARGET ERROR] Could not parse "${ntfyTarget}", falling back to default topic:`,
      err.message
    );
  }

  const { waUrl, callUrl } = formatWhatsAppDetails(
    leadRecord.phone,
    leadRecord.name,
    leadRecord.jurisdiction
  );

  const notesLine = leadRecord.notes ? `\n📝 Notes: ${leadRecord.notes}` : '';
  const waDirectLine = waUrl ? `\n💬 WhatsApp: ${waUrl}` : '';
  const callDirectLine = leadRecord.phone ? `\n📞 Call: ${leadRecord.phone}` : '';

  // Rich message body formatted for mobile notification shade and web client
  const messageBody = `🏛️ ${leadRecord.jurisdiction || 'UAE'} · ${leadRecord.activity || 'General'}\n✉️ ${leadRecord.email}${callDirectLine}${waDirectLine}${notesLine}`;

  const actions = [];
  if (waUrl) {
    actions.push({
      action: 'view',
      label: '💬 WhatsApp Lead',
      url: waUrl,
      clear: true,
    });
  }
  if (callUrl) {
    actions.push({
      action: 'view',
      label: '📞 Call Lead',
      url: callUrl,
      clear: true,
    });
  }

  fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      title: `🏛️ New Klay Lead: ${leadRecord.name}`,
      priority: 4,
      tags: ['briefcase', 'dubai', 'whatsapp'],
      message: messageBody,
      click: waUrl || undefined,
      actions: actions.length > 0 ? actions : undefined,
    }),
    signal: AbortSignal.timeout(10000),
  })
    .then((res) => {
      if (!res.ok) {
        console.warn(`[NTFY WARNING] HTTP ${res.status} for lead ${leadRecord.id}`);
      } else {
        console.log(
          `[NTFY SUCCESS] Push alert with 1-tap WhatsApp and Call buttons dispatched for lead ${leadRecord.id} (topic: ${topic})`
        );
      }
    })
    .catch((err) => {
      console.warn(`[NTFY ERROR] Lead ${leadRecord.id}:`, err.message);
    });
}

app.post('/api/leads', (request, response) => {
  const clientIp =
    request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    request.socket.remoteAddress ||
    'unknown';
  if (isRateLimited(clientIp)) {
    return response.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a few minutes before submitting again.',
    });
  }

  let { name, email, phone, contact, jurisdiction, activity, timeline, visaCount, notes, source } =
    request.body || {};

  // Backward compatibility: If client sent single 'contact' field (e.g. legacy quick widgets)
  if (contact && (!email || !phone)) {
    const contactStr = String(contact).trim();
    if (contactStr.includes('@')) {
      email = email || contactStr;
      phone = phone || '+971 50 000 0000';
    } else {
      phone = phone || contactStr;
      email = email || 'inquiry@klayconsultants.com';
    }
    name = name || 'Executive Calculator Lead';
  }

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

  if (!trimmedName || !trimmedEmail || !trimmedPhone) {
    return response.status(400).json({
      success: false,
      error: "Validation failed: 'name', 'email', and 'phone' are required fields.",
    });
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return response.status(400).json({
      success: false,
      error: 'Please provide a valid email address.',
    });
  }

  const leadId = generateSovereignReference();
  const timestamp = new Date().toISOString();

  // Whitelist fields only — no arbitrary property spreading
  const leadRecord = {
    id: leadId,
    referenceNumber: leadId,
    timestamp,
    name: trimmedName,
    email: trimmedEmail,
    phone: trimmedPhone,
    jurisdiction: jurisdiction || 'UAE',
    activity: activity || 'General',
    timeline: timeline || null,
    visaCount: visaCount !== undefined ? visaCount : null,
    notes: notes ? String(notes).trim().slice(0, 1000) : null,
    source: source || 'calculator',
  };

  console.log(`[LEAD RECEIVED - ${process.env.VITE_ENVIRONMENT || 'local'}] ID: ${leadId}`, {
    name: trimmedName,
    email: trimmedEmail,
    phone: trimmedPhone,
    jurisdiction: leadRecord.jurisdiction,
    activity: leadRecord.activity,
    source: leadRecord.source,
    timestamp,
  });

  // 1. Persist lead to local JSON database
  persistLeadToDisk(leadRecord);

  // 2. Asynchronously forward to Google Sheet Webhook if configured
  forwardLeadToGoogleSheet(leadRecord);

  // 3. Asynchronously send instant push notification via ntfy.sh
  sendPushNotification(leadRecord);

  // 4. Respond to client
  return response.status(201).json({
    success: true,
    leadId,
    referenceNumber: leadId,
    message: `Lead received and registered under ${leadId}`,
  });
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'Not found' });
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
