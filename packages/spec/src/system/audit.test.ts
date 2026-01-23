import { describe, it, expect } from 'vitest';
import {
  AuditEventType,
  AuditEventSeverity,
  AuditEventActorSchema,
  AuditEventTargetSchema,
  AuditEventChangeSchema,
  AuditEventSchema,
  AuditRetentionPolicySchema,
  SuspiciousActivityRuleSchema,
  AuditStorageConfigSchema,
  AuditEventFilterSchema,
  AuditConfigSchema,
  DEFAULT_SUSPICIOUS_ACTIVITY_RULES,
  type AuditEvent,
  type AuditConfig,
  type SuspiciousActivityRule,
} from './audit.zod';

describe('AuditEventType', () => {
  it('should accept valid event types', () => {
    const validTypes = [
      'data.create',
      'data.read',
      'data.update',
      'data.delete',
      'auth.login',
      'auth.login_failed',
      'auth.logout',
      'authz.permission_granted',
      'authz.role_assigned',
      'security.access_denied',
    ];

    validTypes.forEach((type) => {
      expect(() => AuditEventType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid event types', () => {
    expect(() => AuditEventType.parse('invalid.type')).toThrow();
    expect(() => AuditEventType.parse('dataCreate')).toThrow();
  });
});

describe('AuditEventSeverity', () => {
  it('should accept valid severity levels', () => {
    const validLevels = ['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'];

    validLevels.forEach((level) => {
      expect(() => AuditEventSeverity.parse(level)).not.toThrow();
    });
  });

  it('should reject invalid severity levels', () => {
    expect(() => AuditEventSeverity.parse('invalid')).toThrow();
    expect(() => AuditEventSeverity.parse('high')).toThrow();
  });
});

describe('AuditEventActorSchema', () => {
  it('should accept valid actor configuration', () => {
    const validActor = {
      type: 'user',
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    expect(() => AuditEventActorSchema.parse(validActor)).not.toThrow();
  });

  it('should accept minimal actor configuration', () => {
    const minimalActor = {
      type: 'system',
      id: 'system',
    };

    expect(() => AuditEventActorSchema.parse(minimalActor)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const invalidActor = {
      type: 'user',
      id: 'user_123',
      email: 'not-an-email',
    };

    expect(() => AuditEventActorSchema.parse(invalidActor)).toThrow();
  });
});

describe('AuditEventTargetSchema', () => {
  it('should accept valid target configuration', () => {
    const validTarget = {
      type: 'record',
      id: 'rec_456',
      name: 'Customer Record #456',
      metadata: {
        objectName: 'customer',
        fields: ['name', 'email'],
      },
    };

    expect(() => AuditEventTargetSchema.parse(validTarget)).not.toThrow();
  });

  it('should accept minimal target configuration', () => {
    const minimalTarget = {
      type: 'object',
      id: 'obj_789',
    };

    expect(() => AuditEventTargetSchema.parse(minimalTarget)).not.toThrow();
  });
});

describe('AuditEventChangeSchema', () => {
  it('should accept valid change record', () => {
    const validChange = {
      field: 'email',
      oldValue: 'old@example.com',
      newValue: 'new@example.com',
    };

    expect(() => AuditEventChangeSchema.parse(validChange)).not.toThrow();
  });

  it('should accept change with only new value', () => {
    const createChange = {
      field: 'name',
      newValue: 'John Doe',
    };

    expect(() => AuditEventChangeSchema.parse(createChange)).not.toThrow();
  });
});

describe('AuditEventSchema', () => {
  it('should accept complete audit event', () => {
    const validEvent: AuditEvent = {
      id: 'evt_123',
      eventType: 'data.update',
      severity: 'info',
      timestamp: new Date().toISOString(),
      actor: {
        type: 'user',
        id: 'user_123',
        email: 'user@example.com',
      },
      target: {
        type: 'record',
        id: 'rec_456',
      },
      description: 'User updated customer record',
      changes: [
        {
          field: 'email',
          oldValue: 'old@example.com',
          newValue: 'new@example.com',
        },
      ],
      result: 'success',
      tenantId: 'tenant_789',
      requestId: 'req_abc',
    };

    expect(() => AuditEventSchema.parse(validEvent)).not.toThrow();
  });

  it('should accept minimal audit event', () => {
    const minimalEvent = {
      id: 'evt_456',
      eventType: 'auth.login',
      timestamp: new Date().toISOString(),
      actor: {
        type: 'user',
        id: 'user_123',
      },
      description: 'User logged in',
    };

    expect(() => AuditEventSchema.parse(minimalEvent)).not.toThrow();
  });

  it('should default severity to info', () => {
    const event = {
      id: 'evt_789',
      eventType: 'data.read',
      timestamp: new Date().toISOString(),
      actor: {
        type: 'user',
        id: 'user_123',
      },
      description: 'User viewed record',
    };

    const parsed = AuditEventSchema.parse(event);
    expect(parsed.severity).toBe('info');
  });

  it('should default result to success', () => {
    const event = {
      id: 'evt_101',
      eventType: 'data.create',
      timestamp: new Date().toISOString(),
      actor: {
        type: 'user',
        id: 'user_123',
      },
      description: 'User created record',
    };

    const parsed = AuditEventSchema.parse(event);
    expect(parsed.result).toBe('success');
  });

  it('should accept failed event with error message', () => {
    const failedEvent = {
      id: 'evt_202',
      eventType: 'auth.login',
      severity: 'warning',
      timestamp: new Date().toISOString(),
      actor: {
        type: 'user',
        id: 'user_123',
      },
      description: 'Login attempt failed',
      result: 'failure',
      errorMessage: 'Invalid password',
    };

    expect(() => AuditEventSchema.parse(failedEvent)).not.toThrow();
  });
});

describe('AuditRetentionPolicySchema', () => {
  it('should accept valid retention policy', () => {
    const validPolicy = {
      retentionDays: 365,
      archiveAfterRetention: true,
      archiveStorage: {
        type: 's3',
        bucket: 'audit-logs-archive',
        path: 'logs/',
      },
      customRetention: {
        'auth.login_failed': 730, // 2 years
        'security.data_breach': 2555, // 7 years
      },
      minimumRetentionDays: 180,
    };

    expect(() => AuditRetentionPolicySchema.parse(validPolicy)).not.toThrow();
  });

  it('should default to 180 days retention', () => {
    const policy = {};
    const parsed = AuditRetentionPolicySchema.parse(policy);
    expect(parsed.retentionDays).toBe(180);
  });

  it('should default to archiving enabled', () => {
    const policy = {};
    const parsed = AuditRetentionPolicySchema.parse(policy);
    expect(parsed.archiveAfterRetention).toBe(true);
  });

  it('should reject negative retention days', () => {
    const invalidPolicy = {
      retentionDays: -30,
    };

    expect(() => AuditRetentionPolicySchema.parse(invalidPolicy)).toThrow();
  });
});

describe('SuspiciousActivityRuleSchema', () => {
  it('should accept valid suspicious activity rule', () => {
    const validRule: SuspiciousActivityRule = {
      id: 'rule_123',
      name: 'Multiple Failed Logins',
      description: 'Detects brute force attacks',
      enabled: true,
      eventTypes: ['auth.login_failed'],
      condition: {
        threshold: 5,
        windowSeconds: 600,
        groupBy: ['actor.id'],
      },
      actions: ['alert', 'lock_account'],
      alertSeverity: 'critical',
      notifications: {
        email: ['security@example.com'],
        slack: 'https://hooks.slack.com/services/xxx',
      },
    };

    expect(() => SuspiciousActivityRuleSchema.parse(validRule)).not.toThrow();
  });

  it('should default enabled to true', () => {
    const rule = {
      id: 'rule_456',
      name: 'Test Rule',
      eventTypes: ['data.export'],
      condition: {
        threshold: 10,
        windowSeconds: 3600,
      },
      actions: ['alert'],
    };

    const parsed = SuspiciousActivityRuleSchema.parse(rule);
    expect(parsed.enabled).toBe(true);
  });

  it('should default alert severity to warning', () => {
    const rule = {
      id: 'rule_789',
      name: 'Test Rule',
      eventTypes: ['data.delete'],
      condition: {
        threshold: 3,
        windowSeconds: 300,
      },
      actions: ['alert'],
    };

    const parsed = SuspiciousActivityRuleSchema.parse(rule);
    expect(parsed.alertSeverity).toBe('warning');
  });
});

describe('AuditStorageConfigSchema', () => {
  it('should accept database storage configuration', () => {
    const dbStorage = {
      type: 'database',
      connectionString: 'postgresql://localhost:5432/audit',
      bufferEnabled: true,
      bufferSize: 100,
      flushIntervalSeconds: 5,
      compression: true,
    };

    expect(() => AuditStorageConfigSchema.parse(dbStorage)).not.toThrow();
  });

  it('should accept elasticsearch storage configuration', () => {
    const esStorage = {
      type: 'elasticsearch',
      connectionString: 'https://elasticsearch:9200',
      config: {
        index: 'audit-logs',
        shards: 5,
      },
    };

    expect(() => AuditStorageConfigSchema.parse(esStorage)).not.toThrow();
  });

  it('should default buffer settings', () => {
    const storage = {
      type: 'mongodb',
    };

    const parsed = AuditStorageConfigSchema.parse(storage);
    expect(parsed.bufferEnabled).toBe(true);
    expect(parsed.bufferSize).toBe(100);
    expect(parsed.flushIntervalSeconds).toBe(5);
    expect(parsed.compression).toBe(true);
  });
});

describe('AuditEventFilterSchema', () => {
  it('should accept complete filter configuration', () => {
    const validFilter = {
      eventTypes: ['data.create', 'data.update'],
      severities: ['warning', 'error', 'critical'],
      actorId: 'user_123',
      tenantId: 'tenant_456',
      timeRange: {
        from: '2024-01-01T00:00:00Z',
        to: '2024-12-31T23:59:59Z',
      },
      result: 'failure',
      searchQuery: 'password reset',
    };

    expect(() => AuditEventFilterSchema.parse(validFilter)).not.toThrow();
  });

  it('should accept minimal filter configuration', () => {
    const minimalFilter = {};
    expect(() => AuditEventFilterSchema.parse(minimalFilter)).not.toThrow();
  });

  it('should accept partial filters', () => {
    const partialFilter = {
      eventTypes: ['auth.login'],
      timeRange: {
        from: '2024-01-01T00:00:00Z',
        to: '2024-01-31T23:59:59Z',
      },
    };

    expect(() => AuditEventFilterSchema.parse(partialFilter)).not.toThrow();
  });
});

describe('AuditConfigSchema', () => {
  it('should accept complete audit configuration', () => {
    const validConfig: AuditConfig = {
      name: 'main_audit',
      label: 'Main Audit Configuration',
      enabled: true,
      eventTypes: ['data.create', 'data.update', 'auth.login'],
      minimumSeverity: 'info',
      storage: {
        type: 'database',
        connectionString: 'postgresql://localhost/audit',
      },
      retentionPolicy: {
        retentionDays: 365,
      },
      suspiciousActivityRules: [
        {
          id: 'failed_logins',
          name: 'Failed Logins',
          eventTypes: ['auth.login_failed'],
          condition: {
            threshold: 5,
            windowSeconds: 600,
          },
          actions: ['alert'],
        },
      ],
      includeSensitiveData: false,
      logReads: false,
      compliance: {
        standards: ['gdpr', 'sox'],
        immutableLogs: true,
      },
    };

    expect(() => AuditConfigSchema.parse(validConfig)).not.toThrow();
  });

  it('should accept minimal audit configuration', () => {
    const minimalConfig = {
      name: 'basic_audit',
      label: 'Basic Audit',
      storage: {
        type: 'database',
      },
    };

    expect(() => AuditConfigSchema.parse(minimalConfig)).not.toThrow();
  });

  it('should enforce snake_case naming convention', () => {
    const invalidConfig = {
      name: 'mainAudit', // camelCase, should be snake_case
      label: 'Main Audit',
      storage: {
        type: 'database',
      },
    };

    expect(() => AuditConfigSchema.parse(invalidConfig)).toThrow();
  });

  it('should accept valid snake_case names', () => {
    const validNames = ['audit_config', 'main_audit', 'security_audit_log'];

    validNames.forEach((name) => {
      const config = {
        name,
        label: 'Test Audit',
        storage: { type: 'database' },
      };
      expect(() => AuditConfigSchema.parse(config)).not.toThrow();
    });
  });

  it('should default enabled to true', () => {
    const config = {
      name: 'test_audit',
      label: 'Test Audit',
      storage: { type: 'database' },
    };

    const parsed = AuditConfigSchema.parse(config);
    expect(parsed.enabled).toBe(true);
  });

  it('should default minimumSeverity to info', () => {
    const config = {
      name: 'test_audit',
      label: 'Test Audit',
      storage: { type: 'database' },
    };

    const parsed = AuditConfigSchema.parse(config);
    expect(parsed.minimumSeverity).toBe('info');
  });

  it('should default redactFields to common sensitive fields', () => {
    const config = {
      name: 'test_audit',
      label: 'Test Audit',
      storage: { type: 'database' },
    };

    const parsed = AuditConfigSchema.parse(config);
    expect(parsed.redactFields).toContain('password');
    expect(parsed.redactFields).toContain('token');
    expect(parsed.redactFields).toContain('apiKey');
  });

  it('should default logReads to false', () => {
    const config = {
      name: 'test_audit',
      label: 'Test Audit',
      storage: { type: 'database' },
    };

    const parsed = AuditConfigSchema.parse(config);
    expect(parsed.logReads).toBe(false);
  });

  it('should default readSamplingRate to 0.1', () => {
    const config = {
      name: 'test_audit',
      label: 'Test Audit',
      storage: { type: 'database' },
    };

    const parsed = AuditConfigSchema.parse(config);
    expect(parsed.readSamplingRate).toBe(0.1);
  });

  it('should accept compliance configuration', () => {
    const config = {
      name: 'compliance_audit',
      label: 'Compliance Audit',
      storage: { type: 'database' },
      compliance: {
        standards: ['sox', 'hipaa', 'gdpr'],
        immutableLogs: true,
        requireSigning: true,
        signingKey: 'secret-key-123',
      },
    };

    expect(() => AuditConfigSchema.parse(config)).not.toThrow();
  });
});

describe('DEFAULT_SUSPICIOUS_ACTIVITY_RULES', () => {
  it('should have valid default rules', () => {
    expect(DEFAULT_SUSPICIOUS_ACTIVITY_RULES.length).toBeGreaterThan(0);

    DEFAULT_SUSPICIOUS_ACTIVITY_RULES.forEach((rule) => {
      expect(() => SuspiciousActivityRuleSchema.parse(rule)).not.toThrow();
    });
  });

  it('should include multiple failed logins rule', () => {
    const rule = DEFAULT_SUSPICIOUS_ACTIVITY_RULES.find(
      (r) => r.id === 'multiple_failed_logins'
    );

    expect(rule).toBeDefined();
    expect(rule?.eventTypes).toContain('auth.login_failed');
    expect(rule?.condition.threshold).toBe(5);
  });

  it('should include bulk data export rule', () => {
    const rule = DEFAULT_SUSPICIOUS_ACTIVITY_RULES.find(
      (r) => r.id === 'bulk_data_export'
    );

    expect(rule).toBeDefined();
    expect(rule?.eventTypes).toContain('data.export');
  });

  it('should include permission changes rule', () => {
    const rule = DEFAULT_SUSPICIOUS_ACTIVITY_RULES.find(
      (r) => r.id === 'suspicious_permission_changes'
    );

    expect(rule).toBeDefined();
    expect(rule?.actions).toContain('alert');
  });
});
