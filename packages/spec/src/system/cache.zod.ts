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
]);

export type CacheStrategy = z.infer<typeof CacheStrategySchema>;

export const CacheTierSchema = z.object({
  name: z.string(),
  type: z.enum(['memory', 'redis', 'memcached', 'cdn']),
  maxSize: z.number().optional().describe('Max size in MB'),
  ttl: z.number().default(300).describe('Default TTL in seconds'),
  strategy: CacheStrategySchema.default('lru'),
  warmup: z.boolean().default(false),
});

export type CacheTier = z.infer<typeof CacheTierSchema>;

export const CacheInvalidationSchema = z.object({
  trigger: z.enum(['create', 'update', 'delete', 'manual']),
  scope: z.enum(['key', 'pattern', 'tag', 'all']),
  pattern: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CacheInvalidation = z.infer<typeof CacheInvalidationSchema>;

export const CacheConfigSchema = z.object({
  enabled: z.boolean().default(false),
  tiers: z.array(CacheTierSchema),
  invalidation: z.array(CacheInvalidationSchema),
  prefetch: z.boolean().default(false),
  compression: z.boolean().default(false),
  encryption: z.boolean().default(false),
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;
