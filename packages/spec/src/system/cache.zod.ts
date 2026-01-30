import { z } from 'zod';

/**
 * Multi-tier caching strategy
 * Supports Memory, Redis, CDN
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
