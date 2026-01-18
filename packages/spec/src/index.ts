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
export * from './data/workflow.zod';
export * from './data/flow.zod';
export * from './data/dataset.zod';

// UI Protocol (Layout, Navigation, Interaction)
export * from './ui/app.zod';
export * from './ui/view.zod';
export * from './ui/dashboard.zod';
export * from './ui/report.zod';
export * from './ui/action.zod';

// System Protocol (Manifest, Runtime, Constants)
export * from './system/manifest.zod';
export * from './system/datasource.zod';
export * from './system/api.zod';
export * from './system/translation.zod';
export * from './system/constants';
export * from './system/types';

