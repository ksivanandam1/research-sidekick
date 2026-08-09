import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type {
  AttachedContextItem,
  ContextId,
  ConversationTurn,
  Finding,
  MetricId,
  PinTrigger,
  ResponseFeedback,
  SavedCheck,
} from '../types';
import { isAssumptionContext, isChartContext } from '../types';
import { useAgentRun } from '../hooks/useAgentRun';
import { initialSessionState, researchReducer } from './researchReducer';
import {
  DRAFT_REPORT_ANSWER,
  REVENUE_DIP_ANSWER,
  buildRevenueClarifyingRound,
  determineUsedContext,
  getContextItem,
  getKpi,
  isAssumptionConfirmQuestion,
  isDraftReportQuestion,
  isNotifyFollowUp,
  resolveAnswer,
  resolveAssumptionConfirmAnswer,
  resolveClarificationAnswer,
  resolveNotifyFollowUp,
  shouldStartClarifying,
} from '../data/mockData';

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function truncateLabel(text: string, max: number): string {
  const cleaned = text.replace(/^Assuming\s+/i, '').trim();
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

interface ResearchContextValue {
  attachedContext: AttachedContextItem[];
  panelOpen: boolean;
  panelUnread: boolean;
  turns: ConversationTurn[];
  savedChecks: SavedCheck[];
  toast: { id: number; message: string } | null;
  pendingPrefill: string | null;
  pinTrigger: PinTrigger;
  setPinTrigger: (pinTrigger: PinTrigger) => void;
  addContext: (
    id: ContextId,
    opts: { timeframeLabel: string; prefill?: string },
  ) => void;
  replyToAssumption: (turnId: string, finding: Finding) => void;
  removeContext: (instanceId: string) => void;
  openPanel: () => void;
  closePanel: () => void;
  startNewChat: () => void;
  consumePrefill: () => void;
  submitQuestion: (
    question: string,
    options?: { contextItems?: AttachedContextItem[] },
  ) => void;
  submitQuestionForMetric: (
    metricId: MetricId,
    question: string,
    timeframeLabel: string,
  ) => void;
  answerClarifying: (turnId: string, optionId: string, customLabel?: string) => void;
  reopenPath: (turnId: string, path: string[]) => void;
  backToParent: (turnId: string, currentPath: string[]) => void;
  stopRun: (turnId: string, path?: string[]) => void;
  submitResponseFeedback: (turnId: string, feedback: ResponseFeedback, path?: string[]) => void;
  saveRepeatable: (question: string, metricIds?: MetricId[]) => void;
  requestChangeNotifications: (topic: string, metricIds?: MetricId[]) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
}

const ResearchContext = createContext<ResearchContextValue | null>(null);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(researchReducer, initialSessionState);
  const { runAnswerJob, runAssumptionValidationJob, cancelRun } = useAgentRun();
  const pendingTimeoutsRef = useRef<Map<string, number>>(new Map());

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
    (id: ContextId, opts: { timeframeLabel: string; prefill?: string }) => {
      const meta = getContextItem(id);
      const item: AttachedContextItem = {
        kind: 'chart',
        instanceId: nextId('ctx'),
        id,
        title: meta.title,
        timeframeLabel: opts.timeframeLabel,
        chartKind: meta.chartKind,
      };
      dispatch({ type: 'ADD_CONTEXT', item });
      dispatch({ type: 'SET_PANEL_OPEN', open: true });
      if (opts.prefill) {
        dispatch({ type: 'SET_PENDING_PREFILL', text: opts.prefill });
      }
      dispatch({
        type: 'SHOW_TOAST',
        message: `Added ${meta.title} (${opts.timeframeLabel}) to investigation scope.`,
      });
    },
    [],
  );

  const replyToAssumption = useCallback(
    (turnId: string, finding: Finding) => {
      const turn = state.turns.find((t) => t.id === turnId);
      if (turn?.validatedAssumptionIds?.includes(finding.id)) return;

      const assumptionItem: AttachedContextItem = {
        kind: 'assumption',
        instanceId: nextId('ctx'),
        findingId: finding.id,
        sourceTurnId: turnId,
        title: truncateLabel(finding.text, 48),
        subtitle: 'Assumption',
        text: finding.text,
      };
      dispatch({ type: 'SET_ATTACHED_CONTEXT', items: [assumptionItem] });
      dispatch({ type: 'SET_PANEL_OPEN', open: true });
    },
    [state.turns],
  );

  const removeContext = useCallback(
    (instanceId: string) => dispatch({ type: 'REMOVE_CONTEXT', instanceId }),
    [],
  );

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

  const startQuickReadyJob = useCallback((turnId: string) => {
    dispatch({ type: 'SET_TURN_STAGE', turnId, stage: 'analysing' });
    const timeoutId = window.setTimeout(() => {
      pendingTimeoutsRef.current.delete(turnId);
      dispatch({ type: 'SET_TURN_STAGE', turnId, stage: 'ready' });
    }, 1400);
    pendingTimeoutsRef.current.set(turnId, timeoutId);
  }, []);

  const submitQuestion = useCallback(
    (question: string, options?: { contextItems?: AttachedContextItem[] }) => {
      const trimmed = question.trim();
      if (!trimmed) return;
      const priorTurn = state.turns[state.turns.length - 1];
      const contextItems =
        (options?.contextItems ?? state.attachedContext).length > 0
          ? (options?.contextItems ?? state.attachedContext)
          : (priorTurn?.contextItems ?? []);
      const chartItems = contextItems.filter(isChartContext);
      const assumptionItem = contextItems.find(isAssumptionContext);
      const contextIds = chartItems.map((item) => item.id);
      const usedContextIds = determineUsedContext(trimmed, contextIds);

      if (assumptionItem && isAssumptionConfirmQuestion(trimmed)) {
        const sourceTurn = state.turns.find((t) => t.id === assumptionItem.sourceTurnId);
        if (!sourceTurn?.answer) return;
        if (sourceTurn.validatedAssumptionIds?.includes(assumptionItem.findingId)) return;

        dispatch({
          type: 'MARK_ASSUMPTION_VALIDATED',
          turnId: assumptionItem.sourceTurnId,
          findingId: assumptionItem.findingId,
        });

        const answer = resolveAssumptionConfirmAnswer(sourceTurn, assumptionItem.findingId);
        const inheritedUsedContextIds =
          sourceTurn.usedContextIds.length > 0 ? sourceTurn.usedContextIds : usedContextIds;
        const turn: ConversationTurn = {
          id: nextId('turn'),
          question: trimmed,
          contextIds,
          contextItems,
          usedContextIds: inheritedUsedContextIds,
          stage: 'analysing',
          phase: 'diagnosing',
          answer,
          revealedFindingIds: [],
          drillDowns: [],
          activePath: [],
        };
        dispatch({ type: 'CREATE_TURN', turn });
        startDiagnosisJob(turn.id, answer);
        return;
      }

      if (isNotifyFollowUp(trimmed)) {
        const metricIds =
          usedContextIds.length > 0 ? usedContextIds : (priorTurn?.usedContextIds ?? []);
        const metricTitle = metricIds[0] ? getKpi(metricIds[0]).title : 'Revenue';
        const topic = metricTitle.toLowerCase();

        if (/please (?:notify me|set a notification)|yes.*notify/i.test(trimmed)) {
          if (!priorTurn?.answer) return;

          dispatch({
            type: 'ADD_SAVED_CHECK',
            check: {
              id: nextId('check'),
              question: `Notify on changes to ${topic} this quarter`,
              createdAt: new Date().toISOString(),
              metricIds,
            },
          });
          showToast(`Alert added — I'll notify you of any changes to ${topic} this quarter.`);

          const notifyAnswer = resolveNotifyFollowUp(trimmed, metricTitle);
          if (!notifyAnswer.dashboardAlert || !notifyAnswer.thoughtSteps) return;

          dispatch({
            type: 'BEGIN_NOTIFY_ON_TURN',
            turnId: priorTurn.id,
            userQuestion: trimmed,
            confirmation: notifyAnswer.summary,
            dashboardAlert: notifyAnswer.dashboardAlert,
            thoughtSteps: notifyAnswer.thoughtSteps,
          });

          void runAssumptionValidationJob({
            onStage: (stage) =>
              dispatch({ type: 'SET_NOTIFY_TRACE_STAGE', turnId: priorTurn.id, stage }),
          });
          return;
        }

        const answer = resolveNotifyFollowUp(trimmed, metricTitle);
        const turn: ConversationTurn = {
          id: nextId('turn'),
          question: trimmed,
          contextIds: [],
          contextItems: [],
          usedContextIds: [],
          stage: 'analysing',
          phase: 'diagnosing',
          answer,
          revealedFindingIds: [],
          drillDowns: [],
          activePath: [],
        };
        dispatch({ type: 'CREATE_TURN', turn });
        startQuickReadyJob(turn.id);
        return;
      }

      if (assumptionItem) {
        dispatch({ type: 'ARCHIVE_TURN', turnId: assumptionItem.sourceTurnId });
        const answer = resolveClarificationAnswer(trimmed, assumptionItem.findingId);
        const turn: ConversationTurn = {
          id: nextId('turn'),
          question: trimmed,
          contextIds,
          contextItems,
          usedContextIds,
          stage: 'analysing',
          phase: 'diagnosing',
          answer,
          revealedFindingIds: [],
          drillDowns: [],
          activePath: [],
        };
        dispatch({ type: 'CREATE_TURN', turn });
        startDiagnosisJob(turn.id, answer);
        return;
      }

      if (isDraftReportQuestion(trimmed)) {
        const answer = DRAFT_REPORT_ANSWER;
        const turn: ConversationTurn = {
          id: nextId('turn'),
          question: trimmed,
          contextIds,
          contextItems,
          usedContextIds,
          stage: 'analysing',
          phase: 'diagnosing',
          answer,
          revealedFindingIds: [],
          drillDowns: [],
          activePath: [],
        };
        dispatch({ type: 'CREATE_TURN', turn });
        startDiagnosisJob(turn.id, answer);
        return;
      }

      if (shouldStartClarifying(trimmed)) {
        const turnId = nextId('turn');
        const turn: ConversationTurn = {
          id: turnId,
          question: trimmed,
          contextIds,
          contextItems,
          usedContextIds,
          stage: 'analysing',
          phase: 'clarifying',
          clarifying: buildRevenueClarifyingRound(),
          revealedFindingIds: [],
          drillDowns: [],
          activePath: [],
        };
        dispatch({ type: 'CREATE_TURN', turn });
        // Brief loading beat before clarifying questions appear (demo-friendly pacing).
        const timeoutId = window.setTimeout(() => {
          pendingTimeoutsRef.current.delete(turnId);
          dispatch({ type: 'SET_TURN_STAGE', turnId, stage: 'ready' });
        }, 1800);
        pendingTimeoutsRef.current.set(turnId, timeoutId);
        return;
      }

      const answer = resolveAnswer(usedContextIds);
      const turn: ConversationTurn = {
        id: nextId('turn'),
        question: trimmed,
        contextIds,
        contextItems,
        usedContextIds,
        stage: 'analysing',
        phase: 'diagnosing',
        answer,
        revealedFindingIds: [],
        drillDowns: [],
        activePath: [],
      };
      dispatch({ type: 'CREATE_TURN', turn });
      startDiagnosisJob(turn.id, answer);
    },
    [state.attachedContext, state.turns, startDiagnosisJob, startQuickReadyJob, showToast, runAssumptionValidationJob],
  );

  const submitQuestionForMetric = useCallback(
    (metricId: MetricId, question: string, timeframeLabel: string) => {
      const meta = getContextItem(metricId);
      const item: AttachedContextItem = {
        kind: 'chart',
        instanceId: nextId('ctx'),
        id: metricId,
        title: meta.title,
        timeframeLabel,
        chartKind: meta.chartKind,
      };
      submitQuestion(question, { contextItems: [item] });
    },
    [submitQuestion],
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
      const timeoutId = pendingTimeoutsRef.current.get(turnId);
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
        pendingTimeoutsRef.current.delete(turnId);
      }
      cancelRun();
      dispatch({ type: 'STOP_TURN', turnId, path });
    },
    [cancelRun],
  );

  const submitResponseFeedback = useCallback(
    (turnId: string, feedback: ResponseFeedback, path?: string[]) => {
      dispatch({ type: 'SET_RESPONSE_FEEDBACK', turnId, path, feedback });
      showToast(
        feedback.value === 'up' ? 'Thanks for sharing your feedback.' : 'Thank you for your feedback.',
      );
    },
    [showToast],
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

  const requestChangeNotifications = useCallback(
    (topic: string, metricIds: MetricId[] = []) => {
      const check: SavedCheck = {
        id: nextId('check'),
        question: `Notify on future changes to ${topic}`,
        createdAt: new Date().toISOString(),
        metricIds,
      };
      dispatch({ type: 'ADD_SAVED_CHECK', check });
      showToast(`I'll notify you when ${topic} changes.`);
    },
    [showToast],
  );

  const value = useMemo<ResearchContextValue>(
    () => ({
      attachedContext: state.attachedContext,
      panelOpen: state.panelOpen,
      panelUnread: state.panelUnread,
      turns: state.turns,
      savedChecks: state.savedChecks,
      toast: state.toast,
      pendingPrefill: state.pendingPrefill,
      pinTrigger: state.pinTrigger,
      setPinTrigger,
      addContext,
      replyToAssumption,
      removeContext,
      openPanel,
      closePanel,
      startNewChat,
      consumePrefill,
      submitQuestion,
      submitQuestionForMetric,
      answerClarifying,
      reopenPath,
      backToParent,
      stopRun,
      submitResponseFeedback,
      saveRepeatable,
      requestChangeNotifications,
      showToast,
      dismissToast,
    }),
    [
      state,
      addContext,
      replyToAssumption,
      removeContext,
      openPanel,
      closePanel,
      startNewChat,
      consumePrefill,
      setPinTrigger,
      submitQuestion,
      submitQuestionForMetric,
      answerClarifying,
      reopenPath,
      backToParent,
      stopRun,
      submitResponseFeedback,
      saveRepeatable,
      requestChangeNotifications,
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
