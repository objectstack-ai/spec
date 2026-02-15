// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { IQueueService, QueuePublishOptions, QueueHandler } from '@objectstack/spec/contracts';

/**
 * Configuration for the BullMQ queue adapter.
 */
export interface BullMQQueueAdapterOptions {
  /** Redis connection URL (e.g. 'redis://localhost:6379') */
  redisUrl: string;
  /** Default job options */
  defaultJobOptions?: {
    /** Number of retry attempts */
    attempts?: number;
    /** Backoff strategy */
    backoff?: { type: 'fixed' | 'exponential'; delay: number };
  };
}

/**
 * BullMQ queue adapter skeleton implementing IQueueService.
 *
 * This is a placeholder for future BullMQ integration.
 * Concrete implementation will use the `bullmq` package.
 *
 * @example
 * ```ts
 * const queue = new BullMQQueueAdapter({ redisUrl: 'redis://localhost:6379' });
 * await queue.publish('orders', { orderId: 123 });
 * ```
 */
export class BullMQQueueAdapter implements IQueueService {
  private readonly redisUrl: string;

  constructor(options: BullMQQueueAdapterOptions) {
    this.redisUrl = options.redisUrl;
  }

  async publish<T = unknown>(_queue: string, _data: T, _options?: QueuePublishOptions): Promise<string> {
    throw new Error(`BullMQQueueAdapter not yet implemented (url: ${this.redisUrl})`);
  }

  async subscribe<T = unknown>(_queue: string, _handler: QueueHandler<T>): Promise<void> {
    throw new Error('BullMQQueueAdapter not yet implemented');
  }

  async unsubscribe(_queue: string): Promise<void> {
    throw new Error('BullMQQueueAdapter not yet implemented');
  }

  async getQueueSize(_queue: string): Promise<number> {
    throw new Error('BullMQQueueAdapter not yet implemented');
  }

  async purge(_queue: string): Promise<void> {
    throw new Error('BullMQQueueAdapter not yet implemented');
  }
}
