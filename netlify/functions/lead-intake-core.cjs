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
 * - Parallel ntfy push alerts & Google Sheet webhooks
 */

const fs = require('node:fs');
const path = require('node:path');

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
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KLAY-${year}-${randomPart}`;
}

function formatWhatsAppDetails(phone, name, jurisdiction) {
  let cleanDigits = (phone || '').replace(/\D/g, '');
  if (cleanDigits.startsWith('9710')) {
    cleanDigits = '971' + cleanDigits.slice(4);
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
  } catch (err) {
    // Non-fatal on read-only filesystems (e.g. AWS Lambda Netlify function)
    return false;
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
  } catch {
    // Fall back to default
  }

  const { waUrl, callUrl } = formatWhatsAppDetails(
    leadRecord.phone,
    leadRecord.name,
    leadRecord.jurisdiction
  );
  const notesLine = leadRecord.notes ? `\n📝 Notes: ${leadRecord.notes}` : '';
  const waDirectLine = waUrl ? `\n💬 WhatsApp: ${waUrl}` : '';
  const callDirectLine = leadRecord.phone ? `\n📞 Call: ${leadRecord.phone}` : '';

  const messageBody = `🏛️ ${leadRecord.jurisdiction || 'UAE'} · ${leadRecord.activity || 'General'}\n✉️ ${leadRecord.email}${callDirectLine}${waDirectLine}${notesLine}`;

  const actions = [];
  if (waUrl) actions.push({ action: 'view', label: '💬 WhatsApp Lead', url: waUrl, clear: true });
  if (callUrl) actions.push({ action: 'view', label: '📞 Call Lead', url: callUrl, clear: true });

  try {
    await fetch(targetUrl, {
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
  };

  // Disk persistence (safe on both local and serverless)
  persistLeadToDisk(leadRecord, context.dataDir);

  // Parallel alerts
  await Promise.allSettled([
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
  sendPushNotification,
  forwardLeadToGoogleSheet,
};
