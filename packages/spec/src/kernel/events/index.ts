// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Event Bus Protocol - Kernel Events
 *
 * NOTE:
 * - Canonical Zod schemas live in the sibling `*.zod.ts` files
 *   (e.g. `core.zod.ts`, `handlers.zod.ts`, `queue.zod.ts`, `dlq.zod.ts`,
 *   `integrations.zod.ts`, `bus.zod.ts`).
 * - The public entrypoint is `kernel/events.zod.ts`, which re-exports all
 *   sub-modules via `@objectstack/spec/kernel`.
 * - `@objectstack/spec/kernel/events` is NOT a published subpath in `package.json`
 *   exports. Do not rely on this barrel for external consumption.
 *
 * This file exists only for internal convenience and is not part of the
 * published API surface.
 */
