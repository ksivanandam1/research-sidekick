# Browser Finish Notification — Design

## Overview

When a research answer finishes while the user is on another tab, the app should surface completion via a browser notification and a blue dot on the tab favicon. This mirrors the existing completion chime and in-panel unread badge, but for the browser chrome itself.

**Approach:** Page Notification API + canvas favicon badge (no service worker / Web Push).

**Persona:** R. Alvarez, Revenue Analyst  
**Job to be done:** Leave the dashboard tab while research runs, then get pulled back when the sidekick is done — without missing the result.

---

## Goals

1. Request notification permission at the start of an answer run (when permission is still `default`).
2. When an answer reaches `ready` and the document is hidden: show an OS notification and a blue favicon badge.
3. Clear the favicon badge as soon as the user focuses the tab again.
4. Keep the existing completion chime behavior unchanged.

---

## Non-goals

- True Web Push / service worker delivery when the tab is closed
- Notifications for revision jobs or assumption-validation quick runs
- Changing the in-app research panel unread badge (`panelUnread`)
- Persisting notification preference in app settings UI
- Custom notification icons beyond browser defaults (favicon badge is separate)

---

## User flow

```
User submits question
  → Answer job starts
  → If Notification.permission === 'default', request permission
  → Agent stages run (analysing → … → ready)
  → On ready:
      → Always: play existing completion chime
      → If document.hidden:
          → OS notification (if granted)
          → Blue favicon badge
  → User focuses tab
      → Clear favicon badge
      → Close/replace notification with same tag when practical
```

---

## Behavior details

### When to notify

- Only when `document.hidden` is true at the moment stage becomes `ready`.
- If the user is still on the tab, no OS notification and no favicon badge.

### Permission

- Call `Notification.requestPermission()` once at answer-job start if permission is `default`.
- If permission is denied or the API is unsupported: skip the OS notification; still apply the favicon badge when backgrounded.
- Do not re-prompt after an explicit deny.

### Notification copy

| Field | Value |
|-------|--------|
| Title | `Research sidekick responded` |
| Body | Truncated response text (answer summary / prose), not the user question |
| Tag | Stable tag (e.g. `research-response-ready`) so repeats replace instead of stacking |

Clicking the notification focuses the existing window/tab. Opening the research panel if closed is optional polish if cheap to wire; not required for v1.

### Favicon badge

- Draw a small blue notification dot onto a canvas-derived favicon (no new static asset required).
- Swap the document favicon when the background-ready path fires.
- On `visibilitychange` → visible: restore the previous favicon immediately.

### Chime

- Keep `playResponseReadySound()` on `ready` as today, regardless of tab visibility.

---

## Architecture

### New module: `src/utils/responseReadyNotify.ts`

Owns browser-chrome side effects:

- `ensureNotificationPermission()` — no-op unless `permission === 'default'`
- `notifyResponseReady({ body: string })` — if hidden: show Notification (when allowed) + set favicon badge
- `clearResponseReadyIndicators()` — restore favicon; close tagged notification when possible
- Visibility listener registration (once) so focus clears the badge

Truncation of body text lives here (sensible character limit for OS notification bodies).

### Wiring: `src/hooks/useAgentRun.ts`

- At the start of `runAnswerJob`, call `ensureNotificationPermission()`.
- On `ready`, after the chime, call `notifyResponseReady` with truncated answer text.

Pass `responseBody: string` into `runAnswerJob` from `startDiagnosisJob` (plain-text answer summary already known when the job starts). The util truncates for the notification body. Do not read React state from the util.

### Out of scope for this util

- No reducer / `ResearchState` fields for badge visibility
- No changes to `panelUnread` semantics

---

## Error handling

- Missing `Notification` global: treat as unsupported; badge-only path still works.
- Permission request rejected/denied: silent; continue run.
- Favicon `<link>` missing: create/update a `link[rel="icon"]` as needed for badge swap.
- Cancelled runs: do not notify if the job aborts before `ready`.

---

## Testing (manual)

1. Allow notifications → start a question → switch tabs before ready → see OS notification + blue tab dot → focus tab → dot clears.
2. Deny notifications → same flow → no OS notification, still see blue tab dot, clears on focus.
3. Stay on the tab through ready → no OS notification, no favicon badge; chime still plays.
4. Rapid sequential answers while backgrounded → notification replaces via tag rather than stacking endlessly.
}