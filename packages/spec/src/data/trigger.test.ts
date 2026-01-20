import { describe, it, expect } from 'vitest';
import {
  TriggerAction,
  TriggerTiming,
  TriggerContextSchema,
  TriggerSchema,
  type TriggerContext,
  type Trigger,
} from './trigger.zod';

describe('TriggerAction', () => {
  it('should accept valid actions', () => {
    const validActions = ['insert', 'update', 'delete'];

    validActions.forEach(action => {
      expect(() => TriggerAction.parse(action)).not.toThrow();
    });
  });

  it('should reject invalid actions', () => {
    expect(() => TriggerAction.parse('create')).toThrow();
    expect(() => TriggerAction.parse('modify')).toThrow();
    expect(() => TriggerAction.parse('remove')).toThrow();
  });
});

describe('TriggerTiming', () => {
  it('should accept valid timings', () => {
    const validTimings = ['before', 'after'];

    validTimings.forEach(timing => {
      expect(() => TriggerTiming.parse(timing)).not.toThrow();
    });
  });

  it('should reject invalid timings', () => {
    expect(() => TriggerTiming.parse('during')).toThrow();
    expect(() => TriggerTiming.parse('pre')).toThrow();
    expect(() => TriggerTiming.parse('post')).toThrow();
  });
});

describe('TriggerContextSchema', () => {
  describe('Valid Contexts', () => {
    it('should accept minimal valid context', () => {
      const context: TriggerContext = {
        action: 'insert',
        timing: 'before',
        doc: { name: 'Test' },
        userId: 'user123',
        user: { id: 'user123', name: 'John Doe' },
        ql: {},
        logger: {},
        addError: (message: string, field?: string) => {},
        getOldValue: (field: string) => undefined,
      };

      expect(() => TriggerContextSchema.parse(context)).not.toThrow();
    });

    it('should accept context with previousDoc', () => {
      const context: TriggerContext = {
        action: 'update',
        timing: 'before',
        doc: { id: '1', name: 'Updated Name', status: 'active' },
        previousDoc: { id: '1', name: 'Old Name', status: 'inactive' },
        userId: 'user123',
        user: { id: 'user123', name: 'John Doe' },
        ql: {},
        logger: {},
        addError: () => {},
        getOldValue: (field: string) => undefined,
      };

      expect(() => TriggerContextSchema.parse(context)).not.toThrow();
    });

    it('should accept context with complete implementations', () => {
      const context = {
        action: 'update' as const,
        timing: 'after' as const,
        doc: { id: '1', name: 'Test', amount: 100 },
        previousDoc: { id: '1', name: 'Test', amount: 50 },
        userId: 'user123',
        user: { 
          id: 'user123', 
          name: 'John Doe',
          email: 'john@example.com',
          roles: ['admin'],
        },
        ql: {
          object: (name: string) => ({
            find: async () => [],
            create: async (data: any) => data,
          }),
        },
        logger: {
          info: (message: string, meta?: any) => console.log(message, meta),
          error: (message: string, error?: any) => console.error(message, error),
        },
        addError: (message: string, field?: string) => {
          console.error(`Error on ${field}: ${message}`);
        },
        getOldValue: (field: string) => {
          const prev: any = { id: '1', name: 'Test', amount: 50 };
          return prev[field];
        },
      };

      expect(() => TriggerContextSchema.parse(context)).not.toThrow();
    });
  });

  describe('Required Fields', () => {
    it('should require action', () => {
      const context = {
        timing: 'before',
        doc: {},
        userId: 'user123',
        user: {},
        ql: {},
        logger: {},
        addError: () => {},
        getOldValue: () => undefined,
      };

      const result = TriggerContextSchema.safeParse(context);
      expect(result.success).toBe(false);
    });

    it('should require timing', () => {
      const context = {
        action: 'insert',
        doc: {},
        userId: 'user123',
        user: {},
        ql: {},
        logger: {},
        addError: () => {},
        getOldValue: () => undefined,
      };

      const result = TriggerContextSchema.safeParse(context);
      expect(result.success).toBe(false);
    });

    it('should require doc', () => {
      const context = {
        action: 'insert',
        timing: 'before',
        userId: 'user123',
        user: {},
        ql: {},
        logger: {},
        addError: () => {},
        getOldValue: () => undefined,
      };

      const result = TriggerContextSchema.safeParse(context);
      expect(result.success).toBe(false);
    });
  });
});

describe('TriggerSchema', () => {
  describe('Valid Triggers', () => {
    it('should accept minimal trigger definition', () => {
      const trigger: Trigger = {
        name: 'validate_account',
        object: 'account',
        timing: 'before',
        action: 'insert',
        execute: async (context: TriggerContext) => {
          // Validation logic
        },
      };

      expect(() => TriggerSchema.parse(trigger)).not.toThrow();
    });

    it('should accept trigger with all fields', () => {
      const trigger: Trigger = {
        name: 'update_related_records',
        object: 'opportunity',
        timing: 'after',
        action: 'update',
        execute: async (context: TriggerContext) => {
          // Business logic
        },
        description: 'Updates related records when opportunity is modified',
        active: true,
        order: 10,
      };

      expect(() => TriggerSchema.parse(trigger)).not.toThrow();
    });

    it('should accept trigger with multiple actions', () => {
      const trigger: Trigger = {
        name: 'audit_changes',
        object: 'contact',
        timing: 'after',
        action: ['insert', 'update', 'delete'],
        execute: async (context: TriggerContext) => {
          await context.ql.object('audit_log').create({
            action: context.action,
            record_id: context.doc.id,
            user_id: context.userId,
          });
        },
      };

      expect(() => TriggerSchema.parse(trigger)).not.toThrow();
    });

    it('should enforce snake_case for trigger name', () => {
      const validNames = ['validate_account', 'update_status', 'before_insert'];
      
      validNames.forEach(name => {
        const trigger = {
          name,
          object: 'test',
          timing: 'before' as const,
          action: 'insert' as const,
          execute: async () => {},
        };
        expect(() => TriggerSchema.parse(trigger)).not.toThrow();
      });

      const invalidNames = ['validateAccount', 'Update-Status', '123invalid'];
      
      invalidNames.forEach(name => {
        const trigger = {
          name,
          object: 'test',
          timing: 'before' as const,
          action: 'insert' as const,
          execute: async () => {},
        };
        expect(() => TriggerSchema.parse(trigger)).toThrow();
      });
    });

    it('should default active to true', () => {
      const trigger = {
        name: 'test_trigger',
        object: 'test',
        timing: 'before' as const,
        action: 'insert' as const,
        execute: async () => {},
      };

      const parsed = TriggerSchema.parse(trigger);
      expect(parsed.active).toBe(true);
    });

    it('should default order to 0', () => {
      const trigger = {
        name: 'test_trigger',
        object: 'test',
        timing: 'before' as const,
        action: 'insert' as const,
        execute: async () => {},
      };

      const parsed = TriggerSchema.parse(trigger);
      expect(parsed.order).toBe(0);
    });
  });
});

describe('Trigger Use Cases', () => {
  describe('Before Insert Trigger', () => {
    it('should set default values', async () => {
      const trigger: Trigger = {
        name: 'set_defaults',
        object: 'account',
        timing: 'before',
        action: 'insert',
        execute: async (context: TriggerContext) => {
          if (!context.doc.status) {
            context.doc.status = 'active';
          }
          if (!context.doc.type) {
            context.doc.type = 'standard';
          }
        },
      };

      const doc = { name: 'Test Account' };
      const context: TriggerContext = {
        action: 'insert',
        timing: 'before',
        doc,
        userId: 'user123',
        user: {},
        ql: {},
        logger: { info: () => {}, error: () => {} },
        addError: () => {},
        getOldValue: () => undefined,
      };

      await trigger.execute(context);
      expect(context.doc.status).toBe('active');
      expect(context.doc.type).toBe('standard');
    });

    it('should validate required fields', async () => {
      let errorAdded = false;
      let errorMessage = '';

      const trigger: Trigger = {
        name: 'validate_required',
        object: 'contact',
        timing: 'before',
        action: 'insert',
        execute: async (context: TriggerContext) => {
          if (!context.doc.email) {
            context.addError('Email is required', 'email');
          }
        },
      };

      const context: TriggerContext = {
        action: 'insert',
        timing: 'before',
        doc: { name: 'John Doe' },
        userId: 'user123',
        user: {},
        ql: {},
        logger: { info: () => {}, error: () => {} },
        addError: (message: string, field?: string) => {
          errorAdded = true;
          errorMessage = message;
        },
        getOldValue: () => undefined,
      };

      await trigger.execute(context);
      expect(errorAdded).toBe(true);
      expect(errorMessage).toBe('Email is required');
    });
  });

  describe('After Update Trigger', () => {
    it('should detect field changes', async () => {
      let statusChanged = false;

      const trigger: Trigger = {
        name: 'detect_status_change',
        object: 'opportunity',
        timing: 'after',
        action: 'update',
        execute: async (context: TriggerContext) => {
          const oldStatus = context.getOldValue('status');
          if (oldStatus !== context.doc.status) {
            statusChanged = true;
          }
        },
      };

      const context: TriggerContext = {
        action: 'update',
        timing: 'after',
        doc: { id: '1', status: 'closed' },
        previousDoc: { id: '1', status: 'open' },
        userId: 'user123',
        user: {},
        ql: {},
        logger: { info: () => {}, error: () => {} },
        addError: () => {},
        getOldValue: (field: string) => {
          const prev: any = { id: '1', status: 'open' };
          return prev[field];
        },
      };

      await trigger.execute(context);
      expect(statusChanged).toBe(true);
    });

    it('should update related records', async () => {
      const createdRecords: any[] = [];

      const trigger: Trigger = {
        name: 'log_changes',
        object: 'account',
        timing: 'after',
        action: 'update',
        execute: async (context: TriggerContext) => {
          await context.ql.object('activity_log').create({
            record_id: context.doc.id,
            action: 'updated',
            user_id: context.userId,
            changes: {
              old: context.previousDoc,
              new: context.doc,
            },
          });
        },
      };

      const context: TriggerContext = {
        action: 'update',
        timing: 'after',
        doc: { id: '1', name: 'Updated Name' },
        previousDoc: { id: '1', name: 'Old Name' },
        userId: 'user123',
        user: {},
        ql: {
          object: () => ({
            create: async (data: any) => {
              createdRecords.push(data);
              return data;
            },
          }),
        },
        logger: { info: () => {}, error: () => {} },
        addError: () => {},
        getOldValue: () => undefined,
      };

      await trigger.execute(context);
      expect(createdRecords).toHaveLength(1);
      expect(createdRecords[0].action).toBe('updated');
    });
  });

  describe('After Delete Trigger', () => {
    it('should clean up related records', async () => {
      const deletedRecords: string[] = [];

      const trigger: Trigger = {
        name: 'cleanup_children',
        object: 'parent_object',
        timing: 'after',
        action: 'delete',
        execute: async (context: TriggerContext) => {
          await context.ql.object('child_object').delete({
            parent_id: context.doc.id,
          });
        },
      };

      const context: TriggerContext = {
        action: 'delete',
        timing: 'after',
        doc: { id: 'parent123', name: 'Parent Record' },
        userId: 'user123',
        user: {},
        ql: {
          object: () => ({
            delete: async (query: any) => {
              deletedRecords.push(query.parent_id);
              return { deleted: true };
            },
          }),
        },
        logger: { info: () => {}, error: () => {} },
        addError: () => {},
        getOldValue: () => undefined,
      };

      await trigger.execute(context);
      expect(deletedRecords).toContain('parent123');
    });
  });

  describe('Trigger Ordering', () => {
    it('should support execution order', () => {
      const trigger1: Trigger = {
        name: 'first_trigger',
        object: 'test',
        timing: 'before',
        action: 'insert',
        execute: async () => {},
        order: 1,
      };

      const trigger2: Trigger = {
        name: 'second_trigger',
        object: 'test',
        timing: 'before',
        action: 'insert',
        execute: async () => {},
        order: 2,
      };

      const parsed1 = TriggerSchema.parse(trigger1);
      const parsed2 = TriggerSchema.parse(trigger2);

      expect(parsed1.order).toBeLessThan(parsed2.order);
    });
  });
});
