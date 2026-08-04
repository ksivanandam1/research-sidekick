import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { ContextId, ConversationTurn, DrillDown, Finding, FeedbackValue, MetricId, PinTrigger, SavedCheck } from '../types';
import { useAgentRun } from '../hooks/useAgentRun';
import { initialSessionState, researchReducer } from './researchReducer';
import {
  REVENUE_DIP_ANSWER,
  REVISED_PRICING_FINDING,
  buildRevenueClarifyingRound,
  determineUsedContext,
  getContextItem,
  resolveAnswer,
  resolveDrillDown,
  shouldStartClarifying,
} from '../data/mockData';

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

interface ResearchContextValue {
  attachedContext: ContextId[];
  panelOpen: boolean;
  turns: ConversationTurn[];
  savedChecks: SavedCheck[];
  toast: { id: number; message: string } | null;
  pendingPrefill: string | null;
  pinTrigger: PinTrigger;
  setPinTrigger: (pinTrigger: PinTrigger) => void;
  addContext: (id: ContextId, opts?: { prefill?: string }) => void;
  removeContext: (id: ContextId) => void;
  openPanel: () => void;
  closePanel: () => void;
  startNewChat: () => void;
  consumePrefill: () => void;
  submitQuestion: (question: string) => void;
  answerClarifying: (turnId: string, optionId: string, customLabel?: string) => void;
  startDrillDown: (turnId: string, finding: Finding, parentPath?: string[]) => void;
  reopenPath: (turnId: string, path: string[]) => void;
  backToParent: (turnId: string, currentPath: string[]) => void;
  stopRun: (turnId: string, path?: string[]) => void;
  giveFeedback: (turnId: string, findingId: string, value: FeedbackValue, path?: string[]) => void;
  markDoesNotHold: (turnId: string, findingId: string, path?: string[]) => void;
  saveRepeatable: (question: string, metricIds?: MetricId[]) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
}

const ResearchContext = createContext<ResearchContextValue | null>(null);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(researchReducer, initialSessionState);
  const { runAnswerJob, runRevisionJob } = useAgentRun();

  const showToast = useCallback((message: string) => dispatch({ type: 'SHOW_TOAST', message }), []);
  const dismissToast = useCallback(() => dispatch({ type: 'DISMISS_TOAST' }), []);

  const openPanel = useCallback(() => dispatch({ type: 'SET_PANEL_OPEN', open: true }), []);
  const closePanel = useCallback(() => dispatch({ type: 'SET_PANEL_OPEN', open: false }), []);
  const startNewChat = useCallback(() => dispatch({ type: 'CLEAR_CONVERSATION' }), []);
  const consumePrefill = useCallback(() => dispatch({ type: 'SET_PENDING_PREFILL', text: null }), []);
  const setPinTrigger = useCallback(
    (pinTrigger: PinTrigger) => dispatch({ type: 'SET_PIN_TRIGGER', pinTrigger }),
    [],
  );

  const addContext = useCallback(
    (id: ContextId, opts?: { prefill?: string }) => {
      dispatch({ type: 'ADD_CONTEXT', id });
      dispatch({ type: 'SET_PANEL_OPEN', open: true });
      if (opts?.prefill) {
        dispatch({ type: 'SET_PENDING_PREFILL', text: opts.prefill });
      }
      const item = getContextItem(id);
      dispatch({ type: 'SHOW_TOAST', message: `Added ${item.title} to context.` });
    },
    [],
  );

  const removeContext = useCallback((id: ContextId) => dispatch({ type: 'REMOVE_CONTEXT', id }), []);

  const startDiagnosisJob = useCallback(
    (turnId: string, answer: NonNullable<ConversationTurn['answer']>) => {
      const evidenceIds = answer.findings.filter((f) => f.kind === 'evidence').map((f) => f.id);
      const otherIds = answer.findings.filter((f) => f.kind !== 'evidence').map((f) => f.id);
      runAnswerJob({
        evidenceFindingIds: evidenceIds,
        otherFindingIds: otherIds,
        onStage: (stage) => dispatch({ type: 'SET_TURN_STAGE', turnId, stage }),
        onFindingsRevealed: (ids) => dispatch({ type: 'REVEAL_FINDINGS', turnId, findingIds: ids }),
      });
    },
    [runAnswerJob],
  );

  const submitQuestion = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) return;
      const contextIds = state.attachedContext;
      const usedContextIds = determineUsedContext(trimmed, contextIds);

      if (shouldStartClarifying(trimmed)) {
        const turnId = nextId('turn');
        const turn: ConversationTurn = {
          id: turnId,
          question: trimmed,
          contextIds,
          usedContextIds,
          stage: 'analysing',
          phase: 'clarifying',
          clarifying: buildRevenueClarifyingRound(),
          revealedFindingIds: [],
          drillDowns: [],
          activePath: [],
          revisingFindingIds: [],
        };
        dispatch({ type: 'CREATE_TURN', turn });
        // Brief loading beat before clarifying questions appear (demo-friendly pacing).
        window.setTimeout(() => {
          dispatch({ type: 'SET_TURN_STAGE', turnId, stage: 'ready' });
        }, 1800);
        return;
      }

      const answer = resolveAnswer(usedContextIds);
      const turn: ConversationTurn = {
        id: nextId('turn'),
        question: trimmed,
        contextIds,
        usedContextIds,
        stage: 'analysing',
        phase: 'diagnosing',
        answer,
        revealedFindingIds: [],
        drillDowns: [],
        activePath: [],
        revisingFindingIds: [],
      };
      dispatch({ type: 'CREATE_TURN', turn });
      startDiagnosisJob(turn.id, answer);
    },
    [state.attachedContext, startDiagnosisJob],
  );

  const answerClarifying = useCallback(
    (turnId: string, optionId: string, customLabel?: string) => {
      const turn = state.turns.find((t) => t.id === turnId);
      if (!turn?.clarifying || turn.phase !== 'clarifying' || turn.stage !== 'ready') return;
      const question = turn.clarifying.questions[turn.clarifying.currentIndex];
      if (!question) return;
      const option = question.options.find((o) => o.id === optionId);
      if (!option) return;

      const label = customLabel?.trim() || option.label;
      if (optionId === 'other' && !customLabel?.trim()) return;

      const isLast = turn.clarifying.currentIndex >= turn.clarifying.questions.length - 1;
      dispatch({
        type: 'RECORD_CLARIFYING_RESPONSE',
        turnId,
        response: { questionId: question.id, optionId: option.id, label },
      });

      if (isLast) {
        dispatch({ type: 'BEGIN_DIAGNOSIS', turnId, answer: REVENUE_DIP_ANSWER });
        startDiagnosisJob(turnId, REVENUE_DIP_ANSWER);
      }
    },
    [state.turns, startDiagnosisJob],
  );

  const startDrillDown = useCallback(
    (turnId: string, finding: Finding, parentPath: string[] = []) => {
      const question = finding.investigateQuestion ?? finding.text;
      const answer = resolveDrillDown(question, finding.metricId);
      const drillDown: DrillDown = {
        id: nextId('drill'),
        parentFindingId: finding.id,
        question,
        stage: 'analysing',
        answer,
        revealedFindingIds: [],
        revisingFindingIds: [],
        drillDowns: [],
      };
      dispatch({ type: 'START_DRILLDOWN', turnId, parentPath, drillDown });

      const path = [...parentPath, drillDown.id];
      const evidenceIds = answer.findings.filter((f) => f.kind === 'evidence').map((f) => f.id);
      const otherIds = answer.findings.filter((f) => f.kind !== 'evidence').map((f) => f.id);

      runAnswerJob({
        evidenceFindingIds: evidenceIds,
        otherFindingIds: otherIds,
        onStage: (stage) => dispatch({ type: 'SET_DRILLDOWN_STAGE', turnId, path, stage }),
        onFindingsRevealed: (ids) => dispatch({ type: 'REVEAL_DRILLDOWN_FINDINGS', turnId, path, findingIds: ids }),
      });
    },
    [runAnswerJob],
  );

  const reopenPath = useCallback(
    (turnId: string, path: string[]) => dispatch({ type: 'SET_ACTIVE_PATH', turnId, path }),
    [],
  );

  const backToParent = useCallback(
    (turnId: string, currentPath: string[]) =>
      dispatch({ type: 'SET_ACTIVE_PATH', turnId, path: currentPath.slice(0, -1) }),
    [],
  );

  const stopRun = useCallback(
    (turnId: string, path?: string[]) => {
      dispatch({ type: 'STOP_TURN', turnId, path });
    },
    [],
  );

  const giveFeedback = useCallback(
    (turnId: string, findingId: string, value: FeedbackValue, path?: string[]) => {
      dispatch({ type: 'SET_FEEDBACK', turnId, findingId, path, value });
      if (value === 'up') showToast('Thanks — noted.');
    },
    [showToast],
  );

  const markDoesNotHold = useCallback(
    (turnId: string, findingId: string, path?: string[]) => {
      dispatch({ type: 'SET_FEEDBACK', turnId, findingId, path, value: 'down' });
      dispatch({ type: 'START_REVISION', turnId, findingId, path });

      runRevisionJob({
        onStart: () => {},
        onDone: () => {
          const patch: Partial<Finding> =
            findingId === 'revenue-a1'
              ? REVISED_PRICING_FINDING
              : {
                  confidence: 'low',
                  revised: true,
                  revisedNote: 'Rechecked — evidence is inconclusive, so confidence has been lowered.',
                };
          dispatch({ type: 'APPLY_REVISION', turnId, findingId, path, patch });
          showToast('Updated based on your feedback.');
        },
      });
    },
    [runRevisionJob, showToast],
  );

  const saveRepeatable = useCallback(
    (question: string, metricIds: MetricId[] = []) => {
      const check: SavedCheck = {
        id: nextId('check'),
        question,
        createdAt: new Date().toISOString(),
        metricIds,
      };
      dispatch({ type: 'ADD_SAVED_CHECK', check });
      showToast(`Saved "${question}" as a repeatable check.`);
    },
    [showToast],
  );

  const value = useMemo<ResearchContextValue>(
    () => ({
      attachedContext: state.attachedContext,
      panelOpen: state.panelOpen,
      turns: state.turns,
      savedChecks: state.savedChecks,
      toast: state.toast,
      pendingPrefill: state.pendingPrefill,
      pinTrigger: state.pinTrigger,
      setPinTrigger,
      addContext,
      removeContext,
      openPanel,
      closePanel,
      startNewChat,
      consumePrefill,
      submitQuestion,
      answerClarifying,
      startDrillDown,
      reopenPath,
      backToParent,
      stopRun,
      giveFeedback,
      markDoesNotHold,
      saveRepeatable,
      showToast,
      dismissToast,
    }),
    [
      state,
      addContext,
      removeContext,
      openPanel,
      closePanel,
      startNewChat,
      consumePrefill,
      setPinTrigger,
      submitQuestion,
      answerClarifying,
      startDrillDown,
      reopenPath,
      backToParent,
      stopRun,
      giveFeedback,
      markDoesNotHold,
      saveRepeatable,
      showToast,
      dismissToast,
    ],
  );

  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
}

export function useResearch(): ResearchContextValue {
  const ctx = useContext(ResearchContext);
  if (!ctx) throw new Error('useResearch must be used within a ResearchProvider');
  return ctx;
}
