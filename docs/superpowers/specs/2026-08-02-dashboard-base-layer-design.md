# Dashboard Base Layer — Company Performance Canvas

## Overview

Evolve the existing Insights Overview canvas into a **Company performance** dashboard that matches the low-fidelity mockup, while keeping the research side panel as the investigation surface. This pass focuses on the **base dashboard layer** only. Deeper AI agent experience work comes next.

**Product:** Tomoro Insights — research sidekick for analyst workflows  
**Persona:** R. Alvarez, Revenue Analyst  
**Approach:** Layout-first shell swap — rebuild the canvas structure to match the mockup; reuse existing chart components and research-panel plumbing.

---

## Goals

1. Match the Company performance mockup layout (header, filters, grid, floating entry).
2. Keep research-panel behavior; change only canvas entry points into it.
3. Make filters feel real via mocked timeframe × product slices.
4. Unify data-viz card chrome (title, tooltip, +, •••).
5. Responsive layout; left nav collapses when the panel opens.

## Non-goals (this pass)

- Anomaly badges / “ask about it” on cards
- Real AI, retrieval, or live data
- Functional image/chart attach or voice input on the floating bar (visual only)
- Rich TimeControls (comparison + granularity) — replaced by mockup segmented timeframe
- Dashboard Summary modal
- Deeper agent UX (follow-ups, thought trace polish, etc.) — deferred to next phase

---

## Page architecture

Canvas lives inside existing `AppShell` (sidebar + main + research panel).

**Top → bottom:**

1. **Header** — title “Company performance”; **Export**; **•••** (visual only)
2. **Filter bar** — segmented timeframe + **All products** dropdown
3. **Metric grid**
   - Row 1: Revenue · Active customers · Customer churn
   - Row 2: Gross margin · New ARR
   - Row 3: Drill down path (~⅓) · Channel breakdown (~⅔)
4. **Floating research bar** — bottom center; hidden while panel is open

---

## Cards

### KPI cards

Metrics: Revenue, Active customers, Customer churn, Gross margin, New ARR.

Keep existing value / delta / chart content. Wrap in new chrome:

| Element | Behavior |
|---|---|
| Title | Metric name |
| Info (i) | Hover tooltip explaining the chart/metric |
| **+** | Attach whole card as context **and** open the side panel |
| **•••** | Visual only |
| Chart | Existing type per metric (sparkline, donut, bars, stepped line) |

No anomaly UI this pass.

### Dimension cards

Same chrome; **whole-card** attach (not per list item):

- **Drill down path** — Starter, Growth, Pro (tiers; every product has these tiers)
- **Channel breakdown** — “Self serve upgrade or outbound” plus 1–2 sibling mock items so the card doesn’t feel empty

These are first-class attachable context items, not filters.

---

## Filters & mock data

### Timeframe

Segmented control: **This month · This quarter · This year · Custom**

- Under each non-custom preset: resolved date range in smaller type (e.g. This quarter → `Jul 1 – Sep 30, 2026`)
- Custom: simple date range picker; show applied range once set
- Default: **This quarter**
- Changing timeframe updates KPI values/deltas/series from a preset mock slice map

### Product

Dropdown: **All products · Product A · Product B · Product C**

- Default: **All products**
- Changing product updates KPI display from mock slices
- Product filter is **not** attachable context
- Model: products are independent of tiers; Drill down path always shows Starter / Growth / Pro (tiers apply to every product)

### Combined state

`timeframe × product` selects one mock slice. Missing combinations fall back to the All-products / This-quarter baseline so the UI never blanks out.

### Export

Same as current Share: copy short dashboard teaser to clipboard + toast. Header **•••** remains a non-functional placeholder.

---

## Floating bar → research panel

**Placeholder copy:** “Get the latest insights on the revenue dip this quarter.”

**Behavior:**

- Visible only when the research panel is closed
- On focus/click: show Cursor-like composer chrome — **+** (attach images/charts) and **voice mode** affordance; **visual only**, no real attach or speech-to-text
- Suggested chip: **Summarise** → prefills a dashboard-summary question and submits via the research panel path (no summary modal)
- Submit (arrow): opens side panel and starts the query with bar text; attached context (if any) rides along
- Card **+**: attach that card’s context and open the panel (empty composer is fine)

**Shell:**

- Left navigation collapses when the panel opens (`forceCollapsed={panelOpen}` — verify and keep)
- Dashboard grid is responsive: stacks on small widths (3 → 2 → 1; bottom row stacks Drill down / Channel); floating bar remains usable on narrow viewports

**Retired from canvas:** Share/Summarise header buttons, Dashboard Summary modal, anomaly shortcuts.

---

## Components & data flow

| Piece | Change |
|---|---|
| `InsightsCanvas` | Rebuild to Company performance layout + floating bar |
| `KpiCard` | New chrome; drop anomaly UI |
| `DimensionCard` (new) | Drill down path / Channel breakdown with same chrome |
| `TimeframeControl` (new) | Segmented presets + resolved dates + Custom picker; replaces `TimeControls` on this canvas |
| `ProductFilter` (new) | All products / Product A / B / C |
| `FloatingResearchBar` (new) | Placeholder, focus chrome, Summarise chip, submit |
| `mockData` | Timeframe × product KPI slices; dimension defs; tooltips |
| `types` / context IDs | Attach dimension cards (`drillDownPath`, `channelBreakdown`) alongside KPIs |
| `DashboardSummaryModal` | Remove from canvas flow |
| `AppShell` / `Sidebar` | Keep collapse-on-panel-open; responsive main area |

**Data flow:**

1. Local canvas state: `timeframe`, `product` → resolve mock KPI slice → render cards
2. Card **+** → `addContext(id)` (opens panel)
3. Floating bar submit / Summarise → `openPanel` + `submitQuestion` / prefill
4. Panel open → hide floating bar; sidebar forced collapsed

**Lightweight empty/error handling:**

- Export clipboard failure: soft-fail / keep existing toast pattern
- Custom range requires both dates before apply
- Unknown filter combo → baseline slice

---

## Verification (manual)

- [ ] Timeframe and product filters update KPI numbers from mock slices
- [ ] Resolved dates show under This month / This quarter / This year
- [ ] Card **+** attaches context, opens panel, collapses left nav
- [ ] Dimension cards attach as whole-card context
- [ ] Floating bar placeholder and focus chrome (+ / voice) render; actions are non-functional visuals
- [ ] Summarise chip opens panel via research path (no summary modal)
- [ ] Submit opens panel and hides floating bar
- [ ] Export copies teaser + toast
- [ ] Header ••• and card ••• are visual only
- [ ] Layout stacks cleanly at mobile/tablet widths
- [ ] No anomaly UI on cards

No new automated test suite required for this prototype pass.

---

## Relationship to prior scope

This design refines the **canvas / notified entry** surface of the prototype. It does not replace the in-scope research-panel journey items (stream of thought, citations, drill-downs, export review, saved checks, etc.); those remain for the subsequent **AI agent experience** phase, except where this pass explicitly retires canvas-level Summarise modal and anomaly shortcuts.
