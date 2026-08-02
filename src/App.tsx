import { AppShell } from './components/Shell/AppShell';
import { InsightsCanvas } from './components/Canvas/InsightsCanvas';
import { ChatPanel } from './components/Panel/ChatPanel';
import { Toast } from './components/Panel/Toast';
import { ResearchProvider, useResearch } from './state/ResearchContext';

function AppContent() {
  const { panelOpen } = useResearch();
  return (
    <AppShell panelOpen={panelOpen} panel={<ChatPanel />}>
      <InsightsCanvas />
    </AppShell>
  );
}

export default function App() {
  return (
    <ResearchProvider>
      <AppContent />
      <Toast />
    </ResearchProvider>
  );
}
