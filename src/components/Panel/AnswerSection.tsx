import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Compass, Share2 } from 'lucide-react';
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
  notifyTopic?: string;
  onReviewShare?: () => void;
  onResponseThumbsUp?: () => void;
  onResponseThumbsDown?: (reasons: ResponseFeedbackReason[], comment: string) => void;
}

function SkeletonLine({ width }: { width: string }) {
  return <div className="h-2.5 animate-pulse rounded-full bg-border-soft" style={{ width }} />;
}

interface ArtifactSectionProps {
  title: string;
  count?: number;
  defaultExpanded?: boolean;
  children: ReactNode;
}

function ArtifactSection({ title, count, defaultExpanded = true, children }: ArtifactSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section className="flex flex-col gap-2 border-t border-border-soft pt-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-0.5 py-0.5 text-left transition-colors hover:bg-surface-soft"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {title}
          {count != null ? ` · ${count}` : ''}
        </span>
        {expanded ? (
          <ChevronUp size={13} className="shrink-0 text-ink-faint" />
        ) : (
          <ChevronDown size={13} className="shrink-0 text-ink-faint" />
        )}
      </button>
      {expanded && children}
    </section>
  );
}

interface FindingGroupProps {
  findings: Finding[];
  showMetricTags: boolean;
  onReply?: (finding: Finding) => void;
}

function FindingGroup({ findings, showMetricTags, onReply }: FindingGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {findings.map((finding) => (
        <FindingItem
          key={finding.id}
          finding={finding}
          showMetricTag={showMetricTags}
          onReply={onReply && finding.kind === 'assumption' ? () => onReply(finding) : undefined}
        />
      ))}
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
  onReviewShare,
  onResponseThumbsUp,
  onResponseThumbsDown,
}: AnswerSectionProps) {
  const summaryActive = stage === 'drafting';
  const summaryText = useTypewriter(answer.summary, summaryActive);
  const summaryVisible = stage === 'drafting' || stage === 'linking' || stage === 'ready';
  const isReady = stage === 'ready';

  const evidence = answer.findings.filter(
    (f) => f.kind === 'evidence' && revealedFindingIds.includes(f.id),
  );
  const assumptions = answer.findings.filter(
    (f) => f.kind === 'assumption' && revealedFindingIds.includes(f.id),
  );
  const openQuestions = answer.findings.filter(
    (f) => f.kind === 'unknown' && revealedFindingIds.includes(f.id),
  );

  const hasAssumptionsToChallenge = assumptions.length > 0 && !archived && !!onReply;

  return (
    <article
      className={`flex flex-col gap-1 rounded-xl border border-border-soft bg-surface p-4 shadow-soft ${
        archived ? 'opacity-70' : ''
      }`}
    >
      <ArtifactSection title="Summary">
        <div className="flex flex-col gap-3">
          {summaryVisible && (archived || answer.confidence) && (
            <ConfidenceBadge level={answer.confidence} archived={archived} />
          )}
          {summaryVisible ? (
            <RichSummary text={summaryText} citations={evidence} />
          ) : (
            <div className="flex flex-col gap-2">
              <SkeletonLine width="92%" />
              <SkeletonLine width="84%" />
              <SkeletonLine width="70%" />
            </div>
          )}
        </div>
        {summaryVisible && answer.chart && (
          <div className="mt-3">
            <AnswerInsightChart chart={answer.chart} />
          </div>
        )}
      </ArtifactSection>

      {evidence.length > 0 && (
        <ArtifactSection title="Evidence" count={evidence.length}>
          <FindingGroup findings={evidence} showMetricTags={showMetricTags} />
        </ArtifactSection>
      )}

      {assumptions.length > 0 && (
        <ArtifactSection title="Assumptions" count={assumptions.length}>
          <FindingGroup findings={assumptions} showMetricTags={showMetricTags} onReply={onReply} />
        </ArtifactSection>
      )}

      {openQuestions.length > 0 && (
        <ArtifactSection title="Open questions" count={openQuestions.length}>
          <FindingGroup findings={openQuestions} showMetricTags={showMetricTags} />
        </ArtifactSection>
      )}

      {isReady && answer.nextCheck && (
        <ArtifactSection title="Next check" defaultExpanded={true}>
          <div className="flex items-start gap-2 rounded-xl border border-ocean-soft bg-ocean-soft/60 p-3">
            <Compass size={14} className="mt-0.5 shrink-0 text-ocean" />
            <p className="text-xs leading-relaxed text-ink-soft">{answer.nextCheck}</p>
          </div>
        </ArtifactSection>
      )}

      {isReady && notifyTopic && !archived && (
        <p className="border-t border-border-soft pt-3 text-sm leading-relaxed text-ink">
          Would you like me to notify you on future changes to {notifyTopic}?
        </p>
      )}

      {isReady && !archived && (onReviewShare || onResponseThumbsUp) && (
        <div className="flex flex-col gap-3 border-t border-border-soft pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Before you share
          </p>
          {hasAssumptionsToChallenge && (
            <p className="text-[11px] leading-relaxed text-ink-faint">
              Review evidence and challenge any assumptions that don&apos;t hold before sharing with
              stakeholders.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {onReviewShare && (
              <button
                type="button"
                onClick={onReviewShare}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-medium text-surface transition-opacity hover:opacity-90"
              >
                <Share2 size={12} />
                Review & share
              </button>
            )}
          </div>
          {onResponseThumbsUp && onResponseThumbsDown && (
            <ResponseFeedbackControls
              feedback={responseFeedback}
              onThumbsUp={onResponseThumbsUp}
              onThumbsDown={onResponseThumbsDown}
            />
          )}
        </div>
      )}
    </article>
  );
}
