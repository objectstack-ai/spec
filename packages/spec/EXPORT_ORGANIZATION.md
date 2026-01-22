# Export Organization Guide

## Problem Statement

The `@objectstack/spec` package exports many schemas and types. As the API surface grows, there's a risk of:
1. **Naming conflicts**: Different protocols might want to use similar names
2. **Poor discoverability**: With 200+ exports in a flat namespace, it's hard to find what you need
3. **Unclear domain boundaries**: Not obvious which exports belong to which protocol

## Solution: Namespace-Only Exports

This package **does NOT export types at the root level** to prevent naming conflicts. All exports are organized by protocol domain using namespaces.

### Import Styles

#### Style 1: Namespace Imports from Root

```typescript
import { Data, UI, System, AI, API } from '@objectstack/spec';

const field: Data.Field = { /* ... */ };
const user: System.User = { /* ... */ };
```

**When to use:**
- Need multiple protocols in one file
- Want single import statement
- Clear namespace boundaries

#### Style 2: Namespace Imports via Subpath

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
- Better tree-shaking (only imports needed protocols)
- Explicit about which protocols are used
- Working with many types from same protocol

#### Style 3: Direct Subpath Imports

```typescript
import { Field, FieldType } from '@objectstack/spec/data';
import { User, Session } from '@objectstack/spec/system';

const field: Field = { /* ... */ };
const user: User = { /* ... */ };
```

**When to use:**
- Most concise syntax
- Importing specific types only
- No namespace prefix needed

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

### Breaking Change Notice

**This is a breaking change.** Flat imports are no longer supported.

**Before (v0.1.x):**
```typescript
import { Field, User, App } from '@objectstack/spec';
```

**After (v0.2.x+):**
```typescript
// Option 1: Namespace from root
import { Data, System, UI } from '@objectstack/spec';
const field: Data.Field = { /* ... */ };
const user: System.User = { /* ... */ };

// Option 2: Namespace via subpath
import * as Data from '@objectstack/spec/data';
import * as System from '@objectstack/spec/system';
const field: Data.Field = { /* ... */ };
const user: System.User = { /* ... */ };

// Option 3: Direct subpath imports
import { Field } from '@objectstack/spec/data';
import { User } from '@objectstack/spec/system';
const field: Field = { /* ... */ };
const user: User = { /* ... */ };
```

### Migration Steps

1. **Find all imports from `@objectstack/spec`:**
   ```bash
   grep -r "from '@objectstack/spec'" src/
   ```

2. **Replace with one of the three styles above**

3. **Test your application** to ensure all types are accessible

## Implementation Details

### Package.json Exports

The `package.json` includes export mappings:

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

The root `src/index.ts` exports only protocol namespaces (no flat exports).

## Benefits

1. **Eliminates Naming Conflicts**: Namespace boundaries prevent all naming collisions
2. **Clear Protocol Boundaries**: Immediately obvious which protocol a type belongs to
3. **Better IDE Support**: Autocomplete shows all types in a namespace
4. **Self-Documenting**: Code clearly shows which protocol is being used
5. **Scalable**: Can easily add new protocols without conflict risk
6. **Tree-Shakeable**: Modern bundlers can better optimize imports

## Future Considerations

As the API grows, we can:
1. Add sub-namespaces (e.g., `@objectstack/spec/data/query` for query-specific types)
2. Add convenience exports for commonly-used combinations
3. Further organize large protocol domains into sub-categories

## Questions?

See the main README for usage examples, or check the TypeScript definitions in your IDE for available exports in each namespace.
