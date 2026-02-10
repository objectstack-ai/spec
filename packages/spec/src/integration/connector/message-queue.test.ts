import { describe, it, expect } from 'vitest';
import {
  MessageQueueProviderSchema,
  MessageFormatSchema,
  AckModeSchema,
  DeliveryGuaranteeSchema,
  ConsumerConfigSchema,
  ProducerConfigSchema,
  DlqConfigSchema,
  TopicQueueSchema,
  MessageQueueConnectorSchema,
} from './message-queue.zod';

const baseAuth = { type: 'none' as const };

const minimalTopic = {
  name: 'order_events',
  label: 'Order Events',
  topicName: 'orders',
};

const minimalConnector = {
  name: 'kafka_main',
  label: 'Kafka Main',
  type: 'message_queue' as const,
  provider: 'kafka' as const,
  authentication: baseAuth,
  brokerConfig: {
    brokers: ['localhost:9092'],
  },
  topics: [minimalTopic],
};

describe('MessageQueueProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['rabbitmq', 'kafka', 'redis_pubsub', 'redis_streams', 'aws_sqs', 'aws_sns', 'google_pubsub', 'azure_service_bus', 'azure_event_hubs', 'nats', 'pulsar', 'activemq', 'custom'];
    for (const p of providers) {
      expect(MessageQueueProviderSchema.parse(p)).toBe(p);
    }
  });

  it('should reject invalid provider', () => {
    expect(() => MessageQueueProviderSchema.parse('zeromq')).toThrow();
  });
});

describe('MessageFormatSchema', () => {
  it('should accept valid formats', () => {
    for (const f of ['json', 'xml', 'protobuf', 'avro', 'text', 'binary']) {
      expect(MessageFormatSchema.parse(f)).toBe(f);
    }
  });

  it('should reject invalid format', () => {
    expect(() => MessageFormatSchema.parse('yaml')).toThrow();
  });
});

describe('AckModeSchema', () => {
  it('should accept valid modes', () => {
    for (const m of ['auto', 'manual', 'client']) {
      expect(AckModeSchema.parse(m)).toBe(m);
    }
  });

  it('should reject invalid mode', () => {
    expect(() => AckModeSchema.parse('batch')).toThrow();
  });
});

describe('DeliveryGuaranteeSchema', () => {
  it('should accept valid guarantees', () => {
    for (const g of ['at_most_once', 'at_least_once', 'exactly_once']) {
      expect(DeliveryGuaranteeSchema.parse(g)).toBe(g);
    }
  });

  it('should reject invalid guarantee', () => {
    expect(() => DeliveryGuaranteeSchema.parse('best_effort')).toThrow();
  });
});

describe('ConsumerConfigSchema', () => {
  it('should apply defaults', () => {
    const result = ConsumerConfigSchema.parse({});
    expect(result.enabled).toBe(true);
    expect(result.concurrency).toBe(1);
    expect(result.prefetchCount).toBe(10);
    expect(result.ackMode).toBe('manual');
    expect(result.autoCommit).toBe(false);
    expect(result.autoCommitIntervalMs).toBe(5000);
    expect(result.sessionTimeoutMs).toBe(30000);
  });

  it('should accept custom values', () => {
    const result = ConsumerConfigSchema.parse({
      consumerGroup: 'my-group',
      concurrency: 10,
      prefetchCount: 100,
      ackMode: 'auto',
      rebalanceTimeoutMs: 5000,
    });
    expect(result.consumerGroup).toBe('my-group');
    expect(result.concurrency).toBe(10);
  });

  it('should reject concurrency out of range', () => {
    expect(() => ConsumerConfigSchema.parse({ concurrency: 0 })).toThrow();
    expect(() => ConsumerConfigSchema.parse({ concurrency: 101 })).toThrow();
  });

  it('should reject prefetchCount out of range', () => {
    expect(() => ConsumerConfigSchema.parse({ prefetchCount: 0 })).toThrow();
    expect(() => ConsumerConfigSchema.parse({ prefetchCount: 1001 })).toThrow();
  });
});

describe('ProducerConfigSchema', () => {
  it('should apply defaults', () => {
    const result = ProducerConfigSchema.parse({});
    expect(result.enabled).toBe(true);
    expect(result.acks).toBe('all');
    expect(result.compressionType).toBe('none');
    expect(result.idempotence).toBe(true);
    expect(result.transactional).toBe(false);
  });

  it('should accept custom values', () => {
    const result = ProducerConfigSchema.parse({
      acks: '1',
      compressionType: 'snappy',
      batchSize: 32768,
      lingerMs: 10,
    });
    expect(result.acks).toBe('1');
    expect(result.compressionType).toBe('snappy');
  });

  it('should reject invalid acks', () => {
    expect(() => ProducerConfigSchema.parse({ acks: '2' })).toThrow();
  });

  it('should reject invalid compressionType', () => {
    expect(() => ProducerConfigSchema.parse({ compressionType: 'brotli' })).toThrow();
  });
});

describe('DlqConfigSchema', () => {
  it('should accept valid DLQ config', () => {
    const result = DlqConfigSchema.parse({ queueName: 'my-dlq' });
    expect(result.enabled).toBe(false);
    expect(result.maxRetries).toBe(3);
    expect(result.retryDelayMs).toBe(60000);
  });

  it('should reject missing queueName', () => {
    expect(() => DlqConfigSchema.parse({})).toThrow();
  });

  it('should reject maxRetries out of range', () => {
    expect(() => DlqConfigSchema.parse({ queueName: 'dlq', maxRetries: -1 })).toThrow();
    expect(() => DlqConfigSchema.parse({ queueName: 'dlq', maxRetries: 101 })).toThrow();
  });
});

describe('TopicQueueSchema', () => {
  it('should accept minimal topic', () => {
    const result = TopicQueueSchema.parse(minimalTopic);
    expect(result.enabled).toBe(true);
    expect(result.mode).toBe('both');
    expect(result.messageFormat).toBe('json');
  });

  it('should accept topic with all options', () => {
    const data = {
      ...minimalTopic,
      enabled: false,
      mode: 'consumer',
      messageFormat: 'avro',
      partitions: 10,
      replicationFactor: 3,
      consumerConfig: { consumerGroup: 'grp' },
      producerConfig: { acks: '1' },
      dlqConfig: { queueName: 'dlq' },
      routingKey: 'order.*',
      messageFilter: { headers: { type: 'order' } },
    };
    expect(() => TopicQueueSchema.parse(data)).not.toThrow();
  });

  it('should reject non-snake_case name', () => {
    expect(() => TopicQueueSchema.parse({ ...minimalTopic, name: 'OrderEvents' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => TopicQueueSchema.parse({ name: 'topic' })).toThrow();
  });
});

describe('MessageQueueConnectorSchema', () => {
  it('should accept minimal valid connector', () => {
    expect(() => MessageQueueConnectorSchema.parse(minimalConnector)).not.toThrow();
  });

  it('should apply defaults', () => {
    const result = MessageQueueConnectorSchema.parse(minimalConnector);
    expect(result.deliveryGuarantee).toBe('at_least_once');
    expect(result.preserveOrder).toBe(true);
    expect(result.enableMetrics).toBe(true);
    expect(result.enableTracing).toBe(false);
    expect(result.enabled).toBe(true);
  });

  it('should accept full connector', () => {
    const full = {
      ...minimalConnector,
      brokerConfig: {
        brokers: ['broker1:9092', 'broker2:9092'],
        clientId: 'my-client',
        connectionTimeoutMs: 5000,
        requestTimeoutMs: 5000,
      },
      deliveryGuarantee: 'exactly_once',
      sslConfig: { enabled: true, rejectUnauthorized: true },
      saslConfig: { mechanism: 'scram-sha-256', username: 'u', password: 'p' },
      schemaRegistry: { url: 'https://registry.example.com' },
      preserveOrder: false,
      enableMetrics: false,
      enableTracing: true,
    };
    expect(() => MessageQueueConnectorSchema.parse(full)).not.toThrow();
  });

  it('should reject wrong type literal', () => {
    expect(() => MessageQueueConnectorSchema.parse({ ...minimalConnector, type: 'database' })).toThrow();
  });

  it('should reject invalid provider', () => {
    expect(() => MessageQueueConnectorSchema.parse({ ...minimalConnector, provider: 'unknown' })).toThrow();
  });

  it('should reject missing brokerConfig', () => {
    const { brokerConfig: _, ...noConfig } = minimalConnector;
    expect(() => MessageQueueConnectorSchema.parse(noConfig)).toThrow();
  });

  it('should reject missing topics', () => {
    const { topics: _, ...noTopics } = minimalConnector;
    expect(() => MessageQueueConnectorSchema.parse(noTopics)).toThrow();
  });

  it('should reject invalid schemaRegistry url', () => {
    expect(() => MessageQueueConnectorSchema.parse({
      ...minimalConnector,
      schemaRegistry: { url: 'not-a-url' },
    })).toThrow();
  });
});
