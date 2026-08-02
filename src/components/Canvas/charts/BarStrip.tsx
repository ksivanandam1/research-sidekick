import type { SeriesPoint } from '../../../types';

interface BarStripProps {
  points: SeriesPoint[];
  highlightIndex?: number;
  colorClassName?: string;
  highlightClassName?: string;
}

export function BarStrip({
  points,
  highlightIndex,
  colorClassName = 'text-ocean',
  highlightClassName = 'text-terracotta',
}: BarStripProps) {
  const values = points.map((p) => p.value);
  const max = Math.max(...values) || 1;

  return (
    <div className="flex h-14 w-full items-end gap-[3px]">
      {values.map((v, i) => {
        const heightPct = Math.max(8, (v / max) * 100);
        const isHighlight = i === highlightIndex;
        return (
          <div
            key={i}
            className={`flex-1 rounded-t-[3px] bg-current ${isHighlight ? highlightClassName : colorClassName}`}
            style={{ height: `${heightPct}%`, opacity: isHighlight ? 1 : 0.32 }}
          />
        );
      })}
    </div>
  );
}
