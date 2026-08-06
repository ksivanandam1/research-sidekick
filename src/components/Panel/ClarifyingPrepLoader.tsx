import { ChevronDown } from 'lucide-react';
import { MoonLoader } from './MoonLoader';

/** Same collapsed chrome as ThoughtTrace while the agent is working. */
export function ClarifyingPrepLoader() {
  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1">
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <MoonLoader size={12} />
        <span className="thought-shimmer-text truncate text-[11px] font-medium">
          Clarifying assumptions
        </span>
      </span>
      <ChevronDown size={13} className="shrink-0 text-ink-faint" />
    </div>
  );
}
