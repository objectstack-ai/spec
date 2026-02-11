// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Event Bus Protocol
 * 
 * This file re-exports all event schemas from modular sub-modules for backward compatibility
 * and to provide a single stable entrypoint for consumers (via `@objectstack/spec/kernel`).
 * 
 * NOTE: The `./events/*` sub-modules referenced below are an internal source-code organization
 * detail of the kernel. External code should continue to import event schemas from the
 * published kernel entrypoint, for example:
 * 
 *   import { EventBusConfigSchema } from '@objectstack/spec/kernel';
 * 
 * and SHOULD NOT import from `@objectstack/spec/kernel/events/*` unless those paths are
 * explicitly documented as public entrypoints in the package exports.
 * 
 * Internal sub-modules:
 * - events/core.zod.ts: Event priority, metadata, type definition, base event
 * - events/handlers.zod.ts: Event handlers, routes, persistence
 * - events/queue.zod.ts: Event queue, replay, sourcing configuration
 * - events/dlq.zod.ts: Dead letter queue, event log entries
 * - events/integrations.zod.ts: Webhooks, message queues, real-time notifications
 * - events/bus.zod.ts: Complete event bus configuration and helper functions
 */

export * from './events/core.zod';
export * from './events/handlers.zod';
export * from './events/queue.zod';
export * from './events/dlq.zod';
export * from './events/integrations.zod';
export * from './events/bus.zod';
