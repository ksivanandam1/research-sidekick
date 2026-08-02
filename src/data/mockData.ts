import type { Answer, ContextItem, Finding, KpiDefinition, MetricId, Source } from '../types';

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
    currentValue: 4.52,
    deltaPct: -6.4,
    positiveIsGood: true,
    chartType: 'sparkline',
    series: series([4.1, 4.22, 4.35, 4.48, 4.6, 4.83, 4.7, 4.4, 4.52]),
    anomaly: {
      label: 'Q3 dip',
      pointIndex: 7,
      suggestedQuestion: 'Why did revenue dip in Q3?',
    },
    scope: 'Revenue by region · Q1–Q3 2026',
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
    currentValue: 1842,
    deltaPct: 2.3,
    positiveIsGood: true,
    chartType: 'steppedLine',
    series: series([1700, 1720, 1745, 1760, 1780, 1800, 1815, 1828, 1842]),
    scope: 'Active customers · all regions · Q1–Q3 2026',
    suggestedQuestions: ['How is Active Customers trending this quarter?'],
  },
];

// ---------------------------------------------------------------------------
// Dashboard-level narrative — powers the Q3 read card's "Summarise" modal
// ---------------------------------------------------------------------------

export const DASHBOARD_NARRATIVE_TITLE = 'Q3 dashboard summary';

export const DASHBOARD_NARRATIVE: string[] = [
  "Revenue dipped 6.4% in Q3, driven mainly by a slowdown in APAC enterprise renewals — the renewal rate fell from 92% to 81%, and two enterprise deals worth ~$1.2M slipped from Q3 into Q4.",
  "Customer churn moved in the same direction, rising from 3.2% to 4.1% quarter-on-quarter. That increase is concentrated in Enterprise accounts (SMB churn held flat at 2.8%), and the top logged reason was budget/approval delays rather than product dissatisfaction — consistent with the renewal slowdown above.",
  "Gross margin compressed slightly, from 62.8% to 61.4%, overlapping a 12% promotional discount that ran on APAC Enterprise renewals from June through August.",
  "New ARR bookings fell 9.2% to $1.18M, which tracks with a quieter renewal and pipeline environment this quarter.",
  "Active Customers still grew 2.3% to 1,842, though — so the dip looks concentrated in one region and segment rather than a broad-based demand problem.",
];

export const DASHBOARD_NEXT_STEP =
  'Confirm the two delayed APAC deals close in Q4, and keep an eye on whether Enterprise churn in that same cohort continues into next quarter.';

export function getKpi(id: MetricId): KpiDefinition {
  const kpi = KPI_DEFINITIONS.find((k) => k.id === id);
  if (!kpi) throw new Error(`Unknown KPI: ${id}`);
  return kpi;
}

export function toContextItem(id: MetricId): ContextItem {
  const kpi = getKpi(id);
  return { id: kpi.id, title: kpi.title };
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
    name: 'Finance DW — Revenue by Region (Q3 close)',
    type: 'financeDW',
    timestamp: 'Updated Aug 1, 2026',
    snippet: 'APAC revenue: $1.02M in Q3 vs $1.24M in Q2 (−17.7% QoQ).',
    url: '#',
  },
  srcSfdcRenewals: {
    id: 'srcSfdcRenewals',
    name: 'Salesforce — Renewals Report Q3',
    type: 'crm',
    timestamp: 'Synced 6h ago',
    snippet: 'APAC enterprise renewal rate: 81% (Q3) vs 92% (Q2).',
    url: '#',
  },
  srcSfdcPipeline: {
    id: 'srcSfdcPipeline',
    name: 'Salesforce — Pipeline: Delayed Deals',
    type: 'crm',
    timestamp: 'Synced 6h ago',
    snippet: "2 enterprise opportunities (~$1.2M) marked 'delayed', pushed from Q3 to Q4.",
    url: '#',
  },
  srcSlackRevOps: {
    id: 'srcSlackRevOps',
    name: 'Slack — #revenue-ops (Jul 28)',
    type: 'chat',
    timestamp: 'Jul 28, 2026',
    snippet: '"Heads up — Acme Corp and Novarion both asked to push renewal to Q4, budget approval delays."',
    url: '#',
  },
  srcLegalContract: {
    id: 'srcLegalContract',
    name: 'Legal — Contract Amendment: Acme Corp',
    type: 'doc',
    timestamp: 'Jul 30, 2026',
    snippet: '',
    restricted: true,
  },
  srcFinancePricing: {
    id: 'srcFinancePricing',
    name: 'Finance DW — APAC Discount Program',
    type: 'financeDW',
    timestamp: 'Updated Jul 15, 2026',
    snippet: 'A 12% promotional discount ran in APAC for Enterprise renewals, Jun 1 – Aug 31.',
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
    snippet: 'New ARR booked: $1.18M in Q3, down from $1.30M in Q2.',
    url: '#',
  },
  srcProductUsage: {
    id: 'srcProductUsage',
    name: 'Product Analytics — Active Seats Q3',
    type: 'product',
    timestamp: 'Updated Jul 31, 2026',
    snippet: '1,842 active customers at end of Q3, up from 1,800 in Q2.',
    url: '#',
  },
};

export function getSource(id: string): Source {
  const source = SOURCES[id];
  if (!source) throw new Error(`Unknown source: ${id}`);
  return source;
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

export const REVENUE_DIP_ANSWER: Answer = {
  summary:
    'Revenue dipped mainly because APAC enterprise renewals slowed in Q3 — fewer renewals closed, and two large deals slipped to Q4.',
  findings: [
    {
      id: 'revenue-e1',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'APAC revenue fell 17.7% quarter-on-quarter in Q3.',
      sourceIds: ['srcFinanceRevenue'],
    },
    {
      id: 'revenue-e2',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'APAC enterprise renewal rate dropped from 92% to 81%.',
      sourceIds: ['srcSfdcRenewals'],
    },
    {
      id: 'revenue-e3',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Two enterprise accounts delayed contracts worth ~$1.2M to Q4.',
      sourceIds: ['srcSfdcPipeline', 'srcSlackRevOps', 'srcLegalContract'],
    },
    {
      id: 'revenue-a1',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming no material pricing changes affected APAC in Q3.',
      confidence: 'medium',
      sourceIds: [],
    },
    {
      id: 'revenue-a2',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming the two delayed contracts would have closed within Q3 absent the delay.',
      confidence: 'low',
      sourceIds: [],
    },
    {
      id: 'revenue-u1',
      kind: 'unknown',
      metricId: 'revenue',
      text: 'Why did the renewal rate drop specifically in APAC and not other regions?',
      sourceIds: [],
      investigateQuestion: 'Why did the renewal rate drop specifically in APAC?',
    },
    {
      id: 'revenue-u2',
      kind: 'unknown',
      metricId: 'revenue',
      text: 'Whether the EMEA pricing promotion had a knock-on effect on APAC deals.',
      sourceIds: [],
    },
  ],
  nextCheck: 'Confirm with Finance Ops whether APAC discounting is planned to continue into Q4.',
};

export const CHURN_SOLO_ANSWER: Answer = {
  summary:
    'Churn rose mainly in APAC enterprise accounts, largely for budget and approval reasons rather than product dissatisfaction.',
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
  summary:
    'Partly. Higher APAC churn explains some of the Q3 revenue dip, but delayed — not lost — enterprise deals are the bigger factor.',
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
      text: "Two of the three at-risk accounts are marked 'delayed', not 'churned', in the CRM.",
      sourceIds: ['srcSfdcPipeline'],
    },
    {
      id: 'combined-a1',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming delayed deals in the CRM will still close in Q4.',
      confidence: 'medium',
      sourceIds: [],
    },
    {
      id: 'combined-u1',
      kind: 'unknown',
      metricId: 'churn',
      text: 'Whether elevated churn is concentrated in the same APAC accounts driving the revenue dip, or a separate SMB trend.',
      sourceIds: [],
      investigateQuestion: 'Is churn concentrated in the same APAC accounts, or separate?',
    },
  ],
  nextCheck: 'Segment churned accounts by region to see if APAC and SMB churn are the same story.',
};

export const APAC_RENEWAL_DRILLDOWN_ANSWER: Answer = {
  summary:
    'APAC renewals slowed mostly among enterprise accounts citing budget approval delays, not product dissatisfaction.',
  findings: [
    {
      id: 'drill-apac-e1',
      kind: 'evidence',
      metricId: 'revenue',
      text: "44% of delayed APAC accounts cited 'pricing/budget' as the primary reason.",
      sourceIds: ['srcSfdcChurn'],
    },
    {
      id: 'drill-apac-e2',
      kind: 'evidence',
      metricId: 'revenue',
      text: 'Slack thread confirms two large accounts cited internal budget approval delays, not product issues.',
      sourceIds: ['srcSlackRevOps'],
    },
    {
      id: 'drill-apac-a1',
      kind: 'assumption',
      metricId: 'revenue',
      text: 'Assuming budget approval delays are temporary and not a signal of reduced APAC demand.',
      confidence: 'medium',
      sourceIds: [],
    },
    {
      id: 'drill-apac-u1',
      kind: 'unknown',
      metricId: 'revenue',
      text: "Whether APAC's fiscal year-end (March) is creating a recurring Q3 approval bottleneck.",
      sourceIds: [],
    },
  ],
  nextCheck: "Check APAC renewal timing against APAC customers' own fiscal year-ends.",
};

export const CHURN_SMB_DRILLDOWN_ANSWER: Answer = {
  summary: 'No — SMB churn is flat. The Q3 increase is concentrated in Enterprise accounts.',
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
  text: 'APAC ran a 12% promotional discount on Enterprise renewals from Jun–Aug, overlapping the Q3 dip.',
  confidence: undefined,
  sourceIds: ['srcFinancePricing'],
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
export function determineUsedContext(question: string, contextIds: MetricId[]): MetricId[] {
  if (contextIds.length <= 1) return contextIds;
  const mentioned = contextIds.filter((id) => METRIC_KEYWORDS[id].test(question));
  if (mentioned.length > 0 && mentioned.length < contextIds.length) return mentioned;
  return contextIds;
}

export function resolveAnswer(contextIds: MetricId[]): Answer {
  const set = new Set(contextIds);
  if (set.has('revenue') && set.has('churn')) return REVENUE_CHURN_COMBINED_ANSWER;
  if (set.size === 1 && set.has('revenue')) return REVENUE_DIP_ANSWER;
  if (set.size === 1 && set.has('churn')) return CHURN_SOLO_ANSWER;
  return mergeGenericAnswers(contextIds.map(getKpi));
}

export function resolveDrillDown(question: string, parentMetricId: MetricId): Answer {
  if (parentMetricId === 'revenue' && /apac/i.test(question)) return APAC_RENEWAL_DRILLDOWN_ANSWER;
  if (parentMetricId === 'churn' && /smb/i.test(question)) return CHURN_SMB_DRILLDOWN_ANSWER;
  return genericDrillDownAnswer(question, parentMetricId);
}
