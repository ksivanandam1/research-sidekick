import { useCallback, useEffect, useRef } from 'react';
import type { Stage } from '../types';
import { playResponseReadySound } from '../utils/responseReadySound';

/** Deliberately slow so demos can read each thinking title. */
const STAGE_DELAY_MS: Record<Stage, number> = {
  idle: 0,
  analysing: 2200,
  retrieving: 1600,
  citing: 0,
  drafting: 2400,
  linking: 1400,
  ready: 0,
};

/** Pause on each evidence step while the collapsed title updates. */
const STEP_STAGGER_MS = 2000;

const REVISION_DELAY_MS = 1400;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RunAnswerJobArgs {
  evidenceFindingIds: string[];
  otherFindingIds: string[];
  onStage: (stage: Stage) => void;
  onFindingsRevealed: (findingIds: string[]) => void;
}

export interface RunRevisionJobArgs {
  onStart: () => void;
  onDone: () => void;
}

export interface RunAssumptionValidationJobArgs {
  onStage: (stage: Stage) => void;
}

const ASSUMPTION_VALIDATION_STAGE_DELAY_MS: Partial<Record<Stage, number>> = {
  analysing: 1400,
  linking: 1000,
};

/**
 * Simulates a mocked agent working through visible stages:
 * analysing -> retrieving -> citing (sources appear) -> drafting (prose + remaining
 * findings appear) -> linking -> ready. Also supports a smaller, localised "re-check" run used
 * when a user challenges a single assumption.
 */
export function useAgentRun() {
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Reset on (re)mount so React 19 StrictMode's dev-only mount -> cleanup ->
    // remount cycle doesn't leave every subsequent run permanently cancelled.
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const runAnswerJob = useCallback(async (args: RunAnswerJobArgs) => {
    cancelledRef.current = false;
    const { evidenceFindingIds, otherFindingIds, onStage, onFindingsRevealed } = args;
    const cancelled = () => cancelledRef.current;

    onStage('analysing');
    await sleep(STAGE_DELAY_MS.analysing);
    if (cancelled()) return;

    onStage('retrieving');
    await sleep(STAGE_DELAY_MS.retrieving);
    if (cancelled()) return;

    onStage('citing');
    if (evidenceFindingIds.length === 0) {
      await sleep(STEP_STAGGER_MS);
      if (cancelled()) return;
    } else {
      for (let i = 0; i < evidenceFindingIds.length; i += 1) {
        onFindingsRevealed(evidenceFindingIds.slice(0, i + 1));
        await sleep(STEP_STAGGER_MS);
        if (cancelled()) return;
      }
    }

    onStage('drafting');
    onFindingsRevealed([...evidenceFindingIds, ...otherFindingIds]);
    await sleep(STAGE_DELAY_MS.drafting);
    if (cancelled()) return;

    onStage('linking');
    await sleep(STAGE_DELAY_MS.linking);
    if (cancelled()) return;

    onStage('ready');
    playResponseReadySound();
  }, []);

  const runRevisionJob = useCallback(async (args: RunRevisionJobArgs) => {
    cancelledRef.current = false;
    const { onStart, onDone } = args;
    onStart();
    await sleep(REVISION_DELAY_MS);
    if (cancelledRef.current) return;
    onDone();
  }, []);

  const runAssumptionValidationJob = useCallback(async (args: RunAssumptionValidationJobArgs) => {
    cancelledRef.current = false;
    const { onStage } = args;
    const cancelled = () => cancelledRef.current;

    onStage('analysing');
    await sleep(ASSUMPTION_VALIDATION_STAGE_DELAY_MS.analysing ?? 1400);
    if (cancelled()) return;

    onStage('linking');
    await sleep(ASSUMPTION_VALIDATION_STAGE_DELAY_MS.linking ?? 1000);
    if (cancelled()) return;

    onStage('ready');
  }, []);

  const cancelRun = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  return { runAnswerJob, runRevisionJob, runAssumptionValidationJob, cancelRun };
}
