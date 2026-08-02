import { useState } from 'react';
import { Share2, Wand2 } from 'lucide-react';
import { KPI_DEFINITIONS } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { KpiCard } from './KpiCard';
import { DashboardSummaryModal } from './DashboardSummaryModal';

const DASHBOARD_SHARE_TEASER =
  'Q3 dashboard: Revenue and churn both moved in Q3, largely tied to a slowdown in APAC enterprise renewals. See the Insights Canvas for the full picture.';

export function InsightsCanvas() {
  const { attachedContext, addContext, showToast } = useResearch();
  const [summaryOpen, setSummaryOpen] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(DASHBOARD_SHARE_TEASER);
    } catch {
      // Clipboard access may be unavailable in some environments — still confirm the share flow completed.
    }
    showToast('Copied — ready to share.');
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Insights Canvas</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Click <span className="font-medium text-ink">Add to chat</span> on any card to bring it into the
            research panel — attach more than one to ask questions that span them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            title="Copy a shareable summary"
            className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-soft px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
          >
            <Share2 size={13} />
            Share
          </button>
          <button
            type="button"
            onClick={() => setSummaryOpen(true)}
            title="Generate an AI summary of this dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-surface transition-opacity hover:opacity-90"
          >
            <Wand2 size={13} />
            Summarise
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {KPI_DEFINITIONS.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            isAttached={attachedContext.includes(kpi.id)}
            onAddToChat={() => addContext(kpi.id)}
            onAskAboutAnomaly={() =>
              kpi.anomaly && addContext(kpi.id, { prefill: kpi.anomaly.suggestedQuestion })
            }
          />
        ))}
      </div>

      {summaryOpen && <DashboardSummaryModal onClose={() => setSummaryOpen(false)} />}
    </div>
  );
}
