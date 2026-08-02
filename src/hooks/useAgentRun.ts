import { useCallback, useEffect, useRef } from 'react';
import type { Stage } from '../types';

const STAGE_DELAY_MS: Record<Stage, number> = {
  idle: 0,
  analysing: 650,
  retrieving: 1000,
  citing: 550,
  drafting: 850,
  ready: 0,
};

const REVISION_DELAY_MS = 900;

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

/**
 * Simulates a mocked agent working through visible stages:
 * analysing -> retrieving -> citing (sources appear) -> drafting (prose + remaining
 * findings appear) -> ready. Also supports a smaller, localised "re-check" run used
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
    const { evidenceFindingIds, otherFindingIds, onStage, onFindingsRevealed } = args;
    const cancelled = () => cancelledRef.current;

    onStage('analysing');
    await sleep(STAGE_DELAY_MS.analysing);
    if (cancelled()) return;

    onStage('retrieving');
    await sleep(STAGE_DELAY_MS.retrieving);
    if (cancelled()) return;

    onStage('citing');
    onFindingsRevealed(evidenceFindingIds);
    await sleep(STAGE_DELAY_MS.citing);
    if (cancelled()) return;

    onStage('drafting');
    onFindingsRevealed([...evidenceFindingIds, ...otherFindingIds]);
    await sleep(STAGE_DELAY_MS.drafting);
    if (cancelled()) return;

    onStage('ready');
  }, []);

  const runRevisionJob = useCallback(async (args: RunRevisionJobArgs) => {
    const { onStart, onDone } = args;
    onStart();
    await sleep(REVISION_DELAY_MS);
    if (cancelledRef.current) return;
    onDone();
  }, []);

  return { runAnswerJob, runRevisionJob };
}
