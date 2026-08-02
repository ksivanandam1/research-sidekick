import type { DrillDown } from '../../types';
import { useResearch } from '../../state/ResearchContext';
import { Breadcrumbs } from './Breadcrumbs';
import { StageTimeline } from './StageTimeline';
import { AnswerSection } from './AnswerSection';

interface DrillDownThreadProps {
  turnId: string;
  drillDown: DrillDown;
  parentLabel: string;
  onBack: () => void;
  showMetricTags: boolean;
}

export function DrillDownThread({ turnId, drillDown, parentLabel, onBack, showMetricTags }: DrillDownThreadProps) {
  const { giveFeedback, markDoesNotHold } = useResearch();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-surface-soft p-3">
      <Breadcrumbs parentLabel={parentLabel} activeLabel={drillDown.question} onBack={onBack} />
      <StageTimeline stage={drillDown.stage} />
      {drillDown.answer && (
        <AnswerSection
          answer={drillDown.answer}
          stage={drillDown.stage}
          revealedFindingIds={drillDown.revealedFindingIds}
          revisingFindingIds={drillDown.revisingFindingIds}
          showMetricTags={showMetricTags}
          onThumbsUp={(findingId) => giveFeedback(turnId, findingId, 'up', drillDown.id)}
          onDoesNotHold={(findingId) => markDoesNotHold(turnId, findingId, drillDown.id)}
          onInvestigate={() => {}}
        />
      )}
    </div>
  );
}
