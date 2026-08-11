import type { Answer, Stage } from '../types';
import { buildPipelineThoughtSteps, getThoughtTraceSummary } from '../data/mockData';

const STAGE_ORDER: Stage[] = ['idle', 'analysing', 'retrieving', 'citing', 'drafting', 'linking', 'ready'];

type StepStatus = 'pending' | 'running' | 'complete' | 'stopped';

function stageIndex(stage: Stage): number {
  return STAGE_ORDER.indexOf(stage);
}

function getStepStatus(
  stepStage: Stage,
  currentStage: Stage,
  stopped?: boolean,
  pipelineStages?: Stage[],
): StepStatus {
  if (currentStage === 'ready') return 'complete';

  // When the visible pipeline skips stages (e.g. no separate citing step), snap the
  // current stage down to the nearest step stage at or before it so a step stays active.
  let effectiveCurrent = currentStage;
  if (pipelineStages && pipelineStages.length > 0 && !pipelineStages.includes(currentStage)) {
    const currentIdx = stageIndex(currentStage);
    const floorIdx = pipelineStages
      .map(stageIndex)
      .filter((idx) => idx >= 0 && idx <= currentIdx)
      .sort((a, b) => b - a)[0];
    if (floorIdx != null) {
      effectiveCurrent = STAGE_ORDER[floorIdx] ?? currentStage;
    }
  }

  const current = stageIndex(effectiveCurrent);
  const step = stageIndex(stepStage);
  if (step < current) return 'complete';
  if (step === current) return stopped ? 'stopped' : 'running';
  return 'pending';
}

/** Label for the step currently running, or the latest completed step while idle. */
export function getActiveThoughtStepLabel(stage: Stage, answer: Answer, stopped?: boolean): string {
  const pipelineSteps = buildPipelineThoughtSteps(answer);
  const pipelineStages = pipelineSteps.map((step) => step.stage);
  const rows = pipelineSteps.map((step) => ({
    ...step,
    status: getStepStatus(step.stage, stage, stopped, pipelineStages),
  }));

  const activeRow =
    rows.find((r) => r.status === 'running') ??
    [...rows].reverse().find((r) => r.status === 'complete') ??
    rows[0];

  return activeRow?.label ?? 'Thinking…';
}

export function getThoughtTraceTabTitle(stage: Stage, answer: Answer, stopped?: boolean): string {
  if (stage === 'ready') return getThoughtTraceSummary(answer);
  return getActiveThoughtStepLabel(stage, answer, stopped);
}

export function getStepStatusForThoughtTrace(
  stepStage: Stage,
  currentStage: Stage,
  stopped?: boolean,
  pipelineStages?: Stage[],
): StepStatus {
  return getStepStatus(stepStage, currentStage, stopped, pipelineStages);
}
