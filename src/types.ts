export type MetricId = 'revenue' | 'grossMargin' | 'churn' | 'newArr' | 'activeCustomers';

export type DimensionId = 'drillDownPath' | 'channelBreakdown';

export type ContextId = MetricId | DimensionId;

export function isMetricId(id: ContextId): id is MetricId {
  return id !== 'drillDownPath' && id !== 'channelBreakdown';
}

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

export interface AnswerChartSeries {
  label: string;
  /** Current period value in $M */
  actual: number;
  /** Prior period value in $M */
  prior: number;
}

export interface AnswerChart {
  title: string;
  subtitle?: string;
  actualLabel?: string;
  priorLabel?: string;
  /** Series index highlighted by default (e.g. Outbound). */
  defaultSelectedIndex?: number;
  series: AnswerChartSeries[];
}

export type PinTrigger = 'drilldown' | 'newTurn';

export interface Answer {
  summary: string;
  /** Dedicated short blurb for the pin UI — authored, not derived from body. */
  pinSummary?: string;
  findings: Finding[];
  nextCheck?: string;
  /** Overall answer confidence shown as a badge on the response. */
  confidence?: Confidence;
  /** Optional interactive chart embedded in the chat response. */
  chart?: AnswerChart;
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

export interface ClarifyingOption {
  id: string;
  label: string;
}

export interface ClarifyingQuestion {
  id: string;
  prompt: string;
  why: string;
  options: ClarifyingOption[];
}

export interface ClarifyingResponse {
  questionId: string;
  optionId: string;
  label: string;
}

export interface ClarifyingRound {
  intro: string;
  questions: ClarifyingQuestion[];
  /** Index of the question currently awaiting an answer. */
  currentIndex: number;
  responses: ClarifyingResponse[];
}

export type TurnPhase = 'clarifying' | 'diagnosing' | 'done';

export interface ConversationTurn {
  id: string;
  question: string;
  contextIds: ContextId[];
  /** Subset of attached metrics the agent judged relevant to this specific question. */
  usedContextIds: MetricId[];
  stage: Stage;
  stopped?: boolean;
  answer?: Answer;
  revealedFindingIds: string[];
  drillDowns: DrillDown[];
  /** Ids of drill-downs from root to the currently viewed nested thread, e.g. ['d1', 'd1-1']. */
  activePath: string[];
  revisingFindingIds: string[];
  /** Clarifying round before diagnosis (Claude-style follow-ups). */
  phase?: TurnPhase;
  clarifying?: ClarifyingRound;
}

export interface ContextItem {
  id: ContextId;
  title: string;
}

export interface ThoughtStep {
  id: string;
  findingId: string;
  /** Full line shown in the expanded trace. */
  text: string;
  /** Short title for the collapsed thinking header (e.g. "Queried Salesforce"). */
  shortText: string;
}

export interface SavedCheck {
  id: string;
  question: string;
  createdAt: string;
  metricIds: MetricId[];
}
