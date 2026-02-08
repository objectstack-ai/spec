import { describe, it, expect } from 'vitest';
import {
  ArticleSchema,
  ProjectSchema,
  CustomerSchema,
  CustomFieldSchema,
  PluginManifestSchema,
  DocumentSchema,
  WorkspaceSchema,
  IntegrationSchema,
  EventSchema,
  ResourceSchema,
} from './schema-examples.zod.js';

describe('Example Schemas', () => {
  describe('ArticleSchema (TimestampedSchema)', () => {
    it('should validate valid article', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'My First Article',
        slug: 'my-first-article',
        content: 'This is the article content.',
        status: 'draft' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
      };
      expect(() => ArticleSchema.parse(valid)).not.toThrow();
    });

    it('should default status to draft', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        slug: 'test',
        content: 'Content',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
      };
      const result = ArticleSchema.parse(input);
      expect(result.status).toBe('draft');
    });

    it('should reject invalid slug format', () => {
      const invalid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        slug: 'Invalid_Slug',
        content: 'Content',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
      };
      expect(() => ArticleSchema.parse(invalid)).toThrow();
    });
  });

  describe('ProjectSchema (AuditableSchema)', () => {
    it('should validate project with full audit trail', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'crm_redesign',
        displayName: 'CRM Redesign Project',
        description: 'Redesigning the customer relationship management system',
        status: 'active' as const,
        priority: 'high' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_456',
      };
      expect(() => ProjectSchema.parse(valid)).not.toThrow();
    });

    it('should enforce snake_case for project name', () => {
      const invalid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'CrmRedesign',
        displayName: 'CRM Redesign',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      expect(() => ProjectSchema.parse(invalid)).toThrow();
    });
  });

  describe('CustomerSchema (SoftDeletableSchema)', () => {
    it('should validate non-deleted customer', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'customer@example.com',
        name: 'John Doe',
        company: 'Acme Corp',
        tier: 'professional' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      expect(() => CustomerSchema.parse(valid)).not.toThrow();
    });

    it('should validate soft-deleted customer', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'customer@example.com',
        name: 'John Doe',
        tier: 'free',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
        deletedAt: '2024-01-17T09:00:00Z',
        deletedBy: 'user_admin',
      };
      expect(() => CustomerSchema.parse(valid)).not.toThrow();
    });
  });

  describe('CustomFieldSchema (NamedEntitySchema)', () => {
    it('should validate field with name and label', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'email_address',
        label: 'Email Address',
        description: 'Customer email address',
        objectName: 'crm_customer',
        type: 'text' as const,
        required: true,
      };
      expect(() => CustomFieldSchema.parse(valid)).not.toThrow();
    });

    it('should enforce snake_case for field name', () => {
      const invalid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'EmailAddress',
        label: 'Email Address',
        objectName: 'crm_customer',
        type: 'text',
      };
      expect(() => CustomFieldSchema.parse(invalid)).toThrow();
    });
  });

  describe('PluginManifestSchema (VersionableSchema)', () => {
    it('should validate plugin with semantic version', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'analytics_plugin',
        displayName: 'Analytics Plugin',
        description: 'Advanced analytics capabilities',
        version: '1.2.3',
        author: 'ObjectStack Team',
      };
      expect(() => PluginManifestSchema.parse(valid)).not.toThrow();
    });

    it('should reject invalid version format', () => {
      const invalid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'analytics_plugin',
        displayName: 'Analytics Plugin',
        description: 'Advanced analytics capabilities',
        version: 'v1.2.3',
        author: 'ObjectStack Team',
      };
      expect(() => PluginManifestSchema.parse(invalid)).toThrow();
    });

    it('should default license to MIT', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'test_plugin',
        displayName: 'Test Plugin',
        description: 'Test',
        version: '1.0.0',
        author: 'Test Author',
      };
      const result = PluginManifestSchema.parse(input);
      expect(result.license).toBe('MIT');
    });
  });

  describe('DocumentSchema (TaggableSchema + AuditableSchema)', () => {
    it('should validate document with tags', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Q4 Financial Report',
        filename: 'q4-report.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
        storageUrl: 'https://storage.example.com/docs/q4-report.pdf',
        category: 'report' as const,
        tags: ['finance', 'q4', '2024'],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      expect(() => DocumentSchema.parse(valid)).not.toThrow();
    });
  });

  describe('WorkspaceSchema (OwnableSchema + AuditableSchema)', () => {
    it('should validate workspace with ownership', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Engineering Team Workspace',
        slug: 'engineering-team',
        description: 'Workspace for engineering team collaboration',
        visibility: 'team' as const,
        ownerId: 'user_123',
        ownerType: 'user' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      expect(() => WorkspaceSchema.parse(valid)).not.toThrow();
    });

    it('should default ownerType to user', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Workspace',
        slug: 'test',
        ownerId: 'user_123',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      const result = WorkspaceSchema.parse(input);
      expect(result.ownerType).toBe('user');
    });
  });

  describe('IntegrationSchema (ActivatableSchema + AuditableSchema)', () => {
    it('should validate active integration', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'salesforce_integration',
        provider: 'salesforce' as const,
        apiKey: 'sk_test_123',
        config: { instanceUrl: 'https://na1.salesforce.com' },
        active: true,
        syncStatus: 'success' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      expect(() => IntegrationSchema.parse(valid)).not.toThrow();
    });

    it('should default active to true', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'test_integration',
        provider: 'stripe',
        apiKey: 'sk_test_123',
        config: {},
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      const result = IntegrationSchema.parse(input);
      expect(result.active).toBe(true);
    });
  });

  describe('EventSchema (MetadataContainerSchema + TimestampedSchema)', () => {
    it('should validate event with metadata', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'user.login',
        source: 'auth-service',
        userId: 'user_123',
        sessionId: 'session_456',
        payload: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
        },
        severity: 'info' as const,
        metadata: {
          region: 'us-east-1',
          datacenter: 'dc1',
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      };
      expect(() => EventSchema.parse(valid)).not.toThrow();
    });

    it('should enforce dot notation for event type', () => {
      const invalid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'UserLogin',
        source: 'auth-service',
        payload: {},
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      };
      expect(() => EventSchema.parse(invalid)).toThrow();
    });
  });

  describe('ResourceSchema (Complex Composition)', () => {
    it('should validate resource with all base schema fields', () => {
      const valid = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'training_dataset',
        label: 'Training Dataset',
        description: 'ML model training data',
        type: 'dataset' as const,
        url: 'https://storage.example.com/datasets/training.csv',
        size: 10485760,
        checksum: 'sha256:abc123...',
        tags: ['ml', 'training', 'v1'],
        ownerId: 'user_123',
        ownerType: 'user' as const,
        active: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      expect(() => ResourceSchema.parse(valid)).not.toThrow();
    });

    it('should validate all composed base schema properties', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'test_resource',
        label: 'Test Resource',
        type: 'document',
        url: 'https://example.com/doc.pdf',
        size: 1024,
        checksum: 'abc123',
        ownerId: 'user_123',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: 'user_123',
        updatedBy: 'user_123',
      };
      const result = ResourceSchema.parse(input);
      
      // Verify fields from all base schemas are present
      expect(result).toHaveProperty('name'); // NamedEntitySchema
      expect(result).toHaveProperty('label'); // NamedEntitySchema
      expect(result).toHaveProperty('createdAt'); // AuditableSchema
      expect(result).toHaveProperty('createdBy'); // AuditableSchema
      expect(result).toHaveProperty('ownerType'); // OwnableSchema (default: 'user')
      expect(result).toHaveProperty('active'); // ActivatableSchema (default: true)
    });
  });
});
