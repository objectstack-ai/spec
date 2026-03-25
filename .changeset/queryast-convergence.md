---
"@objectstack/spec": minor
"@objectstack/core": minor
"@objectstack/objectql": minor
"@objectstack/client": minor
"@objectstack/runtime": patch
"@objectstack/plugin-auth": patch
---

Deprecate DataEngineQueryOptions in favor of QueryAST-aligned EngineQueryOptions.

Engine, Protocol, and Client now use standard QueryAST parameter names:
- `filter` → `where`
- `select` → `fields`
- `sort` → `orderBy`
- `skip` → `offset`
- `populate` → `expand`
- `top` → `limit`

The old DataEngine* schemas and types are preserved with `@deprecated` markers for backward compatibility.
