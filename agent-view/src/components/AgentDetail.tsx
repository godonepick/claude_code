import { Bot, Clock, Cpu } from 'lucide-react';
import type { AgentNode } from '../types/agent';
import { StatusBadge } from './StatusBadge';
import { ToolCallList } from './ToolCallList';

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDuration(start: number, end?: number): string {
  const ms = (end ?? Date.now()) - start;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

interface Props {
  agent: AgentNode;
}

export function AgentDetail({ agent }: Props) {
  return (
    <div className="agent-detail">
      <div className="detail-header">
        <div className={`detail-icon ${agent.status === 'running' ? 'detail-icon-running' : ''}`}>
          <Bot size={24} />
        </div>
        <div className="detail-title-block">
          <h2 className="detail-name">{agent.name}</h2>
          <p className="detail-role">{agent.role}</p>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className="detail-meta-grid">
        <div className="detail-meta-item">
          <Cpu size={14} className="meta-icon" />
          <span className="meta-label">Model</span>
          <span className="meta-value">{agent.model}</span>
        </div>
        <div className="detail-meta-item">
          <Clock size={14} className="meta-icon" />
          <span className="meta-label">Started</span>
          <span className="meta-value">{formatTime(agent.startedAt)}</span>
        </div>
        <div className="detail-meta-item">
          <Clock size={14} className="meta-icon" />
          <span className="meta-label">Duration</span>
          <span className="meta-value">{formatDuration(agent.startedAt, agent.completedAt)}</span>
        </div>
        <div className="detail-meta-item">
          <Bot size={14} className="meta-icon" />
          <span className="meta-label">Sub-agents</span>
          <span className="meta-value">{agent.children.length}</span>
        </div>
      </div>

      {agent.result && (
        <div className="detail-result">
          <h3 className="detail-section-title">Result</h3>
          <p className="detail-result-text">{agent.result}</p>
        </div>
      )}

      <div className="detail-tools-section">
        <h3 className="detail-section-title">
          Tool Calls
          <span className="tool-count-badge">{agent.toolCalls.length}</span>
        </h3>
        <ToolCallList toolCalls={agent.toolCalls} />
      </div>
    </div>
  );
}
