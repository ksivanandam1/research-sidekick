import { ChevronDown, Menu, Share2, SquarePen, X } from 'lucide-react';

interface PanelHeaderProps {
  onClose: () => void;
  onShare: () => void;
  onNewChat: () => void;
  shareDisabled: boolean;
}

const iconBtn =
  'flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink';

export function PanelHeader({ onClose, onShare, onNewChat, shareDisabled }: PanelHeaderProps) {
  return (
    <div className="border-b border-border px-3 py-2.5">
      <div className="flex items-center gap-1">
        <button type="button" title="Menu" aria-label="Menu" className={iconBtn}>
          <Menu size={18} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          title="Ask Sidekick"
          className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
        >
          Ask Sidekick
          <ChevronDown size={14} strokeWidth={2} className="text-ink-faint" />
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={onNewChat}
            title="New chat"
            aria-label="New chat"
            className={iconBtn}
          >
            <SquarePen size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={shareDisabled}
            title="Review & share"
            aria-label="Share"
            className={`${iconBtn} disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-soft`}
          >
            <Share2 size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close panel"
            aria-label="Close panel"
            className={iconBtn}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
