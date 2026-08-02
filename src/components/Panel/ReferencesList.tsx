import { useState } from 'react';
import { Lock } from 'lucide-react';
import type { Answer } from '../../types';
import { getAllSourcesForAnswer } from '../../data/mockData';
import { SourcePreview } from './SourcePreview';

/**
 * Sources considered while building an answer. Restricted sources stay listed
 * so the user knows what was considered but couldn't be shown.
 */
export function ReferencesList({ answer }: { answer: Answer }) {
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);
  const sources = getAllSourcesForAnswer(answer);
  const restrictedCount = sources.filter((s) => s.restricted).length;

  if (sources.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="px-0.5 text-[11px] font-medium text-ink-faint">
        {sources.length} source{sources.length === 1 ? '' : 's'} considered
        {restrictedCount > 0 && (
          <span className="ml-1.5 inline-flex items-center gap-0.5">
            <Lock size={10} />
            {restrictedCount} restricted
          </span>
        )}
      </p>
      <div className="flex flex-col gap-0.5">
        {sources.map((source) => (
          <div key={source.id}>
            <button
              type="button"
              onClick={() => setOpenSourceId(openSourceId === source.id ? null : source.id)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-soft"
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
    </div>
  );
}
