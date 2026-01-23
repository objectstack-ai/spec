import { z } from 'zod';

/**
 * Event Metadata Schema
 * Metadata associated with every event
 */
export const EventMetadataSchema = z.object({
  source: z.string().describe('Event source (e.g., plugin name, system component)'),
  timestamp: z.string().datetime().describe('ISO 8601 datetime when event was created'),
  userId: z.string().optional().describe('User who triggered the event'),
  tenantId: z.string().optional().describe('Tenant identifier for multi-tenant systems'),
});

/**
 * Event Schema
 * Base schema for all events in the system
 */
export const EventSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_.]*$/).describe('Event name (snake_case with dots, e.g., user.created)'),
  payload: z.any().describe('Event payload schema'),
  metadata: EventMetadataSchema.describe('Event metadata'),
});

export type Event = z.infer<typeof EventSchema>;

/**
 * Event Handler Schema
 * Defines how to handle a specific event
 */
export const EventHandlerSchema = z.object({
  eventName: z.string().describe('Name of event to handle (supports wildcards like user.*)'),
  handler: z.function().args(EventSchema).returns(z.promise(z.void())).describe('Handler function'),
  priority: z.number().int().default(0).describe('Execution priority (lower numbers execute first)'),
  async: z.boolean().default(true).describe('Execute in background (true) or block (false)'),
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
});

export type EventPersistence = z.infer<typeof EventPersistenceSchema>;
