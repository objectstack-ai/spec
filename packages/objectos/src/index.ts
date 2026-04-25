// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * @objectstack/objectos
 *
 * ObjectOS - Runtime metadata object registry
 *
 * This package contains the runtime registry for ObjectOS metadata-layer
 * objects. Concrete platform object definitions live in
 * `@objectstack/platform-objects`.
 *
 * ## Architecture
 * - Protocol Layer: `@objectstack/spec` — Zod schemas (ObjectSchema, ViewSchema)
 * - Platform Object Layer: `@objectstack/platform-objects` — Concrete platform objects
 * - Runtime Layer: `@objectstack/objectos` — Runtime-facing object registry
 * - Service Layer: `@objectstack/metadata` — Metadata management service
 *
 * ## Usage
 * ```typescript
 * import { SystemObjects } from '@objectstack/objectos';
 *
 * // Register all system objects
 * for (const [name, definition] of Object.entries(SystemObjects)) {
 *   await metadataService.register('object', name, definition);
 * }
 * ```
 *
 * ## Design Philosophy
 *
 * ObjectOS follows the "Metadata as Data" pattern:
 * 1. **Dual-Table Architecture**: Metadata stored in both sys_metadata (source) and type-specific tables (queryable)
 * 2. **Object Protocol**: All system objects use the same protocol as business data
 * 3. **Auto-Generated UI**: Studio renders metadata forms/tables using existing view components
 * 4. **Version Control**: Full version history via sys_metadata_history table
 * 5. **Package Management**: Metadata tracked by package ownership
 *
 * @module @objectstack/objectos
 */

export * from './registry';
