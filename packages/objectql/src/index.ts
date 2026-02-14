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
export { ObjectQL, ObjectRepository, ScopedContext } from './engine.js';
export type { ObjectQLHostContext, HookHandler, HookEntry, OperationContext, EngineMiddleware } from './engine.js';

// Export MetadataFacade
export { MetadataFacade } from './metadata-facade.js';

// Export Plugin Shim
export { ObjectQLPlugin } from './plugin.js';

// Export Kernel Factory
export { createObjectQLKernel } from './kernel-factory.js';
export type { ObjectQLKernelOptions } from './kernel-factory.js';

// Export Utilities
export {
  toTitleCase,
  convertIntrospectedSchemaToObjects,
} from './util.js';
export type {
  IntrospectedColumn,
  IntrospectedForeignKey,
  IntrospectedTable,
  IntrospectedSchema,
} from './util.js';
