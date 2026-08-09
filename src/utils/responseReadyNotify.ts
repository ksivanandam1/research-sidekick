import { restoreFaviconHref, setBadgedFavicon } from './favicon';

const NOTIFICATION_TAG = 'research-response-ready';
const NOTIFICATION_TITLE = 'Research sidekick responded';
const DEFAULT_TAB_TITLE = 'Company performance';
const ALERT_TAB_TITLE = 'Sidekick responded';
const TITLE_FLASH_MS = 1000;
/** Cap flashing while the tab is already focused so the title doesn't loop forever. */
const TITLE_FLASH_MAX_TICKS_WHEN_VISIBLE = 6;
const DEFAULT_BODY_MAX = 120;

let originalFaviconHref: string | null = null;
let badgeActive = false;
let activeNotification: Notification | null = null;
let visibilityBound = false;
let titleFlashTimer: number | null = null;
let titleFlashOnAlert = false;
let titleFlashTicks = 0;

export function truncateNotificationBody(text: string, maxLen = DEFAULT_BODY_MAX): string {
  const normalized = text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
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

function setFaviconBadge(): void {
  if (!badgeActive) {
    originalFaviconHref = setBadgedFavicon();
  } else {
    setBadgedFavicon();
  }
  badgeActive = true;
}

function restoreFavicon(): void {
  if (!badgeActive) return;
  restoreFaviconHref(originalFaviconHref);
  originalFaviconHref = null;
  badgeActive = false;
}

function startTitleFlash(): void {
  if (typeof document === 'undefined') return;
  stopTitleFlash();

  titleFlashOnAlert = true;
  titleFlashTicks = 0;
  document.title = ALERT_TAB_TITLE;
  titleFlashTimer = window.setInterval(() => {
    titleFlashTicks += 1;
    titleFlashOnAlert = !titleFlashOnAlert;
    document.title = titleFlashOnAlert ? ALERT_TAB_TITLE : DEFAULT_TAB_TITLE;

    // Background tabs keep flashing until focus; focused tabs stop after a short burst.
    if (!document.hidden && titleFlashTicks >= TITLE_FLASH_MAX_TICKS_WHEN_VISIBLE) {
      stopTitleFlash();
    }
  }, TITLE_FLASH_MS);
}

function stopTitleFlash(): void {
  if (titleFlashTimer !== null) {
    window.clearInterval(titleFlashTimer);
    titleFlashTimer = null;
  }
  titleFlashOnAlert = false;
  titleFlashTicks = 0;
  if (typeof document !== 'undefined') {
    document.title = DEFAULT_TAB_TITLE;
  }
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
  stopTitleFlash();
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
  if (typeof document === 'undefined') return;

  bindVisibilityClear();
  startTitleFlash();

  // Blue tab dot only when the user is elsewhere; OS notification always fires.
  if (document.hidden) {
    setFaviconBadge();
  }

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
