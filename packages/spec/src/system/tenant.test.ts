import { describe, it, expect } from 'vitest';
import {
  TenantSchema,
  TenantIsolationLevel,
  TenantQuotaSchema,
  RowLevelIsolationStrategySchema,
  SchemaLevelIsolationStrategySchema,
  DatabaseLevelIsolationStrategySchema,
  TenantIsolationConfigSchema,
  TenantSecurityPolicySchema,
  type Tenant,
  type TenantQuota,
  type RowLevelIsolationStrategy,
  type SchemaLevelIsolationStrategy,
  type DatabaseLevelIsolationStrategy,
  type TenantIsolationConfig,
  type TenantSecurityPolicy,
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

describe('RowLevelIsolationStrategySchema', () => {
  it('should accept valid row-level isolation configuration', () => {
    const validConfig: RowLevelIsolationStrategy = {
      strategy: 'shared_schema',
      database: {
        enableRLS: true,
        contextMethod: 'session_variable',
        contextVariable: 'app.current_tenant',
        applicationValidation: true,
      },
      performance: {
        usePartialIndexes: true,
        usePartitioning: false,
        poolSizePerTenant: 5,
      },
    };

    expect(() => RowLevelIsolationStrategySchema.parse(validConfig)).not.toThrow();
  });

  it('should accept minimal row-level isolation configuration', () => {
    const minimalConfig = {
      strategy: 'shared_schema',
    };

    expect(() => RowLevelIsolationStrategySchema.parse(minimalConfig)).not.toThrow();
  });

  it('should default enableRLS to true', () => {
    const config = {
      strategy: 'shared_schema',
      database: {},
    };

    const parsed = RowLevelIsolationStrategySchema.parse(config);
    expect(parsed.database?.enableRLS).toBe(true);
  });

  it('should accept different context methods', () => {
    const methods = ['session_variable', 'search_path', 'application_name'];

    methods.forEach((method) => {
      const config = {
        strategy: 'shared_schema',
        database: {
          contextMethod: method,
        },
      };
      expect(() => RowLevelIsolationStrategySchema.parse(config)).not.toThrow();
    });
  });
});

describe('SchemaLevelIsolationStrategySchema', () => {
  it('should accept valid schema-level isolation configuration', () => {
    const validConfig: SchemaLevelIsolationStrategy = {
      strategy: 'isolated_schema',
      schema: {
        namingPattern: 'tenant_{tenant_id}',
        includePublicSchema: true,
        sharedSchema: 'public',
        autoCreateSchema: true,
      },
      migrations: {
        strategy: 'parallel',
        maxConcurrent: 10,
        rollbackOnError: true,
      },
      performance: {
        poolPerSchema: false,
        schemaCacheTTL: 3600,
      },
    };

    expect(() => SchemaLevelIsolationStrategySchema.parse(validConfig)).not.toThrow();
  });

  it('should accept minimal schema-level isolation configuration', () => {
    const minimalConfig = {
      strategy: 'isolated_schema',
    };

    expect(() => SchemaLevelIsolationStrategySchema.parse(minimalConfig)).not.toThrow();
  });

  it('should default schema naming pattern', () => {
    const config = {
      strategy: 'isolated_schema',
      schema: {},
    };

    const parsed = SchemaLevelIsolationStrategySchema.parse(config);
    expect(parsed.schema?.namingPattern).toBe('tenant_{tenant_id}');
  });

  it('should accept different migration strategies', () => {
    const strategies = ['parallel', 'sequential', 'on_demand'];

    strategies.forEach((strategy) => {
      const config = {
        strategy: 'isolated_schema',
        migrations: {
          strategy,
        },
      };
      expect(() => SchemaLevelIsolationStrategySchema.parse(config)).not.toThrow();
    });
  });
});

describe('DatabaseLevelIsolationStrategySchema', () => {
  it('should accept valid database-level isolation configuration', () => {
    const validConfig: DatabaseLevelIsolationStrategy = {
      strategy: 'isolated_db',
      database: {
        namingPattern: 'tenant_{tenant_id}',
        serverStrategy: 'shared',
        separateCredentials: true,
        autoCreateDatabase: true,
      },
      connectionPool: {
        poolSize: 10,
        maxActivePools: 100,
        idleTimeout: 300,
        usePooler: true,
      },
      backup: {
        strategy: 'individual',
        frequencyHours: 24,
        retentionDays: 30,
      },
      encryption: {
        perTenantKeys: true,
        algorithm: 'AES-256-GCM',
        keyManagement: 'aws_kms',
      },
    };

    expect(() => DatabaseLevelIsolationStrategySchema.parse(validConfig)).not.toThrow();
  });

  it('should accept minimal database-level isolation configuration', () => {
    const minimalConfig = {
      strategy: 'isolated_db',
    };

    expect(() => DatabaseLevelIsolationStrategySchema.parse(minimalConfig)).not.toThrow();
  });

  it('should default database naming pattern', () => {
    const config = {
      strategy: 'isolated_db',
      database: {},
    };

    const parsed = DatabaseLevelIsolationStrategySchema.parse(config);
    expect(parsed.database?.namingPattern).toBe('tenant_{tenant_id}');
  });

  it('should accept different server strategies', () => {
    const strategies = ['shared', 'sharded', 'dedicated'];

    strategies.forEach((serverStrategy) => {
      const config = {
        strategy: 'isolated_db',
        database: {
          serverStrategy,
        },
      };
      expect(() => DatabaseLevelIsolationStrategySchema.parse(config)).not.toThrow();
    });
  });

  it('should accept different backup strategies', () => {
    const strategies = ['individual', 'consolidated', 'on_demand'];

    strategies.forEach((strategy) => {
      const config = {
        strategy: 'isolated_db',
        backup: {
          strategy,
        },
      };
      expect(() => DatabaseLevelIsolationStrategySchema.parse(config)).not.toThrow();
    });
  });
});

describe('TenantIsolationConfigSchema', () => {
  it('should accept row-level isolation config', () => {
    const config: TenantIsolationConfig = {
      strategy: 'shared_schema',
      database: {
        enableRLS: true,
      },
    };

    expect(() => TenantIsolationConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept schema-level isolation config', () => {
    const config: TenantIsolationConfig = {
      strategy: 'isolated_schema',
      schema: {
        namingPattern: 'tenant_{tenant_id}',
      },
    };

    expect(() => TenantIsolationConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept database-level isolation config', () => {
    const config: TenantIsolationConfig = {
      strategy: 'isolated_db',
      database: {
        serverStrategy: 'dedicated',
      },
    };

    expect(() => TenantIsolationConfigSchema.parse(config)).not.toThrow();
  });

  it('should discriminate by strategy field', () => {
    const configs = [
      { strategy: 'shared_schema' },
      { strategy: 'isolated_schema' },
      { strategy: 'isolated_db' },
    ];

    configs.forEach((config) => {
      expect(() => TenantIsolationConfigSchema.parse(config)).not.toThrow();
    });
  });
});

describe('TenantSecurityPolicySchema', () => {
  it('should accept complete security policy', () => {
    const validPolicy: TenantSecurityPolicy = {
      encryption: {
        atRest: true,
        inTransit: true,
        fieldLevel: true,
      },
      accessControl: {
        requireMFA: true,
        requireSSO: true,
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        sessionTimeout: 3600,
      },
      compliance: {
        standards: ['sox', 'hipaa', 'gdpr'],
        requireAuditLog: true,
        auditRetentionDays: 365,
        dataResidency: {
          region: 'US',
          excludeRegions: ['CN', 'RU'],
        },
      },
    };

    expect(() => TenantSecurityPolicySchema.parse(validPolicy)).not.toThrow();
  });

  it('should accept minimal security policy', () => {
    const minimalPolicy = {};
    expect(() => TenantSecurityPolicySchema.parse(minimalPolicy)).not.toThrow();
  });

  it('should default encryption settings', () => {
    const policy = {
      encryption: {},
    };

    const parsed = TenantSecurityPolicySchema.parse(policy);
    expect(parsed.encryption?.atRest).toBe(true);
    expect(parsed.encryption?.inTransit).toBe(true);
    expect(parsed.encryption?.fieldLevel).toBe(false);
  });

  it('should default access control settings', () => {
    const policy = {
      accessControl: {},
    };

    const parsed = TenantSecurityPolicySchema.parse(policy);
    expect(parsed.accessControl?.requireMFA).toBe(false);
    expect(parsed.accessControl?.requireSSO).toBe(false);
    expect(parsed.accessControl?.sessionTimeout).toBe(3600);
  });

  it('should accept compliance standards', () => {
    const standards = ['sox', 'hipaa', 'gdpr', 'pci_dss', 'iso_27001', 'fedramp'];

    const policy = {
      compliance: {
        standards,
      },
    };

    expect(() => TenantSecurityPolicySchema.parse(policy)).not.toThrow();
  });

  it('should default compliance settings', () => {
    const policy = {
      compliance: {},
    };

    const parsed = TenantSecurityPolicySchema.parse(policy);
    expect(parsed.compliance?.requireAuditLog).toBe(true);
    expect(parsed.compliance?.auditRetentionDays).toBe(365);
  });
});
