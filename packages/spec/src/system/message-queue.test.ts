import { describe, it, expect } from 'vitest';
import {
  MessageQueueProviderSchema,
  TopicConfigSchema,
  ConsumerConfigSchema,
  DeadLetterQueueSchema,
  MessageQueueConfigSchema,
} from './message-queue.zod';

describe('MessageQueueProviderSchema', () => {
  it('should accept valid providers', () => {
    const providers = ['kafka', 'rabbitmq', 'aws-sqs', 'redis-pubsub', 'google-pubsub', 'azure-service-bus'];

    providers.forEach((provider) => {
      expect(() => MessageQueueProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid providers', () => {
    expect(() => MessageQueueProviderSchema.parse('invalid')).toThrow();
    expect(() => MessageQueueProviderSchema.parse('nats')).toThrow();
  });
});

describe('TopicConfigSchema', () => {
  it('should accept valid topic with defaults', () => {
    const topic = TopicConfigSchema.parse({
      name: 'user_events',
    });

    expect(topic.name).toBe('user_events');
    expect(topic.partitions).toBe(1);
    expect(topic.replicationFactor).toBe(1);
    expect(topic.compressionType).toBe('none');
  });

  it('should accept full topic configuration', () => {
    const topic = TopicConfigSchema.parse({
      name: 'order_events',
      partitions: 12,
      replicationFactor: 3,
      retentionMs: 604800000,
      compressionType: 'snappy',
    });

    expect(topic.partitions).toBe(12);
    expect(topic.replicationFactor).toBe(3);
    expect(topic.retentionMs).toBe(604800000);
    expect(topic.compressionType).toBe('snappy');
  });

  it('should accept all compression types', () => {
    const types = ['none', 'gzip', 'snappy', 'lz4'];

    types.forEach((type) => {
      expect(() => TopicConfigSchema.parse({ name: 'test', compressionType: type })).not.toThrow();
    });
  });

  it('should reject missing required name', () => {
    expect(() => TopicConfigSchema.parse({})).toThrow();
  });

  it('should reject invalid compression type', () => {
    expect(() => TopicConfigSchema.parse({ name: 'test', compressionType: 'zstd' })).toThrow();
  });
});

describe('ConsumerConfigSchema', () => {
  it('should accept valid consumer with defaults', () => {
    const consumer = ConsumerConfigSchema.parse({
      groupId: 'order_processor',
    });

    expect(consumer.groupId).toBe('order_processor');
    expect(consumer.autoOffsetReset).toBe('latest');
    expect(consumer.enableAutoCommit).toBe(true);
    expect(consumer.maxPollRecords).toBe(500);
  });

  it('should accept full consumer configuration', () => {
    const consumer = ConsumerConfigSchema.parse({
      groupId: 'analytics_consumer',
      autoOffsetReset: 'earliest',
      enableAutoCommit: false,
      maxPollRecords: 1000,
    });

    expect(consumer.autoOffsetReset).toBe('earliest');
    expect(consumer.enableAutoCommit).toBe(false);
    expect(consumer.maxPollRecords).toBe(1000);
  });

  it('should accept all autoOffsetReset values', () => {
    const values = ['earliest', 'latest'];

    values.forEach((value) => {
      expect(() => ConsumerConfigSchema.parse({ groupId: 'test', autoOffsetReset: value })).not.toThrow();
    });
  });

  it('should reject missing required groupId', () => {
    expect(() => ConsumerConfigSchema.parse({})).toThrow();
  });
});

describe('DeadLetterQueueSchema', () => {
  it('should accept valid DLQ with defaults', () => {
    const dlq = DeadLetterQueueSchema.parse({
      queueName: 'failed_messages',
    });

    expect(dlq.queueName).toBe('failed_messages');
    expect(dlq.enabled).toBe(false);
    expect(dlq.maxRetries).toBe(3);
  });

  it('should accept full DLQ configuration', () => {
    const dlq = DeadLetterQueueSchema.parse({
      enabled: true,
      maxRetries: 5,
      queueName: 'order_dlq',
    });

    expect(dlq.enabled).toBe(true);
    expect(dlq.maxRetries).toBe(5);
    expect(dlq.queueName).toBe('order_dlq');
  });

  it('should reject missing required queueName', () => {
    expect(() => DeadLetterQueueSchema.parse({})).toThrow();
    expect(() => DeadLetterQueueSchema.parse({ enabled: true })).toThrow();
  });
});

describe('MessageQueueConfigSchema', () => {
  it('should accept minimal config with defaults', () => {
    const config = MessageQueueConfigSchema.parse({
      provider: 'kafka',
      topics: [{ name: 'events' }],
    });

    expect(config.provider).toBe('kafka');
    expect(config.topics).toHaveLength(1);
    expect(config.ssl).toBe(false);
  });

  it('should accept full configuration', () => {
    const config = MessageQueueConfigSchema.parse({
      provider: 'kafka',
      topics: [
        { name: 'user_events', partitions: 6, replicationFactor: 3 },
        { name: 'order_events', partitions: 12, compressionType: 'gzip' },
      ],
      consumers: [
        { groupId: 'user_processor' },
        { groupId: 'order_processor', autoOffsetReset: 'earliest' },
      ],
      deadLetterQueue: {
        enabled: true,
        maxRetries: 5,
        queueName: 'dlq',
      },
      ssl: true,
      sasl: {
        mechanism: 'scram-sha-256',
        username: 'admin',
        password: 'secret',
      },
    });

    expect(config.topics).toHaveLength(2);
    expect(config.consumers).toHaveLength(2);
    expect(config.deadLetterQueue?.enabled).toBe(true);
    expect(config.ssl).toBe(true);
    expect(config.sasl?.mechanism).toBe('scram-sha-256');
  });

  it('should accept all SASL mechanisms', () => {
    const mechanisms = ['plain', 'scram-sha-256', 'scram-sha-512'];

    mechanisms.forEach((mechanism) => {
      expect(() => MessageQueueConfigSchema.parse({
        provider: 'kafka',
        topics: [{ name: 'test' }],
        sasl: { mechanism, username: 'user', password: 'pass' },
      })).not.toThrow();
    });
  });

  it('should reject missing required fields', () => {
    expect(() => MessageQueueConfigSchema.parse({})).toThrow();
    expect(() => MessageQueueConfigSchema.parse({ provider: 'kafka' })).toThrow();
  });

  it('should reject invalid provider', () => {
    expect(() => MessageQueueConfigSchema.parse({
      provider: 'invalid',
      topics: [{ name: 'test' }],
    })).toThrow();
  });
});
