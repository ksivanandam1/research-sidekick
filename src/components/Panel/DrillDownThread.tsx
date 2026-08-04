import type { Answer, DrillDown } from '../../types';
import { useResearch } from '../../state/ResearchContext';
import { getAnswerHeadline, getPinExpandDetail } from '../../utils/answerPin';
import { Breadcrumbs } from './Breadcrumbs';
import { ThoughtTrace } from './ThoughtTrace';
import { AnswerSection } from './AnswerSection';
import { PinnedInsight } from './PinnedInsight';

interface DrillDownThreadProps {
  turnId: string;
  node: DrillDown;
  path: string[];
  activePath: string[];
  trail: string[];
  parentAnswer?: Answer;
  showMetricTags: boolean;
}

/**
 * Recursively renders the currently active drill-down node. If a deeper node
 * is active (per `activePath`), it renders that nested thread instead of this
 * node's own answer — giving unlimited nesting depth while keeping each level's
 * breadcrumb trail and depth indicator intact.
 */
export function DrillDownThread({ turnId, node, path, activePath, trail, parentAnswer, showMetricTags }: DrillDownThreadProps) {
  const { giveFeedback, markDoesNotHold, startDrillDown, backToParent, reopenPath, pinTrigger } = useResearch();

  const nextId = activePath[path.length];
  const activeChild = nextId ? node.drillDowns.find((d) => d.id === nextId) : undefined;

  if (activeChild) {
    return (
      <DrillDownThread
        turnId={turnId}
        node={activeChild}
        path={[...path, activeChild.id]}
        activePath={activePath}
        trail={[...trail, node.question]}
        parentAnswer={node.answer}
        showMetricTags={showMetricTags}
      />
    );
  }

  const otherDrillDowns = node.drillDowns;
  const parentHeadline = parentAnswer ? getAnswerHeadline(parentAnswer) : null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-surface-soft p-3">
      {pinTrigger === 'drilldown' && parentHeadline && parentAnswer && (
        <PinnedInsight
          key={`pin-a-${pinTrigger}-${parentHeadline}`}
          headline={parentHeadline}
          pinSummary={parentAnswer.pinSummary}
          expandDetail={getPinExpandDetail(parentAnswer)}
        />
      )}
      <Breadcrumbs
        trail={trail}
        activeLabel={node.question}
        depth={path.length}
        onBack={() => backToParent(turnId, path)}
      />
      {node.answer && (
        <ThoughtTrace answer={node.answer} stage={node.stage} revealedFindingIds={node.revealedFindingIds} stopped={node.stopped} />
      )}
      {node.answer && (
        <AnswerSection
          answer={node.answer}
          stage={node.stage}
          revealedFindingIds={node.revealedFindingIds}
          revisingFindingIds={node.revisingFindingIds}
          showMetricTags={showMetricTags}
          onThumbsUp={(findingId) => giveFeedback(turnId, findingId, 'up', path)}
          onDoesNotHold={(findingId) => markDoesNotHold(turnId, findingId, path)}
          onInvestigate={(finding) => startDrillDown(turnId, finding, path)}
        />
      )}

      {otherDrillDowns.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {otherDrillDowns.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => reopenPath(turnId, [...path, d.id])}
              className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-border hover:text-ink"
            >
              {d.question.length > 42 ? `${d.question.slice(0, 41)}…` : d.question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
