import { describe, it, expect } from 'vitest';
import {
  CacheStrategySchema,
  CacheTierSchema,
  CacheInvalidationSchema,
  CacheConfigSchema,
} from './cache.zod';

describe('CacheStrategySchema', () => {
  it('should accept valid strategies', () => {
    const strategies = ['lru', 'lfu', 'fifo', 'ttl', 'adaptive'];

    strategies.forEach((strategy) => {
      expect(() => CacheStrategySchema.parse(strategy)).not.toThrow();
    });
  });

  it('should reject invalid strategies', () => {
    expect(() => CacheStrategySchema.parse('invalid')).toThrow();
    expect(() => CacheStrategySchema.parse('random')).toThrow();
  });
});

describe('CacheTierSchema', () => {
  it('should accept valid tier with defaults', () => {
    const tier = CacheTierSchema.parse({
      name: 'memory_cache',
      type: 'memory',
    });

    expect(tier.name).toBe('memory_cache');
    expect(tier.type).toBe('memory');
    expect(tier.ttl).toBe(300);
    expect(tier.strategy).toBe('lru');
    expect(tier.warmup).toBe(false);
  });

  it('should accept all backend types', () => {
    const types = ['memory', 'redis', 'memcached', 'cdn'];

    types.forEach((type) => {
      expect(() => CacheTierSchema.parse({ name: 'test', type })).not.toThrow();
    });
  });

  it('should accept full configuration', () => {
    const tier = CacheTierSchema.parse({
      name: 'redis_tier',
      type: 'redis',
      maxSize: 512,
      ttl: 600,
      strategy: 'lfu',
      warmup: true,
    });

    expect(tier.maxSize).toBe(512);
    expect(tier.ttl).toBe(600);
    expect(tier.strategy).toBe('lfu');
    expect(tier.warmup).toBe(true);
  });

  it('should reject invalid type', () => {
    expect(() => CacheTierSchema.parse({ name: 'test', type: 'invalid' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => CacheTierSchema.parse({})).toThrow();
    expect(() => CacheTierSchema.parse({ name: 'test' })).toThrow();
  });
});

describe('CacheInvalidationSchema', () => {
  it('should accept valid invalidation rule', () => {
    const rule = CacheInvalidationSchema.parse({
      trigger: 'update',
      scope: 'key',
    });

    expect(rule.trigger).toBe('update');
    expect(rule.scope).toBe('key');
  });

  it('should accept all trigger types', () => {
    const triggers = ['create', 'update', 'delete', 'manual'];

    triggers.forEach((trigger) => {
      expect(() => CacheInvalidationSchema.parse({ trigger, scope: 'key' })).not.toThrow();
    });
  });

  it('should accept all scope types', () => {
    const scopes = ['key', 'pattern', 'tag', 'all'];

    scopes.forEach((scope) => {
      expect(() => CacheInvalidationSchema.parse({ trigger: 'update', scope })).not.toThrow();
    });
  });

  it('should accept optional pattern and tags', () => {
    const rule = CacheInvalidationSchema.parse({
      trigger: 'update',
      scope: 'pattern',
      pattern: 'user:*',
      tags: ['users', 'profiles'],
    });

    expect(rule.pattern).toBe('user:*');
    expect(rule.tags).toEqual(['users', 'profiles']);
  });

  it('should reject missing required fields', () => {
    expect(() => CacheInvalidationSchema.parse({})).toThrow();
    expect(() => CacheInvalidationSchema.parse({ trigger: 'update' })).toThrow();
  });
});

describe('CacheConfigSchema', () => {
  it('should accept valid configuration with defaults', () => {
    const config = CacheConfigSchema.parse({
      tiers: [{ name: 'memory', type: 'memory' }],
      invalidation: [{ trigger: 'update', scope: 'key' }],
    });

    expect(config.enabled).toBe(false);
    expect(config.prefetch).toBe(false);
    expect(config.compression).toBe(false);
    expect(config.encryption).toBe(false);
    expect(config.tiers).toHaveLength(1);
    expect(config.invalidation).toHaveLength(1);
  });

  it('should accept full configuration', () => {
    const config = CacheConfigSchema.parse({
      enabled: true,
      tiers: [
        { name: 'l1', type: 'memory', maxSize: 128 },
        { name: 'l2', type: 'redis', maxSize: 1024, ttl: 600 },
      ],
      invalidation: [
        { trigger: 'update', scope: 'pattern', pattern: '*' },
        { trigger: 'delete', scope: 'all' },
      ],
      prefetch: true,
      compression: true,
      encryption: true,
    });

    expect(config.enabled).toBe(true);
    expect(config.tiers).toHaveLength(2);
    expect(config.invalidation).toHaveLength(2);
    expect(config.prefetch).toBe(true);
    expect(config.compression).toBe(true);
    expect(config.encryption).toBe(true);
  });

  it('should reject missing required fields', () => {
    expect(() => CacheConfigSchema.parse({})).toThrow();
    expect(() => CacheConfigSchema.parse({ tiers: [] })).toThrow();
  });
});
