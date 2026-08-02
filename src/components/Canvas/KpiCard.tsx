import { AlertTriangle, ArrowDownRight, ArrowUpRight, Check, MessageSquarePlus } from 'lucide-react';
import type { KpiDefinition } from '../../types';
import { formatMetricValue } from '../../data/mockData';
import { Sparkline } from './charts/Sparkline';
import { DonutProgress } from './charts/DonutProgress';
import { BarStrip } from './charts/BarStrip';
import { SteppedLine } from './charts/SteppedLine';

interface KpiCardProps {
  kpi: KpiDefinition;
  isAttached: boolean;
  onAddToChat: () => void;
  onAskAboutAnomaly: () => void;
}

const CHART_COLOR: Record<KpiDefinition['id'], string> = {
  revenue: 'text-ocean',
  grossMargin: 'text-sage',
  churn: 'text-terracotta',
  newArr: 'text-ocean',
  activeCustomers: 'text-sage',
};

function Chart({ kpi }: { kpi: KpiDefinition }) {
  const color = CHART_COLOR[kpi.id];
  switch (kpi.chartType) {
    case 'sparkline':
      return <Sparkline points={kpi.series} anomalyIndex={kpi.anomaly?.pointIndex} colorClassName={color} />;
    case 'donut':
      return (
        <div className="flex items-center gap-3">
          <DonutProgress percent={kpi.currentValue} colorClassName={color} />
          <p className="text-xs leading-snug text-ink-soft">
            of margin
            <br />
            retained
          </p>
        </div>
      );
    case 'barStrip':
      return <BarStrip points={kpi.series} highlightIndex={kpi.anomaly?.pointIndex} colorClassName={color} />;
    case 'steppedLine':
      return <SteppedLine points={kpi.series} colorClassName={color} />;
  }
}

export function KpiCard({ kpi, isAttached, onAddToChat, onAskAboutAnomaly }: KpiCardProps) {
  const isGood = kpi.deltaPct >= 0 === kpi.positiveIsGood;

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{kpi.title}</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-ink">{formatMetricValue(kpi.currentValue, kpi.unit)}</p>
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                isGood ? 'bg-sage-soft text-sage' : 'bg-terracotta-soft text-terracotta'
              }`}
            >
              {kpi.deltaPct >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(kpi.deltaPct).toFixed(1)}%
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddToChat}
          title={isAttached ? 'Added to chat context' : 'Add to chat'}
          className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            isAttached
              ? 'border-sage-soft bg-sage-soft text-sage'
              : 'border-border-soft bg-surface-soft text-ink-soft hover:border-border hover:text-ink'
          }`}
        >
          {isAttached ? <Check size={13} /> : <MessageSquarePlus size={13} />}
          {isAttached ? 'Added' : 'Add to chat'}
        </button>
      </div>

      <Chart kpi={kpi} />

      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] text-ink-faint">{kpi.scope}</p>
        {kpi.anomaly && (
          <button
            type="button"
            onClick={onAskAboutAnomaly}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-soft px-2 py-1 text-[11px] font-medium text-amber transition-opacity hover:opacity-80"
          >
            <AlertTriangle size={11} />
            {kpi.anomaly.label} · ask about it
          </button>
        )}
      </div>
    </div>
  );
}
