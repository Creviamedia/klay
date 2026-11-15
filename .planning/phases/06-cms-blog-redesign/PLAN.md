# GSD Phase 6 Plan: Headless CMS (Sanity), Luxury Blog Redesign, Homepage Spotlight & Sentry

## Objective

Implement a production-grade Headless CMS pipeline using **Sanity.io**, integrate **Sentry** application monitoring, execute a high-end Swiss editorial redesign of the Blog Hub (`/blog`) and Reader (`/blog/:slug`) adhering to **Hallmark** and **UI/UX Pro Max** standards, add an **Executive Editorial Spotlight** to `HomePage.tsx`, and preserve 100% of the existing 101 articles and 126 pre-rendered SEO static routes.

---

## Architectural Principles & Skills Applied

1. **Hallmark Floor & UI/UX Pro Max**:
   - Quiet luxury aesthetic: Porcelain light (`#FAFBFD`), Deep Navy (`#0C2D48`), Warm Terracotta (`#C83E07`), Emerald (`#16A34A`).
   - High-contrast serif headlines paired with Swiss grotesque body and monospace metadata.
   - Strict hairline grids (`border-[#0C2D48]/10`), `:focus-visible` accessibility, zero cheap gradients, zero card-in-card nesting.
   - Interactive sticky Table of Contents with dynamic active-section scroll spy.

2. **Codebase Design (Deep Module)**:
   - Deep module at `src/lib/blog-engine.ts`:
     - Simple public interface: `getAllArticles()`, `getFeaturedArticles(count)`, `getArticleBySlug(slug)`, `getArticlesByCategory(category)`, `searchArticles(query, category)`.
     - Deep internal implementation: Hybrid fallback between local 101 articles and Sanity cloud API, category normalization, reading time calculation, memory caching.

3. **Source-Driven Development**:
   - Official `@sentry/react` setup with graceful ErrorBoundary and Vite sourcemap handling.
   - Official `@sanity/client` setup with GROQ query caching and offline resilience.

4. **101 Existing Articles Policy**:
   - Zero content deletion.
   - Local articles remain the bedrock archive guaranteeing 100% SEO uptime.
   - Added script `scripts/export-articles-to-sanity.mjs` to allow 1-click batch upload of all 101 articles into Sanity Studio whenever credentials are provided.

---

## Execution Waves

### Wave 1: Sentry Error Monitoring & Robust Error Boundary

- **Files**: `src/lib/sentry.ts`, `src/components/ui/ErrorBoundary.tsx`, `src/main.tsx`
- **Actions**:
  - Configure `@sentry/react` initializing only when `VITE_SENTRY_DSN` is set or gracefully logging locally.
  - Create executive Error Boundary matching Klay Swiss porcelain branding with "Reload Session" and 1-tap support trigger.
- **Verification**: Trigger controlled synthetic error; verify Error Boundary catches without crashing app.

### Wave 2: Sanity Headless CMS Client & Deep Blog Engine

- **Files**: `src/lib/sanity.ts`, `src/lib/blog-engine.ts`, `scripts/export-articles-to-sanity.mjs`
- **Actions**:
  - Create Sanity query client with offline fallback.
  - Build universal `blog-engine.ts` deep module providing unified access to both Sanity cloud posts and the 101 baseline articles.
  - Write `scripts/export-articles-to-sanity.mjs` for batch syncing local articles to Sanity NDJSON format.
- **Verification**: Automated assertions test `blog-engine.ts` methods returning normalized posts with full schema parity.

### Wave 3: Luxury Editorial Blog Hub Redesign (`/blog`)

- **Files**: `src/pages/BlogPage.tsx`, `src/components/blog/BlogCategoryTabs.tsx`, `src/components/blog/BlogSearchBar.tsx`, `src/components/blog/FeaturedArticleCard.tsx`
- **Actions**:
  - Hallmark-compliant header with editorial lead story banner.
  - Category filter tabs: _All Insights_, _Corporate Tax_, _Free Zones_, _Mainland (DED)_, _Residency & Golden Visa_, _Banking & Compliance_, _Wills & Succession_.
  - Instant client-side search bar filtering titles, excerpts, and keywords without full reload.
  - Clean card grammar: large chapter index (`01`), reading time, author credential chip, hairline border.
- **Verification**: Browser interaction test checks search filtering, category selection, and pagination.

### Wave 4: Editorial Article Reader Redesign (`/blog/:slug`)

- **Files**: `src/pages/BlogArticlePage.tsx`, `src/components/blog/ArticleTableOfContents.tsx`, `src/components/blog/ArticleContextualCta.tsx`, `src/components/blog/ArticleShareDock.tsx`
- **Actions**:
  - Sticky Table of Contents sidebar with smooth scroll-spy highlighting active headings.
  - Contextual lead conversion module: Golden Visa articles show eligibility quiz; Company formation articles show instant fee calculator.
  - Social share dock (WhatsApp direct link, LinkedIn, X, copy link).
  - Author bio chip with Senior Structuring Advisor credential.
- **Verification**: Playwright e2e test verifies TOC jumping, share triggers, and lead capture integration.

### Wave 5: Homepage Editorial Spotlight (`HomePage.tsx`)

- **Files**: `src/components/sections/ExecutiveEditorialSpotlight.tsx`, `src/pages/HomePage.tsx`
- **Actions**:
  - Integrate an "Executive Briefings & Statutory Intelligence" section on the homepage.
  - Displays top 3 curated articles with category badges, reading time, and direct reading link.
  - Seamlessly styled with hairline grid borders and porcelain canvas.
- **Verification**: Verify visual rendering and responsive layout on desktop and mobile.

### Wave 6: Comprehensive Verification & Staging PR

- **Files**: Full test suite
- **Actions**:
  - Run `scripts/test-calculator.mjs`, `scripts/test-leads-pipeline.mjs`, and new `scripts/test-blog-engine.mjs`.
  - Run Playwright E2E browser tests across all updated pages.
  - Run `npm run typecheck` (0 errors) and `npm run build` validating all 126+ pre-rendered routes.
  - Push branch `feature/cms-blog-redesign` and open PR #4 against `staging` (keeping PR #3 open).
  - Await user permission before triggering Code Review & Quality skill.
- **Verification**: 100% green CI build and tests.
