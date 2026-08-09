import { useState } from 'react';
import { ChartNoAxesColumn, X } from 'lucide-react';
import { DASHBOARD_INSIGHTS_PROMPT } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';

export function InvestigationEmptyState() {
  const { submitQuestion } = useResearch();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-8 text-center">
      {!dismissed && (
        <div className="flex w-full max-w-[220px] flex-col items-end gap-6">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            title="Dismiss suggestion"
            aria-label="Dismiss suggestion"
            className="flex h-6 w-6 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-soft hover:text-ink-soft"
          >
            <X size={13} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => submitQuestion(DASHBOARD_INSIGHTS_PROMPT)}
            className="w-full -rotate-3 overflow-hidden rounded-xl border border-border-soft bg-surface text-left shadow-soft transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:-rotate-2 hover:shadow-soft-lg"
          >
            <div className="flex items-center gap-2 bg-composer-chip px-2 py-1.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white">
                <ChartNoAxesColumn size={12} strokeWidth={2} className="text-ink" />
              </div>
              <p className="truncate text-xs font-semibold leading-tight text-ink">
                Company performance
              </p>
            </div>
            <div className="bg-surface-soft px-3 py-2.5">
              <p className="text-xs leading-snug text-ink-soft">{DASHBOARD_INSIGHTS_PROMPT}</p>
            </div>
          </button>
        </div>
      )}

      <div className="mt-4 flex max-w-[240px] flex-col gap-1">
        <p className="text-sm font-medium text-ink-soft">Select a chart to investigate</p>
        <p className="text-xs leading-relaxed text-ink-faint">
          Click + on any metric in the dashboard to add to chat
        </p>
      </div>
    </div>
  );
}
