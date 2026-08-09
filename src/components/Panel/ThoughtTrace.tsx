import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, CircleDashed, OctagonX } from 'lucide-react';
import type { Answer, Stage } from '../../types';
import { buildPipelineThoughtSteps } from '../../data/mockData';
import { getStepStatusForThoughtTrace } from '../../utils/thoughtTraceTitle';
import { MoonLoader } from './MoonLoader';

interface ThoughtTraceProps {
  stage: Stage;
  answer: Answer;
  stopped?: boolean;
}

type StepStatus = 'pending' | 'running' | 'complete' | 'stopped';

function getStepStatus(stepStage: Stage, currentStage: Stage, stopped?: boolean): StepStatus {
  return getStepStatusForThoughtTrace(stepStage, currentStage, stopped);
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === 'complete') return <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sage" />;
  if (status === 'running') return <MoonLoader size={14} className="mt-0.5 shrink-0" />;
  if (status === 'stopped') return <OctagonX size={14} className="mt-0.5 shrink-0 text-terracotta" />;
  return <CircleDashed size={14} className="mt-0.5 shrink-0 text-ink-faint" />;
}

function ThoughtStepRow({
  label,
  detail,
  status,
}: {
  label: string;
  detail: string;
  status: StepStatus;
}) {
  const showDetail = status !== 'pending';

  return (
    <div className="flex items-start gap-2 py-0.5">
      <StatusIcon status={status} />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-relaxed ${
            status === 'running'
              ? 'thought-shimmer-text font-medium'
              : status === 'pending'
                ? 'font-medium text-ink-faint'
                : status === 'stopped'
                  ? 'font-medium text-ink-soft'
                  : 'font-medium text-ink-soft'
          }`}
        >
          {label}
          {status === 'stopped' && (
            <span className="ml-1.5 text-sm font-medium text-terracotta">Stopped</span>
          )}
        </p>
        {showDetail && detail && (
          <p
            className={`mt-0.5 text-sm leading-relaxed ${
              status === 'running' ? 'text-ink-faint' : 'text-ink-faint'
            }`}
          >
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Collapsed by default. While the agent is working, the collapsed header shows
 * the active step label (shimmering). Expandable for the full trace with concrete
 * detail subtext under each stage label (Claude-style).
 */
export function ThoughtTrace({ stage, answer, stopped }: ThoughtTraceProps) {
  const isReady = stage === 'ready';
  const [expanded, setExpanded] = useState(false);

  const pipelineSteps = useMemo(() => buildPipelineThoughtSteps(answer), [answer]);
  const performedActionsLabel = `Performed ${pipelineSteps.length} actions`;

  const rows = pipelineSteps.map((step) => ({
    ...step,
    status: getStepStatus(step.stage, stage, stopped),
  }));

  const activeRow =
    rows.find((r) => r.status === 'running') ??
    [...rows].reverse().find((r) => r.status === 'complete') ??
    rows[0];

  const visibleRows = isReady ? rows : rows.filter((row) => row.status !== 'pending');

  if (!expanded) {
    if (!isReady) {
      return (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex max-w-full items-center gap-1 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
        >
          <MoonLoader size={14} className="shrink-0" />
          <span key={activeRow.id} className="thought-shimmer-text truncate text-sm font-medium">
            {activeRow.label}
          </span>
          <ChevronRight size={13} className="shrink-0 text-ink-faint" />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex max-w-full items-center gap-1 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
      >
        <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-ink-faint">
          <span className="truncate">{performedActionsLabel}</span>
        </span>
        <ChevronRight size={13} className="shrink-0 text-ink-faint" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="inline-flex max-w-full items-center gap-1 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
      >
        {isReady ? (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-ink-faint">
            <span className="truncate">{performedActionsLabel}</span>
          </span>
        ) : (
          <>
            <MoonLoader size={14} className="shrink-0" />
            <span key={activeRow.id} className="thought-shimmer-text truncate text-sm font-medium">
              {activeRow.label}
            </span>
          </>
        )}
        <ChevronDown size={13} className="shrink-0 text-ink-faint" />
      </button>
      <div className="flex flex-col gap-1.5 border-l border-border-soft pl-3">
        {visibleRows.map((row) => (
          <ThoughtStepRow
            key={row.id}
            label={row.label}
            detail={row.detail}
            status={row.status}
          />
        ))}
      </div>
    </div>
  );
}
