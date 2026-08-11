import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useResearch } from '../../state/ResearchContext';
import { isChartContext } from '../../types';
import { deriveChatTitle } from '../../utils/chatTitle';
import { PanelHeader } from './PanelHeader';
import { ConversationTurnCard } from './ConversationTurnCard';
import { CompactInvestigationStep } from './CompactInvestigationStep';
import { InvestigationEmptyState } from './InvestigationEmptyState';
import { FollowUpInput } from './FollowUpInput';
import { ExportReviewModal } from './ExportReviewModal';
import { ActiveClarifyingCard } from './ClarifyingQuestions';

const BOTTOM_THRESHOLD_PX = 48;

export function ChatPanel() {
  const {
    turns,
    attachedContext,
    chatHistory,
    activeChatId,
    closePanel,
    startNewChat,
    selectChat,
    answerClarifying,
  } = useResearch();
  const hasChartContext = attachedContext.some(isChartContext);
  const [exportOpen, setExportOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrolledTurnId = useRef<string | null>(null);

  const chatTitle = useMemo(() => {
    const firstQuestion = turns[0]?.question;
    return firstQuestion ? deriveChatTitle(firstQuestion) : 'Ask Sidekick';
  }, [turns]);

  const chats = useMemo(() => {
    const items =
      turns.length > 0 && activeChatId
        ? [{ id: activeChatId, title: chatTitle, isActive: true }]
        : [];
    return [
      ...items,
      ...chatHistory.map((chat) => ({
        id: chat.id,
        title: chat.title,
        isActive: false,
      })),
    ];
  }, [turns.length, activeChatId, chatTitle, chatHistory]);
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
    // Show suggested prompts immediately — they live outside the scroll area and
    // only render when atBottom is true.
    setAtBottom(true);
    const el = scrollRef.current;
    if (!el) return;

    const pinToEnd = () => {
      const node = scrollRef.current;
      if (!node) return;
      node.scrollTo({ top: node.scrollHeight, behavior: 'auto' });
      updateAtBottom();
    };

    // First jump, then re-pin after prompts expand and shrink the scroll viewport.
    pinToEnd();
    requestAnimationFrame(() => {
      pinToEnd();
      requestAnimationFrame(pinToEnd);
    });
  }, [updateAtBottom]);

  const clampScrollPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    if (el.scrollTop > maxScroll) {
      el.scrollTop = maxScroll;
    }
  }, []);

  const scrollLatestQueryIntoView = useCallback(
    (turnId: string) => {
      const root = scrollRef.current;
      if (!root) return;

      const target = root.querySelector(`[data-user-query="${turnId}"]`);
      if (!(target instanceof HTMLElement)) return;

      // Pin the query near the top without using scrollIntoView(block: 'start'), which
      // can extend scrollHeight and leave a large empty region under short replies.
      const top =
        target.getBoundingClientRect().top -
        root.getBoundingClientRect().top +
        root.scrollTop;
      const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
      root.scrollTo({ top: Math.min(Math.max(0, top), maxScroll), behavior: 'auto' });
      updateAtBottom();
    },
    [updateAtBottom],
  );

  useLayoutEffect(() => {
    if (!latestTurnId || latestTurnId === lastScrolledTurnId.current) return;
    lastScrolledTurnId.current = latestTurnId;
    scrollLatestQueryIntoView(latestTurnId);
  }, [latestTurnId, scrollLatestQueryIntoView]);

  useLayoutEffect(() => {
    // Thought-trace / answer content often shrinks when the run finishes — clamp so
    // we don't sit past the end of the document (looks like a blank "glitched" panel).
    clampScrollPosition();
    updateAtBottom();
  }, [turns, clampScrollPosition, updateAtBottom]);

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        title={chatTitle}
        onClose={closePanel}
        onNewChat={startNewChat}
        onShare={() => setExportOpen(true)}
        shareDisabled={!lastReadyTurn}
        chats={chats}
        onSelectChat={selectChat}
      />

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={updateAtBottom}
          className="h-full overflow-y-auto px-5 py-4 [overflow-anchor:none]"
        >
          {turns.length === 0 && !hasChartContext && <InvestigationEmptyState />}
          {turns.length > 0 && (
            <div className="flex flex-col gap-4 pb-4">
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
