// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * In-memory publish/subscribe queue fallback.
 *
 * Implements the IQueueService contract with synchronous in-process delivery.
 * Used by ObjectKernel as an automatic fallback when no real queue plugin
 * (e.g. BullMQ / RabbitMQ) is registered.
 */
export function createMemoryQueue() {
  const handlers = new Map<string, Function[]>();
  let msgId = 0;
  return {
    _fallback: true, _serviceName: 'queue',
    async publish<T = unknown>(queue: string, data: T): Promise<string> {
      const id = `fallback-msg-${++msgId}`;
      const fns = handlers.get(queue) ?? [];
      for (const fn of fns) fn({ id, data, attempts: 1, timestamp: Date.now() });
      return id;
    },
    async subscribe(queue: string, handler: (msg: any) => Promise<void>): Promise<void> {
      handlers.set(queue, [...(handlers.get(queue) ?? []), handler]);
    },
    async unsubscribe(queue: string): Promise<void> { handlers.delete(queue); },
    async getQueueSize(): Promise<number> { return 0; },
    async purge(queue: string): Promise<void> { handlers.delete(queue); },
  };
}
