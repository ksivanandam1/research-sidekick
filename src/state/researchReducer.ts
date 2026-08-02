import type {
  ConversationTurn,
  DrillDown,
  Finding,
  FeedbackValue,
  MetricId,
  SavedCheck,
  Stage,
} from '../types';

export interface SessionState {
  attachedContext: MetricId[];
  panelOpen: boolean;
  turns: ConversationTurn[];
  savedChecks: SavedCheck[];
  toast: { id: number; message: string } | null;
  pendingPrefill: string | null;
}

export const initialSessionState: SessionState = {
  attachedContext: [],
  panelOpen: false,
  turns: [],
  savedChecks: [],
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
  | { type: 'START_DRILLDOWN'; turnId: string; parentPath: string[]; drillDown: DrillDown }
  | { type: 'SET_DRILLDOWN_STAGE'; turnId: string; path: string[]; stage: Stage }
  | { type: 'REVEAL_DRILLDOWN_FINDINGS'; turnId: string; path: string[]; findingIds: string[] }
  | { type: 'SET_ACTIVE_PATH'; turnId: string; path: string[] }
  | { type: 'STOP_TURN'; turnId: string; path?: string[] }
  | {
      type: 'SET_FEEDBACK';
      turnId: string;
      findingId: string;
      path?: string[];
      value: FeedbackValue;
    }
  | { type: 'START_REVISION'; turnId: string; findingId: string; path?: string[] }
  | {
      type: 'APPLY_REVISION';
      turnId: string;
      findingId: string;
      path?: string[];
      patch: Partial<Finding>;
    }
  | { type: 'ADD_SAVED_CHECK'; check: SavedCheck }
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

/** Recursively locates the node at `path` within a drill-down tree and applies `updater`. */
function updateNodeAtPath(nodes: DrillDown[], path: string[], updater: (node: DrillDown) => DrillDown): DrillDown[] {
  if (path.length === 0) return nodes;
  const [head, ...rest] = path;
  return nodes.map((node) => {
    if (node.id !== head) return node;
    if (rest.length === 0) return updater(node);
    return { ...node, drillDowns: updateNodeAtPath(node.drillDowns, rest, updater) };
  });
}

/** Inserts `child` into the node at `parentPath`, or at the root if `parentPath` is empty. */
function insertChildAtPath(nodes: DrillDown[], parentPath: string[], child: DrillDown): DrillDown[] {
  if (parentPath.length === 0) return [...nodes, child];
  return updateNodeAtPath(nodes, parentPath, (node) => ({ ...node, drillDowns: [...node.drillDowns, child] }));
}

function updateNodeFindings(
  node: DrillDown,
  findingId: string,
  updater: (finding: Finding) => Finding,
): DrillDown {
  if (!node.answer) return node;
  return { ...node, answer: { ...node.answer, findings: mapFindings(node.answer.findings, findingId, updater) } };
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
        drillDowns: insertChildAtPath(t.drillDowns, action.parentPath, action.drillDown),
        activePath: [...action.parentPath, action.drillDown.id],
      }));
    }
    case 'SET_DRILLDOWN_STAGE': {
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        drillDowns: updateNodeAtPath(t.drillDowns, action.path, (d) => ({ ...d, stage: action.stage })),
      }));
    }
    case 'REVEAL_DRILLDOWN_FINDINGS': {
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        drillDowns: updateNodeAtPath(t.drillDowns, action.path, (d) => ({
          ...d,
          revealedFindingIds: action.findingIds,
        })),
      }));
    }
    case 'SET_ACTIVE_PATH': {
      return updateTurn(state, action.turnId, (t) => ({ ...t, activePath: action.path }));
    }
    case 'STOP_TURN': {
      if (!action.path || action.path.length === 0) {
        return updateTurn(state, action.turnId, (t) => ({ ...t, stopped: true }));
      }
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        drillDowns: updateNodeAtPath(t.drillDowns, action.path!, (d) => ({ ...d, stopped: true })),
      }));
    }
    case 'SET_FEEDBACK': {
      return updateTurn(state, action.turnId, (t) => {
        if (!action.path || action.path.length === 0) {
          if (!t.answer) return t;
          return {
            ...t,
            answer: { ...t.answer, findings: mapFindings(t.answer.findings, action.findingId, (f) => ({ ...f, feedback: action.value })) },
          };
        }
        return {
          ...t,
          drillDowns: updateNodeAtPath(t.drillDowns, action.path, (d) =>
            updateNodeFindings(d, action.findingId, (f) => ({ ...f, feedback: action.value })),
          ),
        };
      });
    }
    case 'START_REVISION': {
      return updateTurn(state, action.turnId, (t) => {
        if (!action.path || action.path.length === 0) {
          return { ...t, revisingFindingIds: addRevisingId(t.revisingFindingIds, action.findingId) };
        }
        return {
          ...t,
          drillDowns: updateNodeAtPath(t.drillDowns, action.path, (d) => ({
            ...d,
            revisingFindingIds: addRevisingId(d.revisingFindingIds, action.findingId),
          })),
        };
      });
    }
    case 'APPLY_REVISION': {
      return updateTurn(state, action.turnId, (t) => {
        if (!action.path || action.path.length === 0) {
          if (!t.answer) return t;
          return {
            ...t,
            answer: {
              ...t.answer,
              findings: mapFindings(t.answer.findings, action.findingId, (f) => ({ ...f, ...action.patch })),
            },
            revisingFindingIds: t.revisingFindingIds.filter((id) => id !== action.findingId),
          };
        }
        return {
          ...t,
          drillDowns: updateNodeAtPath(t.drillDowns, action.path, (d) => ({
            ...updateNodeFindings(d, action.findingId, (f) => ({ ...f, ...action.patch })),
            revisingFindingIds: d.revisingFindingIds.filter((id) => id !== action.findingId),
          })),
        };
      });
    }
    case 'ADD_SAVED_CHECK': {
      return { ...state, savedChecks: [action.check, ...state.savedChecks] };
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
