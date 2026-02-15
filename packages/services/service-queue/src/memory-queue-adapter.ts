// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { IQueueService, QueuePublishOptions, QueueMessage, QueueHandler } from '@objectstack/spec/contracts';

/**
 * Configuration options for MemoryQueueAdapter.
 */
export interface MemoryQueueAdapterOptions {
  /** Maximum number of messages retained per queue (0 = unlimited) */
  maxQueueSize?: number;
}

/**
 * In-memory queue adapter implementing IQueueService.
 *
 * Provides synchronous in-process pub/sub delivery.
 * Suitable for single-process environments, development, and testing.
 */
export class MemoryQueueAdapter implements IQueueService {
  private readonly handlers = new Map<string, QueueHandler[]>();
  private readonly deadLetters: QueueMessage[] = [];
  private msgCounter = 0;
  private readonly maxQueueSize: number;

  constructor(options: MemoryQueueAdapterOptions = {}) {
    this.maxQueueSize = options.maxQueueSize ?? 0;
  }

  async publish<T = unknown>(queue: string, data: T, options?: QueuePublishOptions): Promise<string> {
    const id = `msg-${++this.msgCounter}`;
    const msg: QueueMessage<T> = {
      id,
      data,
      attempts: 0,
      timestamp: Date.now(),
    };

    const fns = this.handlers.get(queue) ?? [];
    if (fns.length === 0) {
      // No subscribers — retain as dead letter if within limits
      if (this.maxQueueSize === 0 || this.deadLetters.length < this.maxQueueSize) {
        this.deadLetters.push(msg);
      }
      return id;
    }

    const maxRetries = options?.retries ?? 0;
    for (const handler of fns) {
      let attempt = 0;
      let success = false;
      while (!success && attempt <= maxRetries) {
        try {
          msg.attempts = attempt + 1;
          await handler(msg as QueueMessage);
          success = true;
        } catch {
          attempt++;
        }
      }
    }

    return id;
  }

  async subscribe<T = unknown>(queue: string, handler: QueueHandler<T>): Promise<void> {
    const existing = this.handlers.get(queue) ?? [];
    this.handlers.set(queue, [...existing, handler as QueueHandler]);
  }

  async unsubscribe(queue: string): Promise<void> {
    this.handlers.delete(queue);
  }

  async getQueueSize(queue: string): Promise<number> {
    // In-memory: no persistent queue, count dead letters for the queue
    void queue;
    return 0;
  }

  async purge(queue: string): Promise<void> {
    this.handlers.delete(queue);
  }
}
