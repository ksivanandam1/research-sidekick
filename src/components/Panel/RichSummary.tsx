import type { ReactNode } from 'react';
import { Compass } from 'lucide-react';
import type { Finding } from '../../types';
import { InlineCitation } from './InlineCitation';

function renderInline(text: string, citations: Finding[]): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {renderInline(part.slice(2, -2), citations)}
        </strong>
      );
    }
    const cite = part.match(/^\[(\d+)\]$/);
    if (cite) {
      const number = Number(cite[1]);
      const finding = citations[number - 1];
      if (!finding) return <span key={i}>{part}</span>;
      return <InlineCitation key={i} number={number} finding={finding} />;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderBlock(block: string, key: number, citations: Finding[]) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed === '---') {
    return <hr key={key} className="border-0 border-t border-border-soft" />;
  }

  if (trimmed.startsWith('## ')) {
    return (
      <h2 key={key} className="text-lg font-semibold leading-snug text-ink">
        {renderInline(trimmed.slice(3), citations)}
      </h2>
    );
  }
  if (trimmed.startsWith('### ')) {
    return (
      <h3 key={key} className="text-sm font-semibold leading-snug text-ink">
        {renderInline(trimmed.slice(4), citations)}
      </h3>
    );
  }
  // Callout — same chrome as AnswerSection "Suggested next check"
  if (trimmed.startsWith('>>> ')) {
    const [titleLine, ...rest] = trimmed.slice(4).split('\n');
    const body = rest.join('\n').trim();
    return (
      <div
        key={key}
        className="flex items-start gap-2 rounded-xl border border-ocean-soft bg-ocean-soft/60 p-3"
      >
        <Compass size={14} className="mt-0.5 shrink-0 text-ocean" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ocean">
            {renderInline(titleLine, citations)}
          </p>
          {body ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{renderInline(body, citations)}</p>
          ) : null}
        </div>
      </div>
    );
  }

  const lines = trimmed.split('\n');
  const isList = lines.every((line) => /^\d+\.\s/.test(line.trim()) || line.trim() === '');
  if (isList) {
    return (
      <ol key={key} className="list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-ink">
        {lines
          .filter((line) => line.trim())
          .map((line, i) => (
            <li key={i}>{renderInline(line.replace(/^\d+\.\s*/, ''), citations)}</li>
          ))}
      </ol>
    );
  }

  return (
    <p key={key} className="text-sm font-normal leading-relaxed text-ink">
      {renderInline(trimmed, citations)}
    </p>
  );
}

interface RichSummaryProps {
  text: string;
  /** Evidence findings in citation order — `[1]` maps to index 0. */
  citations?: Finding[];
}

export function RichSummary({ text, citations = [] }: RichSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      {text.split(/\n\n+/).map((block, i) => renderBlock(block, i, citations))}
    </div>
  );
}
