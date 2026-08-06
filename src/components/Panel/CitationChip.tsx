import { Lock } from 'lucide-react';
import { getSource } from '../../data/mockData';
import { SourceIcon, SOURCE_PLATFORM } from './SourceIcon';

interface CitationChipProps {
  sourceId: string;
  isActive: boolean;
  onClick: () => void;
}

export function CitationChip({ sourceId, isActive, onClick }: CitationChipProps) {
  const source = getSource(sourceId);
  const label = SOURCE_PLATFORM[source.type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
        isActive
          ? 'border-ink bg-ink text-surface'
          : source.restricted
            ? 'border-border-soft bg-surface-soft text-ink-faint'
            : 'border-border-soft bg-surface-soft text-ink-soft hover:border-border hover:text-ink'
      }`}
    >
      {source.restricted ? <Lock size={10} /> : <SourceIcon type={source.type} size={12} />}
      {label}
    </button>
  );
}
