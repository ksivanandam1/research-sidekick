export const SUMMARISE_QUESTION =
  'Why did revenue dip in Q3, and where does the miss actually live by tier and channel?';
export const DRAFT_REPORT_QUESTION =
  'Draft an executive report summarising the key movements on this dashboard.';
export const UPDATE_DASHBOARD_QUESTION =
  'What should be updated on this dashboard based on the latest data?';

export const QUICK_ACTIONS = [
  { label: 'Draft report', question: DRAFT_REPORT_QUESTION },
  { label: 'Summarise highlights', question: SUMMARISE_QUESTION },
  { label: 'Set alert', question: UPDATE_DASHBOARD_QUESTION },
] as const;
