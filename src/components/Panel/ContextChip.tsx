import {
  Activity,
  BarChart2,
  BarChart3,
  ChartNoAxesColumn,
  Flag,
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
          title={`Remove ${title} from investigation scope`}
          className="ml-0.5 rounded-full p-0.5 text-ink-faint transition-colors hover:bg-border-soft hover:text-ink"
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}

function ChartKindIcon({ kind, compact = false }: { kind: ContextChartKind; compact?: boolean }) {
  const props = {
    size: compact ? 12 : 14,
    strokeWidth: 2,
    className: 'text-ink',
  } as const;
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
  chartKind?: ContextChartKind;
  variant?: 'chart' | 'assumption';
  onRemove?: () => void;
  dimmed?: boolean;
  compact?: boolean;
}

/** Mockup-style chart / assumption context card for the composer and investigation header. */
export function ComposerContextCard({
  title,
  timeframeLabel,
  chartKind = 'sparkline',
  variant = 'chart',
  onRemove,
  dimmed = false,
  compact = false,
}: ComposerContextCardProps) {
  return (
    <div
      className={`relative flex shrink-0 items-center gap-2.5 rounded-xl bg-composer-chip py-2 pl-2 ${
        onRemove ? 'pr-8' : 'pr-3'
      } ${dimmed ? 'opacity-40' : ''} ${compact ? 'gap-2 py-1.5 pl-1.5' : ''}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-white ${
          compact ? 'h-7 w-7' : 'h-9 w-9'
        }`}
      >
        {variant === 'assumption' ? (
          <Flag size={compact ? 12 : 14} strokeWidth={2} className="text-amber" />
        ) : (
          <ChartKindIcon kind={chartKind} compact={compact} />
        )}
      </div>
      <div className={`min-w-0 pr-1 ${compact ? 'max-w-[7rem]' : 'max-w-[11rem]'}`}>
        <p
          className={`truncate font-semibold leading-tight text-ink ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {title}
        </p>
        <p
          className={`truncate leading-tight text-ink-soft ${
            compact ? 'text-[10px]' : 'text-xs'
          }`}
        >
          {timeframeLabel}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${title} from investigation scope`}
          aria-label={`Remove ${title} from context`}
          className="absolute right-1.5 top-1.5 rounded-md p-0.5 text-composer-placeholder transition-colors hover:bg-white hover:text-ink"
        >
          <X size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
