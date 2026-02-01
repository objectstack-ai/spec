---
"@objectstack/spec": major
"@objectstack/objectql": major
"@objectstack/plugin-msw": patch
---

Refactor: Deprecated View Storage protocol in favor of Metadata Views.

- **BREAKING**: Removed `view-storage.zod.ts` and `ViewStorage` related types from `@objectstack/spec`.
- **BREAKING**: Removed `createView`, `updateView`, `deleteView`, `listViews` from `ObjectStackProtocol` interface.
- **BREAKING**: Removed in-memory View Storage implementation from `@objectstack/objectql`.
- **UPDATE**: `@objectstack/plugin-msw` now dynamically loads `@objectstack/objectql` to avoid hard dependencies.
