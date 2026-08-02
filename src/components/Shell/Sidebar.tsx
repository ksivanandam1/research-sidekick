import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Compass, LayoutGrid, PanelLeftClose, PanelLeftOpen, Settings, ShieldCheck } from 'lucide-react';

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
}

export function Sidebar({ forceCollapsed = false }: SidebarProps) {
  const [userCollapsed, setUserCollapsed] = useState(false);
  const collapsed = forceCollapsed || userCollapsed;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-border bg-surface px-3 py-5"
    >
      <div className={`mb-6 flex items-start ${collapsed ? 'flex-col items-center gap-2' : 'justify-between gap-2'}`}>
        <div className={`flex w-fit items-center gap-2 ${collapsed ? '' : 'px-2'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink text-surface">
            <ShieldCheck size={16} strokeWidth={2.25} />
          </div>
          {!collapsed && (
            <div className="w-fit leading-tight">
              <p className="text-sm font-semibold text-ink">Tomoro</p>
              <p className="text-[11px] text-ink-faint">Insights</p>
            </div>
          )}
        </div>

        {!forceCollapsed && (
          <button
            type="button"
            onClick={() => setUserCollapsed((c) => !c)}
            title={userCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-soft shadow-soft transition-colors hover:text-ink"
          >
            {userCollapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
          </button>
        )}
      </div>

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
  );
}
