// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { ServiceObject } from '@objectstack/spec/data';
import {
  SysMetadata,
  SysObject,
  SysView,
  SysAgent,
  SysTool,
  SysFlow,
} from '@objectstack/platform-objects/metadata';

/**
 * System Object Registry
 *
 * The complete catalog of ObjectOS system objects.
 * These objects define the platform's metadata layer as queryable data.
 *
 * ## Naming
 *
 * Every system object uses the full `sys_` prefixed name as its canonical
 * name (e.g. `sys_object`, `sys_view`). These objects are registered without
 * a package namespace, so their FQN equals their short name.
 *
 * ## Architecture
 * - sys_object: Object definitions (queryable)
 * - sys_view:   View definitions (queryable)
 * - sys_agent:  AI Agent definitions (queryable)
 * - sys_tool:   AI Tool definitions (queryable)
 * - sys_flow:   Flow definitions (queryable)
 *
 * `sys_metadata` (the generic metadata envelope / source of truth) is owned
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
  sys_object: SysObject as unknown as ServiceObject,

  // UI Protocol
  sys_view: SysView as unknown as ServiceObject,

  // Automation Protocol
  sys_flow: SysFlow as unknown as ServiceObject,

  // AI Protocol
  sys_agent: SysAgent as unknown as ServiceObject,
  sys_tool: SysTool as unknown as ServiceObject,
};

/**
 * Reference definition for the generic metadata envelope.
 *
 * Exported separately from {@link SystemObjects} because the canonical
 * `sys_metadata` object is owned by `@objectstack/metadata`. Auto-registering
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
 * Get system object by name (e.g. `'sys_object'`, `'sys_view'`).
 */
export function getSystemObject(name: string): ServiceObject | undefined {
  return SystemObjects[name];
}

/**
 * Get system object names.
 */
export function getSystemObjectNames(): string[] {
  return Object.keys(SystemObjects);
}
