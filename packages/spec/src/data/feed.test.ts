import { describe, it, expect } from 'vitest';
import {
  FeedItemType,
  MentionSchema,
  FieldChangeEntrySchema,
  ReactionSchema,
  FeedActorSchema,
  FeedVisibility,
  FeedItemSchema,
  FeedFilterMode,
  type FeedItem,
  type Mention,
  type FieldChangeEntry,
  type Reaction,
  type FeedActor,
} from './feed.zod';

describe('FeedItemType', () => {
  it('should accept all valid feed item types', () => {
    const types = [
      'comment', 'field_change', 'task', 'event', 'email', 'call',
      'note', 'file', 'record_create', 'record_delete', 'approval',
      'sharing', 'system',
    ];
    types.forEach(type => {
      expect(() => FeedItemType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid types', () => {
    expect(() => FeedItemType.parse('unknown')).toThrow();
    expect(() => FeedItemType.parse('')).toThrow();
  });
});

describe('MentionSchema', () => {
  it('should accept a valid user mention', () => {
    const mention: Mention = {
      type: 'user',
      id: 'user_123',
      name: 'Jane Doe',
      offset: 17,
      length: 9,
    };
    const result = MentionSchema.parse(mention);
    expect(result.type).toBe('user');
    expect(result.id).toBe('user_123');
    expect(result.name).toBe('Jane Doe');
    expect(result.offset).toBe(17);
    expect(result.length).toBe(9);
  });

  it('should accept team and record mention types', () => {
    expect(() => MentionSchema.parse({ type: 'team', id: 'team_1', name: 'Engineering', offset: 0, length: 12 })).not.toThrow();
    expect(() => MentionSchema.parse({ type: 'record', id: 'rec_1', name: 'Acme Corp', offset: 5, length: 9 })).not.toThrow();
  });

  it('should reject invalid mention type', () => {
    expect(() => MentionSchema.parse({ type: 'group', id: '1', name: 'X', offset: 0, length: 1 })).toThrow();
  });

  it('should reject negative offset', () => {
    expect(() => MentionSchema.parse({ type: 'user', id: '1', name: 'X', offset: -1, length: 1 })).toThrow();
  });

  it('should reject zero length', () => {
    expect(() => MentionSchema.parse({ type: 'user', id: '1', name: 'X', offset: 0, length: 0 })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => MentionSchema.parse({})).toThrow();
    expect(() => MentionSchema.parse({ type: 'user' })).toThrow();
  });
});

describe('FieldChangeEntrySchema', () => {
  it('should accept minimal field change', () => {
    const result = FieldChangeEntrySchema.parse({ field: 'status' });
    expect(result.field).toBe('status');
    expect(result.oldValue).toBeUndefined();
    expect(result.newValue).toBeUndefined();
  });

  it('should accept full field change with display values', () => {
    const change: FieldChangeEntry = {
      field: 'region',
      fieldLabel: 'Region',
      oldValue: null,
      newValue: 'asia_pacific',
      oldDisplayValue: '',
      newDisplayValue: 'Asia-Pacific',
    };
    const result = FieldChangeEntrySchema.parse(change);
    expect(result.fieldLabel).toBe('Region');
    expect(result.newDisplayValue).toBe('Asia-Pacific');
  });

  it('should reject without field name', () => {
    expect(() => FieldChangeEntrySchema.parse({})).toThrow();
  });
});

describe('ReactionSchema', () => {
  it('should accept valid reaction', () => {
    const reaction: Reaction = {
      emoji: '👍',
      userIds: ['user_1', 'user_2'],
      count: 2,
    };
    const result = ReactionSchema.parse(reaction);
    expect(result.emoji).toBe('👍');
    expect(result.userIds).toHaveLength(2);
    expect(result.count).toBe(2);
  });

  it('should reject count less than 1', () => {
    expect(() => ReactionSchema.parse({ emoji: '👍', userIds: [], count: 0 })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => ReactionSchema.parse({})).toThrow();
    expect(() => ReactionSchema.parse({ emoji: '👍' })).toThrow();
  });
});

describe('FeedActorSchema', () => {
  it('should accept user actor', () => {
    const actor: FeedActor = {
      type: 'user',
      id: 'user_456',
      name: 'John Smith',
    };
    const result = FeedActorSchema.parse(actor);
    expect(result.type).toBe('user');
    expect(result.name).toBe('John Smith');
  });

  it('should accept system actor with source', () => {
    const result = FeedActorSchema.parse({
      type: 'system',
      id: 'sys_001',
      source: 'Omni',
    });
    expect(result.type).toBe('system');
    expect(result.source).toBe('Omni');
  });

  it('should accept all actor types', () => {
    const types = ['user', 'system', 'service', 'automation'];
    types.forEach(type => {
      expect(() => FeedActorSchema.parse({ type, id: 'test_1' })).not.toThrow();
    });
  });

  it('should accept actor with avatarUrl', () => {
    const result = FeedActorSchema.parse({
      type: 'user',
      id: 'user_1',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(result.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('should reject invalid actor type', () => {
    expect(() => FeedActorSchema.parse({ type: 'bot', id: '1' })).toThrow();
  });
});

describe('FeedVisibility', () => {
  it('should accept valid visibility levels', () => {
    ['public', 'internal', 'private'].forEach(v => {
      expect(() => FeedVisibility.parse(v)).not.toThrow();
    });
  });

  it('should reject invalid visibility', () => {
    expect(() => FeedVisibility.parse('secret')).toThrow();
  });
});

describe('FeedFilterMode', () => {
  it('should accept valid filter modes', () => {
    ['all', 'comments_only', 'changes_only', 'tasks_only'].forEach(mode => {
      expect(() => FeedFilterMode.parse(mode)).not.toThrow();
    });
  });

  it('should reject invalid filter mode', () => {
    expect(() => FeedFilterMode.parse('custom')).toThrow();
  });
});

describe('FeedItemSchema', () => {
  const minimalComment: FeedItem = {
    id: 'feed_001',
    type: 'comment',
    object: 'account',
    recordId: 'rec_123',
    actor: { type: 'user', id: 'user_456', name: 'John Smith' },
    body: 'Great progress on this deal!',
    createdAt: '2026-01-15T10:30:00Z',
  };

  it('should accept a minimal comment feed item', () => {
    const result = FeedItemSchema.parse(minimalComment);
    expect(result.id).toBe('feed_001');
    expect(result.type).toBe('comment');
    expect(result.object).toBe('account');
    expect(result.recordId).toBe('rec_123');
    expect(result.body).toBe('Great progress on this deal!');
    expect(result.replyCount).toBe(0);
    expect(result.visibility).toBe('public');
    expect(result.isEdited).toBe(false);
  });

  it('should accept a comment with mentions', () => {
    const result = FeedItemSchema.parse({
      ...minimalComment,
      mentions: [
        { type: 'user', id: 'user_789', name: 'Jane Doe', offset: 17, length: 9 },
      ],
    });
    expect(result.mentions).toHaveLength(1);
    expect(result.mentions![0].name).toBe('Jane Doe');
  });

  it('should accept a field_change feed item with changes', () => {
    const fieldChange: FeedItem = {
      id: 'feed_002',
      type: 'field_change',
      object: 'account',
      recordId: 'rec_123',
      actor: { type: 'user', id: 'user_456', name: 'John Smith' },
      changes: [
        { field: 'status', oldDisplayValue: 'New', newDisplayValue: 'Active' },
        { field: 'region', oldDisplayValue: '', newDisplayValue: 'Asia-Pacific' },
      ],
      createdAt: '2026-01-15T10:25:00Z',
    };
    const result = FeedItemSchema.parse(fieldChange);
    expect(result.type).toBe('field_change');
    expect(result.changes).toHaveLength(2);
    expect(result.changes![0].field).toBe('status');
  });

  it('should accept a threaded reply', () => {
    const result = FeedItemSchema.parse({
      ...minimalComment,
      id: 'feed_003',
      parentId: 'feed_001',
    });
    expect(result.parentId).toBe('feed_001');
  });

  it('should accept edited comment', () => {
    const result = FeedItemSchema.parse({
      ...minimalComment,
      isEdited: true,
      editedAt: '2026-01-15T11:00:00Z',
    });
    expect(result.isEdited).toBe(true);
    expect(result.editedAt).toBe('2026-01-15T11:00:00Z');
  });

  it('should accept reactions on a feed item', () => {
    const result = FeedItemSchema.parse({
      ...minimalComment,
      reactions: [
        { emoji: '👍', userIds: ['user_789'], count: 1 },
        { emoji: '❤️', userIds: ['user_101', 'user_102'], count: 2 },
      ],
    });
    expect(result.reactions).toHaveLength(2);
  });

  it('should accept internal visibility', () => {
    const result = FeedItemSchema.parse({
      ...minimalComment,
      visibility: 'internal',
    });
    expect(result.visibility).toBe('internal');
  });

  it('should accept system actor with source', () => {
    const result = FeedItemSchema.parse({
      ...minimalComment,
      actor: { type: 'system', id: 'sys_001', source: 'API' },
    });
    expect(result.actor.type).toBe('system');
    expect(result.actor.source).toBe('API');
  });

  it('should accept all feed item types', () => {
    const types = [
      'comment', 'field_change', 'task', 'event', 'email', 'call',
      'note', 'file', 'record_create', 'record_delete', 'approval',
      'sharing', 'system',
    ];
    types.forEach(type => {
      expect(() => FeedItemSchema.parse({
        id: `feed_${type}`,
        type,
        object: 'account',
        recordId: 'rec_1',
        actor: { type: 'user', id: 'user_1' },
        createdAt: '2026-01-15T10:00:00Z',
      })).not.toThrow();
    });
  });

  it('should apply default values', () => {
    const result = FeedItemSchema.parse({
      id: 'feed_def',
      type: 'note',
      object: 'lead',
      recordId: 'rec_1',
      actor: { type: 'user', id: 'user_1' },
      createdAt: '2026-01-15T10:00:00Z',
    });
    expect(result.replyCount).toBe(0);
    expect(result.visibility).toBe('public');
    expect(result.isEdited).toBe(false);
  });

  it('should reject without required fields', () => {
    expect(() => FeedItemSchema.parse({})).toThrow();
    expect(() => FeedItemSchema.parse({ id: 'x' })).toThrow();
    expect(() => FeedItemSchema.parse({ id: 'x', type: 'comment' })).toThrow();
  });

  it('should reject invalid datetime format', () => {
    expect(() => FeedItemSchema.parse({
      ...minimalComment,
      createdAt: 'not-a-date',
    })).toThrow();
  });
});
