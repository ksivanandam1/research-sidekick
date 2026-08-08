import type {
  Answer,
  ClarifyingRound,
  ContextChartKind,
  ContextId,
  ContextItem,
  DimensionId,
  Finding,
  KpiDefinition,
  MetricId,
  Source,
  SourceType,
  PipelineThoughtStep,
  ThoughtStep,
} from '../types';
import { isMetricId } from '../types';

// ---------------------------------------------------------------------------
// KPI definitions — the "Insights Canvas"
// ---------------------------------------------------------------------------

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

function series(values: number[]) {
  return values.map((value, i) => ({ label: months[i], value }));
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    id: 'revenue',
    title: 'Revenue',
    unit: 'currency',
    currentValue: 2.1,
    deltaPct: -12.0,
    positiveIsGood: true,
    chartType: 'sparkline',
    series: series([2.05, 2.1, 2.15, 2.2, 2.28, 2.35, 2.38, 2.25, 2.1]),
    anomaly: {
      label: 'Q3 dip',
      pointIndex: 8,
      suggestedQuestion: 'Why did revenue dip in Q3?',
    },
    scope: 'Subscription revenue · mid-market retail · Q1–Q3 2026',
    suggestedQuestions: ['Why did revenue dip in Q3?', 'How does Q3 compare to plan?'],
  },
  {
    id: 'grossMargin',
    title: 'Gross Margin',
    unit: 'percent',
    currentValue: 61.4,
    deltaPct: -1.4,
    positiveIsGood: true,
    chartType: 'donut',
    series: series([63.5, 63.8, 64.0, 63.6, 63.1, 62.8, 62.0, 61.6, 61.4]),
    anomaly: {
      label: 'Q3 compression',
      pointIndex: 8,
      suggestedQuestion: 'What is driving gross margin down in Q3?',
    },
    scope: 'Gross margin · company-wide · Q1–Q3 2026',
    suggestedQuestions: ['What is driving gross margin down?', 'How does margin compare to plan?'],
  },
  {
    id: 'churn',
    title: 'Customer Churn',
    unit: 'percent',
    currentValue: 4.1,
    deltaPct: 0.9,
    positiveIsGood: false,
    chartType: 'barStrip',
    series: series([3.0, 3.1, 3.0, 3.1, 3.2, 3.2, 3.5, 3.9, 4.1]),
    anomaly: {
      label: 'Q3 spike',
      pointIndex: 8,
      suggestedQuestion: 'Why did customer churn increase in Q3?',
    },
    scope: 'Customer churn · Enterprise + SMB · Q1–Q3 2026',
    suggestedQuestions: ['Why did customer churn increase in Q3?', 'Which segment is churn concentrated in?'],
  },
  {
    id: 'newArr',
    title: 'New ARR',
    unit: 'currency',
    currentValue: 1.18,
    deltaPct: -9.2,
    positiveIsGood: true,
    chartType: 'barStrip',
    series: series([1.4, 1.35, 1.5, 1.42, 1.38, 1.3, 1.25, 1.2, 1.18]),
    anomaly: {
      label: 'Q3 slowdown',
      pointIndex: 8,
      suggestedQuestion: 'What is driving the New ARR slowdown?',
    },
    scope: 'New ARR booked · Q1–Q3 2026',
    suggestedQuestions: ['How is New ARR trending this quarter?', 'What is driving the New ARR slowdown?'],
  },
  {
    id: 'activeCustomers',
    title: 'Active Customers',
    unit: 'count',
    currentValue: 2200,
    deltaPct: 2.3,
    positiveIsGood: true,
    chartType: 'steppedLine',
    series: series([2050, 2080, 2100, 2120, 2140, 2160, 2175, 2190, 2200]),
    scope: 'Active subscribers · Starter / Growth / Pro · Q1–Q3 2026',
    suggestedQuestions: ['How is Active Customers trending this quarter?'],
  },
];

// ---------------------------------------------------------------------------
// Dashboard-level narrative — powers the Q3 read card's "Summarise" modal
// ---------------------------------------------------------------------------

export const DASHBOARD_NARRATIVE_TITLE = 'Q3 dashboard summary';

export const DASHBOARD_NARRATIVE: string[] = [
  'Q3 subscription revenue came in at $2.1M against a $2.4M forecast — a 12% miss. Versus Q2 that is also a 12% decline, but versus Q3 last year revenue is only down ~3%, which softens the panic and points partly toward seasonality rather than a sudden collapse.',
  'Across ~2,200 mid-market retail subscribers on Starter, Growth, and Pro, the Starter and Growth tiers are roughly flat. The dip lives in Pro — our highest-value, sales-assisted segment — which is down ~34% QoQ.',
  'Inside Pro, self-serve upgrades are flat. New Pro deals sourced by the outbound team targeting larger retail chains have nearly halved. That is a volume problem (fewer deals closing), not a value problem (deal size and discounting look stable).',
  'Gross margin and New ARR move in the same direction as the quieter Pro outbound pipeline; Active Customers still grew modestly, so the base is not eroding across the board.',
];

export const DASHBOARD_NEXT_STEP =
  'Review outbound Pro pipeline coverage for Q4 and confirm whether deal count recovers without discounting the ACV.';

export function getKpi(id: MetricId): KpiDefinition {
  const kpi = KPI_DEFINITIONS.find((k) => k.id === id);
  if (!kpi) throw new Error(`Unknown KPI: ${id}`);
  return kpi;
}

export interface CompareBarRow {
  label: string;
  /** Current quarter value in $M */
  actual: number;
  /** Prior quarter value in $M */
  prior: number;
}

export interface DimensionDefinition {
  id: DimensionId;
  title: string;
  tooltip: string;
  items: string[];
  suggestedQuestions: string[];
  /** Horizontal actual-vs-prior bars (Q3 vs Q2). */
  compareBars?: CompareBarRow[];
}

export const DIMENSION_DEFINITIONS: DimensionDefinition[] = [
  {
    id: 'drillDownPath',
    title: 'Drill down path',
    tooltip: 'Plan tier mix this quarter vs last — Pro volume is down.',
    items: ['Starter', 'Growth', 'Pro'],
    suggestedQuestions: [
      'Why did Pro diminish this quarter compared to last?',
      'How is performance split across Starter, Growth, and Pro?',
    ],
    compareBars: [
      { label: 'Starter', actual: 0.48, prior: 0.49 },
      { label: 'Growth', actual: 0.72, prior: 0.74 },
      { label: 'Pro', actual: 0.9, prior: 1.36 },
    ],
  },
  {
    id: 'channelBreakdown',
    title: 'Channel breakdown',
    tooltip: 'Pro-tier acquisition: self-serve upgrades vs outbound sales to larger retail chains.',
    items: ['Self-serve upgrade', 'Outbound sales', 'Partner-assisted'],
    suggestedQuestions: ['Which channel is driving the Pro-tier dip this quarter?'],
    compareBars: [
      { label: 'Self-serve upgrade', actual: 0.42, prior: 0.43 },
      { label: 'Outbound sales', actual: 0.28, prior: 0.55 },
      { label: 'Partner-assisted', actual: 0.2, prior: 0.21 },
    ],
  },
];

export function getDimension(id: DimensionId): DimensionDefinition {
  const dim = DIMENSION_DEFINITIONS.find((d) => d.id === id);
  if (!dim) throw new Error(`Unknown dimension: ${id}`);
  return dim;
}

export function getContextItem(
  id: ContextId,
): ContextItem & { suggestedQuestions: string[]; chartKind: ContextChartKind } {
  if (isMetricId(id)) {
    const kpi = getKpi(id);
    return {
      id,
      title: kpi.title,
      suggestedQuestions: kpi.suggestedQuestions,
      chartKind: kpi.chartType,
    };
  }
  const dim = getDimension(id);
  return {
    id,
    title: dim.title,
    suggestedQuestions: dim.suggestedQuestions,
    chartKind: dim.compareBars ? 'compareBars' : 'barStrip',
  };
}

export function toContextItem(id: ContextId): ContextItem {
  const item = getContextItem(id);
  return { id: item.id, title: item.title };
}

export function formatMetricValue(value: number, unit: KpiDefinition['unit']): string {
  if (unit === 'currency') return `$${value.toFixed(2)}M`;
  if (unit === 'percent') return `${value.toFixed(1)}%`;
  return Math.round(value).toLocaleString();
}

// ---------------------------------------------------------------------------
// Source registry
// ---------------------------------------------------------------------------

export const SOURCES: Record<string, Source> = {
  srcFinanceRevenue: {
    id: 'srcFinanceRevenue',
    name: 'Subscription Revenue vs Plan (Q3 close)',
    type: 'xero',
    timestamp: '2d ago',
    author: 'Finance Ops',
    workspace: 'Finance',
    excerpts: ['Q3 revenue $2.1M vs $2.4M forecast (−12%). QoQ −12%; vs Q3 last year −3%.'],
    url: '#',
  },
  srcSfdcRenewals: {
    id: 'srcSfdcRenewals',
    name: 'Revenue by Tier (Starter / Growth / Pro)',
    type: 'tableau',
    timestamp: '6h ago',
    author: 'RevOps',
    workspace: 'Sales Analytics',
    excerpts: ['Starter and Growth roughly flat QoQ. Pro tier revenue −34% QoQ.'],
    url: '#',
  },
  srcSfdcPipeline: {
    id: 'srcSfdcPipeline',
    name: 'Pro Pipeline by Channel',
    type: 'tableau',
    timestamp: '6h ago',
    author: 'RevOps',
    workspace: 'Sales Analytics',
    excerpts: [
      'Pro self-serve upgrades flat. Outbound-sourced new Pro deals nearly halved QoQ.',
    ],
    url: '#',
  },
  srcSlackRevOps: {
    id: 'srcSlackRevOps',
    name: '#revenue-ops',
    type: 'chat',
    timestamp: 'Jul 28',
    author: 'Maya Chen',
    workspace: 'Revenue Ops',
    excerpts: [
      '"Outbound coverage on larger retail chains is thin this quarter — fewer Pro first meetings converting."',
      '"We\'re not losing on price — ACV looks fine. It\'s meeting volume and conversion."',
      '"Self-serve Pro upgrades are holding; the miss is almost all outbound-sourced logos."',
    ],
    url: '#',
  },
  srcFinancePricing: {
    id: 'srcFinancePricing',
    name: 'Pro Deal Size & Discounting',
    type: 'xero',
    timestamp: '3d ago',
    author: 'Finance Ops',
    workspace: 'Finance',
    excerpts: ['Pro median ACV stable QoQ; discount rate unchanged. Closed-won count down sharply.'],
    url: '#',
  },
  srcSfdcChurn: {
    id: 'srcSfdcChurn',
    name: 'Churn Reasons Q3',
    type: 'tableau',
    timestamp: '6h ago',
    author: 'Customer Success',
    workspace: 'CS Analytics',
    excerpts: ["Top reason logged: 'pricing/budget' (44%), 'competitor' (22%), 'other' (34%)."],
    url: '#',
  },
  srcFinanceMargin: {
    id: 'srcFinanceMargin',
    name: 'Gross Margin Detail Q3',
    type: 'xero',
    timestamp: '2d ago',
    author: 'Finance Ops',
    workspace: 'Finance',
    excerpts: ['Gross margin 61.4% in Q3, down from 62.8% in Q2.'],
    url: '#',
  },
  srcFinanceArr: {
    id: 'srcFinanceArr',
    name: 'New ARR Bookings Q3',
    type: 'xero',
    timestamp: '2d ago',
    author: 'Finance Ops',
    workspace: 'Finance',
    excerpts: ['New ARR booked: $1.18M in Q3, down from $1.30M in Q2 — Pro outbound weighted.'],
    url: '#',
  },
  srcProductUsage: {
    id: 'srcProductUsage',
    name: 'Active Subscribers Q3',
    type: 'product',
    timestamp: '5d ago',
    author: 'Product Analytics',
    workspace: 'Growth',
    excerpts: ['~2,200 active customers on Starter / Growth / Pro at end of Q3.'],
    url: '#',
  },
};

export function getSource(id: string): Source {
  const source = SOURCES[id];
  if (!source) throw new Error(`Unknown source: ${id}`);
  return source;
}

const QUERY_VERB: Record<SourceType, string> = {
  xero: 'Queried Xero',
  tableau: 'Queried Tableau',
  chat: 'Checked Slack',
  doc: 'Checked internal documents',
  product: 'Queried product analytics',
};

/**
 * Turns the evidence in an answer into a concrete "what did the agent check"
 * trace — e.g. "Queried Tableau — found APAC renewal rate dropped to 81%" —
 * instead of an abstract stage label. Derived from the same scripted findings
 * used elsewhere, so it stays consistent with the citations shown in the answer.
 */
/** Thought-trace copy: no em dashes / minus glyphs (demo readability). */
function forThoughtTrace(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, '. ')
    .replace(/−/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function buildThoughtSteps(answer: Answer): ThoughtStep[] {
  return answer.findings
    .filter((f) => f.kind === 'evidence' && f.sourceIds.length > 0)
    .map((f) => {
      const primarySource = getSource(f.sourceIds[0]);
      const shortText = QUERY_VERB[primarySource.type];
      return {
        id: `step-${f.id}`,
        findingId: f.id,
        shortText,
        text: forThoughtTrace(`${shortText}: found ${f.text}`),
      };
    });
}

const PIPELINE_STEP_DEFS: Pick<PipelineThoughtStep, 'id' | 'label' | 'stage'>[] = [
  { id: 'clarifying', label: 'Clarifying assumptions', stage: 'analysing' },
  { id: 'retrieving', label: 'Retrieving related Q3 data', stage: 'retrieving' },
  { id: 'analysing', label: 'Analysing Q3 revenue trends and decisions', stage: 'citing' },
  { id: 'drafting', label: 'Drafting an explanation of the dip', stage: 'drafting' },
  { id: 'linking', label: 'Linking figures to source reports', stage: 'linking' },
];

/** Pull numbered steps from the answer's "### How I got here" section. */
function extractHowIGotHere(summary: string): string[] {
  const marker = '### How I got here';
  const start = summary.indexOf(marker);
  if (start === -1) return [];

  const after = summary.slice(start + marker.length).replace(/^\s*\n/, '');
  const section = after.split(/\n### /)[0]?.trim() ?? '';
  if (!section) return [];

  const items: string[] = [];
  const re = /(\d+)\.\s+([\s\S]*?)(?=\n\d+\.\s+|$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(section)) !== null) {
    items.push(forThoughtTrace(match[2].replace(/\[\d+\]/g, '').trim()));
  }
  return items;
}

function buildRetrievalDetail(answer: Answer): string {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const finding of answer.findings) {
    for (const id of finding.sourceIds) {
      if (seen.has(id)) continue;
      seen.add(id);
      const source = getSource(id);
      if (source.restricted) continue;
      const verb = QUERY_VERB[source.type];
      const snippet = source.excerpts[0]?.split(/[.!]/)[0]?.trim();
      lines.push(snippet ? `${verb}: ${snippet}` : `${verb} for ${source.name}`);
    }
  }
  if (lines.length === 0) {
    return 'Pulled related metrics and source reports for the attached context.';
  }
  return lines.slice(0, 4).join('. ') + '.';
}

function buildLinkingDetail(answer: Answer): string {
  const evidence = answer.findings.filter((f) => f.kind === 'evidence' && f.sourceIds.length > 0);
  if (evidence.length === 0) {
    return 'Cross-checked figures against available source reports.';
  }
  const linked = evidence.slice(0, 3).map((f) => {
    const source = getSource(f.sourceIds[0]);
    return `${source.name.split('(')[0].trim()} supports "${f.text.split('.')[0]}"`;
  });
  return linked.join('. ') + '.';
}

function defaultAnalysingDetail(answer: Answer): string {
  const evidence = answer.findings.filter((f) => f.kind === 'evidence');
  if (evidence.length >= 2) {
    return forThoughtTrace(
      `Compared ${evidence[0].text.split('.')[0]} against ${evidence[1].text.split('.')[0]}.`,
    );
  }
  if (evidence[0]) {
    return forThoughtTrace(`Reviewed ${evidence[0].text.split('.')[0]}.`);
  }
  return 'Compared period-over-period trends and broke the move down by segment.';
}

/**
 * Pipeline thought trace for the side panel: short stage label plus concrete
 * detail subtext derived from the answer's "How I got here" script when present.
 */
export function buildPipelineThoughtSteps(answer: Answer): PipelineThoughtStep[] {
  const howSteps = extractHowIGotHere(answer.summary);

  const clarifyingDetail =
    howSteps.length > 0
      ? 'Applied your clarifying answers on billing one-offs, forecast method, Pro churn, and outbound coverage before running the diagnosis.'
      : 'Scoped the question to the attached charts and metrics before retrieving data.';

  const analysingDetail =
    howSteps.length >= 2
      ? `${howSteps[0]} ${howSteps[1]}`
      : howSteps[0] ?? defaultAnalysingDetail(answer);

  const draftingDetail =
    howSteps[2] ??
    howSteps[howSteps.length - 1] ??
    'Drafted a plain-language explanation from the evidence gathered.';

  const detailById: Record<string, string> = {
    clarifying: clarifyingDetail,
    retrieving: buildRetrievalDetail(answer),
    analysing: analysingDetail,
    drafting: draftingDetail,
    linking: buildLinkingDetail(answer),
  };

  return PIPELINE_STEP_DEFS.map((def) => ({
    ...def,
    detail: forThoughtTrace(detailById[def.id] ?? ''),
  }));
}

/** One-line label for the collapsed thought trace once analysis is complete. */
export function getThoughtTraceSummary(answer: Answer): string {
  if (answer.pinSummary) {
    const short = answer.pinSummary.split(/[.!]/)[0]?.trim();
    if (short && short.length <= 52) return short;
  }
  const heading = answer.summary.match(/## (.+)/)?.[1]?.trim();
  if (heading && heading.length <= 52) return heading;
  return 'Analysis complete';
}

/** Every distinct source considered while building an answer, in first-seen order. */
export function getAllSourcesForAnswer(answer: Answer): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const finding of answer.findings) {
    for (const id of finding.sourceIds) {
      if (seen.has(id)) continue;
      seen.add(id);
      sources.push(getSource(id));
    }
  }
  return sources;
}

// ---------------------------------------------------------------------------
// Scripted "hero" answers
// ---------------------------------------------------------------------------

export function shouldStartClarifying(question: string): boolean {
  if (isNotifyFollowUp(question)) return false;
  return /revenue|dip|miss|forecast|tier|channel|summarise|summarize|q3/i.test(question);
}

/** Short follow-ups from notify suggested prompts — skip the full diagnosis flow. */
export function isNotifyFollowUp(question: string): boolean {
  return /yes.*notify|please notify me|something else.*don'?t know/i.test(question.trim());
}

export function resolveNotifyFollowUp(question: string, topic = 'revenue'): Answer {
  if (/yes.*notify|please notify me/i.test(question)) {
    return {
      confidence: 'high',
      summary: `Got it — I'll watch **${topic}** and notify you when it moves meaningfully. You can review or turn this off anytime from **Manage alerts**.`,
      findings: [],
    };
  }
  return {
    summary:
      "No problem. Tell me what you'd like to look at next — another metric, a segment cut, or a different timeframe.",
    findings: [],
  };
}

export function buildRevenueClarifyingRound(): ClarifyingRound {
  return {
    intro: "Before I diagnose the Q3 dip, a few quick checks so I don't make false assumptions:",
    currentIndex: 0,
    responses: [],
    questions: [
      {
        id: 'oneOffs',
        prompt: 'Any large one-off invoices or annual prepayments in Q2 or Q3?',
        why: 'A single big Pro renewal shifting quarters could explain part of the swing on its own.',
        options: [
          { id: 'no', label: 'No one-offs, revenue is steady' },
          { id: 'yes', label: 'Yes, there were some' },
          { id: 'unsure', label: 'Not sure, check billing data' },
          { id: 'other', label: 'Something else' },
        ],
      },
      {
        id: 'forecast',
        prompt: 'How was the $2.4M forecast built?',
        why: 'This changes what "12% miss" actually measures.',
        options: [
          { id: 'bottomUp', label: 'Bottom-up from pipeline' },
          { id: 'topDown', label: 'Top-down growth target' },
          { id: 'mix', label: 'Mix of both' },
          { id: 'other', label: 'Something else' },
        ],
      },
      {
        id: 'churn',
        prompt: 'Did any existing Pro accounts churn or downgrade in Q3?',
        why: "I'm currently reading this as a new-business shortfall. Churn would change the diagnosis.",
        options: [
          { id: 'no', label: 'No churn, accounts held' },
          { id: 'yes', label: 'Yes, some churned' },
          { id: 'other', label: 'Something else' },
        ],
      },
      {
        id: 'outbound',
        prompt: 'Any changes to the outbound team in Q3 (e.g. territories, quotas, headcount)?',
        why: 'A mid-quarter reshuffle would produce exactly this pattern.',
        options: [
          { id: 'no', label: 'No changes' },
          { id: 'yes', label: 'Yes, something changed' },
          { id: 'other', label: 'Something else' },
        ],
      },
    ],
  };
}

export const REVENUE_DIP_ANSWER: Answer = {
  confidence: 'medium',
  summary: [
    "Here's a rundown on the Q3 revenue dip. I've highlighted where further validation is needed as I'm not able to access certain datasets.",
    '---',
    '## The Q3 revenue dip is concentrated in one segment, not a broad decline',
    'Q3 came in at **$2.1M vs. $2.4M forecast, a 12% miss**. Year on year it is only **down 3%**[1]. Starter, Growth, and Pro self-serve have not dipped[2]. The entire drop traces to one place: **outbound-sourced Pro deals, down about 50%**[3].',
    '### How I got here',
    '1. Compared Pro sales QoQ (down 12%) with YoY (down 3%). The gap suggests partial seasonality.\n2. Broke revenue down by tier. Only Pro moved, down 34%.\n3. Split Pro by channel and checked deal size. Volume is down, pricing is stable[4].',
    'We were able to diagnose the segment based on your tier and channel data.',
    '## Validation needed',
    "I was able to access the volume of outbound sourced pro deals but wasn't able to see the pipeline activity behind them. **Talk to Maya Chen in RevOps** and ask whether **outbound capacity dropped in Q3**, or whether **first meetings stopped converting** — that answer decides if this is a headcount problem or a conversion problem.",
  ].join('\n\n'),
  pinSummary:
    'Q3 missed forecast by 12%, but the drop is outbound Pro — not a broad decline across tiers.',
  findings: [
    {
      id: 'revenue-e1',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Q3 revenue was $2.1M versus a $2.4M forecast, a 12% miss that is only 3% below Q3 last year.',
      sourceIds: ['srcFinanceRevenue'],
    },
    {
      id: 'revenue-e2',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Starter and Growth tiers are roughly flat while Pro tier revenue is down about 34% QoQ, where the dip lives.',
      sourceIds: ['srcSfdcRenewals'],
    },
    {
      id: 'revenue-e3',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Within Pro, self-serve upgrades are flat while outbound-sourced new Pro deals nearly halved.',
      sourceIds: ['srcSlackRevOps', 'srcSfdcPipeline'],
    },
    {
      id: 'revenue-e4',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Pro closed-won count is down while median ACV and discount rate are stable, pointing to a volume problem not a value problem.',
      sourceIds: ['srcFinancePricing'],
    },
    {
      id: 'revenue-a1',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming self-serve vs outbound mix inside Pro did not shift enough to explain the outbound miss on its own.',
      confidence: 'medium',
      sourceIds: [],
    },
    {
      id: 'revenue-a2',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Seasonality could have impacted sales this month as MoM sales has decreased by 5%',
      confidence: 'medium',
      sourceIds: ['srcFinanceRevenue'],
    },
    {
      id: 'revenue-u1',
      kind: 'unknown',
      metricId: 'revenue',
      text: 'Did outbound rep headcount or first-meeting volume drop in Q3?',
      sourceIds: [],
    },
  ],
  nextCheck: 'Confirm with RevOps whether outbound capacity or late-stage conversion dropped in Q3.',
};

export const CHURN_SOLO_ANSWER: Answer = {
  summary:
    'Churn rose mainly in APAC enterprise accounts, largely for budget and approval reasons rather than product dissatisfaction.',
  pinSummary:
    'Churn rose mainly in APAC enterprise; budget/approval friction, not product dissatisfaction.',
  findings: [
    {
      id: 'churn-e1',
      kind: 'evidence',
      metricId: 'churn',
      text: 'Churn rose from 3.2% to 4.1% quarter-on-quarter.',
      sourceIds: ['srcSfdcChurn'],
    },
    {
      id: 'churn-e2',
      kind: 'evidence',
      metricId: 'churn',
      text: "44% of churned accounts logged 'pricing/budget' as the primary reason.",
      sourceIds: ['srcSfdcChurn'],
    },
    {
      id: 'churn-a1',
      kind: 'assumption',
      metricId: 'churn',
      text: 'Assuming logged churn reasons reflect the true cause, not just the stated one.',
      confidence: 'medium',
      sourceIds: [],
    },
  ],
  nextCheck: 'Break down churn by segment (Enterprise vs SMB) for Q3.',
};

export const REVENUE_CHURN_COMBINED_ANSWER: Answer = {
  summary: [
    'Churn is up modestly, but it is not the main driver of the Q3 revenue miss. The $2.1M vs $2.4M gap is explained primarily by Pro-tier acquisition — outbound-sourced new Pro deals nearly halved — while Starter and Growth stay roughly flat.',
    'Treat churn as a secondary watch item. The actionable story for the leadership brief is Pro volume from outbound, not a broad-based retention collapse across the ~2,200-customer base.',
  ].join('\n\n'),
  pinSummary:
    'Revenue miss is Pro outbound volume; churn is a secondary watch item, not the main driver.',
  findings: [
    {
      id: 'combined-e1',
      kind: 'evidence',
      metricId: 'churn',
      text: 'Overall churn rose from 3.2% to 4.1% quarter-on-quarter.',
      sourceIds: ['srcSfdcChurn'],
    },
    {
      id: 'combined-e2',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Pro outbound closed-won count nearly halved; that alone accounts for most of the revenue gap vs plan.',
      sourceIds: ['srcSfdcPipeline', 'srcFinanceRevenue'],
    },
    {
      id: 'combined-a1',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming churned logos are not disproportionately the same larger retail chains the outbound team targets.',
      confidence: 'medium',
      sourceIds: [],
    },
  ],
  nextCheck: 'Split churn by tier (Starter / Growth / Pro) before treating retention as part of the revenue miss.',
};

export const PRO_OUTBOUND_DRILLDOWN_ANSWER: Answer = {
  summary: [
    'The Pro miss is a conversion-and-coverage story on outbound, not self-serve. Self-serve Pro upgrades held flat; the hole is in new logos and expansions sourced by the team selling into larger retail chains.',
    'Deal count is down while ACV is stable, so the next check is whether reps are running fewer qualified opportunities or losing more late-stage deals.',
  ].join('\n\n'),
  pinSummary:
    'Outbound Pro miss is conversion-and-coverage on new logos — self-serve Pro held flat.',
  findings: [
    {
      id: 'drill-pro-e1',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Outbound-sourced Pro closed-won count nearly halved QoQ; self-serve Pro upgrades unchanged.',
      sourceIds: ['srcSfdcPipeline'],
    },
    {
      id: 'drill-pro-e2',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'RevOps notes thin coverage on larger retail chains — fewer first meetings converting into Pro closes.',
      sourceIds: ['srcSlackRevOps'],
    },
    {
      id: 'drill-pro-a1',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming product fit for larger chains has not suddenly worsened versus Q2.',
      confidence: 'medium',
      sourceIds: [],
    },
  ],
  nextCheck: 'Compare outbound meeting volume and stage conversion for Pro this quarter vs last.',
};

export const PRO_VOLUME_DRILLDOWN_ANSWER: Answer = {
  summary:
    'Yes — it is a volume problem. Pro closed-won count is down sharply while median ACV and discount rates are essentially unchanged, so the miss is fewer deals closing, not smaller or more heavily discounted deals.',
  pinSummary:
    'Volume problem: closed-won count down sharply while ACV and discounts stay stable.',
  findings: [
    {
      id: 'drill-vol-e1',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Pro median ACV stable QoQ; discount rate unchanged; closed-won count down sharply.',
      sourceIds: ['srcFinancePricing'],
    },
    {
      id: 'drill-vol-a1',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming Finance’s ACV series includes outbound and self-serve Pro the same way across quarters.',
      confidence: 'high',
      sourceIds: ['srcFinancePricing'],
    },
  ],
  nextCheck: 'Pull Pro stage conversion from SQL → closed-won for Q2 vs Q3 to see where volume leaks.',
};

export const CHURN_SMB_DRILLDOWN_ANSWER: Answer = {
  summary: 'No — SMB churn is flat. The Q3 increase is concentrated in Enterprise accounts.',
  pinSummary: 'SMB churn is flat — the Q3 rise is concentrated in Enterprise accounts.',
  findings: [
    {
      id: 'drill-smb-e1',
      kind: 'evidence',
      metricId: 'churn',
      text: 'SMB churn held steady at 2.8% through Q3.',
      sourceIds: ['srcSfdcChurn'],
    },
    {
      id: 'drill-smb-a1',
      kind: 'assumption',
      metricId: 'churn',
      text: "Assuming SMB renewal data for September is fully reconciled.",
      confidence: 'low',
      sourceIds: [],
    },
  ],
  nextCheck: 'Re-check SMB churn again after October close.',
};

/**
 * Rewritten insights after the user clarifies an attached assumption in chat.
 * Demo uses fixed copy for the seasonality clarification path.
 */
export function resolveClarificationAnswer(_clarification: string, findingId: string): Answer {
  const revisedSeasonality: Finding = {
    id: findingId === 'revenue-a2' ? 'revenue-a2' : findingId,
    kind: 'evidence',
    metricId: 'revenue',
    text: 'Prior Q3s show only mild ~2% YoY decreases — Pro has held steady in Q3 for several years, so seasonality does not explain this gap.',
    sourceIds: ['srcFinanceRevenue'],
    revised: true,
    revisedNote: 'Revised based on your feedback — upgraded from Assumption to Evidence.',
  };

  return {
    confidence: 'high',
    summary: [
      "Thanks for this clarification! I've rewritten the insights with the context that previous years have been consistent with only a mild 2% decreases YoY.",
      '---',
      '## The Q3 revenue dip is concentrated in one segment, not a broad decline',
      'Q3 came in at **$2.1M vs. $2.4M forecast, a 12% miss**. Year on year it is only **down 3%**[1]. Starter, Growth, and Pro self-serve have not dipped[2]. The entire drop traces to one place: **outbound-sourced Pro deals, down about 50%**[3].',
      '### How I got here',
      "1. Compared Pro sales QoQ (down 12%) with YoY (down 3%). Pro revenue has held steady in Q3 for the past several years, so seasonality doesn't explain the gap — this looks like a real shift, not a cyclical dip.\n2. Broke revenue down by tier. Only Pro moved, down 34%.\n3. Split Pro by channel and checked deal size. Volume is down, pricing is stable[4].",
      'We were able to diagnose the segment based on your tier and channel data.',
      '## Validation needed',
      "I was able to access the volume of outbound-sourced Pro deals but wasn't able to see the pipeline activity behind them. **Talk to Maya Chen in RevOps** and ask whether **outbound capacity dropped in Q3**, or whether **first meetings stopped converting** — that answer decides if this is a headcount problem or a conversion problem.",
    ].join('\n\n'),
    pinSummary:
      'Seasonality ruled out — Q3 miss is outbound Pro, not a cyclical dip.',
    findings: [
      {
        id: 'clarified-e1',
        kind: 'evidence',
        metricId: 'revenue',
        text: 'Q3 revenue was $2.1M versus a $2.4M forecast, a 12% miss that is only 3% below Q3 last year.',
        sourceIds: ['srcFinanceRevenue'],
      },
      {
        id: 'clarified-e2',
        kind: 'evidence',
        metricId: 'revenue',
        text: 'Starter and Growth tiers are roughly flat while Pro tier revenue is down about 34% QoQ, where the dip lives.',
        sourceIds: ['srcSfdcRenewals'],
      },
      {
        id: 'clarified-e3',
        kind: 'evidence',
        metricId: 'revenue',
        text: 'Within Pro, self-serve upgrades are flat while outbound-sourced new Pro deals nearly halved.',
        sourceIds: ['srcSlackRevOps', 'srcSfdcPipeline'],
      },
      {
        id: 'clarified-e4',
        kind: 'evidence',
        metricId: 'revenue',
        text: 'Pro closed-won count is down while median ACV and discount rate are stable, pointing to a volume problem not a value problem.',
        sourceIds: ['srcFinancePricing'],
      },
      revisedSeasonality,
      {
        id: 'clarified-a1',
        kind: 'assumption',
        metricId: 'revenue',
        text: 'Assuming self-serve vs outbound mix inside Pro did not shift enough to explain the outbound miss on its own.',
        confidence: 'medium',
        sourceIds: [],
      },
    ],
  };
}

const GENERIC_SOURCE_BY_METRIC: Record<MetricId, string> = {
  revenue: 'srcFinanceRevenue',
  grossMargin: 'srcFinanceMargin',
  churn: 'srcSfdcChurn',
  newArr: 'srcFinanceArr',
  activeCustomers: 'srcProductUsage',
};

export function genericAnswerFor(kpi: KpiDefinition): Answer {
  const prevPoint = kpi.series[kpi.series.length - 2];
  const direction = kpi.deltaPct >= 0 ? 'up' : 'down';
  const isGoodNews = kpi.deltaPct >= 0 === kpi.positiveIsGood;
  const readOut = isGoodNews ? 'a reasonable sign, worth confirming it holds' : 'worth a closer look';

  return {
    summary: `${kpi.title} is ${direction} ${Math.abs(kpi.deltaPct).toFixed(1)}% versus last period — ${readOut}.`,
    findings: [
      {
        id: `${kpi.id}-generic-e1`,
        kind: 'evidence',
        metricId: kpi.id,
        text: `${kpi.title} moved from ${formatMetricValue(prevPoint.value, kpi.unit)} to ${formatMetricValue(
          kpi.currentValue,
          kpi.unit,
        )} over the period.`,
        sourceIds: [GENERIC_SOURCE_BY_METRIC[kpi.id]],
      },
      {
        id: `${kpi.id}-generic-a1`,
        kind: 'assumption',
        metricId: kpi.id,
        text: `Assuming this period's figures are final and not still reconciling.`,
        confidence: 'medium',
        sourceIds: [],
      },
    ],
    nextCheck: `Pull a segment-level breakdown of ${kpi.title} for Q3.`,
  };
}

export function mergeGenericAnswers(kpis: KpiDefinition[]): Answer {
  const answers = kpis.map(genericAnswerFor);
  return {
    summary: answers.map((a) => a.summary).join(' '),
    findings: answers.flatMap((a) => a.findings),
    nextCheck: answers[answers.length - 1]?.nextCheck,
  };
}

export function genericDrillDownAnswer(question: string, metricId: MetricId): Answer {
  const kpi = getKpi(metricId);
  return {
    summary: `Early read: ${question.replace(/\?$/, '').toLowerCase()} looks concentrated in one segment, but one more cut would confirm it.`,
    findings: [
      {
        id: `${kpi.id}-drill-generic-e1`,
        kind: 'evidence',
        metricId,
        text: `${kpi.title} moves are not uniform across regions in the underlying data.`,
        sourceIds: [GENERIC_SOURCE_BY_METRIC[kpi.id]],
      },
      {
        id: `${kpi.id}-drill-generic-a1`,
        kind: 'assumption',
        metricId,
        text: 'Assuming regional splits are tagged consistently in the source system.',
        confidence: 'low',
        sourceIds: [],
      },
    ],
    nextCheck: `Re-run this with a regional breakdown for ${kpi.title}.`,
  };
}

// ---------------------------------------------------------------------------
// Resolution helpers
// ---------------------------------------------------------------------------

const METRIC_KEYWORDS: Record<MetricId, RegExp> = {
  revenue: /revenue/i,
  churn: /churn/i,
  grossMargin: /margin/i,
  newArr: /\barr\b|bookings?/i,
  activeCustomers: /active customers|customer count|seats?/i,
};

/**
 * Mimics the agent scoping a question to the attached context that's actually
 * relevant, rather than requiring the user to manually detach unrelated charts.
 * If the question names specific attached metrics, only those are used; otherwise
 * everything attached is treated as in scope.
 */
export function determineUsedContext(question: string, contextIds: ContextId[]): MetricId[] {
  const metricIds = [...new Set(contextIds.filter(isMetricId))];
  if (metricIds.length <= 1) return metricIds;
  const mentioned = metricIds.filter((id) => METRIC_KEYWORDS[id].test(question));
  if (mentioned.length > 0 && mentioned.length < metricIds.length) return mentioned;
  return metricIds;
}

export function resolveAnswer(contextIds: MetricId[]): Answer {
  if (contextIds.length === 0) return REVENUE_DIP_ANSWER;
  const set = new Set(contextIds);
  if (set.has('revenue') && set.has('churn')) return REVENUE_CHURN_COMBINED_ANSWER;
  if (set.size === 1 && set.has('revenue')) return REVENUE_DIP_ANSWER;
  if (set.size === 1 && set.has('churn')) return CHURN_SOLO_ANSWER;
  return mergeGenericAnswers(contextIds.map(getKpi));
}

export function resolveDrillDown(question: string, parentMetricId: MetricId): Answer {
  if (parentMetricId === 'revenue' && /volume|deal count|deal size|value problem/i.test(question)) {
    return PRO_VOLUME_DRILLDOWN_ANSWER;
  }
  if (parentMetricId === 'revenue' && /outbound|capacity|conversion|pro/i.test(question)) {
    return PRO_OUTBOUND_DRILLDOWN_ANSWER;
  }
  if (parentMetricId === 'churn' && /smb/i.test(question)) return CHURN_SMB_DRILLDOWN_ANSWER;
  return genericDrillDownAnswer(question, parentMetricId);
}
