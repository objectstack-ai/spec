import { describe, it, expect } from 'vitest';
import {
  TenantSchema,
  TenantIsolationLevel,
  TenantQuotaSchema,
  type Tenant,
  type TenantQuota,
} from './tenant.zod';

describe('TenantIsolationLevel', () => {
  it('should accept valid isolation levels', () => {
    const levels = ['shared_schema', 'isolated_schema', 'isolated_db'];

    levels.forEach((level) => {
      expect(() => TenantIsolationLevel.parse(level)).not.toThrow();
    });
  });

  it('should reject invalid isolation levels', () => {
    expect(() => TenantIsolationLevel.parse('invalid')).toThrow();
    expect(() => TenantIsolationLevel.parse('sharedSchema')).toThrow();
  });
});

describe('TenantQuotaSchema', () => {
  it('should accept valid quota configuration', () => {
    const validQuota: TenantQuota = {
      maxUsers: 100,
      maxStorage: 10737418240, // 10GB in bytes
      apiRateLimit: 1000,
    };

    expect(() => TenantQuotaSchema.parse(validQuota)).not.toThrow();
  });

  it('should accept partial quota configuration', () => {
    const partialQuota = {
      maxUsers: 50,
    };

    expect(() => TenantQuotaSchema.parse(partialQuota)).not.toThrow();
  });

  it('should accept empty quota configuration', () => {
    const emptyQuota = {};

    expect(() => TenantQuotaSchema.parse(emptyQuota)).not.toThrow();
  });

  it('should reject negative values', () => {
    const invalidQuota = {
      maxUsers: -10,
    };

    expect(() => TenantQuotaSchema.parse(invalidQuota)).toThrow();
  });

  it('should reject non-integer values', () => {
    const invalidQuota = {
      maxUsers: 10.5,
    };

    expect(() => TenantQuotaSchema.parse(invalidQuota)).toThrow();
  });
});

describe('TenantSchema', () => {
  it('should accept valid tenant configuration', () => {
    const validTenant: Tenant = {
      id: 'tenant_123',
      name: 'Acme Corporation',
      isolationLevel: 'isolated_schema',
      customizations: {
        theme: 'dark',
        logo: 'https://example.com/logo.png',
      },
      quotas: {
        maxUsers: 100,
        maxStorage: 10737418240,
        apiRateLimit: 1000,
      },
    };

    expect(() => TenantSchema.parse(validTenant)).not.toThrow();
  });

  it('should accept minimal tenant configuration', () => {
    const minimalTenant = {
      id: 'tenant_456',
      name: 'Basic Tenant',
      isolationLevel: 'shared_schema',
    };

    expect(() => TenantSchema.parse(minimalTenant)).not.toThrow();
  });

  it('should accept tenant with customizations but no quotas', () => {
    const tenant = {
      id: 'tenant_789',
      name: 'Custom Tenant',
      isolationLevel: 'isolated_db',
      customizations: {
        feature_flags: {
          advanced_analytics: true,
          api_access: true,
        },
      },
    };

    expect(() => TenantSchema.parse(tenant)).not.toThrow();
  });

  it('should accept tenant with quotas but no customizations', () => {
    const tenant = {
      id: 'tenant_101',
      name: 'Quota Tenant',
      isolationLevel: 'shared_schema',
      quotas: {
        maxUsers: 50,
        apiRateLimit: 500,
      },
    };

    expect(() => TenantSchema.parse(tenant)).not.toThrow();
  });

  it('should require id field', () => {
    const invalidTenant = {
      name: 'Missing ID Tenant',
      isolationLevel: 'shared_schema',
    };

    expect(() => TenantSchema.parse(invalidTenant)).toThrow();
  });

  it('should require name field', () => {
    const invalidTenant = {
      id: 'tenant_202',
      isolationLevel: 'shared_schema',
    };

    expect(() => TenantSchema.parse(invalidTenant)).toThrow();
  });

  it('should require isolationLevel field', () => {
    const invalidTenant = {
      id: 'tenant_303',
      name: 'Missing Isolation Tenant',
    };

    expect(() => TenantSchema.parse(invalidTenant)).toThrow();
  });

  it('should reject invalid isolationLevel', () => {
    const invalidTenant = {
      id: 'tenant_404',
      name: 'Invalid Isolation Tenant',
      isolationLevel: 'wrong_level',
    };

    expect(() => TenantSchema.parse(invalidTenant)).toThrow();
  });

  it('should allow arbitrary customization values', () => {
    const tenant = {
      id: 'tenant_505',
      name: 'Flexible Customizations',
      isolationLevel: 'shared_schema',
      customizations: {
        string_value: 'text',
        number_value: 42,
        boolean_value: true,
        array_value: [1, 2, 3],
        nested_object: {
          deep: {
            property: 'value',
          },
        },
      },
    };

    expect(() => TenantSchema.parse(tenant)).not.toThrow();
  });
});
