import type { SourceType } from '../../types';

const SIZE = 16;

/** Platform app icons used in citation chips and hover cards. */
export function SourceIcon({ type, size = SIZE }: { type: SourceType; size?: number }) {
  switch (type) {
    case 'xero':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect width="16" height="16" rx="3.5" fill="#13B5EA" />
          <path
            d="M4.2 4.2 6.85 8 4.2 11.8h2.05L8 9.15l1.75 2.65H11.8L9.15 8 11.8 4.2h-2.05L8 6.85 6.25 4.2H4.2Z"
            fill="#fff"
          />
        </svg>
      );
    case 'tableau':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect width="16" height="16" rx="3.5" fill="#E97627" />
          <path
            fill="#fff"
            d="M7.25 2.5h1.5v2.25H11.5v1.5H8.75V8.5h2.75v1.5H8.75v2.5h-1.5v-2.5H4.5V8.5h2.75V6.25H4.5v-1.5h2.75V2.5Z"
          />
        </svg>
      );
    case 'chat':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect width="16" height="16" rx="3.5" fill="#4A154B" />
          <circle cx="5.2" cy="8" r="1.35" fill="#E01E5A" />
          <circle cx="8" cy="5.2" r="1.35" fill="#36C5F0" />
          <circle cx="10.8" cy="8" r="1.35" fill="#2EB67D" />
          <circle cx="8" cy="10.8" r="1.35" fill="#ECB22E" />
        </svg>
      );
    case 'product':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect width="16" height="16" rx="3.5" fill="#6D8FFE" />
          <path
            d="M4.5 10.5 8 4.5l3.5 6H4.5Z"
            stroke="#fff"
            strokeWidth="1.2"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect width="16" height="16" rx="3.5" fill="#A29A89" />
          <path
            d="M5 4.5h6v1.25H8.75V11.5H7.25V5.75H5V4.5Z"
            fill="#fff"
          />
        </svg>
      );
  }
}

export const SOURCE_PLATFORM: Record<SourceType, string> = {
  xero: 'Xero',
  tableau: 'Tableau',
  chat: 'Slack',
  doc: 'Document',
  product: 'Product',
};

/** Xero/Tableau excerpt text duplicates the cited claim — hide it on citation cards. */
export function hidesExcerptSummary(type: SourceType): boolean {
  return type === 'xero' || type === 'tableau';
}
