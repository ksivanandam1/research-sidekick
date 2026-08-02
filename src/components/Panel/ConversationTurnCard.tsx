import { CornerDownRight } from 'lucide-react';
import type { ConversationTurn } from '../../types';
import { getKpi } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { StageTimeline } from './StageTimeline';
import { AnswerSection } from './AnswerSection';
import { DrillDownThread } from './DrillDownThread';
import { ContextChip } from './ContextChip';

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function TurnContextNote({ turn }: { turn: ConversationTurn }) {
  if (turn.contextIds.length === 0) return null;
  const unused = turn.contextIds.filter((id) => !turn.usedContextIds.includes(id));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {turn.contextIds.map((id) => (
          <span key={id} className={unused.includes(id) ? 'opacity-40' : ''}>
            <ContextChip title={getKpi(id).title} />
          </span>
        ))}
      </div>
      {unused.length > 0 && (
        <p className="text-[11px] leading-relaxed text-ink-faint">
          Used {turn.usedContextIds.map((id) => getKpi(id).title).join(' + ')} for this answer —{' '}
          {unused.map((id) => getKpi(id).title).join(', ')} didn't look directly relevant to the question.
        </p>
      )}
    </div>
  );
}

export function ConversationTurnCard({ turn }: { turn: ConversationTurn }) {
  const { giveFeedback, markDoesNotHold, startDrillDown, reopenPath, saveRepeatable } = useResearch();
  const showMetricTags = turn.usedContextIds.length > 1;
  const rootDrillDown = turn.activePath.length > 0 ? turn.drillDowns.find((d) => d.id === turn.activePath[0]) : undefined;

  return (
    <div className="flex flex-col gap-3 border-b border-border-soft pb-5 last:border-b-0 last:pb-0">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">You asked</p>
        <p className="mt-0.5 text-sm font-medium text-ink">{turn.question}</p>
      </div>

      <TurnContextNote turn={turn} />

      {!rootDrillDown && (
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
              onSaveRepeatable={() => saveRepeatable(turn.question, turn.usedContextIds)}
            />
          )}

          {turn.drillDowns.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {turn.drillDowns.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => reopenPath(turn.id, [d.id])}
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

      {rootDrillDown && (
        <DrillDownThread
          turnId={turn.id}
          node={rootDrillDown}
          path={[rootDrillDown.id]}
          activePath={turn.activePath}
          trail={[turn.question]}
          showMetricTags={showMetricTags}
        />
      )}
    </div>
  );
}
