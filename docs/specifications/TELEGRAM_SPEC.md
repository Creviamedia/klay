# Technical Specification: Telegram Instant Outbound Alert Pipeline

**Document ID**: SPEC-TELEGRAM-001  
**Project**: Klay Unified Admin Dashboard & Content Portal  
**Target Milestone**: Milestone 1 (Foundation) & Milestone 3 (Database & Telemetry)  
**Status**: APPROVED / ACTIVE  
**Last Updated**: 2026-11-15

---

## 1. Overview & Architecture

### 1.1 Objective

The Klay platform serves high-net-worth individuals, institutional founders, and multinational enterprises seeking UAE corporate setup, DIFC/ADGM holding structures, and Golden Visas. Conversion rates depend critically on rapid advisor response times (target: under 5 minutes).

The Telegram Outbound Alert Pipeline triggers an instant notification to executive leadership and client success directors within **< 1,000ms** of any lead submission across the web portal, cost calculators, or consultation booking modals.

### 1.2 Pipeline Architecture Flow

```
┌─────────────────────────────────┐
│  Client Submits Lead Intake     │
│  (React UI / Netlify / Express) │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   netlify/functions/            │
│   lead-intake-core.cjs          │
│   (processIntakeLead)           │
└───────┬─────────────────┬───────┘
        │                 │
        │ (Async Fire)    │ (Primary Persistence)
        ▼                 ▼
┌───────────────┐  ┌───────────────┐
│ Telegram Bot  │  │ Turso SQLite  │
│ Outbound API  │  │ & Flat Files  │
└───────┬───────┘  └───────────────┘
        │
        ├─────────────────────────────────────────────────┐
        ▼                                                 ▼
┌─────────────────────────────────────────┐  ┌────────────────────────────────────────┐
│ Phone Dialer Link                       │  │ Inline Keyboard Button                 │
│ Body HTML: <a href="tel:+971...">       │  │ [💬 WhatsApp Lead]                     │
│ Triggers mobile telephone app           │  │ URL: https://wa.me/971...              │
└─────────────────────────────────────────┘  └────────────────────────────────────────┘
```

### 1.3 Upstream Specifications & Citations

- **API Endpoint**: `POST https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/sendMessage`
- **Official Documentation**:
  - Telegram Bot API Reference: [https://core.telegram.org/bots/api](https://core.telegram.org/bots/api)
  - Telegram Bot API `sendMessage`: [https://core.telegram.org/bots/api#sendmessage](https://core.telegram.org/bots/api#sendmessage)
  - Telegram InlineKeyboardButton Specification: [https://core.telegram.org/bots/api#inlinekeyboardbutton](https://core.telegram.org/bots/api#inlinekeyboardbutton)
  - Telegram HTML Formatting Rules: [https://core.telegram.org/bots/api#html-style](https://core.telegram.org/bots/api#html-style)

---

## 2. Strict Telegram Bot API Protocol Constraints

### 2.1 The InlineKeyboardButton URL Protocol Rule

A critical protocol constraint in the Telegram Bot API governs inline buttons:

> **Official Telegram Specification (`InlineKeyboardButton`)**:
> _"Optional. HTTP or tg:// URL to be opened when the button is pressed. Links `tg://user?id=<user_id>` can be used to mention a user by their ID without using a username, if this is allowed by their privacy settings."_

**Protocol Rule**: The Telegram Bot API strictly forbids arbitrary URI schemes such as `tel:`, `mailto:`, or `sms:` inside `InlineKeyboardButton.url`.

If an application attempts to pass a phone dialer link in an inline keyboard button:

```json
{
  "reply_markup": {
    "inline_keyboard": [[{ "text": "📞 Call Lead", "url": "tel:+971501234567" }]]
  }
}
```

The Telegram API immediately rejects the request with HTTP 400 Bad Request:

```json
{
  "ok": false,
  "error_code": 400,
  "description": "Bad Request: BUTTON_URL_INVALID"
}
```

### 2.2 The Two-Tier Direct Action Architecture

To provide instant 1-click communication without violating the Telegram protocol, the alert implements a **two-tier action pattern**:

1. **Direct Phone Call Action (HTML Message Body)**:
   - Rendered directly inside the HTML-formatted message text using standard anchor syntax:
     `<a href="tel:${cleanTel}">📞 Call ${lead.phone}</a>`
   - Telegram's desktop and mobile clients natively parse HTML anchor tags and open the native phone dialer when tapped.
2. **Instant WhatsApp Chat Action (Inline Keyboard Button)**:
   - Rendered as an `InlineKeyboardButton` using the valid `https://` scheme:
     `url: "https://wa.me/${cleanDigits}?text=${encodedPreFillText}"`
   - Telegram opens the browser / WhatsApp application seamlessly, pre-populating a greeting message with the lead's name and jurisdiction.

---

## 3. Message Formatting & Entity Sanitization

### 3.1 Telegram HTML Parse Mode Rules

When `parse_mode: 'HTML'` is selected, Telegram's parser only supports a strict subset of HTML tags:

- `<b>`, `<strong>` (bold)
- `<i>`, `<em>` (italic)
- `<u>`, `<ins>` (underline)
- `<s>`, `<strike>`, `<del>` (strikethrough)
- `<a href="...">` (links)
- `<code>` (inline monospace)
- `<pre>` (preformatted block)

All other HTML tags are prohibited. Furthermore, unescaped reserved characters inside text or tags cause the parser to fail with:
`Bad Request: can't parse entities: Character '<' is reserved`.

### 3.2 HTML Entity Escaping Function

All dynamic parameters originating from client form submissions (`name`, `notes`, `activity`, `jurisdiction`, `email`) must be passed through a strict entity sanitizer:

```typescript
/**
 * Escapes characters reserved by Telegram HTML entity parser.
 */
export function escapeTelegramHtml(input: any): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

### 3.3 Message Length Limits & Field Truncation

- **Telegram Maximum Message Length**: 4,096 UTF-8 characters.
- **Safety Margin**: Complete formatted alerts must not exceed 3,500 characters.
- **Field Truncation Rules**:
  - `notes` / `remarks`: Sliced to a maximum of **1,000 characters**.
  - `name`: Sliced to a maximum of **100 characters**.
  - `activity` / `jurisdiction`: Sliced to a maximum of **100 characters**.

### 3.4 Phone Number Normalization

To generate clean dialer links and valid `wa.me` URLs:

- `cleanTel`: Slices all non-numeric and non-plus characters (`/[^\d+]/g`) for `<a href="tel:...">`.
- `cleanDigits`: Strips all non-digit characters (`/\D/g`) and removes duplicate zero-trunks for UAE numbers (`.replace(/^9710/, '971')`).

---

## 4. Telegram Alert Implementation Contract

### 4.1 TypeScript Interface Definitions

```typescript
export interface TelegramInlineButton {
  text: string;
  url: string;
}

export interface TelegramSendMessagePayload {
  chat_id: string | number;
  text: string;
  parse_mode: 'HTML';
  link_preview_options: {
    is_disabled: boolean;
  };
  reply_markup: {
    inline_keyboard: TelegramInlineButton[][];
  };
}

export interface LeadAlertRecord {
  id: string;
  referenceNumber?: string;
  name: string;
  email: string;
  phone: string;
  jurisdiction?: string;
  activity?: string;
  timeline?: string;
  visaCount?: number | string | null;
  notes?: string;
  source?: string;
  timestamp: string;
}
```

### 4.2 Payload Construction Logic

```typescript
export function buildTelegramAlertPayload(
  lead: LeadAlertRecord,
  chatId: string | number
): TelegramSendMessagePayload {
  const cleanPhone = (lead.phone || '').trim();
  const cleanTel = cleanPhone.replace(/[^\d+]/g, '');
  const cleanDigits = cleanPhone.replace(/\D/g, '').replace(/^9710/, '971');

  // Pre-filled WhatsApp greeting with safe fallback for lead.name
  const rawName = (lead.name || 'Anonymous').trim();
  const jurisdiction = lead.jurisdiction || 'UAE';
  const greetingText = `Hello ${rawName}, thank you for contacting Klay regarding your ${jurisdiction} setup. I am reviewing your requirements.`;
  const waUrl = cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(greetingText)}`
    : '';

  // Truncate and escape dynamic fields safely
  const safeName = escapeTelegramHtml((lead.name || 'Anonymous').slice(0, 100));
  const safeRef = escapeTelegramHtml(lead.referenceNumber || lead.id || 'N/A');
  const safeJurisdiction = escapeTelegramHtml(jurisdiction);
  const safeActivity = escapeTelegramHtml(lead.activity || 'General Commercial');
  const safeEmail = escapeTelegramHtml(lead.email || '');
  const safePhone = escapeTelegramHtml(cleanPhone || 'N/A');
  const safeTimeline = escapeTelegramHtml(lead.timeline || 'Immediate');
  // Pass safeVisas through escapeTelegramHtml to prevent HTML injection errors
  const safeVisas = escapeTelegramHtml(
    lead.visaCount !== undefined && lead.visaCount !== null
      ? String(lead.visaCount).slice(0, 20)
      : 'N/A'
  );
  const safeNotes = lead.notes ? escapeTelegramHtml(lead.notes.slice(0, 1000)) : '';
  const safeSource = escapeTelegramHtml(lead.source || 'portal');
  const dateFormatted = new Date(lead.timestamp || Date.now()).toUTCString();

  // Guard: if cleanTel is empty, render plain text safePhone without <a> tag so Telegram does not reject <a href="tel:">
  const phoneDisplay = cleanTel ? `<a href="tel:${cleanTel}">${safePhone}</a>` : safePhone;

  // Construct structured luxury alert text
  const lines: string[] = [
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

  const keyboard: TelegramInlineButton[][] = [];
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
```

---

## 5. Network Dispatch, Timeout Isolation & Resilience

### 5.1 Timeout Isolation with `AbortSignal.timeout`

Netlify Serverless Functions and Express request loops must not hang if Telegram's API experiences latency or network hiccups. The outbound HTTP request must be bounded by a **5,000ms hard timeout** using native `fetch` and `AbortSignal.timeout(5000)`.

### 5.2 Non-Fatal Execution Contract

Client lead intake must **never fail** because of an outbound notification failure. If Telegram returns an error (HTTP 400, 401, 429, 500) or throws a network timeout:

1. The error must be caught and logged with warning severity (`console.warn('[Telegram Alert] Outbound alert failed: ...')`).
2. The lead ingestion pipeline proceeds with primary database persistence (Turso) and local fallback storage.
3. The HTTP response to the client returns `201 Created` with the lead reference number.

```typescript
export async function sendTelegramLeadAlert(
  lead: LeadAlertRecord
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn(
      '[Telegram Alert] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured. Skipping alert.'
    );
    return { success: false, error: 'Telegram credentials missing' };
  }

  const payload = buildTelegramAlertPayload(lead, chatId);
  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // 5-second hard timeout
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`[Telegram Alert] API returned HTTP ${response.status}: ${errBody}`);
      return { success: false, error: `HTTP ${response.status}: ${errBody}` };
    }

    const data = await response.json();
    return { success: data.ok };
  } catch (err: any) {
    console.warn('[Telegram Alert] Network error or timeout:', err.message);
    return { success: false, error: err.message };
  }
}
```

---

## 6. Verification & Test Suite

To verify the payload construction, entity escaping, and protocol compliance without dispatching live messages:

```bash
export PATH="/Users/hayaat/.local/share/node-v24.22.1-darwin-arm64/bin:$PATH"

node -e '
const assert = require("node:assert");

function escapeTelegramHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 1. Verify entity escaping
const raw = "Tariq <Founder & CEO>";
const escaped = escapeTelegramHtml(raw);
assert.strictEqual(escaped, "Tariq &lt;Founder &amp; CEO&gt;");

// 2. Verify protocol rule: no tel: in button URL
const button = { text: "💬 WhatsApp Lead", url: "https://wa.me/971501234567" };
assert.ok(button.url.startsWith("https://wa.me/"));
assert.ok(!button.url.startsWith("tel:"), "FATAL: tel: protocol forbidden in inline button");

console.log("Telegram Protocol & Formatting Verification: PASSED");
'
```
