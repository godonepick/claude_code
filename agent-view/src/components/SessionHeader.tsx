import { Play, RotateCcw, Pause } from 'lucide-react';
import type { AgentSession } from '../types/agent';
import { StatusBadge } from './StatusBadge';

function formatDuration(start: number, end?: number): string {
  const ms = (end ?? Date.now()) - start;
  return `${(ms / 1000).toFixed(1)}s`;
}

interface Props {
  session: AgentSession;
  isPlaying: boolean;
  onPlay: () => void;
  onReset: () => void;
}

export function SessionHeader({ session, isPlaying, onPlay, onReset }: Props) {
  const agents = Object.values(session.agents);
  const total = agents.length;
  const completed = agents.filter(a => a.status === 'completed').length;
  const running = agents.filter(a => a.status === 'running').length;
  const totalTools = agents.reduce((acc, a) => acc + a.toolCalls.length, 0);
  const completedTools = agents.reduce(
    (acc, a) => acc + a.toolCalls.filter(t => t.status === 'completed').length,
    0
  );

  return (
    <header className="session-header">
      <div className="session-header-top">
        <div className="session-title-block">
          <div className="session-logo">
            <span className="session-logo-text">Claude</span>
            <span className="session-logo-badge">Agent View</span>
          </div>
          <h1 className="session-title">{session.title}</h1>
        </div>
        <div className="session-controls">
          <button
            className="btn btn-secondary"
            onClick={onReset}
            title="Reset simulation"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            className={`btn ${isPlaying ? 'btn-pause' : 'btn-play'}`}
            onClick={onPlay}
            disabled={session.status === 'completed' && !isPlaying}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play Demo'}
          </button>
          <StatusBadge status={session.status} />
        </div>
      </div>

      <div className="session-stats">
        <div className="stat-item">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Agents</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value stat-running">{running}</span>
          <span className="stat-label">Running</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value stat-done">{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{completedTools}/{totalTools}</span>
          <span className="stat-label">Tool Calls</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{formatDuration(session.startedAt, session.completedAt)}</span>
          <span className="stat-label">Duration</span>
        </div>
      </div>

      <div className="progress-bar-outer">
        <div
          className="progress-bar-inner"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>
    </header>
  );
}
