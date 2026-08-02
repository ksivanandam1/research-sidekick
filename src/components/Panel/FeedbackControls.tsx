import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Finding } from '../../types';

interface FeedbackControlsProps {
  finding: Finding;
  isRevising: boolean;
  onThumbsUp: () => void;
  onDoesNotHold: () => void;
}

export function FeedbackControls({ finding, isRevising, onThumbsUp, onDoesNotHold }: FeedbackControlsProps) {
  if (isRevising) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
        <Loader2 size={12} className="animate-spin" />
        Re-checking…
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onThumbsUp}
        title="This looks right"
        className={`rounded-full p-1 transition-colors ${
          finding.feedback === 'up' ? 'bg-sage-soft text-sage' : 'text-ink-faint hover:bg-surface-soft hover:text-ink'
        }`}
      >
        <ThumbsUp size={13} />
      </button>
      <button
        type="button"
        onClick={onDoesNotHold}
        title="Flag this assumption as not holding"
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-ink-faint transition-colors hover:bg-terracotta-soft hover:text-terracotta"
      >
        <ThumbsDown size={12} />
        Doesn't hold
      </button>
    </div>
  );
}
