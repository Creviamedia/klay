# Project Changelog (`CHANGELOG.md`)

All notable changes to the Klay Consultants platform are documented here following Semantic Versioning.

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
