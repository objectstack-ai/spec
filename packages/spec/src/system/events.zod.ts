import { z } from 'zod';
import { EventNameSchema } from '../shared/identifiers.zod';

// ==========================================
// Event Priority
// ==========================================

/**
 * Event Priority Enum
 * Priority levels for event processing
 * Lower numbers = higher priority
 */
export const EventPriority = z.enum([
  'critical',   // 0 - Process immediately, block if necessary
  'high',       // 1 - Process soon, minimal delay
  'normal',     // 2 - Default priority
  'low',        // 3 - Process when resources available
  'background', // 4 - Process during idle time
]);

export type EventPriority = z.infer<typeof EventPriority>;

/**
 * Event Priority Values
 * Maps priority names to numeric values for sorting
 */
export const EVENT_PRIORITY_VALUES: Record<EventPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
  background: 4,
};

// ==========================================
// Event Metadata
// ==========================================

/**
 * Event Metadata Schema
 * Metadata associated with every event
 */
export const EventMetadataSchema = z.object({
  source: z.string().describe('Event source (e.g., plugin name, system component)'),
  timestamp: z.string().datetime().describe('ISO 8601 datetime when event was created'),
  userId: z.string().optional().describe('User who triggered the event'),
  tenantId: z.string().optional().describe('Tenant identifier for multi-tenant systems'),
  correlationId: z.string().optional().describe('Correlation ID for event tracing'),
  causationId: z.string().optional().describe('ID of the event that caused this event'),
  priority: EventPriority.optional().default('normal').describe('Event priority'),
});

// ==========================================
// Event Schema
// ==========================================

/**
 * Event Type Definition Schema
 * Defines the structure of an event type
 * 
 * @example
 * {
 *   "name": "order.created",
 *   "version": "1.0.0",
 *   "schema": {
 *     "type": "object",
 *     "properties": {
 *       "orderId": { "type": "string" },
 *       "customerId": { "type": "string" },
 *       "total": { "type": "number" }
 *     }
 *   }
 * }
 */
export const EventTypeDefinitionSchema = z.object({
  name: EventNameSchema.describe('Event type name (lowercase with dots)'),
  version: z.string().default('1.0.0').describe('Event schema version'),
  schema: z.any().optional().describe('JSON Schema for event payload validation'),
  description: z.string().optional().describe('Event type description'),
  deprecated: z.boolean().optional().default(false).describe('Whether this event type is deprecated'),
  tags: z.array(z.string()).optional().describe('Event type tags'),
});

export type EventTypeDefinition = z.infer<typeof EventTypeDefinitionSchema>;

/**
 * Event Schema
 * Base schema for all events in the system
 * 
 * Event names follow dot notation for namespacing (e.g., 'user.created', 'order.paid').
 * This aligns with industry standards for event-driven architectures and message queues.
 */
export const EventSchema = z.object({
  /**
   * Event identifier (for tracking and deduplication)
   */
  id: z.string().optional().describe('Unique event identifier'),
  
  /**
   * Event name
   */
  name: EventNameSchema.describe('Event name (lowercase with dots, e.g., user.created, order.paid)'),
  
  /**
   * Event payload
   */
  payload: z.any().describe('Event payload schema'),
  
  /**
   * Event metadata
   */
  metadata: EventMetadataSchema.describe('Event metadata'),
});

export type Event = z.infer<typeof EventSchema>;

// ==========================================
// Event Handlers
// ==========================================

/**
 * Event Handler Schema
 * Defines how to handle a specific event
 */
export const EventHandlerSchema = z.object({
  /**
   * Handler identifier
   */
  id: z.string().optional().describe('Unique handler identifier'),
  
  /**
   * Event name pattern
   */
  eventName: z.string().describe('Name of event to handle (supports wildcards like user.*)'),
  
  /**
   * Handler function
   */
  handler: z.function().args(EventSchema).returns(z.promise(z.void())).describe('Handler function'),
  
  /**
   * Execution priority
   */
  priority: z.number().int().default(0).describe('Execution priority (lower numbers execute first)'),
  
  /**
   * Async execution
   */
  async: z.boolean().default(true).describe('Execute in background (true) or block (false)'),
  
  /**
   * Retry configuration
   */
  retry: z.object({
    maxRetries: z.number().int().min(0).default(3).describe('Maximum retry attempts'),
    backoffMs: z.number().int().positive().default(1000).describe('Initial backoff delay'),
    backoffMultiplier: z.number().positive().default(2).describe('Backoff multiplier'),
  }).optional().describe('Retry policy for failed handlers'),
  
  /**
   * Timeout
   */
  timeoutMs: z.number().int().positive().optional().describe('Handler timeout in milliseconds'),
  
  /**
   * Filter function
   */
  filter: z.function().args(EventSchema).returns(z.boolean()).optional()
    .describe('Optional filter to determine if handler should execute'),
});

export type EventHandler = z.infer<typeof EventHandlerSchema>;

/**
 * Event Route Schema
 * Routes events from one pattern to multiple targets with optional transformation
 */
export const EventRouteSchema = z.object({
  from: z.string().describe('Source event pattern (supports wildcards, e.g., user.* or *.created)'),
  to: z.array(z.string()).describe('Target event names to route to'),
  transform: z.function().optional().describe('Optional function to transform payload'),
});

export type EventRoute = z.infer<typeof EventRouteSchema>;

/**
 * Event Persistence Schema
 * Configuration for persisting events to storage
 */
export const EventPersistenceSchema = z.object({
  enabled: z.boolean().default(false).describe('Enable event persistence'),
  retention: z.number().int().positive().describe('Days to retain persisted events'),
  filter: z.function().optional().describe('Optional filter function to select which events to persist'),
  storage: z.enum(['database', 'file', 's3', 'custom']).default('database')
    .describe('Storage backend for persisted events'),
});

export type EventPersistence = z.infer<typeof EventPersistenceSchema>;

// ==========================================
// Event Queue
// ==========================================

/**
 * Event Queue Configuration Schema
 * Configuration for async event processing queue
 * 
 * @example
 * {
 *   "name": "event_queue",
 *   "concurrency": 10,
 *   "retryPolicy": {
 *     "maxRetries": 3,
 *     "backoffStrategy": "exponential"
 *   }
 * }
 */
export const EventQueueConfigSchema = z.object({
  /**
   * Queue name
   */
  name: z.string().default('events').describe('Event queue name'),
  
  /**
   * Concurrency
   */
  concurrency: z.number().int().min(1).default(10).describe('Max concurrent event handlers'),
  
  /**
   * Retry policy
   */
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).default(3).describe('Max retries for failed events'),
    backoffStrategy: z.enum(['fixed', 'linear', 'exponential']).default('exponential')
      .describe('Backoff strategy'),
    initialDelayMs: z.number().int().positive().default(1000).describe('Initial retry delay'),
    maxDelayMs: z.number().int().positive().default(60000).describe('Maximum retry delay'),
  }).optional().describe('Default retry policy for events'),
  
  /**
   * Dead letter queue
   */
  deadLetterQueue: z.string().optional().describe('Dead letter queue name for failed events'),
  
  /**
   * Enable priority processing
   */
  priorityEnabled: z.boolean().default(true).describe('Process events based on priority'),
});

export type EventQueueConfig = z.infer<typeof EventQueueConfigSchema>;

// ==========================================
// Event Replay
// ==========================================

/**
 * Event Replay Configuration Schema
 * Configuration for replaying historical events
 * 
 * @example
 * {
 *   "fromTimestamp": "2024-01-01T00:00:00Z",
 *   "toTimestamp": "2024-01-31T23:59:59Z",
 *   "eventTypes": ["order.created", "order.updated"],
 *   "speed": 10
 * }
 */
export const EventReplayConfigSchema = z.object({
  /**
   * Start timestamp
   */
  fromTimestamp: z.string().datetime().describe('Start timestamp for replay (ISO 8601)'),
  
  /**
   * End timestamp
   */
  toTimestamp: z.string().datetime().optional().describe('End timestamp for replay (ISO 8601)'),
  
  /**
   * Event types to replay
   */
  eventTypes: z.array(z.string()).optional().describe('Event types to replay (empty = all)'),
  
  /**
   * Event filters
   */
  filters: z.record(z.string(), z.any()).optional().describe('Additional filters for event selection'),
  
  /**
   * Replay speed multiplier
   */
  speed: z.number().positive().default(1).describe('Replay speed multiplier (1 = real-time)'),
  
  /**
   * Target handlers
   */
  targetHandlers: z.array(z.string()).optional().describe('Handler IDs to execute (empty = all)'),
});

export type EventReplayConfig = z.infer<typeof EventReplayConfigSchema>;

// ==========================================
// Event Sourcing
// ==========================================

/**
 * Event Sourcing Configuration Schema
 * Configuration for event sourcing pattern
 * 
 * Event sourcing stores all changes to application state as a sequence of events.
 * The current state can be reconstructed by replaying the events.
 * 
 * @example
 * {
 *   "enabled": true,
 *   "snapshotInterval": 100,
 *   "retention": 365
 * }
 */
export const EventSourcingConfigSchema = z.object({
  /**
   * Enable event sourcing
   */
  enabled: z.boolean().default(false).describe('Enable event sourcing'),
  
  /**
   * Snapshot interval
   */
  snapshotInterval: z.number().int().positive().default(100)
    .describe('Create snapshot every N events'),
  
  /**
   * Snapshot retention
   */
  snapshotRetention: z.number().int().positive().default(10)
    .describe('Number of snapshots to retain'),
  
  /**
   * Event retention
   */
  retention: z.number().int().positive().default(365)
    .describe('Days to retain events'),
  
  /**
   * Aggregate types
   */
  aggregateTypes: z.array(z.string()).optional()
    .describe('Aggregate types to enable event sourcing for'),
  
  /**
   * Storage configuration
   */
  storage: z.object({
    type: z.enum(['database', 'file', 's3', 'eventstore']).default('database')
      .describe('Storage backend'),
    options: z.record(z.string(), z.any()).optional().describe('Storage-specific options'),
  }).optional().describe('Event store configuration'),
});

export type EventSourcingConfig = z.infer<typeof EventSourcingConfigSchema>;

// ==========================================
// Dead Letter Queue
// ==========================================

/**
 * Dead Letter Queue Entry Schema
 * Represents a failed event in the dead letter queue
 */
export const DeadLetterQueueEntrySchema = z.object({
  /**
   * Entry identifier
   */
  id: z.string().describe('Unique entry identifier'),
  
  /**
   * Original event
   */
  event: EventSchema.describe('Original event'),
  
  /**
   * Failure reason
   */
  error: z.object({
    message: z.string().describe('Error message'),
    stack: z.string().optional().describe('Error stack trace'),
    code: z.string().optional().describe('Error code'),
  }).describe('Failure details'),
  
  /**
   * Retry count
   */
  retries: z.number().int().min(0).describe('Number of retry attempts'),
  
  /**
   * Timestamps
   */
  firstFailedAt: z.string().datetime().describe('When event first failed'),
  lastFailedAt: z.string().datetime().describe('When event last failed'),
  
  /**
   * Handler that failed
   */
  failedHandler: z.string().optional().describe('Handler ID that failed'),
});

export type DeadLetterQueueEntry = z.infer<typeof DeadLetterQueueEntrySchema>;

// ==========================================
// Event Log
// ==========================================

/**
 * Event Log Entry Schema
 * Represents a logged event
 */
export const EventLogEntrySchema = z.object({
  /**
   * Log entry ID
   */
  id: z.string().describe('Unique log entry identifier'),
  
  /**
   * Event
   */
  event: EventSchema.describe('The event'),
  
  /**
   * Status
   */
  status: z.enum(['pending', 'processing', 'completed', 'failed']).describe('Processing status'),
  
  /**
   * Handlers executed
   */
  handlersExecuted: z.array(z.object({
    handlerId: z.string().describe('Handler identifier'),
    status: z.enum(['success', 'failed', 'timeout']).describe('Handler execution status'),
    durationMs: z.number().int().optional().describe('Execution duration'),
    error: z.string().optional().describe('Error message if failed'),
  })).optional().describe('Handlers that processed this event'),
  
  /**
   * Timestamps
   */
  receivedAt: z.string().datetime().describe('When event was received'),
  processedAt: z.string().datetime().optional().describe('When event was processed'),
  
  /**
   * Total duration
   */
  totalDurationMs: z.number().int().optional().describe('Total processing time'),
});

export type EventLogEntry = z.infer<typeof EventLogEntrySchema>;

// ==========================================
// Webhook Integration
// ==========================================

/**
 * Event Webhook Configuration Schema
 * Configuration for sending events to webhooks
 * 
 * @example
 * {
 *   "eventPattern": "order.*",
 *   "url": "https://api.example.com/webhooks/orders",
 *   "method": "POST",
 *   "headers": { "Authorization": "Bearer token" }
 * }
 */
export const EventWebhookConfigSchema = z.object({
  /**
   * Webhook identifier
   */
  id: z.string().optional().describe('Unique webhook identifier'),
  
  /**
   * Event pattern to match
   */
  eventPattern: z.string().describe('Event name pattern (supports wildcards)'),
  
  /**
   * Target URL
   */
  url: z.string().url().describe('Webhook endpoint URL'),
  
  /**
   * HTTP method
   */
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).default('POST').describe('HTTP method'),
  
  /**
   * Headers
   */
  headers: z.record(z.string(), z.string()).optional().describe('HTTP headers'),
  
  /**
   * Authentication
   */
  authentication: z.object({
    type: z.enum(['none', 'bearer', 'basic', 'api-key']).describe('Auth type'),
    credentials: z.record(z.string(), z.string()).optional().describe('Auth credentials'),
  }).optional().describe('Authentication configuration'),
  
  /**
   * Retry policy
   */
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).default(3).describe('Max retry attempts'),
    backoffStrategy: z.enum(['fixed', 'linear', 'exponential']).default('exponential'),
    initialDelayMs: z.number().int().positive().default(1000).describe('Initial retry delay'),
    maxDelayMs: z.number().int().positive().default(60000).describe('Max retry delay'),
  }).optional().describe('Retry policy'),
  
  /**
   * Timeout
   */
  timeoutMs: z.number().int().positive().default(30000).describe('Request timeout in milliseconds'),
  
  /**
   * Event transformation
   */
  transform: z.function().args(EventSchema).returns(z.any()).optional()
    .describe('Transform event before sending'),
  
  /**
   * Enabled
   */
  enabled: z.boolean().default(true).describe('Whether webhook is enabled'),
});

export type EventWebhookConfig = z.infer<typeof EventWebhookConfigSchema>;

// ==========================================
// Message Queue Integration
// ==========================================

/**
 * Event Message Queue Configuration Schema
 * Configuration for publishing events to message queues
 * 
 * @example
 * {
 *   "provider": "kafka",
 *   "topic": "events",
 *   "eventPattern": "*",
 *   "partitionKey": "metadata.tenantId"
 * }
 */
export const EventMessageQueueConfigSchema = z.object({
  /**
   * Provider
   */
  provider: z.enum(['kafka', 'rabbitmq', 'aws-sqs', 'redis-pubsub', 'google-pubsub', 'azure-service-bus'])
    .describe('Message queue provider'),
  
  /**
   * Topic/Queue name
   */
  topic: z.string().describe('Topic or queue name'),
  
  /**
   * Event pattern
   */
  eventPattern: z.string().default('*').describe('Event name pattern to publish (supports wildcards)'),
  
  /**
   * Partition key
   */
  partitionKey: z.string().optional().describe('JSON path for partition key (e.g., "metadata.tenantId")'),
  
  /**
   * Message format
   */
  format: z.enum(['json', 'avro', 'protobuf']).default('json').describe('Message serialization format'),
  
  /**
   * Include metadata
   */
  includeMetadata: z.boolean().default(true).describe('Include event metadata in message'),
  
  /**
   * Compression
   */
  compression: z.enum(['none', 'gzip', 'snappy', 'lz4']).default('none').describe('Message compression'),
  
  /**
   * Batch size
   */
  batchSize: z.number().int().min(1).default(1).describe('Batch size for publishing'),
  
  /**
   * Flush interval
   */
  flushIntervalMs: z.number().int().positive().default(1000).describe('Flush interval for batching'),
});

export type EventMessageQueueConfig = z.infer<typeof EventMessageQueueConfigSchema>;

// ==========================================
// Real-time Notifications
// ==========================================

/**
 * Real-time Notification Configuration Schema
 * Configuration for real-time event notifications via WebSocket/SSE
 * 
 * @example
 * {
 *   "enabled": true,
 *   "protocol": "websocket",
 *   "eventPattern": "notification.*",
 *   "userFilter": true
 * }
 */
export const RealTimeNotificationConfigSchema = z.object({
  /**
   * Enable real-time notifications
   */
  enabled: z.boolean().default(true).describe('Enable real-time notifications'),
  
  /**
   * Protocol
   */
  protocol: z.enum(['websocket', 'sse', 'long-polling']).default('websocket')
    .describe('Real-time protocol'),
  
  /**
   * Event pattern
   */
  eventPattern: z.string().default('*').describe('Event pattern to broadcast'),
  
  /**
   * User-specific filtering
   */
  userFilter: z.boolean().default(true).describe('Filter events by user'),
  
  /**
   * Tenant-specific filtering
   */
  tenantFilter: z.boolean().default(true).describe('Filter events by tenant'),
  
  /**
   * Channels
   */
  channels: z.array(z.object({
    name: z.string().describe('Channel name'),
    eventPattern: z.string().describe('Event pattern for channel'),
    filter: z.function().args(EventSchema).returns(z.boolean()).optional()
      .describe('Additional filter function'),
  })).optional().describe('Named channels for event broadcasting'),
  
  /**
   * Rate limiting
   */
  rateLimit: z.object({
    maxEventsPerSecond: z.number().int().positive().describe('Max events per second per client'),
    windowMs: z.number().int().positive().default(1000).describe('Rate limit window'),
  }).optional().describe('Rate limiting configuration'),
});

export type RealTimeNotificationConfig = z.infer<typeof RealTimeNotificationConfigSchema>;

// ==========================================
// Complete Event Bus Configuration
// ==========================================

/**
 * Event Bus Configuration Schema
 * Complete configuration for the event bus system
 * 
 * @example
 * {
 *   "persistence": { "enabled": true, "retention": 365 },
 *   "queue": { "concurrency": 20 },
 *   "eventSourcing": { "enabled": true },
 *   "webhooks": [],
 *   "messageQueue": { "provider": "kafka", "topic": "events" },
 *   "realtime": { "enabled": true, "protocol": "websocket" }
 * }
 */
export const EventBusConfigSchema = z.object({
  /**
   * Event persistence
   */
  persistence: EventPersistenceSchema.optional().describe('Event persistence configuration'),
  
  /**
   * Event queue
   */
  queue: EventQueueConfigSchema.optional().describe('Event queue configuration'),
  
  /**
   * Event sourcing
   */
  eventSourcing: EventSourcingConfigSchema.optional().describe('Event sourcing configuration'),
  
  /**
   * Event replay
   */
  replay: z.object({
    enabled: z.boolean().default(true).describe('Enable event replay capability'),
  }).optional().describe('Event replay configuration'),
  
  /**
   * Webhooks
   */
  webhooks: z.array(EventWebhookConfigSchema).optional().describe('Webhook configurations'),
  
  /**
   * Message queue integration
   */
  messageQueue: EventMessageQueueConfigSchema.optional().describe('Message queue integration'),
  
  /**
   * Real-time notifications
   */
  realtime: RealTimeNotificationConfigSchema.optional().describe('Real-time notification configuration'),
  
  /**
   * Event type definitions
   */
  eventTypes: z.array(EventTypeDefinitionSchema).optional().describe('Event type definitions'),
  
  /**
   * Global handlers
   */
  handlers: z.array(EventHandlerSchema).optional().describe('Global event handlers'),
});

export type EventBusConfig = z.infer<typeof EventBusConfigSchema>;

// ==========================================
// Helper Functions
// ==========================================

/**
 * Helper to create event bus configuration
 */
export function createEventBusConfig<T extends z.input<typeof EventBusConfigSchema>>(config: T): T {
  return config;
}

/**
 * Helper to create event type definition
 */
export function createEventTypeDefinition<T extends z.input<typeof EventTypeDefinitionSchema>>(definition: T): T {
  return definition;
}

/**
 * Helper to create event webhook configuration
 */
export function createEventWebhookConfig<T extends z.input<typeof EventWebhookConfigSchema>>(config: T): T {
  return config;
}
