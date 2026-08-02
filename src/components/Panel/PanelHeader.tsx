import { Share2, Sparkles, X } from 'lucide-react';
import { ContextTray } from './ContextTray';

interface PanelHeaderProps {
  onClose: () => void;
  onShare: () => void;
  shareDisabled: boolean;
}

export function PanelHeader({ onClose, onShare, shareDisabled }: PanelHeaderProps) {
  return (
    <div className="border-b border-border px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-surface">
            <Sparkles size={14} />
          </div>
          <p className="text-sm font-semibold text-ink">Research panel</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onShare}
            disabled={shareDisabled}
            title="Review & share"
            className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-surface-soft disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close panel"
            className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-surface-soft"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <ContextTray />
      </div>
    </div>
  );
}
