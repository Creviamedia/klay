# Project Changelog (`CHANGELOG.md`)

All notable changes to the Klay Consultants platform are documented here following Semantic Versioning.

---

## [2.4.0-production] - 2026-11-17 (Production Launch, 2FA Hardening, Mobile Performance & Sovereign Lead Engine)

### Added & Security Hardening

- **RFC 6238 TOTP Two-Factor Authentication (`netlify/functions/admin-core.cjs`, `AdminLoginPage.tsx`)**:
  - Zero-dependency TOTP engine implemented in pure Node.js standard library `crypto` with Base32 encode/decode, HMAC-SHA1 dynamic truncation, and constant-time `crypto.timingSafeEqual` comparison.
  - Verified against exact RFC 6238 Appendix B test vectors with $\pm 1$ step (30s) clock drift tolerance.
  - Backward-compatible challenge: prompts for 6-digit authenticator code when `totp_secret` is configured, while allowing password-only login when unconfigured to prevent lockouts.
- **Database Token Revocation Ledger (`src/lib/turso.ts`, `netlify/functions/admin-core.cjs`)**:
  - Added `revoked_tokens (jti PRIMARY KEY, revoked_at, expires_at)` table with index on `expires_at` in Turso SQLite Cloud (Frankfurt).
  - Synchronous in-memory cache check in `requireAdminAuth` + database persistence in `handleAdminLogout` immediately kills revoked sessions (HTTP 401).
- **Hardened Admin Credentials**:
  - Revoked public dev password (`KlayAdmin2026!Dev`); upgraded admin password hash with bcrypt work factor 10.
  - Enforced sliding-window rate limiting (max 5 failed attempts / 15 min per IP) with concurrency race mitigation and memory leak cleanup.
  - Strict CORS origin validation: untrusted origins rejected prior to authentication; credentials and origin reflection restricted to approved production and staging domains.

### Performance & Mobile Optimizations (`crevia/perf/mobile-image-loading-20261117`)

- **Hero Video Poster Elimination (`HomeHeroSection.tsx`)**: Removed hidden desktop video poster download on mobile devices, saving ~160 KiB initial bandwidth on mobile viewports while preserving desktop playback on `onPlaying`.
- **Below-Fold Lazy Image Loading (`PropertySetupCard.tsx`)**: Converted static cards to use canonical `<Image loading="lazy" .../>` with responsive `sizes` attribute, eliminating 533 KiB of offscreen image transfer.
- **Measured Metrics**: Mobile Lighthouse performance increased from 74/75 to 87; Largest Contentful Paint (LCP) dropped from 6.2s to 3.5s.
- **Verified FTPS Transport (`scripts/deploy-ftp.mjs`, `scripts/test-deploy-ftp.mjs`)**:
  - Enforced TLS 1.2+ encryption (`secure: true`, `rejectUnauthorized: true`) for Hostinger deployments.
  - Added TLS SNI servername validation (`HOSTINGER_FTP_TLS_SERVERNAME` = `hstgr.io`) preventing IP certificate mismatch errors.

### Infrastructure & Continuous Deployment

- **Sovereign Lead & Admin Conduit Pipelines (`public/api/leads.php`, `public/api/admin.php`)**:
  - Native Hostinger LiteSpeed conduits writing directly to Turso Frankfurt via libSQL pipeline HTTP API.
  - `public/api/admin.php` resolves the `Authentication failed (404)` on Hostinger production by routing `/api/admin/*` to native PHP handling for login, session verification, lead status updates, and CMS management.
  - Emergency fallback persists leads to local JSONL (`data/leads.jsonl`) if remote database is unreachable.
  - Instant dispatch to Telegram group with UAE WhatsApp 1-tap dialer (`971...`) and encrypted ntfy.sh push channel.
- **Automated Zero-Downtime Deployment (`.github/workflows/deploy-production.yml`)**:
  - GitHub Actions workflow deploys production static bundle directly to Hostinger upon merging into `main`.
  - Prerendered 130 public routes, 4 sitemaps, robots.txt, and llms.txt.
  - Branch parity verified: `main`, `staging`, and `uat` synchronized at commit `76b522b`.

---

## [2.3.0-staging] / [2.3.0-uat] - 2026-11-15 (Audit Defect Resolutions, Pre-Commit Hooks & Lead Verification)

### Fixed & Hardened (Audit Remediation)

- **DEF-01 (`SetupCalculator.tsx`, `server.js`)**: Resolved homepage setup calculator lead data loss. Split single unstructured contact input into dedicated sovereign inputs (`leadName`, `leadEmail`, `leadPhone`) with inline alerts, sovereign reference display (`KLAY-2026-XXXX`), and backward-compatible fallback parsing in backend.
- **DEF-02 (`KlayLeadForm.tsx`)**: Resolved runtime crash on `/contact` when selecting "DIFC / ADGM". Added missing jurisdiction metadata and badge tag (`Common Law Financial Centre`).
- **DEF-03 (`calculator-engine.ts`, `VariantC_FinancialSliders.tsx`)**: Enforced statutory zero-eligibility (`goldenVisaEligible: false`) for `offshore-rak` setups per UAE ICP immigration regulations.
- **DEF-04 (`routes.ts`, `App.tsx`, `seo.cjs`, `_redirects`)**: Resolved 404 on `/golden-visa-dubai`. Added route alias and HTTP 301 canonical redirect to `/golden-visa/`.
- **DEF-06 (`equitify-hero-bg.mp4`)**: Re-encoded hero video using ffmpeg (`+faststart`, audio stripped), reducing payload by 72% (6.1 MB → 1.7 MB).

### Added (Quality Gate & Test Infrastructure)

- **Pre-Commit Quality Gate (`.husky/pre-commit`, `.lintstagedrc`, `.prettierrc`)**: Enforced automated Prettier formatting via `lint-staged`, static TypeScript verification (`tsc --noEmit`), and mathematical calculator tests on every commit.
- **Lead Verification Suites**:
  - `scripts/test-leads-pipeline.mjs`: Automated 8/8 test suite validating instant calc, backward compatibility, DIFC/ADGM selection, financial sliders, golden visa quiz, schema rejection, and dual-sink persistence (`data/leads.jsonl`, `google-sheet-crm.csv`).
  - `scripts/test-leads-browser-e2e.mjs`: Playwright headless Chromium E2E verification across all 4 lead funnels.
- **Dual Live Cloud Sync**: Deployed verified release candidate to both Netlify Staging (`klay-consulting-staging.netlify.app`) and Netlify UAT (`klay-consulting-uat.netlify.app`).

---

## [2.2.0-staging] - 2026-11-14 (Prototypes Lock-In: Sliders, Quiz & Pricing Simulator)

### Added

- **Cost Calculator Variant C Default (`VariantC_FinancialSliders.tsx`)**: Locked in dynamic financial modeling simulator as the permanent default on `/cost-calculator`. Features interactive range sliders for investor & employee quotas, stacked percentage budget allocation matrix (`Licensing`, `Visas`, `Premises`, `Advisory`), and instant lead locking.
- **Golden Visa Variant C Default (`VariantC_Quiz.tsx`)**: Locked in 30-second interactive qualification quiz as the permanent default on `/golden-visa`. Features dynamic profile screening (Real Estate, Corporate Founder, Salaried Executive, Tech Creator), statutory bracket filtering, live match rate calculation (`98% ELIGIBLE`), and priority pre-clearance claim form.
- **Option 3 Standalone Statutory Pricing Engine (`public/pricing-engine-demo.html`)**: Zero-dependency, self-contained mathematical simulator running at `/pricing-engine-demo.html`. Features 5 1-click scenario presets (Meydan Solo Tech, IFZA Commercial Multi-Visa, Dubai Mainland Ejari, RAK ICC Offshore 0-Visa, and Industrial Scaling), deterministic USD peg calculation, live statutory fee tape, in-browser automated assertion runner (5/5 passing), and raw CRM JSON inspector.
- **Prototype Switcher Component (`PrototypeSwitcher.tsx`)**: Reusable floating pill bar supporting variant switching (`?variant=A|B|C`) and keyboard arrow navigation (`←` / `→`) across both `/cost-calculator` and `/golden-visa`.

### Changed & Optimized

- **Icon Cleanups**: Removed 12 unused icon imports across `App.tsx`, `CostCalculator.tsx`, `SetupCalculator.tsx`, and `BusinessSetupPage.tsx`.
- **Clean Production Routing**: Pages render their designated default variant directly; the floating prototype switcher activates dynamically only when `?variant=` query parameter is explicitly provided.

---

## [2.1.0-staging] - 2026-11-14 (Staging Refinements & Architecture Audit)

### Added

- **Executive Light Calculator (`SetupCalculator.tsx` & `CostCalculator.tsx`)**: Re-engineered the corporate formation calculator from dark sci-fi industrial aesthetic into a high-conversion, single-fold Swiss financial card (white porcelain canvas, hairline borders, deep navy `#0C2D48`, emerald `#22C55E`, and amber badges). Features live AED/USD dual currency, interactive statutory tariffs, and 1-tap quote capture.
- **Cinematic Video Hero in Business Setup (`BusinessSetupPage.tsx`)**: Upgraded the business setup page hero with an autoplaying, looping background video (`/videos/equitify-hero-bg.mp4`), gradient scrim, and ambient horizon glow.
- **Persistent Floating Dock Across All Pages**: Removed route exclusions in `App.tsx` ensuring the sovereign floating dock and contact widget persist across `/business-setup` and all 126 pre-rendered routes with proper bottom padding (`pb-28`).
- **Instant Radiant Gold Ticket (`AdmitOneTicket.tsx`)**: Removed the deferred interaction gate in `whenShaderAllowed` so the WebGL shader initializes immediately on mount. Upgraded the fallback background to a rich metallic gold gradient (`#fef3c7` → `#f59e0b` → `#d97706` → `#92400e`), eliminating any flash of brown or delay.
- **Auto-Cycling Golden Visa Eligibility Framework (`GoldenVisaPage.tsx`)**: Added a 4.2-second smooth auto-rotator cycling through 5 categories (Investors, Entrepreneurs, Skilled Professionals, Students & Graduates, Specialized Talent) with live vertical progress bars and hover-pause capability.
- **Turnkey Service Package Routing**: Re-routed all turnkey package cards in `ServicesPage.tsx` directly to their dedicated service pages (`/services/free-zone-company-setup/`, `/services/mainland-company-setup/`, `/services/offshore-company-setup/`, `/services/corporate-bank-account/`) rather than funnelling everything into `/contact`.
- **Dual Live Netlify Environments**:
  - `klay-consulting-staging`: Live staging target at `https://klay-consulting-staging.netlify.app` running branch `staging` (`8ccc544`).
  - `klay-consulting-uat`: Preserved UAT target at `https://klay-consulting-uat.netlify.app` running branch `uat` (`4f2570d`).

### Architecture & API Audit Findings

- **126 Routes Integrity**: Verified 100% mathematical route distribution: 18 standard pages (incl. 8 blog pagination routes), 7 service detail routes, and 101 blog articles.
- **Identified Legacy Route Typo**: `/bussines-setup-page/` has a double 's' inherited from the original Webflow CMS import. Both `/business-setup` and `/bussines-setup-page/` render identically with redirects in place.
- **Backend API Simplification**: The Express server (`server.js`, 457 lines) duplicates Netlify serverless functions (`netlify/functions/leads.cjs`). Recommended moving dev to `netlify dev` to remove `express` and `compression` production dependencies.
- **Security Privacy Risk Identified**: The default lead push notifications target a public unauthenticated topic (`ntfy.sh/klay-leads-dubai`). Recommended migrating to an authenticated Telegram bot or private webhook to safeguard client contact data and budgets.

---

## [2.0.0-staging] - 2026-11-13 (Modernization & Staging Architecture)

### Added

- **Native Cost Calculator Engine**: Created `src/lib/calculator-engine.ts` and `src/components/calculator/CostCalculator.tsx`. Replaced the third-party Fillout iframe with a native, high-conversion estimator offering live AED/USD dual currency, itemized line items, and print/PDF generation.
- **Backend Lead Handler**: Added `POST /api/leads` in `server.js` with structured logging and tracking reference generation (`KLAY-XXXXX`).
- **Magnetic Quick-Action Dock**: Integrated `@componentry/magnetic-dock` via `src/components/layout/FloatingDock.tsx` into `src/App.tsx`.
- **Space UI Design Primitives**: Added 67 accessible, motion-ready primitives into `src/components/ui/`, `src/hooks/`, and `src/lib/base-ui/`.
- **Multi-Environment Pipeline**: Added `.env.example`, `.env.development`, `.env.staging`, `.env.uat`, and `.env.production`.
- **Dynamic Site Origin & SEO**: Updated `src/lib/seo.ts` to read `VITE_SITE_URL` from the active environment.
- **GitHub Actions Workflows**: Added `.github/workflows/ci.yml`, `deploy-staging.yml`, and `deploy-production.yml`.
- **Time Machine Rollback System**: Added `scripts/time-machine.sh` and baseline git tags (`klay-v0.1-baseline`).
- **Documentation Suite**: Added `PRD.md`, `COMPONENTS.md`, `CHANGELOG.md`, and `TIMELINE.md`.

### Fixed

- **Build Crash in `AboutPage.tsx`**: Fixed the missing `<h1>` tag in the hero section that was breaking `scripts/seo.cjs --validate`.
- **React DOM Warning in `BackgroundVideo.tsx`**: Destructured `buttonClassName` so it is not passed to the native `<video>` element.
- **TypeScript Conversion**: Converted `CostCalculatorPage.jsx` to `CostCalculatorPage.tsx`.
- **Root Pollution**: Removed 2 MB of raw Lighthouse JSON reports and added them to `.gitignore`.

---

## [1.0.0] - 2026-11-12 (Initial WordPress Migration & Monolith Split)

### Added

- Split 13,185-line monolithic blog page into 102 individual articles (`src/content/blog/articles/*.ts`).
- Added SSG prerenderer (`scripts/prerender.mjs`) and SEO validation (`scripts/seo.cjs`).
- Compressed 177 MB of PNGs to WebP.
- Added Express static server (`server.js`) with 301 redirect map.
