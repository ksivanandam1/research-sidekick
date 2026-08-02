import { useState } from 'react';
import { ChevronDown, ChevronUp, Library, Lock } from 'lucide-react';
import type { Answer } from '../../types';
import { getAllSourcesForAnswer } from '../../data/mockData';
import { SourcePreview } from './SourcePreview';

/**
 * The full set of sources considered while building an answer — distinct from
 * the inline per-claim citations, which only show sources actually cited next
 * to a specific finding. Restricted sources are listed, not hidden, so the
 * user always knows what was considered but couldn't be shown to them.
 */
export function ReferencesList({ answer }: { answer: Answer }) {
  const [expanded, setExpanded] = useState(false);
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);
  const sources = getAllSourcesForAnswer(answer);
  const restrictedCount = sources.filter((s) => s.restricted).length;

  if (sources.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-soft bg-surface-soft">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <Library size={13} className="text-ink-faint" />
          References · {sources.length} source{sources.length === 1 ? '' : 's'} considered
          {restrictedCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-ink-faint">
              <Lock size={10} />
              {restrictedCount} restricted
            </span>
          )}
        </span>
        {expanded ? <ChevronUp size={14} className="text-ink-faint" /> : <ChevronDown size={14} className="text-ink-faint" />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-1.5 border-t border-border-soft p-2.5 pt-2">
          {sources.map((source) => (
            <div key={source.id}>
              <button
                type="button"
                onClick={() => setOpenSourceId(openSourceId === source.id ? null : source.id)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface"
              >
                <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-ink">
                  {source.restricted ? (
                    <Lock size={11} className="shrink-0 text-ink-faint" />
                  ) : (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                  )}
                  <span className="truncate">{source.name}</span>
                </span>
                <span
                  className={`shrink-0 text-[10px] font-medium uppercase tracking-wide ${
                    source.restricted ? 'text-ink-faint' : 'text-sage'
                  }`}
                >
                  {source.restricted ? 'No access' : 'Available'}
                </span>
              </button>
              {openSourceId === source.id && (
                <div className="px-0.5">
                  <SourcePreview source={source} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
