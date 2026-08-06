import { Dna } from 'lucide-react';
import { getContextItem } from '../../data/mockData';
import { useResearch } from '../../state/ResearchContext';
import { isChartContext } from '../../types';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  const { attachedContext } = useResearch();
  const chartContext = attachedContext.filter(isChartContext);

  if (chartContext.length === 0) return null;

  const questions = Array.from(
    new Set(chartContext.flatMap((item) => getContextItem(item.id).suggestedQuestions)),
  ).slice(0, 3);
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-1.5">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-border-soft bg-surface px-2.5 py-1 text-left text-[11px] font-medium text-ink-soft shadow-soft transition-colors hover:border-border hover:text-ink"
        >
          <Dna size={10} className="shrink-0" />
          <span className="truncate">{q}</span>
        </button>
      ))}
    </div>
  );
}
