import { ChevronRight } from 'lucide-react';
import type { InvestigationStep } from '../../utils/investigationSteps';

const KIND_LABEL: Record<InvestigationStep['kind'], string> = {
  question: 'Question',
  clarifying: 'Clarify',
  analysis: 'Analysis',
  revision: 'Updated',
  archived: 'Archived',
};

interface InvestigationTrailProps {
  steps: InvestigationStep[];
}

export function InvestigationTrail({ steps }: InvestigationTrailProps) {
  if (steps.length < 2) return null;

  return (
    <div className="rounded-xl border border-border-soft bg-surface-soft px-3 py-2.5">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Investigation trail
      </p>
      <ol className="flex flex-wrap items-center gap-1">
        {steps.map((step, index) => (
          <li key={step.id} className="flex min-w-0 items-center gap-1">
            {index > 0 && (
              <ChevronRight size={12} className="shrink-0 text-ink-faint" aria-hidden />
            )}
            <span
              className={`inline-flex max-w-[9.5rem] items-center gap-1 rounded-full border px-2 py-0.5 ${
                step.isLatest
                  ? 'border-sage/30 bg-sage-soft/60 text-ink'
                  : step.kind === 'archived'
                    ? 'border-border-soft bg-surface text-ink-faint'
                    : 'border-border-soft bg-surface text-ink-soft'
              }`}
              title={step.label}
            >
              <span className="text-[9px] font-semibold uppercase tracking-wide text-ink-faint">
                {KIND_LABEL[step.kind]}
              </span>
              <span className="truncate text-[11px] font-medium">{step.label}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
