# Custom Lead Engine Initiative

## Context
On 2026-11-13, the leadership determined that third-party Fillout iframe embeds (`@fillout/react`) introduced unacceptable latency (~90 network requests, 2.6 MB bundle weight, layout shift) and lacked sovereign data control. A native, in-house lead capture system was architected, built, and deployed across the staging environment, writing to local persistent storage, syncing in real-time to Google Sheets, and dispatching instant push notifications to mobile devices.

## Milestones & Status

- **Step 1: Backend Seam (`server.js`)**: COMPLETED (2026-11-13)
  - Enforced strict payload validation at `POST /api/leads`.
  - Atomically appends submissions to `data/leads.json` with institutional reference `KLAY-YYYY-XXXX`.
  - Added asynchronous dispatch to `GOOGLE_SHEET_WEBHOOK_URL` (Google Apps Script).
  - Added instant mobile push alerts via `ntfy.sh` (topic: `https://ntfy.sh/klay-leads-dubai`).
  - Added comprehensive integration guide in [docs/integrations/google-sheets-setup.md](../integrations/google-sheets-setup.md).
  - Added `/data/leads.json` to `.gitignore` for data privacy.
  - Verified with live integration test suite.

- **Step 2: Custom Form Component (`KlayLeadForm.tsx`)**: COMPLETED (2026-11-13)
  - Designed per `DESIGN.md` tokens ("The Sovereign Legal Sanctuary") and Awwwards/Dribbble luxury legal benchmarks.
  - Built with dark and light variants (`variant="dark"` for hero, `variant="light"` for pages).
  - Interactive Segmented Jurisdiction Selector (Free Zone, Mainland DED, DIFC / ADGM).
  - International phone prefix selector with country flags.
  - 4-state state machine: `idle` ➔ `submitting` ➔ `success` (receipt card with copyable reference ID) ➔ `error`.
  - Full WCAG AA accessibility with keyboard navigation.

- **Step 3: Site-Wide Fillout Replacement**: COMPLETED (2026-11-13)
  - Replaced `HomeHeroContactForm.tsx` (eliminating 2.6 MB and 90 requests).
  - Replaced `ContactPage.tsx` form card.
  - Replaced `BusinessSetupPage.tsx` form section.
  - Removed `src/components/ui/LazyFilloutEmbed.tsx`.
  - Cleaned up `.contact-fillout-embed` CSS.
  - Uninstalled `@fillout/react` from `package.json`.

- **Step 4: Staging Build & End-to-End Verification**: COMPLETED (2026-11-13)
  - TypeScript verification: `npm run typecheck` passed with 0 errors.
  - Design audit: `impeccable detect` on `KlayLeadForm.tsx` returned `[]` (0 warnings, 0 advisories, 0 slop).
  - Staging build: `npm run build:staging` passed, pre-rendering and validating all 126 routes.
  - Direct WhatsApp Action: Notification push via `ntfy.sh` includes 1-tap WhatsApp deep link (`https://wa.me/...`) and direct phone call trigger.
  - Local Google Sheets CRM Mirror: Added `data/google-sheet-crm.csv` recording real-time CSV rows with direct WhatsApp links.
  - Safari (WebKit) E2E Automation: Verified in Apple WebKit with automated random lead generation (`Reem Khurana`), capturing screenshots of both the filled form and the verified Sovereign Reference receipt (`KLAY-2026-KJAY`).
  - Zero Fillout references remaining in `src/`.
