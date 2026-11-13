# Product Requirements Document (PRD)
## Klay Consultants Corporate Web Platform & Cost Calculator

- **Project**: Klay Consultants Website Modernization
- **Version**: 2.0.0-staging
- **Target Audience**: High-net-worth founders, European/GCC/UK entrepreneurs, ex-pats relocating to Dubai, and foreign investors.
- **Primary Business Goals**:
  1. Educate clients on UAE company incorporation (Mainland vs Free Zone vs Offshore).
  2. Provide a transparent, accurate first-year cost estimation engine without deceptive "starting at" gimmicks.
  3. Capture high-intent corporate setup and Golden Visa advisory leads.
  4. Maintain 100% search engine indexability, sub-second LCP performance, and zero-error builds.

---

## 1. Functional Specifications

### 1.1 Native Interactive Cost Calculator
- **Engine**: Client-side TypeScript calculation engine (`src/lib/calculator-engine.ts`) with fixed USD-AED peg (`1 USD = 3.6725 AED`).
- **Jurisdictions Supported**:
  - *Meydan Free Zone* (Dubai central, consulting & digital)
  - *IFZA Dubai* (Cost-effective, flexible multi-activity)
  - *DMCC* (JLT commodities, crypto, international trading)
  - *Dubai Mainland (DET / DED)* (Direct local market access & onshore contracts)
  - *RAK ICC Offshore* (International holding & asset protection, no local visas)
- **Parameters Configured**:
  - Activity Type: Consulting / Professional, Commercial Trading, E-Commerce, Industrial.
  - Visas: Investor visas (0 to 5) and Employee visas (0 to 10+).
  - Office Premises: Flexi-Desk (included), Dedicated Co-Working (+AED 7,500), Private Physical Office (+AED 24,000).
  - Strategic Add-Ons: Corporate Tax Registration (+AED 1,500), Bank Account Advisory (+AED 2,500), AML/GoAML Compliance (+AED 2,000), UAE Will Registration (+AED 3,500).
- **Lead Capture & Deliverables**:
  - Instant print/PDF export capability.
  - Native form submission to `/api/leads` returning a unique tracking lead reference (`KLAY-XXXXX`).

### 1.2 Layout & Navigation (`MagneticDock`)
- Floating desktop navigation dock powered by `@componentry/magnetic-dock`.
- Magnification and spring physics on hover.
- Quick routes: Home, Calculator, Services, Golden Visa, Contact, and direct WhatsApp advisory link.

### 1.3 Space UI Primitives Integration
- Standardized UI library powered by Base UI & Tailwind CSS.
- Replaces ad-hoc custom CSS sheets with accessible, theme-consistent primitives.

---

## 2. Multi-Environment Architecture

| Variable | Development | Staging | UAT | Production |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_SITE_URL` | `http://localhost:5173` | `http://localhost:3001` | `https://uat.klayconsultants.com` | `https://klayconsultants.com` |
| `VITE_ENVIRONMENT` | `development` | `staging` | `uat` | `production` |
| `VITE_LEAD_API_ENDPOINT` | `/api/leads` | `/api/leads` | `/api/leads` | `/api/leads` |
| `VITE_ENABLE_MOCK_LEADS` | `true` | `true` | `true` | `false` |
| `VITE_ENABLE_ROBOTS_INDEX` | `false` | `false` | `false` | `true` |
| `VITE_GTM_ID` | Disabled | Disabled | Test container | Production container |

---

## 3. Non-Functional Requirements & Quality Gates
- **Type Safety**: 100% TypeScript (`tsc --noEmit` must pass with 0 errors).
- **Static Site Generation (SSG)**: 126 public routes prerendered into standalone HTML files with Open Graph, canonical links, and JSON-LD schema.
- **SEO Validation**: `scripts/seo.cjs --validate` strictly enforces single `<h1>`, valid schema, correct sitemaps, and zero broken internal links.
- **Performance**: Preloaded LCP hero posters, lazy-loaded background videos, and deferred third-party tracking.
