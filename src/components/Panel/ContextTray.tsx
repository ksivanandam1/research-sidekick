import { getContextItem } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { ContextChip } from './ContextChip';

export function ContextTray() {
  const { attachedContext, removeContext } = useResearch();

  if (attachedContext.length === 0) {
    return <p className="text-xs text-ink-faint">No charts attached yet — click + on a card.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {attachedContext.map((id) => {
        const item = getContextItem(id);
        return <ContextChip key={id} title={item.title} onRemove={() => removeContext(id)} />;
      })}
    </div>
  );
}
