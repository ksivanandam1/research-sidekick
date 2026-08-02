import { CornerDownRight } from 'lucide-react';
import type { ConversationTurn } from '../../types';
import { useResearch } from '../../state/ResearchContext';
import { StageTimeline } from './StageTimeline';
import { AnswerSection } from './AnswerSection';
import { DrillDownThread } from './DrillDownThread';

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function ConversationTurnCard({ turn }: { turn: ConversationTurn }) {
  const { giveFeedback, markDoesNotHold, startDrillDown, backToParent, reopenDrillDown, saveRepeatable } = useResearch();
  const showMetricTags = turn.contextIds.length > 1;
  const activeDrillDown = turn.drillDowns.find((d) => d.id === turn.activeDrillDownId);

  return (
    <div className="flex flex-col gap-3 border-b border-border-soft pb-5 last:border-b-0 last:pb-0">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">You asked</p>
        <p className="mt-0.5 text-sm font-medium text-ink">{turn.question}</p>
      </div>

      {!activeDrillDown && (
        <>
          <StageTimeline stage={turn.stage} />

          {turn.answer && (
            <AnswerSection
              answer={turn.answer}
              stage={turn.stage}
              revealedFindingIds={turn.revealedFindingIds}
              revisingFindingIds={turn.revisingFindingIds}
              showMetricTags={showMetricTags}
              onThumbsUp={(findingId) => giveFeedback(turn.id, findingId, 'up')}
              onDoesNotHold={(findingId) => markDoesNotHold(turn.id, findingId)}
              onInvestigate={(finding) => startDrillDown(turn.id, finding)}
              onSaveRepeatable={() => saveRepeatable(turn.question)}
            />
          )}

          {turn.drillDowns.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {turn.drillDowns.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => reopenDrillDown(turn.id, d.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-border-soft px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
                >
                  <CornerDownRight size={11} />
                  {truncate(d.question, 42)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {activeDrillDown && (
        <DrillDownThread
          turnId={turn.id}
          drillDown={activeDrillDown}
          parentLabel={truncate(turn.question, 36)}
          onBack={() => backToParent(turn.id)}
          showMetricTags={showMetricTags}
        />
      )}
    </div>
  );
}
