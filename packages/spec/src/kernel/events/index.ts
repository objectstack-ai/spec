// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Event Bus Protocol - Modular Sub-modules
 * 
 * This barrel re-exports all event sub-modules for convenient importing.
 * 
 * Sub-modules:
 * - core.zod.ts: Event priority, metadata, type definition, base event
 * - handlers.zod.ts: Event handlers, routes, persistence
 * - queue.zod.ts: Event queue, replay, sourcing configuration
 * - dlq.zod.ts: Dead letter queue, event log entries
 * - integrations.zod.ts: Webhooks, message queues, real-time notifications
 * - bus.zod.ts: Complete event bus configuration and helper functions
 */

export * from './core.zod';
export * from './handlers.zod';
export * from './queue.zod';
export * from './dlq.zod';
export * from './integrations.zod';
export * from './bus.zod';
