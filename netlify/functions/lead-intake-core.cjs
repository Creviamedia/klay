/**
 * Universal Lead Intake Core Pipeline (`netlify/functions/lead-intake-core.cjs`)
 *
 * Shared business logic used by BOTH:
 * 1. Express local server (`server.js`)
 * 2. Netlify serverless function (`netlify/functions/leads.cjs`)
 *
 * Encapsulates:
 * - Sliding-window IP rate limiting with loopback address exemptions
 * - Backward compatibility parsing for single { contact } fields
 * - Strict field trimming & regex email validation
 * - Whitelist field sanitization & sovereign reference generation (KLAY-2026-XXXX)
 * - Safe atomic disk persistence (JSONL, JSON, Google Sheet CSV mirror)
 * - Turso database persistence via @libsql/client with UAE phone normalization
 * - Instant Telegram outbound alert with HTML phone dialer & inline WhatsApp button
 * - Parallel ntfy push alerts & Google Sheet webhooks
 */

const fs = require('node:fs');
const path = require('node:path');
const { randomInt } = require('node:crypto');
function safeCreateLibsqlClient(config) {
  if (!config || !config.url) return null;
  const url = String(config.url).trim();
  if (url.startsWith('libsql:') || url.startsWith('https:') || url.startsWith('http:')) {
    try {
      const { createClient } = require('@libsql/client/web');
      return createClient(config);
    } catch (err) {
      console.warn('[Turso] Web client initialization failed:', err.message);
    }
  }
  try {
    const { createClient } = require('@libsql/client');
    return createClient(config);
  } catch (err) {
    console.warn('[Turso] Native libsql driver unavailable, using fallback:', err.message);
    return null;
  }
}

// Sliding window rate limiter (max 20 requests per 15 min per external IP)
const submissionRateMap = new Map();
function isRateLimited(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'unknown') {
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
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(randomInt(chars.length));
  }
  return `KLAY-${year}-${randomPart}`;
}

function formatWhatsAppDetails(phone, name, jurisdiction) {
  let cleanDigits = (phone || '').replace(/\D/g, '');
  if (cleanDigits.startsWith('9710')) {
    cleanDigits = '971' + cleanDigits.slice(4);
  } else if (
    cleanDigits.startsWith('05') &&
    (cleanDigits.length === 10 || cleanDigits.length === 9)
  ) {
    cleanDigits = '971' + cleanDigits.slice(1);
  }
  const cleanTel = (phone || '').replace(/[^\d+]/g, '');
  const waUrl = cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(
        `Hello ${name}, thank you for contacting Klay Consultants regarding your ${
          jurisdiction || 'UAE'
        } setup. How may our legal desk assist you?`
      )}`
    : '';
  const callUrl = cleanTel ? `tel:${cleanTel}` : '';
  return { cleanDigits, cleanTel, waUrl, callUrl };
}

function persistLeadToDisk(leadRecord, targetDir) {
  try {
    const dataDir = targetDir || path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        return false;
      }
    }

    const leadsJsonlPath = path.join(dataDir, 'leads.jsonl');
    const leadsFilePath = path.join(dataDir, 'leads.json');
    const leadsCsvPath = path.join(dataDir, 'google-sheet-crm.csv');

    // 1. Atomic append to JSONL
    fs.appendFileSync(leadsJsonlPath, JSON.stringify(leadRecord) + '\n', 'utf8');

    // 2. Local JSON array update
    try {
      let leads = [];
      if (fs.existsSync(leadsFilePath)) {
        const raw = fs.readFileSync(leadsFilePath, 'utf8');
        leads = JSON.parse(raw);
        if (!Array.isArray(leads)) leads = [];
      }
      leads.push(leadRecord);
      fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch {
      // Non-fatal
    }

    // 3. Local Google Sheets compatible CSV mirror
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
  } catch {
    // Non-fatal on read-only filesystems (e.g. AWS Lambda Netlify function)
    return false;
  }
}

// Turso Connection Management
let cachedTursoClient = null;

function getTursoClient(customOptions = {}) {
  if (customOptions.client) return customOptions.client;
  if (cachedTursoClient && !customOptions.resetCache) return cachedTursoClient;

  const cloudUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (cloudUrl && cloudUrl.trim().length > 0) {
    cachedTursoClient = safeCreateLibsqlClient({
      url: cloudUrl.trim(),
      authToken: authToken ? authToken.trim() : undefined,
    });
    return cachedTursoClient;
  }

  // Tier 2: data/klay.db
  try {
    const dataDir = customOptions.dataDir || path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fall back to Tier 3
      }
    }
    const localDbPath = path.join(dataDir, 'klay.db');
    cachedTursoClient = safeCreateLibsqlClient({ url: `file:${localDbPath}` });
    return cachedTursoClient;
  } catch {
    const tempDbPath = path.join('/tmp', 'klay.db');
    cachedTursoClient = safeCreateLibsqlClient({ url: `file:${tempDbPath}` });
    return cachedTursoClient;
  }
}

/**
 * Persist lead record into Turso database with UAE phone normalization.
 */
async function persistLeadToTurso(leadRecord, options = {}) {
  try {
    const client = getTursoClient(options);
    if (!client) return false;

    const rawPhone = leadRecord.phone || '';
    let phoneToStore = rawPhone.trim();
    const digitsOnly = phoneToStore.replace(/\D/g, '');

    // Normalize local UAE phone numbers (05... to 9715...)
    if (digitsOnly.startsWith('05') && (digitsOnly.length === 10 || digitsOnly.length === 9)) {
      phoneToStore = '971' + digitsOnly.slice(1);
    } else if (phoneToStore.startsWith('05')) {
      phoneToStore = '971' + phoneToStore.slice(1);
    } else if (digitsOnly.startsWith('97105')) {
      phoneToStore = '971' + digitsOnly.slice(4);
    }

    const leadId = leadRecord.id || leadRecord.referenceNumber || `KLAY-${Date.now()}`;
    const refNum = leadRecord.referenceNumber || leadId;
    const timestamp = leadRecord.timestamp || new Date().toISOString();
    const status = leadRecord.status || 'New';

    await client.execute({
      sql: `INSERT INTO leads (
        id, reference_number, timestamp, name, email, phone,
        jurisdiction, activity, timeline, visa_count, notes,
        source, platform, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        updated_at = CURRENT_TIMESTAMP`,
      args: [
        leadId,
        refNum,
        timestamp,
        leadRecord.name || 'Anonymous',
        leadRecord.email || '',
        phoneToStore,
        leadRecord.jurisdiction || 'UAE',
        leadRecord.activity || 'General',
        leadRecord.timeline || null,
        typeof leadRecord.visaCount === 'number'
          ? leadRecord.visaCount
          : typeof leadRecord.visa_count === 'number'
            ? leadRecord.visa_count
            : null,
        leadRecord.notes || null,
        leadRecord.source || 'calculator',
        leadRecord.platform || 'node',
        status,
        leadRecord.created_at || timestamp,
        leadRecord.updated_at || timestamp,
      ],
    });

    return true;
  } catch (err) {
    console.warn('[Turso Lead Persistence Error]:', err.message);
    return false;
  }
}

/**
 * Escapes reserved HTML entities for Telegram Bot API HTML parser.
 */
function escapeTelegramHtml(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Constructs structured Telegram alert payload complying with protocol constraints:
 * - HTML phone dialer link in message text
 * - Inline keyboard with https://wa.me/ WhatsApp button (no tel: URI scheme in button)
 * - Escaped entities and truncated notes
 */
function buildTelegramAlertPayload(lead, chatId) {
  const cleanPhone = (lead.phone || '').trim();
  const cleanTel = cleanPhone.replace(/[^\d+]/g, '');
  let cleanDigits = cleanPhone.replace(/\D/g, '');
  if (cleanDigits.startsWith('9710')) {
    cleanDigits = '971' + cleanDigits.slice(4);
  } else if (
    cleanDigits.startsWith('05') &&
    (cleanDigits.length === 10 || cleanDigits.length === 9)
  ) {
    cleanDigits = '971' + cleanDigits.slice(1);
  }

  const rawName = (lead.name || 'Anonymous').trim();
  const jurisdiction = lead.jurisdiction || 'UAE';
  const greetingText = `Hello ${rawName}, thank you for contacting Klay regarding your ${jurisdiction} setup. I am reviewing your requirements.`;
  const waUrl = cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(greetingText)}`
    : '';

  const safeName = escapeTelegramHtml((lead.name || 'Anonymous').slice(0, 100));
  const safeRef = escapeTelegramHtml(lead.referenceNumber || lead.id || 'N/A');
  const safeJurisdiction = escapeTelegramHtml(jurisdiction);
  const safeActivity = escapeTelegramHtml(lead.activity || 'General Commercial');
  const safeEmail = escapeTelegramHtml(lead.email || '');
  const safePhone = escapeTelegramHtml(cleanPhone || 'N/A');
  const safeTimeline = escapeTelegramHtml(lead.timeline || 'Immediate');
  const safeVisas = escapeTelegramHtml(
    lead.visaCount !== undefined && lead.visaCount !== null
      ? String(lead.visaCount).slice(0, 20)
      : 'N/A'
  );
  const safeNotes = lead.notes ? escapeTelegramHtml(String(lead.notes).slice(0, 1000)) : '';
  const safeSource = escapeTelegramHtml(lead.source || 'portal');
  const dateFormatted = new Date(lead.timestamp || Date.now()).toUTCString();

  const phoneDisplay = cleanTel ? `<a href="tel:${cleanTel}">${safePhone}</a>` : safePhone;

  const lines = [
    `🏛️ <b>NEW INCOMING LEAD: ${safeName}</b>`,
    `🆔 Reference: <code>${safeRef}</code>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌐 <b>Jurisdiction:</b> ${safeJurisdiction}`,
    `💼 <b>Activity:</b> ${safeActivity}`,
    `✉️ <b>Email:</b> ${safeEmail}`,
    `📞 <b>Phone:</b> ${phoneDisplay}`,
    `👥 <b>Visas:</b> ${safeVisas}`,
    `⏱️ <b>Timeline:</b> ${safeTimeline}`,
    `📍 <b>Source:</b> ${safeSource}`,
  ];

  if (safeNotes) {
    lines.push(`📝 <b>Notes:</b> <i>${safeNotes}</i>`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🕒 <i>Captured at: ${dateFormatted}</i>`);

  const keyboard = [];
  if (waUrl) {
    keyboard.push([
      {
        text: '💬 WhatsApp Lead',
        url: waUrl,
      },
    ]);
  }

  return {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'HTML',
    link_preview_options: {
      is_disabled: true,
    },
    reply_markup: {
      inline_keyboard: keyboard,
    },
  };
}

/**
 * Dispatches outbound Telegram alert with non-fatal timeout isolation (AbortSignal.timeout(5000)).
 */
async function sendTelegramAlert(leadRecord) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return { success: false, error: 'Telegram credentials missing' };
  }

  const payload = buildTelegramAlertPayload(leadRecord, chatId);
  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`[Telegram Alert] API returned HTTP ${response.status}: ${errBody}`);
      return { success: false, error: `HTTP ${response.status}: ${errBody}` };
    }

    const data = await response.json();
    return { success: Boolean(data.ok) };
  } catch (err) {
    console.warn('[Telegram Alert] Network error or timeout:', err.message);
    return { success: false, error: err.message };
  }
}

async function forwardLeadToGoogleSheet(leadRecord) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadRecord),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.warn(`[GOOGLE SHEET ERROR] Lead ${leadRecord.id}:`, err.message);
  }
}

async function sendPushNotification(leadRecord) {
  const ntfyTarget = (process.env.NTFY_TOPIC_URL || '').trim();
  if (!ntfyTarget) return;
  let targetUrl;
  let topic;
  try {
    const parsed = new URL(ntfyTarget);
    if (parsed.protocol !== 'https:') return;
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length !== 1 || parsed.username || parsed.password || parsed.search || parsed.hash) return;
    targetUrl = parsed.origin;
    topic = segments[0];
  } catch {
    return;
  }

  try {
    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        title: 'New Klay lead',
        priority: 4,
        tags: ['briefcase'],
        message: `Reference: ${leadRecord.id}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.warn(`[NTFY ERROR] Lead ${leadRecord.id}:`, err.message);
  }
}

/**
 * Universal Intake Processing Pipeline
 * Handles rate limiting, validation, fallback contact parsing, persistence, and alerts.
 */
async function processIntakeLead(rawBody = {}, context = {}) {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return { statusCode: 400, body: { success: false, error: 'Invalid lead data' } };
  }
  const clientIp = context.clientIp || 'unknown';

  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      body: {
        success: false,
        error: 'Too many requests. Please wait a few minutes before submitting again.',
      },
    };
  }

  let { name, email, phone, contact, jurisdiction, activity, timeline, visaCount, notes, source } =
    rawBody;

  const limits = { name: 120, email: 254, phone: 32, contact: 254, jurisdiction: 80, activity: 120, timeline: 80, notes: 1000, source: 80 };
  for (const [field, maxLength] of Object.entries(limits)) {
    const value = rawBody[field];
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > maxLength)) {
      return { statusCode: 400, body: { success: false, error: `Invalid ${field}` } };
    }
  }
  if (visaCount !== undefined && visaCount !== null &&
      !((typeof visaCount === 'number' || typeof visaCount === 'string') && String(visaCount).length <= 8)) {
    return { statusCode: 400, body: { success: false, error: 'Invalid visaCount' } };
  }

  // Backward compatibility: If client sent single 'contact' field
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
    return {
      statusCode: 400,
      body: {
        success: false,
        error: "Validation failed: 'name', 'email', and 'phone' are required fields.",
      },
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'Please provide a valid email address.',
      },
    };
  }

  const leadId = generateSovereignReference();
  const timestamp = new Date().toISOString();

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
    platform: context.platform || 'node',
    status: 'New',
  };

  // 1. Disk persistence (safe on both local and serverless)
  persistLeadToDisk(leadRecord, context.dataDir);

  // 2. Turso database persistence + Telegram outbound alert + Push + Google Sheet (concurrent via Promise.allSettled)
  await Promise.allSettled([
    persistLeadToTurso(leadRecord, { dataDir: context.dataDir, client: context.tursoClient }),
    sendTelegramAlert(leadRecord),
    sendPushNotification(leadRecord),
    forwardLeadToGoogleSheet(leadRecord),
  ]);

  return {
    statusCode: 201,
    body: {
      success: true,
      leadId,
      referenceNumber: leadId,
      message: `Lead received and registered under ${leadId}`,
    },
    leadRecord,
  };
}

module.exports = {
  processIntakeLead,
  isRateLimited,
  generateSovereignReference,
  formatWhatsAppDetails,
  persistLeadToDisk,
  persistLeadToTurso,
  getTursoClient,
  sendTelegramAlert,
  buildTelegramAlertPayload,
  escapeTelegramHtml,
  sendPushNotification,
  forwardLeadToGoogleSheet,
};
