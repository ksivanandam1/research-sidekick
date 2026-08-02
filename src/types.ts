export type MetricId = 'revenue' | 'grossMargin' | 'churn' | 'newArr' | 'activeCustomers';

export type ChartKind = 'sparkline' | 'donut' | 'barStrip' | 'steppedLine';

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface Anomaly {
  label: string;
  pointIndex: number;
  suggestedQuestion: string;
}

export interface KpiDefinition {
  id: MetricId;
  title: string;
  unit: 'currency' | 'percent' | 'count';
  currentValue: number;
  deltaPct: number;
  /** Whether a positive delta is a good thing (false for churn, cost, etc). */
  positiveIsGood: boolean;
  series: SeriesPoint[];
  chartType: ChartKind;
  anomaly?: Anomaly;
  scope: string;
  suggestedQuestions: string[];
}

export type SourceType = 'financeDW' | 'crm' | 'chat' | 'doc' | 'product';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  timestamp: string;
  snippet: string;
  url?: string;
  restricted?: boolean;
}

export type FindingKind = 'evidence' | 'assumption' | 'unknown';

export type Confidence = 'high' | 'medium' | 'low';

export type FeedbackValue = 'up' | 'down' | null;

export interface Finding {
  id: string;
  kind: FindingKind;
  metricId: MetricId;
  text: string;
  confidence?: Confidence;
  sourceIds: string[];
  investigateQuestion?: string;
  feedback?: FeedbackValue;
  revised?: boolean;
  revisedNote?: string;
}

export interface Answer {
  summary: string;
  findings: Finding[];
  nextCheck?: string;
}

export type Stage = 'idle' | 'analysing' | 'retrieving' | 'citing' | 'drafting' | 'ready';

export interface DrillDown {
  id: string;
  parentFindingId: string;
  question: string;
  stage: Stage;
  stopped?: boolean;
  answer?: Answer;
  revealedFindingIds: string[];
  revisingFindingIds: string[];
  /** Nested investigations spawned from an open question within this drill-down. */
  drillDowns: DrillDown[];
}

export interface ConversationTurn {
  id: string;
  question: string;
  contextIds: MetricId[];
  /** Subset of contextIds the agent judged relevant to this specific question. */
  usedContextIds: MetricId[];
  stage: Stage;
  stopped?: boolean;
  answer?: Answer;
  revealedFindingIds: string[];
  drillDowns: DrillDown[];
  /** Ids of drill-downs from root to the currently viewed nested thread, e.g. ['d1', 'd1-1']. */
  activePath: string[];
  revisingFindingIds: string[];
}

export interface ContextItem {
  id: MetricId;
  title: string;
}

export interface SavedCheck {
  id: string;
  question: string;
  createdAt: string;
  metricIds: MetricId[];
}
