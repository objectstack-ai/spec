import { describe, it, expect } from 'vitest';
import {
  WorkflowRuleSchema,
  WorkflowTriggerType,
  FieldUpdateActionSchema,
  EmailAlertActionSchema,
  WorkflowActionSchema,
  type WorkflowRule,
} from './workflow.zod';

describe('WorkflowTriggerType', () => {
  it('should accept all trigger types', () => {
    const types = ['on_create', 'on_update', 'on_create_or_update', 'on_delete', 'schedule'];
    
    types.forEach(type => {
      expect(() => WorkflowTriggerType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid trigger types', () => {
    expect(() => WorkflowTriggerType.parse('invalid')).toThrow();
    expect(() => WorkflowTriggerType.parse('on_save')).toThrow();
  });
});

describe('FieldUpdateActionSchema', () => {
  it('should accept field update action', () => {
    const action = {
      name: 'set_status',
      type: 'field_update' as const,
      field: 'status',
      value: 'approved',
    };

    expect(() => FieldUpdateActionSchema.parse(action)).not.toThrow();
  });

  it('should accept field update with formula', () => {
    const action = {
      name: 'calculate_total',
      type: 'field_update' as const,
      field: 'total_amount',
      value: 'quantity * price',
    };

    expect(() => FieldUpdateActionSchema.parse(action)).not.toThrow();
  });
});

describe('EmailAlertActionSchema', () => {
  it('should accept email alert action', () => {
    const action = {
      name: 'notify_manager',
      type: 'email_alert' as const,
      template: 'approval_request',
      recipients: ['manager@example.com'],
    };

    expect(() => EmailAlertActionSchema.parse(action)).not.toThrow();
  });

  it('should accept email alert with multiple recipients', () => {
    const action = {
      name: 'notify_team',
      type: 'email_alert' as const,
      template: 'task_assigned',
      recipients: ['user1@example.com', 'user2@example.com', '{owner.email}'],
    };

    expect(() => EmailAlertActionSchema.parse(action)).not.toThrow();
  });
});

describe('WorkflowActionSchema', () => {
  it('should accept field update action', () => {
    const action = {
      name: 'update_field',
      type: 'field_update' as const,
      field: 'priority',
      value: 'high',
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept email alert action', () => {
    const action = {
      name: 'send_email',
      type: 'email_alert' as const,
      template: 'welcome_email',
      recipients: ['user@example.com'],
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept generic action with custom type', () => {
    const action = {
      name: 'custom_action',
      type: 'webhook',
      options: {
        url: 'https://api.example.com/webhook',
        method: 'POST',
      },
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });
});

describe('WorkflowRuleSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal workflow rule', () => {
      const workflow: WorkflowRule = {
        name: 'auto_approve',
        objectName: 'opportunity',
        triggerType: 'on_create',
      };

      const result = WorkflowRuleSchema.parse(workflow);
      expect(result.active).toBe(true);
    });

    it('should enforce snake_case for workflow name', () => {
      const validNames = ['auto_approve', 'send_notification', 'update_status', '_internal'];
      validNames.forEach(name => {
        expect(() => WorkflowRuleSchema.parse({
          name,
          objectName: 'account',
          triggerType: 'on_create',
        })).not.toThrow();
      });

      const invalidNames = ['autoApprove', 'Auto-Approve', '123workflow'];
      invalidNames.forEach(name => {
        expect(() => WorkflowRuleSchema.parse({
          name,
          objectName: 'account',
          triggerType: 'on_create',
        })).toThrow();
      });
    });

    it('should default active to true', () => {
      const workflow = {
        name: 'test_workflow',
        objectName: 'account',
        triggerType: 'on_create' as const,
      };

      const result = WorkflowRuleSchema.parse(workflow);
      expect(result.active).toBe(true);
    });
  });

  describe('Trigger Types', () => {
    it('should accept all trigger types', () => {
      const triggers = [
        'on_create',
        'on_update',
        'on_create_or_update',
        'on_delete',
        'schedule',
      ] as const;

      triggers.forEach(triggerType => {
        const workflow: WorkflowRule = {
          name: 'test_workflow',
          objectName: 'account',
          triggerType,
        };
        expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
      });
    });
  });

  describe('Criteria and Actions', () => {
    it('should accept workflow with criteria', () => {
      const workflow: WorkflowRule = {
        name: 'high_value_alert',
        objectName: 'opportunity',
        triggerType: 'on_create_or_update',
        criteria: 'amount > 100000',
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept workflow with actions', () => {
      const workflow: WorkflowRule = {
        name: 'auto_assign',
        objectName: 'lead',
        triggerType: 'on_create',
        actions: [
          {
            name: 'set_owner',
            type: 'field_update',
            field: 'owner_id',
            value: '{$User.Id}',
          },
          {
            name: 'set_status',
            type: 'field_update',
            field: 'status',
            value: 'new',
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept workflow with criteria and actions', () => {
      const workflow: WorkflowRule = {
        name: 'notify_manager',
        objectName: 'expense_report',
        triggerType: 'on_update',
        criteria: 'status == "submitted" && amount > 1000',
        actions: [
          {
            name: 'send_approval_email',
            type: 'email_alert',
            template: 'manager_approval',
            recipients: ['{manager.email}'],
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });
  });

  describe('Real-World Workflow Examples', () => {
    it('should accept opportunity auto-approval workflow', () => {
      const workflow: WorkflowRule = {
        name: 'auto_approve_small_deals',
        objectName: 'opportunity',
        triggerType: 'on_create_or_update',
        criteria: 'amount < 10000 && stage == "proposal"',
        actions: [
          {
            name: 'set_approved_status',
            type: 'field_update',
            field: 'status',
            value: 'approved',
          },
          {
            name: 'set_approval_date',
            type: 'field_update',
            field: 'approved_at',
            value: 'NOW()',
          },
          {
            name: 'notify_sales_rep',
            type: 'email_alert',
            template: 'opportunity_auto_approved',
            recipients: ['{owner.email}'],
          },
        ],
        active: true,
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept case escalation workflow', () => {
      const workflow: WorkflowRule = {
        name: 'escalate_high_priority_cases',
        objectName: 'case',
        triggerType: 'on_create',
        criteria: 'priority == "high" || priority == "critical"',
        actions: [
          {
            name: 'assign_to_manager',
            type: 'field_update',
            field: 'owner_id',
            value: '{$User.ManagerId}',
          },
          {
            name: 'set_escalated_flag',
            type: 'field_update',
            field: 'is_escalated',
            value: true,
          },
          {
            name: 'notify_manager',
            type: 'email_alert',
            template: 'case_escalation',
            recipients: ['{$User.Manager.Email}', 'support-leads@example.com'],
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept lead assignment workflow', () => {
      const workflow: WorkflowRule = {
        name: 'auto_assign_leads',
        objectName: 'lead',
        triggerType: 'on_create',
        criteria: 'source == "web"',
        actions: [
          {
            name: 'assign_to_queue',
            type: 'field_update',
            field: 'owner_id',
            value: 'QUEUE("web_leads")',
          },
          {
            name: 'set_status',
            type: 'field_update',
            field: 'status',
            value: 'new',
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept inactive workflow', () => {
      const workflow: WorkflowRule = {
        name: 'disabled_workflow',
        objectName: 'account',
        triggerType: 'on_update',
        criteria: 'status == "inactive"',
        actions: [
          {
            name: 'archive',
            type: 'field_update',
            field: 'archived',
            value: true,
          },
        ],
        active: false,
      };

      const result = WorkflowRuleSchema.parse(workflow);
      expect(result.active).toBe(false);
    });

    it('should accept scheduled workflow', () => {
      const workflow: WorkflowRule = {
        name: 'weekly_report',
        objectName: 'opportunity',
        triggerType: 'schedule',
        criteria: 'is_closed == false',
        actions: [
          {
            name: 'send_weekly_summary',
            type: 'email_alert',
            template: 'weekly_pipeline_report',
            recipients: ['sales-team@example.com'],
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });
  });
});
