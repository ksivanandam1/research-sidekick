import { useState } from 'react';
import { Archive, ChevronRight } from 'lucide-react';
import type { ConversationTurn } from '../../types';
import { deriveStepLabel } from '../../utils/investigationSteps';
import { ConversationTurnCard } from './ConversationTurnCard';

interface CompactInvestigationStepProps {
  turn: ConversationTurn;
  stepNumber: number;
}

export function CompactInvestigationStep({ turn, stepNumber }: CompactInvestigationStepProps) {
  const [expanded, setExpanded] = useState(false);
  const label = deriveStepLabel(turn);

  return (
    <div
      className={`rounded-xl border border-border-soft ${
        turn.archived ? 'bg-surface-soft' : 'bg-surface'
      } ${turn.archived && !expanded ? 'opacity-75' : ''}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface-soft/80"
      >
        <ChevronRight
          size={14}
          strokeWidth={2.25}
          className={`mt-0.5 shrink-0 text-ink-faint transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-wide text-ink-faint">
            Version {stepNumber}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-ink-soft">{label}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-faint">{turn.question}</p>
        </div>
        {turn.archived && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
            <Archive size={10} />
            Archive
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-border-soft px-3 pb-4 pt-3">
          <ConversationTurnCard turn={turn} isLatest={false} />
        </div>
      )}
    </div>
  );
}
