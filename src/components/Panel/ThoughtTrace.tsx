import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, CircleDashed, OctagonX } from 'lucide-react';
import type { Stage } from '../../types';
import { DnaLoader } from './DnaLoader';

interface ThoughtTraceProps {
  stage: Stage;
  stopped?: boolean;
}

type StepStatus = 'pending' | 'running' | 'complete' | 'stopped';

const THINKING_STEPS: { id: string; label: string; stage: Stage }[] = [
  { id: 'clarifying', label: 'Clarifying assumptions', stage: 'analysing' },
  { id: 'retrieving', label: 'Retrieving related Q3 data', stage: 'retrieving' },
  { id: 'analysing', label: 'Analysing Q3 revenue trends and decisions', stage: 'citing' },
  { id: 'drafting', label: 'Drafting an explanation of the dip', stage: 'drafting' },
  { id: 'linking', label: 'Linking figures to source reports', stage: 'linking' },
];

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
  if (status === 'running') return <DnaLoader size={13} className="mt-0.5" />;
  if (status === 'stopped') return <OctagonX size={13} className="mt-0.5 shrink-0 text-terracotta" />;
  return <CircleDashed size={13} className="mt-0.5 shrink-0 text-ink-faint" />;
}

/**
 * Collapsed by default. While the agent is working, the collapsed header shows
 * the active step label (shimmering). Expandable for the full trace.
 */
export function ThoughtTrace({ stage, stopped }: ThoughtTraceProps) {
  const isReady = stage === 'ready';
  const [expanded, setExpanded] = useState(false);

  const rows = THINKING_STEPS.map((step) => ({
    id: step.id,
    text: step.label,
    shortText: step.label,
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
          className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <DnaLoader size={12} />
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
          Finished thinking · view trace
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
