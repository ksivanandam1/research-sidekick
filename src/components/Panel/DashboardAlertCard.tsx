import { Bell } from 'lucide-react';
import type { DashboardAlert } from '../../types';

interface DashboardAlertCardProps extends DashboardAlert {
  onOpen?: () => void;
}

/** Compact card reflecting an alert just added to the dashboard. */
export function DashboardAlertCard({
  metricTitle,
  timeframeLabel,
  triggerLabel,
  onOpen,
}: DashboardAlertCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title={`View ${metricTitle} alert`}
      className="group flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-border-soft bg-surface py-2.5 pl-2.5 pr-3 text-left shadow-soft transition-colors hover:bg-surface-soft"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-soft">
        <Bell size={14} fill="currentColor" strokeWidth={0} className="alert-bell-icon text-ink-soft" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 pb-1">
          <p className="truncate text-sm font-semibold leading-tight text-ink">{metricTitle}</p>
          <span className="shrink-0 rounded-full bg-sage-soft px-1.5 py-0.5 text-[10px] font-semibold text-sage">
            Active
          </span>
        </div>
        <p className="truncate text-xs leading-tight text-ink-soft">
          {timeframeLabel} · {triggerLabel}
        </p>
      </div>
    </button>
  );
}
