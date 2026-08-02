import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { useResearch } from '../../state/ResearchContext';
import { PanelHeader } from './PanelHeader';
import { ConversationTurnCard } from './ConversationTurnCard';
import { FollowUpInput } from './FollowUpInput';
import { ExportReviewModal } from './ExportReviewModal';

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-ink-faint">
        <MessageSquareText size={18} />
      </div>
      <p className="text-sm font-medium text-ink">Nothing attached yet</p>
      <p className="text-xs leading-relaxed text-ink-faint">
        Click <span className="font-medium text-ink-soft">Add to chat</span> on any chart in the canvas to bring
        it in here, then ask a question.
      </p>
    </div>
  );
}

export function ChatPanel() {
  const { turns, closePanel } = useResearch();
  const [exportOpen, setExportOpen] = useState(false);
  const lastReadyTurn = [...turns].reverse().find((t) => t.stage === 'ready') ?? null;

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

      <FollowUpInput />

      {exportOpen && lastReadyTurn && <ExportReviewModal turn={lastReadyTurn} onClose={() => setExportOpen(false)} />}
    </div>
  );
}
