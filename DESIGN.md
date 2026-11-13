---
name: Klay Consultants
description: Sovereign UAE Corporate Structuring, Legal Entity Formation & DIFC Estate Governance
colors:
  primary: "#0C2D48"
  primary-dark: "#071E33"
  accent-gold: "#E8A72E"
  gold-metallic: "#D4AF37"
  champagne: "#E8C37A"
  cream: "#F6FBF4"
  light-green: "#EDFBE2"
  neutral-dark: "#151515"
  neutral-muted: "#64748B"
  neutral-bg: "#FFFFFF"
typography:
  display:
    fontFamily: "Outfit, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Outfit, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Plus Jakarta Sans, Arial, sans-serif"
    fontSize: "clamp(0.9375rem, 1vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Plus Jakarta Sans, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.15em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-gold:
    backgroundColor: "{colors.accent-gold}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "12px 28px"
  button-gold-hover:
    backgroundColor: "{colors.champagne}"
  card-glass:
    backgroundColor: "rgba(255, 255, 255, 0.7)"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Klay Consultants

## Overview

**Creative North Star: "The Sovereign Legal Sanctuary"**

Klay Consultants' visual world reflects institutional legal precision, sovereign security, and high-capital elegance. Unlike mass-market business setup agents whose designs rely on loud neon banners, discount countdown timers, and generic stock illustrations, Klay's aesthetic is calm, unhurried, architectural, and razor-sharp. It speaks with the dignified authority of a private merchant bank and the technical rigor of an international law firm.

Every layout balances sovereign deep navy (`#0C2D48`, `#071E33`) with warm metallic gold accents (`#E8A72E`, `#E8C37A`) and crisp glass-morphic surfaces (`backdrop-blur-xl`, subtle hairline borders). Typography pairs the chiseled geometry of **Outfit** for headlines with the clean, highly legible proportions of **Plus Jakarta Sans** for complex regulatory ledgers and legal prose.

**Key Characteristics:**
- **Institutional Weight:** Deep sovereign navy grounds the experience, projecting permanence and regulatory substance.
- **Architectural Framing:** Asymmetric margins, hairline gold dividers (`1px solid rgba(197, 160, 89, 0.2)`), and frosted glass planes replace boxed card grids.
- **Radical Clarity:** Financial and regulatory data is typeset in tabular ledgers with explicit timelines, statutory authorities, and currency toggles.
- **Tactile Restraint:** Motion is purposeful and spring-weighted—subtle floating docks, smooth accordion expansions, and zero gratuitous bouncing.

---

## Colors

### Primary Palette
- **Sovereign Navy (`#0C2D48`):** The primary brand anchor. Used for primary callouts, hero backgrounds, headers, and primary buttons.
- **Deep Midnight (`#071E33`):** Canvas background for dark stages, video scrims, and footers.
- **Radiant Gold (`#E8A72E`):** High-intent interactive accent. Used for primary CTAs, active status toggles, and key financial totals.
- **Champagne Gold (`#E8C37A`):** Secondary gold accent for highlights, hover states, and architectural hairline borders.

### Surface & Neutral Palette
- **Pure White Canvas (`#FFFFFF`):** High-contrast background for content-heavy pages, documentation, and blog articles.
- **Soft Cream (`#F6FBF4`):** Warm subtle tinted surface for alternating sections and quote cards.
- **Light Sage Green (`#EDFBE2`):** Subtle status accent for positive validation states and trust badges.
- **Deep Charcoal Ink (`#151515`):** Primary body text on light grounds, avoiding harsh pure black.
- **Muted Slate (`#64748B`):** Secondary meta text, department labels, and table header descriptions.

---

## Typography

### Hierarchy
- **Display (`Outfit` Bold / 700):** Used for hero claims, major section headlines, and sovereign statements. Sized fluidly between `2.5rem` and `4.5rem` with optical tight tracking (`-0.02em`).
- **Headline (`Outfit` SemiBold / 600):** Sub-headings and card titles (`1.75rem` to `2.5rem`).
- **Title (`Outfit` Medium / 500):** Section identifiers and feature block titles (`1.25rem` to `1.75rem`).
- **Body (`Plus Jakarta Sans` Regular / 400):** Core reading typography. Sized fluidly (`0.9375rem` to `1.0625rem`) with comfortable line height (`1.7`) and max measure of `65ch`.
- **Label & Eyebrow (`Plus Jakarta Sans` SemiBold / 600):** All-caps category indicators and folio markers with expanded tracking (`0.15em`).

---

## Layout

- **Fluid Breakpoints:** 
  - Mobile: `< 640px` (single-column stacked flows, sticky bottom dock).
  - Tablet: `640px – 1024px` (balanced two-column grids).
  - Desktop: `> 1024px` (asymmetric hero splits, sticky sidebars, and wide tariff ledgers).
- **Rhythm & Measure:**
  - Section vertical rhythm: `py-16 md:py-24 lg:py-32`.
  - Content containers: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  - Prose measure: strictly clamped to `max-w-prose` (`65ch`) to prevent eye fatigue.

---

## Elevation & Depth

- **Tonal Layering Over Drop Shadows:** Depth is achieved primarily through layered opacity, frosted glass (`backdrop-blur-xl`), and translucent white/navy planes rather than heavy fuzzy black drop shadows.
- **Hairline Borders:** Borders use subtle alpha values (`border-white/20` or `border-navy-900/10`) with `inset 0 1px 0 rgba(255,255,255,0.6)` to simulate beveled glass edges.
- **Sovereign Glow:** High-value interactive elements (such as the Cost Calculator total or the Magnetic Dock) carry soft ambient glows (`box-shadow: 0 8px 32px rgba(12, 45, 72, 0.12)`).

---

## Shapes

- **Corner Radius Scale:**
  - Micro tags / pills: `rounded-full` (9999px) for pill buttons and status badges.
  - Interactive inputs / buttons: `rounded-lg` (8px) or `rounded-xl` (12px).
  - Content cards & containers: `rounded-2xl` (16px).
  - Hero framing plates: `rounded-3xl` (24px).

---

## Components

### Primary Actions
- **Pill CTA Buttons:** Pill-shaped with generous horizontal padding (`px-7 py-3.5`), bold typography, and smooth scale transitions (`hover:-translate-y-0.5`).
- **Magnetic Floating Dock:** Spring-animated desktop and mobile bottom navigation with quick-action shortcuts (Calculator, Visa, Services, WhatsApp, Consultation).

### Form Controls
- **Statutory Cost Calculator:** Multi-step reactive ledger with live currency switching (AED / USD), jurisdiction tabs, visa steppers, itemized fee breakdowns, and printable dossier export.
- **Inquiry Fields:** Elevated inset inputs with clean white/glass backing and focused gold boundary rings (`focus:ring-2 focus:ring-[#E8A72E]`).

---

## Do's and Don'ts

### Do's:
- **Do** position Klay as backed by corporate legal experts (Klay Legal) and HR specialists (Klay HR).
- **Do** show exact statutory fees, government processing timelines, and banking clearance requirements transparently.
- **Do** preserve the established Plus Jakarta Sans and Outfit font pairing across all new pages.
- **Do** test all interactive tools and forms for keyboard navigation and screen-reader accessibility.

### Don'ts:
- **Don't** use commoditized discount badges ("50% OFF TODAY ONLY!", "CHEAPEST DUBAI SETUP").
- **Don't** use em dashes in public copy; use periods, colons, or parentheses.
- **Don't** bake text into raster images. All copy must remain selectable, accessible semantic HTML.
- **Don't** use generic stock illustrations or 3D clay diorama figures. Maintain real photography and architectural graphics.
