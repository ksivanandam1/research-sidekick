import { X } from 'lucide-react';

interface ContextChipProps {
  title: string;
  onRemove?: () => void;
}

export function ContextChip({ title, onRemove }: ContextChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink">
      {title}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${title} from context`}
          className="ml-0.5 rounded-full p-0.5 text-ink-faint transition-colors hover:bg-border-soft hover:text-ink"
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}
