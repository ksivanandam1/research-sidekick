import type { KpiDefinition, MetricId, SeriesPoint } from '../types';
import { KPI_DEFINITIONS } from './mockData';

export type TimeframePreset = 'thisMonth' | 'thisQuarter' | 'thisYear' | 'custom';
export type ProductFilterId = 'all' | 'productA' | 'productB' | 'productC';

export interface TimeframeOption {
  id: TimeframePreset;
  label: string;
  /** Resolved calendar range shown under the preset; null for Custom until applied. */
  resolvedRange: string | null;
}

export interface ProductOption {
  id: ProductFilterId;
  label: string;
}

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { id: 'thisMonth', label: 'This month', resolvedRange: 'Aug 1 – Aug 31, 2026' },
  { id: 'thisQuarter', label: 'This quarter', resolvedRange: 'Jul 1 – Sep 30, 2026' },
  { id: 'thisYear', label: 'This year', resolvedRange: 'Jan 1 – Dec 31, 2026' },
  { id: 'custom', label: 'Custom', resolvedRange: null },
];

export const PRODUCT_OPTIONS: ProductOption[] = [
  { id: 'all', label: 'All products' },
  { id: 'productA', label: 'Product A' },
  { id: 'productB', label: 'Product B' },
  { id: 'productC', label: 'Product C' },
];

export const DEFAULT_TIMEFRAME: TimeframePreset = 'thisQuarter';
export const DEFAULT_PRODUCT: ProductFilterId = 'all';

type KpiSlice = Pick<KpiDefinition, 'currentValue' | 'deltaPct' | 'series'>;

function series(values: number[], labels?: string[]): SeriesPoint[] {
  const months = labels ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return values.map((value, i) => ({ label: months[i] ?? String(i + 1), value }));
}

/** Sparse overrides keyed by `${timeframe}:${product}`. Missing keys fall back to baseline. */
const KPI_SLICES: Partial<Record<string, Partial<Record<MetricId, KpiSlice>>>> = {
  'thisMonth:all': {
    revenue: { currentValue: 1.48, deltaPct: -2.1, series: series([1.55, 1.52, 1.5, 1.49, 1.48], ['W1', 'W2', 'W3', 'W4', 'W5']) },
    activeCustomers: { currentValue: 1848, deltaPct: 0.4, series: series([1835, 1838, 1842, 1845, 1848], ['W1', 'W2', 'W3', 'W4', 'W5']) },
    churn: { currentValue: 3.9, deltaPct: 0.3, series: series([3.6, 3.7, 3.8, 3.85, 3.9], ['W1', 'W2', 'W3', 'W4', 'W5']) },
    grossMargin: { currentValue: 61.8, deltaPct: -0.4, series: series([62.2, 62.0, 61.9, 61.85, 61.8], ['W1', 'W2', 'W3', 'W4', 'W5']) },
    newArr: { currentValue: 0.39, deltaPct: -4.0, series: series([0.44, 0.42, 0.41, 0.4, 0.39], ['W1', 'W2', 'W3', 'W4', 'W5']) },
  },
  'thisYear:all': {
    revenue: { currentValue: 13.6, deltaPct: 3.2, series: series([1.4, 1.45, 1.5, 1.55, 1.6, 1.7, 1.55, 1.45, 1.5, 1.55, 1.6, 1.75], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
    activeCustomers: { currentValue: 1842, deltaPct: 8.1, series: series([1700, 1720, 1740, 1760, 1780, 1800, 1810, 1825, 1842, 1850, 1860, 1875], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
    churn: { currentValue: 3.6, deltaPct: 0.5, series: series([3.1, 3.1, 3.2, 3.2, 3.3, 3.3, 3.5, 3.7, 4.1, 3.9, 3.7, 3.6], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
    grossMargin: { currentValue: 62.4, deltaPct: -0.8, series: series([63.5, 63.4, 63.2, 63.0, 62.8, 62.6, 62.2, 61.8, 61.4, 61.8, 62.1, 62.4], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
    newArr: { currentValue: 4.2, deltaPct: -2.5, series: series([0.4, 0.38, 0.42, 0.4, 0.39, 0.37, 0.35, 0.33, 0.32, 0.34, 0.36, 0.38], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
  },
  'thisQuarter:productA': {
    revenue: { currentValue: 1.82, deltaPct: -4.8, series: series([1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 1.9, 1.85, 1.82]) },
    activeCustomers: { currentValue: 720, deltaPct: 1.8, series: series([690, 695, 700, 705, 710, 712, 715, 718, 720]) },
    churn: { currentValue: 3.4, deltaPct: 0.5, series: series([2.9, 2.95, 3.0, 3.05, 3.1, 3.15, 3.25, 3.35, 3.4]) },
    grossMargin: { currentValue: 64.2, deltaPct: -0.9, series: series([65.0, 65.0, 64.8, 64.7, 64.6, 64.5, 64.4, 64.3, 64.2]) },
    newArr: { currentValue: 0.52, deltaPct: -6.1, series: series([0.6, 0.58, 0.57, 0.56, 0.55, 0.54, 0.53, 0.525, 0.52]) },
  },
  'thisQuarter:productB': {
    revenue: { currentValue: 1.55, deltaPct: -7.2, series: series([1.5, 1.55, 1.6, 1.62, 1.65, 1.68, 1.62, 1.58, 1.55]) },
    activeCustomers: { currentValue: 610, deltaPct: 2.0, series: series([580, 585, 590, 595, 598, 600, 604, 607, 610]) },
    churn: { currentValue: 4.5, deltaPct: 1.1, series: series([3.4, 3.5, 3.55, 3.6, 3.7, 3.85, 4.1, 4.3, 4.5]) },
    grossMargin: { currentValue: 59.8, deltaPct: -1.8, series: series([61.5, 61.4, 61.2, 61.0, 60.8, 60.5, 60.2, 60.0, 59.8]) },
    newArr: { currentValue: 0.38, deltaPct: -11.0, series: series([0.48, 0.46, 0.45, 0.44, 0.42, 0.41, 0.4, 0.39, 0.38]) },
  },
  'thisQuarter:productC': {
    revenue: { currentValue: 1.15, deltaPct: -8.0, series: series([1.1, 1.12, 1.18, 1.2, 1.22, 1.25, 1.2, 1.17, 1.15]) },
    activeCustomers: { currentValue: 512, deltaPct: 3.1, series: series([480, 485, 490, 495, 500, 504, 507, 510, 512]) },
    churn: { currentValue: 4.8, deltaPct: 1.3, series: series([3.5, 3.6, 3.7, 3.8, 4.0, 4.2, 4.4, 4.6, 4.8]) },
    grossMargin: { currentValue: 58.5, deltaPct: -2.2, series: series([60.5, 60.3, 60.0, 59.8, 59.5, 59.2, 59.0, 58.7, 58.5]) },
    newArr: { currentValue: 0.28, deltaPct: -12.5, series: series([0.36, 0.35, 0.34, 0.33, 0.32, 0.31, 0.3, 0.29, 0.28]) },
  },
  'thisMonth:productA': {
    revenue: { currentValue: 0.58, deltaPct: -1.5, series: series([0.62, 0.6, 0.59, 0.585, 0.58], ['W1', 'W2', 'W3', 'W4', 'W5']) },
  },
  'thisYear:productA': {
    revenue: { currentValue: 5.4, deltaPct: 4.0, series: series([0.4, 0.42, 0.44, 0.45, 0.46, 0.48, 0.47, 0.45, 0.44, 0.46, 0.48, 0.5], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
  },
};

function sliceKey(timeframe: TimeframePreset, product: ProductFilterId): string {
  const tf = timeframe === 'custom' ? 'thisQuarter' : timeframe;
  return `${tf}:${product}`;
}

export function resolveKpis(timeframe: TimeframePreset, product: ProductFilterId): KpiDefinition[] {
  const primary = KPI_SLICES[sliceKey(timeframe, product)];
  const fallbackProduct = KPI_SLICES[sliceKey(timeframe, 'all')];
  const baseline = KPI_SLICES['thisQuarter:all'];

  return KPI_DEFINITIONS.map((kpi) => {
    const override =
      primary?.[kpi.id] ?? fallbackProduct?.[kpi.id] ?? baseline?.[kpi.id] ?? {
        currentValue: kpi.currentValue,
        deltaPct: kpi.deltaPct,
        series: kpi.series,
      };
    return {
      ...kpi,
      currentValue: override.currentValue,
      deltaPct: override.deltaPct,
      series: override.series,
      // Anomalies are out of scope for the base layer; strip for display slices.
      anomaly: undefined,
    };
  });
}

export function formatCustomRange(from: string, to: string): string | null {
  if (!from || !to) return null;
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  return `${fmt(from)} – ${fmt(to)}`;
}
