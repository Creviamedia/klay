# Project: Klay Consulting Website Transformation

## Architecture
- **Framework**: Vite 6.0.7 + React 18.2.0 + React Router DOM v6.30.1 + Express 4.21.2.
- **Rendering Model**: Static Site Generation (SSG) with custom pre-rendering (`scripts/prerender.mjs`) generating static HTML for 126 routes, hydrated by React on client (`src/main.tsx`).
- **Styling Architecture**: Tailwind CSS 3.4 + custom design tokens in `tailwind.config.ts` and `src/index.css`.
- **Typography Engine**: Font-weight 400 (light/regular) display typography with negative tracking (`-0.02em` to `-0.04em`) matching Aspekta/Grotesque metrics.
- **Brand Identity**: Emerald Green (`#22C55E`), Midnight Blue (`#0C2D48`), ambient Amber Glow (`#E8A72E`), Obsidian Dark (`#05131F`), Porcelain Ivory (`#FBFBFB`).
- **Calculation Core**: Zero-dependency `src/lib/calculator-engine.ts` supporting 5 jurisdictions, 4 business activities, visa tiers, and physical premises formulas.
- **Lead Capture Pipeline**: `POST /api/leads` on Express backend providing rate limiting, sovereign reference generation (`KLAY-YYYY-XXXX`), triple-redundant disk persistence, and push notification dispatches.

## Code Layout
```
/Users/hayaat/.gemini/antigravity/scratch/klay/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer, Navigation
│   │   ├── sections/        # Homepage Sections 1-7
│   │   ├── ui/              # Buttons, Cards, Badges, Dividers, Marquee, Ticker
│   │   └── forms/           # KlayLeadForm
│   ├── lib/
│   │   ├── calculator-engine.ts # Sovereign Cost Calculator engine
│   │   ├── seo.ts           # Route generation & metadata (126 routes)
│   │   └── routes.ts        # Route path definitions
│   ├── content/
│   │   └── blog/            # 101 Sovereign blog posts & metadata
│   ├── pages/
│   │   └── HomePage.tsx     # Homepage orchestrating Sections 1-7
│   ├── index.css            # Design tokens, keyframes, typography classes
│   └── main.tsx             # Client hydration & router root
├── scripts/
│   ├── prerender.mjs        # SSG static route pre-renderer
│   ├── seo.cjs              # SEO validator
│   ├── test-calculator.mjs  # Calculator engine verification
│   └── e2e-visual-verify.mjs # E2E & visual test harness
├── server.js                # Express API backend (`/api/leads`)
├── tailwind.config.ts       # Tailwind theme & design tokens
└── package.json             # Scripts & dependencies
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Light Display Typography | Headings at font-weight 400 with negative tracking (-0.02em to -0.04em) | M1 | Equitify Spec / R2 |
| 2 | Klay Authentic Design Tokens | Obsidian Dark #05131F, Porcelain Ivory #FBFBFB, Emerald #22C55E, Midnight #0C2D48, Amber #E8A72E | M1 | Equitify Spec / R1 |
| 3 | Micro-Interaction Utilities | 50px pill CTA styles, hairline dividers, directional hover states, elevation tokens | M1 | Equitify Spec / R2 |
| 4 | Hero Fold 100vh Full-Bleed | Cinematic full-bleed hero with ambient background and vignette | M2 | Equitify Spec / R1 |
| 5 | Hero Rotating Value Ticker | Animated ticker (100% Foreign Ownership / Tax Exemption / Asset Protection) at 78.88px font-weight 400 | M2 | Equitify Spec / R1 |
| 6 | Hero Inline Form Removal | Extract inline contact form from hero fold to bottom-left 2-line explanation + 50px emerald pill CTA | M2 | ORIGINAL_REQUEST R1 |
| 7 | Section 2 Sovereign Structure | Porcelain Ivory #FBFBFB, 64px heading, two 48px display cards | M2 | Equitify Spec / R1 |
| 8 | Section 2 Partner Logo Marquee | Infinite loop marquee at 50px/s, draggable, pause on hover | M2 | Equitify Spec / R1 |
| 9 | Section 3 4-Column Workflow | Obsidian Dark #05131F, 64px heading, 4 sequential vertical cards side-by-side with hairline dividers | M3 | Equitify Spec / R1 |
| 10 | Section 4 Stat Counters | Porcelain Ivory #FBFBFB, 64px heading, 3 numerical stat counters (96px tabular-nums), pill CTA | M3 | Equitify Spec / R1 |
| 11 | Section 5 Institutional Divisions | Obsidian Dark #05131F, 64px heading, 4 division cards with directional arrows | M3 | Equitify Spec / R1 |
| 12 | Section 6 Jurisdictions Grid | Porcelain Ivory #FBFBFB, 64px heading, Equitify property card grid layout with hover zoom | M4 | Equitify Spec / R1 |
| 13 | Section 7 Pre-footer Atmospheric Banner | 640px height banner, 64px heading 'What We Built for Ourselves / We Now Build for You', ambient glow | M4 | Equitify Spec / R1 |
| 14 | Footer Lead Consultation Relocation | Relocate hero lead form into dedicated footer consultation section under 64px heading | M4 | ORIGINAL_REQUEST R1/R3 |
| 15 | Footer 4-Column Directory | 4-column directory, legal links, sovereign status bar | M4 | Equitify Spec / R1 |
| 16 | 126 Pre-rendered Routes Preservation | 100% preservation of all 18 pages (incl 8 pagination routes), 7 services, and 101 articles | M5 | ORIGINAL_REQUEST R3 |
| 17 | 101 Sovereign Blog Posts Preservation | All 101 articles in `src/content/blog/articles/*.ts` intact and accessible | M5 | ORIGINAL_REQUEST R3 |
| 18 | Cost Calculator Engine Preservation | Complete integrity of `src/lib/calculator-engine.ts` with 5/5 test suites passing | M5 | ORIGINAL_REQUEST R3 |
| 19 | Lead Capture Endpoints Preservation | `POST /api/leads` integrity, validation, persistence, and notification dispatch | M5 | ORIGINAL_REQUEST R3 |
| 20 | E2E & Visual Verification (Tiers 1-4) | Opaque-box requirement-driven test suite passing 100% | M6 | ORIGINAL_REQUEST Acceptance |
| 21 | Adversarial Coverage Hardening (Tier 5) | White-box adversarial testing for edge cases and layout regressions | M6 | Pattern Requirement |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design Tokens, Typography & Brand Micro-Interactions | Aspekta/Grotesque font metrics, font-weight 400 display tokens, negative tracking, Obsidian Dark & Porcelain Ivory palette, pill CTA buttons, hairline borders | none | DONE |
| M2 | Hero Fold & Section 2 Overhaul | 100vh full-bleed hero, 78.88px rotating value ticker, 50px pill CTA, hero form extraction; Section 2 display cards & infinite partner logo marquee | M1 | IN_PROGRESS |
| M3 | Sections 3, 4, 5 Overhaul | Section 3 4-column cards with hairline dividers; Section 4 3-counter stats with pill CTA; Section 5 4 division cards with directional arrows | M1 | PLANNED |
| M4 | Section 6, Section 7 & Footer Overhaul with Lead Relocation | Section 6 property card grid; Section 7 pre-footer atmospheric banner; Footer 64px heading, integrated consultation lead form, 4-column directory | M1, M2 | PLANNED |
| M5 | Sovereign Content, Cost Calculator & Endpoint Integration | Verify 126 pre-rendered routes, 101 blog posts, `calculator-engine.ts` accuracy, `POST /api/leads` processing | M1, M2, M3, M4 | PLANNED |
| M6 | Final Milestone: 100% E2E Pass (Tiers 1-4) & Adversarial Coverage Hardening (Tier 5) | Phase 1: Pass 100% of E2E test suite; Phase 2: Adversarial coverage hardening via Challenger-initiated cycle | M5, TEST_READY.md | PLANNED |

## Parallel Track: E2E Testing Track
- **Orchestrator**: E2E Testing Track Orchestrator
- **Scope**: Requirements-driven, opaque-box test infrastructure and test suites (Tiers 1-4) covering all 21 inventoried features.
- **Output**: `TEST_INFRA.md`, executable test suites, and publishing `TEST_READY.md`.

## Interface Contracts
### Design Tokens ↔ Component Layer
- CSS Variables / Tailwind utilities:
  - `bg-obsidian`: `#05131F`
  - `bg-porcelain`: `#FBFBFB`
  - `text-klay-emerald`: `#22C55E`
  - `text-klay-midnight`: `#0C2D48`
  - `text-klay-amber`: `#E8A72E`
  - `border-hairline-dark`: `rgba(226, 226, 226, 0.15)`
  - `border-hairline-light`: `rgba(0, 0, 0, 0.08)`
  - `font-display`: Light display font with `font-weight: 400`, `letter-spacing: -0.03em` to `-0.04em`.
  - `btn-pill-emerald`: Height `50px`, padding `0 28px`, `border-radius: 9999px`, emerald background with arrow micro-interaction.

### Hero Form Extraction ↔ Footer Lead Consultation
- `HomeHeroContactForm` extracted from `HomePage.tsx`.
- Footer incorporates `<KlayLeadForm variant="dark" source="footer-consultation" />` underneath the 64px heading 'Start Your UAE Journey, Skip The Friction'.
- Form submission sends `POST /api/leads` with payload `{ name, email, phone, jurisdiction, activity, timeline, visaCount, notes, source }`.
- Expected Response: `HTTP 200 { success: true, reference: "KLAY-YYYY-XXXX", message: "..." }`.

### Calculator Engine Contract
- `calculateSetupCost(options: SetupOptions): CalculationResult`
- Zero modification to calculations or exports in `src/lib/calculator-engine.ts`.
- `npm test` must continue to execute all 5 suites in `scripts/test-calculator.mjs` and pass with 0 errors.

### Route & SSG Pre-render Contract
- `src/lib/seo.ts: getPrerenderRoutes()` must return exactly 126 routes (18 pages, 7 services, 101 articles).
- `scripts/prerender.mjs` must generate 126 static `dist/**/index.html` files + `dist/404.html`.
- `scripts/seo.cjs --validate` must exit with code 0.
