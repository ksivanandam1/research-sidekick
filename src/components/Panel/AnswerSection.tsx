import { useState } from 'react';
import { Bookmark, ChevronDown, ChevronUp, Compass } from 'lucide-react';
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
  onInvestigate: (finding: Finding) => void;
  onSaveRepeatable?: () => void;
  onResponseThumbsUp?: () => void;
  onResponseThumbsDown?: (reasons: ResponseFeedbackReason[], comment: string) => void;
}

function SkeletonLine({ width }: { width: string }) {
  return <div className="h-2.5 animate-pulse rounded-full bg-border-soft" style={{ width }} />;
}

const GROUPS: { kind: Finding['kind']; heading: string; defaultExpanded: boolean }[] = [
  { kind: 'assumption', heading: 'Assumptions', defaultExpanded: false },
  { kind: 'unknown', heading: 'Open Questions', defaultExpanded: false },
];

interface FindingGroupProps {
  heading: string;
  findings: Finding[];
  defaultExpanded: boolean;
  showMetricTags: boolean;
  onInvestigate: (finding: Finding) => void;
}

function FindingGroup({
  heading,
  findings,
  defaultExpanded,
  showMetricTags,
  onInvestigate,
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
              onInvestigate={finding.investigateQuestion ? () => onInvestigate(finding) : undefined}
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
  onInvestigate,
  onSaveRepeatable,
  onResponseThumbsUp,
  onResponseThumbsDown,
}: AnswerSectionProps) {
  const summaryActive = stage === 'drafting';
  const summaryText = useTypewriter(answer.summary, summaryActive);
  const summaryVisible = stage === 'drafting' || stage === 'linking' || stage === 'ready';
  const isReady = stage === 'ready';
  const citations = answer.findings.filter((f) => f.kind === 'evidence');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {summaryVisible && answer.confidence && <ConfidenceBadge level={answer.confidence} />}
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

      {GROUPS.map(({ kind, heading, defaultExpanded }) => {
        const findings = answer.findings.filter((f) => f.kind === kind && revealedFindingIds.includes(f.id));
        if (findings.length === 0) return null;
        return (
          <FindingGroup
            key={kind}
            heading={heading}
            findings={findings}
            defaultExpanded={defaultExpanded}
            showMetricTags={showMetricTags}
            onInvestigate={onInvestigate}
          />
        );
      })}

      {isReady && answer.nextCheck && (
        <div className="flex items-start gap-2 rounded-xl border border-ocean-soft bg-ocean-soft/60 p-3">
          <Compass size={14} className="mt-0.5 shrink-0 text-ocean" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ocean">Suggested next check</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{answer.nextCheck}</p>
          </div>
        </div>
      )}

      {isReady && onSaveRepeatable && (
        <button
          type="button"
          onClick={onSaveRepeatable}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
        >
          <Bookmark size={12} />
          Save as a repeatable check
        </button>
      )}

      {isReady && onResponseThumbsUp && onResponseThumbsDown && (
        <ResponseFeedbackControls
          feedback={responseFeedback}
          onThumbsUp={onResponseThumbsUp}
          onThumbsDown={onResponseThumbsDown}
        />
      )}
    </div>
  );
}
