import { Share2, SquarePen, X } from 'lucide-react';
import type { InvestigationStatusTone } from '../../utils/panelHeader';

interface PanelHeaderProps {
  subject: string;
  scopeLabels: string[];
  statusLabel: string;
  statusTone: InvestigationStatusTone;
  onClose: () => void;
  onShare: () => void;
  onStartOver: () => void;
  shareDisabled: boolean;
}

const iconBtn =
  'flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink';

const STATUS_STYLES: Record<InvestigationStatusTone, string> = {
  neutral: 'bg-surface-soft text-ink-faint border-border-soft',
  active: 'bg-ocean-soft/70 text-ocean border-ocean/20',
  ready: 'bg-sage-soft text-sage border-sage/25',
  stopped: 'bg-terracotta-soft text-terracotta border-terracotta/25',
  clarifying: 'bg-amber-soft text-amber border-amber/25',
};

export function PanelHeader({
  subject,
  scopeLabels,
  statusLabel,
  statusTone,
  onClose,
  onShare,
  onStartOver,
  shareDisabled,
}: PanelHeaderProps) {
  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-ink">{subject}</p>
          {scopeLabels.length > 0 && (
            <p className="mt-0.5 truncate text-[11px] text-ink-faint">
              Scope: {scopeLabels.join(' · ')}
            </p>
          )}
          <span
            className={`mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[statusTone]}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onStartOver}
            title="Start over"
            aria-label="Start over"
            className={iconBtn}
          >
            <SquarePen size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={shareDisabled}
            title="Review & share"
            aria-label="Review and share"
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
