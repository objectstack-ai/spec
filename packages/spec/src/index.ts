/**
 * @objectstack/spec
 * 
 * ObjectStack Protocol & Specification
 * 
 * This package contains the core interfaces, schemas, and conventions for the ObjectStack ecosystem.
 * All types and schemas are centralized here.
 * 
 * ## Import Styles
 * 
 * ### Flat Imports (Backward Compatible)
 * ```typescript
 * import { ObjectSchema, Field, User, App } from '@objectstack/spec';
 * ```
 * 
 * ### Namespaced Imports (Recommended for New Code)
 * ```typescript
 * import * as Data from '@objectstack/spec/data';
 * import * as UI from '@objectstack/spec/ui';
 * import * as System from '@objectstack/spec/system';
 * import * as AI from '@objectstack/spec/ai';
 * import * as API from '@objectstack/spec/api';
 * 
 * const user: System.User = { ... };
 * const field: Data.Field = { ... };
 * ```
 */

// ============================================================================
// FLAT EXPORTS (Backward Compatible)
// ============================================================================
// All schemas and types are re-exported at the root level for backward compatibility.
// This maintains the existing API surface for existing code.

// Data Protocol (Schema, Validation, Logic)
export * from './data/field.zod';
export * from './data/object.zod';
export * from './data/validation.zod';
export * from './data/permission.zod';
export * from './data/sharing.zod';
export * from './data/workflow.zod';
export * from './data/flow.zod';
export * from './data/dataset.zod';
export * from './data/query.zod';
export * from './data/filter.zod';
export * from './data/mapping.zod';
export * from './data/trigger.zod';

// API Protocol (Envelopes, Contracts)
export * from './api/contract.zod';

// AI Protocol (Agent, RAG, Model Registry, NLQ)
export * from './ai/agent.zod';
export * from './ai/model-registry.zod';
export * from './ai/rag-pipeline.zod';
export * from './ai/nlq.zod';

// UI Protocol (Layout, Navigation, Interaction)
export * from './ui/app.zod';
export * from './ui/view.zod';
export * from './ui/dashboard.zod';
export * from './ui/report.zod';
export * from './ui/action.zod';
export * from './ui/page.zod';
export * from './ui/widget.zod';
export * from './ui/theme.zod';

// System Protocol (Manifest, Runtime, Constants)
export * from './system/manifest.zod';
export * from './system/datasource.zod';
export * from './system/api.zod';
export * from './system/identity.zod';
export * from './system/auth.zod';
export * from './system/auth-protocol';
export * from './system/organization.zod';
export * from './system/policy.zod';
export * from './system/role.zod';
export * from './system/territory.zod';
export * from './system/license.zod';
export * from './system/webhook.zod';
export * from './system/translation.zod';
export * from './system/driver.zod';
export * from './system/constants';
export * from './system/types';
export * from './system/discovery.zod';
export * from './system/plugin.zod';

