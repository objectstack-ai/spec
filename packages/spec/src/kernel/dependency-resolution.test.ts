import { describe, it, expect } from 'vitest';
import {
  DependencyStatusEnum,
  ResolvedDependencySchema,
  RequiredActionSchema,
  DependencyResolutionResultSchema,
} from './dependency-resolution.zod';

describe('DependencyStatusEnum', () => {
  it('should accept all valid statuses', () => {
    const statuses = ['satisfied', 'needs_install', 'needs_upgrade', 'conflict'];
    statuses.forEach(status => {
      expect(() => DependencyStatusEnum.parse(status)).not.toThrow();
    });
  });

  it('should reject invalid statuses', () => {
    expect(() => DependencyStatusEnum.parse('unknown')).toThrow();
    expect(() => DependencyStatusEnum.parse('')).toThrow();
  });
});

describe('ResolvedDependencySchema', () => {
  it('should accept satisfied dependency', () => {
    const dep = {
      packageId: 'com.acme.auth',
      requiredRange: '^2.0.0',
      resolvedVersion: '2.1.0',
      installedVersion: '2.1.0',
      status: 'satisfied' as const,
    };
    const parsed = ResolvedDependencySchema.parse(dep);
    expect(parsed.status).toBe('satisfied');
    expect(parsed.resolvedVersion).toBe('2.1.0');
  });

  it('should accept needs_install dependency', () => {
    const dep = {
      packageId: 'com.acme.storage',
      requiredRange: '>=1.0.0',
      resolvedVersion: '1.5.0',
      status: 'needs_install' as const,
    };
    const parsed = ResolvedDependencySchema.parse(dep);
    expect(parsed.status).toBe('needs_install');
    expect(parsed.installedVersion).toBeUndefined();
  });

  it('should accept needs_upgrade dependency', () => {
    const dep = {
      packageId: 'com.acme.core',
      requiredRange: '^3.0.0',
      resolvedVersion: '3.0.0',
      installedVersion: '2.5.0',
      status: 'needs_upgrade' as const,
    };
    const parsed = ResolvedDependencySchema.parse(dep);
    expect(parsed.status).toBe('needs_upgrade');
    expect(parsed.installedVersion).toBe('2.5.0');
  });

  it('should accept conflict dependency with reason', () => {
    const dep = {
      packageId: 'com.acme.utils',
      requiredRange: '^2.0.0',
      installedVersion: '1.3.0',
      status: 'conflict' as const,
      conflictReason: 'Package com.acme.crm requires com.acme.utils@^1.0.0',
    };
    const parsed = ResolvedDependencySchema.parse(dep);
    expect(parsed.status).toBe('conflict');
    expect(parsed.conflictReason).toContain('com.acme.crm');
  });

  it('should reject missing required fields', () => {
    expect(() => ResolvedDependencySchema.parse({})).toThrow();
    expect(() => ResolvedDependencySchema.parse({ packageId: 'test' })).toThrow();
  });
});

describe('RequiredActionSchema', () => {
  it('should accept install action', () => {
    const action = {
      type: 'install' as const,
      packageId: 'com.acme.auth',
      description: 'Install com.acme.auth@2.1.0 (required by com.acme.crm)',
    };
    const parsed = RequiredActionSchema.parse(action);
    expect(parsed.type).toBe('install');
  });

  it('should accept upgrade action', () => {
    const action = {
      type: 'upgrade' as const,
      packageId: 'com.acme.core',
      description: 'Upgrade com.acme.core from 2.5.0 to 3.0.0',
    };
    const parsed = RequiredActionSchema.parse(action);
    expect(parsed.type).toBe('upgrade');
  });

  it('should accept confirm_conflict action', () => {
    const action = {
      type: 'confirm_conflict' as const,
      packageId: 'com.acme.utils',
      description: 'Version conflict: com.acme.crm needs ^1.0.0 but com.acme.hr needs ^2.0.0',
    };
    expect(() => RequiredActionSchema.parse(action)).not.toThrow();
  });
});

describe('DependencyResolutionResultSchema', () => {
  it('should accept resolution with all dependencies satisfied', () => {
    const result = {
      dependencies: [
        {
          packageId: 'com.acme.auth',
          requiredRange: '^2.0.0',
          resolvedVersion: '2.1.0',
          installedVersion: '2.1.0',
          status: 'satisfied' as const,
        },
      ],
      canProceed: true,
      requiredActions: [],
      installOrder: ['com.acme.crm'],
    };
    const parsed = DependencyResolutionResultSchema.parse(result);
    expect(parsed.canProceed).toBe(true);
    expect(parsed.requiredActions).toHaveLength(0);
  });

  it('should accept resolution with required actions', () => {
    const result = {
      dependencies: [
        {
          packageId: 'com.acme.auth',
          requiredRange: '^2.0.0',
          resolvedVersion: '2.1.0',
          status: 'needs_install' as const,
        },
        {
          packageId: 'com.acme.core',
          requiredRange: '^3.0.0',
          resolvedVersion: '3.0.0',
          installedVersion: '2.5.0',
          status: 'needs_upgrade' as const,
        },
      ],
      canProceed: true,
      requiredActions: [
        {
          type: 'install' as const,
          packageId: 'com.acme.auth',
          description: 'Install com.acme.auth@2.1.0',
        },
        {
          type: 'upgrade' as const,
          packageId: 'com.acme.core',
          description: 'Upgrade com.acme.core from 2.5.0 to 3.0.0',
        },
      ],
      installOrder: ['com.acme.core', 'com.acme.auth', 'com.acme.crm'],
    };
    const parsed = DependencyResolutionResultSchema.parse(result);
    expect(parsed.canProceed).toBe(true);
    expect(parsed.requiredActions).toHaveLength(2);
    expect(parsed.installOrder).toHaveLength(3);
  });

  it('should accept resolution with conflicts', () => {
    const result = {
      dependencies: [
        {
          packageId: 'com.acme.utils',
          requiredRange: '^2.0.0',
          installedVersion: '1.3.0',
          status: 'conflict' as const,
          conflictReason: 'com.acme.crm requires ^1.0.0',
        },
      ],
      canProceed: false,
      requiredActions: [
        {
          type: 'confirm_conflict' as const,
          packageId: 'com.acme.utils',
          description: 'Resolve version conflict for com.acme.utils',
        },
      ],
      installOrder: [],
    };
    const parsed = DependencyResolutionResultSchema.parse(result);
    expect(parsed.canProceed).toBe(false);
  });

  it('should accept resolution with circular dependencies', () => {
    const result = {
      dependencies: [],
      canProceed: false,
      requiredActions: [],
      installOrder: [],
      circularDependencies: [
        ['com.acme.a', 'com.acme.b', 'com.acme.a'],
      ],
    };
    const parsed = DependencyResolutionResultSchema.parse(result);
    expect(parsed.circularDependencies).toHaveLength(1);
    expect(parsed.circularDependencies![0]).toHaveLength(3);
  });

  it('should reject missing required fields', () => {
    expect(() => DependencyResolutionResultSchema.parse({})).toThrow();
  });
});
