import type { ConversationTurn } from '../types';
import { getAnswerHeadline } from './answerPin';

export type InvestigationStepKind = 'question' | 'clarifying' | 'analysis' | 'revision' | 'archived';

export interface InvestigationStep {
  id: string;
  turnId: string;
  label: string;
  kind: InvestigationStepKind;
  isLatest: boolean;
}

function truncate(text: string, max: number): string {
  const cleaned = text.trim();
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

export function deriveStepLabel(turn: ConversationTurn): string {
  if (turn.archived) {
    const headline = turn.answer ? getAnswerHeadline(turn.answer) : null;
    return truncate(headline ?? 'Prior read', 48);
  }
  if (turn.phase === 'clarifying') {
    if (turn.stage !== 'ready') return 'Preparing clarifications';
    if (turn.clarifying && turn.clarifying.responses.length > 0) return 'Clarifications answered';
    return 'Clarifying scope';
  }
  if (turn.answer?.pinSummary) {
    return truncate(turn.answer.pinSummary.split(/[.!]/)[0] ?? turn.answer.pinSummary, 48);
  }
  if (turn.answer) {
    const headline = getAnswerHeadline(turn.answer);
    if (headline) return truncate(headline, 48);
  }
  return truncate(turn.question, 48);
}

function stepKindForTurn(turn: ConversationTurn, index: number): InvestigationStepKind {
  if (turn.archived) return 'archived';
  if (turn.phase === 'clarifying') return 'clarifying';
  if (index > 0 && turn.answer?.findings.some((f) => f.revised)) return 'revision';
  if (turn.answer && turn.stage === 'ready') return 'analysis';
  if (index === 0) return 'question';
  return 'analysis';
}

export function deriveInvestigationSteps(turns: ConversationTurn[]): InvestigationStep[] {
  return turns.map((turn, index) => ({
    id: `step-${turn.id}`,
    turnId: turn.id,
    label: deriveStepLabel(turn),
    kind: stepKindForTurn(turn, index),
    isLatest: index === turns.length - 1,
  }));
}
