// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Application-Level Cache Protocol
 * 
 * Multi-tier caching strategy for application data.
 * Supports Memory, Redis, Memcached, and CDN.
 * 
 * ## Caching in ObjectStack
 * 
 * **Application Cache (`system/cache.zod.ts`) - This File**
 * - **Purpose**: Cache computed data, query results, aggregations
 * - **Technologies**: Redis, Memcached, in-memory LRU
 * - **Configuration**: TTL, eviction policies, cache warming
 * - **Use case**: Cache expensive database queries, computed values
 * - **Scope**: Application layer, server-side data storage
 * 
 * **HTTP Cache (`api/http-cache.zod.ts`)**
 * - **Purpose**: Cache API responses at HTTP protocol level
 * - **Technologies**: HTTP headers (ETag, Last-Modified, Cache-Control), CDN
 * - **Configuration**: Cache-Control headers, validation tokens
 * - **Use case**: Reduce API response time for repeated metadata requests
 * - **Scope**: HTTP layer, client-server communication
 * 
 * @see ../../api/http-cache.zod.ts for HTTP-level caching
 */
export const CacheStrategySchema = z.enum([
  'lru',          // Least Recently Used
  'lfu',          // Least Frequently Used
  'fifo',         // First In First Out
  'ttl',          // Time To Live only
  'adaptive',     // Dynamic strategy selection
]).describe('Cache eviction strategy');

export type CacheStrategy = z.infer<typeof CacheStrategySchema>;

export const CacheTierSchema = z.object({
  name: z.string().describe('Unique cache tier name'),
  type: z.enum(['memory', 'redis', 'memcached', 'cdn']).describe('Cache backend type'),
  maxSize: z.number().optional().describe('Max size in MB'),
  ttl: z.number().default(300).describe('Default TTL in seconds'),
  strategy: CacheStrategySchema.default('lru').describe('Eviction strategy'),
  warmup: z.boolean().default(false).describe('Pre-populate cache on startup'),
}).describe('Configuration for a single cache tier in the hierarchy');

export type CacheTier = z.infer<typeof CacheTierSchema>;
export type CacheTierInput = z.input<typeof CacheTierSchema>;

export const CacheInvalidationSchema = z.object({
  trigger: z.enum(['create', 'update', 'delete', 'manual']).describe('Event that triggers invalidation'),
  scope: z.enum(['key', 'pattern', 'tag', 'all']).describe('Invalidation scope'),
  pattern: z.string().optional().describe('Key pattern for pattern-based invalidation'),
  tags: z.array(z.string()).optional().describe('Cache tags to invalidate'),
}).describe('Rule defining when and how cached entries are invalidated');

export type CacheInvalidation = z.infer<typeof CacheInvalidationSchema>;

export const CacheConfigSchema = z.object({
  enabled: z.boolean().default(false).describe('Enable application-level caching'),
  tiers: z.array(CacheTierSchema).describe('Ordered cache tier hierarchy'),
  invalidation: z.array(CacheInvalidationSchema).describe('Cache invalidation rules'),
  prefetch: z.boolean().default(false).describe('Enable cache prefetching'),
  compression: z.boolean().default(false).describe('Enable data compression in cache'),
  encryption: z.boolean().default(false).describe('Enable encryption for cached data'),
}).describe('Top-level application cache configuration');

export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export type CacheConfigInput = z.input<typeof CacheConfigSchema>;
