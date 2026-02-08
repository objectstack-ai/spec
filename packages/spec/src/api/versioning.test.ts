import { describe, it, expect } from 'vitest';
import {
  VersioningStrategy,
  VersionStatus,
  VersionDefinitionSchema,
  VersioningConfigSchema,
  VersionNegotiationResponseSchema,
  DEFAULT_VERSIONING_CONFIG,
  type VersionDefinition,
  type VersioningConfig,
  type VersionNegotiationResponse,
} from './versioning.zod';

describe('VersioningStrategy', () => {
  it('should accept valid strategies', () => {
    expect(VersioningStrategy.parse('urlPath')).toBe('urlPath');
    expect(VersioningStrategy.parse('header')).toBe('header');
    expect(VersioningStrategy.parse('queryParam')).toBe('queryParam');
    expect(VersioningStrategy.parse('dateBased')).toBe('dateBased');
  });

  it('should reject invalid strategies', () => {
    expect(() => VersioningStrategy.parse('path')).toThrow();
    expect(() => VersioningStrategy.parse('')).toThrow();
  });
});

describe('VersionStatus', () => {
  it('should accept all lifecycle states', () => {
    expect(VersionStatus.parse('preview')).toBe('preview');
    expect(VersionStatus.parse('current')).toBe('current');
    expect(VersionStatus.parse('supported')).toBe('supported');
    expect(VersionStatus.parse('deprecated')).toBe('deprecated');
    expect(VersionStatus.parse('retired')).toBe('retired');
  });

  it('should reject invalid status', () => {
    expect(() => VersionStatus.parse('active')).toThrow();
  });
});

describe('VersionDefinitionSchema', () => {
  it('should accept a current version', () => {
    const version: VersionDefinition = VersionDefinitionSchema.parse({
      version: 'v1',
      status: 'current',
      releasedAt: '2025-01-15',
      description: 'Initial stable release',
    });

    expect(version.version).toBe('v1');
    expect(version.status).toBe('current');
    expect(version.releasedAt).toBe('2025-01-15');
  });

  it('should accept a deprecated version with sunset info', () => {
    const version = VersionDefinitionSchema.parse({
      version: 'v0',
      status: 'deprecated',
      releasedAt: '2024-06-01',
      deprecatedAt: '2025-01-15',
      sunsetAt: '2025-07-15',
      migrationGuide: 'https://docs.objectstack.dev/migrate/v0-to-v1',
      description: 'Legacy API version',
    });

    expect(version.deprecatedAt).toBe('2025-01-15');
    expect(version.sunsetAt).toBe('2025-07-15');
    expect(version.migrationGuide).toContain('migrate');
  });

  it('should accept a preview version with breaking changes', () => {
    const version = VersionDefinitionSchema.parse({
      version: 'v2beta1',
      status: 'preview',
      releasedAt: '2025-06-01',
      breakingChanges: [
        'Renamed /api/v1/meta to /api/v2/metadata',
        'Changed batch response format',
      ],
    });

    expect(version.breakingChanges).toHaveLength(2);
  });

  it('should reject invalid migrationGuide URL', () => {
    expect(() => VersionDefinitionSchema.parse({
      version: 'v0',
      status: 'deprecated',
      releasedAt: '2024-06-01',
      migrationGuide: 'not-a-url',
    })).toThrow();
  });
});

describe('VersioningConfigSchema', () => {
  it('should accept a minimal configuration', () => {
    const config: VersioningConfig = VersioningConfigSchema.parse({
      current: 'v1',
      default: 'v1',
      versions: [
        { version: 'v1', status: 'current', releasedAt: '2025-01-15' },
      ],
    });

    expect(config.strategy).toBe('urlPath'); // default
    expect(config.current).toBe('v1');
    expect(config.default).toBe('v1');
    expect(config.headerName).toBe('ObjectStack-Version');
    expect(config.queryParamName).toBe('version');
    expect(config.urlPrefix).toBe('/api');
    expect(config.includeInDiscovery).toBe(true);
  });

  it('should accept a complete configuration', () => {
    const config = VersioningConfigSchema.parse({
      strategy: 'header',
      current: 'v2',
      default: 'v1',
      headerName: 'X-API-Version',
      versions: [
        { version: 'v1', status: 'supported', releasedAt: '2025-01-15' },
        { version: 'v2', status: 'current', releasedAt: '2025-06-01' },
        { version: 'v3beta', status: 'preview', releasedAt: '2025-12-01' },
      ],
      deprecation: {
        warnHeader: true,
        sunsetHeader: true,
        linkHeader: true,
        rejectRetired: true,
        warningMessage: 'This API version is deprecated. Please upgrade.',
      },
      includeInDiscovery: true,
    });

    expect(config.strategy).toBe('header');
    expect(config.headerName).toBe('X-API-Version');
    expect(config.versions).toHaveLength(3);
    expect(config.deprecation?.warningMessage).toContain('deprecated');
  });

  it('should accept date-based versioning', () => {
    const config = VersioningConfigSchema.parse({
      strategy: 'dateBased',
      current: '2025-06-01',
      default: '2025-01-15',
      versions: [
        { version: '2025-01-15', status: 'supported', releasedAt: '2025-01-15' },
        { version: '2025-06-01', status: 'current', releasedAt: '2025-06-01' },
      ],
    });

    expect(config.strategy).toBe('dateBased');
    expect(config.current).toBe('2025-06-01');
  });

  it('should require at least one version', () => {
    expect(() => VersioningConfigSchema.parse({
      current: 'v1',
      default: 'v1',
      versions: [],
    })).toThrow();
  });
});

describe('VersionNegotiationResponseSchema', () => {
  it('should accept a basic response', () => {
    const response: VersionNegotiationResponse = VersionNegotiationResponseSchema.parse({
      current: 'v1',
      resolved: 'v1',
      supported: ['v1'],
    });

    expect(response.current).toBe('v1');
    expect(response.resolved).toBe('v1');
    expect(response.supported).toContain('v1');
  });

  it('should accept a full response with deprecated versions', () => {
    const response = VersionNegotiationResponseSchema.parse({
      current: 'v2',
      requested: 'v1',
      resolved: 'v1',
      supported: ['v1', 'v2', 'v3beta'],
      deprecated: ['v0'],
      versions: [
        { version: 'v0', status: 'deprecated', releasedAt: '2024-01-01', deprecatedAt: '2025-01-15', sunsetAt: '2025-07-15' },
        { version: 'v1', status: 'supported', releasedAt: '2025-01-15' },
        { version: 'v2', status: 'current', releasedAt: '2025-06-01' },
        { version: 'v3beta', status: 'preview', releasedAt: '2025-12-01' },
      ],
    });

    expect(response.requested).toBe('v1');
    expect(response.deprecated).toContain('v0');
    expect(response.versions).toHaveLength(4);
  });
});

describe('DEFAULT_VERSIONING_CONFIG', () => {
  it('should be valid configuration', () => {
    const config = VersioningConfigSchema.parse(DEFAULT_VERSIONING_CONFIG);

    expect(config.strategy).toBe('urlPath');
    expect(config.current).toBe('v1');
    expect(config.default).toBe('v1');
    expect(config.versions).toHaveLength(1);
    expect(config.versions[0].status).toBe('current');
    expect(config.deprecation?.warnHeader).toBe(true);
    expect(config.deprecation?.sunsetHeader).toBe(true);
    expect(config.includeInDiscovery).toBe(true);
  });
});
