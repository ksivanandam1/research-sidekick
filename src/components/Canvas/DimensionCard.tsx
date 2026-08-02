import { Info, Minus, MoreVertical, Plus } from 'lucide-react';
import type { DimensionDefinition } from '../../data/mockData';
import { ActualVsPriorBars } from './charts/ActualVsPriorBars';

interface DimensionCardProps {
  definition: DimensionDefinition;
  isAttached: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

const iconBtn =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-soft bg-surface text-ink-soft transition-colors hover:border-border hover:text-ink';

export function DimensionCard({ definition, isAttached, onAdd, onRemove }: DimensionCardProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-medium text-ink-soft">{definition.title}</p>
          <span
            title={definition.tooltip}
            className="inline-flex text-ink-faint"
            aria-label={definition.tooltip}
          >
            <Info size={14} strokeWidth={1.75} />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={isAttached ? onRemove : onAdd}
            title={isAttached ? 'Remove from chat context' : 'Add to chat'}
            className={`${iconBtn} ${isAttached ? 'border-sage-soft bg-sage-soft text-sage' : ''}`}
          >
            {isAttached ? <Minus size={14} /> : <Plus size={14} />}
          </button>
          <button type="button" className={iconBtn} title="More options" aria-label="More options">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {definition.compareBars ? (
        <ActualVsPriorBars rows={definition.compareBars} />
      ) : (
        <ul className="flex flex-col gap-2">
          {definition.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
