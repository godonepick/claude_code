import { Terminal, CheckCircle, XCircle, Loader } from 'lucide-react';
import type { ToolCall } from '../types/agent';

function formatDuration(start: number, end?: number): string {
  const ms = (end ?? Date.now()) - start;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function ToolIcon({ status }: { status: ToolCall['status'] }) {
  if (status === 'completed') return <CheckCircle size={14} className="tool-icon-done" />;
  if (status === 'failed') return <XCircle size={14} className="tool-icon-failed" />;
  return <Loader size={14} className="tool-icon-running spin" />;
}

interface Props {
  toolCalls: ToolCall[];
}

export function ToolCallList({ toolCalls }: Props) {
  if (toolCalls.length === 0) {
    return <p className="no-tools">No tool calls yet</p>;
  }

  return (
    <div className="tool-call-list">
      {toolCalls.map(tc => (
        <div key={tc.id} className={`tool-call tool-call-${tc.status}`}>
          <div className="tool-call-header">
            <ToolIcon status={tc.status} />
            <Terminal size={13} className="tool-terminal-icon" />
            <span className="tool-name">{tc.name}</span>
            <span className="tool-duration">{formatDuration(tc.startedAt, tc.completedAt)}</span>
          </div>

          <div className="tool-call-input">
            {Object.entries(tc.input).map(([key, val]) => (
              <div key={key} className="tool-param">
                <span className="tool-param-key">{key}:</span>{' '}
                <span className="tool-param-val">
                  {typeof val === 'string' ? val : JSON.stringify(val).slice(0, 60)}
                  {JSON.stringify(val).length > 60 ? '…' : ''}
                </span>
              </div>
            ))}
          </div>

          {tc.output && (
            <div className="tool-output">
              <span className="tool-output-label">→</span> {tc.output}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
