import { useCallback, useEffect, useRef, useState } from 'react';
import type { Stage } from '../types';
import {
  ensureNotificationPermission,
  notifyResponseReady,
} from '../utils/responseReadyNotify';
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
const PAUSE_POLL_MS = 50;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RunAnswerJobArgs {
  evidenceFindingIds: string[];
  otherFindingIds: string[];
  responseBody: string;
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
  const pausedRef = useRef(false);
  const [agentPaused, setAgentPaused] = useState(false);

  useEffect(() => {
    // Reset on (re)mount so React 19 StrictMode's dev-only mount -> cleanup ->
    // remount cycle doesn't leave every subsequent run permanently cancelled.
    cancelledRef.current = false;
    pausedRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const waitWhilePaused = useCallback(async () => {
    while (pausedRef.current) {
      if (cancelledRef.current) return;
      await sleep(PAUSE_POLL_MS);
    }
  }, []);

  /** Sleep that freezes while the run is paused and aborts if cancelled. */
  const sleepInterruptible = useCallback(
    async (ms: number) => {
      const end = Date.now() + ms;
      while (Date.now() < end) {
        if (cancelledRef.current) return;
        await waitWhilePaused();
        if (cancelledRef.current) return;
        const remaining = end - Date.now();
        if (remaining <= 0) return;
        await sleep(Math.min(PAUSE_POLL_MS, remaining));
      }
    },
    [waitWhilePaused],
  );

  const beginRun = useCallback(() => {
    cancelledRef.current = false;
    pausedRef.current = false;
    setAgentPaused(false);
  }, []);

  const runAnswerJob = useCallback(
    async (args: RunAnswerJobArgs) => {
      beginRun();
      const { evidenceFindingIds, otherFindingIds, responseBody, onStage, onFindingsRevealed } =
        args;
      const cancelled = () => cancelledRef.current;

      // Await so Allow/Deny settles before stages run (avoids ready racing the prompt).
      await ensureNotificationPermission();

      onStage('analysing');
      await sleepInterruptible(STAGE_DELAY_MS.analysing);
      if (cancelled()) return;

      onStage('retrieving');
      await sleepInterruptible(STAGE_DELAY_MS.retrieving);
      if (cancelled()) return;

      onStage('citing');
      if (evidenceFindingIds.length === 0) {
        await sleepInterruptible(STEP_STAGGER_MS);
        if (cancelled()) return;
      } else {
        for (let i = 0; i < evidenceFindingIds.length; i += 1) {
          onFindingsRevealed(evidenceFindingIds.slice(0, i + 1));
          await sleepInterruptible(STEP_STAGGER_MS);
          if (cancelled()) return;
        }
      }

      onStage('drafting');
      onFindingsRevealed([...evidenceFindingIds, ...otherFindingIds]);
      await sleepInterruptible(STAGE_DELAY_MS.drafting);
      if (cancelled()) return;

      onStage('linking');
      await sleepInterruptible(STAGE_DELAY_MS.linking);
      if (cancelled()) return;

      onStage('ready');
      playResponseReadySound();
      notifyResponseReady({ body: responseBody });
    },
    [beginRun, sleepInterruptible],
  );

  const runRevisionJob = useCallback(
    async (args: RunRevisionJobArgs) => {
      beginRun();
      const { onStart, onDone } = args;
      onStart();
      await sleepInterruptible(REVISION_DELAY_MS);
      if (cancelledRef.current) return;
      onDone();
    },
    [beginRun, sleepInterruptible],
  );

  const runAssumptionValidationJob = useCallback(
    async (args: RunAssumptionValidationJobArgs) => {
      beginRun();
      const { onStage } = args;
      const cancelled = () => cancelledRef.current;

      onStage('analysing');
      await sleepInterruptible(ASSUMPTION_VALIDATION_STAGE_DELAY_MS.analysing ?? 1400);
      if (cancelled()) return;

      onStage('linking');
      await sleepInterruptible(ASSUMPTION_VALIDATION_STAGE_DELAY_MS.linking ?? 1000);
      if (cancelled()) return;

      onStage('ready');
    },
    [beginRun, sleepInterruptible],
  );

  const cancelRun = useCallback(() => {
    cancelledRef.current = true;
    pausedRef.current = false;
    setAgentPaused(false);
  }, []);

  const pauseAgent = useCallback(() => {
    pausedRef.current = true;
    setAgentPaused(true);
  }, []);

  const resumeAgent = useCallback(() => {
    pausedRef.current = false;
    setAgentPaused(false);
  }, []);

  const toggleAgentPlayback = useCallback(() => {
    if (pausedRef.current) {
      pausedRef.current = false;
      setAgentPaused(false);
    } else {
      pausedRef.current = true;
      setAgentPaused(true);
    }
  }, []);

  return {
    runAnswerJob,
    runRevisionJob,
    runAssumptionValidationJob,
    cancelRun,
    pauseAgent,
    resumeAgent,
    toggleAgentPlayback,
    agentPaused,
  };
}
