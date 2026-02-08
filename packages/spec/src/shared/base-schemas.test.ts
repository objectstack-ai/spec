import { describe, it, expect } from 'vitest';
import {
  TimestampedSchema,
  AuditableSchema,
  SoftDeletableSchema,
  NamedEntitySchema,
  VersionableSchema,
  TaggableSchema,
  OwnableSchema,
  ActivatableSchema,
  MetadataContainerSchema,
} from './base-schemas.zod.js';

describe('TimestampedSchema', () => {
  it('should validate valid timestamps', () => {
    const valid = {
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
    };
    expect(() => TimestampedSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid datetime formats', () => {
    const invalid = {
      createdAt: '2024-01-15',
      updatedAt: 'invalid',
    };
    expect(() => TimestampedSchema.parse(invalid)).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => TimestampedSchema.parse({ createdAt: '2024-01-15T10:30:00Z' })).toThrow();
  });
});

describe('AuditableSchema', () => {
  it('should validate complete audit trail', () => {
    const valid = {
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdBy: 'user_123',
      updatedBy: 'user_456',
    };
    expect(() => AuditableSchema.parse(valid)).not.toThrow();
  });

  it('should accept system identifiers as creators', () => {
    const valid = {
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdBy: 'system:migration',
      updatedBy: 'system:cron',
    };
    expect(() => AuditableSchema.parse(valid)).not.toThrow();
  });

  it('should extend TimestampedSchema', () => {
    const result = AuditableSchema.parse({
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdBy: 'user_123',
      updatedBy: 'user_123',
    });
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
  });
});

describe('SoftDeletableSchema', () => {
  it('should validate non-deleted entity', () => {
    const valid = {
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdBy: 'user_123',
      updatedBy: 'user_123',
    };
    expect(() => SoftDeletableSchema.parse(valid)).not.toThrow();
  });

  it('should validate soft-deleted entity', () => {
    const valid = {
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdBy: 'user_123',
      updatedBy: 'user_123',
      deletedAt: '2024-01-17T09:00:00Z',
      deletedBy: 'user_admin',
    };
    expect(() => SoftDeletableSchema.parse(valid)).not.toThrow();
  });

  it('should allow optional deletedAt and deletedBy', () => {
    const result = SoftDeletableSchema.parse({
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdBy: 'user_123',
      updatedBy: 'user_123',
    });
    expect(result.deletedAt).toBeUndefined();
    expect(result.deletedBy).toBeUndefined();
  });
});

describe('NamedEntitySchema', () => {
  it('should validate named entity with all fields', () => {
    const valid = {
      name: 'user_profile',
      label: 'User Profile',
      description: 'Stores user account information',
    };
    expect(() => NamedEntitySchema.parse(valid)).not.toThrow();
  });

  it('should enforce snake_case for name', () => {
    const invalid = {
      name: 'UserProfile',
      label: 'User Profile',
    };
    expect(() => NamedEntitySchema.parse(invalid)).toThrow();
  });

  it('should allow any case for label', () => {
    const valid = {
      name: 'user_profile',
      label: 'USER PROFILE',
    };
    expect(() => NamedEntitySchema.parse(valid)).not.toThrow();
  });

  it('should make description optional', () => {
    const valid = {
      name: 'user_profile',
      label: 'User Profile',
    };
    const result = NamedEntitySchema.parse(valid);
    expect(result.description).toBeUndefined();
  });
});

describe('VersionableSchema', () => {
  it('should validate semantic versioning', () => {
    const valid = {
      version: '1.2.3',
    };
    expect(() => VersionableSchema.parse(valid)).not.toThrow();
  });

  it('should accept pre-release versions', () => {
    const valid = {
      version: '2.0.0-beta.1',
    };
    expect(() => VersionableSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid version formats', () => {
    const invalid = {
      version: 'v1.2.3',
    };
    expect(() => VersionableSchema.parse(invalid)).toThrow();
  });

  it('should accept version history', () => {
    const valid = {
      version: '2.0.0',
      versionHistory: [
        {
          version: '1.0.0',
          timestamp: '2024-01-01T00:00:00Z',
          author: 'user_123',
          changelog: 'Initial release',
        },
        {
          version: '2.0.0',
          timestamp: '2024-02-01T00:00:00Z',
          author: 'user_456',
        },
      ],
    };
    expect(() => VersionableSchema.parse(valid)).not.toThrow();
  });
});

describe('TaggableSchema', () => {
  it('should validate empty tags array', () => {
    const valid = {
      tags: [],
    };
    expect(() => TaggableSchema.parse(valid)).not.toThrow();
  });

  it('should validate tags array', () => {
    const valid = {
      tags: ['frontend', 'react', 'typescript'],
    };
    expect(() => TaggableSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty tag strings', () => {
    const invalid = {
      tags: ['frontend', '', 'typescript'],
    };
    expect(() => TaggableSchema.parse(invalid)).toThrow();
  });

  it('should make tags optional', () => {
    const result = TaggableSchema.parse({});
    expect(result.tags).toBeUndefined();
  });
});

describe('OwnableSchema', () => {
  it('should validate user ownership', () => {
    const valid = {
      ownerId: 'user_123',
      ownerType: 'user' as const,
    };
    expect(() => OwnableSchema.parse(valid)).not.toThrow();
  });

  it('should default ownerType to user', () => {
    const result = OwnableSchema.parse({
      ownerId: 'user_123',
    });
    expect(result.ownerType).toBe('user');
  });

  it('should validate team ownership', () => {
    const valid = {
      ownerId: 'team_456',
      ownerType: 'team' as const,
      groupId: 'group_789',
    };
    expect(() => OwnableSchema.parse(valid)).not.toThrow();
  });

  it('should validate organization ownership', () => {
    const valid = {
      ownerId: 'org_001',
      ownerType: 'organization' as const,
    };
    expect(() => OwnableSchema.parse(valid)).not.toThrow();
  });
});

describe('ActivatableSchema', () => {
  it('should default active to true', () => {
    const result = ActivatableSchema.parse({});
    expect(result.active).toBe(true);
  });

  it('should validate inactive state', () => {
    const valid = {
      active: false,
      deactivatedAt: '2024-01-15T10:30:00Z',
    };
    expect(() => ActivatableSchema.parse(valid)).not.toThrow();
  });

  it('should validate activation timestamps', () => {
    const valid = {
      active: true,
      activatedAt: '2024-01-15T10:30:00Z',
    };
    expect(() => ActivatableSchema.parse(valid)).not.toThrow();
  });
});

describe('MetadataContainerSchema', () => {
  it('should accept any metadata shape', () => {
    const valid = {
      metadata: {
        customField1: 'value',
        customField2: 123,
        customField3: true,
        nested: { deep: 'value' },
      },
    };
    expect(() => MetadataContainerSchema.parse(valid)).not.toThrow();
  });

  it('should make metadata optional', () => {
    const result = MetadataContainerSchema.parse({});
    expect(result.metadata).toBeUndefined();
  });

  it('should preserve metadata values', () => {
    const input = {
      metadata: {
        key1: 'value1',
        key2: 42,
      },
    };
    const result = MetadataContainerSchema.parse(input);
    expect(result.metadata).toEqual(input.metadata);
  });
});

describe('Schema Composition', () => {
  it('should compose multiple base schemas', () => {
    const ComposedSchema = NamedEntitySchema.merge(AuditableSchema).merge(TaggableSchema);
    
    const valid = {
      name: 'test_entity',
      label: 'Test Entity',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      createdBy: 'user_123',
      updatedBy: 'user_123',
      tags: ['test', 'example'],
    };
    
    expect(() => ComposedSchema.parse(valid)).not.toThrow();
  });

  it('should extend base schemas with additional fields', () => {
    const ExtendedSchema = NamedEntitySchema.extend({
      id: NamedEntitySchema.shape.name,
      type: NamedEntitySchema.shape.name,
    });
    
    const valid = {
      id: 'entity_001',
      name: 'test_entity',
      label: 'Test Entity',
      type: 'custom_type',
    };
    
    expect(() => ExtendedSchema.parse(valid)).not.toThrow();
  });
});
