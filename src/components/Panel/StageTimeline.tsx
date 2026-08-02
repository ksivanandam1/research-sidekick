import type { Stage } from '../../types';

const STAGES: { key: Stage; label: string }[] = [
  { key: 'analysing', label: 'Analysing' },
  { key: 'retrieving', label: 'Retrieving' },
  { key: 'citing', label: 'Citing' },
  { key: 'drafting', label: 'Drafting' },
  { key: 'ready', label: 'Ready' },
];

export function StageTimeline({ stage }: { stage: Stage }) {
  const activeIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {STAGES.map((s, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending';
        return (
          <div key={s.key} className="flex items-center gap-1">
            <span
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium transition-colors ${
                state === 'active'
                  ? 'bg-ink text-surface'
                  : state === 'done'
                    ? 'bg-sage-soft text-sage'
                    : 'bg-surface-soft text-ink-faint'
              }`}
            >
              {state === 'active' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-surface" />}
              {s.label}
            </span>
            {i < STAGES.length - 1 && <span className={`h-px w-3 ${state === 'done' ? 'bg-sage' : 'bg-border'}`} />}
          </div>
        );
      })}
    </div>
  );
}
