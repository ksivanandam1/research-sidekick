import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, CircleDashed, OctagonX } from 'lucide-react';
import type { Answer, Stage } from '../../types';
import { buildPipelineThoughtSteps, getThoughtTraceSummary } from '../../data/mockData';
import { MoonLoader } from './MoonLoader';

interface ThoughtTraceProps {
  stage: Stage;
  answer: Answer;
  stopped?: boolean;
}

type StepStatus = 'pending' | 'running' | 'complete' | 'stopped';

const STAGE_ORDER: Stage[] = ['idle', 'analysing', 'retrieving', 'citing', 'drafting', 'linking', 'ready'];

function stageIndex(stage: Stage): number {
  return STAGE_ORDER.indexOf(stage);
}

function getStepStatus(stepStage: Stage, currentStage: Stage, stopped?: boolean): StepStatus {
  if (currentStage === 'ready') return 'complete';
  const current = stageIndex(currentStage);
  const step = stageIndex(stepStage);
  if (step < current) return 'complete';
  if (step === current) return stopped ? 'stopped' : 'running';
  return 'pending';
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === 'complete') return <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-sage" />;
  if (status === 'running') return <MoonLoader size={13} className="mt-0.5 shrink-0" />;
  if (status === 'stopped') return <OctagonX size={13} className="mt-0.5 shrink-0 text-terracotta" />;
  return <CircleDashed size={13} className="mt-0.5 shrink-0 text-ink-faint" />;
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
          className={`text-xs leading-snug ${
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
            <span className="ml-1.5 text-[11px] font-medium text-terracotta">Stopped</span>
          )}
        </p>
        {showDetail && detail && (
          <p
            className={`mt-0.5 text-[11px] leading-relaxed ${
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
  const summaryLabel = useMemo(() => getThoughtTraceSummary(answer), [answer]);

  const rows = pipelineSteps.map((step) => ({
    ...step,
    status: getStepStatus(step.stage, stage, stopped),
  }));

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
          className="flex w-full items-start gap-1 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
        >
          <span className="inline-flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="inline-flex items-center gap-1.5">
              <MoonLoader size={12} />
              <span key={activeRow.id} className="thought-shimmer-text truncate text-[11px] font-medium">
                {activeRow.label}
              </span>
            </span>
            {activeRow.detail && (
              <span className="line-clamp-1 pl-[22px] text-[11px] leading-relaxed text-ink-faint">
                {activeRow.detail}
              </span>
            )}
          </span>
          <ChevronDown size={13} className="mt-0.5 shrink-0 text-ink-faint" />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex max-w-full items-center gap-1 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
      >
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-ink-faint">
          <CheckCircle2 size={12} className="shrink-0 text-sage" />
          <span className="truncate">{summaryLabel}</span>
        </span>
        <ChevronDown size={13} className="shrink-0 text-ink-faint" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border-soft bg-surface-soft p-2.5">
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="inline-flex items-center gap-1 pb-1.5 text-left"
      >
        <span className="text-[11px] font-medium text-ink-faint">
          {isReady ? summaryLabel : 'Thinking…'}
        </span>
        <ChevronUp size={13} className="shrink-0 text-ink-faint" />
      </button>
      <div className="flex flex-col gap-1.5 border-t border-border-soft pt-1.5">
        {rows.map((row) => (
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
