import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface BreadcrumbsProps {
  /** Ancestor labels from the root turn down to (not including) the active node. */
  trail: string[];
  activeLabel: string;
  depth: number;
  onBack: () => void;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function Breadcrumbs({ trail, activeLabel, depth, onBack }: BreadcrumbsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <button
        type="button"
        onClick={onBack}
        title="Back one level"
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-ink-faint transition-colors hover:bg-surface hover:text-ink"
      >
        <ChevronLeft size={12} />
        <span className="max-w-[120px] truncate">{truncate(trail[trail.length - 1] ?? '', 28)}</span>
      </button>
      <ChevronRight size={12} className="shrink-0 text-ink-faint" />
      <span className="min-w-0 truncate rounded-full bg-surface px-2 py-1 font-medium text-ink">
        {truncate(activeLabel, 40)}
      </span>
      {depth > 1 && (
        <span
          title={['Root', ...trail.slice(1), activeLabel].join(' → ')}
          className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-ocean-soft px-2 py-0.5 text-[10px] font-semibold text-ocean"
        >
          <Layers size={10} />
          {depth} levels deep
        </span>
      )}
    </div>
  );
}
