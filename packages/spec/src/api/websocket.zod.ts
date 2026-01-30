import { z } from 'zod';
import { EventNameSchema } from '../shared/identifiers.zod';

/**
 * WebSocket Event Protocol
 * 
 * Defines the schema for WebSocket-based real-time communication in ObjectStack.
 * Supports event subscriptions, filtering, presence tracking, and collaborative editing.
 * 
 * Industry alignment: Firebase Realtime Database, Socket.IO, Pusher
 */

// ==========================================
// Message Types
// ==========================================

/**
 * WebSocket Message Type Enum
 * Defines the types of messages that can be sent over WebSocket
 */
export const WebSocketMessageType = z.enum([
  'subscribe',       // Client subscribes to events
  'unsubscribe',     // Client unsubscribes from events
  'event',           // Server sends event to client
  'ping',            // Keepalive ping
  'pong',            // Keepalive pong response
  'ack',             // Acknowledgment of message receipt
  'error',           // Error message
  'presence',        // Presence update (user status)
  'cursor',          // Cursor position update (collaborative editing)
  'edit',            // Document edit operation (collaborative editing)
]);

export type WebSocketMessageType = z.infer<typeof WebSocketMessageType>;

// ==========================================
// Event Subscription
// ==========================================

/**
 * Event Filter Operator Enum
 * SQL-like filter operators for event filtering
 */
export const FilterOperator = z.enum([
  'eq',      // Equal
  'ne',      // Not equal
  'gt',      // Greater than
  'gte',     // Greater than or equal
  'lt',      // Less than
  'lte',     // Less than or equal
  'in',      // In array
  'nin',     // Not in array
  'contains', // String contains
  'startsWith', // String starts with
  'endsWith',   // String ends with
  'exists',     // Field exists
  'regex',      // Regex match
]);

export type FilterOperator = z.infer<typeof FilterOperator>;

/**
 * Event Filter Condition
 * Defines a single filter condition for event filtering
 */
export const EventFilterCondition = z.object({
  field: z.string().describe('Field path to filter on (supports dot notation, e.g., "user.email")'),
  operator: FilterOperator.describe('Comparison operator'),
  value: z.any().optional().describe('Value to compare against (not needed for "exists" operator)'),
});

export type EventFilterCondition = z.infer<typeof EventFilterCondition>;

/**
 * Event Filter Schema
 * Logical combination of filter conditions
 */
export const EventFilterSchema: z.ZodType<{
  conditions?: EventFilterCondition[];
  and?: EventFilter[];
  or?: EventFilter[];
  not?: EventFilter;
}> = z.object({
  conditions: z.array(EventFilterCondition).optional().describe('Array of filter conditions'),
  and: z.lazy(() => z.array(EventFilterSchema)).optional().describe('AND logical combination of filters'),
  or: z.lazy(() => z.array(EventFilterSchema)).optional().describe('OR logical combination of filters'),
  not: z.lazy(() => EventFilterSchema).optional().describe('NOT logical negation of filter'),
});

export type EventFilter = z.infer<typeof EventFilterSchema>;

/**
 * Event Pattern Schema
 * Event name pattern that supports wildcards for subscriptions
 */
export const EventPatternSchema = z
  .string()
  .min(1)
  .regex(/^[a-z*][a-z0-9_.*]*$/, {
    message: 'Event pattern must be lowercase and may contain letters, numbers, underscores, dots, or wildcards (e.g., "record.*", "*.created", "user.login")',
  })
  .describe('Event pattern (supports wildcards like "record.*" or "*.created")');

export type EventPattern = z.infer<typeof EventPatternSchema>;

/**
 * Event Subscription Config
 * Configuration for subscribing to specific events
 */
export const EventSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid().describe('Unique subscription identifier'),
  events: z.array(EventPatternSchema).describe('Event patterns to subscribe to (supports wildcards, e.g., "record.*", "user.created")'),
  objects: z.array(z.string()).optional().describe('Object names to filter events by (e.g., ["account", "contact"])'),
  filters: EventFilterSchema.optional().describe('Advanced filter conditions for event payloads'),
  channels: z.array(z.string()).optional().describe('Channel names for scoped subscriptions'),
});

export type EventSubscription = z.infer<typeof EventSubscriptionSchema>;

/**
 * Unsubscribe Request
 * Request to unsubscribe from events
 */
export const UnsubscribeRequestSchema = z.object({
  subscriptionId: z.string().uuid().describe('Subscription ID to unsubscribe from'),
});

export type UnsubscribeRequest = z.infer<typeof UnsubscribeRequestSchema>;

// ==========================================
// Presence Tracking
// ==========================================

/**
 * Presence Status Enum
 * User availability status for presence tracking
 */
export const WebSocketPresenceStatus = z.enum([
  'online',      // User is actively online
  'away',        // User is idle/away
  'busy',        // User is busy (do not disturb)
  'offline',     // User is offline
]);

export type WebSocketPresenceStatus = z.infer<typeof WebSocketPresenceStatus>;

/**
 * Presence State Schema
 * Tracks real-time user presence and activity
 */
export const PresenceStateSchema = z.object({
  userId: z.string().describe('User identifier'),
  sessionId: z.string().uuid().describe('Unique session identifier'),
  status: WebSocketPresenceStatus.describe('Current presence status'),
  lastSeen: z.string().datetime().describe('ISO 8601 datetime of last activity'),
  currentLocation: z.string().optional().describe('Current page/route user is viewing'),
  device: z.enum(['desktop', 'mobile', 'tablet', 'other']).optional().describe('Device type'),
  customStatus: z.string().optional().describe('Custom user status message'),
  metadata: z.record(z.any()).optional().describe('Additional custom presence data'),
});

export type PresenceState = z.infer<typeof PresenceStateSchema>;

/**
 * Presence Update Request
 * Client request to update presence status
 */
export const PresenceUpdateSchema = z.object({
  status: WebSocketPresenceStatus.optional().describe('Updated presence status'),
  currentLocation: z.string().optional().describe('Updated current location'),
  customStatus: z.string().optional().describe('Updated custom status message'),
  metadata: z.record(z.any()).optional().describe('Updated metadata'),
});

export type PresenceUpdate = z.infer<typeof PresenceUpdateSchema>;

// ==========================================
// Collaborative Editing Protocol
// ==========================================

/**
 * Cursor Position Schema
 * Represents a cursor position in a document
 */
export const CursorPositionSchema = z.object({
  userId: z.string().describe('User identifier'),
  sessionId: z.string().uuid().describe('Session identifier'),
  documentId: z.string().describe('Document identifier being edited'),
  position: z.object({
    line: z.number().int().nonnegative().describe('Line number (0-indexed)'),
    column: z.number().int().nonnegative().describe('Column number (0-indexed)'),
  }).optional().describe('Cursor position in document'),
  selection: z.object({
    start: z.object({
      line: z.number().int().nonnegative(),
      column: z.number().int().nonnegative(),
    }),
    end: z.object({
      line: z.number().int().nonnegative(),
      column: z.number().int().nonnegative(),
    }),
  }).optional().describe('Selection range (if text is selected)'),
  color: z.string().optional().describe('Cursor color for visual representation'),
  userName: z.string().optional().describe('Display name of user'),
  lastUpdate: z.string().datetime().describe('ISO 8601 datetime of last cursor update'),
});

export type CursorPosition = z.infer<typeof CursorPositionSchema>;

/**
 * Edit Operation Type Enum
 * Types of edit operations for collaborative editing
 */
export const EditOperationType = z.enum([
  'insert',      // Insert text at position
  'delete',      // Delete text from range
  'replace',     // Replace text in range
]);

export type EditOperationType = z.infer<typeof EditOperationType>;

/**
 * Edit Operation Schema
 * Represents a single edit operation on a document
 * Supports Operational Transformation (OT) for conflict resolution
 */
export const EditOperationSchema = z.object({
  operationId: z.string().uuid().describe('Unique operation identifier'),
  documentId: z.string().describe('Document identifier'),
  userId: z.string().describe('User who performed the edit'),
  sessionId: z.string().uuid().describe('Session identifier'),
  type: EditOperationType.describe('Type of edit operation'),
  position: z.object({
    line: z.number().int().nonnegative().describe('Line number (0-indexed)'),
    column: z.number().int().nonnegative().describe('Column number (0-indexed)'),
  }).describe('Starting position of the operation'),
  endPosition: z.object({
    line: z.number().int().nonnegative(),
    column: z.number().int().nonnegative(),
  }).optional().describe('Ending position (for delete/replace operations)'),
  content: z.string().optional().describe('Content to insert/replace'),
  version: z.number().int().nonnegative().describe('Document version before this operation'),
  timestamp: z.string().datetime().describe('ISO 8601 datetime when operation was created'),
  baseOperationId: z.string().uuid().optional().describe('Previous operation ID this builds upon (for OT)'),
});

export type EditOperation = z.infer<typeof EditOperationSchema>;

/**
 * Document State Schema
 * Represents the current state of a collaborative document
 */
export const DocumentStateSchema = z.object({
  documentId: z.string().describe('Document identifier'),
  version: z.number().int().nonnegative().describe('Current document version'),
  content: z.string().describe('Current document content'),
  lastModified: z.string().datetime().describe('ISO 8601 datetime of last modification'),
  activeSessions: z.array(z.string().uuid()).describe('Active editing session IDs'),
  checksum: z.string().optional().describe('Content checksum for integrity verification'),
});

export type DocumentState = z.infer<typeof DocumentStateSchema>;

// ==========================================
// WebSocket Messages
// ==========================================

/**
 * Base WebSocket Message
 * All WebSocket messages extend this base structure
 */
const BaseWebSocketMessage = z.object({
  messageId: z.string().uuid().describe('Unique message identifier'),
  type: WebSocketMessageType.describe('Message type'),
  timestamp: z.string().datetime().describe('ISO 8601 datetime when message was sent'),
});

/**
 * Subscribe Message
 * Client sends this to subscribe to events
 */
export const SubscribeMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('subscribe'),
  subscription: EventSubscriptionSchema.describe('Subscription configuration'),
});

export type SubscribeMessage = z.infer<typeof SubscribeMessageSchema>;

/**
 * Unsubscribe Message
 * Client sends this to unsubscribe from events
 */
export const UnsubscribeMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('unsubscribe'),
  request: UnsubscribeRequestSchema.describe('Unsubscribe request'),
});

export type UnsubscribeMessage = z.infer<typeof UnsubscribeMessageSchema>;

/**
 * Event Message
 * Server sends this when a subscribed event occurs
 */
export const EventMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('event'),
  subscriptionId: z.string().uuid().describe('Subscription ID this event belongs to'),
  eventName: EventNameSchema.describe('Event name'),
  object: z.string().optional().describe('Object name the event relates to'),
  payload: z.any().describe('Event payload data'),
  userId: z.string().optional().describe('User who triggered the event'),
});

export type EventMessage = z.infer<typeof EventMessageSchema>;

/**
 * Presence Message
 * Presence update message
 */
export const PresenceMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('presence'),
  presence: PresenceStateSchema.describe('Presence state'),
});

export type PresenceMessage = z.infer<typeof PresenceMessageSchema>;

/**
 * Cursor Message
 * Cursor position update for collaborative editing
 */
export const CursorMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('cursor'),
  cursor: CursorPositionSchema.describe('Cursor position'),
});

export type CursorMessage = z.infer<typeof CursorMessageSchema>;

/**
 * Edit Message
 * Document edit operation for collaborative editing
 */
export const EditMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('edit'),
  operation: EditOperationSchema.describe('Edit operation'),
});

export type EditMessage = z.infer<typeof EditMessageSchema>;

/**
 * Acknowledgment Message
 * Server acknowledges receipt of a message
 */
export const AckMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('ack'),
  ackMessageId: z.string().uuid().describe('ID of the message being acknowledged'),
  success: z.boolean().describe('Whether the operation was successful'),
  error: z.string().optional().describe('Error message if operation failed'),
});

export type AckMessage = z.infer<typeof AckMessageSchema>;

/**
 * Error Message
 * Server sends error information
 */
export const ErrorMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('error'),
  code: z.string().describe('Error code'),
  message: z.string().describe('Error message'),
  details: z.any().optional().describe('Additional error details'),
});

export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

/**
 * Ping Message
 * Keepalive ping from client or server
 */
export const PingMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('ping'),
});

export type PingMessage = z.infer<typeof PingMessageSchema>;

/**
 * Pong Message
 * Keepalive pong response
 */
export const PongMessageSchema = BaseWebSocketMessage.extend({
  type: z.literal('pong'),
  pingMessageId: z.string().uuid().optional().describe('ID of ping message being responded to'),
});

export type PongMessage = z.infer<typeof PongMessageSchema>;

/**
 * WebSocket Message Union
 * Discriminated union of all WebSocket message types
 */
export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  SubscribeMessageSchema,
  UnsubscribeMessageSchema,
  EventMessageSchema,
  PresenceMessageSchema,
  CursorMessageSchema,
  EditMessageSchema,
  AckMessageSchema,
  ErrorMessageSchema,
  PingMessageSchema,
  PongMessageSchema,
]);

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// ==========================================
// Connection Configuration
// ==========================================

/**
 * WebSocket Connection Config
 * Configuration for WebSocket connections
 */
export const WebSocketConfigSchema = z.object({
  url: z.string().url().describe('WebSocket server URL'),
  protocols: z.array(z.string()).optional().describe('WebSocket sub-protocols'),
  reconnect: z.boolean().optional().default(true).describe('Enable automatic reconnection'),
  reconnectInterval: z.number().int().positive().optional().default(1000).describe('Reconnection interval in milliseconds'),
  maxReconnectAttempts: z.number().int().positive().optional().default(5).describe('Maximum reconnection attempts'),
  pingInterval: z.number().int().positive().optional().default(30000).describe('Ping interval in milliseconds'),
  timeout: z.number().int().positive().optional().default(5000).describe('Message timeout in milliseconds'),
  headers: z.record(z.string()).optional().describe('Custom headers for WebSocket handshake'),
});

export type WebSocketConfig = z.infer<typeof WebSocketConfigSchema>;
