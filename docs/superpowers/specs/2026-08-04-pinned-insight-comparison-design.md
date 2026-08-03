# Pinned Insight Comparison — Design

## Overview

When users drill deeper or send a follow-up, they currently lose easy sight of the prior agent insight (drill-down replaces the parent answer; older turns scroll away). This feature lets them keep a short pinned reference to the previous response.

To decide placement, the prototype exposes a **temporary A/B toggle** near the composer that switches between two pin triggers. Both modes share one pin component so the comparison is fair.

**Persona:** R. Alvarez, Revenue Analyst  
**Job to be done:** Drill into a follow-up without losing the prior headline insight she is about to quote or build on.

---

## Goals

1. Preserve prior insight as a compact pin (headline + short summary) when context would otherwise disappear.
2. Let stakeholders compare two placement patterns via a temporary toggle.
3. Expand a pin inline for a bit more detail without leaving the current thread.

---

## Non-goals

- Persisting the toggle preference across sessions
- Per-thread pin-trigger settings (session-global is enough for the comparison)
- Changing whether a typed question nests vs starts a new top-level turn
- Live regeneration of `pinSummary` when answers are corrected (noted as a future seam; mock does not implement corrections)
- Changing export draft content or breadcrumb navigation semantics

---

## Data model

### `Answer` extensions

| Field | Required | Purpose |
|-------|----------|---------|
| `pinSummary` | Optional | Dedicated short blurb authored for the pin only — **not** auto-truncated body text |

**Headline is not a separate field.** The pin title is the existing `## …` heading already embedded in `summary` (same string the full-answer renderer uses). Both the pin and the full-answer header read from that single source so mocks cannot drift.

### Headline resolution: `getAnswerHeadline(answer)`

1. If `summary` contains a `## ` heading → use that text (strip markdown markers).
2. Else if the answer **can spawn a child** (has an investigate path / can be drilled into) → thin **auto-headline** (e.g. first sentence of `summary`, or a short echo of the question context). Any answer that can spawn a child **must** expose a headline so a drilled child always has an anchor.
3. Else (leaf, no `##`) → no pin headline; pin is omitted.

### `pinSummary` authorship

- Authored in mock data alongside the answer body.
- **Future seam (document only):** when an answer is revised or re-run in a live system, `pinSummary` must regenerate with the body so it cannot go stale relative to a corrected headline/body. The prototype does not implement answer correction regeneration.

### Session UI state

```ts
type PinTrigger = 'drilldown' | 'newTurn';
// Default: 'drilldown'
```

Stored in research UI/session state only (not on `ConversationTurn`). Flipping the toggle remounts the appropriate collapse/expand immediately; inline expand state resets on mode flip.

**Naming note:** `PinTrigger` is about *when/where the pin appears*, not about click behavior. Click behavior is fixed: expand inline (see Interaction).

---

## Pin triggers (comparison modes)

| Mode | Label (toggle) | When the pin appears | What happens to the prior full answer |
|------|----------------|----------------------|---------------------------------------|
| **A** | On drill-down | User investigates / `activePath` is set | Parent full answer stays hidden (as today); `PinnedInsight` for the **immediate parent** sits above breadcrumbs in `DrillDownThread`. Nested levels pin their immediate parent the same way. |
| **B** | On new turn | A newer `ConversationTurn` exists after an older one | Older turn’s full answer **collapses in place** to `PinnedInsight`. The latest turn stays fully expanded. |

Modes are mutually exclusive for the comparison. The toggle does **not** change submit/nest behavior of the composer.

---

## Interaction

### `PinnedInsight` (collapsed)

- **Headline** (from `getAnswerHeadline`)
- **`pinSummary`** underneath (if present; if missing, headline only)

### Expand (click)

- Expands **inline** to show the **first body paragraph after the `##` heading** in `summary` (plain prose; no new field). If there is no `##` / no following paragraph, expand shows `pinSummary` only (already visible when collapsed) — i.e. no extra block.
- Click again collapses.
- Does **not** navigate back to the parent thread or scroll to the full historical answer.

### Toggle

- Temporary control beside the follow-up composer (`FollowUpInput` area).
- Options: **On drill-down** | **On new turn**.
- Writes `pinTrigger` in session UI state.

---

## Components & wiring

| Piece | Role |
|-------|------|
| `PinnedInsight` | Collapsed/expanded pin card; props: `headline`, `pinSummary?`, `expandDetail?` (first post-`##` body paragraph) |
| `PinTriggerToggle` | Temporary A \| B control next to composer |
| `getAnswerHeadline(answer)` | Shared helper (`##` → auto fallback → none) |
| `DrillDownThread` | Mode A: render parent `PinnedInsight` above `Breadcrumbs` |
| `ConversationTurnCard` / turn list | Mode B: when not the latest turn, collapse answer to `PinnedInsight` |
| Research context / UI state | Hold `pinTrigger` |

Existing breadcrumbs, back navigation, clarifying phase, and export remain unchanged.

---

## Edge cases

| Case | Behavior |
|------|----------|
| No `##`, can spawn child | Auto-headline so child always has an anchor |
| Leaf with no `##` | No pin |
| Missing `pinSummary` | Headline-only pin |
| Mode flip mid-thread | Immediate re-render; expand state resets |
| Clarifying phase (no answer yet) | No pin until an answer exists |
| Export | Still uses full answer; pins are UI-only |
| Generic KPI answers | Must still get auto-headline if they can spawn drill-downs |

---

## Mock data updates

- Add `pinSummary` to primary scripted answers used in the demo path (at least `REVENUE_DIP_ANSWER` and key drill-down answers).
- Ensure demo answers that support Investigate either have a `##` heading or rely on the auto-headline fallback.
- Do **not** duplicate the headline string into a separate field.

Example shape for revenue dip:

- Headline (in `summary`): `## The Q3 revenue dip is concentrated in one segment, not a broad decline`
- `pinSummary`: short authored blurb suitable for quick reference while drilled in or after a follow-up turn

---

## Out of scope (reminder)

- Persisting toggle / per-thread `pinTrigger`
- Changing nest-vs-new-thread submit semantics
- Regenerating `pinSummary` on corrections (live seam only)
- Redesigning breadcrumbs or export

---

## Success criteria

1. In mode A, drilling into a finding shows the parent headline + `pinSummary` above breadcrumbs; expanding the pin reveals more detail inline.
2. In mode B, sending a follow-up collapses the previous turn to the same pin chrome; the new turn is fully expanded.
3. Toggle near the composer switches modes immediately on the existing thread.
4. No duplicated headline field in the data model; pin and body share the `##` source (or the same auto-fallback).
5. Any drillable answer always exposes a headline so a child is never left without an anchor.
