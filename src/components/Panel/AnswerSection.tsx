import { useEffect, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Copy,
  Pencil,
  RotateCcw,
  Square,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from 'lucide-react';
import type {
  Answer,
  ConversationTurn,
  Finding,
  NotifyTrace,
  ResponseFeedback,
  ResponseFeedbackReason,
  Stage,
} from '../../types';
import { useResearch } from '../../state/ResearchContext';
import { useTypewriter } from '../../hooks/useTypewriter';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FindingItem } from './FindingItem';
import { RichSummary, SummaryInline } from './RichSummary';
import { AnswerInsightChart } from './AnswerInsightChart';
import { GeneratedDocumentCard } from './GeneratedDocumentCard';
import { DashboardAlertCard } from './DashboardAlertCard';
import { ExportReviewModal } from './ExportReviewModal';
import { ResponseFeedbackModal } from './ResponseFeedbackModal';
import { ThoughtTrace } from './ThoughtTrace';
import { readAloud, stopReadAloud, toSpeechText } from '../../utils/readAloud';
import { splitUnknownsFromSummary, splitValidationFromSummary } from '../../utils/summarySections';

interface AnswerSectionProps {
  answer: Answer;
  stage: Stage;
  revealedFindingIds: string[];
  showMetricTags: boolean;
  responseFeedback?: ResponseFeedback;
  archived?: boolean;
  onReply?: (finding: Finding) => void;
  notifyTopic?: string;
  notifyRevised?: boolean;
  turn?: ConversationTurn;
  showResponseActions?: boolean;
  onResponseThumbsUp?: () => void;
  onResponseThumbsDown?: (reasons: ResponseFeedbackReason[], comment: string) => void;
  validatedAssumptionIds?: string[];
  notifyTrace?: NotifyTrace;
  notifyConfirmed?: boolean;
  showAnswerFooter?: boolean;
}

function SkeletonLine({ width }: { width: string }) {
  return <div className="h-2.5 animate-pulse rounded-full bg-border-soft" style={{ width }} />;
}

const iconActionBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink';

function FollowUpUserBubble({ text }: { text: string }) {
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

interface FindingGroupProps {
  heading: string;
  findings: Finding[];
  defaultExpanded: boolean;
  showMetricTags: boolean;
  onReply?: (finding: Finding) => void;
  validatedAssumptionIds?: string[];
  /** Red help icon + stronger label treatment for attention. */
  attention?: boolean;
}

function FindingGroup({
  heading,
  findings,
  defaultExpanded,
  showMetricTags,
  onReply,
  validatedAssumptionIds = [],
  attention = false,
}: FindingGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg text-left transition-colors ${
          attention
            ? 'bg-terracotta-soft px-2 py-1.5 hover:bg-terracotta-soft/80'
            : 'px-0.5 py-0.5 hover:bg-surface-soft'
        }`}
      >
        <span
          className={`inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
            attention ? 'text-terracotta' : 'text-ink-faint'
          }`}
        >
          {attention && <CircleHelp size={14} strokeWidth={2.25} className="shrink-0 text-terracotta" />}
          <span className="truncate">
            {heading} · {findings.length}
          </span>
        </span>
        {expanded ? (
          <ChevronUp size={13} className={`shrink-0 ${attention ? 'text-terracotta' : 'text-ink-faint'}`} />
        ) : (
          <ChevronDown size={13} className={`shrink-0 ${attention ? 'text-terracotta' : 'text-ink-faint'}`} />
        )}
      </button>
      {expanded && (
        <div className="flex flex-col gap-2">
          {findings.map((finding) => (
            <FindingItem
              key={finding.id}
              finding={finding}
              showMetricTag={showMetricTags}
              onReply={onReply ? () => onReply(finding) : undefined}
              assumptionAddressed={validatedAssumptionIds.includes(finding.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const NEXT_STEP_PROMPT =
  'inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-left text-sm font-medium text-ink-soft transition-colors hover:border-border hover:text-ink';

const DRAFT_MAYA_PROMPT = 'Draft message';
const SET_ALERT_PROMPT = 'Set alert';

function NextBestStepSection({
  validationNeeded,
  notifyTopic,
  notifyRevised,
  nextStepQuestion,
  citations,
  showActions = false,
  onDraftMaya,
  onNotify,
}: {
  validationNeeded: string | null;
  notifyTopic?: string;
  notifyRevised?: boolean;
  nextStepQuestion?: string;
  citations: Finding[];
  showActions?: boolean;
  onDraftMaya?: () => void;
  onNotify?: () => void;
}) {
  if (!validationNeeded && !notifyTopic && !nextStepQuestion) return null;

  const closingQuestion =
    nextStepQuestion ??
    (notifyTopic
      ? notifyRevised
        ? `Would you still like me to notify you if there are any changes to ${notifyTopic} this quarter?`
        : `Would you like me to notify you on future changes to ${notifyTopic}?`
      : null);

  const showMayaAction = showActions && !!validationNeeded && !!onDraftMaya;
  const showNotifyAction =
    showActions && !!notifyTopic && !nextStepQuestion && !!onNotify;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold leading-snug text-ink">Suggested next steps</h2>
      {validationNeeded && (
        <ul className="list-disc space-y-3 pl-4 text-sm leading-relaxed text-ink">
          <li>
            {validationNeeded.split(/\n\n+/).map((paragraph, index) => (
              <p
                key={index}
                className={index > 0 ? 'mt-1.5 text-ink-soft' : undefined}
              >
                <SummaryInline text={paragraph} citations={citations} />
              </p>
            ))}
            {showMayaAction && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={onDraftMaya}
                  className={NEXT_STEP_PROMPT}
                >
                  <Pencil size={14} strokeWidth={2} className="shrink-0" />
                  <span className="truncate">{DRAFT_MAYA_PROMPT}</span>
                </button>
              </div>
            )}
          </li>
          {notifyTopic && !nextStepQuestion && (
            <li>
              <p>Set an alert to monitor future changes in {notifyTopic}.</p>
              {showNotifyAction && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={onNotify}
                    className={NEXT_STEP_PROMPT}
                  >
                    <Bell size={14} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">{SET_ALERT_PROMPT}</span>
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      )}
      {!validationNeeded && notifyTopic && !nextStepQuestion && (
        <ul className="list-disc space-y-3 pl-4 text-sm leading-relaxed text-ink">
          <li>
            <p>Set an alert to monitor future changes in {notifyTopic}.</p>
            {showNotifyAction && (
              <div className="mt-2">
                <button type="button" onClick={onNotify} className={NEXT_STEP_PROMPT}>
                  <Bell size={14} strokeWidth={2} className="shrink-0" />
                  <span className="truncate">{SET_ALERT_PROMPT}</span>
                </button>
              </div>
            )}
          </li>
        </ul>
      )}
      {closingQuestion && (
        <p className="text-sm font-semibold leading-relaxed text-ink">{closingQuestion}</p>
      )}
    </div>
  );
}

export function AnswerSection({
  answer,
  stage,
  revealedFindingIds,
  showMetricTags,
  responseFeedback,
  archived = false,
  onReply,
  notifyTopic,
  notifyRevised = false,
  turn,
  showResponseActions = false,
  onResponseThumbsUp,
  onResponseThumbsDown,
  validatedAssumptionIds = [],
  notifyTrace,
  notifyConfirmed = false,
  showAnswerFooter = true,
}: AnswerSectionProps) {
  const { showToast, submitQuestion } = useResearch();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const { summaryBody: withoutValidation, validationNeeded } = splitValidationFromSummary(
    answer.summary,
  );
  const { summaryBody } = splitUnknownsFromSummary(withoutValidation);
  const summaryActive = stage === 'drafting';
  const summaryText = useTypewriter(summaryBody, summaryActive);
  const summaryVisible = stage === 'drafting' || stage === 'linking' || stage === 'ready';
  const summaryComplete = !summaryActive || summaryText.length >= summaryBody.length;
  const showBelowSummary = summaryVisible && summaryComplete;
  const isReady = stage === 'ready';

  const citations = answer.findings.filter(
    (f) => f.kind === 'evidence' && revealedFindingIds.includes(f.id),
  );
  const assumptions = answer.findings.filter(
    (f) => f.kind === 'assumption' && revealedFindingIds.includes(f.id),
  );
  const displayConfidence =
    validatedAssumptionIds.length > 0 && answer.confidence === 'medium'
      ? 'high'
      : answer.confidence;

  useEffect(() => {
    return () => {
      stopReadAloud();
    };
  }, []);

  function handleReview() {
    if (!turn) return;
    setReviewOpen(true);
  }

  function handleReadAloud() {
    if (isReadingAloud) {
      stopReadAloud();
      setIsReadingAloud(false);
      return;
    }
    try {
      // Speak the visible agent response (summary body), not pulled-out next-steps/unknowns.
      setIsReadingAloud(true);
      readAloud(toSpeechText(summaryBody), {
        onEnd: () => setIsReadingAloud(false),
      });
    } catch {
      setIsReadingAloud(false);
      showToast('Read aloud is not supported in this browser.');
    }
  }

  function handleRetry() {
    if (!turn) return;
    submitQuestion(turn.question);
  }

  function handleThumbsUp() {
    if (responseFeedback?.value === 'up' || !onResponseThumbsUp) return;
    onResponseThumbsUp();
  }

  function handleThumbsDownSubmit(reasons: ResponseFeedbackReason[], comment: string) {
    onResponseThumbsDown?.(reasons, comment);
    setFeedbackModalOpen(false);
  }

  const showActionRow =
    showAnswerFooter &&
    ((showResponseActions && turn) || (onResponseThumbsUp && onResponseThumbsDown));

  return (
    <div className={`flex flex-col gap-4 ${archived ? 'opacity-70' : ''}`}>
      <div className="flex flex-col gap-3">
        {summaryVisible && (archived || answer.confidence) && (
          <ConfidenceBadge level={displayConfidence} />
        )}
        {summaryVisible ? (
          <>
            <RichSummary text={summaryText} citations={citations} />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <SkeletonLine width="92%" />
            <SkeletonLine width="84%" />
            <SkeletonLine width="70%" />
          </div>
        )}
      </div>

      {showBelowSummary && answer.chart && <AnswerInsightChart chart={answer.chart} />}

      {showBelowSummary && answer.generatedDocument && (
        <GeneratedDocumentCard
          {...answer.generatedDocument}
          onOpen={() => showToast('Opening report preview…')}
        />
      )}

      {showBelowSummary && assumptions.length > 0 && (
        <FindingGroup
          heading="Requires clarification"
          findings={assumptions}
          defaultExpanded={true}
          showMetricTags={showMetricTags}
          onReply={archived ? undefined : onReply}
          validatedAssumptionIds={validatedAssumptionIds}
          attention
        />
      )}

      {isReady &&
        showBelowSummary &&
        !archived &&
        (validationNeeded || notifyTopic || answer.nextStepQuestion) && (
        <NextBestStepSection
          validationNeeded={validationNeeded}
          notifyTopic={notifyTopic}
          notifyRevised={notifyRevised}
          nextStepQuestion={answer.nextStepQuestion}
          citations={citations}
          showActions={showAnswerFooter && !notifyTrace && !notifyConfirmed}
          onDraftMaya={() => submitQuestion(DRAFT_MAYA_PROMPT)}
          onNotify={() => submitQuestion(SET_ALERT_PROMPT)}
        />
      )}

      {notifyTrace && (
        <div className="flex flex-col gap-3">
          <FollowUpUserBubble text={notifyTrace.userQuestion} />
          <ThoughtTrace
            stage={notifyTrace.stage}
            answer={{ summary: '', findings: [], thoughtSteps: notifyTrace.thoughtSteps }}
          />
          {notifyConfirmed && (
            <>
              <RichSummary text={notifyTrace.confirmation} citations={[]} />
              {answer.dashboardAlert && (
                <DashboardAlertCard
                  {...answer.dashboardAlert}
                  onOpen={() => showToast('Opening alert settings…')}
                />
              )}
            </>
          )}
        </div>
      )}

      {isReady && showBelowSummary && !archived && showAnswerFooter && (
        <div className="flex flex-col gap-3">
          {showActionRow && (
            <div className="flex flex-wrap items-center gap-1.5">
              {showResponseActions && turn && (
                <>
                  <button
                    type="button"
                    onClick={handleReview}
                    title="Review before sharing"
                    aria-label="Review before sharing"
                    className={iconActionBtn}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleReadAloud}
                    title={isReadingAloud ? 'Stop reading' : 'Read aloud'}
                    aria-label={isReadingAloud ? 'Stop reading' : 'Read aloud'}
                    className={iconActionBtn}
                  >
                    {isReadingAloud ? <Square size={12} fill="currentColor" /> : <Volume2 size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleRetry}
                    title="Retry"
                    aria-label="Retry"
                    className={iconActionBtn}
                  >
                    <RotateCcw size={14} />
                  </button>
                </>
              )}
              {onResponseThumbsUp && onResponseThumbsDown && (
                <>
                  <button
                    type="button"
                    onClick={handleThumbsUp}
                    title="This was helpful"
                    aria-label="This was helpful"
                    className={`${iconActionBtn}${
                      responseFeedback?.value === 'up'
                        ? ' bg-sage-soft text-sage hover:bg-sage-soft hover:text-sage'
                        : ''
                    }`}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(true)}
                    title="This wasn't helpful"
                    aria-label="This wasn't helpful"
                    className={`${iconActionBtn}${
                      responseFeedback?.value === 'down'
                        ? ' bg-terracotta-soft text-terracotta hover:bg-terracotta-soft hover:text-terracotta'
                        : ''
                    }`}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </>
              )}
            </div>
          )}
          {feedbackModalOpen && onResponseThumbsDown && (
            <ResponseFeedbackModal
              onClose={() => setFeedbackModalOpen(false)}
              onSubmit={handleThumbsDownSubmit}
            />
          )}
          {reviewOpen && turn && (
            <ExportReviewModal turn={turn} onClose={() => setReviewOpen(false)} />
          )}
          <p className="text-[11px] leading-relaxed text-ink-faint">
            Review evidence and challenge any assumptions that don&apos;t hold before sharing with
            stakeholders.
          </p>
        </div>
      )}
    </div>
  );
}
