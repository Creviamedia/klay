# Component Catalog & Design System (`COMPONENTS.md`)
## Klay Consultants UI Library

This document outlines the components, layout blocks, and primitives available across the Klay Consultants application.

---

## 1. Newly Added & Specialized Primitives

### 1.1 `CostCalculator` (`src/components/calculator/CostCalculator.tsx`)
- **Purpose**: Full-featured interactive UAE company formation cost calculator.
- **Features**: Live dual-currency toggle (AED/USD), step-by-step jurisdiction and activity selection, visa steppers, add-on checkboxes, itemized breakdown drawer, and lead capture.
- **Dependencies**: `src/lib/calculator-engine.ts`, `lucide-react`.

### 1.2 `FloatingDock` (`src/components/layout/FloatingDock.tsx`)
- **Purpose**: Contextual desktop quick-navigation dock with spring magnification.
- **Underlying Primitive**: `@componentry/magnetic-dock` (`src/components/ui/magnetic-dock.tsx`).
- **Positions**: Desktop bottom-center fixed pill with frosted glass backdrop.

### 1.3 Space UI Primitives (`src/components/ui/`)
A collection of 67 modern, accessible primitives powered by `@base-ui/react`, `@usespaceui/squircle`, and `class-variance-authority`:
- **Containers & Surfaces**: `card.tsx`, `frame.tsx`, `separator.tsx`, `sheet.tsx`, `dialog.tsx`, `drawer.tsx`, `popover.tsx`.
- **Forms & Inputs**: `button.tsx`, `input.tsx`, `textarea.tsx`, `checkbox.tsx`, `radio-group.tsx`, `select.tsx`, `slider.tsx`, `switch.tsx`, `toggle.tsx`, `field.tsx`.
- **Feedback & Status**: `badge.tsx`, `alert.tsx`, `alert-dialog.tsx`, `progress.tsx`, `meter.tsx`, `spinner.tsx`, `toast.tsx`, `skeleton.tsx`.
- **Navigation & Lists**: `tabs.tsx`, `breadcrumb.tsx`, `pagination.tsx`, `navigation-menu.tsx`, `menu.tsx`, `menubar.tsx`, `toolbar.tsx`, `table.tsx`.
- **Advanced Interactive**: `autocomplete.tsx`, `combobox.tsx`, `command.tsx`, `calendar.tsx`, `otp-field.tsx`, `number-field.tsx`, `preview-link-card.tsx`, `magnetic-dock.tsx`.

---

## 2. Layout & Site Shell

- `Header.tsx` / `LiquidNavbar.tsx`: Desktop and mobile navigation with WebGL water-refraction effects.
- `Footer.tsx`: Universal corporate footer with legal links, sitemap references, and office details.
- `FloatingContactWidget.tsx`: Mobile floating consultation CTA.
- `BackgroundVideo.tsx`: Reduced-motion compliant decorative looping background video with high-priority poster preloading.

---

## 3. Page Routes

- `HomePage.tsx` (`/`)
- `AboutPage.tsx` (`/about/`)
- `ServicesPage.tsx` (`/services/`) & `ServiceDetailPage.tsx` (`/services/:slug/`)
- `BusinessSetupPage.tsx` (`/business-setup/`)
- `CostCalculatorPage.tsx` (`/cost-calculator/`) — **Now powered natively by `CostCalculator.tsx`**
- `GoldenVisaPage.tsx` (`/golden-visa/`)
- `BlogPage.tsx` (`/blog/` & `/blog/page/:page`) & `BlogArticlePage.tsx` (`/blog/:slug` & legacy `/:slug`)
- `ContactPage.tsx` (`/contact/`)
- `PrivacyPage.tsx` (`/privacy/`) & `TermsPage.tsx` (`/terms/`)
