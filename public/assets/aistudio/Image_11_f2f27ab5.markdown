---
name: Academic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#6a1edb'
  on-tertiary: '#ffffff'
  tertiary-container: '#8343f4'
  on-tertiary-container: '#f7edff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style
The design system embodies authoritative institutional governance, operational clarity, and high-density productivity. Engineered for enterprise school networks, university registrars, system administrators, and educators, it transitions complex academic workflows—such as grade books, multi-tier billing, attendance matrices, and compliance reporting—into a frictionless, clear workspace.

The design movement is **Corporate / Modern Enterprise with High-Density Information Architecture**. It pairs architectural structure with clean micro-interactions:
- **Tone:** Authoritative, dependable, crisp, and objective.
- **Visual Stance:** Subdued neutral canvases that let dense data grids, contextual state chips, and KPI visualizations command focus without cognitive fatigue.
- **Clarity over Decoration:** Zero superficial glassmorphism or exaggerated skeuomorphism; elevation and hierarchy are communicated through structured structural borders, tonal surfaces, and subtle contrast.

## Colors
The palette balances scholastic authority with vibrant functional cues.

- **Primary (`#2563eb` - Royal Blue):** Anchors core actions, active navigation items, primary interactive states, and focus triggers.
- **Secondary (`#0f172a` - Deep Scholastic Navy):** Drives high-contrast text, persistent vertical navigation rails, and primary data table headers.
- **Tertiary (`#7c3aed` - Academic Violet):** Reserved strictly for curriculum, examinations, grading milestones, and intellectual taxonomy.
- **Neutral (`#64748b` - Slate):** Powers metadata, muted borders, icon treatments, and auxiliary text.

### Semantic Status Palette
- **Success (`#059669` / Soft `#ecfdf5`):** Tuition cleared, attendance thresholds met, passing marks, healthy sync.
- **Warning (`#d97706` / Soft `#fffbeb`):** Pending fee reconciliations, low attendance warnings, pending approvals.
- **Critical / Danger (`#e11d48` / Soft `#fff1f2`):** Delinquent invoices, unexcused absences, failing grades, audit violations.
- **Surface Foundation:** Canvas runs on `#f8fafc` (Slate-50) with inner sections transitioning through `#f1f5f9` (Slate-100) and elevated cards set to `#ffffff` against crisp hairline dividers (`#e2e8f0`).

## Typography
The system employs **Plus Jakarta Sans** for display, section titles, and high-impact administrative metrics, lending a clean, contemporary structure without feeling decorative. 

For dense tabular content, forms, inspector panels, and system labels, **Inter** provides neutral legibility. Tabular numerals (`font-variant-numeric: tabular-nums`) must be enabled across all data grids, financial totals, student counts, and timestamp tables to preserve optical vertical alignment. Upper-case tracking is applied strictly to micro-labels (`label-md` and `label-sm`) for category markers and table column heads.

## Layout & Spacing
The layout model uses a dense, responsive fluid grid optimized for information-rich enterprise workflows:
- **Desktop (≥ 1280px):** 12-column layout with a fixed 260px administrative navigation sidebar, a contextual action bar, 24px (`margin-lg`) canvas padding, and 24px (`gutter-lg`) grid gutters.
- **Tablet / Compact Desktop (768px – 1279px):** Collapsible icon rail navigation (72px), 16px (`gutter`) gutters, and 24px (`margin-md`) page margins.
- **Mobile (< 768px):** Single-column stacked layout with 16px (`margin`) outer margins, converting multi-column grids into collapsible accordion cards or horizontally scrolling data sets.

Component layouts adhere to a tight 4px baseline rhythm. For enterprise tables and form arrays, compact spacing (`space-xs` and `space-sm`) is favored over large padding to minimize vertical scrolling and keep critical context visible.

## Elevation & Depth
Elevation favors crisp structural framing over aggressive drop shadows to keep dense data readable:

- **Level 0 (Base Canvas):** `#f8fafc` background color; flat, no shadow.
- **Level 1 (Card & Row Surfaces):** Pure `#ffffff` background with a 1px solid border in `#e2e8f0`. Shadows are subtle: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hovered Records, Quick Filters, KPI Overviews):** Hairline border transitions to `#cbd5e1` with a soft elevation shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Flyout Drawers, Contextual Modals, Dropdowns):** Layered above backdrops (`rgba(15, 23, 42, 0.45)`) using `0 12px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.04)` bordered by `#cbd5e1`.

## Shapes
The shape language uses a **Soft** radius profile (`0.25rem` / `4px` baseline) to maintain an authoritative, compact footprint. 

- Form inputs, standard buttons, table cell selections, and inline tags adopt `4px` corner radii.
- Base metric cards, master panels, and system modals leverage `8px` (`rounded-lg`).
- Floating utility chips, quick search inputs, and status badges use fully rounded pill geometry (`9999px`) to distinguish categorical indicators from actionable buttons.

## Components

### Buttons
- **Primary:** Solid `#2563eb` fill with `#ffffff` text, 4px border radius, 36px standard height (`space-sm` vertical, `space-md` horizontal padding). Transitions to `#1d4ed8` on hover.
- **Secondary / Outline:** `#ffffff` surface, 1px solid `#cbd5e1`, `#0f172a` text. On hover: `#f8fafc` background with `#94a3b8` border.
- **Destructive:** Subtle `#fff1f2` background with `#e11d48` text and `#fecdd3` border for low-tier warnings; solid `#e11d48` for confirmed destructive actions.

### Data Tables & Dense Grids
- **Header:** Background `#f8fafc`, 32px height, 1px bottom border `#cbd5e1`. Text uses `label-md` uppercase in `#64748b`.
- **Rows:** Alternating rows remain white; row height defaults to 40px (compact) or 48px (standard). Hairline border bottom `#f1f5f9`. Hover state shifts surface to `#f8fafc`.
- **Selected Row:** Surface tints to `#eff6ff` with a 2px left border accent in `#2563eb`.

### Status Badges & Chips
- **Geometry:** Height 20px, pill-shaped (`rounded-full`), padding 2px 8px, font `label-md`.
- **Paid / Present / Optimal:** `#ecfdf5` background, `#047857` text, 1px border `#a7f3d0`.
- **Pending / Review:** `#fffbeb` background, `#b45309` text, 1px border `#fde68a`.
- **Overdue / Absent:** `#fff1f2` background, `#be123c` text, 1px border `#fecdd3`.
- **Academic / Examination:** `#f5f3ff` background, `#6d28d9` text, 1px border `#ddd6fe`.

### Form Controls & Inputs
- **Inputs:** Height 36px, background `#ffffff`, 1px solid `#cbd5e1`, text `body-md` in `#0f172a`. Placeholder `#94a3b8`. Focus ring: 2px solid `#2563eb` with zero offset.
- **Checkboxes & Radios:** Compact 16x16px bounding box, border `#cbd5e1`, checked state `#2563eb` with crisp white icon marks.

### Cards & KPI Tiles
- **Structure:** Surface `#ffffff`, border 1px solid `#e2e8f0`, padding 16px (`space-lg`).
- **Metric Layout:** Top row displays `label-md` uppercase title and contextual utility icon. Middle displays `headline-lg` numerical values with tabular numbers. Footer displays relative delta chips (e.g., `+4.2% vs last term`) and timeframe indicators in `body-sm`.