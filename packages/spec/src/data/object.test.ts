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
  });
});

describe('Object Extensions', () => {
  it('should accept object with extensions', () => {
    const objectWithExtensions: ServiceObject = {
      name: 'customer',
      label: 'Customer',
      fields: {},
      extensions: {
        'ai_assistant.enableRAG': true,
        'ai_assistant.contextFields': ['name', 'description', 'notes'],
        'ai_assistant.embeddingModel': 'text-embedding-3-small',
      },
    };

    expect(() => ObjectSchema.parse(objectWithExtensions)).not.toThrow();
    const parsed = ObjectSchema.parse(objectWithExtensions);
    expect(parsed.extensions).toEqual({
      'ai_assistant.enableRAG': true,
      'ai_assistant.contextFields': ['name', 'description', 'notes'],
      'ai_assistant.embeddingModel': 'text-embedding-3-small',
    });
  });

  it('should accept object without extensions', () => {
    const object: ServiceObject = {
      name: 'product',
      label: 'Product',
      fields: {},
    };

    expect(() => ObjectSchema.parse(object)).not.toThrow();
  });

  it('should accept object with empty extensions', () => {
    const object: ServiceObject = {
      name: 'product',
      label: 'Product',
      fields: {},
      extensions: {},
    };

    expect(() => ObjectSchema.parse(object)).not.toThrow();
  });

  it('should accept object with complex extension values', () => {
    const object: ServiceObject = {
      name: 'order',
      label: 'Order',
      fields: {},
      extensions: {
        'workflow_engine.autoApprovalRules': [
          { field: 'amount', operator: '<', value: 1000 },
          { field: 'status', operator: '=', value: 'pending' },
        ],
        'integration.webhookConfig': {
          url: 'https://api.example.com/webhook',
          headers: {
            'Authorization': 'Bearer token',
          },
          events: ['onCreate', 'onUpdate', 'onDelete'],
        },
        'analytics.trackingEnabled': true,
      },
    };

    expect(() => ObjectSchema.parse(object)).not.toThrow();
  });

  it('should work with ObjectSchema.create factory', () => {
    const object = ObjectSchema.create({
      name: 'task',
      label: 'Task',
      fields: {},
      extensions: {
        'ai_assistant.enableRAG': true,
      },
    });

    expect(() => ObjectSchema.parse(object)).not.toThrow();
  });
});

