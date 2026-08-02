import { ArrowDownRight, ArrowUpRight, Info, Minus, MoreVertical, Plus } from 'lucide-react';
import type { KpiDefinition } from '../../types';
import { formatMetricValue } from '../../data/mockData';
import { Sparkline } from './charts/Sparkline';
import { DonutProgress } from './charts/DonutProgress';
import { BarStrip } from './charts/BarStrip';
import { SteppedLine } from './charts/SteppedLine';

interface KpiCardProps {
  kpi: KpiDefinition;
  tooltip: string;
  isAttached: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

const CHART_COLOR: Record<KpiDefinition['id'], string> = {
  revenue: 'text-ocean',
  grossMargin: 'text-sage',
  churn: 'text-terracotta',
  newArr: 'text-ocean',
  activeCustomers: 'text-sage',
};

function DeltaBadge({ kpi, compact = false }: { kpi: KpiDefinition; compact?: boolean }) {
  const isGood = kpi.deltaPct >= 0 === kpi.positiveIsGood;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-medium ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-1.5 py-0.5 text-xs'
      } ${isGood ? 'bg-sage-soft text-sage' : 'bg-terracotta-soft text-terracotta'}`}
    >
      {kpi.deltaPct >= 0 ? <ArrowUpRight size={compact ? 10 : 12} /> : <ArrowDownRight size={compact ? 10 : 12} />}
      {Math.abs(kpi.deltaPct).toFixed(1)}%
    </span>
  );
}

function Chart({ kpi }: { kpi: KpiDefinition }) {
  const color = CHART_COLOR[kpi.id];
  switch (kpi.chartType) {
    case 'sparkline':
      return <Sparkline points={kpi.series} colorClassName={color} />;
    case 'donut':
      return (
        <div className="flex flex-col items-center gap-2 py-1">
          <DonutProgress percent={kpi.currentValue} colorClassName={color} size={120}>
            <p className="text-lg font-semibold leading-none text-ink">
              {formatMetricValue(kpi.currentValue, kpi.unit)}
            </p>
            <div className="mt-1.5">
              <DeltaBadge kpi={kpi} compact />
            </div>
          </DonutProgress>
          <p className="text-[11px] text-ink-faint">of margin retained</p>
        </div>
      );
    case 'barStrip':
      return <BarStrip points={kpi.series} colorClassName={color} />;
    case 'steppedLine':
      return <SteppedLine points={kpi.series} colorClassName={color} />;
  }
}

const iconBtn =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-soft bg-surface text-ink-soft transition-colors hover:border-border hover:text-ink';

export function KpiCard({ kpi, tooltip, isAttached, onAdd, onRemove }: KpiCardProps) {
  const isDonut = kpi.chartType === 'donut';

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-medium text-ink-soft">{kpi.title}</p>
          <span title={tooltip} className="inline-flex text-ink-faint" aria-label={tooltip}>
            <Info size={14} strokeWidth={1.75} />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={isAttached ? onRemove : onAdd}
            title={isAttached ? 'Remove from chat context' : 'Add to chat'}
            className={`${iconBtn} ${isAttached ? 'border-sage-soft bg-sage-soft text-sage' : ''}`}
          >
            {isAttached ? <Minus size={14} /> : <Plus size={14} />}
          </button>
          <button type="button" className={iconBtn} title="More options" aria-label="More options">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {!isDonut && (
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold text-ink">{formatMetricValue(kpi.currentValue, kpi.unit)}</p>
          <DeltaBadge kpi={kpi} />
        </div>
      )}

      <Chart kpi={kpi} />

      <p className="mt-auto truncate text-[11px] text-ink-faint">{kpi.scope}</p>
    </div>
  );
}
