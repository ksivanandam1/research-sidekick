import type { AttachedContextItem, ConversationTurn, Stage } from '../types';
import { isChartContext } from '../types';
import { getAnswerHeadline } from './answerPin';

export type InvestigationStatusTone = 'neutral' | 'active' | 'ready' | 'stopped' | 'clarifying';

export interface InvestigationHeaderState {
  subject: string;
  scopeLabels: string[];
  statusLabel: string;
  statusTone: InvestigationStatusTone;
}

function scopeLabelsFromItems(items: AttachedContextItem[]): string[] {
  return items.filter(isChartContext).map((item) => item.title);
}

function statusForStage(stage: Stage, stopped?: boolean): { label: string; tone: InvestigationStatusTone } {
  if (stopped) return { label: 'Stopped', tone: 'stopped' };
  switch (stage) {
    case 'analysing':
      return { label: 'Clarifying scope', tone: 'active' };
    case 'retrieving':
      return { label: 'Retrieving data', tone: 'active' };
    case 'citing':
      return { label: 'Checking sources', tone: 'active' };
    case 'drafting':
      return { label: 'Drafting explanation', tone: 'active' };
    case 'linking':
      return { label: 'Linking sources', tone: 'active' };
    case 'ready':
      return { label: 'Ready for review', tone: 'ready' };
    default:
      return { label: 'In progress', tone: 'active' };
  }
}

function subjectForTurn(turn: ConversationTurn): string {
  if (turn.answer) {
    const headline = getAnswerHeadline(turn.answer);
    if (headline) return headline;
  }
  const q = turn.question.trim();
  return q.length > 56 ? `${q.slice(0, 55)}…` : q;
}

export function deriveInvestigationHeader(
  turns: ConversationTurn[],
  attachedContext: AttachedContextItem[],
): InvestigationHeaderState {
  const latestTurn = turns[turns.length - 1] ?? null;
  const composerScope = scopeLabelsFromItems(attachedContext);

  if (!latestTurn) {
    if (composerScope.length > 0) {
      return {
        subject: 'New investigation',
        scopeLabels: composerScope,
        statusLabel: 'Ready to investigate',
        statusTone: 'neutral',
      };
    }
    return {
      subject: 'Research panel',
      scopeLabels: [],
      statusLabel: 'Awaiting chart selection',
      statusTone: 'neutral',
    };
  }

  const scopeLabels =
    scopeLabelsFromItems(latestTurn.contextItems ?? []).length > 0
      ? scopeLabelsFromItems(latestTurn.contextItems ?? [])
      : composerScope;

  if (latestTurn.phase === 'clarifying' && latestTurn.stage === 'ready') {
    return {
      subject: subjectForTurn(latestTurn),
      scopeLabels,
      statusLabel: 'Awaiting your input',
      statusTone: 'clarifying',
    };
  }

  if (latestTurn.stage !== 'ready') {
    const { label, tone } = statusForStage(latestTurn.stage, latestTurn.stopped);
    return {
      subject: subjectForTurn(latestTurn),
      scopeLabels,
      statusLabel: label,
      statusTone: tone,
    };
  }

  return {
    subject: subjectForTurn(latestTurn),
    scopeLabels,
    statusLabel: latestTurn.stopped ? 'Stopped' : 'Ready for review',
    statusTone: latestTurn.stopped ? 'stopped' : 'ready',
  };
}
