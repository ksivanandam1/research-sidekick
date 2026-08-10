import { useEffect, useMemo, useRef, useState } from 'react';
import { MoreHorizontal, Upload } from 'lucide-react';
import type { ContextId, MetricId } from '../../types';
import { DIMENSION_DEFINITIONS } from '../../data/mockData';
import {
  DEFAULT_PRODUCT,
  DEFAULT_TIMEFRAME,
  formatTimeframeLabel,
  resolveKpis,
  type ProductFilterId,
  type TimeframeSelection,
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
  revenue: 'Subscription revenue across Starter, Growth, and Pro for mid-market retail customers.',
  activeCustomers: 'Active subscribers on Starter, Growth, and Pro (~2,200).',
  churn: 'Share of customers who cancelled or failed to renew in the period.',
  grossMargin: 'Revenue minus cost of goods sold, as a percent of revenue.',
  newArr: 'New annual recurring revenue booked in the selected timeframe.',
};

const ROW_ONE: MetricId[] = ['revenue', 'activeCustomers', 'churn'];
const ROW_TWO: MetricId[] = ['grossMargin', 'newArr'];

type MoreOption = {
  id: string;
  label: string;
  badge?: number;
  /** Omitted for actions that don't show a toast (e.g. proactive demo). */
  toast?: string;
};

const MORE_OPTIONS: MoreOption[] = [
  { id: 'refresh', label: 'Refresh data', toast: 'Dashboard data refreshed.' },
  { id: 'customize', label: 'Customize layout', toast: 'Layout editor coming soon.' },
  { id: 'alerts', label: 'Manage alerts', badge: 2, toast: 'Opening alert settings…' },
  { id: 'schedule', label: 'Schedule report', toast: 'Report scheduling coming soon.' },
  { id: 'proactiveDemo', label: 'Proactive dashboard demo' },
];

function MoreOptionsMenu({ onSelect }: { onSelect: (option: MoreOption) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title="More options"
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage text-white transition-opacity hover:opacity-90"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1.5 min-w-[200px] rounded-xl border border-border bg-surface p-1.5 shadow-soft-lg"
        >
          {MORE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink"
            >
              <span>{opt.label}</span>
              {opt.badge != null && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  {opt.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InsightsCanvas() {
  const {
    attachedContext,
    addContext,
    removeContext,
    showToast,
    closePanel,
    startProactiveDashboardDemo,
  } = useResearch();
  const [timeframe, setTimeframe] = useState<TimeframeSelection>(DEFAULT_TIMEFRAME);
  const [product, setProduct] = useState<ProductFilterId>(DEFAULT_PRODUCT);

  const kpis = useMemo(() => resolveKpis(timeframe, product), [timeframe, product]);
  const byId = useMemo(() => Object.fromEntries(kpis.map((k) => [k.id, k])) as Record<MetricId, (typeof kpis)[0]>, [kpis]);
  const timeframeLabel = formatTimeframeLabel(timeframe);

  function isAttachedForCurrentTimeframe(id: ContextId): boolean {
    return attachedContext.some(
      (item) =>
        item.kind === 'chart' && item.id === id && item.timeframeLabel === timeframeLabel,
    );
  }

  function attach(id: ContextId) {
    addContext(id, { timeframeLabel });
  }

  function detach(id: ContextId) {
    const match = attachedContext.find(
      (item) =>
        item.kind === 'chart' && item.id === id && item.timeframeLabel === timeframeLabel,
    );
    if (match) removeContext(match.instanceId);
  }

  async function handleExport() {
    try {
      await navigator.clipboard.writeText(DASHBOARD_SHARE_TEASER);
    } catch {
      // Clipboard may be unavailable — still confirm the export flow completed.
    }
    showToast('Copied — ready to share.');
  }

  function handleMoreOption(option: MoreOption) {
    if (option.id === 'proactiveDemo') {
      // Keep the panel closed so the sidekick badge can nudge the user when ready.
      // Session-only — a refresh clears turns / unread and returns to the default experience.
      closePanel();
      startProactiveDashboardDemo();
      return;
    }
    if (option.toast) showToast(option.toast);
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
          <MoreOptionsMenu onSelect={handleMoreOption} />
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
              isAttached={isAttachedForCurrentTimeframe(id)}
              onAdd={() => attach(id)}
              onRemove={() => detach(id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {ROW_TWO.map((id) => (
            <KpiCard
              key={id}
              kpi={byId[id]}
              tooltip={KPI_TOOLTIPS[id]}
              isAttached={isAttachedForCurrentTimeframe(id)}
              onAdd={() => attach(id)}
              onRemove={() => detach(id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DimensionCard
              definition={DIMENSION_DEFINITIONS[0]}
              isAttached={isAttachedForCurrentTimeframe('drillDownPath')}
              onAdd={() => attach('drillDownPath')}
              onRemove={() => detach('drillDownPath')}
            />
          </div>
          <div className="lg:col-span-2">
            <DimensionCard
              definition={DIMENSION_DEFINITIONS[1]}
              isAttached={isAttachedForCurrentTimeframe('channelBreakdown')}
              onAdd={() => attach('channelBreakdown')}
              onRemove={() => detach('channelBreakdown')}
            />
          </div>
        </div>
      </div>

      <FloatingResearchBar />
    </div>
  );
}
