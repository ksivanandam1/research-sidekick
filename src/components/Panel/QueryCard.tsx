import type { ConversationTurn } from '../../types';
import { isMetricId } from '../../types';
import { getKpi } from '../../data/mockData';
import { ComposerContextCard } from './ContextChip';

interface QueryCardProps {
  turn: ConversationTurn;
}

export function QueryCard({ turn }: QueryCardProps) {
  const items = turn.contextItems ?? [];
  const unusedMetrics = turn.contextIds
    .filter(isMetricId)
    .filter((id) => !turn.usedContextIds.includes(id));

  return (
    <div
      data-user-query={turn.id}
      className="rounded-xl border border-border-soft bg-surface-soft px-3.5 py-3"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Your question</p>
      <p className="mt-1 text-sm font-medium leading-snug text-ink">{turn.question}</p>

      {items.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {items.map((item) =>
            item.kind === 'assumption' ? (
              <ComposerContextCard
                key={item.instanceId}
                title={item.title}
                timeframeLabel={item.subtitle}
                variant="assumption"
              />
            ) : (
              <ComposerContextCard
                key={item.instanceId}
                title={item.title}
                timeframeLabel={item.timeframeLabel}
                chartKind={item.chartKind}
                dimmed={isMetricId(item.id) && unusedMetrics.includes(item.id)}
              />
            ),
          )}
        </div>
      )}

      {unusedMetrics.length > 0 && turn.usedContextIds.length > 0 && (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
          Used {turn.usedContextIds.map((id) => getKpi(id).title).join(' + ')} for this answer —{' '}
          {unusedMetrics.map((id) => getKpi(id).title).join(', ')} didn't look directly relevant to
          the question.
        </p>
      )}
    </div>
  );
}
