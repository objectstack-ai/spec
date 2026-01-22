import { describe, it, expect } from 'vitest';
import {
  LicenseSchema,
  PlanSchema,
  FeatureSchema,
  MetricType,
  type License,
  type Plan,
  type Feature,
} from './license.zod';

describe('MetricType', () => {
  it('should accept valid metric types', () => {
    const validTypes = ['boolean', 'counter', 'gauge'];

    validTypes.forEach(type => {
      expect(() => MetricType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid metric types', () => {
    expect(() => MetricType.parse('string')).toThrow();
    expect(() => MetricType.parse('number')).toThrow();
    expect(() => MetricType.parse('')).toThrow();
  });
});

describe('FeatureSchema', () => {
  it('should accept valid minimal feature', () => {
    const feature: Feature = {
      code: 'core.api_access',
      label: 'API Access',
    };

    expect(() => FeatureSchema.parse(feature)).not.toThrow();
  });

  it('should validate feature code format', () => {
    expect(() => FeatureSchema.parse({
      code: 'valid.feature_code',
      label: 'Valid Feature',
    })).not.toThrow();

    expect(() => FeatureSchema.parse({
      code: 'nested.feature.code',
      label: 'Nested Feature',
    })).not.toThrow();

    expect(() => FeatureSchema.parse({
      code: 'Invalid-Feature',
      label: 'Invalid',
    })).toThrow();
  });

  it('should apply default type', () => {
    const feature = FeatureSchema.parse({
      code: 'feature.test',
      label: 'Test Feature',
    });

    expect(feature.type).toBe('boolean');
  });

  it('should accept feature with all fields', () => {
    const feature = FeatureSchema.parse({
      code: 'storage.bytes_used',
      label: 'Storage Used',
      description: 'Total storage consumed in bytes',
      type: 'gauge',
      unit: 'bytes',
      requires: ['enterprise_tier'],
    });

    expect(feature.type).toBe('gauge');
    expect(feature.unit).toBe('bytes');
    expect(feature.requires).toEqual(['enterprise_tier']);
  });

  it('should accept different metric types', () => {
    const types: Array<Feature['type']> = ['boolean', 'counter', 'gauge'];

    types.forEach(type => {
      const feature = FeatureSchema.parse({
        code: 'test.feature',
        label: 'Test',
        type,
      });
      expect(feature.type).toBe(type);
    });
  });

  it('should accept different units', () => {
    const units: Array<NonNullable<Feature['unit']>> = ['count', 'bytes', 'seconds', 'percent'];

    units.forEach(unit => {
      const feature = FeatureSchema.parse({
        code: 'test.feature',
        label: 'Test',
        unit,
      });
      expect(feature.unit).toBe(unit);
    });
  });

  it('should accept feature dependencies', () => {
    const feature = FeatureSchema.parse({
      code: 'advanced.audit_log',
      label: 'Audit Log',
      requires: ['enterprise_tier', 'security_module'],
    });

    expect(feature.requires).toEqual(['enterprise_tier', 'security_module']);
  });

  it('should handle boolean feature flag', () => {
    const feature = FeatureSchema.parse({
      code: 'features.api_enabled',
      label: 'API Enabled',
      type: 'boolean',
    });

    expect(feature.type).toBe('boolean');
  });

  it('should handle counter metric', () => {
    const feature = FeatureSchema.parse({
      code: 'metrics.api_calls',
      label: 'API Calls',
      type: 'counter',
      unit: 'count',
    });

    expect(feature.type).toBe('counter');
    expect(feature.unit).toBe('count');
  });

  it('should handle gauge metric', () => {
    const feature = FeatureSchema.parse({
      code: 'metrics.active_users',
      label: 'Active Users',
      type: 'gauge',
      unit: 'count',
    });

    expect(feature.type).toBe('gauge');
  });
});

describe('PlanSchema', () => {
  it('should accept valid minimal plan', () => {
    const plan: Plan = {
      code: 'free',
      label: 'Free Plan',
      features: [],
      limits: {},
    };

    expect(() => PlanSchema.parse(plan)).not.toThrow();
  });

  it('should apply default values', () => {
    const plan = PlanSchema.parse({
      code: 'basic',
      label: 'Basic Plan',
      features: [],
      limits: {},
    });

    expect(plan.active).toBe(true);
  });

  it('should accept plan with all fields', () => {
    const plan = PlanSchema.parse({
      code: 'pro_v1',
      label: 'Professional',
      active: true,
      features: ['api_access', 'advanced_reporting', 'custom_branding'],
      limits: {
        storage_gb: 100,
        api_calls_per_month: 100000,
        users: 50,
      },
      currency: 'USD',
      priceMonthly: 49,
      priceYearly: 490,
    });

    expect(plan.features).toHaveLength(3);
    expect(plan.limits.storage_gb).toBe(100);
    expect(plan.priceMonthly).toBe(49);
  });

  it('should accept free plan', () => {
    const plan = PlanSchema.parse({
      code: 'free',
      label: 'Free Plan',
      features: ['basic_features'],
      limits: {
        storage_gb: 1,
        api_calls_per_month: 1000,
        users: 3,
      },
    });

    expect(plan.limits.users).toBe(3);
  });

  it('should accept professional plan', () => {
    const plan = PlanSchema.parse({
      code: 'pro',
      label: 'Professional',
      features: ['api_access', 'advanced_reporting'],
      limits: {
        storage_gb: 100,
        api_calls_per_month: 100000,
        users: 50,
      },
      priceMonthly: 99,
      priceYearly: 990,
    });

    expect(plan.priceMonthly).toBe(99);
    expect(plan.priceYearly).toBe(990);
  });

  it('should accept enterprise plan', () => {
    const plan = PlanSchema.parse({
      code: 'enterprise',
      label: 'Enterprise',
      features: [
        'api_access',
        'advanced_reporting',
        'custom_branding',
        'sso',
        'audit_logs',
        'dedicated_support',
      ],
      limits: {
        storage_gb: 1000,
        api_calls_per_month: 10000000,
        users: -1, // Unlimited
      },
      priceMonthly: 999,
    });

    expect(plan.features).toHaveLength(6);
    expect(plan.limits.users).toBe(-1);
  });

  it('should accept inactive plan', () => {
    const plan = PlanSchema.parse({
      code: 'legacy_v1',
      label: 'Legacy Plan',
      active: false,
      features: [],
      limits: {},
    });

    expect(plan.active).toBe(false);
  });

  it('should accept different currencies', () => {
    const plan = PlanSchema.parse({
      code: 'euro_plan',
      label: 'Euro Plan',
      features: [],
      limits: {},
      currency: 'EUR',
      priceMonthly: 39,
    });

    expect(plan.currency).toBe('EUR');
  });

  it('should reject plan without required fields', () => {
    expect(() => PlanSchema.parse({
      label: 'Test Plan',
      features: [],
      limits: {},
    })).toThrow();

    expect(() => PlanSchema.parse({
      code: 'test',
      features: [],
      limits: {},
    })).toThrow();
  });
});

describe('LicenseSchema', () => {
  it('should accept valid minimal license', () => {
    const license: License = {
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'active',
    };

    expect(() => LicenseSchema.parse(license)).not.toThrow();
  });

  it('should accept license with all fields', () => {
    const license = LicenseSchema.parse({
      tenantId: 'tenant456',
      planCode: 'enterprise',
      issuedAt: '2024-01-01T00:00:00Z',
      expiresAt: '2025-01-01T00:00:00Z',
      status: 'active',
      customFeatures: ['custom_integration', 'beta_features'],
      customLimits: {
        storage_gb: 5000,
        users: 500,
      },
      signature: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    });

    expect(license.customFeatures).toHaveLength(2);
    expect(license.customLimits?.storage_gb).toBe(5000);
    expect(license.signature).toBeDefined();
  });

  it('should accept different status values', () => {
    const statuses: Array<License['status']> = ['active', 'expired', 'suspended', 'trial'];

    statuses.forEach(status => {
      const license = LicenseSchema.parse({
        tenantId: 'tenant123',
        planCode: 'pro',
        issuedAt: '2024-01-01T00:00:00Z',
        status,
      });
      expect(license.status).toBe(status);
    });
  });

  it('should accept perpetual license (no expiration)', () => {
    const license = LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'enterprise',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'active',
    });

    expect(license.expiresAt).toBeUndefined();
  });

  it('should accept trial license', () => {
    const license = LicenseSchema.parse({
      tenantId: 'tenant789',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      expiresAt: '2024-02-01T00:00:00Z',
      status: 'trial',
    });

    expect(license.status).toBe('trial');
    expect(license.expiresAt).toBe('2024-02-01T00:00:00Z');
  });

  it('should accept expired license', () => {
    const license = LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2023-01-01T00:00:00Z',
      expiresAt: '2024-01-01T00:00:00Z',
      status: 'expired',
    });

    expect(license.status).toBe('expired');
  });

  it('should accept suspended license', () => {
    const license = LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'suspended',
    });

    expect(license.status).toBe('suspended');
  });

  it('should accept custom feature overrides', () => {
    const license = LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'active',
      customFeatures: ['beta_feature_1', 'experimental_feature_2'],
    });

    expect(license.customFeatures).toEqual(['beta_feature_1', 'experimental_feature_2']);
  });

  it('should accept custom limit overrides', () => {
    const license = LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'active',
      customLimits: {
        storage_gb: 250,
        api_calls_per_month: 500000,
      },
    });

    expect(license.customLimits?.storage_gb).toBe(250);
    expect(license.customLimits?.api_calls_per_month).toBe(500000);
  });

  it('should accept signed license with JWT', () => {
    const license = LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'enterprise',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'active',
      signature: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.signature',
    });

    expect(license.signature).toBeDefined();
  });

  it('should validate datetime format for issuedAt', () => {
    expect(() => LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01',
      status: 'active',
    })).toThrow();

    expect(() => LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'active',
    })).not.toThrow();
  });

  it('should validate datetime format for expiresAt', () => {
    expect(() => LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      expiresAt: '2025-01-01',
      status: 'active',
    })).toThrow();

    expect(() => LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      expiresAt: '2025-01-01T00:00:00Z',
      status: 'active',
    })).not.toThrow();
  });

  it('should reject license without required fields', () => {
    expect(() => LicenseSchema.parse({
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'active',
    })).toThrow();

    expect(() => LicenseSchema.parse({
      tenantId: 'tenant123',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'active',
    })).toThrow();

    expect(() => LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      status: 'active',
    })).toThrow();
  });

  it('should reject invalid status', () => {
    expect(() => LicenseSchema.parse({
      tenantId: 'tenant123',
      planCode: 'pro',
      issuedAt: '2024-01-01T00:00:00Z',
      status: 'inactive',
    })).toThrow();
  });
});
