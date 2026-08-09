import type { Confidence } from '../../types';

const META: Record<
  Confidence,
  { label: string; chipClass: string; dotClass: string }
> = {
  high: {
    label: 'High confidence',
    chipClass: 'border-sage/25 bg-sage-soft text-sage',
    dotClass: 'bg-sage',
  },
  medium: {
    label: 'Medium confidence',
    chipClass: 'border-amber/25 bg-amber-soft text-amber',
    dotClass: 'bg-amber',
  },
  low: {
    label: 'Low confidence',
    chipClass: 'border-terracotta/25 bg-terracotta-soft text-terracotta',
    dotClass: 'bg-terracotta',
  },
};

interface ConfidenceBadgeProps {
  level?: Confidence;
}

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  if (!level) return null;

  const meta = META[level];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.chipClass}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dotClass}`} aria-hidden />
      {meta.label}
    </span>
  );
}
