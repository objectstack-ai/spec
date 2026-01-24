import { describe, it, expect } from 'vitest';
import {
  AIOrchestrationSchema,
  AIOrchestrationTriggerSchema,
  AITaskTypeSchema,
  AITaskSchema,
  WorkflowFieldConditionSchema,
  WorkflowScheduleSchema,
  PostProcessingActionSchema,
  BatchAIOrchestrationExecutionSchema,
  AIOrchestrationExecutionResultSchema,
  type AIOrchestration,
  type AITask,
} from './orchestration.zod';

describe('AIOrchestrationTriggerSchema', () => {
  it('should accept all trigger types', () => {
    const triggers = [
      'record_created',
      'record_updated',
      'field_changed',
      'scheduled',
      'manual',
      'webhook',
      'batch',
    ] as const;

    triggers.forEach(trigger => {
      expect(() => AIOrchestrationTriggerSchema.parse(trigger)).not.toThrow();
    });
  });
});

describe('AITaskTypeSchema', () => {
  it('should accept all task types', () => {
    const types = [
      'classify',
      'extract',
      'summarize',
      'generate',
      'predict',
      'translate',
      'sentiment',
      'entity_recognition',
      'anomaly_detection',
      'recommendation',
    ] as const;

    types.forEach(type => {
      expect(() => AITaskTypeSchema.parse(type)).not.toThrow();
    });
  });
});

describe('AITaskSchema', () => {
  it('should accept minimal task configuration', () => {
    const task: AITask = {
      name: 'Classify ticket',
      type: 'classify',
      inputFields: ['description'],
      outputField: 'category',
    };

    const result = AITaskSchema.parse(task);
    expect(result.outputFormat).toBe('text');
    expect(result.active).toBe(true);
    expect(result.retryAttempts).toBe(1);
    expect(result.multiClass).toBe(false);
  });

  it('should accept classification task with classes', () => {
    const task: AITask = {
      name: 'Categorize support ticket',
      type: 'classify',
      inputFields: ['description', 'subject'],
      outputField: 'category',
      classes: ['bug', 'feature_request', 'question', 'complaint'],
      multiClass: true,
    };

    expect(() => AITaskSchema.parse(task)).not.toThrow();
  });

  it('should accept extraction task with schema', () => {
    const task: AITask = {
      name: 'Extract contact info',
      type: 'extract',
      inputFields: ['email_body'],
      outputField: 'structured_data',
      outputFormat: 'json',
      extractionSchema: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
      },
    };

    expect(() => AITaskSchema.parse(task)).not.toThrow();
  });

  it('should accept generation task with temperature', () => {
    const task: AITask = {
      name: 'Generate response',
      type: 'generate',
      inputFields: ['customer_message'],
      outputField: 'suggested_response',
      maxLength: 500,
      temperature: 0.7,
      model: 'gpt-4-turbo',
    };

    expect(() => AITaskSchema.parse(task)).not.toThrow();
  });

  it('should enforce temperature constraints', () => {
    expect(() => AITaskSchema.parse({
      name: 'Test',
      type: 'generate',
      inputFields: ['input'],
      outputField: 'output',
      temperature: -0.1,
    })).toThrow();

    expect(() => AITaskSchema.parse({
      name: 'Test',
      type: 'generate',
      inputFields: ['input'],
      outputField: 'output',
      temperature: 2.1,
    })).toThrow();
  });

  it('should accept task with fallback and retry', () => {
    const task: AITask = {
      name: 'Predict score',
      type: 'predict',
      inputFields: ['engagement_metrics'],
      outputField: 'lead_score',
      outputFormat: 'number',
      fallbackValue: 0,
      retryAttempts: 3,
    };

    expect(() => AITaskSchema.parse(task)).not.toThrow();
  });

  it('should accept task with conditional execution', () => {
    const task: AITask = {
      name: 'Summarize conversation',
      type: 'summarize',
      inputFields: ['conversation_history'],
      outputField: 'summary',
      condition: 'LENGTH(conversation_history) > 1000',
    };

    expect(() => AITaskSchema.parse(task)).not.toThrow();
  });
});

describe('WorkflowFieldConditionSchema', () => {
  it('should accept field change condition', () => {
    const condition = {
      field: 'status',
      operator: 'changed' as const,
    };

    const result = WorkflowFieldConditionSchema.parse(condition);
    expect(result.operator).toBe('changed');
  });

  it('should accept field value condition', () => {
    const condition = {
      field: 'priority',
      operator: 'changed_to' as const,
      value: 'high',
    };

    expect(() => WorkflowFieldConditionSchema.parse(condition)).not.toThrow();
  });
});

describe('WorkflowScheduleSchema', () => {
  it('should accept cron schedule', () => {
    const schedule = {
      type: 'cron' as const,
      cron: '0 9 * * 1-5',
      timezone: 'America/New_York',
    };

    expect(() => WorkflowScheduleSchema.parse(schedule)).not.toThrow();
  });

  it('should accept daily schedule', () => {
    const schedule = {
      type: 'daily' as const,
      time: '09:00',
    };

    const result = WorkflowScheduleSchema.parse(schedule);
    expect(result.timezone).toBe('UTC');
  });

  it('should accept interval schedule', () => {
    const schedule = {
      type: 'interval' as const,
      interval: 60,
    };

    expect(() => WorkflowScheduleSchema.parse(schedule)).not.toThrow();
  });

  it('should accept weekly schedule', () => {
    const schedule = {
      type: 'weekly' as const,
      dayOfWeek: 1,
      time: '10:00',
    };

    expect(() => WorkflowScheduleSchema.parse(schedule)).not.toThrow();
  });
});

describe('PostProcessingActionSchema', () => {
  it('should accept all action types', () => {
    const types = [
      'field_update',
      'send_email',
      'create_record',
      'update_related',
      'trigger_flow',
      'webhook',
    ] as const;

    types.forEach(type => {
      const action = {
        type,
        name: `${type}_action`,
        config: { test: true },
      };
      expect(() => PostProcessingActionSchema.parse(action)).not.toThrow();
    });
  });

  it('should accept action with condition', () => {
    const action = {
      type: 'send_email' as const,
      name: 'notify_manager',
      config: { template: 'high_priority_alert' },
      condition: 'priority == "high"',
    };

    expect(() => PostProcessingActionSchema.parse(action)).not.toThrow();
  });
});

describe('AIOrchestrationSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal workflow', () => {
      const workflow: AIOrchestration = {
        name: 'auto_classify_tickets',
        label: 'Auto-classify Support Tickets',
        objectName: 'support_ticket',
        trigger: 'record_created',
        aiTasks: [
          {
            name: 'Classify ticket',
            type: 'classify',
            inputFields: ['description'],
            outputField: 'category',
            classes: ['bug', 'feature', 'question'],
          },
        ],
      };

      const result = AIOrchestrationSchema.parse(workflow);
      expect(result.active).toBe(true);
      expect(result.version).toBe('1.0.0');
      expect(result.executionMode).toBe('sequential');
      expect(result.priority).toBe('normal');
      expect(result.enableLogging).toBe(true);
    });

    it('should enforce snake_case for workflow name', () => {
      const validNames = ['auto_classify', 'lead_scoring', '_internal_workflow'];
      validNames.forEach(name => {
        expect(() => AIOrchestrationSchema.parse({
          name,
          label: 'Test',
          objectName: 'test_object',
          trigger: 'record_created',
          aiTasks: [{
            name: 'Task',
            type: 'classify',
            inputFields: ['field'],
            outputField: 'output',
          }],
        })).not.toThrow();
      });

      const invalidNames = ['autoClassify', 'Auto-Classify', '123workflow'];
      invalidNames.forEach(name => {
        expect(() => AIOrchestrationSchema.parse({
          name,
          label: 'Test',
          objectName: 'test_object',
          trigger: 'record_created',
          aiTasks: [{
            name: 'Task',
            type: 'classify',
            inputFields: ['field'],
            outputField: 'output',
          }],
        })).toThrow();
      });
    });
  });

  describe('Field Change Trigger', () => {
    it('should accept field change workflow', () => {
      const workflow: AIOrchestration = {
        name: 'priority_change_handler',
        label: 'Handle Priority Changes',
        objectName: 'ticket',
        trigger: 'field_changed',
        fieldConditions: [
          {
            field: 'priority',
            operator: 'changed_to',
            value: 'critical',
          },
        ],
        aiTasks: [
          {
            name: 'Generate escalation message',
            type: 'generate',
            inputFields: ['description', 'history'],
            outputField: 'escalation_note',
          },
        ],
      };

      expect(() => AIOrchestrationSchema.parse(workflow)).not.toThrow();
    });
  });

  describe('Scheduled Workflow', () => {
    it('should accept scheduled workflow', () => {
      const workflow: AIOrchestration = {
        name: 'daily_lead_scoring',
        label: 'Daily Lead Scoring',
        objectName: 'lead',
        trigger: 'scheduled',
        schedule: {
          type: 'daily',
          time: '06:00',
          timezone: 'UTC',
        },
        aiTasks: [
          {
            name: 'Calculate lead score',
            type: 'predict',
            inputFields: ['engagement_score', 'company_size', 'industry'],
            outputField: 'predicted_score',
            outputFormat: 'number',
          },
        ],
      };

      expect(() => AIOrchestrationSchema.parse(workflow)).not.toThrow();
    });
  });

  describe('Complex Workflows', () => {
    it('should accept workflow with multiple AI tasks', () => {
      const workflow: AIOrchestration = {
        name: 'comprehensive_ticket_handler',
        label: 'Comprehensive Ticket Handler',
        objectName: 'support_ticket',
        trigger: 'record_created',
        entryCriteria: 'status == "new"',
        aiTasks: [
          {
            name: 'Extract entities',
            type: 'entity_recognition',
            inputFields: ['description'],
            outputField: 'extracted_entities',
            outputFormat: 'json',
          },
          {
            name: 'Analyze sentiment',
            type: 'sentiment',
            inputFields: ['description', 'tone'],
            outputField: 'sentiment_score',
            outputFormat: 'text',
          },
          {
            name: 'Classify category',
            type: 'classify',
            inputFields: ['description'],
            outputField: 'category',
            classes: ['technical', 'billing', 'general'],
          },
          {
            name: 'Generate summary',
            type: 'summarize',
            inputFields: ['description'],
            outputField: 'summary',
            maxLength: 200,
          },
        ],
        executionMode: 'parallel',
        postActions: [
          {
            type: 'field_update',
            name: 'update_status',
            config: {
              field: 'status',
              value: 'triaged',
            },
          },
        ],
      };

      expect(() => AIOrchestrationSchema.parse(workflow)).not.toThrow();
    });

    it('should accept workflow with all features', () => {
      const workflow: AIOrchestration = {
        name: 'advanced_automation',
        label: 'Advanced Automation Workflow',
        description: 'Comprehensive AI-powered automation',
        objectName: 'opportunity',
        trigger: 'record_updated',
        fieldConditions: [
          { field: 'stage', operator: 'changed' },
        ],
        entryCriteria: 'amount > 10000',
        aiTasks: [
          {
            id: 'task1',
            name: 'Predict win probability',
            type: 'predict',
            model: 'win_probability_model',
            inputFields: ['amount', 'stage', 'industry'],
            outputField: 'win_probability',
            outputFormat: 'number',
            fallbackValue: 0.5,
            retryAttempts: 2,
            condition: 'stage IN ("proposal", "negotiation")',
          },
        ],
        postActions: [
          {
            type: 'send_email',
            name: 'notify_sales_manager',
            config: {
              template: 'high_value_opportunity',
              recipients: ['sales_manager'],
            },
            condition: 'win_probability > 0.8',
          },
        ],
        executionMode: 'sequential',
        stopOnError: true,
        timeout: 300,
        priority: 'high',
        enableLogging: true,
        enableMetrics: true,
        notifyOnFailure: ['admin@example.com'],
        active: true,
        version: '2.1.0',
        tags: ['sales', 'ml', 'high-priority'],
        category: 'sales',
        owner: 'user_123',
      };

      expect(() => AIOrchestrationSchema.parse(workflow)).not.toThrow();
    });
  });
});

describe('BatchAIOrchestrationExecutionSchema', () => {
  it('should accept batch execution request', () => {
    const request = {
      workflowName: 'auto_classify_tickets',
      recordIds: ['rec_1', 'rec_2', 'rec_3'],
    };

    const result = BatchAIOrchestrationExecutionSchema.parse(request);
    expect(result.batchSize).toBe(10);
    expect(result.parallelism).toBe(3);
    expect(result.priority).toBe('normal');
  });

  it('should accept custom batch configuration', () => {
    const request = {
      workflowName: 'lead_scoring',
      recordIds: Array.from({ length: 100 }, (_, i) => `lead_${i}`),
      batchSize: 50,
      parallelism: 5,
      priority: 'high' as const,
    };

    expect(() => BatchAIOrchestrationExecutionSchema.parse(request)).not.toThrow();
  });

  it('should enforce batch size limits', () => {
    expect(() => BatchAIOrchestrationExecutionSchema.parse({
      workflowName: 'test',
      recordIds: ['rec_1'],
      batchSize: 0,
    })).toThrow();

    expect(() => BatchAIOrchestrationExecutionSchema.parse({
      workflowName: 'test',
      recordIds: ['rec_1'],
      batchSize: 1001,
    })).toThrow();
  });
});

describe('AIOrchestrationExecutionResultSchema', () => {
  it('should accept successful execution result', () => {
    const result = {
      workflowName: 'auto_classify_tickets',
      recordId: 'ticket_123',
      status: 'success' as const,
      executionTime: 1250,
      tasksExecuted: 3,
      tasksSucceeded: 3,
      tasksFailed: 0,
      startedAt: '2024-01-01T10:00:00Z',
      completedAt: '2024-01-01T10:00:01Z',
    };

    expect(() => AIOrchestrationExecutionResultSchema.parse(result)).not.toThrow();
  });

  it('should accept result with task details', () => {
    const result = {
      workflowName: 'comprehensive_handler',
      recordId: 'rec_456',
      status: 'partial_success' as const,
      executionTime: 2500,
      tasksExecuted: 4,
      tasksSucceeded: 3,
      tasksFailed: 1,
      taskResults: [
        {
          taskName: 'Classify',
          status: 'success' as const,
          output: 'technical',
          executionTime: 500,
          modelUsed: 'gpt-4',
          tokensUsed: 150,
        },
        {
          taskName: 'Summarize',
          status: 'success' as const,
          output: 'Customer reports login issue...',
          executionTime: 800,
        },
        {
          taskName: 'Extract entities',
          status: 'failed' as const,
          error: 'Model timeout',
          executionTime: 1200,
        },
      ],
      startedAt: '2024-01-01T10:00:00Z',
      completedAt: '2024-01-01T10:00:02Z',
    };

    expect(() => AIOrchestrationExecutionResultSchema.parse(result)).not.toThrow();
  });

  it('should accept failed execution result', () => {
    const result = {
      workflowName: 'test_workflow',
      recordId: 'rec_789',
      status: 'failed' as const,
      executionTime: 100,
      tasksExecuted: 1,
      tasksSucceeded: 0,
      tasksFailed: 1,
      error: 'Model not found',
      startedAt: '2024-01-01T10:00:00Z',
    };

    expect(() => AIOrchestrationExecutionResultSchema.parse(result)).not.toThrow();
  });
});

describe('Real-World Workflow Examples', () => {
  it('should accept customer support ticket automation', () => {
    const workflow: AIOrchestration = {
      name: 'auto_triage_support_tickets',
      label: 'Auto-Triage Support Tickets',
      description: 'Automatically classify, prioritize, and route support tickets',
      objectName: 'support_ticket',
      trigger: 'record_created',
      aiTasks: [
        {
          name: 'Classify ticket type',
          type: 'classify',
          inputFields: ['subject', 'description'],
          outputField: 'ticket_type',
          classes: ['bug', 'feature_request', 'question', 'complaint', 'feedback'],
        },
        {
          name: 'Analyze urgency',
          type: 'classify',
          inputFields: ['description', 'customer_tier'],
          outputField: 'urgency',
          classes: ['low', 'medium', 'high', 'critical'],
        },
        {
          name: 'Detect sentiment',
          type: 'sentiment',
          inputFields: ['description'],
          outputField: 'customer_sentiment',
        },
        {
          name: 'Generate summary',
          type: 'summarize',
          inputFields: ['description'],
          outputField: 'ai_summary',
          maxLength: 150,
        },
      ],
      postActions: [
        {
          type: 'field_update',
          name: 'assign_to_team',
          config: {
            field: 'assigned_team',
            formula: 'CASE(ticket_type, "bug", "engineering", "feature_request", "product", "support")',
          },
        },
        {
          type: 'send_email',
          name: 'notify_on_critical',
          config: {
            template: 'critical_ticket_alert',
            recipients: ['support_manager'],
          },
          condition: 'urgency == "critical"',
        },
      ],
      executionMode: 'parallel',
      priority: 'high',
      active: true,
      category: 'support',
      tags: ['automation', 'ai', 'support'],
    };

    expect(() => AIOrchestrationSchema.parse(workflow)).not.toThrow();
  });

  it('should accept lead scoring automation', () => {
    const workflow: AIOrchestration = {
      name: 'ai_lead_scoring',
      label: 'AI-Powered Lead Scoring',
      objectName: 'lead',
      trigger: 'scheduled',
      schedule: {
        type: 'daily',
        time: '02:00',
        timezone: 'UTC',
      },
      entryCriteria: 'status == "new" OR status == "contacted"',
      aiTasks: [
        {
          name: 'Predict conversion probability',
          type: 'predict',
          model: 'lead_conversion_model',
          inputFields: [
            'company_size',
            'industry',
            'engagement_score',
            'email_open_rate',
            'website_visits',
          ],
          outputField: 'ai_score',
          outputFormat: 'number',
        },
        {
          name: 'Classify quality tier',
          type: 'classify',
          inputFields: ['ai_score', 'company_revenue'],
          outputField: 'quality_tier',
          classes: ['A', 'B', 'C', 'D'],
        },
        {
          name: 'Generate insights',
          type: 'generate',
          inputFields: ['ai_score', 'engagement_score', 'industry'],
          outputField: 'sales_insights',
          promptTemplate: 'lead_insights_template',
          maxLength: 300,
        },
      ],
      postActions: [
        {
          type: 'trigger_flow',
          name: 'assign_to_sales_rep',
          config: {
            flowName: 'lead_assignment_flow',
          },
          condition: 'quality_tier IN ("A", "B")',
        },
      ],
      active: true,
      category: 'sales',
      tags: ['lead-scoring', 'ml', 'automation'],
    };

    expect(() => AIOrchestrationSchema.parse(workflow)).not.toThrow();
  });

  it('should accept document processing workflow', () => {
    const workflow: AIOrchestration = {
      name: 'process_invoice_documents',
      label: 'Process Invoice Documents',
      objectName: 'invoice',
      trigger: 'record_created',
      aiTasks: [
        {
          name: 'Extract invoice data',
          type: 'extract',
          inputFields: ['document_url'],
          outputField: 'extracted_data',
          outputFormat: 'json',
          extractionSchema: {
            invoiceNumber: { type: 'string' },
            date: { type: 'string', format: 'date' },
            amount: { type: 'number' },
            vendorName: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
        {
          name: 'Detect anomalies',
          type: 'anomaly_detection',
          inputFields: ['extracted_data.amount', 'vendor_history'],
          outputField: 'has_anomaly',
          outputFormat: 'boolean',
        },
      ],
      postActions: [
        {
          type: 'field_update',
          name: 'populate_fields',
          config: {
            fields: {
              invoice_number: 'extracted_data.invoiceNumber',
              invoice_date: 'extracted_data.date',
              total_amount: 'extracted_data.amount',
              vendor_name: 'extracted_data.vendorName',
            },
          },
        },
        {
          type: 'trigger_flow',
          name: 'flag_for_review',
          config: {
            flowName: 'manual_review_flow',
          },
          condition: 'has_anomaly == true',
        },
      ],
      active: true,
      category: 'finance',
      tags: ['document-processing', 'ocr', 'automation'],
    };

    expect(() => AIOrchestrationSchema.parse(workflow)).not.toThrow();
  });
});
