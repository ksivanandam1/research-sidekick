import { ExternalLink, Lock } from 'lucide-react';
import type { Source } from '../../types';
import { useResearch } from '../../state/ResearchContext';

const TYPE_LABEL: Record<Source['type'], string> = {
  financeDW: 'Finance data warehouse',
  crm: 'CRM',
  chat: 'Chat',
  doc: 'Document',
  product: 'Product analytics',
};

export function SourcePreview({ source }: { source: Source }) {
  const { showToast } = useResearch();

  if (source.restricted) {
    return (
      <div className="mt-2 rounded-xl border border-border-soft bg-surface-soft p-3">
        <div className="flex items-center gap-2">
          <Lock size={14} className="shrink-0 text-ink-faint" />
          <p className="text-xs font-semibold text-ink">{source.name}</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          You don't have access to this source, so its contents aren't shown here. Its existence is noted as
          supporting context for this finding.
        </p>
        <button
          type="button"
          onClick={() => showToast('Access request sent to the source owner.')}
          className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[11px] font-medium text-surface transition-opacity hover:opacity-90"
        >
          Request access
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-border-soft bg-surface-soft p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-ink">{source.name}</p>
        <span className="shrink-0 text-[11px] text-ink-faint">{source.timestamp}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-ink-faint">{TYPE_LABEL[source.type]}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{source.snippet}</p>
      {source.url && (
        <a
          href={source.url}
          onClick={(e) => e.preventDefault()}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-ocean hover:underline"
        >
          Open source
          <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}
