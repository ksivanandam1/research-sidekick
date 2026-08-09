import type { ConversationTurn } from '../../types';
import { isMetricId } from '../../types';
import { getKpi, isNotifyFollowUp } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { getAnswerHeadline, getPinExpandDetail } from '../../utils/answerPin';
import { ThoughtTrace } from './ThoughtTrace';
import { AnswerSection } from './AnswerSection';
import { ComposerContextCard } from './ContextChip';
import { PinnedInsight } from './PinnedInsight';

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[85%] bg-sage-soft px-3.5 py-2.5 text-sm font-medium text-ink"
        style={{ borderRadius: '16px 16px 0px 16px' }}
      >
        {text}
      </div>
    </div>
  );
}

function TurnContextNote({ turn }: { turn: ConversationTurn }) {
  const items = turn.contextItems ?? [];
  if (items.length === 0) return null;

  const unusedMetrics = turn.contextIds
    .filter(isMetricId)
    .filter((id) => !turn.usedContextIds.includes(id));

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex max-w-full flex-wrap justify-end gap-2">
        {items.map((item) =>
          item.kind === 'assumption' ? (
            <ComposerContextCard
              key={item.instanceId}
              title={item.title}
              timeframeLabel={item.subtitle}
              variant="assumption"
            />
          ) : (
            <ComposerContextCard
              key={item.instanceId}
              title={item.title}
              timeframeLabel={item.timeframeLabel}
              chartKind={item.chartKind}
              dimmed={isMetricId(item.id) && unusedMetrics.includes(item.id)}
            />
          ),
        )}
      </div>
      {unusedMetrics.length > 0 && turn.usedContextIds.length > 0 && (
        <p className="max-w-[85%] text-right text-[11px] leading-relaxed text-ink-faint">
          Used {turn.usedContextIds.map((id) => getKpi(id).title).join(' + ')} for this answer —{' '}
          {unusedMetrics.map((id) => getKpi(id).title).join(', ')} didn't look directly relevant to
          the question.
        </p>
      )}
    </div>
  );
}

function UserQuery({ turn }: { turn: ConversationTurn }) {
  return (
    <div data-user-query={turn.id} className="flex flex-col gap-1.5">
      <TurnContextNote turn={turn} />
      <UserBubble text={turn.question} />
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
  const { submitResponseFeedback, replyToAssumption, pinTrigger, turns } = useResearch();
  const showMetricTags = turn.usedContextIds.length > 1;
  const notifyTopic = (
    turn.usedContextIds[0] ? getKpi(turn.usedContextIds[0]).title : 'Revenue'
  ).toLowerCase();
  const showNotifyPrompt =
    isLatest &&
    turn.stage === 'ready' &&
    !!turn.answer &&
    !turn.archived &&
    !turn.answer.generatedDocument &&
    !turn.answer.dashboardAlert &&
    !turn.answer.nextStepQuestion &&
    !turn.notifyConfirmed &&
    !turn.notifyTrace &&
    !isNotifyFollowUp(turn.question);
  const clarifying = turn.clarifying;
  const isClarifying = turn.phase === 'clarifying' && !!clarifying;
  const collapseToPin = pinTrigger === 'newTurn' && !isLatest && !!turn.answer && !turn.archived;
  const pinHeadline = turn.answer ? getAnswerHeadline(turn.answer) : null;
  const showThoughtTrace = isClarifying || !!turn.answer;

  if (collapseToPin && pinHeadline && turn.answer) {
    return (
      <div className="flex flex-col gap-3">
        <UserQuery turn={turn} />
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
    <div className="flex flex-col gap-3">
      <UserQuery turn={turn} />

      {showThoughtTrace && (
        <ThoughtTrace
          stage={turn.stage}
          answer={turn.answer}
          stopped={turn.stopped}
          clarifying={clarifying}
          phase={turn.phase}
        />
      )}

      {!isClarifying && turn.answer && (
        <AnswerSection
          answer={turn.answer}
          stage={turn.stage}
          revealedFindingIds={turn.revealedFindingIds}
          showMetricTags={showMetricTags}
          responseFeedback={turn.responseFeedback}
          archived={turn.archived}
          onReply={(finding) => replyToAssumption(turn.id, finding)}
          validatedAssumptionIds={turn.validatedAssumptionIds}
          notifyTrace={turn.notifyTrace}
          notifyConfirmed={turn.notifyConfirmed}
          notifyTopic={showNotifyPrompt ? notifyTopic : undefined}
          notifyRevised={showNotifyPrompt && turns.some((t) => t.archived)}
          turn={turn}
          showResponseActions={isLatest}
          showAnswerFooter={isLatest}
          onResponseThumbsUp={
            isLatest
              ? () => submitResponseFeedback(turn.id, { value: 'up' })
              : undefined
          }
          onResponseThumbsDown={
            isLatest
              ? (reasons, comment) =>
                  submitResponseFeedback(turn.id, {
                    value: 'down',
                    reasons,
                    comment: comment || undefined,
                  })
              : undefined
          }
        />
      )}
    </div>
  );
}
