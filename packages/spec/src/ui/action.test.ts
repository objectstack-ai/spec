import { describe, it, expect } from 'vitest';
import { ActionSchema, ActionParamSchema, Action, type Action as ActionType } from './action.zod';

describe('ActionParamSchema', () => {
  it('should accept minimal action parameter', () => {
    const param = {
      name: 'comment',
      label: 'Comment',
      type: 'text' as const,
    };

    const result = ActionParamSchema.parse(param);
    expect(result.required).toBe(false);
  });

  it('should accept required parameter', () => {
    const param = {
      name: 'reason',
      label: 'Reason',
      type: 'textarea' as const,
      required: true,
    };

    expect(() => ActionParamSchema.parse(param)).not.toThrow();
  });

  it('should accept parameter with options', () => {
    const param = {
      name: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    };

    expect(() => ActionParamSchema.parse(param)).not.toThrow();
  });
});

describe('ActionSchema', () => {
  describe('Basic Action Properties', () => {
    it('should accept minimal action', () => {
      const action: ActionType = {
        name: 'approve',
        label: 'Approve',
      };

      const result = ActionSchema.parse(action);
      expect(result.type).toBe('script');
      expect(result.refreshAfter).toBe(false);
    });

    it('should enforce snake_case for action name', () => {
      const validNames = ['approve_record', 'send_email', 'close_case'];
      validNames.forEach(name => {
        expect(() => ActionSchema.parse({ name, label: 'Test' })).not.toThrow();
      });

      const invalidNames = ['approveRecord', 'Approve-Record', '123action', '_internal'];
      invalidNames.forEach(name => {
        expect(() => ActionSchema.parse({ name, label: 'Test' })).toThrow();
      });
    });

    it('should accept action with icon', () => {
      const action: ActionType = {
        name: 'delete_record',
        label: 'Delete',
        icon: 'trash-2',
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });
  });

  describe('Action Types', () => {
    it('should accept all action types', () => {
      const types = ['script', 'url', 'modal', 'flow', 'api'] as const;
      
      types.forEach(type => {
        const action: ActionType = {
          name: 'test_action',
          label: 'Test',
          type,
        };
        expect(() => ActionSchema.parse(action)).not.toThrow();
      });
    });

    it('should default to script type', () => {
      const action = {
        name: 'custom_action',
        label: 'Custom',
      };

      const result = ActionSchema.parse(action);
      expect(result.type).toBe('script');
    });
  });

  describe('Action Locations', () => {
    it('should accept valid locations', () => {
      const locations = [
        'list_toolbar',
        'list_item',
        'record_header',
        'record_more',
        'record_related',
        'global_nav',
      ] as const;

      const action: ActionType = {
        name: 'multi_location',
        label: 'Multi Location',
        locations,
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });

    it('should accept single location', () => {
      const action: ActionType = {
        name: 'toolbar_action',
        label: 'Toolbar Action',
        locations: ['list_toolbar'],
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });
  });

  describe('Action Targets', () => {
    it('should accept URL action with target', () => {
      const action: ActionType = {
        name: 'open_external',
        label: 'Open External',
        type: 'url',
        target: 'https://example.com/api',
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });

    it('should accept flow action with target', () => {
      const action: ActionType = {
        name: 'run_approval_flow',
        label: 'Run Approval',
        type: 'flow',
        target: 'approval_workflow',
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });

    it('should accept API action with target', () => {
      const action: ActionType = {
        name: 'call_api',
        label: 'Call API',
        type: 'api',
        target: '/api/custom-endpoint',
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });
  });

  describe('Action Parameters', () => {
    it('should accept action with parameters', () => {
      const action: ActionType = {
        name: 'transfer_ownership',
        label: 'Transfer Ownership',
        type: 'script',
        params: [
          {
            name: 'new_owner',
            label: 'New Owner',
            type: 'lookup',
            required: true,
          },
          {
            name: 'notify',
            label: 'Notify Old Owner',
            type: 'boolean',
            required: false,
          },
        ],
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });

    it('should accept action with select parameter', () => {
      const action: ActionType = {
        name: 'change_status',
        label: 'Change Status',
        params: [
          {
            name: 'status',
            label: 'New Status',
            type: 'select',
            required: true,
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ],
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });
  });

  describe('UX Behavior', () => {
    it('should accept action with confirmation', () => {
      const action: ActionType = {
        name: 'delete_all',
        label: 'Delete All',
        confirmText: 'Are you sure you want to delete all records? This cannot be undone.',
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });

    it('should accept action with success message', () => {
      const action: ActionType = {
        name: 'send_notification',
        label: 'Send Notification',
        successMessage: 'Notification sent successfully!',
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });

    it('should accept action that refreshes view', () => {
      const action: ActionType = {
        name: 'update_status',
        label: 'Update Status',
        refreshAfter: true,
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });

    it('should accept action with all UX properties', () => {
      const action: ActionType = {
        name: 'complete_task',
        label: 'Complete Task',
        confirmText: 'Mark this task as complete?',
        successMessage: 'Task completed successfully!',
        refreshAfter: true,
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });
  });

  describe('Visibility Control', () => {
    it('should accept action with visibility formula', () => {
      const action: ActionType = {
        name: 'approve',
        label: 'Approve',
        visible: 'status == "pending" && user.can_approve',
      };

      expect(() => ActionSchema.parse(action)).not.toThrow();
    });
  });

  describe('Real-World Action Examples', () => {
    it('should accept approve opportunity action', () => {
      const approveAction: ActionType = {
        name: 'approve_opportunity',
        label: 'Approve',
        icon: 'check-circle',
        type: 'script',
        locations: ['record_header', 'record_more'],
        target: 'approveOpportunity',
        confirmText: 'Are you sure you want to approve this opportunity?',
        successMessage: 'Opportunity approved successfully!',
        refreshAfter: true,
        visible: 'status == "pending_approval" && user.has_permission("approve_opportunities")',
      };

      expect(() => ActionSchema.parse(approveAction)).not.toThrow();
    });

    it('should accept transfer case action with parameters', () => {
      const transferAction: ActionType = {
        name: 'transfer_case',
        label: 'Transfer Case',
        icon: 'arrow-right',
        type: 'modal',
        locations: ['record_more'],
        params: [
          {
            name: 'new_owner',
            label: 'New Owner',
            type: 'lookup',
            required: true,
          },
          {
            name: 'reason',
            label: 'Transfer Reason',
            type: 'textarea',
            required: false,
          },
          {
            name: 'notify_customer',
            label: 'Notify Customer',
            type: 'boolean',
            required: false,
          },
        ],
        successMessage: 'Case transferred successfully!',
        refreshAfter: true,
      };

      expect(() => ActionSchema.parse(transferAction)).not.toThrow();
    });

    it('should accept send email action', () => {
      const emailAction: ActionType = {
        name: 'send_quote',
        label: 'Send Quote',
        icon: 'mail',
        type: 'flow',
        target: 'send_quote_flow',
        locations: ['record_header', 'list_item'],
        params: [
          {
            name: 'recipient',
            label: 'Send To',
            type: 'email',
            required: true,
          },
          {
            name: 'template',
            label: 'Email Template',
            type: 'select',
            required: true,
            options: [
              { label: 'Standard Quote', value: 'standard_quote' },
              { label: 'Premium Quote', value: 'premium_quote' },
            ],
          },
        ],
        successMessage: 'Quote sent!',
      };

      expect(() => ActionSchema.parse(emailAction)).not.toThrow();
    });

    it('should accept export to Excel action', () => {
      const exportAction: ActionType = {
        name: 'export_excel',
        label: 'Export to Excel',
        icon: 'file-spreadsheet',
        type: 'api',
        target: '/api/export/excel',
        locations: ['list_toolbar'],
        successMessage: 'Export started. You will receive an email when ready.',
      };

      expect(() => ActionSchema.parse(exportAction)).not.toThrow();
    });

    it('should accept delete action with confirmation', () => {
      const deleteAction: ActionType = {
        name: 'delete_record',
        label: 'Delete',
        icon: 'trash-2',
        type: 'script',
        locations: ['record_more'],
        target: 'deleteRecord',
        confirmText: 'Are you sure you want to delete this record? This action cannot be undone.',
        successMessage: 'Record deleted successfully!',
        refreshAfter: true,
        visible: 'user.has_permission("delete_records")',
      };

      expect(() => ActionSchema.parse(deleteAction)).not.toThrow();
    });

    it('should accept clone record action', () => {
      const cloneAction: ActionType = {
        name: 'clone_record',
        label: 'Clone',
        icon: 'copy',
        type: 'script',
        locations: ['record_more', 'list_item'],
        target: 'cloneRecord',
        params: [
          {
            name: 'include_children',
            label: 'Include Related Records',
            type: 'boolean',
            required: false,
          },
        ],
        successMessage: 'Record cloned successfully!',
        refreshAfter: true,
      };

      expect(() => ActionSchema.parse(cloneAction)).not.toThrow();
    });

    it('should accept open external link action', () => {
      const linkAction: ActionType = {
        name: 'view_on_map',
        label: 'View on Map',
        icon: 'map-pin',
        type: 'url',
        target: 'https://maps.google.com/?q={address}',
        locations: ['record_related'],
        visible: 'address != null',
      };

      expect(() => ActionSchema.parse(linkAction)).not.toThrow();
    });
  });
});

describe('Action Factory', () => {
  it('should create action with default values via factory', () => {
    const action = Action.create({
      name: 'test_action',
      label: 'Test Action',
    });
    
    expect(action.name).toBe('test_action');
    expect(action.label).toBe('Test Action');
    expect(action.type).toBe('script');
    expect(action.refreshAfter).toBe(false);
  });

  it('should create action without refreshAfter property (uses default)', () => {
    const action = Action.create({
      name: 'send_email',
      label: 'Send Email',
      type: 'flow',
      target: 'email_flow',
    });
    
    expect(action.refreshAfter).toBe(false);
  });

  it('should create action with explicit refreshAfter', () => {
    const action = Action.create({
      name: 'update_record',
      label: 'Update',
      refreshAfter: true,
    });
    
    expect(action.refreshAfter).toBe(true);
  });

  it('should validate snake_case name in factory', () => {
    expect(() => Action.create({
      name: 'invalidName',
      label: 'Invalid',
    })).toThrow();

    expect(() => Action.create({
      name: 'valid_name',
      label: 'Valid',
    })).not.toThrow();
  });
});
