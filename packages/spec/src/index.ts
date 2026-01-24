/**
 * @objectstack/spec
 * 
 * ObjectStack Protocol & Specification
 * 
 * This package does NOT export types at the root level to prevent naming conflicts.
 * Please use namespaced imports or subpath imports.
 * 
 * ## Import Styles
 * 
 * ### Style 1: Namespace Imports from Root
 * ```typescript
 * import { Data, UI, System, AI, API } from '@objectstack/spec';
 * 
 * const field: Data.Field = { name: 'task_name', type: 'text' };
 * const user: System.User = { id: 'u1', email: 'user@example.com' };
 * ```
 * 
 * ### Style 2: Namespace Imports via Subpath
 * ```typescript
 * import * as Data from '@objectstack/spec/data';
 * import * as UI from '@objectstack/spec/ui';
 * import * as System from '@objectstack/spec/system';
 * 
 * const field: Data.Field = { name: 'task_name', type: 'text' };
 * const user: System.User = { id: 'u1', email: 'user@example.com' };
 * ```
 * 
 * ### Style 3: Direct Subpath Imports
 * ```typescript
 * import { Field, FieldType } from '@objectstack/spec/data';
 * import { User, Session } from '@objectstack/spec/system';
 * 
 * const field: Field = { name: 'task_name', type: 'text' };
 * const user: User = { id: 'u1', email: 'user@example.com' };
 * ```
 */

// ============================================================================
// NAMESPACE EXPORTS
// ============================================================================
// Export protocol domains as namespaces to prevent naming conflicts
// and establish clear boundaries between different protocol layers.
export * as Data from './data';
export * as Driver from './driver';
export * as Permission from './permission';
export * as UI from './ui';
export * as System from './system';
export * as Kernel from './kernel';
export * as Hub from './hub';
export * as AI from './ai';
export * as API from './api';
export * as Automation from './automation';

