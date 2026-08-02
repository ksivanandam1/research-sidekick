import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { ConversationTurn, DrillDown, Finding, FeedbackValue, MetricId } from '../types';
import { useAgentRun } from '../hooks/useAgentRun';
import { initialSessionState, researchReducer } from './researchReducer';
import {
  REVISED_PRICING_FINDING,
  getKpi,
  resolveAnswer,
  resolveDrillDown,
} from '../data/mockData';

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

interface ResearchContextValue {
  attachedContext: MetricId[];
  panelOpen: boolean;
  turns: ConversationTurn[];
  toast: { id: number; message: string } | null;
  pendingPrefill: string | null;
  addContext: (id: MetricId, opts?: { prefill?: string }) => void;
  removeContext: (id: MetricId) => void;
  openPanel: () => void;
  closePanel: () => void;
  consumePrefill: () => void;
  submitQuestion: (question: string) => void;
  startDrillDown: (turnId: string, finding: Finding) => void;
  reopenDrillDown: (turnId: string, drillDownId: string) => void;
  backToParent: (turnId: string) => void;
  giveFeedback: (turnId: string, findingId: string, value: FeedbackValue, drillDownId?: string) => void;
  markDoesNotHold: (turnId: string, findingId: string, drillDownId?: string) => void;
  saveRepeatable: (question: string) => void;
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
  const consumePrefill = useCallback(() => dispatch({ type: 'SET_PENDING_PREFILL', text: null }), []);

  const addContext = useCallback(
    (id: MetricId, opts?: { prefill?: string }) => {
      dispatch({ type: 'ADD_CONTEXT', id });
      dispatch({ type: 'SET_PANEL_OPEN', open: true });
      if (opts?.prefill) {
        dispatch({ type: 'SET_PENDING_PREFILL', text: opts.prefill });
      }
      const kpi = getKpi(id);
      dispatch({ type: 'SHOW_TOAST', message: `Added ${kpi.title} to context.` });
    },
    [],
  );

  const removeContext = useCallback((id: MetricId) => dispatch({ type: 'REMOVE_CONTEXT', id }), []);

  const submitQuestion = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) return;
      const contextIds = state.attachedContext;
      const answer = resolveAnswer(contextIds);
      const turn: ConversationTurn = {
        id: nextId('turn'),
        question: trimmed,
        contextIds,
        stage: 'analysing',
        answer,
        revealedFindingIds: [],
        drillDowns: [],
        activeDrillDownId: null,
        revisingFindingIds: [],
      };
      dispatch({ type: 'CREATE_TURN', turn });

      const evidenceIds = answer.findings.filter((f) => f.kind === 'evidence').map((f) => f.id);
      const otherIds = answer.findings.filter((f) => f.kind !== 'evidence').map((f) => f.id);

      void runAnswerJob({
        evidenceFindingIds: evidenceIds,
        otherFindingIds: otherIds,
        onStage: (stage) => dispatch({ type: 'SET_TURN_STAGE', turnId: turn.id, stage }),
        onFindingsRevealed: (ids) => dispatch({ type: 'REVEAL_FINDINGS', turnId: turn.id, findingIds: ids }),
      });
    },
    [state.attachedContext, runAnswerJob],
  );

  const startDrillDown = useCallback(
    (turnId: string, finding: Finding) => {
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
      };
      dispatch({ type: 'START_DRILLDOWN', turnId, drillDown });

      const evidenceIds = answer.findings.filter((f) => f.kind === 'evidence').map((f) => f.id);
      const otherIds = answer.findings.filter((f) => f.kind !== 'evidence').map((f) => f.id);

      void runAnswerJob({
        evidenceFindingIds: evidenceIds,
        otherFindingIds: otherIds,
        onStage: (stage) => dispatch({ type: 'SET_DRILLDOWN_STAGE', turnId, drillDownId: drillDown.id, stage }),
        onFindingsRevealed: (ids) =>
          dispatch({ type: 'REVEAL_DRILLDOWN_FINDINGS', turnId, drillDownId: drillDown.id, findingIds: ids }),
      });
    },
    [runAnswerJob],
  );

  const reopenDrillDown = useCallback(
    (turnId: string, drillDownId: string) => dispatch({ type: 'SET_ACTIVE_DRILLDOWN', turnId, drillDownId }),
    [],
  );

  const backToParent = useCallback(
    (turnId: string) => dispatch({ type: 'SET_ACTIVE_DRILLDOWN', turnId, drillDownId: null }),
    [],
  );

  const giveFeedback = useCallback(
    (turnId: string, findingId: string, value: FeedbackValue, drillDownId?: string) => {
      dispatch({ type: 'SET_FEEDBACK', turnId, findingId, drillDownId, value });
      if (value === 'up') showToast('Thanks — noted.');
    },
    [showToast],
  );

  const markDoesNotHold = useCallback(
    (turnId: string, findingId: string, drillDownId?: string) => {
      dispatch({ type: 'SET_FEEDBACK', turnId, findingId, drillDownId, value: 'down' });
      dispatch({ type: 'START_REVISION', turnId, findingId, drillDownId });

      void runRevisionJob({
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
          dispatch({ type: 'APPLY_REVISION', turnId, findingId, drillDownId, patch });
          showToast('Updated based on your feedback.');
        },
      });
    },
    [runRevisionJob, showToast],
  );

  const saveRepeatable = useCallback(
    (question: string) => {
      showToast(`Saved "${question}" as a repeatable check.`);
    },
    [showToast],
  );

  const value = useMemo<ResearchContextValue>(
    () => ({
      attachedContext: state.attachedContext,
      panelOpen: state.panelOpen,
      turns: state.turns,
      toast: state.toast,
      pendingPrefill: state.pendingPrefill,
      addContext,
      removeContext,
      openPanel,
      closePanel,
      consumePrefill,
      submitQuestion,
      startDrillDown,
      reopenDrillDown,
      backToParent,
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
      consumePrefill,
      submitQuestion,
      startDrillDown,
      reopenDrillDown,
      backToParent,
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
