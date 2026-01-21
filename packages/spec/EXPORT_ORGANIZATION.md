# Export Organization Guide

## Problem Statement

The `@objectstack/spec` package exports many schemas and types. As the API surface grows, there's a risk of:
1. **Naming conflicts**: Different protocols might want to use similar names
2. **Poor discoverability**: With 200+ exports in a flat namespace, it's hard to find what you need
3. **Unclear domain boundaries**: Not obvious which exports belong to which protocol

## Solution: Dual Export Strategy

We now support **both flat and namespaced imports** to give developers flexibility while preventing future naming conflicts.

### 1. Flat Exports (Backward Compatible)

All existing imports continue to work:

```typescript
import { Field, User, App, Agent } from '@objectstack/spec';
```

**When to use:**
- Migrating existing code
- Importing a few specific types
- Quick prototyping

### 2. Namespaced Exports (Recommended)

Import by protocol domain for better organization:

```typescript
import * as Data from '@objectstack/spec/data';
import * as UI from '@objectstack/spec/ui';
import * as System from '@objectstack/spec/system';
import * as AI from '@objectstack/spec/ai';
import * as API from '@objectstack/spec/api';

const field: Data.Field = { /* ... */ };
const user: System.User = { /* ... */ };
```

**When to use:**
- New code
- Working with many types from the same protocol
- Want to avoid any risk of naming conflicts
- Want clear domain boundaries in your code

## Protocol Domains

### `@objectstack/spec/data` - Data Protocol
Core business logic and data modeling:
- `Object`, `Field`, `FieldType`
- `Query`, `Filter`, `Sort`
- `Validation`, `Permission`, `Sharing`
- `Flow`, `Workflow`, `Trigger`
- `Dataset`, `Mapping`

### `@objectstack/spec/ui` - UI Protocol
Presentation and interaction:
- `App`, `View`, `Page`
- `Dashboard`, `Report`, `Widget`
- `Action`, `Theme`

### `@objectstack/spec/system` - System Protocol
Runtime configuration and security:
- `Manifest`, `Datasource`, `Driver`
- `User`, `Account`, `Session`
- `Organization`, `Role`, `Permission`
- `Auth`, `Policy`, `Territory`
- `Webhook`, `License`, `Translation`
- `Plugin`

### `@objectstack/spec/ai` - AI Protocol
AI/ML capabilities:
- `Agent`, `AITool`, `AIKnowledge`
- `ModelRegistry`, `ModelProvider`
- `RAGPipeline`, `VectorStore`
- `NLQRequest`, `QueryIntent`

### `@objectstack/spec/api` - API Protocol
API contracts and envelopes:
- `CreateRequest`, `UpdateRequest`
- `ApiError`, `BaseResponse`
- `ExportRequest`, `BulkRequest`

## Migration Guide

### For Library Maintainers

You don't need to change anything! All existing exports remain available. However, you may want to adopt namespaced imports in new code:

**Before:**
```typescript
import { Field, User, App } from '@objectstack/spec';
```

**After (optional):**
```typescript
import * as Data from '@objectstack/spec/data';
import * as System from '@objectstack/spec/system';
import * as UI from '@objectstack/spec/ui';

const field: Data.Field = { /* ... */ };
const user: System.User = { /* ... */ };
const app: UI.App = { /* ... */ };
```

### For Application Developers

Choose the style that fits your needs:

```typescript
// Option 1: Flat imports (quick and simple)
import { ObjectSchema, Field } from '@objectstack/spec';

// Option 2: Namespaced imports (organized and safe)
import * as Data from '@objectstack/spec/data';
const result = Data.ObjectSchema.parse(config);

// Option 3: Mixed approach
import { Field } from '@objectstack/spec';
import * as System from '@objectstack/spec/system';
```

## Implementation Details

### Package.json Exports

The `package.json` now includes export mappings:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./data": "./dist/data/index.js",
    "./ui": "./dist/ui/index.js",
    "./system": "./dist/system/index.js",
    "./ai": "./dist/ai/index.js",
    "./api": "./dist/api/index.js"
  }
}
```

### Barrel Files

Each protocol domain has an `index.ts` barrel file that re-exports all schemas and types from that domain:

- `src/data/index.ts` - Data Protocol
- `src/ui/index.ts` - UI Protocol
- `src/system/index.ts` - System Protocol
- `src/ai/index.ts` - AI Protocol
- `src/api/index.ts` - API Protocol

The root `src/index.ts` continues to re-export everything for backward compatibility.

## Benefits

1. **Zero Breaking Changes**: All existing code continues to work
2. **Prevents Conflicts**: Clear namespace boundaries prevent naming collisions
3. **Better IDE Support**: Autocomplete shows all types in a namespace
4. **Self-Documenting**: Code clearly shows which protocol is being used
5. **Scalable**: Can easily add new protocols without conflict risk

## Future Considerations

As the API grows, we can:
1. Add sub-namespaces (e.g., `@objectstack/spec/data/query` for query-specific types)
2. Mark certain flat exports as deprecated if conflicts arise
3. Add convenience exports for commonly-used combinations

## Questions?

See the main README for usage examples, or check the TypeScript definitions in your IDE for available exports in each namespace.
