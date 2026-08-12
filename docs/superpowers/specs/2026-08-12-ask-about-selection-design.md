# Ask About Selection — Design

## Overview

Users often want to dig into a specific sentence from the agent’s answer. Today they must retype or paraphrase that passage. This feature lets them highlight text in the main answer summary and attach it as chat context via an **Ask about this** bubble, using the same composer context card UI as charts and assumptions.

**Job to be done:** Point at a specific claim in the agent response and ask a follow-up without leaving the panel or retyping the excerpt.

---

## Goals

1. When the user selects text in the **main answer summary** (`RichSummary`), show an **Ask about this** bubble above the selection.
2. Clicking the bubble attaches a **text excerpt** chip to the composer context strip.
3. Excerpt chips reuse the existing composer context card chrome (same pattern as chart/assumption chips).
4. Attaching an excerpt **keeps chart** chips, **clears assumption** chips, and **replaces** any prior excerpt.
5. Focus the composer after attach so the user can type their follow-up immediately.

---

## Non-goals

- Selection outside the main answer summary (findings, next steps, thought trace, clarifying cards, etc.)
- Multiple excerpt chips at once
- Editing excerpt text after attach
- Auto-submitting a question when the bubble is clicked
- A dedicated mock diagnosis path keyed only off excerpts (v1: excerpt is context on the turn; user types the ask)
- Portal-to-`document.body` positioning (v1 stays inside the panel and clamps)

---

## User flow

```
User selects text in latest ready answer RichSummary
  → “Ask about this” bubble appears above selection
  → User clicks bubble
  → Excerpt chip added to composer (charts kept, assumptions cleared, prior excerpt replaced)
  → Selection cleared, bubble hidden, composer focused
  → User types follow-up and sends
  → New turn shows the excerpt chip on the user query context row
```

---

## Data model

Add a third `AttachedContextItem` variant:

```ts
interface ExcerptAttachedContextItem {
  kind: 'excerpt';
  instanceId: string;
  title: string;        // truncated selected text for the chip title
  subtitle: 'From agent response';
  text: string;         // full selected text
  sourceTurnId: string; // turn the excerpt came from
}
```

Helpers: `isExcerptContext(item)` alongside existing `isChartContext` / `isAssumptionContext`.

Chip copy:
- **Title:** truncated selected text (same truncation style as assumption titles)
- **Subtitle:** `From agent response`
- **Icon:** quote / text variant on `ComposerContextCard` (not chart or flag)

---

## UI

### Selection bubble

- Only active for the **latest ready** turn’s summary (`RichSummary` in `AnswerSection`).
- Show when selection is non-empty, trimmed length above a small minimum, and entirely within the summary root.
- Button label: **Ask about this**.
- Position: centered above the selection bounding box with ~8px gap; clamp inside the panel scrollport; flip below if there is no room above.
- Style: compact surface chip with border and soft shadow, consistent with panel controls.
- Hide on: cleared selection, selection leaving the summary, panel scroll, or successful click.
- `prefers-reduced-motion`: instant show/hide is fine.

### Composer / turn context

- `ComposerContextStrip` renders excerpt cards with the new variant.
- Historical turn context row (`ConversationTurnCard` / user query context) renders excerpt the same way as other attached items.
- Remove control works like other chips (`removeContext(instanceId)`).

---

## Architecture

### New / touched pieces

| Piece | Role |
| --- | --- |
| `AskAboutSelection` | Wraps summary; selection listeners, bubble position, click → attach |
| `AnswerSection` | Mount wrapper on latest ready summary only |
| `types.ts` | `ExcerptAttachedContextItem` + union + guard |
| `ResearchContext` | `attachExcerpt({ text, sourceTurnId })` |
| `ContextChip` / `ComposerContextCard` | `excerpt` variant |
| `ContextTray` / turn context row | Render excerpt chips |

### `attachExcerpt` behavior

1. Filter current `attachedContext` to chart items only.
2. Append one new excerpt item (new `instanceId`).
3. Dispatch `SET_ATTACHED_CONTEXT` with that list.
4. Open panel if closed; focus composer input.

### Submit behavior

- Excerpt is included in the turn’s `contextItems` like other attachments.
- Cleared from the composer on submit (existing attached-context clear behavior).
- No special `resolve*` path required for v1.

---

## Edge cases

- Whitespace-only or very short selections: ignore (no bubble).
- Selection that starts in summary but ends outside: hide bubble.
- Rapid selection changes: update position or hide; do not stack bubbles.
- Scrolling the chat panel: hide bubble (user can reselect).
- Archived / non-latest turns: no bubble (selection affordance only on latest ready answer).

---

## Success criteria

1. Selecting a sentence in the main answer summary shows **Ask about this** above the highlight.
2. Click adds a composer chip titled with truncated text and subtitle **From agent response**.
3. Charts remain; assumptions are removed; a second excerpt replaces the first.
4. Composer is focused so the user can ask immediately.
5. The sent turn shows the excerpt in its context strip.
