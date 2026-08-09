const FAVICON_SIZE = 32;

function ensureFaviconLink(): HTMLLinkElement {
  const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (existing) return existing;
  const link = document.createElement('link');
  link.rel = 'icon';
  document.head.appendChild(link);
  return link;
}

/** Serif "K" on a white rounded square; optional blue notification badge. */
export function buildFaviconDataUrl(options?: { badged?: boolean }): string {
  const size = FAVICON_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const inset = 1;
  const radius = 7;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(inset, inset, size - inset * 2, size - inset * 2, radius);
  ctx.fill();

  // Hairline so the white tile reads on light browser chrome.
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#111827';
  ctx.font = `600 ${Math.round(size * 0.62)}px Georgia, 'Times New Roman', Times, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Slight optical nudge — serif capitals sit high with middle baseline.
  ctx.fillText('K', size / 2, size / 2 + 1);

  if (options?.badged) {
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(size - 7, 7, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}

/** Install the default K favicon (no badge). */
export function installAppFavicon(): void {
  if (typeof document === 'undefined') return;
  const dataUrl = buildFaviconDataUrl();
  if (!dataUrl) return;
  ensureFaviconLink().href = dataUrl;
}

export function setBadgedFavicon(): string | null {
  const link = ensureFaviconLink();
  const previousHref = link.getAttribute('href');
  const dataUrl = buildFaviconDataUrl({ badged: true });
  if (!dataUrl) return previousHref;
  link.href = dataUrl;
  return previousHref;
}

export function restoreFaviconHref(href: string | null): void {
  const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) return;
  if (href) {
    link.href = href;
    return;
  }
  const dataUrl = buildFaviconDataUrl();
  if (dataUrl) link.href = dataUrl;
}
