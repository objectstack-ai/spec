// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import { MemoryCacheAdapter } from './memory-cache-adapter.js';
import type { MemoryCacheAdapterOptions } from './memory-cache-adapter.js';

/**
 * Configuration options for the CacheServicePlugin.
 */
export interface CacheServicePluginOptions {
  /** Cache adapter type (default: 'memory') */
  adapter?: 'memory' | 'redis';
  /** Options for the memory cache adapter */
  memory?: MemoryCacheAdapterOptions;
  /** Redis connection URL (used when adapter is 'redis') */
  redisUrl?: string;
}

/**
 * CacheServicePlugin — Production ICacheService implementation.
 *
 * Registers a cache service with the kernel during the init phase.
 * Supports in-memory and Redis adapters.
 *
 * @example
 * ```ts
 * import { ObjectKernel } from '@objectstack/core';
 * import { CacheServicePlugin } from '@objectstack/service-cache';
 *
 * const kernel = new ObjectKernel();
 * kernel.use(new CacheServicePlugin({ adapter: 'memory', memory: { maxSize: 1000 } }));
 * await kernel.bootstrap();
 *
 * const cache = kernel.getService('cache');
 * await cache.set('key', 'value', 60);
 * ```
 */
export class CacheServicePlugin implements Plugin {
  name = 'com.objectstack.service.cache';
  version = '1.0.0';
  type = 'standard';

  private readonly options: CacheServicePluginOptions;

  constructor(options: CacheServicePluginOptions = {}) {
    this.options = { adapter: 'memory', ...options };
  }

  async init(ctx: PluginContext): Promise<void> {
    const adapter = this.options.adapter;
    if (adapter === 'redis') {
      // Redis adapter is a skeleton — throw an informative error for now
      throw new Error(
        'Redis cache adapter is not yet implemented. ' +
        'Use adapter: "memory" or provide a custom ICacheService via ctx.registerService("cache", impl).'
      );
    }

    const cache = new MemoryCacheAdapter(this.options.memory);
    ctx.registerService('cache', cache);
    ctx.logger.info('CacheServicePlugin: registered memory cache adapter');
  }
}
