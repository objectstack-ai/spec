import { describe, it, expect } from 'vitest';
import {
  NavigationActionTypeSchema,
  ViewActionTypeSchema,
  FormActionTypeSchema,
  DataActionTypeSchema,
  WorkflowActionTypeSchema,
  ComponentActionTypeSchema,
  UIActionTypeSchema,
  NavigationActionParamsSchema,
  ViewActionParamsSchema,
  FormActionParamsSchema,
  ViewActionParams,
  AgentActionSchema,
  AgentActionSequenceSchema,
  AgentActionResultSchema,
  IntentActionMappingSchema,
} from './agent-action.zod';

describe('AI Agent Action Protocol', () => {
  describe('Action Type Schemas', () => {
    it('should validate navigation action types', () => {
      expect(NavigationActionTypeSchema.parse('navigate_to_object_list')).toBe('navigate_to_object_list');
      expect(NavigationActionTypeSchema.parse('navigate_to_record_detail')).toBe('navigate_to_record_detail');
      expect(NavigationActionTypeSchema.parse('navigate_home')).toBe('navigate_home');
    });

    it('should validate view action types', () => {
      expect(ViewActionTypeSchema.parse('change_view_mode')).toBe('change_view_mode');
      expect(ViewActionTypeSchema.parse('apply_filter')).toBe('apply_filter');
      expect(ViewActionTypeSchema.parse('refresh_view')).toBe('refresh_view');
    });

    it('should validate form action types', () => {
      expect(FormActionTypeSchema.parse('create_record')).toBe('create_record');
      expect(FormActionTypeSchema.parse('fill_field')).toBe('fill_field');
      expect(FormActionTypeSchema.parse('submit_form')).toBe('submit_form');
    });

    it('should validate data action types', () => {
      expect(DataActionTypeSchema.parse('select_record')).toBe('select_record');
      expect(DataActionTypeSchema.parse('bulk_update')).toBe('bulk_update');
    });

    it('should validate workflow action types', () => {
      expect(WorkflowActionTypeSchema.parse('trigger_flow')).toBe('trigger_flow');
      expect(WorkflowActionTypeSchema.parse('send_email')).toBe('send_email');
    });

    it('should validate component action types', () => {
      expect(ComponentActionTypeSchema.parse('open_modal')).toBe('open_modal');
      expect(ComponentActionTypeSchema.parse('show_notification')).toBe('show_notification');
    });

    it('should validate combined UI action types', () => {
      expect(UIActionTypeSchema.parse('navigate_home')).toBe('navigate_home');
      expect(UIActionTypeSchema.parse('apply_filter')).toBe('apply_filter');
      expect(UIActionTypeSchema.parse('create_record')).toBe('create_record');
    });
  });

  describe('Action Parameter Schemas', () => {
    it('should validate navigation action parameters', () => {
      const params = {
        object: 'account',
        viewType: 'list' as const,
        openInNewTab: true,
      };
      
      const result = NavigationActionParamsSchema.parse(params);
      expect(result.object).toBe('account');
      expect(result.viewType).toBe('list');
      expect(result.openInNewTab).toBe(true);
    });

    it('should validate view action parameters with filters', () => {
      const params = {
        viewMode: 'kanban' as const,
        filters: {
          status: 'active',
          amount: { $gt: 1000 },
        },
        sort: [
          { field: 'created_at', order: 'desc' as const },
        ],
        groupBy: 'status',
      };
      
      const result = ViewActionParamsSchema.parse(params);
      expect(result.viewMode).toBe('kanban');
      expect(result.groupBy).toBe('status');
      expect(result.sort?.[0].field).toBe('created_at');
    });

    it('should validate form action parameters', () => {
      const params = {
        object: 'contact',
        fieldValues: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        },
        validateOnly: false,
      };
      
      const result = FormActionParamsSchema.parse(params);
      expect(result.object).toBe('contact');
      expect(result.fieldValues?.first_name).toBe('John');
      expect(result.validateOnly).toBe(false);
    });
  });

  describe('AgentActionSchema', () => {
    it('should validate complete navigation action', () => {
      const action = {
        id: 'action_001',
        type: 'navigate_to_object_list' as const,
        params: {
          object: 'account',
          viewType: 'list' as const,
        },
        requireConfirmation: false,
        successMessage: 'Navigated to account list',
        metadata: {
          intent: 'Show me all accounts',
          confidence: 0.95,
          agentName: 'sales_assistant',
          timestamp: '2024-01-30T12:00:00Z',
        },
      };
      
      const result = AgentActionSchema.parse(action);
      expect(result.type).toBe('navigate_to_object_list');
      expect(result.metadata?.confidence).toBe(0.95);
    });

    it('should validate form action with confirmation', () => {
      const action = {
        type: 'create_record' as const,
        params: {
          object: 'opportunity',
          fieldValues: {
            name: 'Big Deal',
            amount: 50000,
            stage: 'prospecting',
          },
        },
        requireConfirmation: true,
        confirmationMessage: 'Are you sure you want to create this opportunity?',
        onError: 'retry' as const,
      };
      
      const result = AgentActionSchema.parse(action);
      expect(result.requireConfirmation).toBe(true);
      expect(result.confirmationMessage).toBeDefined();
      expect(result.onError).toBe('retry');
    });

    it('should validate workflow action', () => {
      const action = {
        type: 'send_email' as const,
        params: {
          emailTemplate: 'welcome_email',
          recipients: ['john@example.com', 'jane@example.com'],
          subject: 'Welcome to our platform',
          contextData: {
            user_name: 'John Doe',
            account_name: 'Acme Corp',
          },
        },
        successMessage: 'Email sent successfully',
      };
      
      const result = AgentActionSchema.parse(action);
      expect(result.type).toBe('send_email');
    });

    it('should use default values for optional fields', () => {
      const action = {
        type: 'navigate_home' as const,
        params: {},
      };
      
      const result = AgentActionSchema.parse(action);
      expect(result.requireConfirmation).toBe(false);
      expect(result.onError).toBe('abort');
    });
  });

  describe('AgentActionSequenceSchema', () => {
    it('should validate action sequence', () => {
      const sequence = {
        id: 'seq_001',
        actions: [
          {
            type: 'navigate_to_object_form' as const,
            params: {
              object: 'contact',
              mode: 'new' as const,
            },
          },
          {
            type: 'fill_field' as const,
            params: {
              fieldValues: {
                first_name: 'John',
                email: 'john@example.com',
              },
            },
          },
          {
            type: 'submit_form' as const,
            params: {},
          },
        ],
        mode: 'sequential' as const,
        stopOnError: true,
        atomic: true,
        metadata: {
          intent: 'Create a new contact for John',
          confidence: 0.9,
          agentName: 'crm_assistant',
        },
      };
      
      const result = AgentActionSequenceSchema.parse(sequence);
      expect(result.actions).toHaveLength(3);
      expect(result.mode).toBe('sequential');
      expect(result.atomic).toBe(true);
    });

    it('should validate parallel action sequence', () => {
      const sequence = {
        actions: [
          {
            type: 'send_email' as const,
            params: { recipients: ['user1@example.com'] },
          },
          {
            type: 'send_notification' as const,
            params: { message: 'Task completed' },
          },
        ],
        mode: 'parallel' as const,
        stopOnError: false,
      };
      
      const result = AgentActionSequenceSchema.parse(sequence);
      expect(result.mode).toBe('parallel');
      expect(result.stopOnError).toBe(false);
    });

    it('should use default values', () => {
      const sequence = {
        actions: [
          {
            type: 'refresh_view' as const,
            params: {},
          },
        ],
      };
      
      const result = AgentActionSequenceSchema.parse(sequence);
      expect(result.mode).toBe('sequential');
      expect(result.stopOnError).toBe(true);
      expect(result.atomic).toBe(false);
    });
  });

  describe('AgentActionResultSchema', () => {
    it('should validate successful action result', () => {
      const result = {
        actionId: 'action_001',
        status: 'success' as const,
        data: {
          recordId: 'rec_123',
          object: 'contact',
        },
        metadata: {
          startTime: '2024-01-30T12:00:00Z',
          endTime: '2024-01-30T12:00:01Z',
          duration: 1000,
        },
      };
      
      const parsed = AgentActionResultSchema.parse(result);
      expect(parsed.status).toBe('success');
      expect(parsed.data.recordId).toBe('rec_123');
      expect(parsed.metadata?.duration).toBe(1000);
    });

    it('should validate error action result', () => {
      const result = {
        actionId: 'action_002',
        status: 'error' as const,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email field is required',
          details: {
            field: 'email',
            constraint: 'required',
          },
        },
      };
      
      const parsed = AgentActionResultSchema.parse(result);
      expect(parsed.status).toBe('error');
      expect(parsed.error?.code).toBe('VALIDATION_ERROR');
      expect(parsed.error?.details.field).toBe('email');
    });
  });

  describe('IntentActionMappingSchema', () => {
    it('should validate intent to action mapping', () => {
      const mapping = {
        intent: 'create_new_account',
        examples: [
          'Create a new account',
          'Add a new customer',
          'New account form',
        ],
        actionTemplate: {
          type: 'navigate_to_object_form' as const,
          params: {
            object: 'account',
            mode: 'new' as const,
          },
        },
        paramExtraction: {
          account_name: {
            type: 'entity' as const,
            required: false,
          },
          industry: {
            type: 'slot' as const,
            required: false,
            default: 'Technology',
          },
        },
        minConfidence: 0.8,
      };
      
      const result = IntentActionMappingSchema.parse(mapping);
      expect(result.intent).toBe('create_new_account');
      expect(result.examples).toHaveLength(3);
      expect(result.minConfidence).toBe(0.8);
    });

    it('should use default confidence threshold', () => {
      const mapping = {
        intent: 'show_dashboard',
        actionTemplate: {
          type: 'navigate_to_dashboard' as const,
          params: {},
        },
      };
      
      const result = IntentActionMappingSchema.parse(mapping);
      expect(result.minConfidence).toBe(0.7);
    });
  });

  describe('Complex Use Cases', () => {
    it('should validate multi-step record creation sequence', () => {
      const sequence = {
        id: 'create_opportunity_with_contact',
        actions: [
          // Step 1: Create contact
          {
            type: 'create_record' as const,
            params: {
              object: 'contact',
              fieldValues: {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
              },
            },
            successMessage: 'Contact created',
          },
          // Step 2: Create opportunity linked to contact
          {
            type: 'create_record' as const,
            params: {
              object: 'opportunity',
              fieldValues: {
                name: 'Big Deal',
                amount: 100000,
                // contact_id will be filled from previous action result
              },
            },
            successMessage: 'Opportunity created',
          },
          // Step 3: Navigate to opportunity detail
          {
            type: 'navigate_to_record_detail' as const,
            params: {
              object: 'opportunity',
              // recordId will be filled from previous action result
            },
          },
        ],
        mode: 'sequential' as const,
        atomic: true,
        metadata: {
          intent: 'Create a new opportunity for John Doe at Acme Corp',
        },
      };
      
      const result = AgentActionSequenceSchema.parse(sequence);
      expect(result.actions).toHaveLength(3);
      expect(result.atomic).toBe(true);
    });

    it('should validate bulk operations with filter', () => {
      const action = {
        type: 'bulk_update' as const,
        params: {
          filters: {
            status: 'pending',
            created_date: { $lt: '2024-01-01' },
          },
          updateData: {
            status: 'archived',
            archived_at: '2024-01-30T12:00:00Z',
          },
        },
        requireConfirmation: true,
        confirmationMessage: 'This will archive 150 pending records. Continue?',
        metadata: {
          intent: 'Archive all pending records from last year',
          confidence: 0.85,
        },
      };
      
      const result = AgentActionSchema.parse(action);
      expect(result.type).toBe('bulk_update');
      expect(result.requireConfirmation).toBe(true);
    });

    it('should validate kanban view with grouping and filters', () => {
      const actionParams: ViewActionParams = {
        viewMode: 'kanban' as const,
        groupBy: 'stage',
        filters: {
          owner: 'current_user',
          amount: { $gte: 10000 },
        },
        sort: [
          { field: 'amount', order: 'desc' as const },
        ],
      };
      
      const action = {
        type: 'change_view_mode' as const,
        params: actionParams,
        metadata: {
          intent: 'Show my high-value opportunities in kanban view',
        },
      };
      
      const result = AgentActionSchema.parse(action);
      expect(result.type).toBe('change_view_mode');
      // Validate the params were parsed correctly
      expect(result.params).toBeDefined();
    });
  });
});
