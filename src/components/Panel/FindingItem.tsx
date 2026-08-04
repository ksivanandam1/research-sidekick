import { useState } from 'react';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import type { Finding } from '../../types';
import { getKpi, getSource } from '../../data/mockData';
import { CitationChip } from './CitationChip';
import { SourcePreview } from './SourcePreview';

interface FindingItemProps {
  finding: Finding;
  showMetricTag: boolean;
  onInvestigate?: () => void;
}

export function FindingItem({ finding, showMetricTag, onInvestigate }: FindingItemProps) {
  const [openSourceIds, setOpenSourceIds] = useState<string[]>([]);

  function toggleSource(id: string) {
    setOpenSourceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  return (
    <div className="rounded-xl border border-border-soft bg-surface p-3">
      {showMetricTag && (
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[11px] font-medium text-ink-faint">{getKpi(finding.metricId).title}</span>
        </div>
      )}

      <p className="text-sm leading-relaxed text-ink">{finding.text}</p>

      {finding.sourceIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {finding.sourceIds.map((id) => (
            <CitationChip
              key={id}
              sourceId={id}
              isActive={openSourceIds.includes(id)}
              onClick={() => toggleSource(id)}
            />
          ))}
        </div>
      )}

      {openSourceIds.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {openSourceIds.map((id) => (
            <SourcePreview key={id} source={getSource(id)} />
          ))}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div>
          {finding.revised && finding.revisedNote && (
            <p className="inline-flex items-center gap-1 text-[11px] font-medium text-sage">
              <RefreshCcw size={11} />
              {finding.revisedNote}
            </p>
          )}
        </div>

        {finding.kind === 'unknown' && finding.investigateQuestion && onInvestigate && (
          <button
            type="button"
            onClick={onInvestigate}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border-soft px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
          >
            Investigate
            <ArrowRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}
