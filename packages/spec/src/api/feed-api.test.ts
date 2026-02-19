import { describe, it, expect } from 'vitest';
import {
  FeedPathParamsSchema,
  FeedItemPathParamsSchema,
  GetFeedRequestSchema,
  GetFeedResponseSchema,
  CreateFeedItemRequestSchema,
  CreateFeedItemResponseSchema,
  UpdateFeedItemRequestSchema,
  UpdateFeedItemResponseSchema,
  DeleteFeedItemRequestSchema,
  DeleteFeedItemResponseSchema,
  AddReactionRequestSchema,
  AddReactionResponseSchema,
  RemoveReactionRequestSchema,
  RemoveReactionResponseSchema,
  SubscribeRequestSchema,
  SubscribeResponseSchema,
  FeedUnsubscribeRequestSchema,
  UnsubscribeResponseSchema,
  FeedApiErrorCode,
  FeedApiContracts,
} from './feed-api.zod';

// ==========================================
// Path Parameters
// ==========================================

describe('FeedPathParamsSchema', () => {
  it('should accept valid path params', () => {
    const params = FeedPathParamsSchema.parse({
      object: 'account',
      recordId: 'rec_123',
    });
    expect(params.object).toBe('account');
    expect(params.recordId).toBe('rec_123');
  });

  it('should reject missing object', () => {
    expect(() => FeedPathParamsSchema.parse({ recordId: 'rec_123' })).toThrow();
  });

  it('should reject missing recordId', () => {
    expect(() => FeedPathParamsSchema.parse({ object: 'account' })).toThrow();
  });
});

describe('FeedItemPathParamsSchema', () => {
  it('should accept valid item path params', () => {
    const params = FeedItemPathParamsSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      feedId: 'feed_001',
    });
    expect(params.feedId).toBe('feed_001');
  });

  it('should reject missing feedId', () => {
    expect(() =>
      FeedItemPathParamsSchema.parse({ object: 'account', recordId: 'rec_123' })
    ).toThrow();
  });
});

// ==========================================
// Feed List (GET)
// ==========================================

describe('GetFeedRequestSchema', () => {
  it('should accept request with defaults', () => {
    const req = GetFeedRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
    });
    expect(req.type).toBe('all');
    expect(req.limit).toBe(20);
    expect(req.cursor).toBeUndefined();
  });

  it('should accept request with all fields', () => {
    const req = GetFeedRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      type: 'comments_only',
      limit: 50,
      cursor: 'cursor_abc',
    });
    expect(req.type).toBe('comments_only');
    expect(req.limit).toBe(50);
    expect(req.cursor).toBe('cursor_abc');
  });

  it('should reject limit exceeding max', () => {
    expect(() =>
      GetFeedRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        limit: 200,
      })
    ).toThrow();
  });

  it('should reject limit below min', () => {
    expect(() =>
      GetFeedRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        limit: 0,
      })
    ).toThrow();
  });

  it('should reject invalid filter type', () => {
    expect(() =>
      GetFeedRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        type: 'invalid_filter',
      })
    ).toThrow();
  });
});

describe('GetFeedResponseSchema', () => {
  it('should accept valid response with items', () => {
    const resp = GetFeedResponseSchema.parse({
      success: true,
      data: {
        items: [
          {
            id: 'feed_001',
            type: 'comment',
            object: 'account',
            recordId: 'rec_123',
            actor: { type: 'user', id: 'user_456', name: 'John Smith' },
            body: 'Great progress!',
            createdAt: '2026-01-15T10:30:00Z',
          },
        ],
        hasMore: false,
      },
    });
    expect(resp.data.items).toHaveLength(1);
    expect(resp.data.items[0].type).toBe('comment');
    expect(resp.data.hasMore).toBe(false);
  });

  it('should accept response with pagination', () => {
    const resp = GetFeedResponseSchema.parse({
      success: true,
      data: {
        items: [],
        total: 42,
        nextCursor: 'cursor_next',
        hasMore: true,
      },
    });
    expect(resp.data.total).toBe(42);
    expect(resp.data.nextCursor).toBe('cursor_next');
    expect(resp.data.hasMore).toBe(true);
  });

  it('should reject missing hasMore', () => {
    expect(() =>
      GetFeedResponseSchema.parse({
        success: true,
        data: { items: [] },
      })
    ).toThrow();
  });
});

// ==========================================
// Feed Create (POST)
// ==========================================

describe('CreateFeedItemRequestSchema', () => {
  it('should accept minimal comment request', () => {
    const req = CreateFeedItemRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      type: 'comment',
      body: 'Hello!',
    });
    expect(req.type).toBe('comment');
    expect(req.body).toBe('Hello!');
    expect(req.visibility).toBe('public');
  });

  it('should accept comment with mentions and visibility', () => {
    const req = CreateFeedItemRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      type: 'comment',
      body: 'Hey @jane',
      mentions: [
        { type: 'user', id: 'user_789', name: 'Jane Doe', offset: 4, length: 5 },
      ],
      visibility: 'internal',
    });
    expect(req.mentions).toHaveLength(1);
    expect(req.visibility).toBe('internal');
  });

  it('should accept threaded reply', () => {
    const req = CreateFeedItemRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      type: 'comment',
      body: 'Reply text',
      parentId: 'feed_001',
    });
    expect(req.parentId).toBe('feed_001');
  });

  it('should reject missing type', () => {
    expect(() =>
      CreateFeedItemRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        body: 'Hello',
      })
    ).toThrow();
  });

  it('should reject invalid feed item type', () => {
    expect(() =>
      CreateFeedItemRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        type: 'unknown_type',
      })
    ).toThrow();
  });
});

describe('CreateFeedItemResponseSchema', () => {
  it('should accept valid creation response', () => {
    const resp = CreateFeedItemResponseSchema.parse({
      success: true,
      data: {
        id: 'feed_002',
        type: 'comment',
        object: 'account',
        recordId: 'rec_123',
        actor: { type: 'user', id: 'user_456', name: 'John' },
        body: 'New comment',
        createdAt: '2026-01-15T11:00:00Z',
      },
    });
    expect(resp.data.id).toBe('feed_002');
  });
});

// ==========================================
// Feed Update (PUT)
// ==========================================

describe('UpdateFeedItemRequestSchema', () => {
  it('should accept body update', () => {
    const req = UpdateFeedItemRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      feedId: 'feed_001',
      body: 'Updated comment',
    });
    expect(req.body).toBe('Updated comment');
    expect(req.feedId).toBe('feed_001');
  });

  it('should accept visibility update', () => {
    const req = UpdateFeedItemRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      feedId: 'feed_001',
      visibility: 'private',
    });
    expect(req.visibility).toBe('private');
  });

  it('should reject missing feedId', () => {
    expect(() =>
      UpdateFeedItemRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        body: 'Updated',
      })
    ).toThrow();
  });
});

describe('UpdateFeedItemResponseSchema', () => {
  it('should accept valid update response', () => {
    const resp = UpdateFeedItemResponseSchema.parse({
      success: true,
      data: {
        id: 'feed_001',
        type: 'comment',
        object: 'account',
        recordId: 'rec_123',
        actor: { type: 'user', id: 'user_456' },
        body: 'Updated comment',
        createdAt: '2026-01-15T10:30:00Z',
        editedAt: '2026-01-15T11:00:00Z',
        isEdited: true,
      },
    });
    expect(resp.data.isEdited).toBe(true);
    expect(resp.data.editedAt).toBeDefined();
  });
});

// ==========================================
// Feed Delete (DELETE)
// ==========================================

describe('DeleteFeedItemRequestSchema', () => {
  it('should accept valid delete params', () => {
    const req = DeleteFeedItemRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      feedId: 'feed_001',
    });
    expect(req.feedId).toBe('feed_001');
  });
});

describe('DeleteFeedItemResponseSchema', () => {
  it('should accept valid delete response', () => {
    const resp = DeleteFeedItemResponseSchema.parse({
      success: true,
      data: { feedId: 'feed_001' },
    });
    expect(resp.data.feedId).toBe('feed_001');
  });

  it('should reject missing feedId in response data', () => {
    expect(() =>
      DeleteFeedItemResponseSchema.parse({
        success: true,
        data: {},
      })
    ).toThrow();
  });
});

// ==========================================
// Reactions
// ==========================================

describe('AddReactionRequestSchema', () => {
  it('should accept valid reaction', () => {
    const req = AddReactionRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      feedId: 'feed_001',
      emoji: '👍',
    });
    expect(req.emoji).toBe('👍');
  });

  it('should accept shortcode emoji', () => {
    const req = AddReactionRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      feedId: 'feed_001',
      emoji: ':thumbsup:',
    });
    expect(req.emoji).toBe(':thumbsup:');
  });

  it('should reject missing emoji', () => {
    expect(() =>
      AddReactionRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        feedId: 'feed_001',
      })
    ).toThrow();
  });
});

describe('AddReactionResponseSchema', () => {
  it('should accept valid reaction response', () => {
    const resp = AddReactionResponseSchema.parse({
      success: true,
      data: {
        reactions: [
          { emoji: '👍', userIds: ['user_456'], count: 1 },
        ],
      },
    });
    expect(resp.data.reactions).toHaveLength(1);
    expect(resp.data.reactions[0].count).toBe(1);
  });
});

describe('RemoveReactionRequestSchema', () => {
  it('should accept valid removal', () => {
    const req = RemoveReactionRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      feedId: 'feed_001',
      emoji: '👍',
    });
    expect(req.emoji).toBe('👍');
  });
});

describe('RemoveReactionResponseSchema', () => {
  it('should accept valid removal response with empty reactions', () => {
    const resp = RemoveReactionResponseSchema.parse({
      success: true,
      data: { reactions: [] },
    });
    expect(resp.data.reactions).toHaveLength(0);
  });
});

// ==========================================
// Subscription
// ==========================================

describe('SubscribeRequestSchema', () => {
  it('should accept request with defaults', () => {
    const req = SubscribeRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
    });
    expect(req.events).toEqual(['all']);
    expect(req.channels).toEqual(['in_app']);
  });

  it('should accept request with specific events and channels', () => {
    const req = SubscribeRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
      events: ['comment', 'field_change'],
      channels: ['in_app', 'email'],
    });
    expect(req.events).toEqual(['comment', 'field_change']);
    expect(req.channels).toEqual(['in_app', 'email']);
  });

  it('should reject invalid event type', () => {
    expect(() =>
      SubscribeRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        events: ['unknown_event'],
      })
    ).toThrow();
  });

  it('should reject invalid channel', () => {
    expect(() =>
      SubscribeRequestSchema.parse({
        object: 'account',
        recordId: 'rec_123',
        channels: ['sms'],
      })
    ).toThrow();
  });
});

describe('SubscribeResponseSchema', () => {
  it('should accept valid subscription response', () => {
    const resp = SubscribeResponseSchema.parse({
      success: true,
      data: {
        object: 'account',
        recordId: 'rec_123',
        userId: 'user_456',
        events: ['comment', 'field_change'],
        channels: ['in_app', 'email'],
        active: true,
        createdAt: '2026-01-15T10:00:00Z',
      },
    });
    expect(resp.data.userId).toBe('user_456');
    expect(resp.data.active).toBe(true);
  });
});

describe('FeedUnsubscribeRequestSchema', () => {
  it('should accept valid unsubscribe params', () => {
    const req = FeedUnsubscribeRequestSchema.parse({
      object: 'account',
      recordId: 'rec_123',
    });
    expect(req.object).toBe('account');
    expect(req.recordId).toBe('rec_123');
  });
});

describe('UnsubscribeResponseSchema', () => {
  it('should accept valid unsubscribe response', () => {
    const resp = UnsubscribeResponseSchema.parse({
      success: true,
      data: {
        object: 'account',
        recordId: 'rec_123',
        unsubscribed: true,
      },
    });
    expect(resp.data.unsubscribed).toBe(true);
  });

  it('should reject missing unsubscribed flag', () => {
    expect(() =>
      UnsubscribeResponseSchema.parse({
        success: true,
        data: {
          object: 'account',
          recordId: 'rec_123',
        },
      })
    ).toThrow();
  });
});

// ==========================================
// Error Codes
// ==========================================

describe('FeedApiErrorCode', () => {
  it('should accept valid error codes', () => {
    expect(FeedApiErrorCode.parse('feed_item_not_found')).toBe('feed_item_not_found');
    expect(FeedApiErrorCode.parse('feed_permission_denied')).toBe('feed_permission_denied');
    expect(FeedApiErrorCode.parse('reaction_already_exists')).toBe('reaction_already_exists');
  });

  it('should reject invalid error code', () => {
    expect(() => FeedApiErrorCode.parse('unknown_error')).toThrow();
  });
});

// ==========================================
// Contract Registry
// ==========================================

describe('FeedApiContracts', () => {
  it('should define all 8 endpoints', () => {
    expect(Object.keys(FeedApiContracts)).toHaveLength(8);
  });

  it('should have correct HTTP methods', () => {
    expect(FeedApiContracts.listFeed.method).toBe('GET');
    expect(FeedApiContracts.createFeedItem.method).toBe('POST');
    expect(FeedApiContracts.updateFeedItem.method).toBe('PUT');
    expect(FeedApiContracts.deleteFeedItem.method).toBe('DELETE');
    expect(FeedApiContracts.addReaction.method).toBe('POST');
    expect(FeedApiContracts.removeReaction.method).toBe('DELETE');
    expect(FeedApiContracts.subscribe.method).toBe('POST');
    expect(FeedApiContracts.unsubscribe.method).toBe('DELETE');
  });

  it('should have valid paths', () => {
    expect(FeedApiContracts.listFeed.path).toContain('/feed');
    expect(FeedApiContracts.addReaction.path).toContain('/reactions');
    expect(FeedApiContracts.subscribe.path).toContain('/subscribe');
  });
});
