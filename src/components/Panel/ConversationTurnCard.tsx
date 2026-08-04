import { CornerDownRight } from 'lucide-react';
import type { ConversationTurn } from '../../types';
import { isMetricId } from '../../types';
import { getContextItem, getKpi } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { getAnswerHeadline, getPinExpandDetail } from '../../utils/answerPin';
import { ThoughtTrace } from './ThoughtTrace';
import { AnswerSection } from './AnswerSection';
import { ClarifyingQuestions } from './ClarifyingQuestions';
import { ClarifyingPrepLoader } from './ClarifyingPrepLoader';
import { DrillDownThread } from './DrillDownThread';
import { ContextChip } from './ContextChip';
import { PinnedInsight } from './PinnedInsight';

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[85%] bg-sage-soft px-3.5 py-2.5 text-sm font-medium text-ink"
        style={{ borderRadius: '16px 16px 16px 0px' }}
      >
        {text}
      </div>
    </div>
  );
}

function TurnContextNote({ turn }: { turn: ConversationTurn }) {
  if (turn.contextIds.length === 0) return null;
  const unusedMetrics = turn.contextIds
    .filter(isMetricId)
    .filter((id) => !turn.usedContextIds.includes(id));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {turn.contextIds.map((id) => (
          <span
            key={id}
            className={isMetricId(id) && unusedMetrics.includes(id) ? 'opacity-40' : ''}
          >
            <ContextChip title={getContextItem(id).title} />
          </span>
        ))}
      </div>
      {unusedMetrics.length > 0 && turn.usedContextIds.length > 0 && (
        <p className="text-[11px] leading-relaxed text-ink-faint">
          Used {turn.usedContextIds.map((id) => getKpi(id).title).join(' + ')} for this answer —{' '}
          {unusedMetrics.map((id) => getKpi(id).title).join(', ')} didn't look directly relevant to
          the question.
        </p>
      )}
    </div>
  );
}

export function ConversationTurnCard({
  turn,
  isLatest,
}: {
  turn: ConversationTurn;
  isLatest: boolean;
}) {
  const {
    giveFeedback,
    markDoesNotHold,
    startDrillDown,
    reopenPath,
    saveRepeatable,
    answerClarifying,
    pinTrigger,
  } = useResearch();
  const showMetricTags = turn.usedContextIds.length > 1;
  const rootDrillDown =
    turn.activePath.length > 0
      ? turn.drillDowns.find((d) => d.id === turn.activePath[0])
      : undefined;
  const clarifying = turn.clarifying;
  const isClarifying = turn.phase === 'clarifying' && !!clarifying;
  const clarifyingLoading = isClarifying && turn.stage !== 'ready';
  const collapseToPin = pinTrigger === 'newTurn' && !isLatest && !!turn.answer;
  const pinHeadline = turn.answer ? getAnswerHeadline(turn.answer) : null;

  if (collapseToPin && pinHeadline && turn.answer) {
    return (
      <div className="flex flex-col gap-3 border-b border-border-soft pb-5 last:border-b-0 last:pb-0">
        <UserBubble text={turn.question} />
        <PinnedInsight
          key={`pin-b-${pinTrigger}-${turn.id}`}
          headline={pinHeadline}
          pinSummary={turn.answer.pinSummary}
          expandDetail={getPinExpandDetail(turn.answer)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border-soft pb-5 last:border-b-0 last:pb-0">
      <UserBubble text={turn.question} />

      <TurnContextNote turn={turn} />

      {clarifyingLoading && <ClarifyingPrepLoader />}

      {isClarifying && clarifying && !clarifyingLoading && (
        <ClarifyingQuestions
          clarifying={clarifying}
          onSelect={(optionId, customLabel) => answerClarifying(turn.id, optionId, customLabel)}
          showActiveCard={false}
        />
      )}

      {!isClarifying && clarifying && clarifying.responses.length > 0 && (
        <ClarifyingQuestions
          clarifying={{ ...clarifying, currentIndex: clarifying.questions.length }}
          onSelect={() => {}}
          showActiveCard={false}
        />
      )}

      {!rootDrillDown && !isClarifying && (
        <>
          {turn.answer && (
            <ThoughtTrace
              answer={turn.answer}
              stage={turn.stage}
              revealedFindingIds={turn.revealedFindingIds}
              stopped={turn.stopped}
            />
          )}

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
          parentAnswer={turn.answer}
          showMetricTags={showMetricTags}
        />
      )}
    </div>
  );
}
