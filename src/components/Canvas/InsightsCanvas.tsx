import { useMemo, useState } from 'react';
import { MoreHorizontal, Upload } from 'lucide-react';
import type { ContextId, MetricId } from '../../types';
import { DIMENSION_DEFINITIONS } from '../../data/mockData';
import {
  DEFAULT_PRODUCT,
  DEFAULT_TIMEFRAME,
  TIMEFRAME_OPTIONS,
  resolveKpis,
  type ProductFilterId,
  type TimeframePreset,
} from '../../data/dashboardFilters';
import { useResearch } from '../../state/ResearchContext';
import { KpiCard } from './KpiCard';
import { DimensionCard } from './DimensionCard';
import { TimeframeControl } from './TimeframeControl';
import { ProductFilter } from './ProductFilter';
import { FloatingResearchBar } from './FloatingResearchBar';

const DASHBOARD_SHARE_TEASER =
  'Q3 overview: $2.1M vs $2.4M plan (−12%). Starter/Growth flat; Pro −34% on outbound volume. YoY only −3%.';

const KPI_TOOLTIPS: Record<MetricId, string> = {
  revenue: 'Subscription revenue across Products A–C for mid-market retail customers.',
  activeCustomers: 'Active subscribers on Starter, Growth, and Pro (~2,200).',
  churn: 'Share of customers who cancelled or failed to renew in the period.',
  grossMargin: 'Revenue minus cost of goods sold, as a percent of revenue.',
  newArr: 'New annual recurring revenue booked in the selected timeframe.',
};

const ROW_ONE: MetricId[] = ['revenue', 'activeCustomers', 'churn'];
const ROW_TWO: MetricId[] = ['grossMargin', 'newArr'];

export function InsightsCanvas() {
  const { attachedContext, addContext, removeContext, showToast } = useResearch();
  const [timeframe, setTimeframe] = useState<TimeframePreset>(DEFAULT_TIMEFRAME);
  const [product, setProduct] = useState<ProductFilterId>(DEFAULT_PRODUCT);

  const kpis = useMemo(() => resolveKpis(timeframe, product), [timeframe, product]);
  const byId = useMemo(() => Object.fromEntries(kpis.map((k) => [k.id, k])) as Record<MetricId, (typeof kpis)[0]>, [kpis]);
  const timeframeLabel =
    TIMEFRAME_OPTIONS.find((option) => option.id === timeframe)?.label ?? 'This quarter';
  const attachedIds = attachedContext.map((item) => item.id);

  function attach(id: ContextId) {
    addContext(id, { timeframeLabel });
  }

  async function handleExport() {
    try {
      await navigator.clipboard.writeText(DASHBOARD_SHARE_TEASER);
    } catch {
      // Clipboard may be unavailable — still confirm the export flow completed.
    }
    showToast('Copied — ready to share.');
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">Company performance</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            title="Export a shareable summary"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-sage px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <Upload size={13} />
            Export
          </button>
          <button
            type="button"
            title="More options"
            aria-label="More options"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage text-white"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <TimeframeControl value={timeframe} onChange={setTimeframe} />
        <ProductFilter value={product} onChange={setProduct} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {ROW_ONE.map((id) => (
            <KpiCard
              key={id}
              kpi={byId[id]}
              tooltip={KPI_TOOLTIPS[id]}
              isAttached={attachedIds.includes(id)}
              onAdd={() => attach(id)}
              onRemove={() => removeContext(id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {ROW_TWO.map((id) => (
            <KpiCard
              key={id}
              kpi={byId[id]}
              tooltip={KPI_TOOLTIPS[id]}
              isAttached={attachedIds.includes(id)}
              onAdd={() => attach(id)}
              onRemove={() => removeContext(id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DimensionCard
              definition={DIMENSION_DEFINITIONS[0]}
              isAttached={attachedIds.includes('drillDownPath')}
              onAdd={() => attach('drillDownPath')}
              onRemove={() => removeContext('drillDownPath')}
            />
          </div>
          <div className="lg:col-span-2">
            <DimensionCard
              definition={DIMENSION_DEFINITIONS[1]}
              isAttached={attachedIds.includes('channelBreakdown')}
              onAdd={() => attach('channelBreakdown')}
              onRemove={() => removeContext('channelBreakdown')}
            />
          </div>
        </div>
      </div>

      <FloatingResearchBar />
    </div>
  );
}
