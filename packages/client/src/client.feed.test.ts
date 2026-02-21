// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, vi } from 'vitest';
import { ObjectStackClient } from './index';

/** Helper: create a client with mocked fetch */
function createMockClient(body: any, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body,
    headers: new Headers()
  });
  const client = new ObjectStackClient({
    baseUrl: 'http://localhost:3000',
    fetch: fetchMock
  });
  return { client, fetchMock };
}

describe('ObjectStackClient - Feed Namespace', () => {
  // ==========================================
  // Feed CRUD
  // ==========================================

  it('feed.list should GET /api/v1/data/:object/:recordId/feed', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { items: [], total: 0, hasMore: false }
    });

    const result = await client.feed.list('account', 'rec_123', { type: 'all', limit: 10 });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed?type=all&limit=10',
      expect.objectContaining({ headers: expect.any(Object) })
    );
    expect(result.items).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  it('feed.create should POST /api/v1/data/:object/:recordId/feed', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { id: 'feed_1', type: 'comment', body: 'Hello' }
    });

    const result = await client.feed.create('account', 'rec_123', {
      type: 'comment',
      body: 'Hello'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ type: 'comment', body: 'Hello' })
      })
    );
    expect(result.id).toBe('feed_1');
  });

  it('feed.update should PUT /api/v1/data/:object/:recordId/feed/:feedId', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { id: 'feed_1', type: 'comment', body: 'Updated' }
    });

    const result = await client.feed.update('account', 'rec_123', 'feed_1', {
      body: 'Updated'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed/feed_1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ body: 'Updated' })
      })
    );
    expect(result.body).toBe('Updated');
  });

  it('feed.delete should DELETE /api/v1/data/:object/:recordId/feed/:feedId', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { feedId: 'feed_1' }
    });

    const result = await client.feed.delete('account', 'rec_123', 'feed_1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed/feed_1',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result.feedId).toBe('feed_1');
  });

  // ==========================================
  // Reactions
  // ==========================================

  it('feed.addReaction should POST reactions endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { reactions: [{ emoji: '👍', count: 1 }] }
    });

    const result = await client.feed.addReaction('account', 'rec_123', 'feed_1', '👍');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed/feed_1/reactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ emoji: '👍' })
      })
    );
    expect(result.reactions).toHaveLength(1);
  });

  it('feed.removeReaction should DELETE reactions/:emoji endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { reactions: [] }
    });

    await client.feed.removeReaction('account', 'rec_123', 'feed_1', '👍');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/data/account/rec_123/feed/feed_1/reactions/'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  // ==========================================
  // Pin / Star
  // ==========================================

  it('feed.pin should POST pin endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { feedId: 'feed_1', pinned: true, pinnedAt: '2026-01-01T00:00:00Z' }
    });

    const result = await client.feed.pin('account', 'rec_123', 'feed_1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed/feed_1/pin',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.pinned).toBe(true);
  });

  it('feed.unpin should DELETE pin endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { feedId: 'feed_1', pinned: false }
    });

    const result = await client.feed.unpin('account', 'rec_123', 'feed_1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed/feed_1/pin',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result.pinned).toBe(false);
  });

  it('feed.star should POST star endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { feedId: 'feed_1', starred: true, starredAt: '2026-01-01T00:00:00Z' }
    });

    const result = await client.feed.star('account', 'rec_123', 'feed_1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed/feed_1/star',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.starred).toBe(true);
  });

  it('feed.unstar should DELETE star endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { feedId: 'feed_1', starred: false }
    });

    const result = await client.feed.unstar('account', 'rec_123', 'feed_1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/feed/feed_1/star',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result.starred).toBe(false);
  });

  // ==========================================
  // Search & Changelog
  // ==========================================

  it('feed.search should GET search endpoint with query params', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { items: [], total: 0, hasMore: false }
    });

    await client.feed.search('account', 'rec_123', 'follow up', { limit: 10 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/data/account/rec_123/feed/search?query=follow+up'),
      expect.any(Object)
    );
  });

  it('feed.getChangelog should GET changelog endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { entries: [], total: 0, hasMore: false }
    });

    await client.feed.getChangelog('account', 'rec_123', { field: 'status' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/changelog?field=status',
      expect.any(Object)
    );
  });

  // ==========================================
  // Subscriptions
  // ==========================================

  it('feed.subscribe should POST subscribe endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { object: 'account', recordId: 'rec_123', events: ['all'], channels: ['in_app'] }
    });

    const result = await client.feed.subscribe('account', 'rec_123', {
      events: ['comment', 'field_change'],
      channels: ['in_app', 'email']
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/subscribe',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          events: ['comment', 'field_change'],
          channels: ['in_app', 'email']
        })
      })
    );
    expect(result.object).toBe('account');
  });

  it('feed.unsubscribe should DELETE subscribe endpoint', async () => {
    const { client, fetchMock } = createMockClient({
      success: true,
      data: { object: 'account', recordId: 'rec_123', unsubscribed: true }
    });

    const result = await client.feed.unsubscribe('account', 'rec_123');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/data/account/rec_123/subscribe',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result.unsubscribed).toBe(true);
  });
});
