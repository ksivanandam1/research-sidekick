import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  parentLabel: string;
  activeLabel: string;
  onBack: () => void;
}

export function Breadcrumbs({ parentLabel, activeLabel, onBack }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        type="button"
        onClick={onBack}
        title="Back to full analysis"
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-ink-faint transition-colors hover:bg-surface hover:text-ink"
      >
        <ChevronLeft size={12} />
        <span className="max-w-[160px] truncate">{parentLabel}</span>
      </button>
      <ChevronRight size={12} className="shrink-0 text-ink-faint" />
      <span className="min-w-0 truncate rounded-full bg-surface px-2 py-1 font-medium text-ink">{activeLabel}</span>
    </div>
  );
}
