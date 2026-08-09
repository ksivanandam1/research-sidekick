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
    originalFaviconHref = link.getAttribute('href');
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
