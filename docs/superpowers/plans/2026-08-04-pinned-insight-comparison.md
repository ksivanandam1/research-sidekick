# Pinned Insight Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared `PinnedInsight` card and a temporary composer toggle so users can compare pin-on-drill-down vs pin-on-new-turn without losing the prior agent headline.

**Architecture:** Parse the pin headline from the existing `##` in `Answer.summary` (no duplicated headline field). Add optional authored `pinSummary` on answers. Session `pinTrigger` (`'drilldown' | 'newTurn'`) gates placement: mode A shows the parent pin above drill-down breadcrumbs; mode B collapses older turns to the same pin chrome. Click expands the first post-`##` body paragraph inline.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, lucide-react. Verification via `npm run build` and `npm run lint` (no unit-test runner in repo).

## Global Constraints

- No separate `headline` field — pin title comes from `##` in `summary` or thin auto-fallback
- `pinSummary` is authored mock copy only (never auto-truncated body)
- Any answer that can spawn a child must expose a headline (`##` or auto)
- Click expands inline; does not navigate back
- Toggle is temporary, session-global, default `'drilldown'`
- Toggle does not change nest-vs-new-thread submit behavior
- Export / breadcrumbs semantics unchanged

## File structure

| File | Responsibility |
|---|---|
| `src/types.ts` | Add `pinSummary?` on `Answer`; export `PinTrigger` type |
| `src/utils/answerPin.ts` | `getAnswerHeadline`, `getPinExpandDetail`, `answerCanSpawnChild` |
| `src/data/mockData.ts` | Authored `pinSummary` on demo answers |
| `src/state/researchReducer.ts` | `pinTrigger` on `SessionState` + `SET_PIN_TRIGGER` |
| `src/state/ResearchContext.tsx` | Expose `pinTrigger` + `setPinTrigger` |
| `src/components/Panel/PinnedInsight.tsx` | Collapsed/expanded pin card |
| `src/components/Panel/PinTriggerToggle.tsx` | Temporary A \| B control |
| `src/components/Panel/FollowUpInput.tsx` | Mount toggle above composer |
| `src/components/Panel/DrillDownThread.tsx` | Mode A: parent pin above breadcrumbs |
| `src/components/Panel/ConversationTurnCard.tsx` | Mode B: collapse non-latest turns; pass `parentAnswer` |
| `src/components/Panel/ChatPanel.tsx` | Pass `isLatest` into turn cards |

---

### Task 1: Types + pin helpers

**Files:**
- Modify: `src/types.ts`
- Create: `src/utils/answerPin.ts`

**Interfaces:**
- Produces: `PinTrigger = 'drilldown' | 'newTurn'`
- Produces: `Answer.pinSummary?: string`
- Produces: `getAnswerHeadline(answer: Answer): string | null`
- Produces: `getPinExpandDetail(answer: Answer): string | null`
- Produces: `answerCanSpawnChild(answer: Answer): boolean`

- [ ] **Step 1: Extend types**

In `src/types.ts`, add:

```ts
export type PinTrigger = 'drilldown' | 'newTurn';
```

On `Answer`, add:

```ts
export interface Answer {
  summary: string;
  /** Dedicated short blurb for the pin UI — authored, not derived from body. */
  pinSummary?: string;
  findings: Finding[];
  nextCheck?: string;
  confidence?: Confidence;
  chart?: AnswerChart;
}
```

- [ ] **Step 2: Create helpers in `src/utils/answerPin.ts`**

```ts
import type { Answer } from '../types';

/** True when any finding offers an investigate path. */
export function answerCanSpawnChild(answer: Answer): boolean {
  return answer.findings.some((f) => !!f.investigateQuestion);
}

/**
 * Pin title: first `## ` heading in summary, else thin auto-headline when
 * the answer can spawn a child, else null (leaf / nothing to pin).
 */
export function getAnswerHeadline(answer: Answer): string | null {
  const heading = answer.summary.match(/^##\s+(.+)$/m);
  if (heading?.[1]) return heading[1].trim();

  if (answerCanSpawnChild(answer)) {
    const plain = answer.summary
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\[\d+\]/g, '')
      .replace(/^>>>\s+/gm, '')
      .trim();
    const first = plain.split(/(?<=\.)\s+/)[0] ?? plain;
    const line = first.split('\n')[0]?.trim() ?? '';
    if (!line) return null;
    return line.length > 100 ? `${line.slice(0, 99)}…` : line;
  }

  return null;
}

/** First body paragraph after the `##` heading; null if none. */
export function getPinExpandDetail(answer: Answer): string | null {
  const blocks = answer.summary.split(/\n\n+/);
  const headingIdx = blocks.findIndex((b) => b.trim().startsWith('## '));
  if (headingIdx < 0) return null;
  for (let i = headingIdx + 1; i < blocks.length; i += 1) {
    const t = blocks[i].trim();
    if (!t || t.startsWith('#') || t.startsWith('>>>')) continue;
    return t.replace(/\*\*/g, '').replace(/\[\d+\]/g, '').trim();
  }
  return null;
}
```

- [ ] **Step 3: Verify TypeScript compiles for new files**

Run: `npx tsc -b --pretty false`
Expected: no errors from `answerPin.ts` / `types.ts` (pre-existing project errors unrelated to this task are out of scope only if unrelated files fail; fix any introduced by this task).

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/utils/answerPin.ts
git commit -m "feat: add pinSummary type and answer pin helpers"
```

---

### Task 2: Mock `pinSummary` copy

**Files:**
- Modify: `src/data/mockData.ts`

**Interfaces:**
- Consumes: `Answer.pinSummary?: string`
- Produces: authored `pinSummary` on `REVENUE_DIP_ANSWER`, `CHURN_SOLO_ANSWER`, `REVENUE_CHURN_COMBINED_ANSWER`, `PRO_OUTBOUND_DRILLDOWN_ANSWER`, `PRO_VOLUME_DRILLDOWN_ANSWER`, `CHURN_SMB_DRILLDOWN_ANSWER`

- [ ] **Step 1: Add `pinSummary` to demo answers**

Use short, quotable blurbs (1–2 sentences). Examples:

```ts
// REVENUE_DIP_ANSWER
pinSummary:
  'Q3 missed forecast by 12%, but the drop is outbound Pro — not a broad decline across tiers.',

// CHURN_SOLO_ANSWER
pinSummary:
  'Churn rose mainly in APAC enterprise; budget/approval friction, not product dissatisfaction.',

// REVENUE_CHURN_COMBINED_ANSWER
pinSummary:
  'Revenue miss is Pro outbound volume; churn is a secondary watch item, not the main driver.',

// PRO_OUTBOUND_DRILLDOWN_ANSWER
pinSummary:
  'Outbound Pro miss is conversion-and-coverage on new logos — self-serve Pro held flat.',

// PRO_VOLUME_DRILLDOWN_ANSWER
pinSummary:
  'Volume problem: closed-won count down sharply while ACV and discounts stay stable.',

// CHURN_SMB_DRILLDOWN_ANSWER
pinSummary:
  'SMB churn is flat — the Q3 rise is concentrated in Enterprise accounts.',
```

Do **not** add a separate `headline` field. Keep existing `##` lines in summaries as-is.

- [ ] **Step 2: Commit**

```bash
git add src/data/mockData.ts
git commit -m "feat: author pinSummary blurbs on demo answers"
```

---

### Task 3: Session `pinTrigger` state

**Files:**
- Modify: `src/state/researchReducer.ts`
- Modify: `src/state/ResearchContext.tsx`

**Interfaces:**
- Produces: `SessionState.pinTrigger: PinTrigger` (default `'drilldown'`)
- Produces: action `{ type: 'SET_PIN_TRIGGER'; pinTrigger: PinTrigger }`
- Produces: context `pinTrigger: PinTrigger`, `setPinTrigger: (pinTrigger: PinTrigger) => void`

- [ ] **Step 1: Add to reducer**

```ts
import type { ..., PinTrigger } from '../types';

export interface SessionState {
  // ...existing
  pinTrigger: PinTrigger;
}

export const initialSessionState: SessionState = {
  // ...existing
  pinTrigger: 'drilldown',
};

// Add to SessionAction union:
| { type: 'SET_PIN_TRIGGER'; pinTrigger: PinTrigger }

// In reducer switch:
case 'SET_PIN_TRIGGER':
  return { ...state, pinTrigger: action.pinTrigger };
```

- [ ] **Step 2: Expose on context**

Add to `ResearchContextValue`:

```ts
pinTrigger: PinTrigger;
setPinTrigger: (pinTrigger: PinTrigger) => void;
```

Wire:

```ts
const setPinTrigger = useCallback(
  (pinTrigger: PinTrigger) => dispatch({ type: 'SET_PIN_TRIGGER', pinTrigger }),
  [],
);
```

Include `pinTrigger: state.pinTrigger` and `setPinTrigger` in the provider value + dependency arrays. Import `PinTrigger` from `../types`.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: success

- [ ] **Step 4: Commit**

```bash
git add src/state/researchReducer.ts src/state/ResearchContext.tsx
git commit -m "feat: add session pinTrigger for pin placement comparison"
```

---

### Task 4: `PinnedInsight` + `PinTriggerToggle`

**Files:**
- Create: `src/components/Panel/PinnedInsight.tsx`
- Create: `src/components/Panel/PinTriggerToggle.tsx`
- Modify: `src/components/Panel/FollowUpInput.tsx`

**Interfaces:**
- Consumes: `pinTrigger`, `setPinTrigger` from context
- Produces: `<PinnedInsight headline pinSummary? expandDetail? />`
- Produces: `<PinTriggerToggle />`

- [ ] **Step 1: Create `PinnedInsight.tsx`**

```tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, Pin } from 'lucide-react';

interface PinnedInsightProps {
  headline: string;
  pinSummary?: string;
  expandDetail?: string | null;
}

export function PinnedInsight({ headline, pinSummary, expandDetail }: PinnedInsightProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !!(expandDetail && expandDetail.trim());

  return (
    <div className="rounded-xl border border-border-soft bg-surface-soft">
      <button
        type="button"
        onClick={() => canExpand && setExpanded((e) => !e)}
        disabled={!canExpand}
        className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface disabled:hover:bg-transparent"
      >
        <Pin size={12} className="mt-1 shrink-0 text-ink-faint" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-ink">{headline}</p>
          {pinSummary ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{pinSummary}</p>
          ) : null}
          {expanded && expandDetail ? (
            <p className="mt-2 border-t border-border-soft pt-2 text-xs leading-relaxed text-ink-soft">
              {expandDetail}
            </p>
          ) : null}
        </div>
        {canExpand ? (
          expanded ? (
            <ChevronUp size={14} className="mt-0.5 shrink-0 text-ink-faint" />
          ) : (
            <ChevronDown size={14} className="mt-0.5 shrink-0 text-ink-faint" />
          )
        ) : null}
      </button>
    </div>
  );
}
```

Use `key={headline + (pinSummary ?? '')}` at call sites when `pinTrigger` flips so expand state resets (parent remount), or reset via `key={pinTrigger}` on the card from parents.

- [ ] **Step 2: Create `PinTriggerToggle.tsx`**

```tsx
import type { PinTrigger } from '../../types';
import { useResearch } from '../../state/ResearchContext';

const OPTIONS: { id: PinTrigger; label: string }[] = [
  { id: 'drilldown', label: 'On drill-down' },
  { id: 'newTurn', label: 'On new turn' },
];

export function PinTriggerToggle() {
  const { pinTrigger, setPinTrigger } = useResearch();

  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Pin
      </span>
      <div className="inline-flex rounded-full border border-border-soft bg-surface-soft p-0.5">
        {OPTIONS.map((opt) => {
          const active = pinTrigger === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPinTrigger(opt.id)}
              className={
                active
                  ? 'rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-surface'
                  : 'rounded-full px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:text-ink'
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Mount toggle in `FollowUpInput`**

Above `SuggestedQuestions` (still inside the composer footer):

```tsx
import { PinTriggerToggle } from './PinTriggerToggle';
// ...
<div className="border-t border-border bg-surface px-5 py-3">
  <PinTriggerToggle />
  <SuggestedQuestions onSelect={(q) => handleSubmit(q)} />
  {/* existing form */}
</div>
```

- [ ] **Step 4: Build + lint**

Run: `npm run build && npm run lint`
Expected: success

- [ ] **Step 5: Commit**

```bash
git add src/components/Panel/PinnedInsight.tsx src/components/Panel/PinTriggerToggle.tsx src/components/Panel/FollowUpInput.tsx
git commit -m "feat: add PinnedInsight card and composer pin toggle"
```

---

### Task 5: Mode A — pin on drill-down

**Files:**
- Modify: `src/components/Panel/DrillDownThread.tsx`
- Modify: `src/components/Panel/ConversationTurnCard.tsx`

**Interfaces:**
- Consumes: `pinTrigger`, `getAnswerHeadline`, `getPinExpandDetail`, `PinnedInsight`
- Produces: `parentAnswer?: Answer` prop on `DrillDownThread`

- [ ] **Step 1: Pass `parentAnswer` through the drill-down tree**

In `ConversationTurnCard`, when rendering `DrillDownThread`:

```tsx
<DrillDownThread
  turnId={turn.id}
  node={rootDrillDown}
  path={[rootDrillDown.id]}
  activePath={turn.activePath}
  trail={[turn.question]}
  parentAnswer={turn.answer}
  showMetricTags={showMetricTags}
/>
```

In `DrillDownThread`, add prop `parentAnswer?: Answer`. When recursing into `activeChild`:

```tsx
<DrillDownThread
  turnId={turnId}
  node={activeChild}
  path={[...path, activeChild.id]}
  activePath={activePath}
  trail={[...trail, node.question]}
  parentAnswer={node.answer}
  showMetricTags={showMetricTags}
/>
```

- [ ] **Step 2: Render pin above breadcrumbs when `pinTrigger === 'drilldown'`**

```tsx
const { ..., pinTrigger } = useResearch();
const parentHeadline = parentAnswer ? getAnswerHeadline(parentAnswer) : null;

// Inside the active leaf return, above <Breadcrumbs>:
{pinTrigger === 'drilldown' && parentHeadline && parentAnswer && (
  <PinnedInsight
    key={`pin-a-${pinTrigger}-${parentHeadline}`}
    headline={parentHeadline}
    pinSummary={parentAnswer.pinSummary}
    expandDetail={getPinExpandDetail(parentAnswer)}
  />
)}
```

Import helpers from `../../utils/answerPin` and `PinnedInsight` from `./PinnedInsight`. Import `Answer` type if needed.

- [ ] **Step 3: Manual check + build**

Run: `npm run build`
Manual: open panel → run revenue diagnosis → Investigate an open question → with toggle on **On drill-down**, confirm parent headline + `pinSummary` appear above breadcrumbs; click expands first body paragraph; flip toggle to **On new turn** and confirm the drill-down pin disappears.

- [ ] **Step 4: Commit**

```bash
git add src/components/Panel/DrillDownThread.tsx src/components/Panel/ConversationTurnCard.tsx
git commit -m "feat: pin parent insight above drill-down breadcrumbs"
```

---

### Task 6: Mode B — pin on new turn

**Files:**
- Modify: `src/components/Panel/ChatPanel.tsx`
- Modify: `src/components/Panel/ConversationTurnCard.tsx`

**Interfaces:**
- Consumes: `pinTrigger`, `getAnswerHeadline`, `getPinExpandDetail`, `PinnedInsight`
- Produces: `isLatest: boolean` prop on `ConversationTurnCard`

- [ ] **Step 1: Pass `isLatest` from `ChatPanel`**

```tsx
{turns.map((turn, index) => (
  <ConversationTurnCard
    key={turn.id}
    turn={turn}
    isLatest={index === turns.length - 1}
  />
))}
```

- [ ] **Step 2: Collapse non-latest turns when `pinTrigger === 'newTurn'`**

In `ConversationTurnCard`:

```tsx
export function ConversationTurnCard({
  turn,
  isLatest,
}: {
  turn: ConversationTurn;
  isLatest: boolean;
}) {
  const { ..., pinTrigger } = useResearch();
  const collapseToPin = pinTrigger === 'newTurn' && !isLatest && !!turn.answer;
  const pinHeadline = turn.answer ? getAnswerHeadline(turn.answer) : null;

  // After UserBubble / context note, when collapseToPin && pinHeadline:
  if (collapseToPin && pinHeadline && turn.answer) {
    return (
      <div className="flex flex-col gap-3 border-b border-border-soft pb-5 last:border-b-0 last:pb-0">
        <UserBubble text={turn.question} />
        <PinnedInsight
          key={`pin-b-${pinTrigger}-${turn.id}`}
          headline={pinHeadline}
          pinSummary={turn.answer.pinSummary}
          expandDetail={getPinExpandDetail(turn.answer)}
        />
      </div>
    );
  }

  // else existing full render (including drill-down when active)
}
```

When `collapseToPin` but `pinHeadline` is null (should be rare for demo answers), fall through to full render so content is not lost.

- [ ] **Step 3: Build + lint + manual check**

Run: `npm run build && npm run lint`

Manual:
1. Toggle **On new turn** → complete one answer → submit a second question → prior turn shows pin only; latest is full.
2. Expand pin → first post-`##` paragraph appears.
3. Toggle **On drill-down** → prior turns expand again; drill-down pin works as in Task 5.

- [ ] **Step 4: Commit**

```bash
git add src/components/Panel/ChatPanel.tsx src/components/Panel/ConversationTurnCard.tsx
git commit -m "feat: collapse prior turns to pinned insight on new-turn mode"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| `pinSummary` on Answer, no separate headline | 1, 2 |
| `getAnswerHeadline` / `##` + auto fallback for drillable | 1 |
| Expand = first post-`##` body paragraph | 1, 4 |
| `pinTrigger` session state, default drilldown | 3 |
| Temporary toggle near composer | 4 |
| Mode A: pin above breadcrumbs | 5 |
| Mode B: collapse older turns | 6 |
| Inline expand, no navigate-back | 4 |
| Export / breadcrumbs unchanged | — (no edits) |
| Future seam note for pinSummary regen | design doc only |
