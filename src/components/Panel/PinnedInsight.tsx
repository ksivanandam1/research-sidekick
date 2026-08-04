import { useState } from 'react';
import { ChevronDown, ChevronUp, Pin } from 'lucide-react';

interface PinnedInsightProps {
  headline: string;
  pinSummary?: string;
  expandDetail?: string | null;
}

export function PinnedInsight({ headline, pinSummary, expandDetail }: PinnedInsightProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !!(expandDetail && expandDetail.trim());

  return (
    <div className="rounded-xl border border-border-soft bg-surface-soft">
      <button
        type="button"
        onClick={() => canExpand && setExpanded((e) => !e)}
        disabled={!canExpand}
        className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface disabled:hover:bg-transparent"
      >
        <Pin size={12} className="mt-1 shrink-0 text-ink-faint" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-ink">{headline}</p>
          {pinSummary ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{pinSummary}</p>
          ) : null}
          {expanded && expandDetail ? (
            <p className="mt-2 border-t border-border-soft pt-2 text-xs leading-relaxed text-ink-soft">
              {expandDetail}
            </p>
          ) : null}
        </div>
        {canExpand ? (
          expanded ? (
            <ChevronUp size={14} className="mt-0.5 shrink-0 text-ink-faint" />
          ) : (
            <ChevronDown size={14} className="mt-0.5 shrink-0 text-ink-faint" />
          )
        ) : null}
      </button>
    </div>
  );
}
