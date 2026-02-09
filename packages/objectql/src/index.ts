// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

// Export Registry
export { 
  SchemaRegistry,
  computeFQN,
  parseFQN,
  RESERVED_NAMESPACES,
  DEFAULT_OWNER_PRIORITY,
  DEFAULT_EXTENDER_PRIORITY,
} from './registry.js';
export type { ObjectContributor } from './registry.js';

// Export Protocol Implementation
export { ObjectStackProtocolImplementation } from './protocol.js';

// Export Engine
export { ObjectQL } from './engine.js';
export type { ObjectQLHostContext, HookHandler } from './engine.js';

// Export Plugin Shim
export { ObjectQLPlugin } from './plugin.js';

// Moved logic to engine.ts
