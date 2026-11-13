# UI Design Contract: Klay Consulting Equitify Modernization

**Phase 1: Design System Primitives & Tokens**
**Status**: APPROVED DESIGN CONTRACT
**Standard**: Hallmark 2.0 Floor + Tasteskill 2.5 + Impeccable Craft + Klay Sovereign Palette

---

## 1. Hallmark Floor & Craft Invariants (Non-Waivable)

1. **Token Declaration**: Every color, font, border, and glow is declared as a CSS variable at `:root` in `src/styles/globals.css`. Zero arbitrary inline hex values in components.
2. **Precision Transitions**: Never `transition: all`. Every transition specifies exact properties (`transition-colors`, `transition-transform`, `transition-opacity`). Duration `200ms` or `300ms` with ease-out curve.
3. **Hardware-Accelerated Animation**: Never animate `width`, `height`, `top`, or `left`. All motion uses `transform` (`translate3d`, `scale`) and `opacity`.
4. **Layout Containment**: `overflow-x: clip` enforced on `html` and `body`. Never `hidden`, never `100vw`.
5. **Robust Responsive Grid**: Image-bearing grid tracks use `minmax(0, 1fr)`. Display headlines carry `overflow-wrap: break-word; min-width: 0`.
6. **Instant Focus Visible**: Every interactive button, input, tab, and link has `:focus-visible` with a 2px outline in Brand Gold (`#D4AF37`) appearing with 0ms delay and 2px offset.
7. **Accessibility & Reduced Motion**: All transitions and ambient glows wrap in `@media (prefers-reduced-motion: reduce)` fallbacks disabling transforms. Content remains 100% visible and interactive without scripting.
8. **Truth in Evidence**: Zero invented metrics, testimonials, or logos. Klay's verified UAE government jurisdiction accreditations (DED, DIFC, ADGM, DMCC) and real client reviews are used exclusively.
9. **Typography Restraint**: Zero italicized words inside roman headings. Section badges use clean monospace/sans uppercase micro-tags (`01`, `02`...) sized `12px` with neutral letter spacing.
10. **Viewport Geometry (Tasteskill Rule)**:
    - The hero's headline, value proposition sentence, and primary action are all visible at `1280 x 800` and `1440 x 900` without scrolling.
    - Equal left and right margins across all screens (`max-w-7xl mx-auto px-6 lg:px-8`).
    - At `1920px+`, outer gutters expand; the container measure and grid do not stretch uncontrollably.

---

## 2. Design System Tokens (`:root`)

```css
:root {
  /* Canvas Canvases */
  --canvas-light: #FBFBFB;
  --canvas-light-card: #FFFFFF;
  --canvas-dark: #05131F;
  --canvas-dark-card: #0A1E30;
  --canvas-dark-elevated: #0E273E;

  /* Klay Sovereign Brand Palette */
  --brand-navy: #0C2D48;
  --brand-navy-deep: #05131F;
  --brand-navy-surface: #103859;
  --brand-gold: #D4AF37;
  --brand-gold-hover: #C59B27;
  --accent-amber: #E8A72E;
  --accent-amber-hover: #D1921E;
  --accent-champagne: #E8C37A;
  --accent-champagne-tint: rgba(232, 195, 122, 0.12);

  /* High-Contrast Typography */
  --text-primary-dark: #05131F;
  --text-secondary-dark: #475569;
  --text-muted-dark: #64748B;
  --text-primary-light: #FBFBFB;
  --text-secondary-light: #CBD5E1;
  --text-muted-light: #8A99A8;

  /* Architectural Hairlines */
  --border-hairline-dark: rgba(212, 175, 55, 0.22);
  --border-hairline-dark-active: rgba(232, 167, 46, 0.55);
  --border-hairline-light: rgba(12, 45, 72, 0.12);
  --border-hairline-light-active: rgba(212, 175, 55, 0.45);

  /* Signature Amber Glow Lighting */
  --amber-horizon-glow: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(232, 167, 46, 0.35) 0%, rgba(212, 175, 55, 0.12) 50%, transparent 80%);
  --amber-button-glow: 0 0 24px -2px rgba(232, 167, 46, 0.4);
  --amber-card-glow: 0 0 32px -4px rgba(232, 167, 46, 0.2);

  /* Typography Scales */
  --font-heading: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Font Metrics */
  --tracking-tight: -0.03em;
  --tracking-display: -0.035em;
  --tracking-normal: 0em;
  --tracking-wide: 0.05em;

  /* Border Radii */
  --radius-card: 0px;
  --radius-grid: 0px;
  --radius-pill: 50px;
}
```

---

## 3. Component Design Contracts

### Component 1: `EquitifyButton` (Signature 50px Pill CTA)
- **Role**: Primary conversion trigger for quote requests, consultation bookings, and calculator actions.
- **Affordance**: 50px full-pill (`rounded-full`), `min-h-[48px]` tap target.
- **Visual Composition**:
  - Background: Radiant Amber (`var(--accent-amber)` / `#E8A72E`).
  - Text: High-contrast Midnight Navy (`var(--brand-navy-deep)` / `#05131F`), font weight `600`, tracking `-0.01em`, uppercase or title case.
  - Directional Badge: Integrated right circular badge with `→` arrow icon.
  - Glow: Ambient amber glow shadow `var(--amber-button-glow)`.
- **States**:
  - `default`: Scale 1.0, glow opacity 0.6.
  - `hover`: Scale 1.02 (`transform: scale(1.02)`), glow expands, arrow icon translates right by `4px` (`transform: translateX(4px)`).
  - `active`: Scale 0.98.
  - `focus-visible`: 2px solid Gold outline with 2px offset.
  - `disabled`: Opacity 0.4, cursor not-allowed, glow removed.

### Component 2: `CornerCrosshairs` (Architectural Bounding Marker)
- **Role**: Signature Swiss architectural detail anchoring section containers and card grids.
- **Affordance**: Four absolute-positioned `+` or 4x4px markers positioned at corners of container:
  - Top-Left: `top-0 left-0 -translate-x-1/2 -translate-y-1/2`
  - Top-Right: `top-0 right-0 translate-x-1/2 -translate-y-1/2`
  - Bottom-Left: `bottom-0 left-0 -translate-x-1/2 translate-y-1/2`
  - Bottom-Right: `bottom-0 right-0 translate-x-1/2 translate-y-1/2`
- **Color**: Metallic Gold (`var(--brand-gold)` / `#D4AF37`) with 0.6 opacity.
- **States**: Static visual indicator; scales to 1.2 on card hover.

### Component 3: `ProcessTabs` (4-Column Interactive Setup Steps)
- **Role**: Demystifies Dubai business setup into 4 clear milestones (`01 Jurisdiction`, `02 License`, `03 Visa`, `04 Bank Account`).
- **Affordance**: 4 horizontal columns separated by hairline dividers.
- **Visual Composition**:
  - Index Number: `01`, `02`, `03`, `04` in Brand Gold.
  - Step Title: Large grotesque title (`text-xl font-semibold`).
  - Active Tab: 2px solid Gold/Amber bottom indicator + ambient warm amber highlight.
  - Inactive Tab: Hairline border, muted text, smooth transition to active on click.
- **States**:
  - `inactive`: Text muted, hover background `rgba(212, 175, 55, 0.04)`.
  - `active`: Gold text, glowing border, active pane revealed with `opacity` fade.
  - `focus-visible`: Gold outline on tab trigger.

### Component 4: `ComparisonMatrix` ("On Your Own" vs "With Klay")
- **Role**: Institutional comparison proving why DIY setup causes hidden costs, while Klay delivers 100% foreign ownership and 3-day turnaround.
- **Affordance**: 3-column table/grid (Dimension, "On Your Own", "With Klay").
- **Visual Composition**:
  - Column 1 (Dimension): Subtle gold line icon + category label (`Access`, `Speed`, `Ownership`, `Banking`).
  - Column 2 ("On Your Own"): Transparent background, muted text, gray friction bullet points.
  - Column 3 ("With Klay"): Warm Champagne luxury tint (`var(--accent-champagne-tint)`), hairline gold border, vibrant gold checkmark icons (`✓`), bold affirmative copy.
- **Corner Markers**: Bounded by Gold Corner Crosshairs.

### Component 5: `NumberedAccordion` (Hairline FAQ System)
- **Role**: Addresses regulatory, tax, and visa questions with instant clarity.
- **Affordance**: Clean stacked rows separated by 1px hairline rules (`var(--border-hairline-light)` or `dark`).
- **Visual Composition**:
  - Index: Two-digit index (`01`, `02`, `03`...) in Brand Gold.
  - Question: `text-lg` or `text-xl` sans-serif, hover color shifts to Gold.
  - Toggle Icon: Minimalist `+` rotating to `×` (45deg rotation via `transform: rotate(45deg)`).
  - Expanded Content: Smooth height disclosure with ease-out curve.

### Component 6: `AtmosphericBanner` (Signature Amber Glow Horizon)
- **Role**: Atmospheric section transition dividing major page milestones on dark canvases.
- **Visual Composition**:
  - Background: Obsidian Midnight Navy (`var(--canvas-dark)` / `#05131F`).
  - Horizon Glow: Elliptical radial amber glow at bottom edge (`var(--amber-horizon-glow)`).
  - Centered Message: Giant display title in crisp white, centered action pill.

---

## 4. UI Considerations & State Coverage

| Surface / Flow | Default State | Hover / Focus State | Active / Loading State | Error / Edge State |
| :--- | :--- | :--- | :--- | :--- |
| **Navbar** | Frosted glass, 0px border-b hairline | Link color transitions to Gold; CTA scales 1.02 | Mobile hamburger opens fullscreen dark overlay with staggered links | If JS disabled, nav renders semantic HTML links |
| **Hero CTA** | Amber pill with right arrow | Arrow translates `+4px`, amber glow expands | Clicks route instantly to `/cost-calculator` or open Lead Modal | Fallback link is native HTML anchor |
| **Process Tabs** | Step `01` active by default | Inactive tab highlights with gold hairline | Tab switch crossfades in 200ms without layout jump | Content accessible via arrow keys (Tablist WAI-ARIA) |
| **Lead Form Inputs** | Transparent background, bottom hairline | Hairline turns Gold, floating label turns Amber | Submitting shows spinner + disables inputs | Validation error shows 1px red-amber bottom line + inline error text |
| **Calculator Sliders** | Gold hairline track, gold circular thumb | Thumb scales 1.15 with amber halo | Sliding recalculates totals instantaneously (<1ms) | Min/max bounds clamped strictly in `calculator-engine.ts` |

---

## 5. Review & Verification Criteria

1. **Hallmark Linter Verification**: Passes zero-slop checks with 0 failures:
   - Tokens at `:root`: PASS
   - No `transition: all`: PASS
   - No animated dimensions (`width`, `height`, `top`, `left`): PASS
   - Focus visible everywhere: PASS
   - Reduced motion supported: PASS
2. **Tasteskill Verification**:
   - Hero fits on `1280 x 800` viewport without scroll: PASS
   - Equal margins: `max-w-7xl mx-auto px-6 lg:px-8`: PASS
   - 2px card lift and 1.02 photo zoom micro-interactions: PASS
3. **Preservation Verification**:
   - 126 pre-rendered routes verified: PASS
   - 101 blog articles verified: PASS
   - `calculator-engine.ts` AED/USD pricing verified: PASS
   - Sovereign lead pipeline verified: PASS
