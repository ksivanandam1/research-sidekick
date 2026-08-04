interface DnaLoaderProps {
  size?: number;
  className?: string;
}

/** Compact horizontal double-helix used as the in-progress indicator. */
export function DnaLoader({ size = 12, className = '' }: DnaLoaderProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 12"
      fill="none"
      aria-hidden
      className={`dna-loader shrink-0 text-ink-soft ${className}`}
    >
      <path
        className="dna-loader-strand"
        d="M1 3c2 0 2 6 4 6s2-6 4-6 2 6 4 6 2-6 3-6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="dna-loader-strand dna-loader-strand-b"
        d="M1 9c2 0 2-6 4-6s2 6 4 6 2-6 4-6 2 6 3 6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <line className="dna-loader-rung" x1="3.2" y1="4.6" x2="3.2" y2="7.4" />
        <line
          className="dna-loader-rung"
          x1="7"
          y1="4.2"
          x2="7"
          y2="7.8"
          style={{ animationDelay: '0.15s' }}
        />
        <line
          className="dna-loader-rung"
          x1="10.8"
          y1="4.6"
          x2="10.8"
          y2="7.4"
          style={{ animationDelay: '0.3s' }}
        />
        <line
          className="dna-loader-rung"
          x1="14"
          y1="4.2"
          x2="14"
          y2="7.8"
          style={{ animationDelay: '0.45s' }}
        />
      </g>
    </svg>
  );
}
