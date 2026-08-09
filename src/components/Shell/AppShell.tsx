import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GlobalHeader } from './GlobalHeader';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  panel: ReactNode;
  panelOpen: boolean;
}

const PANEL_WIDTH = 440;

export function AppShell({ children, panel, panelOpen }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-canvas">
      <GlobalHeader onToggleSidebar={() => setSidebarCollapsed((c) => !c)} />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <Sidebar forceCollapsed={panelOpen} collapsed={sidebarCollapsed} />

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>

        <motion.div
          className="h-full shrink-0 overflow-hidden border-l border-border bg-surface"
          initial={false}
          animate={{ width: panelOpen ? PANEL_WIDTH : 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        >
          <div className="h-full" style={{ width: PANEL_WIDTH }}>
            {panel}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
