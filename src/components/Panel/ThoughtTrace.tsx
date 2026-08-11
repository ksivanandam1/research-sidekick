import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, CircleDashed, Lock, OctagonX } from 'lucide-react';
import type { Answer, ClarifyingRound, Source, Stage, TurnPhase } from '../../types';
import { buildPipelineThoughtSteps, getAllSourcesForAnswer } from '../../data/mockData';
import { getStepStatusForThoughtTrace } from '../../utils/thoughtTraceTitle';
import { ClarifyingHistory } from './ClarifyingQuestions';
import { MoonLoader } from './MoonLoader';
import { SourceIcon, SOURCE_PLATFORM } from './SourceIcon';

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
  // Match text-sm + leading-relaxed first-line height so the tick sits mid-aligned with the title.
  const icon =
    status === 'complete' ? (
      <CheckCircle2 size={14} className="text-sage" />
    ) : status === 'running' ? (
      <MoonLoader size={14} />
    ) : status === 'stopped' ? (
      <OctagonX size={14} className="text-terracotta" />
    ) : (
      <CircleDashed size={14} className="text-ink-faint" />
    );

  return (
    <span className="flex h-[1.625em] w-[1em] shrink-0 items-center justify-center text-sm leading-relaxed">
      {icon}
    </span>
  );
}

/** Citation sources as wrapping pills for the retrieving thought-trace step. */
function SourcePills({ sources }: { sources: Source[] }) {
  const uniqueByPlatform = sources.filter(
    (source, index, list) => list.findIndex((s) => s.type === source.type) === index,
  );
  if (uniqueByPlatform.length === 0) return null;

  return (
    <div className="mt-0.5 flex flex-wrap gap-1.5">
      {uniqueByPlatform.map((source) => (
        <span
          key={source.type}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-soft px-2 py-0.5 text-[11px] font-medium text-ink-soft"
        >
          {source.restricted ? (
            <Lock size={10} className="shrink-0" />
          ) : (
            <SourceIcon type={source.type} size={12} />
          )}
          {SOURCE_PLATFORM[source.type]}
        </span>
      ))}
    </div>
  );
}

function ThoughtStepRow({
  label,
  detail,
  status,
  hideLabel = false,
  hideStatusIcon = false,
  collapsible = false,
  defaultExpanded = true,
  animateEnter = false,
  children,
}: {
  label: string;
  detail?: string;
  status: StepStatus;
  /** When true, only children/detail render (avoids repeating the header label). */
  hideLabel?: boolean;
  /** When true, omit the status icon (header already shows the loader). */
  hideStatusIcon?: boolean;
  /** When true, the title toggles visibility of detail/children. */
  collapsible?: boolean;
  defaultExpanded?: boolean;
  /** Soft fade/rise when the step first appears during a loading run. */
  animateEnter?: boolean;
  children?: ReactNode;
}) {
  const [bodyExpanded, setBodyExpanded] = useState(defaultExpanded);
  // Descriptions stay visible when collapsed; only extra body content (Q&A, pills) toggles.
  const showDescription = status !== 'pending' && !!detail;
  const showChildren = status !== 'pending' && !!children && (!collapsible || bodyExpanded);
  const labelClass =
    status === 'running'
      ? 'thought-shimmer-text font-medium'
      : status === 'pending'
        ? 'font-medium text-ink-faint'
        : 'font-medium text-ink-soft';

  return (
    <div
      className={`flex items-start gap-2 py-0.5${animateEnter ? ' thought-step-enter' : ''}`}
    >
      {!hideStatusIcon && <StatusIcon status={status} />}
      <div className="min-w-0 flex-1">
        {!hideLabel &&
          (collapsible ? (
            <button
              type="button"
              onClick={() => setBodyExpanded((open) => !open)}
              aria-expanded={bodyExpanded}
              className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-md text-left transition-colors hover:bg-surface-soft"
            >
              <span className={`min-w-0 truncate text-sm leading-relaxed ${labelClass}`}>
                {label}
                {status === 'stopped' && (
                  <span className="ml-1.5 text-sm font-medium text-terracotta">Stopped</span>
                )}
              </span>
              {bodyExpanded ? (
                <ChevronDown size={13} className="shrink-0 text-ink-faint" />
              ) : (
                <ChevronRight size={13} className="shrink-0 text-ink-faint" />
              )}
            </button>
          ) : (
            <p className={`text-sm leading-relaxed ${labelClass}`}>
              {label}
              {status === 'stopped' && (
                <span className="ml-1.5 text-sm font-medium text-terracotta">Stopped</span>
              )}
            </p>
          ))}
        {showDescription && (
          <p className={`${hideLabel ? '' : 'mt-0.5 '}text-sm leading-relaxed text-ink-faint`}>
            {detail}
          </p>
        )}
        {showChildren ? (
          <div className={hideLabel && !showDescription ? undefined : 'mt-1.5'}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Collapsed by default. While the agent is working, expanded view lists every
 * started step; pending steps stay hidden until their turn. When the answer is
 * ready, the full trace is available. Clarifying assumptions render inside the
 * first step when present.
 */
export function ThoughtTrace({ stage, answer, stopped, clarifying, phase }: ThoughtTraceProps) {
  const isClarifyingPhase = phase === 'clarifying';
  const analysisComplete = stage === 'ready' && !isClarifyingPhase;
  /** Clarifying questions are ready — waiting on the user, not still generating. */
  const awaitingClarifyingInput = isClarifyingPhase && stage === 'ready' && !stopped;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isClarifyingPhase && stage === 'ready') {
      setExpanded(true);
      return;
    }
    // Collapse the full step list when the answer lands so the panel doesn't
    // keep a tall trace open and leave awkward empty scroll space below.
    if (analysisComplete) {
      setExpanded(false);
    }
  }, [isClarifyingPhase, stage, analysisComplete]);

  const resolvedAnswer = answer ?? EMPTY_ANSWER;
  const pipelineSteps = useMemo(
    () =>
      buildPipelineThoughtSteps(resolvedAnswer, {
        hasClarifyingRound: !!clarifying,
      }),
    [resolvedAnswer, clarifying],
  );
  const citationSources = useMemo(
    () => getAllSourcesForAnswer(resolvedAnswer),
    [resolvedAnswer],
  );
  const performedActionsLabel = `Performed ${pipelineSteps.length} actions`;

  const pipelineStages = pipelineSteps.map((step) => step.stage);
  const rows = pipelineSteps.map((step) => {
    let status: StepStatus;
    if (isClarifyingPhase) {
      status =
        step.id === 'clarifying' ? (stopped ? 'stopped' : 'running') : 'pending';
    } else {
      status = getStepStatusForThoughtTrace(step.stage, stage, stopped, pipelineStages);
    }

    return { ...step, label: step.label, status };
  });

  const activeRow =
    rows.find((r) => r.status === 'running') ??
    [...rows].reverse().find((r) => r.status === 'complete') ??
    rows[0];

  // While loading, show every step that has started (hide still-pending ones).
  const visibleRows = analysisComplete ? rows : rows.filter((row) => row.status !== 'pending');
  const activeHeaderLabel = awaitingClarifyingInput ? 'Awaiting your input' : activeRow.label;

  // While the agent is still working, collapsed header keeps the active step description
  // visible outside the bordered list. Once the answer is ready, hide those descriptions.
  const collapsedDescriptions =
    !analysisComplete && activeRow.detail
      ? [{ id: activeRow.id, detail: activeRow.detail }]
      : [];

  if (!expanded) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex max-w-full items-center gap-1 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-soft"
        >
          {analysisComplete ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-ink-faint">
              <span className="truncate">{performedActionsLabel}</span>
            </span>
          ) : awaitingClarifyingInput ? (
            <span className="truncate text-sm font-medium text-ink-faint">{activeHeaderLabel}</span>
          ) : (
            <>
              <MoonLoader size={14} className="shrink-0" />
              <span key={activeRow.id} className="thought-shimmer-text truncate text-sm font-medium">
                {activeHeaderLabel}
              </span>
            </>
          )}
          <ChevronRight size={13} className="shrink-0 text-ink-faint" />
        </button>
        {collapsedDescriptions.map((item) => (
          <p key={item.id} className="px-1 text-sm leading-relaxed text-ink-faint">
            {item.detail}
          </p>
        ))}
      </div>
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
        ) : awaitingClarifyingInput ? (
          <span className="truncate text-sm font-medium text-ink-faint">{activeHeaderLabel}</span>
        ) : (
          <>
            <MoonLoader size={14} className="shrink-0" />
            <span key={activeRow.id} className="thought-shimmer-text truncate text-sm font-medium">
              {activeHeaderLabel}
            </span>
          </>
        )}
        <ChevronDown size={13} className="shrink-0 text-ink-faint" />
      </button>
      {!analysisComplete && activeRow.detail && (
        <p className="px-1 text-sm leading-relaxed text-ink-faint">{activeRow.detail}</p>
      )}
      <div className="flex flex-col gap-1.5 border-l border-border-soft pl-3">
        {visibleRows.map((row) => {
          const showClarifyingHistory = row.id === 'clarifying' && !!clarifying;
          const showSourcePills =
            row.id === 'retrieving' && citationSources.length > 0 && !showClarifyingHistory;
          // While running, the active step's description sits under the header — don't
          // duplicate it on that row. Once complete, every step shows its description.
          const hideDetail = !analysisComplete && row.id === activeRow.id;
          // Header already shows the loader for the active step — don't duplicate it on that row.
          return (
            <ThoughtStepRow
              key={row.id}
              label={row.label}
              detail={hideDetail ? undefined : row.detail}
              status={row.status}
              animateEnter={!analysisComplete}
              hideLabel={showClarifyingHistory && isClarifyingPhase}
              hideStatusIcon={
                (row.status === 'running' && !analysisComplete) ||
                (showClarifyingHistory && isClarifyingPhase)
              }
              collapsible={showClarifyingHistory && !isClarifyingPhase}
              defaultExpanded={false}
            >
              {showClarifyingHistory ? (
                <ClarifyingHistory clarifying={clarifying} />
              ) : showSourcePills ? (
                <SourcePills sources={citationSources} />
              ) : null}
            </ThoughtStepRow>
          );
        })}
      </div>
    </div>
  );
}
