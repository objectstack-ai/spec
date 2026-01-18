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

// Zod Schemas & Inferred Types (Bundle)
export * from './zod/bundle/manifest.zod';

// Runtime Constants
export * from './constants';

// Runtime Types (Interfaces only, no Zod)
export * from './types/runtime';

export * from '@objectstack/spec-plugin';
export * from '@objectstack/spec-schemas';
export * from '@objectstack/spec-constants';
