import { Share2, SquarePen, X } from 'lucide-react';
import type { ChartAttachedContextItem } from '../../types';
import type { InvestigationStatusTone } from '../../utils/panelHeader';
import { ComposerContextCard } from './ContextChip';

interface PanelHeaderProps {
  subject: string;
  scopeItems: ChartAttachedContextItem[];
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
  scopeItems,
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

          {scopeItems.length > 0 && (
            <div className="-mx-0.5 mt-2 overflow-x-auto pb-0.5">
              <div className="flex w-max min-w-full gap-1.5 px-0.5">
                {scopeItems.map((item) => (
                  <ComposerContextCard
                    key={item.instanceId}
                    title={item.title}
                    timeframeLabel={item.timeframeLabel}
                    chartKind={item.chartKind}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          <span
            className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[statusTone]}`}
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
            title="Close inspector"
            aria-label="Close inspector"
            className={iconBtn}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
