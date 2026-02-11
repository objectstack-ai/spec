import { describe, it, expect } from 'vitest';
import type { IAutomationService, AutomationResult } from './automation-service';

describe('Automation Service Contract', () => {
  it('should allow a minimal IAutomationService implementation with required methods', () => {
    const service: IAutomationService = {
      execute: async (_flowName, _context?) => ({ success: true }),
      listFlows: async () => [],
    };

    expect(typeof service.execute).toBe('function');
    expect(typeof service.listFlows).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IAutomationService = {
      execute: async () => ({ success: true }),
      listFlows: async () => [],
      registerFlow: (_name, _definition) => {},
      unregisterFlow: (_name) => {},
    };

    expect(service.registerFlow).toBeDefined();
    expect(service.unregisterFlow).toBeDefined();
  });

  it('should execute a flow successfully', async () => {
    const service: IAutomationService = {
      execute: async (flowName, context?): Promise<AutomationResult> => {
        return {
          success: true,
          output: { flowName, recordId: (context?.record as any)?.id },
          durationMs: 42,
        };
      },
      listFlows: async () => ['send_welcome_email', 'update_status'],
    };

    const result = await service.execute('send_welcome_email', {
      record: { id: 'rec-1', name: 'Alice' },
      object: 'contact',
      event: 'on_create',
    });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ flowName: 'send_welcome_email', recordId: 'rec-1' });
    expect(result.durationMs).toBe(42);
  });

  it('should handle execution failures', async () => {
    const service: IAutomationService = {
      execute: async () => ({
        success: false,
        error: 'Flow step 3 failed: timeout',
      }),
      listFlows: async () => [],
    };

    const result = await service.execute('broken_flow');
    expect(result.success).toBe(false);
    expect(result.error).toContain('timeout');
  });

  it('should list registered flows', async () => {
    const service: IAutomationService = {
      execute: async () => ({ success: true }),
      listFlows: async () => ['onboarding_flow', 'approval_flow', 'cleanup_flow'],
    };

    const flows = await service.listFlows();
    expect(flows).toHaveLength(3);
    expect(flows).toContain('approval_flow');
  });
});
