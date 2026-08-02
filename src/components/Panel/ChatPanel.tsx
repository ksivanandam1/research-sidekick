import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { useResearch } from '../../state/ResearchContext';
import { PanelHeader } from './PanelHeader';
import { ConversationTurnCard } from './ConversationTurnCard';
import { FollowUpInput } from './FollowUpInput';
import { ExportReviewModal } from './ExportReviewModal';
import { ActiveClarifyingCard } from './ClarifyingQuestions';

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-ink-faint">
        <MessageSquareText size={18} />
      </div>
      <p className="text-sm font-medium text-ink">Nothing attached yet</p>
      <p className="text-xs leading-relaxed text-ink-faint">
        Click <span className="font-medium text-ink-soft">+</span> on any chart in the canvas to bring
        it in here, then ask a question.
      </p>
    </div>
  );
}

export function ChatPanel() {
  const { turns, closePanel, answerClarifying } = useResearch();
  const [exportOpen, setExportOpen] = useState(false);
  const lastReadyTurn = [...turns].reverse().find((t) => t.stage === 'ready') ?? null;

  const activeClarifyingTurn = [...turns]
    .reverse()
    .find((t) => t.phase === 'clarifying' && t.stage === 'ready' && t.clarifying);
  const activeClarifying = activeClarifyingTurn?.clarifying;
  const activeQuestion =
    activeClarifying && activeClarifying.currentIndex < activeClarifying.questions.length
      ? activeClarifying.questions[activeClarifying.currentIndex]
      : null;

  return (
    <div className="flex h-full flex-col">
      <PanelHeader onClose={closePanel} onShare={() => setExportOpen(true)} shareDisabled={!lastReadyTurn} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {turns.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-5">
            {turns.map((turn) => (
              <ConversationTurnCard key={turn.id} turn={turn} />
            ))}
          </div>
        )}
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

      <FollowUpInput />

      {exportOpen && lastReadyTurn && (
        <ExportReviewModal turn={lastReadyTurn} onClose={() => setExportOpen(false)} />
      )}
    </div>
  );
}
