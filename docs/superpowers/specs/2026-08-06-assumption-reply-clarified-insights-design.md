# Assumption Reply → Clarified Insights — Design

## Overview

Assumptions currently offer **Investigate**, which opens a nested drill-down thread. That path does not match the research analyst’s primary job: clarify an assumption in chat context, then get an updated insight.

**Investigate is removed.** Assumptions get a primary **Reply** CTA that attaches the assumption to the composer. After the user sends a clarifying query, the agent posts a new response that rewrites insights from that clarification, and the **previous** response’s confidence badge switches to **Archived** so the prior answer is clearly superseded.

**Persona:** R. Alvarez, Revenue Analyst  
**Job to be done:** Challenge or clarify an assumption without leaving the chat composer, then trust that the latest answer is the accurate one.

---

## Goals

1. Replace Investigate with Reply on assumption findings.
2. Reply adds the assumption to chat context (composer chip) and focuses the input.
3. A clarifying user query with that assumption attached produces a new agent turn that rewrites insights based on the clarification.
4. Mark the prior response as **Archived** (via the confidence badge slot) so the user knows it is no longer the authoritative read.
5. Remove Investigate / nested assumption drill-down UX from the product path.

---

## Non-goals

- Live LLM routing (prototype uses mock resolution keyed off attached assumption + user text)
- Archiving multiple historical turns in a chain beyond the immediate parent
- Keeping Investigate as a secondary action
- Changing chart-attach context behavior (except sharing the composer strip with assumption chips)
- Fully deleting every drill-down type/reducer seam in one pass if still used by pin A/B experiments — product path for assumptions must not call Investigate; dead UI and assumption-specific wiring are removed

---

## User flow

```
Assumption finding → Reply
  → Assumption chip appears in composer context
  → User types clarification and sends
  → New chat turn (user bubble + agent thinking → answer)
  → Agent copy: insights rewritten from the clarification
  → Parent turn confidence badge → Archived
  → Clarified assumption updated in the new answer’s findings (evidence / revised note as appropriate)
```

---

## UI

### Reply CTA (`FindingItem`)

- On `kind === 'assumption'`, show **Reply** (primary CTA) instead of Investigate.
- Click: attach assumption to composer context; open panel; focus composer. Prefer the chip as feedback (no success toast).
- Optional soft prefill of the investigate-style question into the input is allowed but not required; the chip is the source of truth for “what I’m clarifying.”

### Composer context

- Extend attached context to support an **assumption** attachment (not only KPI/dimension charts).
- Chip shows a short label derived from the finding text (truncate as needed) and can be removed like other context chips.
- Cleared on submit (same as chart context today).

### New agent response

- Tone: acknowledge the clarification and state that insights were **rewritten** based on it.
- Findings / summary reflect the updated read (reuse / extend `REVISED_PRICING_FINDING`-style mocks for the demo path).
- Normal thinking stages (moon loader, etc.) still apply.

### Archived prior response

- When a clarification turn supersedes a prior answer, that prior turn’s badge (currently `ConfidenceBadge`) shows **Archived** instead of High/Medium/Low confidence.
- Visual: muted / neutral treatment so it reads as “superseded,” not as a confidence level.
- Only the **parent** response that owned the clarified assumption is archived for the demo (not every older turn).

---

## Data model

### Assumption context item

Extend composer attachments (or a parallel list merged into the strip) with fields such as:

| Field | Purpose |
|-------|---------|
| `kind: 'assumption'` | Distinguishes from chart context |
| `findingId` | Assumption being clarified |
| `sourceTurnId` | Parent turn to archive + revise against |
| `label` / `text` | Chip display |

Chart `AttachedContextItem` shape may stay for metrics; assumption items are either a discriminated union on the same list or a sibling list rendered in the same strip.

### Turn / answer status

| Field | Purpose |
|-------|---------|
| `archived?: boolean` (on turn or answer) | Drives Archived badge instead of confidence |

Set `archived: true` on the parent turn when a clarification reply completes (or when the new turn is created).

### Finding fields

- Keep `revised` / `revisedNote` for the updated finding presentation in the **new** answer.
- Remove product dependence on `investigateQuestion` for CTAs; field may be deleted or unused after Investigate removal.

---

## Behavior details

### `submitQuestion` when assumption context is attached

1. Create a normal user turn with the typed question + context snapshot (including assumption ref).
2. Resolve a mock “clarification” answer: rewritten summary + findings that incorporate the user’s clarification; mark the relevant assumption as revised evidence where the mock supports it.
3. Mark `sourceTurnId` as archived.
4. Run the usual diagnosis / reveal job for the new turn.
5. Clear attached context.

### Removal of Investigate

- Remove Reply-replacement target: delete Investigate buttons and `onInvestigate` / `startDrillDown` usage from assumption findings.
- Remove or stop rendering nested `DrillDownThread` for assumption investigate paths.
- Clean up mock `investigateQuestion` and `resolveDrillDown` usage tied to that CTA as needed so nothing dead-ends in the UI.

---

## Copy (prototype)

**Agent acknowledgment (shape):**  
Something like: “Thanks — I’ve rewritten the insights based on your clarification.” followed by the updated analysis.

**Archived badge label:** `Archived`

---

## Success criteria

1. No Investigate CTA remains on assumptions.
2. Reply attaches an assumption chip; send produces a new turn, not a toast-only outcome.
3. New answer clearly states insights were rewritten from the clarification and shows updated findings.
4. Previous response badge reads **Archived**.
5. Analyst stays in the primary chat composer flow end-to-end.
