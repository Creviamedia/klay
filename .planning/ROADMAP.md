# Roadmap: Klay Consulting Redesign

## Phase 1: Design System Primitives & Tokens

- **Goal**: Establish Equitify design tokens, typography scale, hairline borders, corner crosshairs, and color variables in `globals.css` and `tailwind.config.ts`.
- **Deliverables**:
  - CSS variables for light canvas (`#FBFBFB`), dark canvas (`#000000`), terracotta (`#C83E07`), and muted tones.
  - Architectural crosshair component / CSS utility (`.corner-crosshair`).
  - Button primitive matching Equitify's 50px pill button with arrow icon.
  - Zero-radius card primitive with hairline borders.

## Phase 2: Navigation & Footer Architecture

- **Goal**: Rebuild `Header.tsx` (LiquidNavbar/Equitify navbar) and `Footer.tsx` in Equitify's high-contrast luxury format.
- **Deliverables**:
  - Minimalist floating navigation with uppercase tracking, desktop links, and terracotta CTA.
  - Mobile responsive fullscreen overlay menu with smooth stagger.
  - Massive editorial footer with headline `Start Your UAE Journey, Skip The Friction`, newsletter/lead input, and legal links.

## Phase 3: Interactive Editorial Primitives

- **Goal**: Create reusable Equitify-style components for page content.
- **Deliverables**:
  - `ProcessStepTabs.tsx`: Multi-step interactive process tabs with numbered columns.
  - `ComparisonMatrix.tsx`: Side-by-side "On Your Own" vs "With Klay" table.
  - `NumberedAccordion.tsx`: Clean hairline FAQ accordion with index numbering (`01`, `02`...).
  - `AtmosphericBanner.tsx`: Dark section banner with warm terracotta ember horizon glow.
  - `FeatureGrid.tsx`: 3x2 or 2x2 grid with terracotta outline icons and clean descriptions.

## Phase 4: Page Re-skinning (Zero Content Loss)

- **Goal**: Re-skin Klay's primary pages while preserving every sentence of content, pricing, and form logic.
- **Deliverables**:
  - `HomePage.tsx`: Hero with dynamic rotation, 2-column value cards, dark 3D feature section, process tabs, comparison table, client proof carousel, and FAQ.
  - `BusinessSetupPage.tsx`: Jurisdiction cards (Mainland vs Free Zone), setup process, and lead capture.
  - `GoldenVisaPage.tsx`: Visa category breakdown, eligibility checklist, and contact trigger.
  - `CostCalculatorPage.tsx`: Minimalist architectural calculator shell powering `calculator-engine.ts`.
  - `ContactPage.tsx`: Minimalist split layout with floating hairline inputs and 4-column office/contact info.
  - `BlogPage.tsx` & `BlogArticlePage.tsx`: Editorial reading experience with crisp grotesque typography and terracotta accents.
  - `PrivacyPage.tsx` & `TermsPage.tsx`: Clean legal formatting.

## Phase 5: Verification, Smooth Scroll & Build

- **Goal**: Ensure 100% build health, zero CLS, mobile perfection, and Netlify deployment.
- **Deliverables**:
  - Optional Lenis smooth scrolling integration.
  - Full Playwright screenshot verification on desktop and mobile.
  - `npm run typecheck` (0 errors) and `npm test` passing.
  - `npm run build` validating all 126 pre-rendered routes.
  - Git commit and Netlify preview deployment.

## Phase 6: Headless CMS (Sanity), Blog Redesign & Sentry Observability

- **Goal**: Non-technical blog authorship via Sanity.io, Sentry runtime monitoring, and executive Swiss redesign of `/blog` and `/blog/:slug`.
- **Deliverables**:
  - Sentry initialization and executive error boundary.
  - Sanity API client + local article hybrid fallback adapter.
  - Executive `/blog` hub with category tabs, live search, and reading time.
  - Executive `/blog/:slug` with scroll-tracking Table of Contents, contextual lead CTA, and share dock.
  - Zero disruption to 101 legacy articles and 126 prerendered public SEO routes.
  - Isolated branch `feature/cms-blog-redesign` and Pull Request against `staging`.
