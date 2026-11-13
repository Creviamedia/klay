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
        } entity setup. My name is [Consultant], how may we assist you today?`
      )}`
    : '';
  const callUrl = cleanTel ? `tel:${cleanTel}` : '';
  return { cleanDigits, cleanTel, waUrl, callUrl };
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
    console.warn(`[GOOGLE SHEET WEBHOOK ERROR] Lead ${leadRecord.id}:`, err.message);
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
  } catch (err) {
    console.warn(`[NTFY TARGET ERROR] Parsing error:`, err.message);
  }

  const { waUrl, callUrl } = formatWhatsAppDetails(
    leadRecord.phone,
    leadRecord.name,
    leadRecord.jurisdiction
  );

  const notesLine = leadRecord.notes ? `\n📝 Notes: ${leadRecord.notes}` : '';
  const waDirectLine = waUrl ? `\n💬 WhatsApp: ${waUrl}` : '';
  const callDirectLine = leadRecord.phone ? `\n📞 Call: ${leadRecord.phone}` : '';

  const messageBody = `🏛️ ${leadRecord.jurisdiction || 'UAE'} · ${
    leadRecord.activity || 'General'
  }\n✉️ ${leadRecord.email}${callDirectLine}${waDirectLine}${notesLine}`;

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

exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
    };
  }

  const {
    name,
    email,
    phone,
    jurisdiction,
    activity,
    timeline,
    visaCount,
    notes,
    source,
    ...rest
  } = body;

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedName || !trimmedEmail || !trimmedPhone) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Validation failed: 'name', 'email', and 'phone' are required fields.",
      }),
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Please provide a valid email address.',
      }),
    };
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
    platform: 'netlify-serverless',
  };

  // Run external integrations asynchronously in parallel before returning
  await Promise.allSettled([
    sendPushNotification(leadRecord),
    forwardLeadToGoogleSheet(leadRecord),
  ]);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      leadId,
      referenceNumber: leadId,
      message: `Lead received and registered under ${leadId}`,
    }),
  };
};
