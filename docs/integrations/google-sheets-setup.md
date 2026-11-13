# Klay Consultants — Sovereign Lead Engine Integration Guide

This guide details how to connect the Klay Consultants custom lead engine with:
1. **Google Sheets** for centralized CRM spreadsheet tracking via a serverless Google Apps Script webhook.
2. **Instant Push Notifications** to iOS and Android smartphones via `ntfy.sh`.
3. **Local Persistent Storage** on disk (`data/leads.json`) with institutional reference numbers (`KLAY-YYYY-XXXX`).

---

## Architecture Overview

```
[Client / Contact Form / Calculator]
                 │
                 ▼
       POST /api/leads
                 │
  ┌──────────────┼──────────────┐
  │              │              │
  ▼              ▼              ▼
Local DB    Google Sheets    ntfy Push
(data/leads.json) Webhook     Alerts (iOS/Android)
```

1. **Client Submission:** The frontend sends a clean JSON payload (`name`, `email`, `phone`, `jurisdiction`, `activity`, `timeline`, `visaCount`, `notes`, `source`).
2. **Server Validation & ID Generation:** The server validates required fields (`name`, `email`, `phone`) and generates an institutional Sovereign Reference code (e.g. `KLAY-2026-9F7K`).
3. **Local Persistence:** The lead is immediately appended to `data/leads.json`.
4. **Google Sheets Webhook (Async):** If `GOOGLE_SHEET_WEBHOOK_URL` is set, the payload is forwarded to Google Sheets without delaying the user's response.
5. **Instant Push Notification (Async):** If `NTFY_TOPIC_URL` is set (or defaults to `https://ntfy.sh/klay-leads-dubai`), a high-priority notification with icons, sound, and lead details is dispatched to your phone in < 500ms.

---

## Part 1: Google Sheets Webhook Setup

Follow these simple steps to create a Google Sheets CRM that automatically receives new leads.

### Step 1: Create Your Google Sheet
1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name the sheet: **`Klay Consultants — Sovereign Leads CRM`**.
3. (Optional) In row 1, set the column headers:
   * **A1:** `Reference ID`
   * **B1:** `Timestamp`
   * **C1:** `Name`
   * **D1:** `Email`
   * **E1:** `Phone`
   * **F1:** `Jurisdiction`
   * **G1:** `Activity`
   * **H1:** `Timeline`
   * **I1:** `Visas`
   * **J1:** `Notes`
   * **K1:** `Source`
   *(Note: The script below will automatically create these headers if the sheet is empty).*

### Step 2: Open Google Apps Script
1. In the Google Sheets menu, click **Extensions** > **Apps Script**.
2. Rename the project in the top left from *Untitled project* to **`Klay Lead Ingestion Webhook`**.
3. Replace all code in `Code.gs` with the following clean Apps Script:

```javascript
/**
 * Klay Consultants — Sovereign Lead Ingestion Webhook
 * Receives lead JSON payloads and appends them to the active Google Sheet.
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Reference ID",
        "Timestamp",
        "Name",
        "Email",
        "Phone",
        "Jurisdiction",
        "Activity",
        "Timeline",
        "Visa Count",
        "Notes",
        "Source"
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#082C4B").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    var lead = JSON.parse(e.postData.contents);

    sheet.appendRow([
      lead.referenceNumber || lead.id || "",
      lead.timestamp || lead.createdAt || new Date().toISOString(),
      lead.name || "",
      lead.email || "",
      lead.phone || "",
      lead.jurisdiction || "UAE",
      lead.activity || "General",
      lead.timeline || "",
      lead.visaCount !== undefined && lead.visaCount !== null ? lead.visaCount : "",
      lead.notes || "",
      lead.source || "web"
    ]);

    // Optional: Email alert to the executive advisory team
    /*
    MailApp.sendEmail({
      to: "partners@klayconsultants.com",
      subject: "🏛️ New Klay Lead: " + (lead.name || "Inquiry"),
      body: "Reference: " + (lead.referenceNumber || lead.id) + "\n" +
            "Client: " + lead.name + "\n" +
            "Phone: " + lead.phone + "\n" +
            "Email: " + lead.email + "\n" +
            "Jurisdiction: " + (lead.jurisdiction || "UAE") + "\n" +
            "Activity: " + (lead.activity || "General") + "\n" +
            "Notes:\n" + (lead.notes || "None")
    });
    */

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, leadId: lead.referenceNumber || lead.id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 3: Deploy as a Web App
1. Click the blue **Deploy** button (top right) > **New deployment**.
2. Click the gear icon next to *Select type* and choose **Web app**.
3. Configure the deployment settings:
   * **Description:** `Klay Lead Engine Ingestion Webhook`
   * **Execute as:** `Me (your-email@gmail.com)`
   * **Who has access:** `Anyone` *(Crucial: This allows your Klay backend server to POST lead submissions securely without complex OAuth dance).*
4. Click **Deploy**.
5. When prompted, click **Authorize access**, select your Google account, click **Advanced** > **Go to Klay Lead Ingestion Webhook (unsafe)**, and click **Allow**.
6. Copy the **Web app URL** generated (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 4: Configure Klay Server Environment
In your `.env` (or hosting environment variables on Hostinger, Netlify, or Docker):
```bash
GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb.../exec"
```

---

## Part 2: Instant Mobile Push Alerts with ntfy

[ntfy.sh](https://ntfy.sh) is a free, privacy-first, open-source HTTP-based notification service that supports instant push notifications on iOS, Android, and Desktop browsers without needing an account or API key.

### Step 1: Install the App
* **iOS (iPhone/iPad):** Download **[ntfy](https://apps.apple.com/app/ntfy/id1625396347)** from the Apple App Store.
* **Android:** Download **[ntfy](https://play.google.com/store/apps/details?id=io.heckel.ntfy)** from Google Play or F-Droid.
* **Web / Desktop:** Access directly at [https://ntfy.sh](https://ntfy.sh).

### Step 2: Subscribe to Your Leads Topic
1. Open the ntfy app.
2. Tap the **+** (plus button) to add a topic subscription.
3. For public testing, subscribe to:
   ```
   klay-leads-dubai
   ```
4. **For Production Security:** Choose a unique, unguessable private topic name, for example:
   ```
   klay-sovereign-leads-7x89q
   ```
5. Ensure notifications and critical alert permissions are granted on your phone.

### Step 3: Configure Klay Server Topic
In your `.env`:
```bash
NTFY_TOPIC_URL="https://ntfy.sh/klay-sovereign-leads-7x89q"
```
*(If unset, it automatically defaults to `https://ntfy.sh/klay-leads-dubai`).*

### What the Notification Looks Like
* **Title:** `🏛️ New Klay Lead: Tareq Al-Mansoor`
* **Priority:** `High` (4) — triggers sound & banner immediately
* **Tags:** `briefcase`, `dubai` (emits briefcase and UAE indicators)
* **Message Body:**
  ```
  +971 50 123 4567 | tareq@holding.ae | DIFC | Holding Company & Asset Management
  Requires 4 investor visas, onboarding within 30 days.
  ```

---

## Part 3: Local Persistence & File Storage

All leads submitted via `/api/leads` are permanently recorded in:
```
data/leads.json
```
Each entry includes:
* `id` & `referenceNumber`: Sovereign reference ID (e.g. `KLAY-2026-X84Q`)
* `timestamp`: ISO-8601 UTC timestamp
* `name`, `email`, `phone`
* `jurisdiction`, `activity`, `timeline`, `visaCount`
* `notes`, `source`
* Additional calculator fields (`estimateAed`, `estimateUsd`, `breakdown`, `options`) if submitted from the Cost Calculator.

> **Privacy Note:** `data/leads.json` is protected by `.gitignore` to prevent committing confidential client data to version control.

---

## Part 4: Testing the Integration

### 1. Test via Curl
Run this command from your terminal:

```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sultan Al-Nahyan",
    "email": "sultan@sovereign-ventures.ae",
    "phone": "+971 50 999 8888",
    "jurisdiction": "DIFC",
    "activity": "Single Family Office",
    "timeline": "Immediate (under 14 days)",
    "visaCount": 3,
    "notes": "Structuring asset management SPV and private wealth holding entity.",
    "source": "sovereign-lead-engine"
  }'
```

### Expected Response (HTTP 201 Created):
```json
{
  "success": true,
  "leadId": "KLAY-2026-8B4N",
  "referenceNumber": "KLAY-2026-8B4N",
  "message": "Lead received and registered under KLAY-2026-8B4N"
}
```

### Validation Failure Test (HTTP 400 Bad Request):
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{ "name": "Missing Contact Info" }'
```
```json
{
  "success": false,
  "error": "Validation failed: 'name', 'email', and 'phone' are required fields."
}
```

---

## Part 5: Production Deployment Checklist

1. [ ] Set `GOOGLE_SHEET_WEBHOOK_URL` in production hosting environment variables.
2. [ ] Choose a private secret ntfy topic and set `NTFY_TOPIC_URL`.
3. [ ] Verify `data/` directory has write permissions on persistent disk storage.
4. [ ] Test a live submission on production and verify row appears in Google Sheets and notification rings on phone.
