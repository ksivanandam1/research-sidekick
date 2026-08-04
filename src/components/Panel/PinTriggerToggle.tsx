import type { PinTrigger } from '../../types';
import { useResearch } from '../../state/ResearchContext';

const OPTIONS: { id: PinTrigger; label: string }[] = [
  { id: 'drilldown', label: 'On drill-down' },
  { id: 'newTurn', label: 'On new turn' },
];

export function PinTriggerToggle() {
  const { pinTrigger, setPinTrigger } = useResearch();

  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Pin
      </span>
      <div className="inline-flex rounded-full border border-border-soft bg-surface-soft p-0.5">
        {OPTIONS.map((opt) => {
          const active = pinTrigger === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPinTrigger(opt.id)}
              className={
                active
                  ? 'rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-surface'
                  : 'rounded-full px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:text-ink'
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
