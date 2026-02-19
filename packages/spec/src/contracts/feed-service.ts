// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IFeedService - Feed/Chatter Service Contract
 *
 * Defines the interface for Feed/Chatter operations in ObjectStack.
 * Covers feed CRUD, emoji reactions, and record subscriptions.
 * Concrete implementations (in-memory, database-backed, etc.)
 * should implement this interface.
 *
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete feed service implementations.
 *
 * Aligned with CoreServiceName 'feed' in core-services.zod.ts.
 */

import type { FeedItem, Reaction } from '../data/feed.zod';
import type { RecordSubscription } from '../data/subscription.zod';

// ==========================================
// Feed Item Types
// ==========================================

/**
 * Input for creating a new feed item.
 */
export interface CreateFeedItemInput {
  /** Object name (e.g., "account") */
  object: string;
  /** Record ID */
  recordId: string;
  /** Feed item type */
  type: string;
  /** Actor information */
  actor: {
    type: 'user' | 'system' | 'service' | 'automation';
    id: string;
    name?: string;
    avatarUrl?: string;
  };
  /** Rich text body (Markdown) */
  body?: string;
  /** @mentions */
  mentions?: Array<{
    type: 'user' | 'team' | 'record';
    id: string;
    name: string;
    offset: number;
    length: number;
  }>;
  /** Field changes (for field_change type) */
  changes?: Array<{
    field: string;
    fieldLabel?: string;
    oldValue?: unknown;
    newValue?: unknown;
    oldDisplayValue?: string;
    newDisplayValue?: string;
  }>;
  /** Parent feed item ID for threaded replies */
  parentId?: string;
  /** Visibility level */
  visibility?: 'public' | 'internal' | 'private';
}

/**
 * Input for updating an existing feed item.
 */
export interface UpdateFeedItemInput {
  /** Updated body text */
  body?: string;
  /** Updated mentions */
  mentions?: Array<{
    type: 'user' | 'team' | 'record';
    id: string;
    name: string;
    offset: number;
    length: number;
  }>;
  /** Updated visibility */
  visibility?: 'public' | 'internal' | 'private';
}

/**
 * Options for listing feed items.
 */
export interface ListFeedOptions {
  /** Object name */
  object: string;
  /** Record ID */
  recordId: string;
  /** Filter mode */
  filter?: 'all' | 'comments_only' | 'changes_only' | 'tasks_only';
  /** Maximum items to return */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
}

/**
 * Paginated feed list result.
 */
export interface FeedListResult {
  /** Feed items in reverse chronological order */
  items: FeedItem[];
  /** Total feed items matching filter */
  total?: number;
  /** Cursor for next page */
  nextCursor?: string;
  /** Whether more items are available */
  hasMore: boolean;
}

// ==========================================
// Subscription Types
// ==========================================

/**
 * Input for subscribing to record notifications.
 */
export interface SubscribeInput {
  /** Object name */
  object: string;
  /** Record ID */
  recordId: string;
  /** Subscribing user ID */
  userId: string;
  /** Event types to subscribe to */
  events?: Array<'comment' | 'mention' | 'field_change' | 'task' | 'approval' | 'all'>;
  /** Notification channels */
  channels?: Array<'in_app' | 'email' | 'push' | 'slack'>;
}

// ==========================================
// Service Interface
// ==========================================

export interface IFeedService {
  // ---- Feed CRUD ----

  /**
   * List feed items for a record.
   * @param options - Filter and pagination options
   * @returns Paginated list of feed items
   */
  listFeed(options: ListFeedOptions): Promise<FeedListResult>;

  /**
   * Create a new feed item.
   * @param input - Feed item data
   * @returns The created feed item
   */
  createFeedItem(input: CreateFeedItemInput): Promise<FeedItem>;

  /**
   * Update an existing feed item (e.g., edit a comment).
   * @param feedId - Feed item ID
   * @param input - Updated fields
   * @returns The updated feed item
   */
  updateFeedItem(feedId: string, input: UpdateFeedItemInput): Promise<FeedItem>;

  /**
   * Delete a feed item.
   * @param feedId - Feed item ID
   */
  deleteFeedItem(feedId: string): Promise<void>;

  /**
   * Get a single feed item by ID.
   * @param feedId - Feed item ID
   * @returns The feed item, or null if not found
   */
  getFeedItem(feedId: string): Promise<FeedItem | null>;

  // ---- Reactions ----

  /**
   * Add an emoji reaction to a feed item.
   * @param feedId - Feed item ID
   * @param emoji - Emoji character or shortcode
   * @param userId - User adding the reaction
   * @returns Updated reactions list
   */
  addReaction(feedId: string, emoji: string, userId: string): Promise<Reaction[]>;

  /**
   * Remove an emoji reaction from a feed item.
   * @param feedId - Feed item ID
   * @param emoji - Emoji character or shortcode
   * @param userId - User removing the reaction
   * @returns Updated reactions list
   */
  removeReaction(feedId: string, emoji: string, userId: string): Promise<Reaction[]>;

  // ---- Subscriptions ----

  /**
   * Subscribe to record-level notifications.
   * @param input - Subscription details
   * @returns The created or updated subscription
   */
  subscribe(input: SubscribeInput): Promise<RecordSubscription>;

  /**
   * Unsubscribe from record notifications.
   * @param object - Object name
   * @param recordId - Record ID
   * @param userId - User ID
   * @returns Whether the user was unsubscribed
   */
  unsubscribe(object: string, recordId: string, userId: string): Promise<boolean>;

  /**
   * Get a user's subscription for a record.
   * @param object - Object name
   * @param recordId - Record ID
   * @param userId - User ID
   * @returns The subscription, or null if not subscribed
   */
  getSubscription(object: string, recordId: string, userId: string): Promise<RecordSubscription | null>;
}
