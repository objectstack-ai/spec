import { describe, it, expect } from 'vitest';
import {
  ApproverType,
  ApprovalActionType,
  ApprovalActionSchema,
  ApprovalStepSchema,
  ApprovalProcessSchema,
  ApprovalProcess,
} from './approval.zod';

describe('ApproverType', () => {
  it('should accept all valid approver types', () => {
    ['user', 'role', 'manager', 'field', 'queue'].forEach(t => {
      expect(() => ApproverType.parse(t)).not.toThrow();
    });
  });

  it('should reject invalid approver type', () => {
    expect(() => ApproverType.parse('group')).toThrow();
  });
});

describe('ApprovalActionType', () => {
  it('should accept all valid action types', () => {
    ['field_update', 'email_alert', 'webhook', 'script', 'connector_action'].forEach(t => {
      expect(() => ApprovalActionType.parse(t)).not.toThrow();
    });
  });

  it('should reject invalid action type', () => {
    expect(() => ApprovalActionType.parse('sms')).toThrow();
  });
});

describe('ApprovalActionSchema', () => {
  it('should accept valid action', () => {
    expect(() => ApprovalActionSchema.parse({
      type: 'field_update',
      name: 'Set Status',
      config: { field: 'status', value: 'approved' },
    })).not.toThrow();
  });

  it('should accept connector action with optional fields', () => {
    expect(() => ApprovalActionSchema.parse({
      type: 'connector_action',
      name: 'Notify Slack',
      config: { channel: '#approvals' },
      connectorId: 'slack',
      actionId: 'send_message',
    })).not.toThrow();
  });

  it('should reject missing type', () => {
    expect(() => ApprovalActionSchema.parse({
      name: 'Bad Action',
      config: {},
    })).toThrow();
  });

  it('should reject missing name', () => {
    expect(() => ApprovalActionSchema.parse({
      type: 'webhook',
      config: { url: 'https://example.com' },
    })).toThrow();
  });

  it('should reject missing config', () => {
    expect(() => ApprovalActionSchema.parse({
      type: 'email_alert',
      name: 'Send Email',
    })).toThrow();
  });
});

describe('ApprovalStepSchema', () => {
  const minimalStep = {
    name: 'manager_review',
    label: 'Manager Review',
    approvers: [{ type: 'manager', value: 'direct_manager' }],
  };

  it('should accept minimal step with defaults', () => {
    const result = ApprovalStepSchema.parse(minimalStep);
    expect(result.behavior).toBe('first_response');
    expect(result.rejectionBehavior).toBe('reject_process');
  });

  it('should accept full step', () => {
    expect(() => ApprovalStepSchema.parse({
      name: 'vp_review',
      label: 'VP Review',
      description: 'VP must approve expenses over $10k',
      entryCriteria: 'amount > 10000',
      approvers: [
        { type: 'role', value: 'vp_finance' },
        { type: 'user', value: 'user_001' },
      ],
      behavior: 'unanimous',
      rejectionBehavior: 'back_to_previous',
      onApprove: [{ type: 'field_update', name: 'Update Status', config: { field: 'status', value: 'vp_approved' } }],
      onReject: [{ type: 'email_alert', name: 'Notify Submitter', config: { template: 'rejection' } }],
    })).not.toThrow();
  });

  it('should reject invalid name (not snake_case)', () => {
    expect(() => ApprovalStepSchema.parse({
      ...minimalStep,
      name: 'ManagerReview',
    })).toThrow();
  });

  it('should reject empty approvers array', () => {
    expect(() => ApprovalStepSchema.parse({
      ...minimalStep,
      approvers: [],
    })).toThrow();
  });

  it('should reject missing approvers', () => {
    expect(() => ApprovalStepSchema.parse({
      name: 'bad_step',
      label: 'Bad Step',
    })).toThrow();
  });
});

describe('ApprovalProcessSchema', () => {
  const minimalProcess = {
    name: 'expense_approval',
    label: 'Expense Approval',
    object: 'expense_report',
    steps: [{
      name: 'manager_review',
      label: 'Manager Review',
      approvers: [{ type: 'manager', value: 'direct_manager' }],
    }],
  };

  it('should accept minimal process with defaults', () => {
    const result = ApprovalProcessSchema.parse(minimalProcess);
    expect(result.active).toBe(false);
    expect(result.lockRecord).toBe(true);
  });

  it('should accept full process', () => {
    expect(() => ApprovalProcessSchema.parse({
      name: 'purchase_approval',
      label: 'Purchase Approval',
      object: 'purchase_order',
      active: true,
      description: 'Multi-step purchase approval',
      entryCriteria: 'amount > 1000',
      lockRecord: false,
      steps: [
        {
          name: 'manager_review',
          label: 'Manager Review',
          approvers: [{ type: 'manager', value: 'direct_manager' }],
        },
        {
          name: 'finance_review',
          label: 'Finance Review',
          entryCriteria: 'amount > 5000',
          approvers: [{ type: 'role', value: 'finance_team' }],
          behavior: 'unanimous',
        },
      ],
      onSubmit: [{ type: 'field_update', name: 'Lock', config: { field: 'status', value: 'submitted' } }],
      onFinalApprove: [{ type: 'email_alert', name: 'Approved', config: { template: 'approved' } }],
      onFinalReject: [{ type: 'webhook', name: 'Notify', config: { url: 'https://example.com/reject' } }],
      onRecall: [{ type: 'field_update', name: 'Reset', config: { field: 'status', value: 'draft' } }],
    })).not.toThrow();
  });

  it('should reject empty steps array', () => {
    expect(() => ApprovalProcessSchema.parse({
      ...minimalProcess,
      steps: [],
    })).toThrow();
  });

  it('should reject invalid process name', () => {
    expect(() => ApprovalProcessSchema.parse({
      ...minimalProcess,
      name: 'ExpenseApproval',
    })).toThrow();
  });

  it('should reject missing object', () => {
    expect(() => ApprovalProcessSchema.parse({
      name: 'test_process',
      label: 'Test',
      steps: [{
        name: 'step_one',
        label: 'Step One',
        approvers: [{ type: 'user', value: 'admin' }],
      }],
    })).toThrow();
  });
});

describe('ApprovalProcess.create', () => {
  it('should return the config object as-is', () => {
    const config = {
      name: 'quick_approval',
      label: 'Quick Approval',
      object: 'invoice',
      steps: [{
        name: 'review',
        label: 'Review',
        approvers: [{ type: 'role' as const, value: 'reviewer' }],
      }],
    };
    const result = ApprovalProcess.create(config);
    expect(result).toEqual(config);
  });
});
