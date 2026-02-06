import { describe, it, expect } from 'vitest';
import { ObjectSchema, ObjectCapabilities, IndexSchema, type ServiceObject } from './object.zod';

describe('ObjectCapabilities', () => {
  it('should apply default values correctly', () => {
    const result = ObjectCapabilities.parse({});
    
    expect(result.trackHistory).toBe(false);
    expect(result.searchable).toBe(true);
    expect(result.apiEnabled).toBe(true);
    expect(result.files).toBe(false);
    expect(result.feeds).toBe(false);
    expect(result.activities).toBe(false);
    expect(result.trash).toBe(true);
    expect(result.mru).toBe(true);
    expect(result.clone).toBe(true);
  });

  it('should accept custom capability values', () => {
    const capabilities = {
      trackHistory: true,
      searchable: false,
      apiEnabled: true,
      files: true,
      feeds: true,
      activities: false,
      trash: false,
      mru: true,
      clone: true,
    };

    const result = ObjectCapabilities.parse(capabilities);
    expect(result).toEqual(capabilities);
  });
});

describe('IndexSchema', () => {
  it('should accept basic index definition', () => {
    const index = {
      fields: ['email'],
    };

    expect(() => IndexSchema.parse(index)).not.toThrow();
  });

  it('should accept index with all properties', () => {
    const index = {
      name: 'idx_email_status',
      fields: ['email', 'status'],
      unique: true,
    };

    expect(() => IndexSchema.parse(index)).not.toThrow();
  });

  it('should accept composite index', () => {
    const index = {
      fields: ['tenant_id', 'created_at', 'status'],
      unique: false,
    };

    expect(() => IndexSchema.parse(index)).not.toThrow();
  });

  it('should reject index without fields', () => {
    expect(() => IndexSchema.parse({})).toThrow();
  });
});

describe('ObjectSchema', () => {
  describe('Basic Object Properties', () => {
    it('should accept minimal valid object', () => {
      const validObject: ServiceObject = {
        name: 'account',
        fields: {},
      };

      const result = ObjectSchema.safeParse(validObject);
      expect(result.success).toBe(true);
    });

    it('should enforce snake_case for object name', () => {
      const validNames = ['account', 'project_task', 'user_profile', '_system'];
      validNames.forEach(name => {
        expect(() => ObjectSchema.parse({ name, fields: {} })).not.toThrow();
      });

      const invalidNames = ['Account', 'project-task', 'UserProfile', '123object'];
      invalidNames.forEach(name => {
        expect(() => ObjectSchema.parse({ name, fields: {} })).toThrow();
      });
    });

    it('should apply default values', () => {
      const object = {
        name: 'test_object',
        fields: {},
      };

      const result = ObjectSchema.parse(object);
      expect(result.datasource).toBe('default');
      expect(result.isSystem).toBe(false);
    });
  });

  describe('Object with Fields', () => {
    it('should accept object with multiple fields', () => {
      const objectWithFields: ServiceObject = {
        name: 'contact',
        label: 'Contact',
        pluralLabel: 'Contacts',
        fields: {
          first_name: {
            label: 'First Name',
            type: 'text',
            required: true,
            maxLength: 50,
          },
          last_name: {
            label: 'Last Name',
            type: 'text',
            required: true,
            maxLength: 50,
          },
          email: {
            label: 'Email',
            type: 'email',
            unique: true,
          },
          phone: {
            label: 'Phone',
            type: 'phone',
          },
        },
      };

      expect(() => ObjectSchema.parse(objectWithFields)).not.toThrow();
    });

    it('should enforce snake_case for field names', () => {
      // Valid snake_case field names
      const validFieldNames = ['first_name', 'last_name', 'email', 'company_name', 'annual_revenue', '_system_id'];
      
      validFieldNames.forEach(fieldName => {
        const obj = {
          name: 'test_object',
          fields: {
            [fieldName]: {
              type: 'text' as const,
              label: 'Test Field',
            },
          },
        };
        expect(() => ObjectSchema.parse(obj)).not.toThrow();
      });
    });

    it('should reject PascalCase field names', () => {
      const invalidObject = {
        name: 'lead',
        fields: {
          FirstName: {
            type: 'text' as const,
            label: '名',
          },
        },
      };

      expect(() => ObjectSchema.parse(invalidObject)).toThrow();
      expect(() => ObjectSchema.parse(invalidObject)).toThrow(/Field names must be lowercase snake_case/);
    });

    it('should reject camelCase field names', () => {
      const invalidObject = {
        name: 'lead',
        fields: {
          firstName: {
            type: 'text' as const,
            label: 'First Name',
          },
        },
      };

      expect(() => ObjectSchema.parse(invalidObject)).toThrow();
      expect(() => ObjectSchema.parse(invalidObject)).toThrow(/Field names must be lowercase snake_case/);
    });

    it('should reject kebab-case field names', () => {
      const invalidObject = {
        name: 'lead',
        fields: {
          'first-name': {
            type: 'text' as const,
            label: 'First Name',
          },
        },
      };

      expect(() => ObjectSchema.parse(invalidObject)).toThrow();
      expect(() => ObjectSchema.parse(invalidObject)).toThrow(/Field names must be lowercase snake_case/);
    });

    it('should reject field names with spaces', () => {
      const invalidObject = {
        name: 'lead',
        fields: {
          'first name': {
            type: 'text' as const,
            label: 'First Name',
          },
        },
      };

      expect(() => ObjectSchema.parse(invalidObject)).toThrow();
      expect(() => ObjectSchema.parse(invalidObject)).toThrow(/Field names must be lowercase snake_case/);
    });

    it('should reject field names starting with numbers', () => {
      const invalidObject = {
        name: 'lead',
        fields: {
          '123field': {
            type: 'text' as const,
            label: 'Field',
          },
        },
      };

      expect(() => ObjectSchema.parse(invalidObject)).toThrow();
      expect(() => ObjectSchema.parse(invalidObject)).toThrow(/Field names must be lowercase snake_case/);
    });

    it('should reject mixed-case field names like in AI-generated objects', () => {
      // This is the exact problem from the issue
      const aiGeneratedObject = {
        name: 'lead',
        label: '线索',
        fields: {
          FirstName: {
            type: 'text' as const,
            label: '名',
            maxLength: 40,
          },
          LastName: {
            type: 'text' as const,
            label: '姓',
            required: true,
            maxLength: 80,
          },
          Company: {
            type: 'text' as const,
            label: '公司',
            required: true,
            maxLength: 255,
          },
        },
      };

      expect(() => ObjectSchema.parse(aiGeneratedObject)).toThrow();
      expect(() => ObjectSchema.parse(aiGeneratedObject)).toThrow(/Field names must be lowercase snake_case/);
    });
  });

  describe('Object Metadata', () => {
    it('should accept object with full metadata', () => {
      const fullObject: ServiceObject = {
        name: 'opportunity',
        label: 'Opportunity',
        pluralLabel: 'Opportunities',
        description: 'Sales opportunities tracking',
        icon: 'target',
        datasource: 'salesforce',
        tableName: 'sf_opportunities',
        isSystem: false,
        nameField: 'opportunity_name',
        fields: {
          opportunity_name: {
            label: 'Opportunity Name',
            type: 'text',
          },
        },
      };

      expect(() => ObjectSchema.parse(fullObject)).not.toThrow();
    });
  });

  describe('Object with Indexes', () => {
    it('should accept object with indexes', () => {
      const objectWithIndexes: ServiceObject = {
        name: 'user',
        fields: {
          email: {
            label: 'Email',
            type: 'email',
          },
          username: {
            label: 'Username',
            type: 'text',
          },
        },
        indexes: [
          {
            name: 'idx_email',
            fields: ['email'],
            unique: true,
          },
          {
            name: 'idx_username',
            fields: ['username'],
            unique: true,
          },
          {
            fields: ['email', 'username'],
          },
        ],
      };

      expect(() => ObjectSchema.parse(objectWithIndexes)).not.toThrow();
    });
  });

  describe('Object Capabilities', () => {
    it('should accept object with custom capabilities', () => {
      const objectWithCapabilities: ServiceObject = {
        name: 'case',
        fields: {},
        enable: {
          trackHistory: true,
          searchable: true,
          apiEnabled: true,
          files: true,
          feedEnabled: true,
          trash: true,
        },
      };

      expect(() => ObjectSchema.parse(objectWithCapabilities)).not.toThrow();
    });

    it('should merge default capabilities with custom values', () => {
      const object = {
        name: 'task',
        fields: {},
        enable: {
          trackHistory: true,
          files: true,
        },
      };

      const result = ObjectSchema.parse(object);
      expect(result.enable?.trackHistory).toBe(true);
      expect(result.enable?.files).toBe(true);
      expect(result.enable?.searchable).toBe(true); // default
      expect(result.enable?.apiEnabled).toBe(true); // default
    });
  });

  describe('Complete Real-World Examples', () => {
    it('should accept CRM Account object', () => {
      const accountObject: ServiceObject = {
        name: 'account',
        label: 'Account',
        pluralLabel: 'Accounts',
        description: 'Companies and organizations',
        icon: 'building-2',
        nameField: 'account_name',
        fields: {
          account_name: {
            label: 'Account Name',
            type: 'text',
            required: true,
            maxLength: 255,
          },
          account_number: {
            label: 'Account Number',
            type: 'text',
            unique: true,
            externalId: true,
          },
          website: {
            label: 'Website',
            type: 'url',
          },
          industry: {
            label: 'Industry',
            type: 'select',
            options: [
              { label: 'Technology', value: 'tech' },
              { label: 'Finance', value: 'finance' },
              { label: 'Healthcare', value: 'healthcare' },
            ],
          },
          annual_revenue: {
            label: 'Annual Revenue',
            type: 'currency',
            precision: 18,
            scale: 2,
          },
          owner_id: {
            label: 'Account Owner',
            type: 'lookup',
            reference: 'user',
          },
        },
        indexes: [
          {
            name: 'idx_account_number',
            fields: ['account_number'],
            unique: true,
          },
        ],
        enable: {
          trackHistory: true,
          searchable: true,
          apiEnabled: true,
          files: true,
          feedEnabled: true,
          trash: true,
        },
      };

      expect(() => ObjectSchema.parse(accountObject)).not.toThrow();
    });

    it('should accept Task object with parent relationship', () => {
      const taskObject: ServiceObject = {
        name: 'task',
        label: 'Task',
        pluralLabel: 'Tasks',
        icon: 'check-square',
        nameField: 'subject',
        fields: {
          subject: {
            label: 'Subject',
            type: 'text',
            required: true,
          },
          status: {
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Not Started', value: 'not_started', default: true },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Completed', value: 'completed' },
            ],
          },
          priority: {
            label: 'Priority',
            type: 'select',
            options: [
              { label: 'Low', value: 'low', color: '#00FF00' },
              { label: 'Medium', value: 'medium', color: '#FFA500', default: true },
              { label: 'High', value: 'high', color: '#FF0000' },
            ],
          },
          project_id: {
            label: 'Project',
            type: 'master_detail',
            reference: 'project',
            deleteBehavior: 'cascade',
          },
          assigned_to: {
            label: 'Assigned To',
            type: 'lookup',
            reference: 'user',
          },
          due_date: {
            label: 'Due Date',
            type: 'date',
          },
          completed_at: {
            label: 'Completed At',
            type: 'datetime',
          },
        },
        enable: {
          trackHistory: false,
          searchable: true,
          apiEnabled: true,
          files: false,
          feedEnabled: false,
          trash: true,
        },
      };

      expect(() => ObjectSchema.parse(taskObject)).not.toThrow();
    });

    it('should valid object with state machine', () => {
      const objectWithState = {
        name: 'leave_request',
        fields: {
          status: { type: 'text' }
        },
        stateMachine: {
          id: 'leave_flow',
          initial: 'draft',
          states: {
            draft: { on: { SUBMIT: 'pending' } },
            pending: { on: { APPROVE: 'approved' } },
            approved: { type: 'final' }
          }
        }
      };
      
      const result = ObjectSchema.parse(objectWithState);
      expect(result.stateMachine).toBeDefined();
      expect(result.stateMachine?.initial).toBe('draft');
    });

    it('should support multiple parallel state machines via stateMachines', () => {
      const order = {
        name: 'order',
        fields: {
          status: { type: 'text' },
          payment_status: { type: 'text' },
          approval_status: { type: 'text' },
        },
        stateMachines: {
          lifecycle: {
            id: 'order_lifecycle',
            initial: 'draft',
            states: {
              draft: { on: { SUBMIT: 'submitted' } },
              submitted: { on: { CONFIRM: 'confirmed' } },
              confirmed: { on: { SHIP: 'shipped' } },
              shipped: { on: { DELIVER: 'delivered' } },
              delivered: { type: 'final' },
            }
          },
          payment: {
            id: 'order_payment',
            initial: 'unpaid',
            states: {
              unpaid: { on: { PAY: 'partial', PAY_FULL: 'paid' } },
              partial: { on: { PAY_FULL: 'paid' } },
              paid: { on: { REFUND: 'refunded' } },
              refunded: { type: 'final' },
            }
          },
          approval: {
            id: 'order_approval',
            initial: 'pending',
            states: {
              pending: { on: { APPROVE: 'approved', REJECT: 'rejected' } },
              approved: { type: 'final' },
              rejected: { on: { RESUBMIT: 'pending' } },
            }
          }
        }
      };

      const result = ObjectSchema.parse(order);
      expect(result.stateMachines).toBeDefined();
      expect(Object.keys(result.stateMachines!)).toEqual(['lifecycle', 'payment', 'approval']);
      expect(result.stateMachines!.lifecycle.initial).toBe('draft');
      expect(result.stateMachines!.payment.initial).toBe('unpaid');
      expect(result.stateMachines!.approval.initial).toBe('pending');
    });

    it('should allow both stateMachine and stateMachines to coexist', () => {
      const obj = {
        name: 'contract',
        fields: { status: { type: 'text' } },
        // Legacy single shorthand
        stateMachine: {
          id: 'contract_lifecycle',
          initial: 'draft',
          states: {
            draft: { on: { ACTIVATE: 'active' } },
            active: { type: 'final' },
          }
        },
        // Additional parallel machines
        stateMachines: {
          billing: {
            id: 'contract_billing',
            initial: 'unbilled',
            states: {
              unbilled: { on: { INVOICE: 'invoiced' } },
              invoiced: { on: { PAY: 'paid' } },
              paid: { type: 'final' },
            }
          }
        }
      };

      const result = ObjectSchema.parse(obj);
      expect(result.stateMachine?.initial).toBe('draft');
      expect(result.stateMachines?.billing.initial).toBe('unbilled');
    });
  });
});
