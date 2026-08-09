# Browser Finish Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When an answer finishes while the tab is in the background, show a browser notification ("Research sidekick responded" + truncated response) and a blue favicon badge that clears on focus.

**Architecture:** A pure browser util (`responseReadyNotify.ts`) owns permission, Notification API, favicon canvas badge, and visibility cleanup. `useAgentRun` requests permission at answer-job start and calls notify on `ready`. `startDiagnosisJob` passes `answer.summary` as `responseBody`.

**Tech Stack:** React 19, TypeScript, Vite, browser Notification API, canvas favicon (no service worker).

## Global Constraints

- Notify only when `document.hidden` is true at `ready`
- Notification title must be exactly `Research sidekick responded`
- Body is truncated response text (`answer.summary`), not the question
- Permission requested at answer-job start only if `Notification.permission === 'default'`
- Clear favicon badge when tab becomes visible
- Keep existing `playResponseReadySound()` behavior
- No Web Push / service worker
- No notifications for revision or assumption-validation jobs
- No reducer / `panelUnread` changes

## File Structure

| File | Responsibility |
|------|----------------|
| Create: `src/utils/responseReadyNotify.ts` | Permission, OS notification, favicon badge, visibility clear |
| Modify: `src/hooks/useAgentRun.ts` | Call ensure + notify around answer job |
| Modify: `src/state/ResearchContext.tsx` | Pass `responseBody: answer.summary` into `runAnswerJob` |

---

### Task 1: `responseReadyNotify` util

**Files:**
- Create: `src/utils/responseReadyNotify.ts`
- Modify: none yet

**Interfaces:**
- Consumes: browser `Notification`, `document.hidden`, canvas, favicon `<link>`
- Produces:
  - `ensureNotificationPermission(): Promise<void>`
  - `notifyResponseReady(args: { body: string }): void`
  - `clearResponseReadyIndicators(): void`
  - `truncateNotificationBody(text: string, maxLen?: number): string` (exported for clarity / reuse)

- [ ] **Step 1: Create `src/utils/responseReadyNotify.ts` with the full module**

```ts
const NOTIFICATION_TAG = 'research-response-ready';
const NOTIFICATION_TITLE = 'Research sidekick responded';
const DEFAULT_BODY_MAX = 120;

let originalFaviconHref: string | null = null;
let badgeActive = false;
let activeNotification: Notification | null = null;
let visibilityBound = false;

export function truncateNotificationBody(text: string, maxLen = DEFAULT_BODY_MAX): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function ensureNotificationPermission(): Promise<void> {
  if (!notificationsSupported()) return;
  if (Notification.permission !== 'default') return;
  try {
    await Notification.requestPermission();
  } catch {
    // Ignore — badge path still works without permission.
  }
}

function ensureFaviconLink(): HTMLLinkElement {
  const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (existing) return existing;
  const link = document.createElement('link');
  link.rel = 'icon';
  document.head.appendChild(link);
  return link;
}

function buildBadgedFaviconDataUrl(): string {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Neutral base so the tab always has a visible icon even without a prior favicon.
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.roundRect(2, 2, size - 4, size - 4, 6);
  ctx.fill();

  // Blue notification dot (top-right).
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(size - 7, 7, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

function setFaviconBadge(): void {
  const link = ensureFaviconLink();
  if (!badgeActive) {
    originalFaviconHref = link.href || link.getAttribute('href');
  }
  const dataUrl = buildBadgedFaviconDataUrl();
  if (!dataUrl) return;
  link.href = dataUrl;
  badgeActive = true;
}

function restoreFavicon(): void {
  if (!badgeActive) return;
  const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (link) {
    if (originalFaviconHref) {
      link.href = originalFaviconHref;
    } else {
      link.remove();
    }
  }
  originalFaviconHref = null;
  badgeActive = false;
}

function bindVisibilityClear(): void {
  if (visibilityBound || typeof document === 'undefined') return;
  visibilityBound = true;
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      clearResponseReadyIndicators();
    }
  });
}

export function clearResponseReadyIndicators(): void {
  restoreFavicon();
  if (activeNotification) {
    try {
      activeNotification.close();
    } catch {
      // ignore
    }
    activeNotification = null;
  }
}

export function notifyResponseReady(args: { body: string }): void {
  if (typeof document === 'undefined' || !document.hidden) return;

  bindVisibilityClear();
  setFaviconBadge();

  if (!notificationsSupported() || Notification.permission !== 'granted') return;

  const body = truncateNotificationBody(args.body);
  try {
    if (activeNotification) {
      try {
        activeNotification.close();
      } catch {
        // ignore
      }
    }
    const notification = new Notification(NOTIFICATION_TITLE, {
      body,
      tag: NOTIFICATION_TAG,
    });
    activeNotification = notification;
    notification.onclick = () => {
      window.focus();
      clearResponseReadyIndicators();
      notification.close();
    };
  } catch {
    // Badge already set; OS notification is best-effort.
  }
}
```

- [ ] **Step 2: Typecheck the new util**

Run: `npx tsc -b --pretty false 2>&1 | head -40`  
Expected: no errors referencing `responseReadyNotify.ts` (project may have unrelated pre-existing errors — only fix issues introduced by this file).

- [ ] **Step 3: Commit**

```bash
git add src/utils/responseReadyNotify.ts
git commit -m "$(cat <<'EOF'
feat: add response-ready browser notify util

EOF
)"
```

---

### Task 2: Wire into agent run + diagnosis job

**Files:**
- Modify: `src/hooks/useAgentRun.ts`
- Modify: `src/state/ResearchContext.tsx` (`startDiagnosisJob`)

**Interfaces:**
- Consumes: `ensureNotificationPermission`, `notifyResponseReady` from Task 1
- Produces: `RunAnswerJobArgs` gains `responseBody: string`

- [ ] **Step 1: Extend `RunAnswerJobArgs` and call notify APIs in `useAgentRun.ts`**

Update imports and interface:

```ts
import { playResponseReadySound } from '../utils/responseReadySound';
import {
  ensureNotificationPermission,
  notifyResponseReady,
} from '../utils/responseReadyNotify';
```

```ts
export interface RunAnswerJobArgs {
  evidenceFindingIds: string[];
  otherFindingIds: string[];
  responseBody: string;
  onStage: (stage: Stage) => void;
  onFindingsRevealed: (findingIds: string[]) => void;
}
```

At the top of `runAnswerJob`, after resetting `cancelledRef`:

```ts
void ensureNotificationPermission();
```

Destructure `responseBody` with the other args. On `ready`:

```ts
onStage('ready');
playResponseReadySound();
notifyResponseReady({ body: responseBody });
```

Do **not** add notify calls to `runRevisionJob` or `runAssumptionValidationJob`.

- [ ] **Step 2: Pass `responseBody` from `startDiagnosisJob` in `ResearchContext.tsx`**

```ts
runAnswerJob({
  evidenceFindingIds: evidenceIds,
  otherFindingIds: otherIds,
  responseBody: answer.summary,
  onStage: (stage) => dispatch({ type: 'SET_TURN_STAGE', turnId, stage }),
  onFindingsRevealed: (ids) => dispatch({ type: 'REVEAL_FINDINGS', turnId, findingIds: ids }),
});
```

- [ ] **Step 3: Typecheck / lint touched files**

Run: `npx tsc -b --pretty false 2>&1 | head -40`  
Run: `npm run lint`  
Expected: clean for changed files; fix any new errors introduced by this wiring.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAgentRun.ts src/state/ResearchContext.tsx
git commit -m "$(cat <<'EOF'
feat: notify when answer finishes in background tab

EOF
)"
```

---

### Task 3: Manual verification

**Files:** none

- [ ] **Step 1: Run the app**

Run: `npm run dev`  
Open the app, allow notifications when prompted (or on first answer submit).

- [ ] **Step 2: Background-tab happy path**

1. Start a research question that runs the full diagnosis job.  
2. When the permission prompt appears (first time), choose Allow.  
3. Switch to another tab before the answer reaches ready.  
4. Confirm: OS notification titled `Research sidekick responded` with truncated summary body; tab shows a blue favicon dot.  
5. Focus the research tab → blue dot clears; notification closes if still open.

- [ ] **Step 3: Foreground + denied paths**

1. Stay on the tab through ready → no OS notification, no favicon badge; chime still plays.  
2. (Optional) In site settings, block notifications, rerun background path → badge still appears, no OS notification.

- [ ] **Step 4: No further commit unless fixes were needed**

If bugs found, fix in the relevant file and commit with a focused message (e.g. `fix: clear favicon badge on tab focus`).
`}