import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useResearch } from '../../state/ResearchContext';
import { deriveChatTitle } from '../../utils/chatTitle';
import { PanelHeader } from './PanelHeader';
import { ConversationTurnCard } from './ConversationTurnCard';
import { CompactInvestigationStep } from './CompactInvestigationStep';
import { FollowUpInput } from './FollowUpInput';
import { ExportReviewModal } from './ExportReviewModal';
import { ActiveClarifyingCard } from './ClarifyingQuestions';

const BOTTOM_THRESHOLD_PX = 48;

function InvestigationEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean-soft text-ocean">
        <Compass size={18} strokeWidth={2} />
      </div>
      <div className="flex max-w-xs flex-col gap-1.5">
        <p className="text-sm font-medium text-ink">Select a chart to investigate</p>
        <p className="text-xs leading-relaxed text-ink-faint">
          Click <span className="font-medium text-ink-soft">+</span> on any metric in the dashboard to
          get started.
        </p>
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { turns, closePanel, startNewChat, answerClarifying } = useResearch();
  const [exportOpen, setExportOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrolledTurnId = useRef<string | null>(null);

  const chatTitle = useMemo(() => {
    const firstQuestion = turns[0]?.question;
    return firstQuestion ? deriveChatTitle(firstQuestion) : 'Ask Sidekick';
  }, [turns]);
  const priorTurns = turns.slice(0, -1);
  const latestTurn = turns[turns.length - 1] ?? null;

  const lastReadyTurn = [...turns].reverse().find((t) => t.stage === 'ready') ?? null;
  const latestTurnId = latestTurn?.id ?? null;

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

  const scrollLatestQueryIntoView = useCallback(
    (turnId: string, behavior: ScrollBehavior) => {
      const root = scrollRef.current;
      if (!root) return;

      const target = root.querySelector(`[data-user-query="${turnId}"]`);
      if (!(target instanceof HTMLElement)) return;

      target.scrollIntoView({ behavior, block: 'start' });
      updateAtBottom();
    },
    [updateAtBottom],
  );

  useLayoutEffect(() => {
    if (!latestTurnId || latestTurnId === lastScrolledTurnId.current) return;
    lastScrolledTurnId.current = latestTurnId;
    scrollLatestQueryIntoView(latestTurnId, 'auto');
  }, [latestTurnId, scrollLatestQueryIntoView]);

  useEffect(() => {
    updateAtBottom();
  }, [turns, updateAtBottom]);

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title={chatTitle}
        onClose={closePanel}
        onNewChat={startNewChat}
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
            <div className="flex flex-col gap-4 pb-28">
              {priorTurns.map((turn, index) => (
                <CompactInvestigationStep key={turn.id} turn={turn} stepNumber={index + 1} />
              ))}
              {latestTurn && (
                <ConversationTurnCard
                  key={latestTurn.id}
                  turn={latestTurn}
                  isLatest
                />
              )}
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
