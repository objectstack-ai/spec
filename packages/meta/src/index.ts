/**
 * @objectstack/spec-meta
 * 
 * ObjectStack Metamodel Type Definitions
 * 
 * This package defines the core metamodel interfaces that form the contract
 * between the backend (ObjectQL) parser and the frontend (ObjectUI) renderer.
 * 
 * Guiding Principle: "Strict Types, No Logic"
 * This package has NO database connections, NO UI components, and NO runtime business logic.
 */

export * from './field-type';
export * from './object-field';
export * from './object-entity';
export * from './object-view';
export * from './examples';
