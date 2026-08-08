export type MetricId = 'revenue' | 'grossMargin' | 'churn' | 'newArr' | 'activeCustomers';

export type DimensionId = 'drillDownPath' | 'channelBreakdown';

export type ContextId = MetricId | DimensionId;

export function isMetricId(id: ContextId): id is MetricId {
  return id !== 'drillDownPath' && id !== 'channelBreakdown';
}

export type ChartKind = 'sparkline' | 'donut' | 'barStrip' | 'steppedLine';

/** Chart glyph used on attached context cards (KPIs + dimension cards). */
export type ContextChartKind = ChartKind | 'compareBars';

/** Chart attached to the composer, with subtitle frozen at attach time. */
export interface ChartAttachedContextItem {
  kind: 'chart';
  /** Unique per attachment so the same chart can appear twice with different timeframes. */
  instanceId: string;
  id: ContextId;
  title: string;
  timeframeLabel: string;
  chartKind: ContextChartKind;
}

/** Assumption finding attached so the user can clarify it in chat. */
export interface AssumptionAttachedContextItem {
  kind: 'assumption';
  instanceId: string;
  findingId: string;
  sourceTurnId: string;
  title: string;
  /** Secondary line on the chip, e.g. "Assumption". */
  subtitle: string;
  text: string;
}

export type AttachedContextItem = ChartAttachedContextItem | AssumptionAttachedContextItem;

export function isChartContext(item: AttachedContextItem): item is ChartAttachedContextItem {
  return item.kind === 'chart';
}

export function isAssumptionContext(item: AttachedContextItem): item is AssumptionAttachedContextItem {
  return item.kind === 'assumption';
}

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

export type SourceType = 'xero' | 'tableau' | 'chat' | 'doc' | 'product';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  /** Relative or absolute freshness, e.g. "2d ago" or "Synced 6h ago". */
  timestamp: string;
  author?: string;
  /** Workspace, folder, or channel shown in the citation meta row. */
  workspace?: string;
  /** Supporting excerpts. Citation cards hide these for Xero/Tableau (duplication with the claim). */
  excerpts: string[];
  url?: string;
  restricted?: boolean;
}

export type FindingKind = 'evidence' | 'assumption' | 'unknown';

export type Confidence = 'high' | 'medium' | 'low';

export type ResponseFeedbackReason =
  | 'inaccurate'
  | 'missedAsk'
  | 'uncertainty'
  | 'citation'
  | 'privacy'
  | 'other';

export interface ResponseFeedback {
  value: 'up' | 'down';
  reasons?: ResponseFeedbackReason[];
  comment?: string;
}

export interface Finding {
  id: string;
  kind: FindingKind;
  metricId: MetricId;
  text: string;
  confidence?: Confidence;
  sourceIds: string[];
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

export type Stage = 'idle' | 'analysing' | 'retrieving' | 'citing' | 'drafting' | 'linking' | 'ready';

export interface DrillDown {
  id: string;
  parentFindingId: string;
  question: string;
  stage: Stage;
  stopped?: boolean;
  answer?: Answer;
  revealedFindingIds: string[];
  responseFeedback?: ResponseFeedback;
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
  /** Snapshot of composer context cards at submit time (frozen titles/subtitles). */
  contextItems: AttachedContextItem[];
  /** Subset of attached metrics the agent judged relevant to this specific question. */
  usedContextIds: MetricId[];
  stage: Stage;
  stopped?: boolean;
  /** Prior answer superseded by a clarification reply. */
  archived?: boolean;
  answer?: Answer;
  revealedFindingIds: string[];
  drillDowns: DrillDown[];
  /** Ids of drill-downs from root to the currently viewed nested thread, e.g. ['d1', 'd1-1']. */
  activePath: string[];
  responseFeedback?: ResponseFeedback;
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
  /** Short title for the collapsed thinking header (e.g. "Queried Tableau"). */
  shortText: string;
}

/** One row in the pipeline thought trace (label + concrete detail subtext). */
export interface PipelineThoughtStep {
  id: string;
  label: string;
  detail: string;
  stage: Stage;
}

export interface SavedCheck {
  id: string;
  question: string;
  createdAt: string;
  metricIds: MetricId[];
}
