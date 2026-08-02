import type { SeriesPoint } from '../../../types';

interface SteppedLineProps {
  points: SeriesPoint[];
  colorClassName?: string;
}

export function SteppedLine({ points, colorClassName = 'text-sage' }: SteppedLineProps) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 36;
  const pad = 3;
  const stepX = (w - pad * 2) / (values.length - 1);

  const toY = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);

  let path = '';
  values.forEach((v, i) => {
    const x = pad + i * stepX;
    const y = toY(v);
    if (i === 0) {
      path += `M${x.toFixed(2)},${y.toFixed(2)}`;
    } else {
      const prevY = toY(values[i - 1]);
      path += ` L${x.toFixed(2)},${prevY.toFixed(2)} L${x.toFixed(2)},${y.toFixed(2)}`;
    }
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full overflow-visible" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={colorClassName} />
    </svg>
  );
}
