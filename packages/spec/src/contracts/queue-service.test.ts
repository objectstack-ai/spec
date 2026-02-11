import { describe, it, expect } from 'vitest';
import type { IQueueService, QueueMessage, QueueHandler } from './queue-service';

describe('Queue Service Contract', () => {
  it('should allow a minimal IQueueService implementation with required methods', () => {
    const queue: IQueueService = {
      publish: async (_queue, _data, _options?) => 'msg-1',
      subscribe: async (_queue, _handler) => {},
      unsubscribe: async (_queue) => {},
    };

    expect(typeof queue.publish).toBe('function');
    expect(typeof queue.subscribe).toBe('function');
    expect(typeof queue.unsubscribe).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const queue: IQueueService = {
      publish: async () => 'msg-1',
      subscribe: async () => {},
      unsubscribe: async () => {},
      getQueueSize: async (_queue) => 0,
      purge: async (_queue) => {},
    };

    expect(queue.getQueueSize).toBeDefined();
    expect(queue.purge).toBeDefined();
  });

  it('should publish and subscribe to messages', async () => {
    const queues = new Map<string, QueueMessage[]>();
    const handlers = new Map<string, QueueHandler>();
    let msgCounter = 0;

    const queue: IQueueService = {
      publish: async (name, data, _options?) => {
        const id = `msg-${++msgCounter}`;
        const msg: QueueMessage = {
          id,
          data,
          attempts: 0,
          timestamp: Date.now(),
        };
        if (!queues.has(name)) queues.set(name, []);
        queues.get(name)!.push(msg);

        // Process immediately if handler registered
        const handler = handlers.get(name);
        if (handler) await handler(msg);

        return id;
      },
      subscribe: async (name, handler) => {
        handlers.set(name, handler as QueueHandler);
      },
      unsubscribe: async (name) => {
        handlers.delete(name);
      },
    };

    const received: QueueMessage[] = [];
    await queue.subscribe('orders', async (msg) => {
      received.push(msg);
    });

    const id = await queue.publish('orders', { orderId: 123, total: 99.99 });
    expect(id).toBe('msg-1');
    expect(received).toHaveLength(1);
    expect(received[0].data).toEqual({ orderId: 123, total: 99.99 });
  });

  it('should unsubscribe from a queue', async () => {
    const handlers = new Map<string, QueueHandler>();

    const queue: IQueueService = {
      publish: async (name, data) => {
        const handler = handlers.get(name);
        if (handler) await handler({ id: '1', data, attempts: 0, timestamp: Date.now() });
        return '1';
      },
      subscribe: async (name, handler) => {
        handlers.set(name, handler as QueueHandler);
      },
      unsubscribe: async (name) => {
        handlers.delete(name);
      },
    };

    const received: unknown[] = [];
    await queue.subscribe('events', async (msg) => { received.push(msg.data); });
    await queue.publish('events', 'hello');
    expect(received).toHaveLength(1);

    await queue.unsubscribe('events');
    await queue.publish('events', 'world');
    expect(received).toHaveLength(1); // No new messages after unsubscribe
  });

  it('should support getQueueSize and purge', async () => {
    const messages = new Map<string, unknown[]>();

    const queue: IQueueService = {
      publish: async (name, data) => {
        if (!messages.has(name)) messages.set(name, []);
        messages.get(name)!.push(data);
        return `msg-${messages.get(name)!.length}`;
      },
      subscribe: async () => {},
      unsubscribe: async () => {},
      getQueueSize: async (name) => messages.get(name)?.length ?? 0,
      purge: async (name) => { messages.set(name, []); },
    };

    await queue.publish('jobs', { type: 'email' });
    await queue.publish('jobs', { type: 'sms' });
    expect(await queue.getQueueSize!('jobs')).toBe(2);

    await queue.purge!('jobs');
    expect(await queue.getQueueSize!('jobs')).toBe(0);
  });
});
