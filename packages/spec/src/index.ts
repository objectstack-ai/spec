/**
 * @objectstack/spec
 * 
 * ObjectStack Protocol & Specification
 * 
 * This package contains the core interfaces, schemas, and conventions for the ObjectStack ecosystem.
 * All types and schemas are centralized here.
 */

// Zod Schemas & Inferred Types (Meta)
export * from './zod/meta/field.zod';
export * from './zod/meta/entity.zod';
export * from './zod/meta/view.zod';
export * from './zod/meta/action.zod';
export * from './zod/meta/validation.zod';
export * from './zod/meta/permission.zod';
export * from './zod/meta/workflow.zod';
export * from './zod/meta/app.zod';
export * from './zod/meta/dashboard.zod';

// Zod Schemas & Inferred Types (Bundle)
export * from './zod/bundle/manifest.zod';

// Runtime Constants
export * from './constants';

// Runtime Types (Interfaces only, no Zod)
export * from './types/runtime';

