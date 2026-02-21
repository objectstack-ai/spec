// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { BaseResponseSchema } from './contract.zod';
import {
  FeedItemType,
  FeedItemSchema,
  FeedVisibility,
  MentionSchema,
  ReactionSchema,
  FieldChangeEntrySchema,
} from '../data/feed.zod';
import {
  SubscriptionEventType,
  NotificationChannel,
  RecordSubscriptionSchema,
} from '../data/subscription.zod';

/**
 * Feed / Chatter API Protocol
 *
 * Defines the HTTP interface for the unified activity timeline (Feed).
 * Covers Feed CRUD, Emoji Reactions, Pin/Star, Search, Changelog,
 * and Record Subscription endpoints.
 *
 * Base path: /api/data/{object}/{recordId}/feed
 *
 * @example Endpoints
 * GET    /api/data/{object}/{recordId}/feed                        — List feed items
 * POST   /api/data/{object}/{recordId}/feed                        — Create feed item
 * PUT    /api/data/{object}/{recordId}/feed/{feedId}               — Update feed item
 * DELETE /api/data/{object}/{recordId}/feed/{feedId}               — Delete feed item
 * POST   /api/data/{object}/{recordId}/feed/{feedId}/reactions     — Add reaction
 * DELETE /api/data/{object}/{recordId}/feed/{feedId}/reactions/{emoji} — Remove reaction
 * POST   /api/data/{object}/{recordId}/feed/{feedId}/pin           — Pin feed item
 * DELETE /api/data/{object}/{recordId}/feed/{feedId}/pin           — Unpin feed item
 * POST   /api/data/{object}/{recordId}/feed/{feedId}/star          — Star feed item
 * DELETE /api/data/{object}/{recordId}/feed/{feedId}/star          — Unstar feed item
 * GET    /api/data/{object}/{recordId}/feed/search                 — Search feed items
 * GET    /api/data/{object}/{recordId}/changelog                   — Get field-level changelog
 * POST   /api/data/{object}/{recordId}/subscribe                   — Subscribe
 * DELETE /api/data/{object}/{recordId}/subscribe                   — Unsubscribe
 */

// ==========================================
// 1. Path Parameters
// ==========================================

/**
 * Common path parameters shared across all feed endpoints.
 */
export const FeedPathParamsSchema = z.object({
  object: z.string().describe('Object name (e.g., "account")'),
  recordId: z.string().describe('Record ID'),
});
export type FeedPathParams = z.infer<typeof FeedPathParamsSchema>;

/**
 * Path parameters for single-feed-item operations (update, delete).
 */
export const FeedItemPathParamsSchema = FeedPathParamsSchema.extend({
  feedId: z.string().describe('Feed item ID'),
});
export type FeedItemPathParams = z.infer<typeof FeedItemPathParamsSchema>;

// ==========================================
// 2. Feed List (GET)
// ==========================================

/**
 * Feed filter type for the list query.
 * Maps to FeedFilterMode: all | comments_only | changes_only | tasks_only
 */
export const FeedListFilterType = z.enum([
  'all',
  'comments_only',
  'changes_only',
  'tasks_only',
]);

/**
 * Query parameters for listing feed items.
 *
 * @example GET /api/data/account/rec_123/feed?type=all&limit=20&cursor=xxx
 */
export const GetFeedRequestSchema = FeedPathParamsSchema.extend({
  type: FeedListFilterType.default('all')
    .describe('Filter by feed item category'),
  limit: z.number().int().min(1).max(100).default(20)
    .describe('Maximum number of items to return'),
  cursor: z.string().optional()
    .describe('Cursor for pagination (opaque string from previous response)'),
});
export type GetFeedRequest = z.infer<typeof GetFeedRequestSchema>;

/**
 * Response for the feed list endpoint.
 */
export const GetFeedResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    items: z.array(FeedItemSchema).describe('Feed items in reverse chronological order'),
    total: z.number().int().optional().describe('Total feed items matching filter'),
    nextCursor: z.string().optional().describe('Cursor for the next page'),
    hasMore: z.boolean().describe('Whether more items are available'),
  }),
});
export type GetFeedResponse = z.infer<typeof GetFeedResponseSchema>;

// ==========================================
// 3. Feed Create (POST)
// ==========================================

/**
 * Request body for creating a new feed item (comment, note, task, etc.).
 *
 * @example POST /api/data/account/rec_123/feed
 * { type: 'comment', body: 'Great progress! @jane can you follow up?', mentions: [...] }
 */
export const CreateFeedItemRequestSchema = FeedPathParamsSchema.extend({
  type: FeedItemType.describe('Type of feed item to create'),
  body: z.string().optional()
    .describe('Rich text body (Markdown supported)'),
  mentions: z.array(MentionSchema).optional()
    .describe('Mentioned users, teams, or records'),
  parentId: z.string().optional()
    .describe('Parent feed item ID for threaded replies'),
  visibility: FeedVisibility.default('public')
    .describe('Visibility: public, internal, or private'),
});
export type CreateFeedItemRequest = z.infer<typeof CreateFeedItemRequestSchema>;

/**
 * Response after creating a feed item.
 */
export const CreateFeedItemResponseSchema = BaseResponseSchema.extend({
  data: FeedItemSchema.describe('The created feed item'),
});
export type CreateFeedItemResponse = z.infer<typeof CreateFeedItemResponseSchema>;

// ==========================================
// 4. Feed Update (PUT)
// ==========================================

/**
 * Request body for updating an existing feed item (e.g., editing a comment).
 *
 * @example PUT /api/data/account/rec_123/feed/feed_001
 * { body: 'Updated comment text', mentions: [...] }
 */
export const UpdateFeedItemRequestSchema = FeedItemPathParamsSchema.extend({
  body: z.string().optional()
    .describe('Updated rich text body'),
  mentions: z.array(MentionSchema).optional()
    .describe('Updated mentions'),
  visibility: FeedVisibility.optional()
    .describe('Updated visibility'),
});
export type UpdateFeedItemRequest = z.infer<typeof UpdateFeedItemRequestSchema>;

/**
 * Response after updating a feed item.
 */
export const UpdateFeedItemResponseSchema = BaseResponseSchema.extend({
  data: FeedItemSchema.describe('The updated feed item'),
});
export type UpdateFeedItemResponse = z.infer<typeof UpdateFeedItemResponseSchema>;

// ==========================================
// 5. Feed Delete (DELETE)
// ==========================================

/**
 * Request parameters for deleting a feed item.
 *
 * @example DELETE /api/data/account/rec_123/feed/feed_001
 */
export const DeleteFeedItemRequestSchema = FeedItemPathParamsSchema;
export type DeleteFeedItemRequest = z.infer<typeof DeleteFeedItemRequestSchema>;

/**
 * Response after deleting a feed item.
 */
export const DeleteFeedItemResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    feedId: z.string().describe('ID of the deleted feed item'),
  }),
});
export type DeleteFeedItemResponse = z.infer<typeof DeleteFeedItemResponseSchema>;

// ==========================================
// 6. Reactions (POST / DELETE)
// ==========================================

/**
 * Request for adding an emoji reaction to a feed item.
 *
 * @example POST /api/data/account/rec_123/feed/feed_001/reactions
 * { emoji: '👍' }
 */
export const AddReactionRequestSchema = FeedItemPathParamsSchema.extend({
  emoji: z.string().describe('Emoji character or shortcode (e.g., "👍", ":thumbsup:")'),
});
export type AddReactionRequest = z.infer<typeof AddReactionRequestSchema>;

/**
 * Response after adding a reaction.
 */
export const AddReactionResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    reactions: z.array(ReactionSchema).describe('Updated reaction list for the feed item'),
  }),
});
export type AddReactionResponse = z.infer<typeof AddReactionResponseSchema>;

/**
 * Request for removing an emoji reaction from a feed item.
 *
 * @example DELETE /api/data/account/rec_123/feed/feed_001/reactions/👍
 */
export const RemoveReactionRequestSchema = FeedItemPathParamsSchema.extend({
  emoji: z.string().describe('Emoji character or shortcode to remove'),
});
export type RemoveReactionRequest = z.infer<typeof RemoveReactionRequestSchema>;

/**
 * Response after removing a reaction.
 */
export const RemoveReactionResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    reactions: z.array(ReactionSchema).describe('Updated reaction list for the feed item'),
  }),
});
export type RemoveReactionResponse = z.infer<typeof RemoveReactionResponseSchema>;

// ==========================================
// 7. Pin / Star
// ==========================================

/**
 * Request for pinning a feed item to the top of the timeline.
 *
 * @example POST /api/data/account/rec_123/feed/feed_001/pin
 */
export const PinFeedItemRequestSchema = FeedItemPathParamsSchema;
export type PinFeedItemRequest = z.infer<typeof PinFeedItemRequestSchema>;

/**
 * Response after pinning a feed item.
 */
export const PinFeedItemResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    feedId: z.string().describe('ID of the pinned feed item'),
    pinned: z.boolean().describe('Whether the item is now pinned'),
    pinnedAt: z.string().datetime().describe('Timestamp when pinned'),
  }),
});
export type PinFeedItemResponse = z.infer<typeof PinFeedItemResponseSchema>;

/**
 * Request for unpinning a feed item.
 *
 * @example DELETE /api/data/account/rec_123/feed/feed_001/pin
 */
export const UnpinFeedItemRequestSchema = FeedItemPathParamsSchema;
export type UnpinFeedItemRequest = z.infer<typeof UnpinFeedItemRequestSchema>;

/**
 * Response after unpinning a feed item.
 */
export const UnpinFeedItemResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    feedId: z.string().describe('ID of the unpinned feed item'),
    pinned: z.boolean().describe('Whether the item is now pinned (should be false)'),
  }),
});
export type UnpinFeedItemResponse = z.infer<typeof UnpinFeedItemResponseSchema>;

/**
 * Request for starring (bookmarking) a feed item.
 *
 * @example POST /api/data/account/rec_123/feed/feed_001/star
 */
export const StarFeedItemRequestSchema = FeedItemPathParamsSchema;
export type StarFeedItemRequest = z.infer<typeof StarFeedItemRequestSchema>;

/**
 * Response after starring a feed item.
 */
export const StarFeedItemResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    feedId: z.string().describe('ID of the starred feed item'),
    starred: z.boolean().describe('Whether the item is now starred'),
    starredAt: z.string().datetime().describe('Timestamp when starred'),
  }),
});
export type StarFeedItemResponse = z.infer<typeof StarFeedItemResponseSchema>;

/**
 * Request for unstarring a feed item.
 *
 * @example DELETE /api/data/account/rec_123/feed/feed_001/star
 */
export const UnstarFeedItemRequestSchema = FeedItemPathParamsSchema;
export type UnstarFeedItemRequest = z.infer<typeof UnstarFeedItemRequestSchema>;

/**
 * Response after unstarring a feed item.
 */
export const UnstarFeedItemResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    feedId: z.string().describe('ID of the unstarred feed item'),
    starred: z.boolean().describe('Whether the item is now starred (should be false)'),
  }),
});
export type UnstarFeedItemResponse = z.infer<typeof UnstarFeedItemResponseSchema>;

// ==========================================
// 8. Activity Feed Search & Filter
// ==========================================

/**
 * Request for searching feed items with full-text query and advanced filters.
 *
 * @example GET /api/data/account/rec_123/feed/search?query=follow+up&actorId=user_456&dateFrom=2026-01-01T00:00:00Z
 */
export const SearchFeedRequestSchema = FeedPathParamsSchema.extend({
  query: z.string().min(1).describe('Full-text search query against feed body content'),
  type: FeedListFilterType.optional()
    .describe('Filter by feed item category'),
  actorId: z.string().optional()
    .describe('Filter by actor user ID'),
  dateFrom: z.string().datetime().optional()
    .describe('Filter feed items created after this timestamp'),
  dateTo: z.string().datetime().optional()
    .describe('Filter feed items created before this timestamp'),
  hasAttachments: z.boolean().optional()
    .describe('Filter for items with file attachments'),
  pinnedOnly: z.boolean().optional()
    .describe('Return only pinned items'),
  starredOnly: z.boolean().optional()
    .describe('Return only starred items'),
  limit: z.number().int().min(1).max(100).default(20)
    .describe('Maximum number of items to return'),
  cursor: z.string().optional()
    .describe('Cursor for pagination'),
});
export type SearchFeedRequest = z.infer<typeof SearchFeedRequestSchema>;

/**
 * Response for the feed search endpoint.
 */
export const SearchFeedResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    items: z.array(FeedItemSchema).describe('Matching feed items sorted by relevance'),
    total: z.number().int().optional().describe('Total matching items'),
    nextCursor: z.string().optional().describe('Cursor for the next page'),
    hasMore: z.boolean().describe('Whether more items are available'),
  }),
});
export type SearchFeedResponse = z.infer<typeof SearchFeedResponseSchema>;

// ==========================================
// 9. Changelog (Field-Level Audit Trail)
// ==========================================

/**
 * Request for retrieving the field-level changelog of a record.
 *
 * @example GET /api/data/account/rec_123/changelog?field=status&limit=50
 */
export const GetChangelogRequestSchema = FeedPathParamsSchema.extend({
  field: z.string().optional()
    .describe('Filter changelog to a specific field name'),
  actorId: z.string().optional()
    .describe('Filter changelog by actor user ID'),
  dateFrom: z.string().datetime().optional()
    .describe('Filter changes after this timestamp'),
  dateTo: z.string().datetime().optional()
    .describe('Filter changes before this timestamp'),
  limit: z.number().int().min(1).max(200).default(50)
    .describe('Maximum number of changelog entries to return'),
  cursor: z.string().optional()
    .describe('Cursor for pagination'),
});
export type GetChangelogRequest = z.infer<typeof GetChangelogRequestSchema>;

/**
 * A single changelog entry representing one or more field changes at a point in time.
 */
export const ChangelogEntrySchema = z.object({
  id: z.string().describe('Changelog entry ID'),
  object: z.string().describe('Object name'),
  recordId: z.string().describe('Record ID'),
  actor: z.object({
    type: z.enum(['user', 'system', 'service', 'automation']).describe('Actor type'),
    id: z.string().describe('Actor ID'),
    name: z.string().optional().describe('Actor display name'),
  }).describe('Who made the change'),
  changes: z.array(FieldChangeEntrySchema).min(1).describe('Field-level changes'),
  timestamp: z.string().datetime().describe('When the change occurred'),
  source: z.string().optional().describe('Change source (e.g., "API", "UI", "automation")'),
});
export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema>;

/**
 * Response for the changelog endpoint.
 */
export const GetChangelogResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    entries: z.array(ChangelogEntrySchema).describe('Changelog entries in reverse chronological order'),
    total: z.number().int().optional().describe('Total changelog entries matching filter'),
    nextCursor: z.string().optional().describe('Cursor for the next page'),
    hasMore: z.boolean().describe('Whether more entries are available'),
  }),
});
export type GetChangelogResponse = z.infer<typeof GetChangelogResponseSchema>;

// ==========================================
// 10. Record Subscription (POST / DELETE)
// ==========================================

/**
 * Request for subscribing to record notifications.
 *
 * @example POST /api/data/account/rec_123/subscribe
 * { events: ['comment', 'field_change'], channels: ['in_app', 'email'] }
 */
export const SubscribeRequestSchema = FeedPathParamsSchema.extend({
  events: z.array(SubscriptionEventType).default(['all'])
    .describe('Event types to subscribe to'),
  channels: z.array(NotificationChannel).default(['in_app'])
    .describe('Notification delivery channels'),
});
export type SubscribeRequest = z.infer<typeof SubscribeRequestSchema>;

/**
 * Response after subscribing.
 */
export const SubscribeResponseSchema = BaseResponseSchema.extend({
  data: RecordSubscriptionSchema.describe('The created or updated subscription'),
});
export type SubscribeResponse = z.infer<typeof SubscribeResponseSchema>;

/**
 * Request for unsubscribing from record notifications.
 *
 * @example DELETE /api/data/account/rec_123/subscribe
 */
export const FeedUnsubscribeRequestSchema = FeedPathParamsSchema;
export type FeedUnsubscribeRequest = z.infer<typeof FeedUnsubscribeRequestSchema>;

/**
 * Response after unsubscribing.
 */
export const UnsubscribeResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    object: z.string().describe('Object name'),
    recordId: z.string().describe('Record ID'),
    unsubscribed: z.boolean().describe('Whether the user was unsubscribed'),
  }),
});
export type UnsubscribeResponse = z.infer<typeof UnsubscribeResponseSchema>;

// ==========================================
// 11. Feed API Error Codes
// ==========================================

/**
 * Error codes specific to Feed/Chatter operations.
 */
export const FeedApiErrorCode = z.enum([
  'feed_item_not_found',
  'feed_permission_denied',
  'feed_item_not_editable',
  'feed_invalid_parent',
  'reaction_already_exists',
  'reaction_not_found',
  'subscription_already_exists',
  'subscription_not_found',
  'invalid_feed_type',
  'feed_already_pinned',
  'feed_not_pinned',
  'feed_already_starred',
  'feed_not_starred',
  'feed_search_query_too_short',
]);
export type FeedApiErrorCode = z.infer<typeof FeedApiErrorCode>;

// ==========================================
// 12. Feed API Contract Registry
// ==========================================

/**
 * Standard Feed API contracts map.
 * Used for generating SDKs, documentation, and route registration.
 */
export const FeedApiContracts = {
  listFeed: {
    method: 'GET' as const,
    path: '/api/data/:object/:recordId/feed',
    input: GetFeedRequestSchema,
    output: GetFeedResponseSchema,
  },
  createFeedItem: {
    method: 'POST' as const,
    path: '/api/data/:object/:recordId/feed',
    input: CreateFeedItemRequestSchema,
    output: CreateFeedItemResponseSchema,
  },
  updateFeedItem: {
    method: 'PUT' as const,
    path: '/api/data/:object/:recordId/feed/:feedId',
    input: UpdateFeedItemRequestSchema,
    output: UpdateFeedItemResponseSchema,
  },
  deleteFeedItem: {
    method: 'DELETE' as const,
    path: '/api/data/:object/:recordId/feed/:feedId',
    input: DeleteFeedItemRequestSchema,
    output: DeleteFeedItemResponseSchema,
  },
  addReaction: {
    method: 'POST' as const,
    path: '/api/data/:object/:recordId/feed/:feedId/reactions',
    input: AddReactionRequestSchema,
    output: AddReactionResponseSchema,
  },
  removeReaction: {
    method: 'DELETE' as const,
    path: '/api/data/:object/:recordId/feed/:feedId/reactions/:emoji',
    input: RemoveReactionRequestSchema,
    output: RemoveReactionResponseSchema,
  },
  pinFeedItem: {
    method: 'POST' as const,
    path: '/api/data/:object/:recordId/feed/:feedId/pin',
    input: PinFeedItemRequestSchema,
    output: PinFeedItemResponseSchema,
  },
  unpinFeedItem: {
    method: 'DELETE' as const,
    path: '/api/data/:object/:recordId/feed/:feedId/pin',
    input: UnpinFeedItemRequestSchema,
    output: UnpinFeedItemResponseSchema,
  },
  starFeedItem: {
    method: 'POST' as const,
    path: '/api/data/:object/:recordId/feed/:feedId/star',
    input: StarFeedItemRequestSchema,
    output: StarFeedItemResponseSchema,
  },
  unstarFeedItem: {
    method: 'DELETE' as const,
    path: '/api/data/:object/:recordId/feed/:feedId/star',
    input: UnstarFeedItemRequestSchema,
    output: UnstarFeedItemResponseSchema,
  },
  searchFeed: {
    method: 'GET' as const,
    path: '/api/data/:object/:recordId/feed/search',
    input: SearchFeedRequestSchema,
    output: SearchFeedResponseSchema,
  },
  getChangelog: {
    method: 'GET' as const,
    path: '/api/data/:object/:recordId/changelog',
    input: GetChangelogRequestSchema,
    output: GetChangelogResponseSchema,
  },
  subscribe: {
    method: 'POST' as const,
    path: '/api/data/:object/:recordId/subscribe',
    input: SubscribeRequestSchema,
    output: SubscribeResponseSchema,
  },
  unsubscribe: {
    method: 'DELETE' as const,
    path: '/api/data/:object/:recordId/subscribe',
    input: FeedUnsubscribeRequestSchema,
    output: UnsubscribeResponseSchema,
  },
};
