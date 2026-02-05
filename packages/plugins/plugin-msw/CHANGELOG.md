# @objectstack/plugin-msw

## 1.0.2

### Patch Changes

- a0a6c85: Infrastructure and development tooling improvements

  - Add changeset configuration for automated version management
  - Add comprehensive GitHub Actions workflows (CI, CodeQL, linting, releases)
  - Add development configuration files (.cursorrules, .github/prompts)
  - Add documentation files (ARCHITECTURE.md, CONTRIBUTING.md, workflows docs)
  - Update test script configuration in package.json
  - Add @objectstack/cli to devDependencies for better development experience

- 109fc5b: Unified patch release to align all package versions.
- Updated dependencies [a0a6c85]
- Updated dependencies [109fc5b]
  - @objectstack/spec@1.0.2
  - @objectstack/core@1.0.2
  - @objectstack/types@1.0.2
  - @objectstack/objectql@1.0.2
  - @objectstack/runtime@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies
  - @objectstack/runtime@1.0.1
  - @objectstack/spec@1.0.1
  - @objectstack/types@1.0.1
  - @objectstack/objectql@1.0.1

## 1.0.0

### Major Changes

- Major version release for ObjectStack Protocol v1.0.
  - Stabilized Protocol Definitions
  - Enhanced Runtime Plugin Support
  - Fixed Type Compliance across Monorepo

### Patch Changes

- Updated dependencies
  - @objectstack/spec@1.0.0
  - @objectstack/runtime@1.0.0
  - @objectstack/objectql@1.0.0
  - @objectstack/types@1.0.0

## 0.9.2

### Patch Changes

- Updated dependencies
  - @objectstack/spec@0.9.2
  - @objectstack/objectql@0.9.2
  - @objectstack/runtime@0.9.2
  - @objectstack/types@0.9.2

## 0.9.1

### Patch Changes

- Patch release for maintenance and stability improvements. All packages updated with unified versioning.
- Updated dependencies
  - @objectstack/spec@0.9.1
  - @objectstack/types@0.9.1
  - @objectstack/objectql@0.9.1
  - @objectstack/runtime@0.9.1

## 0.8.2

### Patch Changes

- 555e6a7: Refactor: Deprecated View Storage protocol in favor of Metadata Views.

  - **BREAKING**: Removed `view-storage.zod.ts` and `ViewStorage` related types from `@objectstack/spec`.
  - **BREAKING**: Removed `createView`, `updateView`, `deleteView`, `listViews` from `ObjectStackProtocol` interface.
  - **BREAKING**: Removed in-memory View Storage implementation from `@objectstack/objectql`.
  - **UPDATE**: `@objectstack/plugin-msw` now dynamically loads `@objectstack/objectql` to avoid hard dependencies.

- Updated dependencies [555e6a7]
  - @objectstack/spec@0.8.2
  - @objectstack/objectql@0.8.2
  - @objectstack/runtime@0.8.2
  - @objectstack/types@0.8.2

## 0.8.1

### Patch Changes

- @objectstack/spec@0.8.1
- @objectstack/types@0.8.1
- @objectstack/objectql@0.8.1
- @objectstack/runtime@0.8.1

## 1.0.0

### Minor Changes

- # Upgrade to Zod v4 and Protocol Improvements

  This release includes a major upgrade to the core validation engine (Zod v4) and aligns all protocol definitions with stricter type safety.

### Patch Changes

- Updated dependencies
  - @objectstack/spec@1.0.0
  - @objectstack/types@1.0.0
  - @objectstack/objectql@1.0.0
  - @objectstack/runtime@1.0.0

## 0.7.2

### Patch Changes

- fb41cc0: Patch release: Updated documentation and JSON schemas
- Updated dependencies [fb41cc0]
  - @objectstack/spec@0.7.2
  - @objectstack/types@0.7.2
  - @objectstack/objectql@0.7.2
  - @objectstack/runtime@0.7.2

## 0.7.1

### Patch Changes

- Patch release for maintenance and stability improvements
- Updated dependencies
  - @objectstack/spec@0.7.1
  - @objectstack/objectql@0.7.1
  - @objectstack/runtime@0.7.1
  - @objectstack/types@0.7.1

## 0.6.1

### Patch Changes

- Patch release for maintenance and stability improvements
- Updated dependencies
  - @objectstack/spec@0.6.1
  - @objectstack/objectql@0.6.1
  - @objectstack/runtime@0.6.1
  - @objectstack/types@0.6.1

## 0.6.0

### Minor Changes

- b2df5f7: Unified version bump to 0.5.0

  - Standardized all package versions to 0.5.0 across the monorepo
  - Fixed driver-memory package.json paths for proper module resolution
  - Ensured all packages are in sync for the 0.5.0 release

### Patch Changes

- Updated dependencies [b2df5f7]
  - @objectstack/spec@0.6.0
  - @objectstack/runtime@0.6.0
  - @objectstack/types@0.6.0

## 0.4.2

### Patch Changes

- Unify all package versions to 0.4.2
- Updated dependencies
  - @objectstack/spec@0.4.2
  - @objectstack/runtime@0.4.2
  - @objectstack/types@0.4.2

## 0.4.1

### Patch Changes

- Version synchronization and dependency updates

  - Synchronized plugin-msw version to 0.4.1
  - Updated runtime peer dependency versions to ^0.4.1
  - Fixed internal dependency version mismatches

- Updated dependencies
  - @objectstack/spec@0.4.1
  - @objectstack/types@0.4.1
  - @objectstack/runtime@0.4.1

## 0.3.3

### Patch Changes

- Updated dependencies
  - @objectstack/spec@0.3.3
  - @objectstack/runtime@0.3.3
  - @objectstack/types@0.3.3

## 0.3.2

### Patch Changes

- Patch release for maintenance and stability improvements
- Updated dependencies
  - @objectstack/runtime@0.3.2
  - @objectstack/spec@0.3.2
  - @objectstack/types@0.3.2

## 0.3.1

### Added

- Initial release of MSW plugin for ObjectStack
- `MSWPlugin` class implementing RuntimePlugin interface
- `ObjectStackServer` mock server for handling API calls
- Automatic generation of MSW handlers for ObjectStack API endpoints
- Support for browser and Node.js environments
- Custom handler support
- Comprehensive documentation and examples
- TypeScript type definitions

### Features

- Discovery endpoint mocking
- Metadata endpoint mocking
- Data CRUD operation mocking
- UI protocol endpoint mocking
- Request logging support
- Configurable base URL
- Integration with ObjectStack Runtime Protocol
