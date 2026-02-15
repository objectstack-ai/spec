// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ICacheService, CacheStats } from '@objectstack/spec/contracts';

/**
 * In-memory cache entry with optional TTL expiry.
 */
interface CacheEntry<T = unknown> {
  value: T;
  expires?: number;
}

/**
 * Configuration options for MemoryCacheAdapter.
 */
export interface MemoryCacheAdapterOptions {
  /** Maximum number of entries before eviction (0 = unlimited) */
  maxSize?: number;
  /** Default TTL in seconds (0 = no expiry) */
  defaultTtl?: number;
}

/**
 * In-memory cache adapter implementing ICacheService.
 *
 * Uses a Map-backed store with TTL-based expiry and LRU-style eviction.
 * Suitable for single-process environments, development, and testing.
 */
export class MemoryCacheAdapter implements ICacheService {
  private readonly store = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  private readonly maxSize: number;
  private readonly defaultTtl: number;

  constructor(options: MemoryCacheAdapterOptions = {}) {
    this.maxSize = options.maxSize ?? 0;
    this.defaultTtl = options.defaultTtl ?? 0;
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry || (entry.expires && Date.now() > entry.expires)) {
      if (entry) this.store.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.value as T;
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const effectiveTtl = ttl ?? this.defaultTtl;
    if (this.maxSize > 0 && !this.store.has(key) && this.store.size >= this.maxSize) {
      // Evict oldest entry (first key in Map insertion order)
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, {
      value,
      expires: effectiveTtl > 0 ? Date.now() + effectiveTtl * 1000 : undefined,
    });
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expires && Date.now() > entry.expires) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async stats(): Promise<CacheStats> {
    return {
      hits: this.hits,
      misses: this.misses,
      keyCount: this.store.size,
    };
  }
}
