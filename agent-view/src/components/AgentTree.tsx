import type { AgentSession } from '../types/agent';
import { AgentNodeCard } from './AgentNode';

interface Props {
  session: AgentSession;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

interface TreeNodeProps {
  agentId: string;
  session: AgentSession;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  isLast: boolean;
  prefix: string;
}

function TreeNode({ agentId, session, selectedAgentId, onSelectAgent, isLast, prefix }: TreeNodeProps) {
  const agent = session.agents[agentId];
  if (!agent) return null;

  const children = agent.children.filter(id => session.agents[id]);

  return (
    <div className="tree-node">
      <div className="tree-row">
        {prefix && (
          <div className="tree-prefix">
            <span className="tree-line-prefix" dangerouslySetInnerHTML={{ __html: prefix }} />
          </div>
        )}
        <div className="tree-connector">
          {agent.depth > 0 && (
            <div className={`tree-branch ${isLast ? 'tree-branch-last' : ''}`} />
          )}
        </div>
        <div className="tree-card-wrapper">
          <AgentNodeCard
            agent={agent}
            isSelected={selectedAgentId === agentId}
            onSelect={onSelectAgent}
            hasChildren={children.length > 0}
          />
        </div>
      </div>

      {children.length > 0 && (
        <div className="tree-children">
          {children.map((childId, idx) => (
            <TreeNode
              key={childId}
              agentId={childId}
              session={session}
              selectedAgentId={selectedAgentId}
              onSelectAgent={onSelectAgent}
              isLast={idx === children.length - 1}
              prefix=""
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AgentTree({ session, selectedAgentId, onSelectAgent }: Props) {
  return (
    <div className="agent-tree">
      <TreeNode
        agentId={session.rootAgentId}
        session={session}
        selectedAgentId={selectedAgentId}
        onSelectAgent={onSelectAgent}
        isLast={true}
        prefix=""
      />
    </div>
  );
}
