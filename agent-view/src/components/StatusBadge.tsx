import type { AgentStatus, ToolCallStatus } from '../types/agent';

type Status = AgentStatus | ToolCallStatus;

const config: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'status-pending' },
  running: { label: 'Running', className: 'status-running' },
  completed: { label: 'Done', className: 'status-completed' },
  failed: { label: 'Failed', className: 'status-failed' },
  paused: { label: 'Paused', className: 'status-paused' },
};

interface Props {
  status: Status;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const { label, className } = config[status];
  return (
    <span className={`status-badge ${className} ${size === 'sm' ? 'status-badge-sm' : ''}`}>
      {status === 'running' && <span className="pulse-dot" />}
      {label}
    </span>
  );
}
