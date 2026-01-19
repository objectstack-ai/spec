/**
 * @objectstack/spec
 * 
 * ObjectStack Protocol & Specification
 * 
 * This package contains the core interfaces, schemas, and conventions for the ObjectStack ecosystem.
 * All types and schemas are centralized here.
 */

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
export * from './data/mapping.zod';

// AI Protocol (Agent, RAG)
export * from './ai/agent.zod';

// UI Protocol (Layout, Navigation, Interaction)
export * from './ui/app.zod';
export * from './ui/view.zod';
export * from './ui/dashboard.zod';
export * from './ui/report.zod';
export * from './ui/action.zod';
export * from './ui/page.zod';

// System Protocol (Manifest, Runtime, Constants)
export * from './system/manifest.zod';
export * from './system/datasource.zod';
export * from './system/api.zod';
export * from './system/identity.zod';
export * from './system/policy.zod';
export * from './system/role.zod';
export * from './system/territory.zod';
export * from './system/license.zod';
export * from './system/webhook.zod';
export * from './system/translation.zod';
export * from './system/constants';
export * from './system/types';
export * from './system/discovery.zod';

