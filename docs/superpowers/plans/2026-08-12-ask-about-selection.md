# Ask About Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users highlight text in the main answer summary, click **Ask about this**, and attach that excerpt as composer context (same card UI as charts/assumptions).

**Architecture:** Add an `excerpt` attached-context kind; wrap the latest ready answer’s `RichSummary` with a selection listener that shows a floating bubble; `attachExcerpt` keeps charts, clears assumptions, replaces prior excerpts, opens the panel, and focuses the composer.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind, existing `ResearchContext` / `ComposerContextCard` patterns.

## Global Constraints

- Selection only inside main answer `RichSummary` on the latest ready turn.
- Chip title = truncated selected text; subtitle = `From agent response`.
- Keep charts; clear assumptions; replace any existing excerpt.
- No auto-submit; no multi-excerpt stack; no portal-to-body positioning.
- No automated test suite in this repo — verify manually in the browser.

## File map

| File | Responsibility |
| --- | --- |
| `src/types.ts` | `ExcerptAttachedContextItem`, union, `isExcerptContext` |
| `src/state/ResearchContext.tsx` | `attachExcerpt` |
| `src/components/Panel/ContextChip.tsx` | `excerpt` card variant |
| `src/components/Panel/ContextTray.tsx` | Render excerpt in composer strip |
| `src/components/Panel/ConversationTurnCard.tsx` | Render excerpt on turn context row |
| `src/components/Panel/AskAboutSelection.tsx` | Selection bubble + attach |
| `src/components/Panel/AnswerSection.tsx` | Wrap summary when latest + ready |
| `src/components/Panel/FollowUpInput.tsx` | Focus composer when excerpt attaches |

---

### Task 1: Excerpt context type + attach API

**Files:**
- Modify: `src/types.ts`
- Modify: `src/state/ResearchContext.tsx`

**Interfaces:**
- Produces: `ExcerptAttachedContextItem`, `isExcerptContext`, `attachExcerpt({ text, sourceTurnId })`

- [ ] **Step 1: Extend types**

In `src/types.ts`, after `AssumptionAttachedContextItem`, add:

```ts
/** Text excerpt from an agent answer attached so the user can ask about it. */
export interface ExcerptAttachedContextItem {
  kind: 'excerpt';
  instanceId: string;
  title: string;
  subtitle: string;
  text: string;
  sourceTurnId: string;
}

export type AttachedContextItem =
  | ChartAttachedContextItem
  | AssumptionAttachedContextItem
  | ExcerptAttachedContextItem;

export function isExcerptContext(
  item: AttachedContextItem,
): item is ExcerptAttachedContextItem {
  return item.kind === 'excerpt';
}
```

Update the existing `AttachedContextItem` union and keep `isChartContext` / `isAssumptionContext` unchanged.

- [ ] **Step 2: Add `attachExcerpt` to ResearchContext**

```ts
attachExcerpt: (args: { text: string; sourceTurnId: string }) => void;
```

Implementation:

```ts
const attachExcerpt = useCallback((args: { text: string; sourceTurnId: string }) => {
  const text = args.text.trim();
  if (!text) return;
  const charts = state.attachedContext.filter(isChartContext);
  const item: ExcerptAttachedContextItem = {
    kind: 'excerpt',
    instanceId: nextId('ctx'),
    title: truncateLabel(text, 48),
    subtitle: 'From agent response',
    text,
    sourceTurnId: args.sourceTurnId,
  };
  dispatch({ type: 'SET_ATTACHED_CONTEXT', items: [...charts, item] });
  dispatch({ type: 'SET_PANEL_OPEN', open: true });
}, [state.attachedContext]);
```

Export on the context value.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts src/state/ResearchContext.tsx
git commit -m "feat: add excerpt attached-context type and attachExcerpt"
```

---

### Task 2: Composer + turn context card UI

**Files:**
- Modify: `src/components/Panel/ContextChip.tsx`
- Modify: `src/components/Panel/ContextTray.tsx`
- Modify: `src/components/Panel/ConversationTurnCard.tsx`
- Modify: `src/components/Panel/FollowUpInput.tsx`

**Interfaces:**
- Consumes: `isExcerptContext`, `ExcerptAttachedContextItem`
- Produces: `ComposerContextCard` `variant="excerpt"`

- [ ] **Step 1: Add excerpt variant to `ComposerContextCard`**

- Extend `variant?: 'chart' | 'assumption' | 'excerpt'`
- For `excerpt`, render `Quote` (lucide) icon in the white tile
- Title/subtitle wiring stays the same (`title` + `timeframeLabel` prop used as subtitle line)

- [ ] **Step 2: Render in `ComposerContextStrip`**

Branch `item.kind === 'excerpt'` → `variant="excerpt"`, `timeframeLabel={item.subtitle}`.

- [ ] **Step 3: Render in `TurnContextNote`**

Handle three kinds explicitly so chart branch never reads `item.id` / `chartKind` on excerpts:

```tsx
item.kind === 'assumption' ? (...) :
item.kind === 'excerpt' ? (
  <ComposerContextCard
    key={item.instanceId}
    title={item.title}
    timeframeLabel={item.subtitle}
    variant="excerpt"
  />
) : (
  // chart
)
```

- [ ] **Step 4: Focus composer when an excerpt is attached**

In `FollowUpInput`, extend the focus effect:

```ts
useEffect(() => {
  if (attachedContext.some(isAssumptionContext) || attachedContext.some(isExcerptContext)) {
    inputRef.current?.focus();
  }
}, [attachedContext]);
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Panel/ContextChip.tsx src/components/Panel/ContextTray.tsx src/components/Panel/ConversationTurnCard.tsx src/components/Panel/FollowUpInput.tsx
git commit -m "feat: render excerpt context chips in composer and turns"
```

---

### Task 3: Ask about selection bubble

**Files:**
- Create: `src/components/Panel/AskAboutSelection.tsx`
- Modify: `src/components/Panel/AnswerSection.tsx`

**Interfaces:**
- Consumes: `attachExcerpt`, turn id
- Produces: selection bubble UI wrapping summary children

- [ ] **Step 1: Create `AskAboutSelection`**

Props: `{ sourceTurnId: string; enabled: boolean; children: ReactNode }`

Behavior:
- `rootRef` on wrapper around children
- On `mouseup` / `selectionchange`: if `enabled` and selection is non-empty, trimmed length ≥ 3, and both anchor/focus nodes are inside `rootRef`, compute `getBoundingClientRect()` of the range relative to the wrapper (or panel), set bubble state `{ text, top, left }`
- Otherwise clear bubble
- Hide bubble on scroll of nearest scroll parent
- Render absolute-positioned button **Ask about this** above selection (~8px), clamped horizontally; if `top < 8` flip below
- Click: `attachExcerpt({ text, sourceTurnId })`, `window.getSelection()?.removeAllRanges()`, clear bubble

Minimum styles: `absolute z-20 rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-xs font-medium text-ink shadow-soft`

- [ ] **Step 2: Wire into `AnswerSection`**

When rendering `RichSummary`, wrap if `showAnswerFooter && isReady && !archived && turn`:

```tsx
<AskAboutSelection sourceTurnId={turn.id} enabled>
  <RichSummary text={summaryText} citations={citations} />
</AskAboutSelection>
```

Otherwise keep bare `RichSummary`.

- [ ] **Step 3: Manual verify**

Run: `npm run dev -- --port 5173`  
Flow: finish a Q3 diagnosis → select a sentence in the summary → bubble appears → click → excerpt chip in composer with subtitle “From agent response” → charts kept if present → assumptions cleared → send a follow-up → excerpt shows on the user turn.

- [ ] **Step 4: Commit**

```bash
git add src/components/Panel/AskAboutSelection.tsx src/components/Panel/AnswerSection.tsx
git commit -m "feat: ask-about-this bubble attaches summary excerpts to chat context"
```

---

## Spec coverage check

| Spec requirement | Task |
| --- | --- |
| Selection in main RichSummary only | Task 3 |
| Ask about this bubble | Task 3 |
| Excerpt chip same UI | Task 2 |
| Title truncated / subtitle From agent response | Task 1–2 |
| Keep charts, clear assumptions, replace excerpt | Task 1 |
| Focus composer | Task 2 |
| Turn context row shows excerpt | Task 2 |
| No auto-submit / no multi-excerpt | Task 1 |
