import type { ConversationTurn } from '../../types';
import { getKpi } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { getAnswerHeadline, getPinExpandDetail } from '../../utils/answerPin';
import { ThoughtTrace } from './ThoughtTrace';
import { AnswerSection } from './AnswerSection';
import { ClarifyingQuestions } from './ClarifyingQuestions';
import { ClarifyingPrepLoader } from './ClarifyingPrepLoader';
import { PinnedInsight } from './PinnedInsight';
import { QueryCard } from './QueryCard';

export function ConversationTurnCard({
  turn,
  isLatest,
  onReviewShare,
}: {
  turn: ConversationTurn;
  isLatest: boolean;
  onReviewShare?: () => void;
}) {
  const { submitResponseFeedback, replyToAssumption, answerClarifying, pinTrigger, turns } =
    useResearch();
  const showMetricTags = turn.usedContextIds.length > 1;
  const isFirstAgentResponse = turns.length === 1 && isLatest;
  const notifyTopic = (
    turn.usedContextIds[0] ? getKpi(turn.usedContextIds[0]).title : 'Revenue'
  ).toLowerCase();
  const clarifying = turn.clarifying;
  const isClarifying = turn.phase === 'clarifying' && !!clarifying;
  const clarifyingLoading = isClarifying && turn.stage !== 'ready';
  const collapseToPin = pinTrigger === 'newTurn' && !isLatest && !!turn.answer && !turn.archived;
  const pinHeadline = turn.answer ? getAnswerHeadline(turn.answer) : null;

  if (collapseToPin && pinHeadline && turn.answer) {
    return (
      <div className="flex flex-col gap-3">
        <QueryCard turn={turn} />
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
      <QueryCard turn={turn} />

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

      {!isClarifying && turn.answer && (
        <>
          <ThoughtTrace stage={turn.stage} answer={turn.answer} stopped={turn.stopped} />
          <AnswerSection
            answer={turn.answer}
            stage={turn.stage}
            revealedFindingIds={turn.revealedFindingIds}
            showMetricTags={showMetricTags}
            responseFeedback={turn.responseFeedback}
            archived={turn.archived}
            onReply={(finding) => replyToAssumption(turn.id, finding)}
            notifyTopic={isFirstAgentResponse ? notifyTopic : undefined}
            onReviewShare={isLatest ? onReviewShare : undefined}
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
        </>
      )}
    </div>
  );
}
