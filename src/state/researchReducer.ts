import type { ConversationTurn, DrillDown, Finding, FeedbackValue, MetricId, Stage } from '../types';

export interface SessionState {
  attachedContext: MetricId[];
  panelOpen: boolean;
  turns: ConversationTurn[];
  toast: { id: number; message: string } | null;
  pendingPrefill: string | null;
}

export const initialSessionState: SessionState = {
  attachedContext: [],
  panelOpen: false,
  turns: [],
  toast: null,
  pendingPrefill: null,
};

export type SessionAction =
  | { type: 'ADD_CONTEXT'; id: MetricId }
  | { type: 'REMOVE_CONTEXT'; id: MetricId }
  | { type: 'SET_PANEL_OPEN'; open: boolean }
  | { type: 'CREATE_TURN'; turn: ConversationTurn }
  | { type: 'SET_TURN_STAGE'; turnId: string; stage: Stage }
  | { type: 'REVEAL_FINDINGS'; turnId: string; findingIds: string[] }
  | { type: 'START_DRILLDOWN'; turnId: string; drillDown: DrillDown }
  | { type: 'SET_DRILLDOWN_STAGE'; turnId: string; drillDownId: string; stage: Stage }
  | { type: 'REVEAL_DRILLDOWN_FINDINGS'; turnId: string; drillDownId: string; findingIds: string[] }
  | { type: 'SET_ACTIVE_DRILLDOWN'; turnId: string; drillDownId: string | null }
  | {
      type: 'SET_FEEDBACK';
      turnId: string;
      findingId: string;
      drillDownId?: string;
      value: FeedbackValue;
    }
  | { type: 'START_REVISION'; turnId: string; findingId: string; drillDownId?: string }
  | {
      type: 'APPLY_REVISION';
      turnId: string;
      findingId: string;
      drillDownId?: string;
      patch: Partial<Finding>;
    }
  | { type: 'SHOW_TOAST'; message: string }
  | { type: 'DISMISS_TOAST' }
  | { type: 'SET_PENDING_PREFILL'; text: string | null };

function mapFindings(
  findings: Finding[],
  findingId: string,
  updater: (finding: Finding) => Finding,
): Finding[] {
  return findings.map((f) => (f.id === findingId ? updater(f) : f));
}

function updateTurn(
  state: SessionState,
  turnId: string,
  updater: (turn: ConversationTurn) => ConversationTurn,
): SessionState {
  return {
    ...state,
    turns: state.turns.map((t) => (t.id === turnId ? updater(t) : t)),
  };
}

function updateFindingInTurnOrDrillDown(
  turn: ConversationTurn,
  findingId: string,
  drillDownId: string | undefined,
  updater: (finding: Finding) => Finding,
): ConversationTurn {
  if (!drillDownId) {
    if (!turn.answer) return turn;
    return { ...turn, answer: { ...turn.answer, findings: mapFindings(turn.answer.findings, findingId, updater) } };
  }
  return {
    ...turn,
    drillDowns: turn.drillDowns.map((d) => {
      if (d.id !== drillDownId || !d.answer) return d;
      return { ...d, answer: { ...d.answer, findings: mapFindings(d.answer.findings, findingId, updater) } };
    }),
  };
}

function addRevisingId(ids: string[], findingId: string): string[] {
  return ids.includes(findingId) ? ids : [...ids, findingId];
}

let toastCounter = 0;

export function researchReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'ADD_CONTEXT': {
      if (state.attachedContext.includes(action.id)) return state;
      return { ...state, attachedContext: [...state.attachedContext, action.id] };
    }
    case 'REMOVE_CONTEXT': {
      return { ...state, attachedContext: state.attachedContext.filter((id) => id !== action.id) };
    }
    case 'SET_PANEL_OPEN': {
      return { ...state, panelOpen: action.open };
    }
    case 'CREATE_TURN': {
      return { ...state, turns: [...state.turns, action.turn] };
    }
    case 'SET_TURN_STAGE': {
      return updateTurn(state, action.turnId, (t) => ({ ...t, stage: action.stage }));
    }
    case 'REVEAL_FINDINGS': {
      return updateTurn(state, action.turnId, (t) => ({ ...t, revealedFindingIds: action.findingIds }));
    }
    case 'START_DRILLDOWN': {
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        drillDowns: [...t.drillDowns, action.drillDown],
        activeDrillDownId: action.drillDown.id,
      }));
    }
    case 'SET_DRILLDOWN_STAGE': {
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        drillDowns: t.drillDowns.map((d) => (d.id === action.drillDownId ? { ...d, stage: action.stage } : d)),
      }));
    }
    case 'REVEAL_DRILLDOWN_FINDINGS': {
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        drillDowns: t.drillDowns.map((d) =>
          d.id === action.drillDownId ? { ...d, revealedFindingIds: action.findingIds } : d,
        ),
      }));
    }
    case 'SET_ACTIVE_DRILLDOWN': {
      return updateTurn(state, action.turnId, (t) => ({ ...t, activeDrillDownId: action.drillDownId }));
    }
    case 'SET_FEEDBACK': {
      return updateTurn(state, action.turnId, (t) =>
        updateFindingInTurnOrDrillDown(t, action.findingId, action.drillDownId, (f) => ({
          ...f,
          feedback: action.value,
        })),
      );
    }
    case 'START_REVISION': {
      return updateTurn(state, action.turnId, (t) => {
        if (!action.drillDownId) {
          return { ...t, revisingFindingIds: addRevisingId(t.revisingFindingIds, action.findingId) };
        }
        return {
          ...t,
          drillDowns: t.drillDowns.map((d) =>
            d.id === action.drillDownId
              ? { ...d, revisingFindingIds: addRevisingId(d.revisingFindingIds, action.findingId) }
              : d,
          ),
        };
      });
    }
    case 'APPLY_REVISION': {
      return updateTurn(state, action.turnId, (t) => {
        const withPatch = updateFindingInTurnOrDrillDown(t, action.findingId, action.drillDownId, (f) => ({
          ...f,
          ...action.patch,
        }));
        if (!action.drillDownId) {
          return {
            ...withPatch,
            revisingFindingIds: withPatch.revisingFindingIds.filter((id) => id !== action.findingId),
          };
        }
        return {
          ...withPatch,
          drillDowns: withPatch.drillDowns.map((d) =>
            d.id === action.drillDownId
              ? { ...d, revisingFindingIds: d.revisingFindingIds.filter((id) => id !== action.findingId) }
              : d,
          ),
        };
      });
    }
    case 'SHOW_TOAST': {
      toastCounter += 1;
      return { ...state, toast: { id: toastCounter, message: action.message } };
    }
    case 'DISMISS_TOAST': {
      return { ...state, toast: null };
    }
    case 'SET_PENDING_PREFILL': {
      return { ...state, pendingPrefill: action.text };
    }
    default:
      return state;
  }
}
