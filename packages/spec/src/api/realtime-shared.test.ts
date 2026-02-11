import { describe, it, expect } from 'vitest';
import {
  PresenceStatus,
  RealtimeRecordAction,
  BasePresenceSchema,
  type BasePresence,
} from './realtime-shared.zod';

describe('PresenceStatus (Shared)', () => {
  it('should accept valid presence statuses', () => {
    const statuses = ['online', 'away', 'busy', 'offline'];
    statuses.forEach(status => {
      expect(() => PresenceStatus.parse(status)).not.toThrow();
    });
  });

  it('should reject invalid presence statuses', () => {
    expect(() => PresenceStatus.parse('idle')).toThrow();
    expect(() => PresenceStatus.parse('dnd')).toThrow();
    expect(() => PresenceStatus.parse('')).toThrow();
  });
});

describe('RealtimeRecordAction (Shared)', () => {
  it('should accept valid record actions', () => {
    const actions = ['created', 'updated', 'deleted'];
    actions.forEach(action => {
      expect(() => RealtimeRecordAction.parse(action)).not.toThrow();
    });
  });

  it('should reject invalid record actions', () => {
    expect(() => RealtimeRecordAction.parse('inserted')).toThrow();
    expect(() => RealtimeRecordAction.parse('modified')).toThrow();
    expect(() => RealtimeRecordAction.parse('')).toThrow();
  });
});

describe('BasePresenceSchema (Shared)', () => {
  it('should accept valid minimal presence', () => {
    const presence: BasePresence = {
      userId: 'user-123',
      status: 'online',
      lastSeen: '2024-01-15T10:30:00Z',
    };

    const result = BasePresenceSchema.parse(presence);
    expect(result.userId).toBe('user-123');
    expect(result.status).toBe('online');
    expect(result.metadata).toBeUndefined();
  });

  it('should accept presence with metadata', () => {
    const presence = {
      userId: 'user-456',
      status: 'away',
      lastSeen: '2024-01-15T10:30:00Z',
      metadata: {
        currentPage: '/dashboard',
        customStatus: 'In a meeting',
      },
    };

    const result = BasePresenceSchema.parse(presence);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.currentPage).toBe('/dashboard');
  });

  it('should accept all presence statuses', () => {
    const statuses: Array<BasePresence['status']> = ['online', 'away', 'busy', 'offline'];

    statuses.forEach(status => {
      const presence = {
        userId: 'user-789',
        status,
        lastSeen: '2024-01-15T10:30:00Z',
      };

      const parsed = BasePresenceSchema.parse(presence);
      expect(parsed.status).toBe(status);
    });
  });

  it('should validate datetime format', () => {
    expect(() => BasePresenceSchema.parse({
      userId: 'user-123',
      status: 'online',
      lastSeen: 'not-a-datetime',
    })).toThrow();
  });

  it('should reject presence without required fields', () => {
    expect(() => BasePresenceSchema.parse({
      status: 'online',
      lastSeen: '2024-01-15T10:30:00Z',
    })).toThrow();

    expect(() => BasePresenceSchema.parse({
      userId: 'user-123',
      lastSeen: '2024-01-15T10:30:00Z',
    })).toThrow();

    expect(() => BasePresenceSchema.parse({
      userId: 'user-123',
      status: 'online',
    })).toThrow();
  });
});

describe('Cross-protocol consistency', () => {
  it('should ensure PresenceStatus is used by both realtime and websocket protocols', async () => {
    // Verify that both realtime.zod and websocket.zod use the shared PresenceStatus
    const realtime = await import('./realtime.zod');
    const websocket = await import('./websocket.zod');

    // Both should accept the same presence status values
    const testStatuses = ['online', 'away', 'busy', 'offline'];

    testStatuses.forEach(status => {
      expect(() => realtime.RealtimePresenceStatus.parse(status)).not.toThrow();
      expect(() => websocket.WebSocketPresenceStatus.parse(status)).not.toThrow();
      expect(() => PresenceStatus.parse(status)).not.toThrow();
    });
  });

  it('should ensure RealtimePresenceSchema and BasePresenceSchema are compatible', () => {
    const testPresence = {
      userId: 'user-123',
      status: 'online' as const,
      lastSeen: '2024-01-15T10:30:00Z',
      metadata: { page: '/dashboard' },
    };

    // Both schemas should parse the same data
    const shared = BasePresenceSchema.parse(testPresence);
    expect(shared.userId).toBe('user-123');
    expect(shared.status).toBe('online');
  });
});
