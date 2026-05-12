import { useState, useEffect, useCallback } from 'react';
import type { AgentSession, AgentNode, ToolCall } from '../types/agent';
import { mockSession } from '../data/mockSession';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function useAgentSimulation() {
  const [session, setSession] = useState<AgentSession>(deepClone(mockSession));
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('agent-root');

  const reset = useCallback(() => {
    const fresh = deepClone(mockSession);
    Object.values(fresh.agents).forEach((agent: AgentNode) => {
      agent.status = 'pending';
      agent.toolCalls.forEach((tc: ToolCall) => {
        tc.status = 'running';
        delete tc.output;
        delete tc.completedAt;
      });
      delete agent.completedAt;
      delete agent.result;
    });
    fresh.agents['agent-root'].status = 'running';
    fresh.status = 'running';
    setSession(fresh);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const steps: Array<() => void> = [
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-explore'].status = 'running';
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-explore'].toolCalls[0].status = 'completed';
        next.agents['agent-explore'].toolCalls[0].output = 'src/auth/login.ts\nsrc/auth/session.ts';
        next.agents['agent-explore'].toolCalls[0].completedAt = Date.now();
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-explore'].toolCalls[1].status = 'completed';
        next.agents['agent-explore'].toolCalls[1].output = '234 lines analyzed';
        next.agents['agent-explore'].toolCalls[1].completedAt = Date.now();
        next.agents['agent-plan'].status = 'running';
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-explore'].toolCalls[2].status = 'completed';
        next.agents['agent-explore'].toolCalls[2].output = '12 JWT matches found';
        next.agents['agent-explore'].toolCalls[2].completedAt = Date.now();
        next.agents['agent-explore'].status = 'completed';
        next.agents['agent-explore'].completedAt = Date.now();
        next.agents['agent-explore'].result = 'Found 3 auth files, 12 JWT references';
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-plan'].toolCalls[0].status = 'completed';
        next.agents['agent-plan'].toolCalls[0].output = 'Found 8 articles';
        next.agents['agent-plan'].toolCalls[0].completedAt = Date.now();
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-plan'].toolCalls[1].status = 'completed';
        next.agents['agent-plan'].toolCalls[1].output = 'PLAN.md created';
        next.agents['agent-plan'].toolCalls[1].completedAt = Date.now();
        next.agents['agent-plan'].status = 'completed';
        next.agents['agent-plan'].completedAt = Date.now();
        next.agents['agent-plan'].result = 'Created refactoring plan with 5 phases';
        next.agents['agent-impl'].status = 'running';
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-impl'].toolCalls[0].status = 'completed';
        next.agents['agent-impl'].toolCalls[0].output = 'Edit applied';
        next.agents['agent-impl'].toolCalls[0].completedAt = Date.now();
        next.agents['agent-test'].status = 'running';
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-impl'].toolCalls[1].status = 'completed';
        next.agents['agent-impl'].toolCalls[1].output = 'Edit applied';
        next.agents['agent-impl'].toolCalls[1].completedAt = Date.now();
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-test'].toolCalls[0].status = 'completed';
        next.agents['agent-test'].toolCalls[0].output = 'Test file created';
        next.agents['agent-test'].toolCalls[0].completedAt = Date.now();
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-impl'].toolCalls[2].status = 'completed';
        next.agents['agent-impl'].toolCalls[2].output = 'No TypeScript errors';
        next.agents['agent-impl'].toolCalls[2].completedAt = Date.now();
        next.agents['agent-review'].status = 'running';
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-test'].toolCalls[1].status = 'completed';
        next.agents['agent-test'].toolCalls[1].output = '12/12 tests passed, 94% coverage';
        next.agents['agent-test'].toolCalls[1].completedAt = Date.now();
        next.agents['agent-test'].status = 'completed';
        next.agents['agent-test'].completedAt = Date.now();
        next.agents['agent-test'].result = '12 tests passed, 94% coverage';
        return next;
      }),
      () => setSession(s => {
        const next = deepClone(s);
        next.agents['agent-review'].status = 'completed';
        next.agents['agent-review'].completedAt = Date.now();
        next.agents['agent-review'].result = 'No security issues, code quality approved';
        next.agents['agent-impl'].status = 'completed';
        next.agents['agent-impl'].completedAt = Date.now();
        next.agents['agent-impl'].result = 'All changes implemented and verified';
        next.agents['agent-root'].status = 'completed';
        next.agents['agent-root'].completedAt = Date.now();
        next.status = 'completed';
        return next;
      }),
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      steps[stepIndex]();
      stepIndex++;
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return { session, selectedAgentId, setSelectedAgentId, isPlaying, setIsPlaying, reset };
}
