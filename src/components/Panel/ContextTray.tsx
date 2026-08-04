import { useResearch } from '../../state/ResearchContext';
import { ComposerContextCard } from './ContextChip';

/** Horizontal strip of attached chart cards inside the composer. */
export function ComposerContextStrip() {
  const { attachedContext, removeContext } = useResearch();

  if (attachedContext.length === 0) return null;

  return (
    <div className="-mx-0.5 mb-2.5 overflow-x-auto pb-0.5">
      <div className="flex w-max min-w-full gap-2 px-0.5">
        {attachedContext.map((item) => (
          <ComposerContextCard
            key={item.id}
            title={item.title}
            timeframeLabel={item.timeframeLabel}
            chartKind={item.chartKind}
            onRemove={() => removeContext(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
