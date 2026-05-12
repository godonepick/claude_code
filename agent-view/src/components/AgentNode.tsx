import { ChevronRight, Bot, Cpu, Zap } from 'lucide-react';
import type { AgentNode as AgentNodeType } from '../types/agent';
import { StatusBadge } from './StatusBadge';

function formatDuration(start: number, end?: number): string {
  const ms = (end ?? Date.now()) - start;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function modelIcon(model: string) {
  if (model.includes('opus')) return <Cpu size={12} />;
  if (model.includes('haiku')) return <Zap size={12} />;
  return <Bot size={12} />;
}

function modelColor(model: string): string {
  if (model.includes('opus')) return 'model-opus';
  if (model.includes('haiku')) return 'model-haiku';
  return 'model-sonnet';
}

interface Props {
  agent: AgentNodeType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  hasChildren: boolean;
}

export function AgentNodeCard({ agent, isSelected, onSelect, hasChildren }: Props) {
  const completedTools = agent.toolCalls.filter(t => t.status === 'completed').length;

  return (
    <div
      className={`agent-card ${isSelected ? 'agent-card-selected' : ''} agent-status-${agent.status}`}
      onClick={() => onSelect(agent.id)}
    >
      <div className="agent-card-header">
        <div className="agent-card-title">
          <div className={`agent-icon ${agent.status === 'running' ? 'agent-icon-running' : ''}`}>
            <Bot size={16} />
          </div>
          <div>
            <div className="agent-name">{agent.name}</div>
            <div className="agent-role">{agent.role}</div>
          </div>
        </div>
        <div className="agent-card-meta">
          <StatusBadge status={agent.status} size="sm" />
          {hasChildren && <ChevronRight size={14} className="chevron" />}
        </div>
      </div>

      <div className="agent-card-footer">
        <span className={`model-badge ${modelColor(agent.model)}`}>
          {modelIcon(agent.model)}
          {agent.model.replace('claude-', '').replace(/-\d+.*/, '')}
        </span>
        {agent.toolCalls.length > 0 && (
          <span className="tool-count">
            {completedTools}/{agent.toolCalls.length} tools
          </span>
        )}
        <span className="duration">
          {formatDuration(agent.startedAt, agent.completedAt)}
        </span>
      </div>

      {agent.result && (
        <div className="agent-result">
          <span className="result-label">Result:</span> {agent.result}
        </div>
      )}
    </div>
  );
}
