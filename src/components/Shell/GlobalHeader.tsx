import { Bell, CircleHelp, PanelLeft, Search, Sparkle } from 'lucide-react';
import { useResearch } from '../../state/ResearchContext';

interface GlobalHeaderProps {
  onToggleSidebar: () => void;
}

export function GlobalHeader({ onToggleSidebar }: GlobalHeaderProps) {
  const { openPanel, attachedContext, panelOpen, panelUnread } = useResearch();
  const hasInvestigationContext = attachedContext.length > 0 || panelUnread;
  const showResearchBadge =
    !panelOpen && (attachedContext.length > 0 || panelUnread);
  const researchBadgeCount =
    attachedContext.length > 0 ? attachedContext.length : 1;

  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-3 bg-ink px-3 text-surface">
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-surface/80 transition-colors hover:bg-white/10 hover:text-surface"
      >
        <PanelLeft size={18} strokeWidth={1.75} />
      </button>

      <div className="mx-auto flex min-w-0 max-w-2xl flex-1 items-center justify-center px-2">
        <label className="relative hidden min-w-0 w-full sm:block">
          <span className="sr-only">Search</span>
          <Search
            size={15}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            placeholder="Search metrics, reports, and sources"
            className="h-9 w-full rounded-lg border-0 bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage/40"
          />
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={openPanel}
          title={
            hasInvestigationContext
              ? 'Open research inspector'
              : 'Open research inspector — select a chart on the dashboard to begin'
          }
          aria-label="Open research inspector"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber via-sage to-ocean text-white">
            <Sparkle size={12} strokeWidth={2.25} />
          </span>
          {showResearchBadge && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sage px-1 text-[9px] font-semibold text-white">
              {researchBadgeCount}
            </span>
          )}
        </button>

        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-surface/80 transition-colors hover:bg-white/10 hover:text-surface"
        >
          <Bell size={17} strokeWidth={1.75} />
          <span className="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] font-semibold text-white">
            3
          </span>
        </button>

        <button
          type="button"
          title="Help"
          aria-label="Help"
          className="flex h-8 w-8 items-center justify-center rounded-md text-surface/80 transition-colors hover:bg-white/10 hover:text-surface"
        >
          <CircleHelp size={17} strokeWidth={1.75} />
        </button>

        <div
          title="R. Alvarez · Revenue analyst"
          className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-sage-soft text-[11px] font-semibold text-sage"
        >
          RA
        </div>
      </div>
    </header>
  );
}
