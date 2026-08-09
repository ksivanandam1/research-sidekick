import { MoreVertical, Plus } from 'lucide-react';

const iconBtn =
  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-soft bg-surface text-ink-soft';

function Sparkline({
  path,
  colorClassName,
  fill = false,
}: {
  path: string;
  colorClassName: string;
  fill?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 36" className="h-9 w-full overflow-visible" preserveAspectRatio="none">
      {fill && (
        <path d={`${path} L97,36 L3,36 Z`} className={colorClassName} fill="currentColor" opacity={0.12} />
      )}
      <path
        d={path}
        className={colorClassName}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniChartCard({
  value,
  path,
  colorClassName,
  fill = false,
  showOverflow = false,
  compact = false,
  widthClassName = 'w-[168px]',
}: {
  value: string;
  path: string;
  colorClassName: string;
  fill?: boolean;
  showOverflow?: boolean;
  compact?: boolean;
  widthClassName?: string;
}) {
  return (
    <div
      className={`${widthClassName} rounded-2xl bg-surface p-3 text-left shadow-soft`}
    >
      <div className="mb-2.5 flex items-start justify-between gap-1.5">
        <p className="truncate text-[11px] font-medium text-ink-soft">Chart</p>
        <div className="flex shrink-0 items-center gap-1">
          <span className={iconBtn} aria-hidden>
            <Plus size={11} strokeWidth={2.25} />
          </span>
          {showOverflow && (
            <span className={iconBtn} aria-hidden>
              <MoreVertical size={11} strokeWidth={2.25} />
            </span>
          )}
        </div>
      </div>
      <p
        className={`mb-2 font-semibold tracking-tight text-ink ${
          compact ? 'text-[15px]' : 'text-lg'
        }`}
      >
        {value}
      </p>
      <div className={compact ? '[&_svg]:h-7' : undefined}>
        <Sparkline path={path} colorClassName={colorClassName} fill={fill} />
      </div>
    </div>
  );
}

export function InvestigationEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 py-8 text-center">
      <div
        className="group relative flex h-40 w-full max-w-[280px] items-center justify-center"
        aria-hidden
      >
        <div className="pointer-events-none absolute opacity-[0.55] transition-[transform,opacity] duration-300 ease-out [transform:rotate(8deg)_translate(18px,6px)_scale(0.92)] group-hover:opacity-70 group-hover:[transform:rotate(16deg)_translate(42px,10px)_scale(0.94)]">
          <MiniChartCard
            value="4.2%"
            path="M3,28 L20,24 L40,26 L60,18 L80,12 L97,16"
            colorClassName="text-chart-2"
            compact
            widthClassName="w-[150px]"
          />
        </div>
        <div className="pointer-events-none absolute opacity-75 transition-[transform,opacity] duration-300 ease-out [transform:rotate(-2deg)_translate(-14px,4px)_scale(0.96)] group-hover:opacity-[0.85] group-hover:[transform:rotate(-12deg)_translate(-40px,8px)_scale(0.97)]">
          <MiniChartCard
            value="2,184"
            path="M3,20 L20,22 L40,16 L60,18 L80,10 L97,12"
            colorClassName="text-chart-3"
            compact
            widthClassName="w-[156px]"
          />
        </div>
        <div className="relative z-10 transition-transform duration-300 ease-out [transform:rotate(-7deg)] group-hover:[transform:rotate(-3deg)_translateY(-6px)]">
          <MiniChartCard
            value="$4.8M"
            path="M3,22 L18,18 L33,24 L48,14 L63,16 L78,10 L97,20"
            colorClassName="text-chart-1"
            fill
            showOverflow
          />
        </div>
      </div>

      <div className="flex max-w-[240px] flex-col gap-1">
        <p className="text-sm font-medium text-ink-soft">Select a chart to investigate</p>
        <p className="text-xs leading-relaxed text-ink-faint">
          Click + on any metric in the dashboard to add to chat
        </p>
      </div>
    </div>
  );
}
