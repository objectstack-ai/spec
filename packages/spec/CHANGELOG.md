# @objectstack/spec

## 1.0.0

### Major Changes

- 555e6a7: Refactor: Deprecated View Storage protocol in favor of Metadata Views.

  - **BREAKING**: Removed `view-storage.zod.ts` and `ViewStorage` related types from `@objectstack/spec`.
  - **BREAKING**: Removed `createView`, `updateView`, `deleteView`, `listViews` from `ObjectStackProtocol` interface.
  - **BREAKING**: Removed in-memory View Storage implementation from `@objectstack/objectql`.
  - **UPDATE**: `@objectstack/plugin-msw` now dynamically loads `@objectstack/objectql` to avoid hard dependencies.

## 0.8.1

## 1.0.0

### Minor Changes

- # Upgrade to Zod v4 and Protocol Improvements

  This release includes a major upgrade to the core validation engine (Zod v4) and aligns all protocol definitions with stricter type safety.

## 0.7.2

### Patch Changes

- fb41cc0: Patch release: Updated documentation and JSON schemas

## 0.7.1

### Patch Changes

- Patch release for maintenance and stability improvements

## 0.6.1

### Patch Changes

- Patch release for maintenance and stability improvements

## 0.6.0

### Minor Changes

- b2df5f7: Unified version bump to 0.5.0

  - Standardized all package versions to 0.5.0 across the monorepo
  - Fixed driver-memory package.json paths for proper module resolution
  - Ensured all packages are in sync for the 0.5.0 release

## 0.4.2

### Patch Changes

- Unify all package versions to 0.4.2

## 0.4.1

### Patch Changes

- Version synchronization and dependency updates

  - Synchronized plugin-msw version to 0.4.1
  - Updated runtime peer dependency versions to ^0.4.1
  - Fixed internal dependency version mismatches

## 0.4.0

### Minor Changes

- Release version 0.4.0

## 0.3.3

### Patch Changes

- Workflow and configuration improvements

  - Enhanced GitHub workflows for CI, release, and PR automation
  - Added comprehensive prompt templates for different protocol areas
  - Improved project documentation and automation guides
  - Updated changeset configuration
  - Added cursor rules for better development experience

## 0.3.2

### Patch Changes

- Patch release for maintenance and stability improvements

## 0.3.1

## 0.3.0

### Minor Changes

- Documentation and project structure improvements

  - Comprehensive documentation structure with CONTRIBUTING.md
  - Documentation hub at docs/README.md
  - Standards documentation (naming-conventions, api-design, error-handling)
  - Architecture deep dives (data-layer, ui-layer, system-layer)
  - Code of Conduct
  - Enhanced documentation organization following industry best practices

## 0.2.0

### Minor Changes

- Initial release of ObjectStack Protocol & Specification packages

  This is the first public release of the ObjectStack ecosystem, providing:

  - Core protocol definitions and TypeScript types
  - ObjectQL query language and runtime
  - Memory driver for in-memory data storage
  - Client library for interacting with ObjectStack
  - Hono server plugin for REST API endpoints
  - Complete JSON schema generation for all specifications

## 0.1.2

### Patch Changes

- Remove debug logs from registry and protocol modules

## 0.1.1

### Patch Changes

- b58a0ef: Initial release of ObjectStack Protocol & Specification.
