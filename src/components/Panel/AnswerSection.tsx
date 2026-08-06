import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Answer, Finding, ResponseFeedback, ResponseFeedbackReason, Stage } from '../../types';
import { useTypewriter } from '../../hooks/useTypewriter';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FindingItem } from './FindingItem';
import { RichSummary } from './RichSummary';
import { AnswerInsightChart } from './AnswerInsightChart';
import { ResponseFeedbackControls } from './ResponseFeedbackControls';

interface AnswerSectionProps {
  answer: Answer;
  stage: Stage;
  revealedFindingIds: string[];
  showMetricTags: boolean;
  responseFeedback?: ResponseFeedback;
  archived?: boolean;
  onReply?: (finding: Finding) => void;
  /** Topic for the change-notification question in the agent response. */
  notifyTopic?: string;
  onResponseThumbsUp?: () => void;
  onResponseThumbsDown?: (reasons: ResponseFeedbackReason[], comment: string) => void;
}

function SkeletonLine({ width }: { width: string }) {
  return <div className="h-2.5 animate-pulse rounded-full bg-border-soft" style={{ width }} />;
}

interface FindingGroupProps {
  heading: string;
  findings: Finding[];
  defaultExpanded: boolean;
  showMetricTags: boolean;
  onReply?: (finding: Finding) => void;
}

function FindingGroup({
  heading,
  findings,
  defaultExpanded,
  showMetricTags,
  onReply,
}: FindingGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-0.5 py-0.5 text-left transition-colors hover:bg-surface-soft"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {heading} · {findings.length}
        </span>
        {expanded ? (
          <ChevronUp size={13} className="shrink-0 text-ink-faint" />
        ) : (
          <ChevronDown size={13} className="shrink-0 text-ink-faint" />
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
            />
          ))}
        </div>
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
  onResponseThumbsUp,
  onResponseThumbsDown,
}: AnswerSectionProps) {
  const summaryActive = stage === 'drafting';
  const summaryText = useTypewriter(answer.summary, summaryActive);
  const summaryVisible = stage === 'drafting' || stage === 'linking' || stage === 'ready';
  const isReady = stage === 'ready';
  const citations = answer.findings.filter((f) => f.kind === 'evidence');
  const assumptions = answer.findings.filter(
    (f) => f.kind === 'assumption' && revealedFindingIds.includes(f.id),
  );

  return (
    <div className={`flex flex-col gap-4 ${archived ? 'opacity-70' : ''}`}>
      <div className="flex flex-col gap-3">
        {summaryVisible && (archived || answer.confidence) && (
          <ConfidenceBadge level={answer.confidence} archived={archived} />
        )}
        {summaryVisible ? (
          <RichSummary text={summaryText} citations={citations} />
        ) : (
          <div className="flex flex-col gap-2">
            <SkeletonLine width="92%" />
            <SkeletonLine width="84%" />
            <SkeletonLine width="70%" />
          </div>
        )}
      </div>

      {summaryVisible && answer.chart && <AnswerInsightChart chart={answer.chart} />}

      {assumptions.length > 0 && (
        <FindingGroup
          heading="Assumptions"
          findings={assumptions}
          defaultExpanded={false}
          showMetricTags={showMetricTags}
          onReply={archived ? undefined : onReply}
        />
      )}

      {isReady && notifyTopic && !archived && (
        <p className="text-sm leading-relaxed text-ink">
          Would you like me to notify you on future changes to {notifyTopic}?
        </p>
      )}

      {isReady && !archived && onResponseThumbsUp && onResponseThumbsDown && (
        <ResponseFeedbackControls
          feedback={responseFeedback}
          onThumbsUp={onResponseThumbsUp}
          onThumbsDown={onResponseThumbsDown}
        />
      )}
    </div>
  );
}
