import { describe, it, expect } from 'vitest';
import type { IRealtimeService, RealtimeEventPayload, RealtimeEventHandler } from './realtime-service';

describe('Realtime Service Contract', () => {
  it('should allow a minimal IRealtimeService implementation with required methods', () => {
    const service: IRealtimeService = {
      publish: async (_event) => {},
      subscribe: async (_channel, _handler, _options?) => 'sub-1',
      unsubscribe: async (_subscriptionId) => {},
    };

    expect(typeof service.publish).toBe('function');
    expect(typeof service.subscribe).toBe('function');
    expect(typeof service.unsubscribe).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IRealtimeService = {
      publish: async () => {},
      subscribe: async () => 'sub-1',
      unsubscribe: async () => {},
      handleUpgrade: async (_request) => new Response('OK'),
    };

    expect(service.handleUpgrade).toBeDefined();
  });

  it('should publish and receive events', async () => {
    const handlers = new Map<string, RealtimeEventHandler[]>();
    let subCounter = 0;

    const service: IRealtimeService = {
      publish: async (event) => {
        for (const [, fns] of handlers) {
          for (const fn of fns) await fn(event);
        }
      },
      subscribe: async (channel, handler) => {
        const id = `sub-${++subCounter}`;
        if (!handlers.has(channel)) handlers.set(channel, []);
        handlers.get(channel)!.push(handler);
        return id;
      },
      unsubscribe: async () => {},
    };

    const received: RealtimeEventPayload[] = [];
    await service.subscribe('records', (event) => { received.push(event); });

    await service.publish({
      type: 'record.created',
      object: 'account',
      payload: { id: 'acc-1', name: 'Acme' },
      timestamp: new Date().toISOString(),
    });

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('record.created');
    expect(received[0].object).toBe('account');
  });

  it('should unsubscribe from events', async () => {
    const subs = new Map<string, RealtimeEventHandler>();
    let subCounter = 0;

    const service: IRealtimeService = {
      publish: async (event) => {
        for (const handler of subs.values()) await handler(event);
      },
      subscribe: async (_channel, handler) => {
        const id = `sub-${++subCounter}`;
        subs.set(id, handler);
        return id;
      },
      unsubscribe: async (subscriptionId) => { subs.delete(subscriptionId); },
    };

    const received: RealtimeEventPayload[] = [];
    const subId = await service.subscribe('records', (event) => { received.push(event); });

    await service.publish({
      type: 'record.updated',
      payload: { id: '1' },
      timestamp: new Date().toISOString(),
    });
    expect(received).toHaveLength(1);

    await service.unsubscribe(subId);

    await service.publish({
      type: 'record.deleted',
      payload: { id: '2' },
      timestamp: new Date().toISOString(),
    });
    expect(received).toHaveLength(1); // No new events after unsubscribe
  });
});
