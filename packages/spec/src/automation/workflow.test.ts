import { describe, it, expect } from 'vitest';
import {
  WorkflowRuleSchema,
  WorkflowTriggerType,
  FieldUpdateActionSchema,
  EmailAlertActionSchema,
  SmsNotificationActionSchema,
  SlackMessageActionSchema,
  TeamsMessageActionSchema,
  HttpCallActionSchema,
  WebhookTriggerActionSchema,
  TaskCreationActionSchema,
  PushNotificationActionSchema,
  CustomScriptActionSchema,
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

describe('SmsNotificationActionSchema', () => {
  it('should accept SMS notification with Twilio', () => {
    const action = {
      name: 'send_sms_alert',
      type: 'sms_notification' as const,
      provider: 'twilio' as const,
      recipients: ['+1234567890', '{owner.phone}'],
      message: 'Your order has been shipped!',
      fromNumber: '+0987654321',
    };

    expect(() => SmsNotificationActionSchema.parse(action)).not.toThrow();
  });

  it('should accept SMS notification with Vonage', () => {
    const action = {
      name: 'send_alert',
      type: 'sms_notification' as const,
      provider: 'vonage' as const,
      recipients: ['+1234567890'],
      message: 'Alert: High priority case assigned',
    };

    expect(() => SmsNotificationActionSchema.parse(action)).not.toThrow();
  });

  it('should reject invalid provider', () => {
    const action = {
      name: 'send_sms',
      type: 'sms_notification' as const,
      provider: 'invalid_provider',
      recipients: ['+1234567890'],
      message: 'Test message',
    };

    expect(() => SmsNotificationActionSchema.parse(action)).toThrow();
  });
});

describe('SlackMessageActionSchema', () => {
  it('should accept basic Slack message', () => {
    const action = {
      name: 'notify_slack',
      type: 'slack_message' as const,
      channel: '#general',
      message: 'New lead created!',
    };

    expect(() => SlackMessageActionSchema.parse(action)).not.toThrow();
  });

  it('should accept Slack message with mentions', () => {
    const action = {
      name: 'notify_team',
      type: 'slack_message' as const,
      channel: 'C1234567890',
      message: 'Urgent: High value deal needs attention',
      mentions: ['@john', '@jane', 'U9876543210'],
    };

    expect(() => SlackMessageActionSchema.parse(action)).not.toThrow();
  });

  it('should accept Slack message in thread', () => {
    const action = {
      name: 'reply_thread',
      type: 'slack_message' as const,
      channel: '#deals',
      message: 'Update: Deal closed!',
      threadId: '1234567890.123456',
    };

    expect(() => SlackMessageActionSchema.parse(action)).not.toThrow();
  });
});

describe('TeamsMessageActionSchema', () => {
  it('should accept basic Teams message', () => {
    const action = {
      name: 'notify_teams',
      type: 'teams_message' as const,
      channel: 'channel-id-123',
      message: 'New case assigned to your team',
    };

    expect(() => TeamsMessageActionSchema.parse(action)).not.toThrow();
  });

  it('should accept Teams message with mentions and team', () => {
    const action = {
      name: 'escalate_teams',
      type: 'teams_message' as const,
      channel: 'channel-id-456',
      message: '**Critical Issue**: Immediate attention required',
      mentions: ['user-id-1', 'user-id-2'],
      teamId: 'team-id-789',
    };

    expect(() => TeamsMessageActionSchema.parse(action)).not.toThrow();
  });
});

describe('HttpCallActionSchema', () => {
  it('should accept basic GET request', () => {
    const action = {
      name: 'fetch_data',
      type: 'http_call' as const,
      url: 'https://api.example.com/data',
      method: 'GET' as const,
    };

    expect(() => HttpCallActionSchema.parse(action)).not.toThrow();
  });

  it('should accept POST request with body and headers', () => {
    const action = {
      name: 'send_data',
      type: 'http_call' as const,
      url: 'https://api.example.com/create',
      method: 'POST' as const,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
      },
      body: {
        name: '{record.name}',
        value: '{record.value}',
      },
    };

    expect(() => HttpCallActionSchema.parse(action)).not.toThrow();
  });

  it('should accept request with authentication', () => {
    const action = {
      name: 'api_call',
      type: 'http_call' as const,
      url: 'https://api.example.com/secure',
      method: 'POST' as const,
      authentication: {
        type: 'bearer' as const,
        credentials: {
          token: '{$Credential.ApiToken}',
        },
      },
      timeout: 5000,
    };

    expect(() => HttpCallActionSchema.parse(action)).not.toThrow();
  });

  it('should accept all HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
    
    methods.forEach(method => {
      const action = {
        name: `test_${method.toLowerCase()}`,
        type: 'http_call' as const,
        url: 'https://api.example.com/test',
        method,
      };
      expect(() => HttpCallActionSchema.parse(action)).not.toThrow();
    });
  });
});

describe('WebhookTriggerActionSchema', () => {
  it('should accept basic webhook trigger', () => {
    const action = {
      name: 'trigger_webhook',
      type: 'webhook_trigger' as const,
      url: 'https://webhook.site/unique-id',
    };

    const result = WebhookTriggerActionSchema.parse(action);
    expect(result.method).toBe('POST');
    expect(result.retryOnFailure).toBe(true);
    expect(result.maxRetries).toBe(3);
  });

  it('should accept webhook with custom configuration', () => {
    const action = {
      name: 'custom_webhook',
      type: 'webhook_trigger' as const,
      url: 'https://api.example.com/webhook',
      method: 'PUT' as const,
      headers: {
        'X-Webhook-Secret': 'secret-key',
      },
      payload: {
        event: 'record.created',
        data: '{record}',
      },
      retryOnFailure: false,
      maxRetries: 5,
    };

    expect(() => WebhookTriggerActionSchema.parse(action)).not.toThrow();
  });
});

describe('TaskCreationActionSchema', () => {
  it('should accept minimal task creation', () => {
    const action = {
      name: 'create_followup_task',
      type: 'task_creation' as const,
      taskObject: 'task',
      subject: 'Follow up with customer',
    };

    expect(() => TaskCreationActionSchema.parse(action)).not.toThrow();
  });

  it('should accept complete task creation', () => {
    const action = {
      name: 'create_project_task',
      type: 'task_creation' as const,
      taskObject: 'project_task',
      subject: 'Review and approve proposal',
      description: 'Please review the proposal and provide feedback',
      assignedTo: '{owner.manager_id}',
      dueDate: 'TODAY() + 7',
      priority: 'high',
      relatedTo: '{record.id}',
      additionalFields: {
        project_id: '{record.project_id}',
        estimated_hours: 4,
      },
    };

    expect(() => TaskCreationActionSchema.parse(action)).not.toThrow();
  });
});

describe('PushNotificationActionSchema', () => {
  it('should accept basic push notification', () => {
    const action = {
      name: 'send_push',
      type: 'push_notification' as const,
      title: 'New Message',
      body: 'You have a new message from support',
      recipients: ['user-123', 'user-456'],
    };

    expect(() => PushNotificationActionSchema.parse(action)).not.toThrow();
  });

  it('should accept push notification with full configuration', () => {
    const action = {
      name: 'send_rich_push',
      type: 'push_notification' as const,
      title: 'Order Shipped',
      body: 'Your order #12345 has been shipped!',
      recipients: ['{customer.device_token}'],
      data: {
        orderId: '{record.id}',
        trackingNumber: '{record.tracking_number}',
      },
      badge: 1,
      sound: 'notification.wav',
      clickAction: '/orders/{record.id}',
    };

    expect(() => PushNotificationActionSchema.parse(action)).not.toThrow();
  });
});

describe('CustomScriptActionSchema', () => {
  it('should accept JavaScript script with defaults', () => {
    const action = {
      name: 'run_custom_logic',
      type: 'custom_script' as const,
      code: 'console.log("Hello from workflow");',
    };

    const result = CustomScriptActionSchema.parse(action);
    expect(result.language).toBe('javascript');
    expect(result.timeout).toBe(30000);
  });

  it('should accept TypeScript script', () => {
    const action = {
      name: 'calculate_score',
      type: 'custom_script' as const,
      language: 'typescript' as const,
      code: `
        const score = record.value1 * 0.3 + record.value2 * 0.7;
        return { score };
      `,
      timeout: 10000,
      context: {
        record: '{record}',
        user: '{$User}',
      },
    };

    expect(() => CustomScriptActionSchema.parse(action)).not.toThrow();
  });

  it('should accept Python script', () => {
    const action = {
      name: 'data_processing',
      type: 'custom_script' as const,
      language: 'python' as const,
      code: 'import json\nresult = json.dumps({"processed": True})',
      timeout: 60000,
    };

    expect(() => CustomScriptActionSchema.parse(action)).not.toThrow();
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

  it('should accept SMS notification action', () => {
    const action = {
      name: 'send_sms',
      type: 'sms_notification' as const,
      provider: 'twilio' as const,
      recipients: ['+1234567890'],
      message: 'Test message',
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept Slack message action', () => {
    const action = {
      name: 'send_slack',
      type: 'slack_message' as const,
      channel: '#general',
      message: 'Test message',
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept Teams message action', () => {
    const action = {
      name: 'send_teams',
      type: 'teams_message' as const,
      channel: 'channel-id',
      message: 'Test message',
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept HTTP call action', () => {
    const action = {
      name: 'api_call',
      type: 'http_call' as const,
      url: 'https://api.example.com/endpoint',
      method: 'POST' as const,
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept webhook trigger action', () => {
    const action = {
      name: 'trigger_webhook',
      type: 'webhook_trigger' as const,
      url: 'https://webhook.example.com',
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept task creation action', () => {
    const action = {
      name: 'create_task',
      type: 'task_creation' as const,
      taskObject: 'task',
      subject: 'Follow up',
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept push notification action', () => {
    const action = {
      name: 'send_push',
      type: 'push_notification' as const,
      title: 'Notification',
      body: 'You have a new update',
      recipients: ['user-123'],
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should accept custom script action', () => {
    const action = {
      name: 'run_script',
      type: 'custom_script' as const,
      code: 'console.log("test");',
    };

    expect(() => WorkflowActionSchema.parse(action)).not.toThrow();
  });

  it('should reject action with invalid type', () => {
    const action = {
      name: 'invalid_action',
      type: 'invalid_type',
      options: {},
    };

    expect(() => WorkflowActionSchema.parse(action)).toThrow();
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

    it('should accept multi-channel notification workflow', () => {
      const workflow: WorkflowRule = {
        name: 'notify_high_value_deal',
        objectName: 'opportunity',
        triggerType: 'on_create_or_update',
        criteria: 'amount > 100000',
        actions: [
          {
            name: 'send_email',
            type: 'email_alert',
            template: 'high_value_deal_alert',
            recipients: ['sales-director@example.com'],
          },
          {
            name: 'send_sms',
            type: 'sms_notification',
            provider: 'twilio',
            recipients: ['{sales_director.phone}'],
            message: 'High value deal alert: ${record.name} - $${record.amount}',
          },
          {
            name: 'post_slack',
            type: 'slack_message',
            channel: '#sales-wins',
            message: '🎉 New high-value opportunity: *${record.name}* worth $${record.amount}',
            mentions: ['@sales-team'],
          },
          {
            name: 'send_push',
            type: 'push_notification',
            title: 'High Value Deal',
            body: 'New opportunity: ${record.name}',
            recipients: ['{sales_director.device_token}'],
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept webhook integration workflow', () => {
      const workflow: WorkflowRule = {
        name: 'sync_to_external_system',
        objectName: 'order',
        triggerType: 'on_create',
        actions: [
          {
            name: 'call_inventory_api',
            type: 'http_call',
            url: 'https://inventory.example.com/api/reserve',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              order_id: '{record.id}',
              items: '{record.line_items}',
            },
            authentication: {
              type: 'bearer',
              credentials: {
                token: '{$Credential.InventoryApiToken}',
              },
            },
          },
          {
            name: 'trigger_fulfillment_webhook',
            type: 'webhook_trigger',
            url: 'https://fulfillment.example.com/webhook/new-order',
            payload: {
              order: '{record}',
            },
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept task creation workflow', () => {
      const workflow: WorkflowRule = {
        name: 'create_followup_tasks',
        objectName: 'lead',
        triggerType: 'on_create',
        criteria: 'status == "qualified"',
        actions: [
          {
            name: 'create_initial_contact_task',
            type: 'task_creation',
            taskObject: 'task',
            subject: 'Initial contact with ${record.company}',
            description: 'Reach out to discuss their needs',
            assignedTo: '{owner.id}',
            dueDate: 'TODAY() + 1',
            priority: 'high',
            relatedTo: '{record.id}',
          },
          {
            name: 'create_followup_task',
            type: 'task_creation',
            taskObject: 'task',
            subject: 'Follow up with ${record.company}',
            assignedTo: '{owner.id}',
            dueDate: 'TODAY() + 7',
            priority: 'normal',
            relatedTo: '{record.id}',
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept custom script workflow', () => {
      const workflow: WorkflowRule = {
        name: 'calculate_complex_metrics',
        objectName: 'project',
        triggerType: 'on_update',
        criteria: 'status == "in_progress"',
        actions: [
          {
            name: 'calculate_health_score',
            type: 'custom_script',
            language: 'javascript',
            code: `
              const completion = record.tasks_completed / record.total_tasks;
              const timeElapsed = (Date.now() - record.start_date) / (record.end_date - record.start_date);
              const healthScore = (completion / timeElapsed) * 100;
              return { health_score: Math.min(100, Math.max(0, healthScore)) };
            `,
            timeout: 5000,
            context: {
              record: '{record}',
            },
          },
          {
            name: 'update_health_score',
            type: 'field_update',
            field: 'health_score',
            value: '{$Script.health_score}',
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });

    it('should accept Teams notification workflow', () => {
      const workflow: WorkflowRule = {
        name: 'notify_teams_on_escalation',
        objectName: 'support_ticket',
        triggerType: 'on_update',
        criteria: 'is_escalated == true',
        actions: [
          {
            name: 'post_to_teams',
            type: 'teams_message',
            channel: 'escalations-channel',
            message: '⚠️ **Escalated Ticket**: ${record.subject}\n\nCustomer: ${record.customer_name}\nPriority: ${record.priority}',
            mentions: ['{record.assigned_to}', '{team_lead.id}'],
            teamId: 'support-team',
          },
          {
            name: 'create_escalation_task',
            type: 'task_creation',
            taskObject: 'task',
            subject: 'Resolve escalated ticket: ${record.subject}',
            assignedTo: '{team_lead.id}',
            dueDate: 'NOW() + 4 HOURS',
            priority: 'critical',
            relatedTo: '{record.id}',
          },
        ],
      };

      expect(() => WorkflowRuleSchema.parse(workflow)).not.toThrow();
    });
  });
});
