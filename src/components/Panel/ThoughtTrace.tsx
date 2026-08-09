import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, CircleDashed, OctagonX } from 'lucide-react';
import type { Answer, ClarifyingRound, Stage, TurnPhase } from '../../types';
import { buildPipelineThoughtSteps } from '../../data/mockData';
import { getStepStatusForThoughtTrace } from '../../utils/thoughtTraceTitle';
import { ClarifyingHistory } from './ClarifyingQuestions';
import { MoonLoader } from './MoonLoader';

const EMPTY_ANSWER: Answer = { summary: '', findings: [] };

interface ThoughtTraceProps {
  stage: Stage;
  answer?: Answer;
  stopped?: boolean;
  clarifying?: ClarifyingRound;
  phase?: TurnPhase;
}

type StepStatus = 'pending' | 'running' | 'complete' | 'stopped';

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
  hideLabel = false,
  hideStatusIcon = false,
  children,
}: {
  label: string;
  detail?: string;
  status: StepStatus;
  /** When true, only children/detail render (avoids repeating the header label). */
  hideLabel?: boolean;
  /** When true, omit the status icon (header already shows the loader). */
  hideStatusIcon?: boolean;
  children?: ReactNode;
}) {
  const showDetail = status !== 'pending';

  return (
    <div className="flex items-start gap-2 py-0.5">
      {!hideStatusIcon && <StatusIcon status={status} />}
      <div className="min-w-0 flex-1">
        {!hideLabel && (
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
        )}
        {showDetail && children ? (
          <div className={hideLabel ? undefined : 'mt-1.5'}>{children}</div>
        ) : showDetail && detail ? (
          <p className="mt-0.5 text-sm leading-relaxed text-ink-faint">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Collapsed by default. While the agent is working, the collapsed header shows
 * the active step label (shimmering). Expandable for the full trace with concrete
 * detail subtext under each stage label (Claude-style). Clarifying assumptions
 * (intro + answered pairs) render inside the first step when present.
 */
export function ThoughtTrace({ stage, answer, stopped, clarifying, phase }: ThoughtTraceProps) {
  const isClarifyingPhase = phase === 'clarifying';
  const analysisComplete = stage === 'ready' && !isClarifyingPhase;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isClarifyingPhase && stage === 'ready') {
      setExpanded(true);
    }
  }, [isClarifyingPhase, stage]);

  const pipelineSteps = useMemo(
    () =>
      buildPipelineThoughtSteps(answer ?? EMPTY_ANSWER, {
        hasClarifyingRound: !!clarifying,
      }),
    [answer, clarifying],
  );
  const performedActionsLabel = `Performed ${pipelineSteps.length} actions`;

  const rows = pipelineSteps.map((step) => {
    let status: StepStatus;
    if (isClarifyingPhase) {
      status =
        step.id === 'clarifying' ? (stopped ? 'stopped' : 'running') : 'pending';
    } else {
      status = getStepStatusForThoughtTrace(step.stage, stage, stopped);
    }

    const label =
      step.id === 'clarifying' && clarifying
        ? 'Clarifying assumptions'
        : step.label;

    return { ...step, label, status };
  });

  const activeRow =
    rows.find((r) => r.status === 'running') ??
    [...rows].reverse().find((r) => r.status === 'complete') ??
    rows[0];

  const visibleRows = analysisComplete ? rows : rows.filter((row) => row.status !== 'pending');

  if (!expanded) {
    if (!analysisComplete) {
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
        {analysisComplete ? (
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
        {visibleRows.map((row) => {
          const showClarifyingHistory = row.id === 'clarifying' && !!clarifying;
          return (
            <ThoughtStepRow
              key={row.id}
              label={row.label}
              detail={showClarifyingHistory ? undefined : row.detail}
              status={row.status}
              hideLabel={showClarifyingHistory && isClarifyingPhase}
              hideStatusIcon={showClarifyingHistory && isClarifyingPhase}
            >
              {showClarifyingHistory ? <ClarifyingHistory clarifying={clarifying} /> : null}
            </ThoughtStepRow>
          );
        })}
      </div>
    </div>
  );
}
