import { useAgentSimulation } from './hooks/useAgentSimulation';
import { SessionHeader } from './components/SessionHeader';
import { AgentTree } from './components/AgentTree';
import { AgentDetail } from './components/AgentDetail';
import './App.css';

export default function App() {
  const { session, selectedAgentId, setSelectedAgentId, isPlaying, setIsPlaying, reset } =
    useAgentSimulation();

  const selectedAgent = selectedAgentId ? session.agents[selectedAgentId] : null;

  function handlePlayPause() {
    if (session.status === 'completed') {
      reset();
      return;
    }
    setIsPlaying(p => !p);
  }

  return (
    <div className="app">
      <SessionHeader
        session={session}
        isPlaying={isPlaying}
        onPlay={handlePlayPause}
        onReset={reset}
      />
      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-label">Agent Hierarchy</div>
          <AgentTree
            session={session}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
          />
        </aside>
        <main className="detail-panel">
          {selectedAgent ? (
            <AgentDetail agent={selectedAgent} />
          ) : (
            <div className="detail-empty">
              <p>Select an agent to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
