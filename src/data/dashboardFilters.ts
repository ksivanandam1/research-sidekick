import type { KpiDefinition, MetricId, SeriesPoint } from '../types';
import { KPI_DEFINITIONS } from './mockData';

export type TimeframePreset = 'thisMonth' | 'thisQuarter' | 'thisYear';
/** Scope filter on the canvas — tiers by default, plus an all-products view. */
export type ProductFilterId = 'allTiers' | 'starter' | 'growth' | 'pro' | 'allProducts';

export interface TimeframeOption {
  id: TimeframePreset;
  label: string;
}

export interface ProductOption {
  id: ProductFilterId;
  label: string;
}

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { id: 'thisMonth', label: 'This month' },
  { id: 'thisQuarter', label: 'This quarter' },
  { id: 'thisYear', label: 'This year' },
];

export const PRODUCT_OPTIONS: ProductOption[] = [
  { id: 'allTiers', label: 'All tiers' },
  { id: 'starter', label: 'Starter' },
  { id: 'growth', label: 'Growth' },
  { id: 'pro', label: 'Pro' },
  { id: 'allProducts', label: 'All products' },
];

export const DEFAULT_TIMEFRAME: TimeframePreset = 'thisQuarter';
export const DEFAULT_PRODUCT: ProductFilterId = 'allTiers';

type KpiSlice = Pick<KpiDefinition, 'currentValue' | 'deltaPct' | 'series'>;

function series(values: number[], labels?: string[]): SeriesPoint[] {
  const months = labels ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return values.map((value, i) => ({ label: months[i] ?? String(i + 1), value }));
}

/** Sparse overrides keyed by `${timeframe}:${scope}`. Missing keys fall back to baseline. */
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
  'thisQuarter:allProducts': {
    revenue: { currentValue: 2.1, deltaPct: -12.0, series: series([2.05, 2.1, 2.15, 2.2, 2.28, 2.35, 2.38, 2.25, 2.1]) },
    activeCustomers: { currentValue: 2200, deltaPct: 2.3, series: series([2050, 2080, 2100, 2120, 2140, 2160, 2175, 2190, 2200]) },
  },
  'thisMonth:starter': {
    revenue: { currentValue: 0.16, deltaPct: -1.0, series: series([0.17, 0.165, 0.162, 0.16, 0.16], ['W1', 'W2', 'W3', 'W4', 'W5']) },
  },
  'thisYear:pro': {
    revenue: { currentValue: 4.1, deltaPct: -8.0, series: series([0.4, 0.42, 0.44, 0.45, 0.46, 0.48, 0.4, 0.35, 0.3, 0.32, 0.34, 0.36], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) },
  },
};

function sliceKey(timeframe: TimeframePreset, product: ProductFilterId): string {
  return `${timeframe}:${product}`;
}

export function resolveKpis(timeframe: TimeframePreset, product: ProductFilterId): KpiDefinition[] {
  const primary = KPI_SLICES[sliceKey(timeframe, product)];
  const fallbackProduct = KPI_SLICES[sliceKey(timeframe, 'allTiers')];
  const baseline = KPI_SLICES['thisQuarter:allTiers'];

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
