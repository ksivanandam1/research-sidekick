import { useState } from 'react';
import type { AnswerChart } from '../../types';

const SERIES_COLORS = ['#6D8FFE', '#FF5413', '#01B183'] as const;

interface AnswerInsightChartProps {
  chart: AnswerChart;
}

function formatMoney(m: number): string {
  return `$${m.toFixed(2)}M`;
}

function formatDelta(actual: number, prior: number): { pct: number; label: string } {
  const pct = prior === 0 ? 0 : ((actual - prior) / prior) * 100;
  const arrow = pct < 0 ? '▼' : '▲';
  return { pct, label: `${arrow} ${Math.abs(pct).toFixed(0)}%` };
}

export function AnswerInsightChart({ chart }: AnswerInsightChartProps) {
  const initial =
    chart.defaultSelectedIndex ??
    chart.series.findIndex((s) => /outbound/i.test(s.label));
  const [selectedIndex, setSelectedIndex] = useState(
    initial >= 0 ? initial : 0,
  );

  const max = Math.max(...chart.series.flatMap((s) => [s.actual, s.prior]), 0.01);
  const selected = chart.series[selectedIndex];
  const selectedColor = SERIES_COLORS[selectedIndex % SERIES_COLORS.length];
  const delta = selected ? formatDelta(selected.actual, selected.prior) : null;
  const actualLabel = chart.actualLabel ?? 'Q3';
  const priorLabel = chart.priorLabel ?? 'Q2';

  return (
    <div className="flex flex-col gap-3 rounded-2xl p-3" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="px-1">
        <p className="text-sm font-semibold text-ink">{chart.title}</p>
        {chart.subtitle && <p className="mt-0.5 text-[11px] text-ink-faint">{chart.subtitle}</p>}
      </div>

      <div className="flex flex-col gap-2">
        {chart.series.map((row, index) => {
          const color = SERIES_COLORS[index % SERIES_COLORS.length];
          const isSelected = index === selectedIndex;
          const rowDelta = formatDelta(row.actual, row.prior);
          const priorWidth = Math.max(8, (row.prior / max) * 100);
          const actualWidth = Math.max(8, (row.actual / max) * 100);
          const dimmed = selectedIndex !== null && !isSelected;

          return (
            <button
              key={row.label}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-pressed={isSelected}
              className="rounded-xl bg-white p-3 text-left transition-[opacity,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
              style={{
                opacity: dimmed ? 0.45 : 1,
                boxShadow: isSelected ? '0 0 0 5px rgba(121, 120, 120, 0.5)' : 'none',
              }}
            >
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="truncate text-xs font-semibold text-ink">{row.label}</p>
                <p className="shrink-0 text-xs tabular-nums">
                  <span className="font-semibold text-ink">{formatMoney(row.actual)}</span>
                  <span className="ml-1.5 font-medium" style={{ color }}>
                    {rowDelta.label}
                  </span>
                </p>
              </div>

              <div className="relative h-3 w-full">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${priorWidth}%`, backgroundColor: `${color}33` }}
                  title={`${priorLabel}: ${formatMoney(row.prior)}`}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${actualWidth}%`, backgroundColor: color }}
                  title={`${actualLabel}: ${formatMoney(row.actual)}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {selected && delta && (
        <div className="rounded-xl bg-white px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            {selected.label}
          </p>
          <p className="mt-1 text-sm text-ink">
            <span className="font-semibold" style={{ color: selectedColor }}>
              {formatMoney(selected.actual)}
            </span>
            <span className="text-ink-soft"> {actualLabel}</span>
            <span className="mx-1.5 text-ink-faint">vs</span>
            <span className="font-medium text-ink">{formatMoney(selected.prior)}</span>
            <span className="text-ink-soft"> {priorLabel}</span>
            <span className="ml-2 text-xs font-semibold" style={{ color: selectedColor }}>
              {delta.label} QoQ
            </span>
          </p>
          {/outbound/i.test(selected.label) && (
            <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
              Nearly half of prior-quarter outbound Pro volume — the concentration of the Q3 miss.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[#6D8FFE]" />
          Solid = {actualLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[#6D8FFE]/33" />
          Tint = {priorLabel}
        </span>
        <span>Click a channel to focus</span>
      </div>
    </div>
  );
}
