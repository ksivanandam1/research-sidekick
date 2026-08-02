import { CheckCircle2, CircleHelp, Flag } from 'lucide-react';
import type { Confidence, FindingKind } from '../../types';

const KIND_META: Record<FindingKind, { label: string; icon: typeof CheckCircle2; textClass: string; bgClass: string }> = {
  evidence: { label: 'Evidence', icon: CheckCircle2, textClass: 'text-sage', bgClass: 'bg-sage-soft' },
  assumption: { label: 'Assumption', icon: Flag, textClass: 'text-amber', bgClass: 'bg-amber-soft' },
  unknown: { label: 'Unknown', icon: CircleHelp, textClass: 'text-fog', bgClass: 'bg-fog-soft' },
};

interface BadgeProps {
  kind: FindingKind;
  confidence?: Confidence;
}

export function Badge({ kind, confidence }: BadgeProps) {
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.textClass} ${meta.bgClass}`}>
      <Icon size={12} strokeWidth={2.25} />
      {meta.label}
      {confidence && <span className="font-normal opacity-70">· {confidence} confidence</span>}
    </span>
  );
}
