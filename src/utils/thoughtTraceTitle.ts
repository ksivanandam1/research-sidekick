import type { Answer, Stage } from '../types';
import { buildPipelineThoughtSteps, getThoughtTraceSummary } from '../data/mockData';

const STAGE_ORDER: Stage[] = ['idle', 'analysing', 'retrieving', 'citing', 'drafting', 'linking', 'ready'];

type StepStatus = 'pending' | 'running' | 'complete' | 'stopped';

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

/** Label for the step currently running, or the latest completed step while idle. */
export function getActiveThoughtStepLabel(stage: Stage, answer: Answer, stopped?: boolean): string {
  const pipelineSteps = buildPipelineThoughtSteps(answer);
  const rows = pipelineSteps.map((step) => ({
    ...step,
    status: getStepStatus(step.stage, stage, stopped),
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
): StepStatus {
  return getStepStatus(stepStage, currentStage, stopped);
}
