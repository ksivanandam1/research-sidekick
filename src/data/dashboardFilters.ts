import type { KpiDefinition, MetricId, SeriesPoint } from '../types';
import { KPI_DEFINITIONS } from './mockData';

export type TimeframePreset = 'thisQuarter' | 'custom';
/** Scope filter on the canvas — subscription tiers. */
export type ProductFilterId = 'allTiers' | 'starter' | 'growth' | 'pro';

export interface ProductOption {
  id: ProductFilterId;
  label: string;
}

export interface TimeframeSelection {
  preset: TimeframePreset;
  /** ISO date `YYYY-MM-DD` */
  startDate: string;
  /** ISO date `YYYY-MM-DD` */
  endDate: string;
}

/** Demo "this quarter" window — Q3 2026. */
export const THIS_QUARTER_RANGE = {
  startDate: '2026-07-01',
  endDate: '2026-09-30',
} as const;

export const PRODUCT_OPTIONS: ProductOption[] = [
  { id: 'allTiers', label: 'All tiers' },
  { id: 'starter', label: 'Starter' },
  { id: 'growth', label: 'Growth' },
  { id: 'pro', label: 'Pro' },
];

export const DEFAULT_TIMEFRAME: TimeframeSelection = {
  preset: 'thisQuarter',
  startDate: THIS_QUARTER_RANGE.startDate,
  endDate: THIS_QUARTER_RANGE.endDate,
};

export const DEFAULT_PRODUCT: ProductFilterId = 'allTiers';

type KpiSlice = Pick<KpiDefinition, 'currentValue' | 'deltaPct' | 'series'>;

function series(values: number[], labels?: string[]): SeriesPoint[] {
  const months = labels ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return values.map((value, i) => ({ label: months[i] ?? String(i + 1), value }));
}

/** Sparse overrides keyed by `${profile}:${scope}`. Missing keys fall back to baseline. */
const KPI_SLICES: Partial<Record<string, Partial<Record<MetricId, KpiSlice>>>> = {
  'thisMonth:allTiers': {
    revenue: { currentValue: 0.68, deltaPct: -2.1, series: series([0.72, 0.71, 0.7, 0.69, 0.68], ['W1', 'W2', 'W3', 'W4', 'W5']) },
    activeCustomers: { currentValue: 2208, deltaPct: 0.4, series: series([2195, 2198, 2200, 2204, 2208], ['W1', 'W2', 'W3', 'W4', 'W5']) },
    churn: { currentValue: 3.9, deltaPct: 0.3, series: series([3.6, 3.7, 3.8, 3.85, 3.9], ['W1', 'W2', 'W3', 'W4', 'W5']) },
    grossMargin: { currentValue: 61.8, deltaPct: -0.4, series: series([62.2, 62.0, 61.9, 61.85, 61.8], ['W1', 'W2', 'W3', 'W4', 'W5']) },
    newArr: { currentValue: 0.39, deltaPct: -4.0, series: series([0.44, 0.42, 0.41, 0.4, 0.39], ['W1', 'W2', 'W3', 'W4', 'W5']) },
  },
  'thisYear:allTiers': {
    revenue: { currentValue: 8.4, deltaPct: 3.2, series: series([0.65, 0.68, 0.7, 0.72, 0.75, 0.78, 0.72, 0.7, 0.68, 0.7, 0.72, 0.75], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
    activeCustomers: { currentValue: 2200, deltaPct: 8.1, series: series([2000, 2030, 2060, 2080, 2100, 2120, 2140, 2170, 2200, 2210, 2220, 2235], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
    churn: { currentValue: 3.6, deltaPct: 0.5, series: series([3.1, 3.1, 3.2, 3.2, 3.3, 3.3, 3.5, 3.7, 4.1, 3.9, 3.7, 3.6], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
    grossMargin: { currentValue: 62.4, deltaPct: -0.8, series: series([63.5, 63.4, 63.2, 63.0, 62.8, 62.6, 62.2, 61.8, 61.4, 61.8, 62.1, 62.4], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
    newArr: { currentValue: 4.2, deltaPct: -2.5, series: series([0.4, 0.38, 0.42, 0.4, 0.39, 0.37, 0.35, 0.33, 0.32, 0.34, 0.36, 0.38], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
  },
  'thisQuarter:starter': {
    revenue: { currentValue: 0.48, deltaPct: -2.0, series: series([0.46, 0.47, 0.48, 0.49, 0.5, 0.5, 0.49, 0.485, 0.48]) },
    activeCustomers: { currentValue: 980, deltaPct: 3.1, series: series([920, 930, 940, 950, 960, 965, 970, 975, 980]) },
    churn: { currentValue: 3.2, deltaPct: 0.2, series: series([3.0, 3.0, 3.05, 3.1, 3.1, 3.15, 3.15, 3.2, 3.2]) },
    grossMargin: { currentValue: 63.1, deltaPct: -0.5, series: series([63.6, 63.5, 63.4, 63.4, 63.3, 63.3, 63.2, 63.15, 63.1]) },
    newArr: { currentValue: 0.22, deltaPct: -3.0, series: series([0.24, 0.24, 0.23, 0.23, 0.23, 0.225, 0.22, 0.22, 0.22]) },
  },
  'thisQuarter:growth': {
    revenue: { currentValue: 0.72, deltaPct: -2.7, series: series([0.7, 0.71, 0.73, 0.74, 0.75, 0.76, 0.74, 0.73, 0.72]) },
    activeCustomers: { currentValue: 740, deltaPct: 1.8, series: series([710, 715, 720, 725, 728, 732, 735, 738, 740]) },
    churn: { currentValue: 3.6, deltaPct: 0.4, series: series([3.2, 3.25, 3.3, 3.35, 3.4, 3.45, 3.5, 3.55, 3.6]) },
    grossMargin: { currentValue: 61.8, deltaPct: -1.0, series: series([62.8, 62.6, 62.5, 62.3, 62.2, 62.0, 61.9, 61.85, 61.8]) },
    newArr: { currentValue: 0.36, deltaPct: -5.0, series: series([0.4, 0.39, 0.39, 0.38, 0.38, 0.37, 0.37, 0.365, 0.36]) },
  },
  'thisQuarter:pro': {
    revenue: { currentValue: 0.9, deltaPct: -34.0, series: series([1.3, 1.32, 1.35, 1.36, 1.34, 1.28, 1.15, 1.0, 0.9]) },
    activeCustomers: { currentValue: 480, deltaPct: -1.2, series: series([490, 492, 495, 498, 496, 492, 488, 484, 480]) },
    churn: { currentValue: 5.2, deltaPct: 1.4, series: series([3.8, 3.9, 4.0, 4.2, 4.4, 4.6, 4.8, 5.0, 5.2]) },
    grossMargin: { currentValue: 58.5, deltaPct: -2.2, series: series([60.5, 60.3, 60.0, 59.8, 59.5, 59.2, 59.0, 58.7, 58.5]) },
    newArr: { currentValue: 0.28, deltaPct: -42.0, series: series([0.5, 0.48, 0.47, 0.45, 0.42, 0.38, 0.34, 0.3, 0.28]) },
  },
  'thisMonth:starter': {
    revenue: { currentValue: 0.16, deltaPct: -1.0, series: series([0.17, 0.165, 0.162, 0.16, 0.16], ['W1', 'W2', 'W3', 'W4', 'W5']) },
  },
  'thisYear:pro': {
    revenue: { currentValue: 4.1, deltaPct: -8.0, series: series([0.4, 0.42, 0.44, 0.45, 0.46, 0.48, 0.4, 0.35, 0.3, 0.32, 0.34, 0.36], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
  },
};

type DataProfile = 'thisMonth' | 'thisQuarter' | 'thisYear';

function daySpan(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T12:00:00`).getTime();
  const end = new Date(`${endDate}T12:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 90;
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

/** Pick a data profile from the selected window length. */
function dataProfile(selection: TimeframeSelection): DataProfile {
  if (selection.preset === 'thisQuarter') return 'thisQuarter';
  const days = daySpan(selection.startDate, selection.endDate);
  if (days <= 45) return 'thisMonth';
  if (days <= 120) return 'thisQuarter';
  return 'thisYear';
}

function dateSeed(startDate: string, endDate: string): number {
  let hash = 0;
  const key = `${startDate}:${endDate}`;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function axisLabels(startDate: string, endDate: string, count: number): string[] {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || count <= 0) {
    return Array.from({ length: count }, (_, i) => String(i + 1));
  }
  const span = Math.max(1, end.getTime() - start.getTime());
  const days = daySpan(startDate, endDate);
  const withDay = days <= 120;
  return Array.from({ length: count }, (_, i) => {
    const t = start.getTime() + (span * i) / Math.max(1, count - 1);
    const d = new Date(t);
    return d.toLocaleDateString('en-US', withDay ? { month: 'short', day: 'numeric' } : { month: 'short' });
  });
}

function roundValue(value: number, metricId: MetricId): number {
  if (metricId === 'activeCustomers') return Math.round(value);
  if (metricId === 'churn' || metricId === 'grossMargin') return +value.toFixed(1);
  return +value.toFixed(2);
}

/**
 * Shape a base slice for a custom range: retarget axis labels to the selected
 * window and nudge values so different ranges are visibly distinct.
 */
function adaptSliceForCustomRange(
  slice: KpiSlice,
  selection: TimeframeSelection,
  metricId: MetricId,
): KpiSlice {
  const seed = dateSeed(selection.startDate, selection.endDate);
  const factor = 0.9 + ((seed + metricId.charCodeAt(0) * 13) % 21) / 100; // 0.90–1.10
  const labels = axisLabels(selection.startDate, selection.endDate, slice.series.length);
  const points = slice.series.map((point, i) => {
    const wobble = 1 + ((((seed >> (i % 8)) + i * 7) % 9) - 4) * 0.008;
    return {
      label: labels[i] ?? point.label,
      value: roundValue(point.value * factor * wobble, metricId),
    };
  });
  const currentValue = points[points.length - 1]?.value ?? roundValue(slice.currentValue * factor, metricId);
  const prior = points[points.length - 2]?.value;
  const deltaPct =
    prior != null && prior !== 0
      ? +(((currentValue - prior) / Math.abs(prior)) * 100).toFixed(1)
      : slice.deltaPct;

  // Period totals (revenue / new ARR) scale with window length vs a ~90-day quarter.
  const isPeriodTotal = metricId === 'revenue' || metricId === 'newArr';
  const lengthScale = isPeriodTotal ? daySpan(selection.startDate, selection.endDate) / 90 : 1;
  const scaledCurrent = isPeriodTotal
    ? roundValue(slice.currentValue * factor * lengthScale, metricId)
    : currentValue;

  return {
    currentValue: scaledCurrent,
    deltaPct,
    series: isPeriodTotal
      ? points.map((p) => ({ ...p, value: roundValue(p.value * lengthScale, metricId) }))
      : points,
  };
}

function sliceKey(profile: DataProfile, product: ProductFilterId): string {
  return `${profile}:${product}`;
}

function readSlice(
  profile: DataProfile,
  product: ProductFilterId,
  metricId: MetricId,
  fallback: KpiSlice,
): KpiSlice {
  const primary = KPI_SLICES[sliceKey(profile, product)];
  const fallbackProduct = KPI_SLICES[sliceKey(profile, 'allTiers')];
  const baseline = KPI_SLICES['thisQuarter:allTiers'];
  return primary?.[metricId] ?? fallbackProduct?.[metricId] ?? baseline?.[metricId] ?? fallback;
}

export function resolveKpis(selection: TimeframeSelection, product: ProductFilterId): KpiDefinition[] {
  const profile = dataProfile(selection);
  const rangeLabel = formatTimeframeLabel(selection);

  return KPI_DEFINITIONS.map((kpi) => {
    const base = readSlice(profile, product, kpi.id, {
      currentValue: kpi.currentValue,
      deltaPct: kpi.deltaPct,
      series: kpi.series,
    });
    const override =
      selection.preset === 'custom' ? adaptSliceForCustomRange(base, selection, kpi.id) : base;

    return {
      ...kpi,
      currentValue: override.currentValue,
      deltaPct: override.deltaPct,
      series: override.series,
      scope: kpi.scope.replace(/·[^·]*$/, `· ${rangeLabel}`),
      anomaly: undefined,
    };
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTimeframeLabel(selection: TimeframeSelection): string {
  if (selection.preset === 'thisQuarter') return 'This quarter';
  return `${formatShortDate(selection.startDate)} – ${formatShortDate(selection.endDate)}`;
}

