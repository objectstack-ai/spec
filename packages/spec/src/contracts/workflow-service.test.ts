import { describe, it, expect } from 'vitest';
import type { IWorkflowService, WorkflowTransition, WorkflowTransitionResult, WorkflowStatus } from './workflow-service';

describe('Workflow Service Contract', () => {
  it('should allow a minimal IWorkflowService implementation with required methods', () => {
    const service: IWorkflowService = {
      transition: async (_transition) => ({ success: true, currentState: 'approved' }),
      getStatus: async (_object, _recordId) => ({
        recordId: '1', object: 'order', currentState: 'draft', availableTransitions: [],
      }),
    };

    expect(typeof service.transition).toBe('function');
    expect(typeof service.getStatus).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IWorkflowService = {
      transition: async () => ({ success: true }),
      getStatus: async () => ({
        recordId: '1', object: 'order', currentState: 'draft', availableTransitions: [],
      }),
      getHistory: async () => [],
    };

    expect(service.getHistory).toBeDefined();
  });

  it('should transition a record to a new state', async () => {
    const states = new Map<string, string>();
    states.set('order:ord-1', 'draft');

    const allowedTransitions: Record<string, string[]> = {
      draft: ['submitted'],
      submitted: ['approved', 'rejected'],
      approved: ['completed'],
    };

    const service: IWorkflowService = {
      transition: async (t): Promise<WorkflowTransitionResult> => {
        const key = `${t.object}:${t.recordId}`;
        const current = states.get(key);
        if (!current) return { success: false, error: 'Record not found' };

        const allowed = allowedTransitions[current] ?? [];
        if (!allowed.includes(t.targetState)) {
          return { success: false, error: `Cannot transition from ${current} to ${t.targetState}` };
        }

        states.set(key, t.targetState);
        return { success: true, currentState: t.targetState };
      },
      getStatus: async (object, recordId) => {
        const key = `${object}:${recordId}`;
        const currentState = states.get(key) ?? 'unknown';
        return {
          recordId, object, currentState,
          availableTransitions: allowedTransitions[currentState] ?? [],
        };
      },
    };

    const result = await service.transition({
      recordId: 'ord-1',
      object: 'order',
      targetState: 'submitted',
      comment: 'Ready for review',
    });

    expect(result.success).toBe(true);
    expect(result.currentState).toBe('submitted');

    const status = await service.getStatus('order', 'ord-1');
    expect(status.currentState).toBe('submitted');
    expect(status.availableTransitions).toContain('approved');
  });

  it('should reject invalid transitions', async () => {
    const service: IWorkflowService = {
      transition: async (t): Promise<WorkflowTransitionResult> => ({
        success: false,
        error: `Cannot transition to ${t.targetState}`,
      }),
      getStatus: async () => ({
        recordId: '1', object: 'order', currentState: 'draft',
        availableTransitions: ['submitted'],
      }),
    };

    const result = await service.transition({
      recordId: '1',
      object: 'order',
      targetState: 'completed',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('completed');
  });

  it('should return transition history', async () => {
    const service: IWorkflowService = {
      transition: async () => ({ success: true }),
      getStatus: async () => ({
        recordId: '1', object: 'order', currentState: 'approved',
        availableTransitions: ['completed'],
      }),
      getHistory: async () => [
        { fromState: 'draft', toState: 'submitted', userId: 'u1', timestamp: '2025-01-01T00:00:00Z' },
        { fromState: 'submitted', toState: 'approved', userId: 'u2', comment: 'LGTM', timestamp: '2025-01-02T00:00:00Z' },
      ],
    };

    const history = await service.getHistory!('order', 'ord-1');
    expect(history).toHaveLength(2);
    expect(history[0].fromState).toBe('draft');
    expect(history[1].comment).toBe('LGTM');
  });

  it('should get workflow status with available transitions', async () => {
    const service: IWorkflowService = {
      transition: async () => ({ success: true }),
      getStatus: async (_object, _recordId): Promise<WorkflowStatus> => ({
        recordId: 'ord-1',
        object: 'order',
        currentState: 'submitted',
        availableTransitions: ['approved', 'rejected'],
      }),
    };

    const status = await service.getStatus('order', 'ord-1');
    expect(status.currentState).toBe('submitted');
    expect(status.availableTransitions).toEqual(['approved', 'rejected']);
  });
});
