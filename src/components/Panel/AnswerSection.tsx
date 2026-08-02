import { Bookmark, Compass } from 'lucide-react';
import type { Answer, Finding, Stage } from '../../types';
import { useTypewriter } from '../../hooks/useTypewriter';
import { FindingItem } from './FindingItem';

interface AnswerSectionProps {
  answer: Answer;
  stage: Stage;
  revealedFindingIds: string[];
  revisingFindingIds: string[];
  showMetricTags: boolean;
  onThumbsUp: (findingId: string) => void;
  onDoesNotHold: (findingId: string) => void;
  onInvestigate: (finding: Finding) => void;
  onSaveRepeatable?: () => void;
}

function SkeletonLine({ width }: { width: string }) {
  return <div className="h-2.5 animate-pulse rounded-full bg-border-soft" style={{ width }} />;
}

const GROUPS: { kind: Finding['kind']; heading: string }[] = [
  { kind: 'evidence', heading: 'Evidence' },
  { kind: 'assumption', heading: 'Assumptions' },
  { kind: 'unknown', heading: 'Open Questions' },
];

export function AnswerSection({
  answer,
  stage,
  revealedFindingIds,
  revisingFindingIds,
  showMetricTags,
  onThumbsUp,
  onDoesNotHold,
  onInvestigate,
  onSaveRepeatable,
}: AnswerSectionProps) {
  const summaryActive = stage === 'drafting';
  const summaryText = useTypewriter(answer.summary, summaryActive);
  const summaryVisible = stage === 'drafting' || stage === 'ready';
  const isReady = stage === 'ready';

  return (
    <div className="flex flex-col gap-4">
      <div>
        {summaryVisible ? (
          <p className="text-sm font-medium leading-relaxed text-ink">{summaryText}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <SkeletonLine width="92%" />
            <SkeletonLine width="70%" />
          </div>
        )}
      </div>

      {GROUPS.map(({ kind, heading }) => {
        const findings = answer.findings.filter((f) => f.kind === kind && revealedFindingIds.includes(f.id));
        if (findings.length === 0) return null;
        return (
          <div key={kind} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              {heading} · {findings.length}
            </p>
            <div className="flex flex-col gap-2">
              {findings.map((finding) => (
                <FindingItem
                  key={finding.id}
                  finding={finding}
                  isRevising={revisingFindingIds.includes(finding.id)}
                  showMetricTag={showMetricTags}
                  onThumbsUp={() => onThumbsUp(finding.id)}
                  onDoesNotHold={() => onDoesNotHold(finding.id)}
                  onInvestigate={finding.investigateQuestion ? () => onInvestigate(finding) : undefined}
                />
              ))}
            </div>
          </div>
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
    </div>
  );
}
