# Klay Consulting Redesign: Equitify Architecture with Klay Signature Amber Glow

## Project Overview
Transform **Klay Consulting** (Dubai Business Setup, Golden Visa, Corporate Advisory platform) into the hyper-luxurious Swiss/architectural editorial aesthetic of **Equitify Asset** (`https://equitifyasset.com/`), styled in **Klay's authentic sovereign colors (Midnight Navy `#0C2D48`, Warm Gold `#D4AF37`, Champagne `#E8C37A`) and elevated with signature Amber Glow atmospheric lighting**.

Preserves **100% of Klay's sovereign content, 126 pre-rendered routes, 101 blog posts, Cost Calculator engine, and lead ingestion pipeline**.

## Aesthetic Fusion: Equitify Architecture + Klay Sovereign Palette
- **Equitify Structural Foundation**:
  - Precision 0px border-radius on cards and structural containers.
  - Hairline grid borders (`1px`) with corner crosshairs (`+`) at bounding box vertices in Klay Gold.
  - 50px full-pill CTA buttons with directional arrow indicators.
  - Alternating light and dark storytelling canvases.
  - 4-column numbered process tabs (`01`, `02`, `03`, `04`).
  - Side-by-side comparison tables ("On Your Own" vs "With Klay").
  - Numbered hairline FAQ accordions.
  - Minimal floating glass navigation and massive editorial sovereign footer.
- **Klay Authentic Color Palette**:
  - **Canvas Light**: Warm porcelain / ivory (`#FBFBFB` / `#F8FAF6`).
  - **Canvas Dark**: Deep Midnight Navy Obsidian (`#05131F` / `#0C2D48`).
  - **Primary Brand Accent**: Warm Metallic Gold (`#D4AF37`) & Radiant Gold (`#E8A72E`).
  - **Secondary Accent**: Soft Champagne (`#E8C37A`).
  - **Muted Charcoal / Slate**: `#534F4D` and `#64748B`.
- **Signature Amber Glow Lighting**:
  - Dramatic horizon ember / amber glow gradients (`#E8A72E` → `#D4AF37` → `#05131F`) illuminating section breaks on dark canvases.
  - Ambient gold/amber luminescence on primary interactive CTA pills (`shadow-[0_0_24px_rgba(232,167,46,0.35)]`).
  - Subtle gold hairline highlights on active card borders and process tabs.

## Core Non-Negotiables & Hard Constraints
1. **Zero Content Loss**: Every word of Klay's business setup advice, Golden Visa requirements, legal disclosures, pricing tiers, and all 101 blog articles remains 100% intact.
2. **126 Routes Preserved**: Prerendering must continue to output 126 static HTML pages with zero broken routes, zero 404s, and full SEO metadata intact.
3. **Cost Calculator Engine Untouched**: `src/lib/calculator-engine.ts` logic, USD peg (3.6725), jurisdictions, visa tiers, and instant price breakdowns must be preserved, skinned in the luxury architectural aesthetic.
4. **Lead Generation Pipeline Intact**: `KlayLeadForm.tsx`, IP rate limiting, atomic JSONL logging, NTFY notifications (`ntfy.sh/klay-leads-dubai`), WhatsApp triggers, and Netlify serverless functions must function without regression.
5. **Ponytail Rule**: The simplest code that fully works. Zero bloat, zero layout shift, fully accessible, and responsive from 390px mobile to 1440px desktop.

## Stack
- **Framework**: React 18, Vite, TypeScript
- **Routing**: React Router DOM (prerendered via custom SSG script)
- **Styling**: Tailwind CSS + CSS Custom Properties
- **Lead Backend**: Express (local dev) + Netlify Functions (production)
