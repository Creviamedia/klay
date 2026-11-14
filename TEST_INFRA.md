# E2E Test Infra: Klay Consulting Website Transformation

## Test Philosophy
- Opaque-box, requirement-driven. Derives strictly from `ORIGINAL_REQUEST.md` and user specifications, not internal component implementation details.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.
- Progressive Testability: Test verification uses deterministic commands (`npm run typecheck`, `npm test`, `npm run build`, Playwright visual and structural locators, HTTP API assertions).

## Feature Inventory & Test Mapping
| # | Feature | Source | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) |
|---|---------|--------|:-----------------:|:-----------------:|:----------------------:|
| 1 | Light Display Typography (font-weight 400, negative tracking) | R2 | 5 tests | 5 tests | ✓ |
| 2 | Klay Brand Color Tokens (Obsidian, Porcelain, Emerald, Midnight, Amber) | R1 | 5 tests | 5 tests | ✓ |
| 3 | Micro-Interaction Utilities (Pill CTA, Hairline Dividers, Glow) | R2 | 5 tests | 5 tests | ✓ |
| 4 | Hero Fold 100vh Full-Bleed Layout | R1 | 5 tests | 5 tests | ✓ |
| 5 | Hero Rotating Value Ticker (78.88px, 3 phrases, staggered rollup) | R1 | 5 tests | 5 tests | ✓ |
| 6 | Hero Inline Form Removal & Bottom-Left Positioning | R1 | 5 tests | 5 tests | ✓ |
| 7 | Section 2 Porcelain Canvas & Two 48px Display Cards | R1 | 5 tests | 5 tests | ✓ |
| 8 | Section 2 Partner Logo Infinite Marquee | R1 | 5 tests | 5 tests | ✓ |
| 9 | Section 3 Obsidian Canvas & 4 Vertical Simultaneous Columns | R1 | 5 tests | 5 tests | ✓ |
| 10 | Section 4 Stat Counters (96px, 3 numerical statistics) | R1 | 5 tests | 5 tests | ✓ |
| 11 | Section 5 Institutional Divisions (4 cards with diagonal arrows) | R1 | 5 tests | 5 tests | ✓ |
| 12 | Section 6 Jurisdictions Property Grid (multi-overlay cards) | R1 | 5 tests | 5 tests | ✓ |
| 13 | Section 7 Pre-footer Atmospheric Banner (640px height, 64px font) | R1 | 5 tests | 5 tests | ✓ |
| 14 | Footer Lead Consultation Relocation (KlayLeadForm integration) | R1 / R3 | 5 tests | 5 tests | ✓ |
| 15 | Footer 4-Column Directory & Sovereign Status Bar | R1 | 5 tests | 5 tests | ✓ |
| 16 | 126 Pre-rendered Routes Intact & Accessible | R3 | 5 tests | 5 tests | ✓ |
| 17 | 101 Sovereign Blog Articles Intact & Accessible | R3 | 5 tests | 5 tests | ✓ |
| 18 | Cost Calculator Engine Calculations (`calculator-engine.ts`) | R3 | 5 tests | 5 tests | ✓ |
| 19 | Lead Capture Endpoint & Rate Limiting (`POST /api/leads`) | R3 | 5 tests | 5 tests | ✓ |
| 20 | Playwright Visual Verification & Responsiveness | Acceptance | 5 tests | 5 tests | ✓ |
| 21 | Build Pipeline & SSG Verification | Acceptance | 5 tests | 5 tests | ✓ |

## Test Architecture
- **Environment**: Node v24.22.1 (`/Users/hayaat/.local/share/node-v24.22.1-darwin-arm64/bin`)
- **Visual & E2E Test Runner**: Standalone Playwright Chromium/WebKit runner (`scripts/test-e2e-all.mjs`) executing headless browser interactions and screenshot inspections.
- **Route & Content Integrity Runner**: Static file verification (`dist/**/index.html` count = 126, article files count = 101, SEO validator execution).
- **Calculator Regression Runner**: `npm test` (`node scripts/test-calculator.mjs`) asserting 100% calculation accuracy.
- **Lead API Integration Runner**: HTTP client testing `POST /api/leads` payload validation, reference ID format (`KLAY-YYYY-XXXX`), and file persistence.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Target Verification |
|---|----------|--------------------|---------------------|
| S1 | Executive Investor Homepage Journey | F1, F2, F4, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14, F15 | Complete top-to-bottom scroll inspection, hero ticker rotation, marquee fluidity, counter animation, footer inquiry |
| S2 | High-Volume Lead Submission & Relocated Form Flow | F6, F14, F19 | User fills relocated lead form in footer, verifies rate limiter, receives sovereign reference number |
| S3 | Cross-Jurisdiction Setup Cost Modeling | F18, F12 | Cost calculator engine runs all 5 jurisdictions and all 4 activity packages without deviation |
| S4 | Sovereign Content Search & Article Reading Flow | F16, F17 | User accesses article index, navigates pagination routes, loads article detail with intact metadata |
| S5 | Multi-Device Responsive Layout Verification | F4, F7, F9, F11, F15, F20 | Playwright desktop (1440x900) vs mobile (390x844) viewport verification of 4-column cards, marquee, and ticker |

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥ 105 tests (5 tests × 21 features)
- **Tier 2 (Boundary & Corner Cases)**: ≥ 105 tests (5 tests × 21 features)
- **Tier 3 (Cross-Feature Combinations)**: ≥ 21 tests
- **Tier 4 (Real-World Application Scenarios)**: ≥ 5 end-to-end scenarios
- **Total Minimum**: ≥ 236 test assertions
