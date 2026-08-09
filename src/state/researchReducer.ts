import type {
  Answer,
  AttachedContextItem,
  ClarifyingResponse,
  ConversationTurn,
  DashboardAlert,
  DrillDown,
  PinTrigger,
  PipelineThoughtStep,
  ResponseFeedback,
  SavedCheck,
  Stage,
} from '../types';

export interface SessionState {
  attachedContext: AttachedContextItem[];
  panelOpen: boolean;
  panelUnread: boolean;
  turns: ConversationTurn[];
  savedChecks: SavedCheck[];
  toast: { id: number; message: string } | null;
  pendingPrefill: string | null;
  pinTrigger: PinTrigger;
}

export const initialSessionState: SessionState = {
  attachedContext: [],
  panelOpen: false,
  panelUnread: false,
  turns: [],
  savedChecks: [],
  toast: null,
  pendingPrefill: null,
  pinTrigger: 'drilldown',
};

export type SessionAction =
  | { type: 'ADD_CONTEXT'; item: AttachedContextItem }
  | { type: 'REMOVE_CONTEXT'; instanceId: string }
  | { type: 'SET_ATTACHED_CONTEXT'; items: AttachedContextItem[] }
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
      type: 'SET_RESPONSE_FEEDBACK';
      turnId: string;
      path?: string[];
      feedback: ResponseFeedback;
    }
  | { type: 'ADD_SAVED_CHECK'; check: SavedCheck }
  | { type: 'SHOW_TOAST'; message: string }
  | { type: 'DISMISS_TOAST' }
  | { type: 'SET_PENDING_PREFILL'; text: string | null }
  | { type: 'RECORD_CLARIFYING_RESPONSE'; turnId: string; response: ClarifyingResponse }
  | { type: 'BEGIN_DIAGNOSIS'; turnId: string; answer: Answer }
  | { type: 'CLEAR_CONVERSATION' }
  | { type: 'SET_PIN_TRIGGER'; pinTrigger: PinTrigger }
  | { type: 'ARCHIVE_TURN'; turnId: string }
  | { type: 'MARK_ASSUMPTION_VALIDATED'; turnId: string; findingId: string }
  | {
      type: 'BEGIN_NOTIFY_ON_TURN';
      turnId: string;
      userQuestion: string;
      confirmation: string;
      dashboardAlert: DashboardAlert;
      thoughtSteps: PipelineThoughtStep[];
    }
  | { type: 'SET_NOTIFY_TRACE_STAGE'; turnId: string; stage: Stage };

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

let toastCounter = 0;

export function researchReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'ADD_CONTEXT': {
      const incoming = action.item;
      const exists =
        incoming.kind === 'assumption'
          ? state.attachedContext.some(
              (item) => item.kind === 'assumption' && item.findingId === incoming.findingId,
            )
          : state.attachedContext.some(
              (item) =>
                item.kind === 'chart' &&
                item.id === incoming.id &&
                item.timeframeLabel === incoming.timeframeLabel,
            );
      if (exists) return state;
      return { ...state, attachedContext: [incoming, ...state.attachedContext] };
    }
    case 'REMOVE_CONTEXT': {
      return {
        ...state,
        attachedContext: state.attachedContext.filter((item) => item.instanceId !== action.instanceId),
      };
    }
    case 'SET_ATTACHED_CONTEXT': {
      return { ...state, attachedContext: action.items };
    }
    case 'SET_PANEL_OPEN': {
      return {
        ...state,
        panelOpen: action.open,
        panelUnread: action.open ? false : state.panelUnread,
      };
    }
    case 'CREATE_TURN': {
      return { ...state, turns: [...state.turns, action.turn], attachedContext: [] };
    }
    case 'SET_TURN_STAGE': {
      const next = updateTurn(state, action.turnId, (t) => {
        if (t.stopped) return t;
        return {
          ...t,
          stage: action.stage,
          phase: action.stage === 'ready' && t.phase === 'diagnosing' ? 'done' : t.phase,
        };
      });
      const panelUnread =
        action.stage === 'ready' && !state.panelOpen ? true : next.panelUnread;
      return { ...next, panelUnread };
    }
    case 'REVEAL_FINDINGS': {
      return updateTurn(state, action.turnId, (t) => {
        if (t.stopped) return t;
        return { ...t, revealedFindingIds: action.findingIds };
      });
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
        return updateTurn(state, action.turnId, (t) => {
          const stopped = { ...t, stopped: true };
          if (t.phase === 'clarifying' && t.stage !== 'ready') {
            return { ...stopped, stage: 'ready' };
          }
          return stopped;
        });
      }
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        drillDowns: updateNodeAtPath(t.drillDowns, action.path!, (d) => ({ ...d, stopped: true })),
      }));
    }
    case 'SET_RESPONSE_FEEDBACK': {
      return updateTurn(state, action.turnId, (t) => {
        if (!action.path || action.path.length === 0) {
          return { ...t, responseFeedback: action.feedback };
        }
        return {
          ...t,
          drillDowns: updateNodeAtPath(t.drillDowns, action.path, (d) => ({
            ...d,
            responseFeedback: action.feedback,
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
    case 'RECORD_CLARIFYING_RESPONSE': {
      return updateTurn(state, action.turnId, (t) => {
        if (!t.clarifying) return t;
        return {
          ...t,
          clarifying: {
            ...t.clarifying,
            responses: [...t.clarifying.responses, action.response],
            currentIndex: t.clarifying.currentIndex + 1,
          },
        };
      });
    }
    case 'BEGIN_DIAGNOSIS': {
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        phase: 'diagnosing',
        answer: action.answer,
        stage: 'analysing',
        revealedFindingIds: [],
      }));
    }
    case 'CLEAR_CONVERSATION': {
      return { ...state, turns: [], pendingPrefill: null, panelUnread: false };
    }
    case 'SET_PIN_TRIGGER': {
      return { ...state, pinTrigger: action.pinTrigger };
    }
    case 'ARCHIVE_TURN': {
      return updateTurn(state, action.turnId, (t) => ({ ...t, archived: true }));
    }
    case 'MARK_ASSUMPTION_VALIDATED': {
      return updateTurn(state, action.turnId, (t) => {
        if (t.validatedAssumptionIds?.includes(action.findingId)) return t;
        return {
          ...t,
          validatedAssumptionIds: [...(t.validatedAssumptionIds ?? []), action.findingId],
        };
      });
    }
    case 'BEGIN_NOTIFY_ON_TURN': {
      return updateTurn(state, action.turnId, (t) => ({
        ...t,
        notifyTrace: {
          stage: 'analysing' as Stage,
          thoughtSteps: action.thoughtSteps,
          confirmation: action.confirmation,
          dashboardAlert: action.dashboardAlert,
          userQuestion: action.userQuestion,
        },
      }));
    }
    case 'SET_NOTIFY_TRACE_STAGE': {
      const next = updateTurn(state, action.turnId, (t) => {
        if (!t.notifyTrace) return t;
        const ready = action.stage === 'ready';
        return {
          ...t,
          notifyTrace: { ...t.notifyTrace, stage: action.stage },
          notifyConfirmed: ready ? true : t.notifyConfirmed,
          answer:
            ready && t.answer
              ? { ...t.answer, dashboardAlert: t.notifyTrace.dashboardAlert }
              : t.answer,
        };
      });
      const panelUnread =
        action.stage === 'ready' && !state.panelOpen ? true : next.panelUnread;
      return { ...next, panelUnread };
    }
    default:
      return state;
  }
}
