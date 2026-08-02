import type { SeriesPoint } from '../../../types';

interface SparklineProps {
  points: SeriesPoint[];
  anomalyIndex?: number;
  colorClassName?: string;
}

export function Sparkline({ points, anomalyIndex, colorClassName = 'text-ocean' }: SparklineProps) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 36;
  const pad = 3;

  const coords = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length - 1][0].toFixed(2)},${h} L${coords[0][0].toFixed(2)},${h} Z`;
  const anomaly = anomalyIndex != null ? coords[anomalyIndex] : undefined;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full overflow-visible" preserveAspectRatio="none">
      <path d={areaPath} className={colorClassName} fill="currentColor" opacity={0.1} />
      <path
        d={linePath}
        className={colorClassName}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {anomaly && (
        <circle cx={anomaly[0]} cy={anomaly[1]} r={2.75} className="text-terracotta" fill="currentColor" stroke="white" strokeWidth={1} />
      )}
    </svg>
  );
}
