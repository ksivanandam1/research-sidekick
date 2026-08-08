import type { AttachedContextItem, ChartAttachedContextItem, ConversationTurn, Stage } from '../types';
import { isChartContext } from '../types';
import { getAnswerHeadline } from './answerPin';

export type InvestigationStatusTone = 'neutral' | 'active' | 'ready' | 'stopped' | 'clarifying';

export interface InvestigationHeaderState {
  subject: string;
  scopeLabels: string[];
  scopeItems: ChartAttachedContextItem[];
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
        scopeItems: attachedContext.filter(isChartContext),
        statusLabel: 'Ready to investigate',
        statusTone: 'neutral',
      };
    }
    return {
      subject: 'Research panel',
      scopeLabels: [],
      scopeItems: [],
      statusLabel: 'Awaiting chart selection',
      statusTone: 'neutral',
    };
  }

  const turnScopeItems = (latestTurn.contextItems ?? []).filter(isChartContext);
  const scopeItems = turnScopeItems.length > 0 ? turnScopeItems : attachedContext.filter(isChartContext);
  const scopeLabels =
    scopeLabelsFromItems(latestTurn.contextItems ?? []).length > 0
      ? scopeLabelsFromItems(latestTurn.contextItems ?? [])
      : composerScope;

  if (latestTurn.phase === 'clarifying' && latestTurn.stage === 'ready') {
    return {
      subject: subjectForTurn(latestTurn),
      scopeLabels,
      scopeItems,
      statusLabel: 'Awaiting your input',
      statusTone: 'clarifying',
    };
  }

  if (latestTurn.stage !== 'ready') {
    const { label, tone } = statusForStage(latestTurn.stage, latestTurn.stopped);
    return {
      subject: subjectForTurn(latestTurn),
      scopeLabels,
      scopeItems,
      statusLabel: label,
      statusTone: tone,
    };
  }

  return {
    subject: subjectForTurn(latestTurn),
    scopeLabels,
    scopeItems,
    statusLabel: latestTurn.stopped ? 'Stopped' : 'Ready for review',
    statusTone: latestTurn.stopped ? 'stopped' : 'ready',
  };
}
