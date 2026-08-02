import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, CircleDashed, Loader2, OctagonX } from 'lucide-react';
import type { Answer, Stage } from '../../types';
import { buildThoughtSteps } from '../../data/mockData';

interface ThoughtTraceProps {
  answer: Answer;
  stage: Stage;
  revealedFindingIds: string[];
  stopped?: boolean;
}

type StepStatus = 'pending' | 'running' | 'complete' | 'stopped';

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === 'complete') return <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-sage" />;
  if (status === 'running') return <Loader2 size={13} className="mt-0.5 shrink-0 animate-spin text-ink-soft" />;
  if (status === 'stopped') return <OctagonX size={13} className="mt-0.5 shrink-0 text-terracotta" />;
  return <CircleDashed size={13} className="mt-0.5 shrink-0 text-ink-faint" />;
}

/**
 * A visible, step-by-step trace of what the agent actually checked, with real
 * source-query text instead of abstract stage labels — the "aha" moment where
 * the feature proves it isn't just a confident-sounding oracle. Collapses to a
 * one-line summary once ready, and stays expandable for later review.
 */
export function ThoughtTrace({ answer, stage, revealedFindingIds, stopped }: ThoughtTraceProps) {
  const steps = buildThoughtSteps(answer);
  const isReady = stage === 'ready';
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isReady) setExpanded(false);
  }, [isReady]);

  const firstUnrevealedIndex = steps.findIndex((s) => !revealedFindingIds.includes(s.findingId));
  const isRetrievalPhase = stage === 'retrieving' || stage === 'citing';

  const stepRows = steps.map((step, i) => {
    const revealed = revealedFindingIds.includes(step.findingId);
    let status: StepStatus = revealed ? 'complete' : 'pending';
    if (!revealed && i === firstUnrevealedIndex && isRetrievalPhase) {
      status = stopped ? 'stopped' : 'running';
    }
    return { id: step.id, text: step.text, status };
  });

  const analysingStatus: StepStatus =
    stage === 'analysing' ? (stopped ? 'stopped' : 'running') : 'complete';
  const draftingStatus: StepStatus =
    stage === 'ready'
      ? 'complete'
      : stage === 'drafting'
        ? stopped
          ? 'stopped'
          : 'running'
        : 'pending';

  const rows = [
    { id: 'analysing', text: 'Analysing your question', status: analysingStatus },
    ...stepRows,
    { id: 'drafting', text: 'Drafting the answer', status: draftingStatus },
  ];

  const completeCount = stepRows.filter((r) => r.status === 'complete').length;

  if (isReady && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
      >
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">
          <CheckCircle2 size={12} className="text-sage" />
          Checked {completeCount} source{completeCount === 1 ? '' : 's'} · view trace
        </span>
        <ChevronDown size={13} className="shrink-0 text-ink-faint" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border-soft bg-surface-soft p-2.5">
      {isReady && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex items-center justify-between gap-2 pb-1 text-left"
        >
          <span className="text-[11px] font-medium text-ink-faint">What the agent checked</span>
          <ChevronUp size={13} className="shrink-0 text-ink-faint" />
        </button>
      )}
      {rows.map((row) => (
        <div key={row.id} className="flex items-start gap-1.5">
          <StatusIcon status={row.status} />
          <p className={`text-xs leading-relaxed ${row.status === 'pending' ? 'text-ink-faint' : 'text-ink-soft'}`}>
            {row.text}
            {row.status === 'stopped' && (
              <span className="ml-1.5 text-[11px] font-medium text-terracotta">Stopped</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
