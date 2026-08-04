import {
  Activity,
  BarChart2,
  BarChart3,
  ChartNoAxesColumn,
  LineChart,
  PieChart,
  X,
} from 'lucide-react';
import type { ContextChartKind } from '../../types';

interface ContextChipProps {
  title: string;
  onRemove?: () => void;
}

/** Compact pill used on conversation turns (historical context). */
export function ContextChip({ title, onRemove }: ContextChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink">
      {title}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${title} from context`}
          className="ml-0.5 rounded-full p-0.5 text-ink-faint transition-colors hover:bg-border-soft hover:text-ink"
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}

function ChartKindIcon({ kind }: { kind: ContextChartKind }) {
  const props = { size: 14, strokeWidth: 2, className: 'text-ink' } as const;
  switch (kind) {
    case 'sparkline':
      return <Activity {...props} />;
    case 'donut':
      return <PieChart {...props} />;
    case 'barStrip':
      return <BarChart3 {...props} />;
    case 'steppedLine':
      return <LineChart {...props} />;
    case 'compareBars':
      return <BarChart2 {...props} />;
    default:
      return <ChartNoAxesColumn {...props} />;
  }
}

interface ComposerContextCardProps {
  title: string;
  timeframeLabel: string;
  chartKind: ContextChartKind;
  onRemove?: () => void;
  dimmed?: boolean;
}

/** Mockup-style chart context card for the composer and chat turns. */
export function ComposerContextCard({
  title,
  timeframeLabel,
  chartKind,
  onRemove,
  dimmed = false,
}: ComposerContextCardProps) {
  return (
    <div
      className={`relative flex shrink-0 items-center gap-2.5 rounded-xl bg-composer-chip py-2 pl-2 ${
        onRemove ? 'pr-8' : 'pr-3'
      } ${dimmed ? 'opacity-40' : ''}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
        <ChartKindIcon kind={chartKind} />
      </div>
      <div className="min-w-0 pr-1">
        <p className="truncate text-sm font-semibold leading-tight text-ink">{title}</p>
        <p className="truncate text-xs leading-tight text-composer-placeholder">{timeframeLabel}</p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${title} from context`}
          aria-label={`Remove ${title} from context`}
          className="absolute right-1.5 top-1.5 rounded-md p-0.5 text-composer-placeholder transition-colors hover:bg-white hover:text-ink"
        >
          <X size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
