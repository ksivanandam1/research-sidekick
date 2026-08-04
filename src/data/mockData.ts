import type {
  Answer,
  ClarifyingRound,
  ContextId,
  ContextItem,
  DimensionId,
  Finding,
  KpiDefinition,
  MetricId,
  Source,
  SourceType,
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

export function getContextItem(id: ContextId): ContextItem & { suggestedQuestions: string[] } {
  if (isMetricId(id)) {
    const kpi = getKpi(id);
    return { id, title: kpi.title, suggestedQuestions: kpi.suggestedQuestions };
  }
  const dim = getDimension(id);
  return { id, title: dim.title, suggestedQuestions: dim.suggestedQuestions };
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
    name: 'Finance DW — Subscription Revenue vs Plan (Q3 close)',
    type: 'financeDW',
    timestamp: 'Updated Aug 1, 2026',
    snippet: 'Q3 revenue $2.1M vs $2.4M forecast (−12%). QoQ −12%; vs Q3 last year −3%.',
    url: '#',
  },
  srcSfdcRenewals: {
    id: 'srcSfdcRenewals',
    name: 'Salesforce — Revenue by Tier (Starter / Growth / Pro)',
    type: 'crm',
    timestamp: 'Synced 6h ago',
    snippet: 'Starter and Growth roughly flat QoQ. Pro tier revenue −34% QoQ.',
    url: '#',
  },
  srcSfdcPipeline: {
    id: 'srcSfdcPipeline',
    name: 'Salesforce — Pro Pipeline by Channel',
    type: 'crm',
    timestamp: 'Synced 6h ago',
    snippet: 'Pro self-serve upgrades flat. Outbound-sourced new Pro deals nearly halved QoQ.',
    url: '#',
  },
  srcSlackRevOps: {
    id: 'srcSlackRevOps',
    name: 'Slack — #revenue-ops (Jul 28)',
    type: 'chat',
    timestamp: 'Jul 28, 2026',
    snippet:
      '"Outbound coverage on larger retail chains is thin this quarter — fewer Pro first meetings converting."',
    url: '#',
  },
  srcLegalContract: {
    id: 'srcLegalContract',
    name: 'Legal — Outbound deal desk notes (restricted)',
    type: 'doc',
    timestamp: 'Jul 30, 2026',
    snippet: '',
    restricted: true,
  },
  srcFinancePricing: {
    id: 'srcFinancePricing',
    name: 'Finance DW — Pro Deal Size & Discounting',
    type: 'financeDW',
    timestamp: 'Updated Jul 15, 2026',
    snippet: 'Pro median ACV stable QoQ; discount rate unchanged. Closed-won count down sharply.',
    url: '#',
  },
  srcSfdcChurn: {
    id: 'srcSfdcChurn',
    name: 'Salesforce — Churn Reasons Q3',
    type: 'crm',
    timestamp: 'Synced 6h ago',
    snippet: "Top reason logged: 'pricing/budget' (44%), 'competitor' (22%), 'other' (34%).",
    url: '#',
  },
  srcFinanceMargin: {
    id: 'srcFinanceMargin',
    name: 'Finance DW — Gross Margin Detail Q3',
    type: 'financeDW',
    timestamp: 'Updated Aug 1, 2026',
    snippet: 'Gross margin 61.4% in Q3, down from 62.8% in Q2.',
    url: '#',
  },
  srcFinanceArr: {
    id: 'srcFinanceArr',
    name: 'Finance DW — New ARR Bookings Q3',
    type: 'financeDW',
    timestamp: 'Updated Aug 1, 2026',
    snippet: 'New ARR booked: $1.18M in Q3, down from $1.30M in Q2 — Pro outbound weighted.',
    url: '#',
  },
  srcProductUsage: {
    id: 'srcProductUsage',
    name: 'Product Analytics — Active Subscribers Q3',
    type: 'product',
    timestamp: 'Updated Jul 31, 2026',
    snippet: '~2,200 active customers on Starter / Growth / Pro at end of Q3.',
    url: '#',
  },
};

export function getSource(id: string): Source {
  const source = SOURCES[id];
  if (!source) throw new Error(`Unknown source: ${id}`);
  return source;
}

const QUERY_VERB: Record<SourceType, string> = {
  financeDW: 'Queried the Finance data warehouse',
  crm: 'Queried Salesforce',
  chat: 'Checked Slack',
  doc: 'Checked internal documents',
  product: 'Queried product analytics',
};

/**
 * Turns the evidence in an answer into a concrete "what did the agent check"
 * trace — e.g. "Queried Salesforce — found APAC renewal rate dropped to 81%" —
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
  return /revenue|dip|miss|forecast|tier|channel|summarise|summarize|q3/i.test(question);
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
        prompt: 'Any changes to the outbound team in Q3 — territories, quotas, headcount?',
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
    '## The Q3 revenue dip is concentrated in one segment, not a broad decline',
    'Q3 came in at **$2.1M vs. $2.4M forecast, a 12% miss**[1]. Year on year it is only **down 3%**[1]. The entire drop traces to one place: **outbound-sourced Pro deals, down about 50%**[3]. Starter, Growth, and Pro self-serve have not dipped[2].',
    '### How I got here',
    '1. Compared Pro sales QoQ (down 12%) with YoY (down 3%). The gap suggests partial seasonality[1].\n2. Broke revenue down by tier. Only Pro moved, down 34%[2].\n3. Split Pro by channel and checked deal size. Volume is down, pricing is stable[3][4].',
    'We were able to diagnose the segment based on your tier and channel data.',
    '### Validation needed',
    [
      '>>> CRM activity data for the outbound team',
      "I have closed-won deals — the outcomes — but I don't have the pipeline activity behind them: calls made, meetings booked, opportunities created, stage-by-stage conversion, or sales cycle length for Q2 vs. Q3 to further analyse why Pro sales are below target.",
    ].join('\n'),
  ].join('\n\n'),
  pinSummary:
    'Q3 missed forecast by 12%, but the drop is outbound Pro — not a broad decline across tiers.',
  chart: {
    title: 'Pro revenue by acquisition channel',
    subtitle: 'Q3 actual vs Q2 prior — click a channel to focus',
    actualLabel: 'Q3',
    priorLabel: 'Q2',
    defaultSelectedIndex: 1,
    series: [
      { label: 'Self-serve upgrade', actual: 0.42, prior: 0.43 },
      { label: 'Outbound sales', actual: 0.28, prior: 0.55 },
      { label: 'Partner-assisted', actual: 0.2, prior: 0.21 },
    ],
  },
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
      sourceIds: ['srcSfdcPipeline', 'srcSlackRevOps', 'srcLegalContract'],
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
      text: 'Assuming Products A/B/C mix inside Pro did not shift enough to explain the outbound miss on its own.',
      confidence: 'medium',
      sourceIds: [],
    },
    {
      id: 'revenue-a2',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming the mild −3% YoY decline partly reflects seasonality in mid-market retail buying cycles.',
      confidence: 'medium',
      sourceIds: ['srcFinanceRevenue'],
    },
    {
      id: 'revenue-u1',
      kind: 'unknown',
      metricId: 'revenue',
      text: 'Is outbound capacity (reps, meetings, coverage) down, or is conversion from first meeting to close weaker?',
      sourceIds: [],
      investigateQuestion: 'Is the Pro outbound miss a capacity problem or a conversion problem?',
    },
    {
      id: 'revenue-u2',
      kind: 'unknown',
      metricId: 'revenue',
      text: 'Whether larger retail chains lengthened procurement cycles this quarter versus last year.',
      sourceIds: [],
      investigateQuestion: 'Did larger retail chains lengthen Pro procurement cycles in Q3?',
    },
  ],
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
    {
      id: 'churn-u1',
      kind: 'unknown',
      metricId: 'churn',
      text: 'Whether SMB churn is following the same pattern as Enterprise.',
      sourceIds: [],
      investigateQuestion: 'Is SMB churn following the same pattern?',
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
    {
      id: 'combined-u1',
      kind: 'unknown',
      metricId: 'churn',
      text: 'Whether churn is elevated inside Pro specifically, or concentrated in Starter/Growth.',
      sourceIds: [],
      investigateQuestion: 'Is Q3 churn concentrated in the Pro tier?',
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
    {
      id: 'drill-pro-u1',
      kind: 'unknown',
      metricId: 'revenue',
      text: 'Is outbound capacity (reps, meetings, coverage) down, or is conversion from first meeting to close weaker?',
      sourceIds: [],
      investigateQuestion: 'Is the Pro outbound miss a capacity problem or a conversion problem?',
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
    {
      id: 'drill-vol-u1',
      kind: 'unknown',
      metricId: 'revenue',
      text: 'Whether late-stage losses increased, or the top of funnel simply produced fewer Pro opportunities.',
      sourceIds: [],
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
    {
      id: 'drill-smb-u1',
      kind: 'unknown',
      metricId: 'churn',
      text: 'Whether SMB churn typically lags Enterprise churn by a quarter.',
      sourceIds: [],
    },
  ],
  nextCheck: 'Re-check SMB churn again after October close.',
};

/** Applied to `revenue-a1` when the user flags it as not holding. */
export const REVISED_PRICING_FINDING: Partial<Finding> = {
  kind: 'evidence',
  text: 'Product mix inside Pro is stable QoQ — the outbound miss is not explained by a shift away from higher-ACV products.',
  confidence: undefined,
  sourceIds: ['srcFinancePricing', 'srcSfdcPipeline'],
  revised: true,
  revisedNote: 'Revised based on your feedback — upgraded from Assumption to Evidence.',
};

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
      {
        id: `${kpi.id}-generic-u1`,
        kind: 'unknown',
        metricId: kpi.id,
        text: `What's driving the ${direction === 'up' ? 'increase' : 'decrease'} at a segment level.`,
        sourceIds: [],
        investigateQuestion: `What's driving the change in ${kpi.title}?`,
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
      {
        id: `${kpi.id}-drill-generic-u1`,
        kind: 'unknown',
        metricId,
        text: `Which specific region or segment is driving this.`,
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
  const metricIds = contextIds.filter(isMetricId);
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
