import { describe, it, expect } from 'vitest';
import {
  RegistrySyncPolicySchema,
  RegistryUpstreamSchema,
  RegistryConfigSchema,
} from './registry-config.zod';

describe('RegistrySyncPolicySchema', () => {
  it('should accept valid policies', () => {
    const policies = ['manual', 'auto', 'proxy'];
    policies.forEach((policy) => {
      expect(() => RegistrySyncPolicySchema.parse(policy)).not.toThrow();
    });
  });

  it('should reject invalid policies', () => {
    expect(() => RegistrySyncPolicySchema.parse('realtime')).toThrow();
    expect(() => RegistrySyncPolicySchema.parse('pull')).toThrow();
  });
});

describe('RegistryUpstreamSchema', () => {
  it('should accept valid upstream with defaults', () => {
    const upstream = RegistryUpstreamSchema.parse({
      url: 'https://registry.objectstack.com',
    });

    expect(upstream.url).toBe('https://registry.objectstack.com');
    expect(upstream.syncPolicy).toBe('auto');
    expect(upstream.timeout).toBe(30000);
  });

  it('should accept full upstream configuration', () => {
    const upstream = RegistryUpstreamSchema.parse({
      url: 'https://registry.example.com',
      syncPolicy: 'manual',
      syncInterval: 300,
      auth: {
        type: 'bearer',
        token: 'my-token',
      },
      tls: {
        enabled: true,
        verifyCertificate: false,
      },
      timeout: 60000,
      retry: {
        maxAttempts: 5,
        backoff: 'linear',
      },
    });

    expect(upstream.syncPolicy).toBe('manual');
    expect(upstream.syncInterval).toBe(300);
    expect(upstream.auth?.type).toBe('bearer');
    expect(upstream.tls?.verifyCertificate).toBe(false);
    expect(upstream.timeout).toBe(60000);
    expect(upstream.retry?.maxAttempts).toBe(5);
  });

  it('should accept all auth types', () => {
    const types = ['none', 'basic', 'bearer', 'api-key', 'oauth2'];
    types.forEach((type) => {
      expect(() =>
        RegistryUpstreamSchema.parse({
          url: 'https://registry.example.com',
          auth: { type },
        }),
      ).not.toThrow();
    });
  });

  it('should accept all backoff strategies', () => {
    const strategies = ['fixed', 'linear', 'exponential'];
    strategies.forEach((backoff) => {
      expect(() =>
        RegistryUpstreamSchema.parse({
          url: 'https://registry.example.com',
          retry: { backoff },
        }),
      ).not.toThrow();
    });
  });

  it('should reject invalid url', () => {
    expect(() => RegistryUpstreamSchema.parse({ url: 'not-a-url' })).toThrow();
  });

  it('should reject syncInterval below minimum', () => {
    expect(() =>
      RegistryUpstreamSchema.parse({
        url: 'https://registry.example.com',
        syncInterval: 10,
      }),
    ).toThrow();
  });

  it('should reject timeout below minimum', () => {
    expect(() =>
      RegistryUpstreamSchema.parse({
        url: 'https://registry.example.com',
        timeout: 500,
      }),
    ).toThrow();
  });

  it('should reject missing url', () => {
    expect(() => RegistryUpstreamSchema.parse({})).toThrow();
  });
});

describe('RegistryConfigSchema', () => {
  it('should accept valid config with defaults', () => {
    const config = RegistryConfigSchema.parse({
      type: 'private',
    });

    expect(config.type).toBe('private');
    expect(config.visibility).toBe('private');
  });

  it('should accept all registry types', () => {
    const types = ['public', 'private', 'hybrid'];
    types.forEach((type) => {
      expect(() => RegistryConfigSchema.parse({ type })).not.toThrow();
    });
  });

  it('should accept full configuration', () => {
    const config = RegistryConfigSchema.parse({
      type: 'hybrid',
      upstream: [
        { url: 'https://registry.objectstack.com' },
      ],
      scope: ['@my-corp', '@enterprise'],
      defaultScope: '@my-corp',
      storage: {
        backend: 's3',
        path: 'my-bucket/plugins',
        credentials: { region: 'us-east-1' },
      },
      visibility: 'internal',
      accessControl: {
        requireAuthForRead: true,
        requireAuthForWrite: true,
        allowedPrincipals: ['team-core', 'team-platform'],
      },
      cache: {
        enabled: true,
        ttl: 7200,
        maxSize: 1073741824,
      },
      mirrors: [
        { url: 'https://mirror1.example.com', priority: 1 },
        { url: 'https://mirror2.example.com', priority: 2 },
      ],
    });

    expect(config.upstream).toHaveLength(1);
    expect(config.scope).toEqual(['@my-corp', '@enterprise']);
    expect(config.storage?.backend).toBe('s3');
    expect(config.visibility).toBe('internal');
    expect(config.accessControl?.requireAuthForRead).toBe(true);
    expect(config.cache?.ttl).toBe(7200);
    expect(config.mirrors).toHaveLength(2);
  });

  it('should accept all storage backends', () => {
    const backends = ['local', 's3', 'gcs', 'azure-blob', 'oss'];
    backends.forEach((backend) => {
      expect(() =>
        RegistryConfigSchema.parse({
          type: 'private',
          storage: { backend },
        }),
      ).not.toThrow();
    });
  });

  it('should accept all visibility options', () => {
    const options = ['public', 'private', 'internal'];
    options.forEach((visibility) => {
      expect(() =>
        RegistryConfigSchema.parse({ type: 'private', visibility }),
      ).not.toThrow();
    });
  });

  it('should use access control defaults', () => {
    const config = RegistryConfigSchema.parse({
      type: 'private',
      accessControl: {},
    });

    expect(config.accessControl?.requireAuthForRead).toBe(false);
    expect(config.accessControl?.requireAuthForWrite).toBe(true);
  });

  it('should reject missing type', () => {
    expect(() => RegistryConfigSchema.parse({})).toThrow();
  });

  it('should reject invalid type', () => {
    expect(() => RegistryConfigSchema.parse({ type: 'distributed' })).toThrow();
  });
});
