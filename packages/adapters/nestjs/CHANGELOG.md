# @objectstack/nestjs

## 1.0.7

### Patch Changes

- ebdf787: feat: implement standard service discovery via `/.well-known/objectstack`
- Updated dependencies [ebdf787]
  - @objectstack/runtime@1.0.7

## 1.0.6

### Patch Changes

- @objectstack/runtime@1.0.6

## 1.0.5

### Patch Changes

- b1d24bd: refactor: migrate build system from tsc to tsup for faster builds
  - Replaced `tsc` with `tsup` (using esbuild) across all packages
  - Added shared `tsup.config.ts` in workspace root
  - Added `tsup` as workspace dev dependency
  - significantly improved build performance
- Updated dependencies [b1d24bd]
- Updated dependencies [877b864]
  - @objectstack/runtime@1.0.5

## 1.0.4

### Patch Changes

- @objectstack/runtime@1.0.4

## 1.0.3

### Patch Changes

- Updated dependencies [fb2eabd]
  - @objectstack/runtime@1.0.3

## 1.0.2

### Patch Changes

- 109fc5b: Unified patch release to align all package versions.
- Updated dependencies [a0a6c85]
- Updated dependencies [109fc5b]
  - @objectstack/runtime@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies
  - @objectstack/runtime@1.0.1

## 1.0.0

### Major Changes

- Major version release for ObjectStack Protocol v1.0.
  - Stabilized Protocol Definitions
  - Enhanced Runtime Plugin Support
  - Fixed Type Compliance across Monorepo

### Patch Changes

- Updated dependencies
  - @objectstack/runtime@1.0.0
