// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import type { IFeedService } from './feed-service';

describe('Feed Service Contract', () => {
  it('should allow a minimal IFeedService implementation with all required methods', () => {
    const service: IFeedService = {
      listFeed: async () => ({ items: [], hasMore: false }),
      createFeedItem: async () => ({
        id: 'feed_1',
        type: 'comment',
        object: 'account',
        recordId: 'rec_1',
        actor: { type: 'user', id: 'user_1' },
        visibility: 'public',
        replyCount: 0,
        isEdited: false,
        createdAt: new Date().toISOString(),
      }),
      updateFeedItem: async () => ({
        id: 'feed_1',
        type: 'comment',
        object: 'account',
        recordId: 'rec_1',
        actor: { type: 'user', id: 'user_1' },
        visibility: 'public',
        replyCount: 0,
        isEdited: true,
        createdAt: new Date().toISOString(),
      }),
      deleteFeedItem: async () => {},
      getFeedItem: async () => null,
      addReaction: async () => [],
      removeReaction: async () => [],
      subscribe: async () => ({
        object: 'account',
        recordId: 'rec_1',
        userId: 'user_1',
        events: ['all'],
        channels: ['in_app'],
        active: true,
        createdAt: new Date().toISOString(),
      }),
      unsubscribe: async () => true,
      getSubscription: async () => null,
    };

    expect(typeof service.listFeed).toBe('function');
    expect(typeof service.createFeedItem).toBe('function');
    expect(typeof service.updateFeedItem).toBe('function');
    expect(typeof service.deleteFeedItem).toBe('function');
    expect(typeof service.getFeedItem).toBe('function');
    expect(typeof service.addReaction).toBe('function');
    expect(typeof service.removeReaction).toBe('function');
    expect(typeof service.subscribe).toBe('function');
    expect(typeof service.unsubscribe).toBe('function');
    expect(typeof service.getSubscription).toBe('function');
  });

  it('should create and retrieve a feed item', async () => {
    const items = new Map<string, any>();
    let counter = 0;

    const service: IFeedService = {
      listFeed: async () => ({ items: Array.from(items.values()), hasMore: false }),
      createFeedItem: async (input) => {
        const id = `feed_${++counter}`;
        const item = {
          id,
          type: input.type as any,
          object: input.object,
          recordId: input.recordId,
          actor: input.actor,
          body: input.body,
          visibility: input.visibility ?? 'public',
          replyCount: 0,
          isEdited: false,
          createdAt: new Date().toISOString(),
        };
        items.set(id, item);
        return item;
      },
      updateFeedItem: async () => ({} as any),
      deleteFeedItem: async () => {},
      getFeedItem: async (feedId) => items.get(feedId) ?? null,
      addReaction: async () => [],
      removeReaction: async () => [],
      subscribe: async () => ({} as any),
      unsubscribe: async () => true,
      getSubscription: async () => null,
    };

    const item = await service.createFeedItem({
      object: 'account',
      recordId: 'rec_123',
      type: 'comment',
      actor: { type: 'user', id: 'user_1', name: 'Alice' },
      body: 'Hello world',
    });

    expect(item.id).toBeDefined();
    expect(item.body).toBe('Hello world');

    const fetched = await service.getFeedItem(item.id);
    expect(fetched).toEqual(item);
  });

  it('should list feed items', async () => {
    const service: IFeedService = {
      listFeed: async (options) => ({
        items: [
          {
            id: 'feed_1',
            type: 'comment',
            object: options.object,
            recordId: options.recordId,
            actor: { type: 'user', id: 'user_1' },
            visibility: 'public',
            replyCount: 0,
            isEdited: false,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        hasMore: false,
      }),
      createFeedItem: async () => ({} as any),
      updateFeedItem: async () => ({} as any),
      deleteFeedItem: async () => {},
      getFeedItem: async () => null,
      addReaction: async () => [],
      removeReaction: async () => [],
      subscribe: async () => ({} as any),
      unsubscribe: async () => true,
      getSubscription: async () => null,
    };

    const result = await service.listFeed({ object: 'account', recordId: 'rec_123' });
    expect(result.items).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });

  it('should handle subscribe and unsubscribe', async () => {
    const subs = new Map<string, any>();

    const service: IFeedService = {
      listFeed: async () => ({ items: [], hasMore: false }),
      createFeedItem: async () => ({} as any),
      updateFeedItem: async () => ({} as any),
      deleteFeedItem: async () => {},
      getFeedItem: async () => null,
      addReaction: async () => [],
      removeReaction: async () => [],
      subscribe: async (input) => {
        const sub = {
          object: input.object,
          recordId: input.recordId,
          userId: input.userId,
          events: input.events ?? ['all'],
          channels: input.channels ?? ['in_app'],
          active: true,
          createdAt: new Date().toISOString(),
        };
        subs.set(`${input.object}:${input.recordId}:${input.userId}`, sub);
        return sub;
      },
      unsubscribe: async (object, recordId, userId) => {
        return subs.delete(`${object}:${recordId}:${userId}`);
      },
      getSubscription: async (object, recordId, userId) => {
        return subs.get(`${object}:${recordId}:${userId}`) ?? null;
      },
    };

    const sub = await service.subscribe({
      object: 'account',
      recordId: 'rec_123',
      userId: 'user_1',
      events: ['comment'],
    });
    expect(sub.active).toBe(true);
    expect(sub.events).toEqual(['comment']);

    const fetched = await service.getSubscription('account', 'rec_123', 'user_1');
    expect(fetched).not.toBeNull();

    const result = await service.unsubscribe('account', 'rec_123', 'user_1');
    expect(result).toBe(true);

    const gone = await service.getSubscription('account', 'rec_123', 'user_1');
    expect(gone).toBeNull();
  });
});
