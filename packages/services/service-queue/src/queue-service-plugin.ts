// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Plugin, PluginContext } from '@objectstack/core';
import { MemoryQueueAdapter } from './memory-queue-adapter.js';
import type { MemoryQueueAdapterOptions } from './memory-queue-adapter.js';

/**
 * Configuration options for the QueueServicePlugin.
 */
export interface QueueServicePluginOptions {
  /** Queue adapter type (default: 'memory') */
  adapter?: 'memory' | 'bullmq';
  /** Options for the memory queue adapter */
  memory?: MemoryQueueAdapterOptions;
  /** Redis connection URL (used when adapter is 'bullmq') */
  redisUrl?: string;
}

/**
 * QueueServicePlugin — Production IQueueService implementation.
 *
 * Registers a queue service with the kernel during the init phase.
 * Supports in-memory and BullMQ adapters.
 *
 * @example
 * ```ts
 * import { ObjectKernel } from '@objectstack/core';
 * import { QueueServicePlugin } from '@objectstack/service-queue';
 *
 * const kernel = new ObjectKernel();
 * kernel.use(new QueueServicePlugin({ adapter: 'memory' }));
 * await kernel.bootstrap();
 *
 * const queue = kernel.getService('queue');
 * await queue.publish('orders', { orderId: 123 });
 * ```
 */
export class QueueServicePlugin implements Plugin {
  name = 'com.objectstack.service.queue';
  version = '1.0.0';
  type = 'standard';

  private readonly options: QueueServicePluginOptions;

  constructor(options: QueueServicePluginOptions = {}) {
    this.options = { adapter: 'memory', ...options };
  }

  async init(ctx: PluginContext): Promise<void> {
    const adapter = this.options.adapter;
    if (adapter === 'bullmq') {
      throw new Error(
        'BullMQ queue adapter is not yet implemented. ' +
        'Use adapter: "memory" or provide a custom IQueueService via ctx.registerService("queue", impl).'
      );
    }

    const queue = new MemoryQueueAdapter(this.options.memory);
    ctx.registerService('queue', queue);
    ctx.logger.info('QueueServicePlugin: registered memory queue adapter');
  }
}
