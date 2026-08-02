# Dashboard Base Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Insights canvas into the Company performance dashboard base layer (layout, card chrome, mocked filters, floating research entry) per `docs/superpowers/specs/2026-08-02-dashboard-base-layer-design.md`.

**Architecture:** Local canvas state (`timeframe`, `product`) resolves mocked KPI slices for display. Card **+** and the floating bar open the existing research panel via `ResearchContext`. Dimension cards share the same attachable context system as KPIs through a widened `ContextId` type. No real AI/data this pass.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, framer-motion, lucide-react. Verification via `npm run build` and `npm run lint` (no unit-test runner in repo).

## Global Constraints

- Placeholder copy exactly: `Get the latest insights on the revenue dip this quarter.`
- Product options exactly: `All products`, `Product A`, `Product B`, `Product C`
- Timeframe presets: This month / This quarter / This year / Custom, with resolved dates under non-custom options
- Drop anomaly UI from cards; retire Dashboard Summary modal from canvas
- Floating bar attach/voice affordances are visual only
- Left nav collapses when panel open; dashboard responsive
- Do not expand AI agent panel UX beyond entry-point wiring

## File structure

| File | Responsibility |
|---|---|
| `src/types.ts` | Add `DimensionId`, `ContextId`; keep `MetricId` for KPI findings |
| `src/data/mockData.ts` | KPI slices by timeframe×product; dimension defs; `getContextItem`; update helpers that assumed only `MetricId` in trays |
| `src/data/dashboardFilters.ts` | Timeframe/product types, resolved date labels, slice lookup |
| `src/components/Canvas/TimeframeControl.tsx` | Segmented timeframe + Custom picker |
| `src/components/Canvas/ProductFilter.tsx` | Product dropdown |
| `src/components/Canvas/DimensionCard.tsx` | Drill down / Channel cards with shared chrome |
| `src/components/Canvas/FloatingResearchBar.tsx` | Floating entry + focus chrome + Summarise chip |
| `src/components/Canvas/KpiCard.tsx` | New chrome; remove anomaly UI |
| `src/components/Canvas/InsightsCanvas.tsx` | Company performance layout |
| `src/state/researchReducer.ts` / `ResearchContext.tsx` | `attachedContext: ContextId[]` |
| `src/components/Panel/ContextTray.tsx` / `SuggestedQuestions.tsx` | Resolve titles/questions via `getContextItem` |
| Delete unused from canvas: `DashboardSummaryModal.tsx` usage; leave or delete file if unused |
| `src/components/Canvas/TimeControls.tsx` | Stop using on canvas (may delete if unused) |

---

### Task 1: Types + context helpers for dimension cards

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/mockData.ts`
- Modify: `src/state/researchReducer.ts`
- Modify: `src/state/ResearchContext.tsx`
- Modify: `src/components/Panel/ContextTray.tsx`
- Modify: `src/components/Panel/SuggestedQuestions.tsx`

**Interfaces:**
- Produces: `ContextId`, `DimensionId`, `isMetricId()`, `DIMENSION_DEFINITIONS`, `getContextItem(id: ContextId): { id, title, suggestedQuestions }`
- Produces: `attachedContext: ContextId[]`, `addContext(id: ContextId, …)`

- [ ] **Step 1: Widen context IDs in types**

```ts
export type MetricId = 'revenue' | 'grossMargin' | 'churn' | 'newArr' | 'activeCustomers';
export type DimensionId = 'drillDownPath' | 'channelBreakdown';
export type ContextId = MetricId | DimensionId;

export function isMetricId(id: ContextId): id is MetricId {
  return id !== 'drillDownPath' && id !== 'channelBreakdown';
}

export interface ContextItem {
  id: ContextId;
  title: string;
}
```

Keep `Finding.metricId` / agent answer resolution on `MetricId` only. For `determineUsedContext` / `resolveAnswer`, filter to metrics:

```ts
export function determineUsedContext(question: string, contextIds: ContextId[]): MetricId[] {
  const metricIds = contextIds.filter(isMetricId);
  // existing keyword logic on metricIds
}
```

- [ ] **Step 2: Add dimension definitions + getContextItem**

```ts
export const DIMENSION_DEFINITIONS = [
  {
    id: 'drillDownPath' as const,
    title: 'Drill down path',
    tooltip: 'Plan tiers available across every product — Starter, Growth, and Pro.',
    items: ['Starter', 'Growth', 'Pro'],
    suggestedQuestions: ['How is performance split across Starter, Growth, and Pro?'],
  },
  {
    id: 'channelBreakdown' as const,
    title: 'Channel breakdown',
    tooltip: 'Where new and expansion ARR is coming from by motion.',
    items: ['Self serve upgrade or outbound', 'Partner-assisted', 'Enterprise AE-led'],
    suggestedQuestions: ['Which channel is driving the most ARR this quarter?'],
  },
];

export function getContextItem(id: ContextId): ContextItem & { suggestedQuestions: string[] } {
  if (isMetricId(id)) {
    const kpi = getKpi(id);
    return { id, title: kpi.title, suggestedQuestions: kpi.suggestedQuestions };
  }
  const dim = DIMENSION_DEFINITIONS.find((d) => d.id === id)!;
  return { id, title: dim.title, suggestedQuestions: dim.suggestedQuestions };
}
```

Update `addContext` toast to use `getContextItem(id).title`. Update ContextTray empty copy to mention **+** on cards. SuggestedQuestions: `attachedContext.flatMap((id) => getContextItem(id).suggestedQuestions)`.

- [ ] **Step 3: Verify types compile**

Run: `npx tsc -b --pretty false`
Expected: no errors related to ContextId (other WIP may still fail — fix only what this task introduced)

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/data/mockData.ts src/state/researchReducer.ts src/state/ResearchContext.tsx src/components/Panel/ContextTray.tsx src/components/Panel/SuggestedQuestions.tsx
git commit -m "feat: widen context IDs for dimension cards"
```

---

### Task 2: Dashboard filter mock data

**Files:**
- Create: `src/data/dashboardFilters.ts`
- Modify: `src/data/mockData.ts` (export baseline KPIs; optional slice overrides)

**Interfaces:**
- Produces:
  - `TimeframePreset = 'thisMonth' | 'thisQuarter' | 'thisYear' | 'custom'`
  - `ProductFilterId = 'all' | 'productA' | 'productB' | 'productC'`
  - `TIMEFRAME_OPTIONS` with `{ id, label, resolvedRange: string | null }`
  - `PRODUCT_OPTIONS` with `{ id, label }`
  - `resolveKpis(timeframe, product): KpiDefinition[]` — merges baseline + slice overrides; custom uses thisQuarter baseline values

- [ ] **Step 1: Implement filter module**

Include at least distinct numeric overrides for:
- thisMonth/all, thisQuarter/all (baseline), thisYear/all
- thisQuarter/productA, thisQuarter/productB, thisQuarter/productC

Fallback: `thisQuarter` + `all` baseline from current `KPI_DEFINITIONS`.

Resolved ranges (prototype dates, 2026):
- This month: `Aug 1 – Aug 31, 2026`
- This quarter: `Jul 1 – Sep 30, 2026`
- This year: `Jan 1 – Dec 31, 2026`

- [ ] **Step 2: Verify**

Run: `npx tsc -b --pretty false`
Expected: passes for new module

- [ ] **Step 3: Commit**

```bash
git add src/data/dashboardFilters.ts src/data/mockData.ts
git commit -m "feat: add timeframe×product mock KPI slices"
```

---

### Task 3: TimeframeControl + ProductFilter

**Files:**
- Create: `src/components/Canvas/TimeframeControl.tsx`
- Create: `src/components/Canvas/ProductFilter.tsx`

**Interfaces:**
- Consumes: types/options from `dashboardFilters.ts`
- Produces:
  - `<TimeframeControl value onChange customFrom customTo onCustomChange />`
  - `<ProductFilter value onChange />`

- [ ] **Step 1: Build segmented timeframe** matching mockup — green/sage selected pill; label + smaller resolved date under each preset; Custom opens inline date inputs + Apply

- [ ] **Step 2: Build product dropdown** — pill button “All products” / selected product with chevron; menu of four options

- [ ] **Step 3: Commit**

```bash
git add src/components/Canvas/TimeframeControl.tsx src/components/Canvas/ProductFilter.tsx
git commit -m "feat: add timeframe and product filter controls"
```

---

### Task 4: Card chrome (KpiCard + DimensionCard)

**Files:**
- Modify: `src/components/Canvas/KpiCard.tsx`
- Create: `src/components/Canvas/DimensionCard.tsx`

**Interfaces:**
- Produces:
  - `KpiCard({ kpi, isAttached, onAdd })` — no anomaly props
  - `DimensionCard({ definition, isAttached, onAdd })`

Shared header pattern:
- Title (sentence case / title as given) + Info icon with `title`/tooltip text
- Circular **+** button (attached state uses check/sage)
- Circular **•••** button (`type="button"`, no handler / `aria-disabled` or inert)

Keep value, delta, chart, scope on KPI cards. Dimension cards: bulleted `items` list.

- [ ] **Step 1: Restyle KpiCard; remove anomaly UI and Add-to-chat text button**

- [ ] **Step 2: Implement DimensionCard**

- [ ] **Step 3: Commit**

```bash
git add src/components/Canvas/KpiCard.tsx src/components/Canvas/DimensionCard.tsx
git commit -m "feat: unify data-viz card chrome with + and tooltip"
```

---

### Task 5: FloatingResearchBar

**Files:**
- Create: `src/components/Canvas/FloatingResearchBar.tsx`

**Interfaces:**
- Consumes: `openPanel`, `submitQuestion`, `panelOpen` from research context (or props from parent)
- Produces: `<FloatingResearchBar />` rendered only when `!panelOpen`

Behavior:
- Placeholder: `Get the latest insights on the revenue dip this quarter.`
- Focused: show **+** and mic (voice) buttons — `type="button"` with no-op / `preventDefault`, `title` explaining coming soon
- Summarise chip above or inside bar: on click → `submitQuestion('Summarise the Company performance dashboard for this quarter.')` after `openPanel()`
- Submit arrow: if empty, no-op; else `openPanel()` + `submitQuestion(text)` and clear

- [ ] **Step 1: Implement component**

- [ ] **Step 2: Commit**

```bash
git add src/components/Canvas/FloatingResearchBar.tsx
git commit -m "feat: add floating research entry bar"
```

---

### Task 6: Rebuild InsightsCanvas + cleanup

**Files:**
- Modify: `src/components/Canvas/InsightsCanvas.tsx`
- Delete or stop importing: `DashboardSummaryModal.tsx`, `TimeControls.tsx` if unused
- Verify: `AppShell` still passes `forceCollapsed={panelOpen}`

Layout:
1. Header: “Company performance” | Export (sage/green) | •••
2. Filter row: TimeframeControl + ProductFilter
3. Grid: row1 3 cols; row2 2 cols; row3 `lg:grid-cols-3` with dimension spanning 1 + 2
4. FloatingResearchBar fixed/sticky bottom center
5. `pb-28` on main content so bar doesn’t cover cards
6. Responsive: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` patterns per rows

Export = existing clipboard teaser + toast.

Wire: `resolveKpis(timeframe, product)` → map KpiCards; DIMENSION_DEFINITIONS → DimensionCards; `addContext(id)` on +.

- [ ] **Step 1: Rebuild canvas**

- [ ] **Step 2: Remove dead imports/files** (`DashboardSummaryModal` if unused; `TimeControls` if unused)

- [ ] **Step 3: Full verify**

Run: `npm run lint && npm run build`  
Expected: lint clean, production build succeeds

- [ ] **Step 4: Manual smoke** (dev server): filters change numbers; + opens panel + collapses nav; floating bar hides when panel open; Summarise submits; no anomaly UI; responsive stack

- [ ] **Step 5: Commit**

```bash
git add -A src/components/Canvas src/data src/types.ts src/state src/components/Panel
git commit -m "feat: rebuild Company performance dashboard base layer"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| Company performance layout | 6 |
| Export = Share; header ••• placeholder | 6 |
| Segmented timeframe + resolved dates + Custom | 2, 3 |
| Product A/B/C mocked filter | 2, 3 |
| KPI rich content + new chrome | 4 |
| Dimension cards whole-card attach | 1, 4, 6 |
| Floating bar placeholder + focus chrome | 5 |
| Summarise via panel path; no summary modal | 5, 6 |
| Hide bar when panel open; nav collapse | 5, 6 |
| Responsive grid | 6 |
| No anomalies | 4 |
| Timeframe×product mock slices | 2 |

## Execution note

No unit-test runner in this repo — verification is `tsc` / `lint` / `build` plus manual smoke. Do not add a test framework in this pass.
