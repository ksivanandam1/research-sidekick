export interface CompareBarRow {
  label: string;
  /** Current quarter value in $M */
  actual: number;
  /** Prior quarter value in $M */
  prior: number;
}

interface ActualVsPriorBarsProps {
  rows: CompareBarRow[];
  /** QoQ drop threshold (pct points) that triggers the alert color. Default 15. */
  downThresholdPct?: number;
}

const SERIES_COLORS = ['#6D8FFE', '#FF5413', '#01B183'] as const;

function formatMoney(m: number): string {
  return `$${m.toFixed(2)}M`;
}

export function ActualVsPriorBars({ rows, downThresholdPct = 15 }: ActualVsPriorBarsProps) {
  const max = Math.max(...rows.flatMap((r) => [r.actual, r.prior]), 0.01);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => {
          const color = SERIES_COLORS[index % SERIES_COLORS.length];
          const deltaPct = row.prior === 0 ? 0 : ((row.actual - row.prior) / row.prior) * 100;
          const isDownHard = deltaPct <= -downThresholdPct;
          const priorWidth = Math.max(6, (row.prior / max) * 100);
          const actualWidth = Math.max(6, (row.actual / max) * 100);

          return (
            <div key={row.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink">{row.label}</p>
                <p className="shrink-0 text-sm tabular-nums">
                  <span className="font-semibold text-ink">{formatMoney(row.actual)}</span>
                  <span
                    className="ml-2 text-xs font-medium"
                    style={{ color: isDownHard ? '#FF5413' : deltaPct < 0 ? undefined : '#01B183' }}
                  >
                    {deltaPct < 0 ? '▼' : '▲'} {Math.abs(deltaPct).toFixed(0)}%
                  </span>
                </p>
              </div>
              <div className="relative h-3.5 w-full">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${priorWidth}%`, backgroundColor: `${color}33` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${actualWidth}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-dashed border-border-soft pt-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[#6D8FFE]" />
            Q3 actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[#6D8FFE]/33" />
            Q2 (prior quarter)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[#FF5413]" />
            Down &gt;15% QoQ
          </span>
        </div>
      </div>
    </div>
  );
}
