import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Compass } from 'lucide-react';
import type { MetricId } from '../../types';
import { KPI_DEFINITIONS } from '../../data/mockData';
import { DEFAULT_TIMEFRAME, formatTimeframeLabel } from '../../data/dashboardFilters';
import { useResearch } from '../../state/ResearchContext';
import { deriveInvestigationHeader } from '../../utils/panelHeader';
import { PanelHeader } from './PanelHeader';
import { ConversationTurnCard } from './ConversationTurnCard';
import { FollowUpInput } from './FollowUpInput';
import { ExportReviewModal } from './ExportReviewModal';
import { ActiveClarifyingCard } from './ClarifyingQuestions';

const BOTTOM_THRESHOLD_PX = 48;
const DEFAULT_TIMEFRAME_LABEL = formatTimeframeLabel(DEFAULT_TIMEFRAME);

const ANOMALY_SHORTCUTS = KPI_DEFINITIONS.filter(
  (kpi): kpi is typeof kpi & { anomaly: NonNullable<(typeof kpi)['anomaly']> } => !!kpi.anomaly,
);

function InvestigationEmptyState() {
  const { addContext } = useResearch();

  function investigateAnomaly(metricId: MetricId, question: string) {
    addContext(metricId, { timeframeLabel: DEFAULT_TIMEFRAME_LABEL, prefill: question });
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean-soft text-ocean">
        <Compass size={18} strokeWidth={2} />
      </div>
      <div className="flex max-w-xs flex-col gap-1.5">
        <p className="text-sm font-medium text-ink">Select a chart to investigate</p>
        <p className="text-xs leading-relaxed text-ink-faint">
          Click <span className="font-medium text-ink-soft">+</span> on any metric in the dashboard,
          or start from a flagged anomaly below.
        </p>
      </div>

      <ol className="flex max-w-xs flex-col gap-1 text-left text-[11px] leading-relaxed text-ink-faint">
        <li>1. Attach the charts you want in scope</li>
        <li>2. Explain what you need to understand</li>
        <li>3. Verify evidence, then review & share</li>
      </ol>

      {ANOMALY_SHORTCUTS.length > 0 && (
        <div className="flex w-full max-w-xs flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Flagged on dashboard
          </p>
          {ANOMALY_SHORTCUTS.map((kpi) => (
            <button
              key={kpi.id}
              type="button"
              onClick={() => investigateAnomaly(kpi.id, kpi.anomaly.suggestedQuestion)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-border-soft bg-surface px-3 py-2.5 text-left shadow-soft transition-colors hover:border-border hover:bg-surface-soft"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-ink">{kpi.title}</span>
                <span className="block truncate text-[11px] text-ink-faint">{kpi.anomaly.label}</span>
              </span>
              <span className="shrink-0 text-[11px] font-medium text-sage">Investigate</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function offsetWithin(el: HTMLElement, ancestor: HTMLElement): number {
  return (
    el.getBoundingClientRect().top - ancestor.getBoundingClientRect().top + ancestor.scrollTop
  );
}

export function ChatPanel() {
  const { turns, attachedContext, closePanel, startNewChat, answerClarifying } = useResearch();
  const [exportOpen, setExportOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const lastScrolledTurnId = useRef<string | null>(null);

  const headerState = useMemo(
    () => deriveInvestigationHeader(turns, attachedContext),
    [turns, attachedContext],
  );

  const lastReadyTurn = [...turns].reverse().find((t) => t.stage === 'ready') ?? null;
  const latestTurnId = turns[turns.length - 1]?.id ?? null;

  const activeClarifyingTurn = [...turns]
    .reverse()
    .find((t) => t.phase === 'clarifying' && t.stage === 'ready' && t.clarifying);
  const activeClarifying = activeClarifyingTurn?.clarifying;
  const activeQuestion =
    activeClarifying && activeClarifying.currentIndex < activeClarifying.questions.length
      ? activeClarifying.questions[activeClarifying.currentIndex]
      : null;

  const updateAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setAtBottom(true);
      return;
    }
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance <= BOTTOM_THRESHOLD_PX);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  const pinUserQueryToTop = useCallback(
    (turnId: string, behavior: ScrollBehavior) => {
      const root = scrollRef.current;
      const spacer = spacerRef.current;
      if (!root || !spacer) return;

      const target = root.querySelector(`[data-user-query="${turnId}"]`);
      if (!(target instanceof HTMLElement)) return;

      spacer.style.height = `${Math.max(0, root.clientHeight - target.offsetHeight)}px`;
      const top = Math.max(0, offsetWithin(target, root));
      root.scrollTo({ top, behavior });
      updateAtBottom();
    },
    [updateAtBottom],
  );

  useLayoutEffect(() => {
    if (!latestTurnId || latestTurnId === lastScrolledTurnId.current) return;
    lastScrolledTurnId.current = latestTurnId;
    pinUserQueryToTop(latestTurnId, 'auto');
  }, [latestTurnId, pinUserQueryToTop]);

  useEffect(() => {
    updateAtBottom();
  }, [turns, updateAtBottom]);

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        subject={headerState.subject}
        scopeLabels={headerState.scopeLabels}
        statusLabel={headerState.statusLabel}
        statusTone={headerState.statusTone}
        onClose={closePanel}
        onStartOver={startNewChat}
        onShare={() => setExportOpen(true)}
        shareDisabled={!lastReadyTurn}
      />

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={updateAtBottom}
          className="h-full overflow-y-auto px-5 py-4"
        >
          {turns.length === 0 ? (
            <InvestigationEmptyState />
          ) : (
            <div className="flex flex-col gap-5">
              {turns.map((turn, index) => (
                <ConversationTurnCard
                  key={turn.id}
                  turn={turn}
                  isLatest={index === turns.length - 1}
                />
              ))}
              <div ref={spacerRef} aria-hidden className="shrink-0" />
            </div>
          )}
        </div>
      </div>

      {activeClarifyingTurn && activeClarifying && activeQuestion && (
        <div className="pointer-events-none relative z-20 -mb-1 px-4 pb-2">
          <div className="pointer-events-auto translate-y-0">
            <ActiveClarifyingCard
              question={activeQuestion}
              index={activeClarifying.currentIndex}
              total={activeClarifying.questions.length}
              onSelect={(optionId, customLabel) =>
                answerClarifying(activeClarifyingTurn.id, optionId, customLabel)
              }
            />
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-full flex h-14 items-end justify-center bg-gradient-to-b from-transparent to-surface pb-2"
          aria-hidden={atBottom}
        >
          {!atBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              title="Scroll to bottom"
              aria-label="Scroll to bottom"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-border-soft bg-surface text-ink-soft shadow-soft transition-colors hover:border-border hover:text-ink"
            >
              <ChevronDown size={16} strokeWidth={2.25} />
            </button>
          )}
        </div>
        <FollowUpInput showPrompts={atBottom} />
      </div>

      {exportOpen && lastReadyTurn && (
        <ExportReviewModal turn={lastReadyTurn} onClose={() => setExportOpen(false)} />
      )}
    </div>
  );
}
