export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';

export type ToolCallStatus = 'running' | 'completed' | 'failed';

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: ToolCallStatus;
  startedAt: number;
  completedAt?: number;
}

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  parentId?: string;
  children: string[];
  toolCalls: ToolCall[];
  startedAt: number;
  completedAt?: number;
  depth: number;
  result?: string;
  model: string;
}

export interface AgentSession {
  id: string;
  title: string;
  startedAt: number;
  completedAt?: number;
  rootAgentId: string;
  agents: Record<string, AgentNode>;
  status: AgentStatus;
}
