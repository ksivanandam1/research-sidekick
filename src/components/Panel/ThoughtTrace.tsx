import { useState } from 'react';
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
 * Collapsed by default. While the agent is working, the collapsed header shows
 * each step's short title in sequence (shimmering). Expandable for the full
 * "found …" detail lines.
 */
export function ThoughtTrace({ answer, stage, revealedFindingIds, stopped }: ThoughtTraceProps) {
  const steps = buildThoughtSteps(answer);
  const isReady = stage === 'ready';
  const [expanded, setExpanded] = useState(false);

  const firstUnrevealedIndex = steps.findIndex((s) => !revealedFindingIds.includes(s.findingId));
  const isRetrievalPhase = stage === 'retrieving' || stage === 'citing';

  const stepRows = steps.map((step, i) => {
    const revealed = revealedFindingIds.includes(step.findingId);
    let status: StepStatus = revealed ? 'complete' : 'pending';
    if (!revealed && i === firstUnrevealedIndex && isRetrievalPhase) {
      status = stopped ? 'stopped' : 'running';
    }
    return {
      id: step.id,
      text: step.text,
      shortText: step.shortText,
      status,
    };
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
    {
      id: 'analysing',
      text: 'Analysing your question',
      shortText: 'Analysing your question',
      status: analysingStatus,
    },
    ...stepRows,
    {
      id: 'drafting',
      text: 'Drafting the answer',
      shortText: 'Drafting the answer',
      status: draftingStatus,
    },
  ];

  const completeCount = stepRows.filter((r) => r.status === 'complete').length;
  const activeRow =
    rows.find((r) => r.status === 'running') ??
    [...rows].reverse().find((r) => r.status === 'complete') ??
    rows[0];

  if (!expanded) {
    if (!isReady) {
      return (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Loader2 size={12} className="shrink-0 animate-spin text-ink-soft" />
            <span key={activeRow.id} className="thought-shimmer-text truncate text-[11px] font-medium">
              {activeRow.shortText}
            </span>
          </span>
          <ChevronDown size={13} className="shrink-0 text-ink-faint" />
        </button>
      );
    }

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
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="flex items-center justify-between gap-2 pb-1 text-left"
      >
        <span className="text-[11px] font-medium text-ink-faint">
          {isReady ? 'What the agent checked' : 'Thinking…'}
        </span>
        <ChevronUp size={13} className="shrink-0 text-ink-faint" />
      </button>
      {rows.map((row) => (
        <div key={row.id} className="flex items-start gap-1.5">
          <StatusIcon status={row.status} />
          <p
            className={`text-xs leading-relaxed ${
              row.status === 'running'
                ? 'thought-shimmer-text font-medium'
                : row.status === 'pending'
                  ? 'text-ink-faint'
                  : 'text-ink-soft'
            }`}
          >
            {row.status === 'running' ? row.shortText : row.text}
            {row.status === 'stopped' && (
              <span className="ml-1.5 text-[11px] font-medium text-terracotta">Stopped</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
