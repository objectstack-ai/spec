import { z } from 'zod';

/**
 * Message queue protocol for async communication
 * Supports Kafka, RabbitMQ, AWS SQS, Redis Pub/Sub
 */
export const MessageQueueProviderSchema = z.enum([
  'kafka',
  'rabbitmq',
  'aws-sqs',
  'redis-pubsub',
  'google-pubsub',
  'azure-service-bus',
]);

export type MessageQueueProvider = z.infer<typeof MessageQueueProviderSchema>;

export const TopicConfigSchema = z.object({
  name: z.string(),
  partitions: z.number().default(1),
  replicationFactor: z.number().default(1),
  retentionMs: z.number().optional(),
  compressionType: z.enum(['none', 'gzip', 'snappy', 'lz4']).default('none'),
});

export type TopicConfig = z.infer<typeof TopicConfigSchema>;

export const ConsumerConfigSchema = z.object({
  groupId: z.string(),
  autoOffsetReset: z.enum(['earliest', 'latest']).default('latest'),
  enableAutoCommit: z.boolean().default(true),
  maxPollRecords: z.number().default(500),
});

export type ConsumerConfig = z.infer<typeof ConsumerConfigSchema>;

export const DeadLetterQueueSchema = z.object({
  enabled: z.boolean().default(false),
  maxRetries: z.number().default(3),
  queueName: z.string(),
});

export type DeadLetterQueue = z.infer<typeof DeadLetterQueueSchema>;

export const MessageQueueConfigSchema = z.object({
  provider: MessageQueueProviderSchema,
  topics: z.array(TopicConfigSchema),
  consumers: z.array(ConsumerConfigSchema).optional(),
  deadLetterQueue: DeadLetterQueueSchema.optional(),
  ssl: z.boolean().default(false),
  sasl: z.object({
    mechanism: z.enum(['plain', 'scram-sha-256', 'scram-sha-512']),
    username: z.string(),
    password: z.string(),
  }).optional(),
});

export type MessageQueueConfig = z.infer<typeof MessageQueueConfigSchema>;
