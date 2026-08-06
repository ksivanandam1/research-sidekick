import { ExternalLink, Folder, Lock } from 'lucide-react';
import type { Source } from '../../types';
import { useResearch } from '../../state/ResearchContext';
import { SourceIcon, SOURCE_PLATFORM, hidesExcerptSummary } from './SourceIcon';

export function SourcePreview({ source }: { source: Source }) {
  const { showToast } = useResearch();
  const excerpt = source.excerpts[0];
  const showExcerpt = Boolean(excerpt) && !hidesExcerptSummary(source.type);

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
      <div className="flex items-start gap-2">
        <SourceIcon type={source.type} size={16} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-ink">{source.name}</p>
            <span className="shrink-0 text-[11px] text-ink-faint">{source.timestamp}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-ink-faint">{SOURCE_PLATFORM[source.type]}</p>
          {(source.author || source.workspace) && (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-ink-faint">
              {source.author && <span>{source.author}</span>}
              {source.author && source.workspace && <span aria-hidden>•</span>}
              {source.workspace && (
                <span className="inline-flex items-center gap-1">
                  <Folder size={11} />
                  {source.workspace}
                </span>
              )}
            </p>
          )}
          {showExcerpt && <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{excerpt}</p>}
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
      </div>
    </div>
  );
}
