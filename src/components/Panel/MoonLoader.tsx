import { useId } from 'react';

interface MoonLoaderProps {
  size?: number;
  className?: string;
}

/** Cover-circle x offsets for phases 0–7 (new → full → new). */
const PHASE_OFFSETS = [14, 5.5, 3, 1.25, 0, -1.25, -3, -5.5] as const;

function MoonPhase({ phase, size, maskId }: { phase: number; size: number; maskId: string }) {
  const offset = PHASE_OFFSETS[phase] ?? 0;
  const isNew = phase === 0;
  const isFull = phase === 4;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="block">
      <defs>
        <mask id={maskId}>
          <circle cx="8" cy="8" r="7" fill="white" />
          {!isFull && <circle cx={8 + offset} cy="8" r="7" fill="black" />}
        </mask>
      </defs>
      {isNew ? (
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
      ) : (
        <circle cx="8" cy="8" r="7" fill="currentColor" mask={`url(#${maskId})`} />
      )}
    </svg>
  );
}

/** Simple black-and-white moon-phase spinner for in-progress thinking. */
export function MoonLoader({ size = 12, className = '' }: MoonLoaderProps) {
  const uid = useId();

  return (
    <span
      className={`moon-loader shrink-0 text-zinc-900 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {PHASE_OFFSETS.map((_, index) => (
        <span
          key={index}
          className="moon-loader-frame"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <MoonPhase phase={index} size={size} maskId={`${uid}-p${index}`} />
        </span>
      ))}
    </span>
  );
}
