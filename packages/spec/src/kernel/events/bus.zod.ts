// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { EventTypeDefinitionSchema } from './core.zod';
import { EventHandlerSchema, EventPersistenceSchema } from './handlers.zod';
import { EventQueueConfigSchema, EventSourcingConfigSchema } from './queue.zod';
import { EventWebhookConfigSchema, EventMessageQueueConfigSchema, RealTimeNotificationConfigSchema } from './integrations.zod';

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
 * @deprecated Move to `@objectstack/core`. Will be removed from spec in v3.0.0.
 */
export function createEventBusConfig<T extends z.input<typeof EventBusConfigSchema>>(config: T): T {
  return config;
}

/**
 * Helper to create event type definition
 * @deprecated Move to `@objectstack/core`. Will be removed from spec in v3.0.0.
 */
export function createEventTypeDefinition<T extends z.input<typeof EventTypeDefinitionSchema>>(definition: T): T {
  return definition;
}

/**
 * Helper to create event webhook configuration
 * @deprecated Move to `@objectstack/core`. Will be removed from spec in v3.0.0.
 */
export function createEventWebhookConfig<T extends z.input<typeof EventWebhookConfigSchema>>(config: T): T {
  return config;
}
