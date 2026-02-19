import { describe, it, expect } from 'vitest';
import {
  SubscriptionEventType,
  NotificationChannel,
  RecordSubscriptionSchema,
  type RecordSubscription,
} from './subscription.zod';

describe('SubscriptionEventType', () => {
  it('should accept all valid event types', () => {
    const types = ['comment', 'mention', 'field_change', 'task', 'approval', 'all'];
    types.forEach(type => {
      expect(() => SubscriptionEventType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid event type', () => {
    expect(() => SubscriptionEventType.parse('unknown')).toThrow();
    expect(() => SubscriptionEventType.parse('')).toThrow();
  });
});

describe('NotificationChannel', () => {
  it('should accept all valid channels', () => {
    const channels = ['in_app', 'email', 'push', 'slack'];
    channels.forEach(channel => {
      expect(() => NotificationChannel.parse(channel)).not.toThrow();
    });
  });

  it('should reject invalid channel', () => {
    expect(() => NotificationChannel.parse('sms')).toThrow();
  });
});

describe('RecordSubscriptionSchema', () => {
  const minimalSubscription: RecordSubscription = {
    object: 'account',
    recordId: 'rec_123',
    userId: 'user_456',
    createdAt: '2026-01-15T10:00:00Z',
  };

  it('should accept minimal subscription with defaults', () => {
    const result = RecordSubscriptionSchema.parse(minimalSubscription);
    expect(result.object).toBe('account');
    expect(result.recordId).toBe('rec_123');
    expect(result.userId).toBe('user_456');
    expect(result.events).toEqual(['all']);
    expect(result.channels).toEqual(['in_app']);
    expect(result.active).toBe(true);
  });

  it('should accept full subscription', () => {
    const full: RecordSubscription = {
      object: 'opportunity',
      recordId: 'rec_789',
      userId: 'user_101',
      events: ['comment', 'field_change'],
      channels: ['in_app', 'email'],
      active: true,
      createdAt: '2026-01-15T10:00:00Z',
    };
    const result = RecordSubscriptionSchema.parse(full);
    expect(result.events).toEqual(['comment', 'field_change']);
    expect(result.channels).toEqual(['in_app', 'email']);
  });

  it('should accept inactive subscription', () => {
    const result = RecordSubscriptionSchema.parse({
      ...minimalSubscription,
      active: false,
    });
    expect(result.active).toBe(false);
  });

  it('should reject without required fields', () => {
    expect(() => RecordSubscriptionSchema.parse({})).toThrow();
    expect(() => RecordSubscriptionSchema.parse({ object: 'account' })).toThrow();
    expect(() => RecordSubscriptionSchema.parse({ object: 'account', recordId: 'rec_1' })).toThrow();
  });

  it('should reject invalid datetime format', () => {
    expect(() => RecordSubscriptionSchema.parse({
      ...minimalSubscription,
      createdAt: 'not-a-date',
    })).toThrow();
  });

  it('should reject invalid event types in array', () => {
    expect(() => RecordSubscriptionSchema.parse({
      ...minimalSubscription,
      events: ['invalid_event'],
    })).toThrow();
  });

  it('should reject invalid notification channels', () => {
    expect(() => RecordSubscriptionSchema.parse({
      ...minimalSubscription,
      channels: ['sms'],
    })).toThrow();
  });
});
