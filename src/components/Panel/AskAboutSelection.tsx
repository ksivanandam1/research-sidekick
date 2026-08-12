import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useResearch } from '../../state/ResearchContext';

const MIN_SELECTION_CHARS = 3;
const BUBBLE_GAP_PX = 8;

interface BubbleState {
  text: string;
  top: number;
  left: number;
  placeBelow: boolean;
}

interface AskAboutSelectionProps {
  sourceTurnId: string;
  enabled?: boolean;
  children: ReactNode;
}

function selectionInside(root: HTMLElement, selection: Selection): boolean {
  if (selection.rangeCount === 0 || selection.isCollapsed) return false;
  const anchor = selection.anchorNode;
  const focus = selection.focusNode;
  if (!anchor || !focus) return false;
  return root.contains(anchor) && root.contains(focus);
}

/**
 * Wraps answer summary prose. When the user highlights text inside, shows an
 * "Ask about this" bubble that attaches the excerpt to composer context.
 */
export function AskAboutSelection({
  sourceTurnId,
  enabled = true,
  children,
}: AskAboutSelectionProps) {
  const { attachExcerpt } = useResearch();
  const rootRef = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState<BubbleState | null>(null);

  const clearBubble = useCallback(() => setBubble(null), []);

  const updateFromSelection = useCallback(() => {
    if (!enabled) {
      setBubble(null);
      return;
    }
    const root = rootRef.current;
    const selection = window.getSelection();
    if (!root || !selection || !selectionInside(root, selection)) {
      setBubble(null);
      return;
    }

    const text = selection.toString().replace(/\s+/g, ' ').trim();
    if (text.length < MIN_SELECTION_CHARS) {
      setBubble(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rangeRect = range.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    if (rangeRect.width === 0 && rangeRect.height === 0) {
      setBubble(null);
      return;
    }

    const centerX = rangeRect.left + rangeRect.width / 2 - rootRect.left;
    const spaceAbove = rangeRect.top - rootRect.top;
    const placeBelow = spaceAbove < 36;
    const top = placeBelow
      ? rangeRect.bottom - rootRect.top + BUBBLE_GAP_PX
      : rangeRect.top - rootRect.top - BUBBLE_GAP_PX;

    setBubble({
      text,
      top,
      left: Math.min(Math.max(centerX, 48), Math.max(rootRect.width - 48, 48)),
      placeBelow,
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setBubble(null);
      return;
    }

    const onSelectionChange = () => {
      // Defer so mouseup selection is settled.
      window.requestAnimationFrame(updateFromSelection);
    };

    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('mouseup', onSelectionChange);

    const scrollRoot = rootRef.current?.closest('.overflow-y-auto');
    const onScroll = () => clearBubble();
    scrollRoot?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('mouseup', onSelectionChange);
      scrollRoot?.removeEventListener('scroll', onScroll);
    };
  }, [enabled, updateFromSelection, clearBubble]);

  function handleAsk() {
    if (!bubble) return;
    attachExcerpt({ text: bubble.text, sourceTurnId });
    window.getSelection()?.removeAllRanges();
    clearBubble();
  }

  return (
    <div ref={rootRef} className="relative">
      {children}
      {bubble && (
        <button
          type="button"
          onMouseDown={(event) => {
            // Keep the selection until click handler runs.
            event.preventDefault();
          }}
          onClick={handleAsk}
          className="absolute z-20 -translate-x-1/2 rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-xs font-medium text-ink shadow-soft transition-colors hover:border-border hover:bg-surface-soft"
          style={{
            top: bubble.top,
            left: bubble.left,
            transform: bubble.placeBelow
              ? 'translate(-50%, 0)'
              : 'translate(-50%, -100%)',
          }}
        >
          Ask about this
        </button>
      )}
    </div>
  );
}
