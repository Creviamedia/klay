# Requirements: Klay Consulting Equitify Modernization (Klay Colors + Amber Glow)

## 1. Visual & Design Primitives
- [ ] **REQ-1.1**: Define Klay + Amber Glow design tokens in `globals.css` and `tailwind.config.ts`:
  - Canvas Light: `#FBFBFB` (warm porcelain)
  - Canvas Dark: `#05131F` / `#0C2D48` (deep midnight navy void)
  - Brand Navy: `#0C2D48` (primary institutional navy)
  - Brand Gold: `#D4AF37` (metallic prestige gold)
  - Radiant Amber / Accent: `#E8A72E` (vibrant gold / amber)
  - Champagne: `#E8C37A` (light accent / card tint)
  - Amber Glow: `radial-gradient(ellipse 80% 50% at 50% 100%, rgba(232, 167, 46, 0.35) 0%, rgba(212, 175, 55, 0.12) 50%, transparent 80%)`
  - Hairline Borders: `rgba(212, 175, 55, 0.2)` on dark canvas, `rgba(12, 45, 72, 0.12)` on light canvas
- [ ] **REQ-1.2**: Update typography rules:
  - Tight letter-spacing (`-0.03em`) on headings
  - Huge display typography (`78px` H1, `64px` H2, `48px` H3)
  - Gold uppercase index tags (`01`, `02`, `03`...)
- [ ] **REQ-1.3**: Architectural grid markers:
  - Corner crosshairs (`+`) rendered in gold/amber at bounding box vertices
  - Zero border-radius (`rounded-none`) on cards and containers
  - 50px pill radius (`rounded-full`) on interactive CTA buttons with ambient amber glow

## 2. Layout & Global Navigation
- [ ] **REQ-2.1**: **Equitify Floating Navbar (Klay Styled)**:
  - Translucent frosted glass bar with backdrop blur
  - Uppercase tracked nav links: `HOME`, `BUSINESS SETUP`, `GOLDEN VISA`, `CALCULATOR`, `ABOUT`, `BLOG`
  - Radiant gold pill CTA: `GET STARTED` / `CONTACT US` with subtle glow
  - Mobile minimalist hamburger drawer with full-screen midnight navy overlay and gold link stagger
- [ ] **REQ-2.2**: **Equitify Sovereign Footer (Klay Styled)**:
  - Deep midnight navy canvas with amber horizon glow backdrop
  - Massive bold headline: `Start Your UAE Journey, Skip The Friction`
  - Minimalist lead / newsletter input with gold submit button
  - Corporate legal links, Dubai Downtown & DIFC office addresses, and WhatsApp channel

## 3. Component Transformations
- [ ] **REQ-3.1**: **Hero Section**:
  - High-res Dubai skyline photography with midnight navy gradient overlay and subtle ambient amber horizon glow
  - Dynamic rotating headline or clean display typography
  - Two-part CTA: radiant gold pill `EXPLORE SETUP OPTIONS` + circular arrow button with amber luminescence
- [ ] **REQ-3.2**: **Pillars & Feature Grids**:
  - Alternating light canvas (`#FBFBFB`) and midnight navy dark canvas (`#05131F`)
  - 2-column or 3-column architectural cards with hairline borders, corner crosshairs, and gold outline icons
  - Numbered index headers (`01 Exclusive Access`, `02 Institutional Terms`)
- [ ] **REQ-3.3**: **Comparison Table Matrix**:
  - "On Your Own" vs "With Klay"
  - Warm champagne-tinted background on "With Klay" column (`rgba(232, 195, 122, 0.1)`) with gold checkmarks
- [ ] **REQ-3.4**: **Numbered Process Tabs**:
  - 4-step setup process (`01 Consultation`, `02 Jurisdiction & License`, `03 Visa Stamping`, `04 Corporate Bank Account`)
  - Gold underlined active tabs with smooth crossfade
- [ ] **REQ-3.5**: **Numbered Accordion FAQ**:
  - Clean hairline divided items with gold `01`, `02` numbering and smooth toggle animations
- [ ] **REQ-3.6**: **Cost Calculator Integration**:
  - Re-skin existing `calculator-engine.ts` with Equitify's minimalist card system, gold sliders, instant USD/AED toggles, and radiant gold CTA
- [ ] **REQ-3.7**: **Sovereign Lead Form**:
  - Transform `KlayLeadForm.tsx` to match Equitify's clean floating input style with bottom hairline borders, while maintaining IP rate limiting, NTFY alerts, and WhatsApp handoff

## 4. Preservation & Non-Regression
- [ ] **REQ-4.1**: 126 pre-rendered routes pass build and verification with zero 404s
- [ ] **REQ-4.2**: 101 blog articles render with high-legibility editorial typography
- [ ] **REQ-4.3**: Unit tests pass (`npm test`)
- [ ] **REQ-4.4**: TypeScript typecheck passes with 0 errors (`npm run typecheck`)
