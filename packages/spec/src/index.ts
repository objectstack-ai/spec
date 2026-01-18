/**
 * @objectstack/spec
 * 
 * ObjectStack Protocol & Specification
 * 
 * This package contains the core interfaces, schemas, and conventions for the ObjectStack ecosystem.
 * It defines the "Constitution" of the system - the shared language that ObjectOS, ObjectStudio,
 * ObjectCloud, and all third-party plugins use to communicate.
 * 
 * This package contains:
 * - TypeScript Interfaces (Shared types)
 * - Zod Schemas (Validation rules with type inference)
 * - Constants (Convention configurations)
 * 
 * Guiding Principle: "Strict Types, No Logic"
 * This package has NO database connections, NO UI components, and NO runtime business logic.
 */

// Re-export from sub-packages for backward compatibility
export * from '@objectstack/spec-meta';
export * from '@objectstack/spec-plugin';
export * from '@objectstack/spec-schemas';
export * from '@objectstack/spec-constants';
