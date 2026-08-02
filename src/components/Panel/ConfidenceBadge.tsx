import { Gauge } from 'lucide-react';
import type { Confidence } from '../../types';

const META: Record<
  Confidence,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  high: {
    label: 'High confidence',
    textClass: 'text-sage',
    bgClass: 'bg-sage-soft',
    borderClass: 'border-sage/25',
  },
  medium: {
    label: 'Medium confidence',
    textClass: 'text-amber',
    bgClass: 'bg-amber-soft',
    borderClass: 'border-amber/25',
  },
  low: {
    label: 'Low confidence',
    textClass: 'text-terracotta',
    bgClass: 'bg-terracotta-soft',
    borderClass: 'border-terracotta/25',
  },
};

interface ConfidenceBadgeProps {
  level: Confidence;
}

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const meta = META[level];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.textClass} ${meta.bgClass} ${meta.borderClass}`}
    >
      <Gauge size={12} strokeWidth={2.25} />
      {meta.label}
    </span>
  );
}
