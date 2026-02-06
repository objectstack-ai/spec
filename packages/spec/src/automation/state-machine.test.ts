import { describe, it, expect } from 'vitest';
import { StateMachineSchema } from './state-machine.zod';

describe('StateMachineSchema', () => {
  it('should validate a simple state machine', () => {
    const machine = {
      id: 'simple_flow',
      initial: 'start',
      states: {
        start: {
          on: {
            NEXT: 'end',
          },
        },
        end: {
          type: 'final',
        },
      },
    };

    const result = StateMachineSchema.parse(machine);
    expect(result.id).toBe('simple_flow');
    expect(result.initial).toBe('start');
  });

  it('should validate complex state machine with guards and actions', () => {
    const machine = {
      id: 'approval_flow',
      initial: 'draft',
      states: {
        draft: {
          on: {
            SUBMIT: {
              target: 'pending',
              cond: 'isComplete',
              actions: ['notifyManager'],
            },
          },
        },
        pending: {
          on: {
            APPROVE: 'approved',
            REJECT: 'rejected',
          },
          meta: {
            aiInstructions: 'Review carefully',
          },
        },
        approved: { type: 'final' },
        rejected: { type: 'final' },
      },
    };

    expect(() => StateMachineSchema.parse(machine)).not.toThrow();
  });

  it('should validate hierarchical states', () => {
    const machine = {
      id: 'nested_flow',
      initial: 'active',
      states: {
        active: {
          initial: 'running',
          states: {
            running: {
              on: { PAUSE: 'paused' },
            },
            paused: {
              on: { RESUME: 'running' },
            },
          },
          on: { STOP: 'stopped' },
        },
        stopped: { type: 'final' },
      },
    };

    expect(() => StateMachineSchema.parse(machine)).not.toThrow();
  });

  it('should validate parallel states', () => {
    const machine = {
      id: 'parallel_flow',
      initial: 'processing',
      states: {
        processing: {
          type: 'parallel',
          states: {
            upload: {
              initial: 'pending',
              states: {
                pending: { on: { START: 'uploading' } },
                uploading: { on: { DONE: 'uploaded' } },
                uploaded: { type: 'final' },
              },
            },
            validate: {
              initial: 'pending',
              states: {
                pending: { on: { CHECK: 'checking' } },
                checking: { on: { PASS: 'passed' } },
                passed: { type: 'final' },
              },
            },
          },
        },
      },
    };

    expect(() => StateMachineSchema.parse(machine)).not.toThrow();
  });

  it('should reject invalid identifier', () => {
    const machine = {
      id: 'Invalid Name',
      initial: 'start',
      states: {
        start: {},
      },
    };

    expect(() => StateMachineSchema.parse(machine)).toThrow();
  });
});
