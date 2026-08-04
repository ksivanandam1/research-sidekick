import { motion } from 'framer-motion';
import { BarChart3, Compass, LayoutGrid, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutGrid, active: true },
  { label: 'Reports', icon: BarChart3, active: false },
  { label: 'Sources', icon: Compass, active: false },
  { label: 'Settings', icon: Settings, active: false },
];

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 72;

interface SidebarProps {
  /** When true (research panel open), nav collapses to icon rail to free horizontal space. */
  forceCollapsed?: boolean;
  collapsed: boolean;
}

export function Sidebar({ forceCollapsed = false, collapsed: userCollapsed }: SidebarProps) {
  const collapsed = forceCollapsed || userCollapsed;

  return (
    <>
      {/* Reserves icon-rail width in the page flow so the dashboard isn't covered when collapsed. */}
      <div className="h-full shrink-0" style={{ width: COLLAPSED_WIDTH }} aria-hidden />
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        className="absolute inset-y-0 left-0 z-20 flex flex-col overflow-hidden border-r border-border bg-surface px-3 py-5"
      >
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              disabled={!active}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${active ? 'bg-surface-soft font-medium text-ink' : 'cursor-default text-ink-faint'}`}
            >
              <Icon size={16} strokeWidth={2} className="shrink-0" />
              {!collapsed && label}
            </button>
          ))}
        </nav>

        <div
          title={collapsed ? 'R. Alvarez · Revenue analyst' : undefined}
          className={`flex items-center gap-2.5 rounded-xl border border-border-soft py-2.5 ${
            collapsed ? 'justify-center' : 'px-2.5'
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-soft text-xs font-semibold text-sage">
            RA
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-ink">R. Alvarez</p>
              <p className="truncate text-[11px] text-ink-faint">Revenue analyst</p>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
