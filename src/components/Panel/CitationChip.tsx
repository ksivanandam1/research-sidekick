import { FileText, Lock } from 'lucide-react';
import { getSource } from '../../data/mockData';

interface CitationChipProps {
  sourceId: string;
  isActive: boolean;
  onClick: () => void;
}

export function CitationChip({ sourceId, isActive, onClick }: CitationChipProps) {
  const source = getSource(sourceId);
  const shortLabel = source.name.split('—')[0].trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
        isActive
          ? 'border-ink bg-ink text-surface'
          : source.restricted
            ? 'border-border-soft bg-surface-soft text-ink-faint'
            : 'border-border-soft bg-surface-soft text-ink-soft hover:border-border hover:text-ink'
      }`}
    >
      {source.restricted ? <Lock size={10} /> : <FileText size={10} />}
      {shortLabel}
    </button>
  );
}
