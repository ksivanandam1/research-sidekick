import { Archive } from 'lucide-react';
import type { ConversationTurn } from '../../types';
import { deriveStepLabel } from '../../utils/investigationSteps';

interface CompactInvestigationStepProps {
  turn: ConversationTurn;
  stepNumber: number;
}

export function CompactInvestigationStep({ turn, stepNumber }: CompactInvestigationStepProps) {
  const label = deriveStepLabel(turn);

  return (
    <div
      className={`rounded-xl border border-border-soft px-3 py-2.5 ${
        turn.archived ? 'bg-surface-soft opacity-75' : 'bg-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Step {stepNumber}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-ink-soft">{label}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-faint">{turn.question}</p>
        </div>
        {turn.archived && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
            <Archive size={10} />
            Superseded
          </span>
        )}
      </div>
    </div>
  );
}
