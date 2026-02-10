import { describe, it, expect } from 'vitest';
import {
  FeatureStrategy,
  FeatureFlagSchema,
  FeatureFlag,
  type FeatureFlag as FeatureFlagType,
} from './feature.zod';

describe('FeatureStrategy', () => {
  it('should accept valid strategies', () => {
    expect(() => FeatureStrategy.parse('boolean')).not.toThrow();
    expect(() => FeatureStrategy.parse('percentage')).not.toThrow();
    expect(() => FeatureStrategy.parse('user_list')).not.toThrow();
    expect(() => FeatureStrategy.parse('group')).not.toThrow();
    expect(() => FeatureStrategy.parse('custom')).not.toThrow();
  });

  it('should reject invalid strategies', () => {
    expect(() => FeatureStrategy.parse('random')).toThrow();
    expect(() => FeatureStrategy.parse('')).toThrow();
  });
});

describe('FeatureFlagSchema', () => {
  const minimalFlag = {
    name: 'dark_mode',
  };

  it('should accept minimal feature flag', () => {
    expect(() => FeatureFlagSchema.parse(minimalFlag)).not.toThrow();
  });

  it('should apply default values', () => {
    const parsed = FeatureFlagSchema.parse(minimalFlag);
    expect(parsed.enabled).toBe(false);
    expect(parsed.strategy).toBe('boolean');
    expect(parsed.environment).toBe('all');
  });

  it('should accept feature flag with all fields', () => {
    const full: FeatureFlagType = {
      name: 'new_dashboard',
      label: 'New Dashboard',
      description: 'Enables the new dashboard UI',
      enabled: true,
      strategy: 'percentage',
      conditions: {
        percentage: 50,
        users: ['user_1', 'user_2'],
        groups: ['beta_testers'],
        expression: 'user.plan == "pro"',
      },
      environment: 'staging',
      expiresAt: '2025-12-31T23:59:59Z',
    };

    const parsed = FeatureFlagSchema.parse(full);
    expect(parsed.label).toBe('New Dashboard');
    expect(parsed.conditions?.percentage).toBe(50);
    expect(parsed.conditions?.users).toHaveLength(2);
    expect(parsed.environment).toBe('staging');
  });

  it('should reject invalid name (not snake_case)', () => {
    expect(() => FeatureFlagSchema.parse({ name: 'DarkMode' })).toThrow();
    expect(() => FeatureFlagSchema.parse({ name: 'dark-mode' })).toThrow();
    expect(() => FeatureFlagSchema.parse({ name: '1invalid' })).toThrow();
  });

  it('should reject name that is too short', () => {
    expect(() => FeatureFlagSchema.parse({ name: 'a' })).toThrow();
  });

  it('should accept all environment values', () => {
    const envs = ['dev', 'staging', 'prod', 'all'] as const;
    envs.forEach(environment => {
      const parsed = FeatureFlagSchema.parse({ name: 'test_flag', environment });
      expect(parsed.environment).toBe(environment);
    });
  });

  it('should reject invalid environment', () => {
    expect(() => FeatureFlagSchema.parse({
      name: 'test_flag',
      environment: 'local',
    })).toThrow();
  });

  it('should reject percentage out of range', () => {
    expect(() => FeatureFlagSchema.parse({
      name: 'test_flag',
      conditions: { percentage: 101 },
    })).toThrow();

    expect(() => FeatureFlagSchema.parse({
      name: 'test_flag',
      conditions: { percentage: -1 },
    })).toThrow();
  });

  it('should accept percentage at boundaries', () => {
    const zero = FeatureFlagSchema.parse({
      name: 'test_flag',
      conditions: { percentage: 0 },
    });
    expect(zero.conditions?.percentage).toBe(0);

    const hundred = FeatureFlagSchema.parse({
      name: 'test_flag',
      conditions: { percentage: 100 },
    });
    expect(hundred.conditions?.percentage).toBe(100);
  });

  it('should validate expiresAt as ISO datetime', () => {
    expect(() => FeatureFlagSchema.parse({
      name: 'test_flag',
      expiresAt: 'not-a-date',
    })).toThrow();

    expect(() => FeatureFlagSchema.parse({
      name: 'test_flag',
      expiresAt: '2025-06-15T10:00:00Z',
    })).not.toThrow();
  });
});

describe('FeatureFlag.create', () => {
  it('should return the config object as-is', () => {
    const config = { name: 'my_feature', enabled: true };
    const result = FeatureFlag.create(config);
    expect(result).toEqual(config);
  });
});
