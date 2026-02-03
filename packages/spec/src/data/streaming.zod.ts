import { z } from 'zod';

/**
 * Real-Time Data Streaming Protocol
 * 
 * Enables real-time data synchronization and event streaming
 * across distributed systems with support for multiple protocols.
 * 
 * @module data/streaming
 */

/**
 * Streaming event types
 */
export const StreamingEventTypeSchema = z.enum([
  'create',      // Record created
  'update',      // Record updated
  'delete',      // Record deleted
  'patch',       // Partial record update
  'bulk-create', // Multiple records created
  'bulk-update', // Multiple records updated
  'bulk-delete'  // Multiple records deleted
]);

export type StreamingEventType = z.infer<typeof StreamingEventTypeSchema>;

/**
 * Streaming protocol types
 */
export const StreamingProtocolSchema = z.enum([
  'websocket',   // WebSocket (bidirectional, persistent)
  'sse',         // Server-Sent Events (unidirectional, HTTP)
  'grpc',        // gRPC streaming (bidirectional, efficient)
  'mqtt',        // MQTT (IoT, pub-sub)
  'kafka',       // Apache Kafka (distributed streaming)
  'redis',       // Redis Pub/Sub
  'rabbitmq'     // RabbitMQ (message queue)
]);

export type StreamingProtocol = z.infer<typeof StreamingProtocolSchema>;

/**
 * Stream subscription filter
 */
export const StreamFilterSchema = z.object({
  /** Filter type */
  type: z.enum(['field', 'expression', 'function']),
  
  /** Field name (for field type) */
  field: z.string().optional(),
  
  /** Operator */
  operator: z.enum(['=', '!=', '>', '>=', '<', '<=', 'in', 'not-in', 'contains', 'starts-with', 'ends-with']).optional(),
  
  /** Value to compare */
  value: z.any().optional(),
  
  /** Expression (for expression type) */
  expression: z.string().optional(),
  
  /** Function name (for function type) */
  function: z.string().optional(),
  
  /** Function arguments */
  args: z.array(z.any()).optional()
});

export type StreamFilter = z.infer<typeof StreamFilterSchema>;

/**
 * Stream subscription configuration
 */
export const StreamSubscriptionSchema = z.object({
  /** Event types to subscribe to */
  events: z.array(StreamingEventTypeSchema),
  
  /** Filters to apply */
  filters: z.array(StreamFilterSchema).optional(),
  
  /** Specific fields to include (null = all fields) */
  fields: z.array(z.string()).optional(),
  
  /** Debounce time in milliseconds */
  debounce: z.number().min(0).optional(),
  
  /** Buffer size (number of events) */
  buffer: z.number().min(1).optional(),
  
  /** Buffer time window in milliseconds */
  bufferTime: z.number().min(0).optional(),
  
  /** Include initial snapshot */
  includeSnapshot: z.boolean().default(false),
  
  /** Replay historical events */
  replay: z.object({
    enabled: z.boolean(),
    fromTimestamp: z.date().optional(),
    fromSequence: z.number().optional(),
    maxEvents: z.number().optional()
  }).optional()
});

export type StreamSubscription = z.infer<typeof StreamSubscriptionSchema>;

/**
 * Stream delivery configuration
 */
export const StreamDeliverySchema = z.object({
  /** Delivery protocol */
  protocol: StreamingProtocolSchema,
  
  /** Compression enabled */
  compression: z.boolean().default(false),
  
  /** Compression algorithm */
  compressionAlgorithm: z.enum(['gzip', 'deflate', 'br']).optional(),
  
  /** Batching configuration */
  batching: z.object({
    /** Enable batching */
    enabled: z.boolean(),
    
    /** Maximum batch size */
    maxSize: z.number().min(1).default(100),
    
    /** Maximum wait time (ms) */
    maxWait: z.number().min(0).default(1000),
    
    /** Flush on specific events */
    flushOn: z.array(StreamingEventTypeSchema).optional()
  }).optional(),
  
  /** Retry configuration */
  retry: z.object({
    /** Enable automatic retry */
    enabled: z.boolean().default(true),
    
    /** Maximum retry attempts */
    maxAttempts: z.number().min(0).default(3),
    
    /** Retry backoff strategy */
    backoff: z.enum(['fixed', 'exponential', 'linear']).default('exponential'),
    
    /** Initial retry delay (ms) */
    initialDelay: z.number().min(0).default(1000),
    
    /** Maximum retry delay (ms) */
    maxDelay: z.number().min(0).default(30000)
  }).optional(),
  
  /** Quality of Service */
  qos: z.enum([
    'at-most-once',     // Fire and forget (QoS 0)
    'at-least-once',    // Guaranteed delivery (QoS 1)
    'exactly-once'      // Exactly once delivery (QoS 2)
  ]).default('at-least-once'),
  
  /** Message ordering guarantee */
  ordering: z.boolean().default(true),
  
  /** Keep-alive settings */
  keepAlive: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().min(1000).default(30000),
    timeout: z.number().min(1000).default(10000)
  }).optional()
});

export type StreamDelivery = z.infer<typeof StreamDeliverySchema>;

/**
 * Streaming query definition
 */
export const StreamingQuerySchema = z.object({
  /** Query ID */
  id: z.string().optional(),
  
  /** Source object/table */
  source: z.string(),
  
  /** Subscription configuration */
  subscription: StreamSubscriptionSchema,
  
  /** Delivery configuration */
  delivery: StreamDeliverySchema,
  
  /** Transform configuration */
  transform: z.object({
    /** Enable transformation */
    enabled: z.boolean().default(false),
    
    /** Transformation function */
    function: z.string().optional(),
    
    /** Map fields */
    mapping: z.record(z.string()).optional(),
    
    /** Enrich with additional data */
    enrichment: z.array(z.object({
      source: z.string(),
      joinKey: z.string(),
      fields: z.array(z.string())
    })).optional()
  }).optional(),
  
  /** Security configuration */
  security: z.object({
    /** Require authentication */
    requireAuth: z.boolean().default(true),
    
    /** Row-level security */
    rowLevelSecurity: z.boolean().default(true),
    
    /** Allowed operations */
    allowedOperations: z.array(StreamingEventTypeSchema).optional(),
    
    /** Rate limiting */
    rateLimit: z.object({
      maxEventsPerSecond: z.number(),
      maxEventsPerMinute: z.number().optional()
    }).optional()
  }).optional(),
  
  /** Monitoring configuration */
  monitoring: z.object({
    /** Enable metrics */
    enabled: z.boolean().default(true),
    
    /** Metrics to track */
    metrics: z.array(z.enum([
      'event-count',
      'event-rate',
      'latency',
      'error-rate',
      'consumer-lag',
      'throughput'
    ])).optional(),
    
    /** Alert thresholds */
    alerts: z.array(z.object({
      metric: z.string(),
      operator: z.enum(['>', '>=', '<', '<=', '=']),
      threshold: z.number(),
      action: z.enum(['log', 'notify', 'throttle', 'stop'])
    })).optional()
  }).optional()
});

export type StreamingQuery = z.infer<typeof StreamingQuerySchema>;

/**
 * Stream event
 */
export const StreamEventSchema = z.object({
  /** Event ID */
  id: z.string(),
  
  /** Sequence number */
  sequence: z.number(),
  
  /** Timestamp */
  timestamp: z.date(),
  
  /** Event type */
  type: StreamingEventTypeSchema,
  
  /** Source object */
  object: z.string(),
  
  /** Record ID(s) */
  recordIds: z.array(z.string()),
  
  /** Event data */
  data: z.object({
    /** Before state (for updates/deletes) */
    before: z.record(z.any()).optional(),
    
    /** After state (for creates/updates) */
    after: z.record(z.any()).optional(),
    
    /** Changed fields (for updates) */
    changes: z.array(z.string()).optional()
  }),
  
  /** Metadata */
  metadata: z.object({
    /** User who triggered the event */
    userId: z.string().optional(),
    
    /** Source IP */
    sourceIp: z.string().optional(),
    
    /** Transaction ID */
    transactionId: z.string().optional(),
    
    /** Custom metadata */
    custom: z.record(z.any()).optional()
  }).optional()
});

export type StreamEvent = z.infer<typeof StreamEventSchema>;

/**
 * Stream batch
 */
export const StreamBatchSchema = z.object({
  /** Batch ID */
  id: z.string(),
  
  /** Batch timestamp */
  timestamp: z.date(),
  
  /** Events in batch */
  events: z.array(StreamEventSchema),
  
  /** Batch size */
  size: z.number(),
  
  /** First sequence number */
  firstSequence: z.number(),
  
  /** Last sequence number */
  lastSequence: z.number()
});

export type StreamBatch = z.infer<typeof StreamBatchSchema>;

/**
 * Stream consumer state
 */
export const StreamConsumerStateSchema = z.object({
  /** Consumer ID */
  consumerId: z.string(),
  
  /** Consumer group (optional) */
  consumerGroup: z.string().optional(),
  
  /** Subscription ID */
  subscriptionId: z.string(),
  
  /** Connection status */
  status: z.enum(['connected', 'disconnected', 'paused', 'error']),
  
  /** Last acknowledged sequence */
  lastAckedSequence: z.number(),
  
  /** Current lag (events behind) */
  lag: z.number(),
  
  /** Events processed */
  eventsProcessed: z.number(),
  
  /** Errors encountered */
  errorCount: z.number(),
  
  /** Connected at */
  connectedAt: z.date(),
  
  /** Last event at */
  lastEventAt: z.date().optional(),
  
  /** Consumer metadata */
  metadata: z.record(z.any()).optional()
});

export type StreamConsumerState = z.infer<typeof StreamConsumerStateSchema>;

/**
 * Stream metrics
 */
export const StreamMetricsSchema = z.object({
  /** Metric timestamp */
  timestamp: z.date(),
  
  /** Stream ID */
  streamId: z.string(),
  
  /** Event metrics */
  events: z.object({
    /** Total events */
    total: z.number(),
    
    /** Events per second */
    rate: z.number(),
    
    /** Events by type */
    byType: z.record(z.number())
  }),
  
  /** Performance metrics */
  performance: z.object({
    /** Average latency (ms) */
    avgLatency: z.number(),
    
    /** 95th percentile latency (ms) */
    p95Latency: z.number(),
    
    /** 99th percentile latency (ms) */
    p99Latency: z.number(),
    
    /** Throughput (bytes/second) */
    throughput: z.number()
  }),
  
  /** Consumer metrics */
  consumers: z.object({
    /** Total consumers */
    total: z.number(),
    
    /** Active consumers */
    active: z.number(),
    
    /** Average consumer lag */
    avgLag: z.number(),
    
    /** Max consumer lag */
    maxLag: z.number()
  }),
  
  /** Error metrics */
  errors: z.object({
    /** Total errors */
    total: z.number(),
    
    /** Error rate (errors/second) */
    rate: z.number(),
    
    /** Errors by type */
    byType: z.record(z.number())
  })
});

export type StreamMetrics = z.infer<typeof StreamMetricsSchema>;

/**
 * Stream checkpoint
 */
export const StreamCheckpointSchema = z.object({
  /** Checkpoint ID */
  id: z.string(),
  
  /** Consumer ID */
  consumerId: z.string(),
  
  /** Stream ID */
  streamId: z.string(),
  
  /** Sequence number */
  sequence: z.number(),
  
  /** Timestamp */
  timestamp: z.date(),
  
  /** Custom state */
  state: z.record(z.any()).optional()
});

export type StreamCheckpoint = z.infer<typeof StreamCheckpointSchema>;
