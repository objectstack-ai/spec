import { describe, it, expect } from 'vitest';
import {
  LicenseMetricType,
  FeatureSchema,
  PlanSchema,
  LicenseSchema,
} from './license.zod';

describe('LicenseMetricType', () => {
  it('should accept valid metric types', () => {
    const types = ['boolean', 'counter', 'gauge'];

    types.forEach((type) => {
      expect(() => LicenseMetricType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid metric types', () => {
    expect(() => LicenseMetricType.parse('invalid')).toThrow();
    expect(() => LicenseMetricType.parse('histogram')).toThrow();
  });
});

describe('FeatureSchema', () => {
  it('should accept valid feature with defaults', () => {
    const feature = FeatureSchema.parse({
      code: 'core.api_access',
      label: 'API Access',
    });

    expect(feature.code).toBe('core.api_access');
    expect(feature.label).toBe('API Access');
    expect(feature.type).toBe('boolean');
  });

  it('should accept full feature configuration', () => {
    const feature = FeatureSchema.parse({
      code: 'storage.usage',
      label: 'Storage Usage',
      description: 'Track storage usage',
      type: 'gauge',
      unit: 'bytes',
      requires: ['enterprise_tier'],
    });

    expect(feature.type).toBe('gauge');
    expect(feature.unit).toBe('bytes');
    expect(feature.requires).toEqual(['enterprise_tier']);
  });

  it('should accept all unit types', () => {
    const units = ['count', 'bytes', 'seconds', 'percent'];

    units.forEach((unit) => {
      expect(() => FeatureSchema.parse({ code: 'test', label: 'Test', unit })).not.toThrow();
    });
  });

  it('should reject invalid feature code format', () => {
    expect(() => FeatureSchema.parse({ code: 'InvalidCode', label: 'Test' })).toThrow();
    expect(() => FeatureSchema.parse({ code: 'my-feature', label: 'Test' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => FeatureSchema.parse({})).toThrow();
    expect(() => FeatureSchema.parse({ code: 'test' })).toThrow();
  });
});

describe('PlanSchema', () => {
  it('should accept valid plan with defaults', () => {
    const plan = PlanSchema.parse({
      code: 'pro_v1',
      label: 'Pro Plan',
      features: ['api_access', 'advanced_reporting'],
      limits: { storage_gb: 10, users: 50 },
    });

    expect(plan.code).toBe('pro_v1');
    expect(plan.label).toBe('Pro Plan');
    expect(plan.active).toBe(true);
    expect(plan.features).toEqual(['api_access', 'advanced_reporting']);
    expect(plan.limits).toEqual({ storage_gb: 10, users: 50 });
  });

  it('should accept full plan configuration', () => {
    const plan = PlanSchema.parse({
      code: 'enterprise_v2',
      label: 'Enterprise',
      active: false,
      features: ['sso', 'audit_log'],
      limits: { api_calls: 1000000 },
      currency: 'EUR',
      priceMonthly: 99.99,
      priceYearly: 999.99,
    });

    expect(plan.active).toBe(false);
    expect(plan.currency).toBe('EUR');
    expect(plan.priceMonthly).toBe(99.99);
    expect(plan.priceYearly).toBe(999.99);
  });

  it('should reject missing required fields', () => {
    expect(() => PlanSchema.parse({})).toThrow();
    expect(() => PlanSchema.parse({ code: 'test', label: 'Test' })).toThrow();
    expect(() => PlanSchema.parse({ code: 'test', label: 'Test', features: [] })).toThrow();
  });
});

describe('LicenseSchema', () => {
  it('should accept valid license', () => {
    const license = LicenseSchema.parse({
      spaceId: 'space_123',
      planCode: 'pro_v1',
      issuedAt: '2025-01-01T00:00:00Z',
      status: 'active',
    });

    expect(license.spaceId).toBe('space_123');
    expect(license.planCode).toBe('pro_v1');
    expect(license.status).toBe('active');
  });

  it('should accept all status values', () => {
    const statuses = ['active', 'expired', 'suspended', 'trial'];

    statuses.forEach((status) => {
      expect(() => LicenseSchema.parse({
        spaceId: 'space_1',
        planCode: 'free',
        issuedAt: '2025-01-01T00:00:00Z',
        status,
      })).not.toThrow();
    });
  });

  it('should accept full license with overrides', () => {
    const license = LicenseSchema.parse({
      spaceId: 'space_456',
      planCode: 'enterprise_v1',
      issuedAt: '2025-01-01T00:00:00Z',
      expiresAt: '2026-01-01T00:00:00Z',
      status: 'active',
      customFeatures: ['custom_sso'],
      customLimits: { storage_gb: 500 },
      plugins: ['plugin_a', 'plugin_b'],
      signature: 'abc123signature',
    });

    expect(license.expiresAt).toBe('2026-01-01T00:00:00Z');
    expect(license.customFeatures).toEqual(['custom_sso']);
    expect(license.customLimits).toEqual({ storage_gb: 500 });
    expect(license.plugins).toEqual(['plugin_a', 'plugin_b']);
    expect(license.signature).toBe('abc123signature');
  });

  it('should reject invalid status', () => {
    expect(() => LicenseSchema.parse({
      spaceId: 'space_1',
      planCode: 'free',
      issuedAt: '2025-01-01T00:00:00Z',
      status: 'invalid',
    })).toThrow();
  });

  it('should reject invalid datetime format', () => {
    expect(() => LicenseSchema.parse({
      spaceId: 'space_1',
      planCode: 'free',
      issuedAt: 'not-a-date',
      status: 'active',
    })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => LicenseSchema.parse({})).toThrow();
    expect(() => LicenseSchema.parse({ spaceId: 'space_1' })).toThrow();
  });
});
