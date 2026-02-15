// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ICacheService, CacheStats } from '@objectstack/spec/contracts';

/**
 * Configuration for the Redis cache adapter.
 */
export interface RedisCacheAdapterOptions {
  /** Redis connection URL (e.g. 'redis://localhost:6379') */
  url: string;
  /** Key prefix for namespacing (default: 'os:') */
  keyPrefix?: string;
  /** Default TTL in seconds (0 = no expiry) */
  defaultTtl?: number;
}

/**
 * Redis cache adapter skeleton implementing ICacheService.
 *
 * This is a placeholder for future Redis integration.
 * Concrete implementation will use `ioredis` or `redis` client.
 *
 * @example
 * ```ts
 * const cache = new RedisCacheAdapter({ url: 'redis://localhost:6379' });
 * await cache.set('user:1', { name: 'Alice' }, 3600);
 * ```
 */
export class RedisCacheAdapter implements ICacheService {
  private readonly url: string;
  private readonly keyPrefix: string;
  private readonly defaultTtl: number;

  constructor(options: RedisCacheAdapterOptions) {
    this.url = options.url;
    this.keyPrefix = options.keyPrefix ?? 'os:';
    this.defaultTtl = options.defaultTtl ?? 0;
  }

  async get<T = unknown>(_key: string): Promise<T | undefined> {
    throw new Error(`RedisCacheAdapter not yet implemented (url: ${this.url}, prefix: ${this.keyPrefix})`);
  }

  async set<T = unknown>(_key: string, _value: T, _ttl?: number): Promise<void> {
    void this.defaultTtl;
    throw new Error('RedisCacheAdapter not yet implemented');
  }

  async delete(_key: string): Promise<boolean> {
    throw new Error('RedisCacheAdapter not yet implemented');
  }

  async has(_key: string): Promise<boolean> {
    throw new Error('RedisCacheAdapter not yet implemented');
  }

  async clear(): Promise<void> {
    throw new Error('RedisCacheAdapter not yet implemented');
  }

  async stats(): Promise<CacheStats> {
    throw new Error('RedisCacheAdapter not yet implemented');
  }
}
