import { describe, it, expect } from 'vitest';
import {
  PolicySchema,
  PasswordPolicySchema,
  NetworkPolicySchema,
  SessionPolicySchema,
  AuditPolicySchema,
  type Policy,
} from './policy.zod';

describe('PasswordPolicySchema', () => {
  it('should accept valid minimal password policy', () => {
    const policy = PasswordPolicySchema.parse({});

    expect(policy.minLength).toBe(8);
    expect(policy.requireUppercase).toBe(true);
    expect(policy.requireLowercase).toBe(true);
    expect(policy.requireNumbers).toBe(true);
    expect(policy.requireSymbols).toBe(false);
    expect(policy.historyCount).toBe(3);
  });

  it('should accept custom password policy', () => {
    const policy = PasswordPolicySchema.parse({
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      expirationDays: 90,
      historyCount: 5,
    });

    expect(policy.minLength).toBe(12);
    expect(policy.requireSymbols).toBe(true);
    expect(policy.expirationDays).toBe(90);
  });

  it('should accept password expiration policy', () => {
    const policy = PasswordPolicySchema.parse({
      expirationDays: 90,
    });

    expect(policy.expirationDays).toBe(90);
  });

  it('should accept password history policy', () => {
    const policy = PasswordPolicySchema.parse({
      historyCount: 10,
    });

    expect(policy.historyCount).toBe(10);
  });

  it('should accept relaxed password policy', () => {
    const policy = PasswordPolicySchema.parse({
      minLength: 6,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSymbols: false,
    });

    expect(policy.minLength).toBe(6);
    expect(policy.requireUppercase).toBe(false);
  });
});

describe('NetworkPolicySchema', () => {
  it('should accept valid network policy', () => {
    const policy = NetworkPolicySchema.parse({
      trustedRanges: ['10.0.0.0/8', '192.168.0.0/16'],
    });

    expect(policy.trustedRanges).toEqual(['10.0.0.0/8', '192.168.0.0/16']);
    expect(policy.blockUnknown).toBe(false);
    expect(policy.vpnRequired).toBe(false);
  });

  it('should accept network policy with blocking', () => {
    const policy = NetworkPolicySchema.parse({
      trustedRanges: ['10.0.0.0/8'],
      blockUnknown: true,
    });

    expect(policy.blockUnknown).toBe(true);
  });

  it('should accept VPN requirement', () => {
    const policy = NetworkPolicySchema.parse({
      trustedRanges: [],
      vpnRequired: true,
    });

    expect(policy.vpnRequired).toBe(true);
  });

  it('should accept CIDR ranges', () => {
    const policy = NetworkPolicySchema.parse({
      trustedRanges: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
    });

    expect(policy.trustedRanges).toHaveLength(3);
  });

  it('should accept specific IP addresses', () => {
    const policy = NetworkPolicySchema.parse({
      trustedRanges: ['203.0.113.1/32', '198.51.100.42/32'],
    });

    expect(policy.trustedRanges).toContain('203.0.113.1/32');
  });
});

describe('SessionPolicySchema', () => {
  it('should accept valid minimal session policy', () => {
    const policy = SessionPolicySchema.parse({});

    expect(policy.idleTimeout).toBe(30);
    expect(policy.absoluteTimeout).toBe(480);
    expect(policy.forceMfa).toBe(false);
  });

  it('should accept custom idle timeout', () => {
    const policy = SessionPolicySchema.parse({
      idleTimeout: 15,
    });

    expect(policy.idleTimeout).toBe(15);
  });

  it('should accept custom absolute timeout', () => {
    const policy = SessionPolicySchema.parse({
      absoluteTimeout: 720,
    });

    expect(policy.absoluteTimeout).toBe(720);
  });

  it('should accept MFA requirement', () => {
    const policy = SessionPolicySchema.parse({
      forceMfa: true,
    });

    expect(policy.forceMfa).toBe(true);
  });

  it('should accept strict session policy', () => {
    const policy = SessionPolicySchema.parse({
      idleTimeout: 10,
      absoluteTimeout: 60,
      forceMfa: true,
    });

    expect(policy.idleTimeout).toBe(10);
    expect(policy.absoluteTimeout).toBe(60);
    expect(policy.forceMfa).toBe(true);
  });
});

describe('AuditPolicySchema', () => {
  it('should accept valid minimal audit policy', () => {
    const policy = AuditPolicySchema.parse({
      sensitiveFields: [],
    });

    expect(policy.logRetentionDays).toBe(180);
    expect(policy.captureRead).toBe(false);
  });

  it('should accept custom retention period', () => {
    const policy = AuditPolicySchema.parse({
      logRetentionDays: 365,
      sensitiveFields: [],
    });

    expect(policy.logRetentionDays).toBe(365);
  });

  it('should accept sensitive field redaction', () => {
    const policy = AuditPolicySchema.parse({
      sensitiveFields: ['password', 'ssn', 'credit_card'],
    });

    expect(policy.sensitiveFields).toEqual(['password', 'ssn', 'credit_card']);
  });

  it('should accept read capture policy', () => {
    const policy = AuditPolicySchema.parse({
      sensitiveFields: [],
      captureRead: true,
    });

    expect(policy.captureRead).toBe(true);
  });

  it('should accept compliance audit policy', () => {
    const policy = AuditPolicySchema.parse({
      logRetentionDays: 2555, // 7 years for financial compliance
      sensitiveFields: ['ssn', 'tax_id', 'bank_account', 'credit_card'],
      captureRead: true,
    });

    expect(policy.logRetentionDays).toBe(2555);
    expect(policy.sensitiveFields).toHaveLength(4);
  });
});

describe('PolicySchema', () => {
  it('should accept valid minimal policy', () => {
    const policy: Policy = {
      name: 'default_policy',
    };

    expect(() => PolicySchema.parse(policy)).not.toThrow();
  });

  it('should validate policy name format (snake_case)', () => {
    expect(() => PolicySchema.parse({
      name: 'valid_policy_name',
    })).not.toThrow();

    expect(() => PolicySchema.parse({
      name: 'InvalidPolicy',
    })).toThrow();

    expect(() => PolicySchema.parse({
      name: 'invalid-policy',
    })).toThrow();
  });

  it('should accept policy with all sub-policies', () => {
    const policy = PolicySchema.parse({
      name: 'comprehensive_policy',
      password: {
        minLength: 12,
        requireSymbols: true,
        expirationDays: 90,
      },
      network: {
        trustedRanges: ['10.0.0.0/8'],
        blockUnknown: true,
      },
      session: {
        idleTimeout: 15,
        forceMfa: true,
      },
      audit: {
        logRetentionDays: 365,
        sensitiveFields: ['password', 'ssn'],
        captureRead: false,
      },
    });

    expect(policy.password?.minLength).toBe(12);
    expect(policy.network?.blockUnknown).toBe(true);
    expect(policy.session?.forceMfa).toBe(true);
    expect(policy.audit?.logRetentionDays).toBe(365);
  });

  it('should accept default policy flag', () => {
    const policy = PolicySchema.parse({
      name: 'default_policy',
      isDefault: true,
    });

    expect(policy.isDefault).toBe(true);
  });

  it('should accept profile assignments', () => {
    const policy = PolicySchema.parse({
      name: 'admin_policy',
      assignedProfiles: ['admin', 'super_admin'],
    });

    expect(policy.assignedProfiles).toEqual(['admin', 'super_admin']);
  });

  it('should handle enterprise security policy', () => {
    const policy = PolicySchema.parse({
      name: 'enterprise_security',
      password: {
        minLength: 14,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        expirationDays: 60,
        historyCount: 10,
      },
      network: {
        trustedRanges: ['10.0.0.0/8'],
        blockUnknown: true,
        vpnRequired: true,
      },
      session: {
        idleTimeout: 10,
        absoluteTimeout: 480,
        forceMfa: true,
      },
      audit: {
        logRetentionDays: 2555,
        sensitiveFields: ['password', 'ssn', 'tax_id', 'credit_card'],
        captureRead: true,
      },
      isDefault: false,
      assignedProfiles: ['admin', 'finance'],
    });

    expect(policy.password?.minLength).toBe(14);
    expect(policy.network?.vpnRequired).toBe(true);
    expect(policy.session?.forceMfa).toBe(true);
    expect(policy.audit?.captureRead).toBe(true);
  });

  it('should handle development policy', () => {
    const policy = PolicySchema.parse({
      name: 'dev_policy',
      password: {
        minLength: 6,
        requireUppercase: false,
        requireSymbols: false,
      },
      session: {
        idleTimeout: 120,
        forceMfa: false,
      },
      isDefault: true,
    });

    expect(policy.password?.minLength).toBe(6);
    expect(policy.session?.forceMfa).toBe(false);
    expect(policy.isDefault).toBe(true);
  });

  it('should reject policy without required fields', () => {
    expect(() => PolicySchema.parse({})).toThrow();
  });

  it('should apply default values for isDefault', () => {
    const policy = PolicySchema.parse({
      name: 'test_policy',
    });

    expect(policy.isDefault).toBe(false);
  });
});
