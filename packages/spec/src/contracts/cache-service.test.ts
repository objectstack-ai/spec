import { describe, it, expect } from 'vitest';
import type { ICacheService, CacheStats } from './cache-service';

describe('Cache Service Contract', () => {
  it('should allow a minimal ICacheService implementation', () => {
    const cache: ICacheService = {
      get: async <T>(_key: string) => undefined as T | undefined,
      set: async (_key, _value, _ttl?) => {},
      delete: async (_key) => false,
      has: async (_key) => false,
      clear: async () => {},
      stats: async () => ({ hits: 0, misses: 0, keyCount: 0 }),
    };

    expect(typeof cache.get).toBe('function');
    expect(typeof cache.set).toBe('function');
    expect(typeof cache.delete).toBe('function');
    expect(typeof cache.has).toBe('function');
    expect(typeof cache.clear).toBe('function');
    expect(typeof cache.stats).toBe('function');
  });

  it('should perform basic cache operations', async () => {
    const store = new Map<string, { value: unknown; ttl?: number }>();

    const cache: ICacheService = {
      get: async <T>(key: string) => {
        const entry = store.get(key);
        return entry ? entry.value as T : undefined;
      },
      set: async (key, value, ttl?) => {
        store.set(key, { value, ttl });
      },
      delete: async (key) => store.delete(key),
      has: async (key) => store.has(key),
      clear: async () => { store.clear(); },
      stats: async () => ({
        hits: 0,
        misses: 0,
        keyCount: store.size,
      }),
    };

    await cache.set('user:1', { name: 'Alice' }, 60);
    expect(await cache.has('user:1')).toBe(true);
    expect(await cache.get('user:1')).toEqual({ name: 'Alice' });

    await cache.delete('user:1');
    expect(await cache.has('user:1')).toBe(false);
    expect(await cache.get('user:1')).toBeUndefined();
  });

  it('should return cache stats', async () => {
    let hits = 0;
    let misses = 0;
    const store = new Map<string, unknown>();

    const cache: ICacheService = {
      get: async <T>(key: string) => {
        if (store.has(key)) {
          hits++;
          return store.get(key) as T;
        }
        misses++;
        return undefined;
      },
      set: async (key, value) => { store.set(key, value); },
      delete: async (key) => store.delete(key),
      has: async (key) => store.has(key),
      clear: async () => { store.clear(); },
      stats: async (): Promise<CacheStats> => ({
        hits,
        misses,
        keyCount: store.size,
        memoryUsage: 1024,
      }),
    };

    await cache.set('a', 1);
    await cache.get('a');
    await cache.get('b');

    const s = await cache.stats();
    expect(s.hits).toBe(1);
    expect(s.misses).toBe(1);
    expect(s.keyCount).toBe(1);
    expect(s.memoryUsage).toBe(1024);
  });

  it('should clear all entries', async () => {
    const store = new Map<string, unknown>();

    const cache: ICacheService = {
      get: async <T>(key: string) => store.get(key) as T | undefined,
      set: async (key, value) => { store.set(key, value); },
      delete: async (key) => store.delete(key),
      has: async (key) => store.has(key),
      clear: async () => { store.clear(); },
      stats: async () => ({ hits: 0, misses: 0, keyCount: store.size }),
    };

    await cache.set('x', 1);
    await cache.set('y', 2);
    await cache.clear();

    expect(await cache.has('x')).toBe(false);
    expect(await cache.has('y')).toBe(false);
    const s = await cache.stats();
    expect(s.keyCount).toBe(0);
  });
});
