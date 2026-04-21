// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ServiceObject } from '@objectstack/spec/data';
import {
  SysMetadata,
  SysObject,
  SysView,
  SysAgent,
  SysTool,
  SysFlow,
} from './objects';

/**
 * System Object Registry
 *
 * The complete catalog of ObjectOS system objects.
 * These objects define the platform's metadata layer as queryable data.
 *
 * ## Naming & FQN
 *
 * Every system object is registered under the reserved `sys` namespace.
 * The fully qualified name (FQN) used by `SchemaRegistry` is therefore
 * `sys__{name}` (double underscore separator, see
 * `packages/objectql/src/registry.ts` → `computeFQN`).
 *
 * Each object's `name` is the short, unprefixed form (e.g. `object`, `view`,
 * `agent`) — the `sys__` prefix is produced automatically from the owning
 * manifest's `namespace: 'sys'`. Do **not** hard-code `sys_` into the `name`
 * field: that would produce a doubly-prefixed FQN like `sys__sys_object`.
 *
 * ## Architecture
 * - sys__object: Object definitions (queryable)
 * - sys__view:   View definitions (queryable)
 * - sys__agent:  AI Agent definitions (queryable)
 * - sys__tool:   AI Tool definitions (queryable)
 * - sys__flow:   Flow definitions (queryable)
 *
 * `sys__metadata` (the generic metadata envelope / source of truth) is owned
 * by `@objectstack/metadata` and is **not** included here to avoid FQN
 * ownership conflicts. The richer `SysMetadata` definition is still exported
 * from `./objects` for reference and can be imported directly by consumers
 * that want to inspect or extend it.
 *
 * ## Usage
 * ```typescript
 * import { SystemObjects } from '@objectstack/objectos';
 *
 * // Register all system objects
 * for (const [name, definition] of Object.entries(SystemObjects)) {
 *   await kernel.metadata.register('object', name, definition, {
 *     scope: 'system',
 *     isSystem: true,
 *     managedBy: 'platform',
 *   });
 * }
 * ```
 */
export const SystemObjects: Record<string, ServiceObject> = {
  // Data Protocol
  object: SysObject as unknown as ServiceObject,

  // UI Protocol
  view: SysView as unknown as ServiceObject,

  // Automation Protocol
  flow: SysFlow as unknown as ServiceObject,

  // AI Protocol
  agent: SysAgent as unknown as ServiceObject,
  tool: SysTool as unknown as ServiceObject,
};

/**
 * Reference definition for the generic metadata envelope.
 *
 * Exported separately from {@link SystemObjects} because the canonical
 * `sys__metadata` object is owned by `@objectstack/metadata`. Auto-registering
 * this variant would collide on the same FQN. Consumers that explicitly want
 * this richer schema can import it directly.
 */
export { SysMetadata };

/**
 * Get all system object definitions
 */
export function getSystemObjects(): ServiceObject[] {
  return Object.values(SystemObjects);
}

/**
 * Get system object by short name (e.g. `'object'`, `'view'`).
 *
 * Note: pass the unprefixed short name, not the FQN. The FQN for any system
 * object is `sys__{name}`.
 */
export function getSystemObject(name: string): ServiceObject | undefined {
  return SystemObjects[name];
}

/**
 * Get system object short names (unprefixed). The FQN for each is `sys__{name}`.
 */
export function getSystemObjectNames(): string[] {
  return Object.keys(SystemObjects);
}

