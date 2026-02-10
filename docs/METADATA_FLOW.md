# Metadata Service: Architecture and Flow

This document explains how metadata flows through ObjectStack from definition to runtime.

## Overview

ObjectStack supports **two modes** for metadata provision:

1. **Simple Mode (ObjectQL-only)**: Metadata defined in code, stored in memory
2. **Advanced Mode (with MetadataPlugin)**: Metadata loaded from files, with watch/export/persistence features

Both modes are compatible and use the same service interface.

## Architecture Decision

See [ADR-0001: Metadata Service Architecture](./adr/0001-metadata-service-architecture.md) for the full decision rationale.

## Service Providers

### ObjectQL as Metadata Provider

**Package**: `@objectstack/objectql`  
**Service Registered**: `metadata`, `objectql`, `data`  
**When Used**: Default fallback when MetadataPlugin is not loaded

**Characteristics**:
- ✅ Simple setup - no additional configuration
- ✅ Fast in-memory access
- ✅ Good for testing and simple applications
- ⚠️ No file persistence
- ⚠️ No file watching
- ⚠️ Limited to programmatically registered metadata

**Flow**:
```
objectstack.config.ts
  ↓
defineStack({ plugins: [new AppPlugin(manifest)] })
  ↓
ObjectQLPlugin.start() discovers apps via kernel.getServices()
  ↓
ObjectQL.registerApp(manifest) → Internal Registry
  ↓
metadata service queries → Registry lookup → Response
```

### MetadataPlugin as Provider

**Package**: `@objectstack/metadata`  
**Service Registered**: `metadata`  
**When Used**: Explicitly loaded in plugin configuration

**Characteristics**:
- ✅ File system persistence
- ✅ File watching for hot reload
- ✅ Multi-format support (YAML, JSON, TypeScript)
- ✅ Multi-source (filesystem, HTTP, database)
- ✅ Export/import capabilities
- ⚠️ Requires explicit setup
- ⚠️ Slightly more complex

**Flow**:
```
File System (objects/, views/, apps/, etc.)
  ↓
MetadataPlugin.start() loads all metadata types
  ↓
NodeMetadataManager (uses FilesystemLoader)
  ↓
Serializers (YAML/JSON/TS) parse files
  ↓
metadata service queries → MetadataManager.load() → File lookup → Response
```

## Integration Flow

When **both** ObjectQL and MetadataPlugin are loaded:

```
1. MetadataPlugin.init()
   → Registers 'metadata' service FIRST
   
2. ObjectQLPlugin.init()
   → Checks for existing 'metadata' service
   → Finds MetadataPlugin
   → Does NOT register 'metadata' (already exists)
   → Registers 'objectql' and 'data' only
   
3. MetadataPlugin.start()
   → Loads metadata from file system
   → Service now provides file-based metadata
   
4. ObjectQLPlugin.start()
   → Detects external metadata service
   → Loads definitions from it
   → Populates internal registry for fast queries
   → Discovers apps and drivers from kernel
   
5. Runtime Queries
   → API calls ctx.getService('metadata')
   → Gets MetadataPlugin instance
   → Returns file-based metadata
   
   → ObjectQL queries use registry (pre-loaded from MetadataPlugin)
   → Fast in-memory access for data operations
```

## Example Configurations

### Simple Mode (ObjectQL Only)

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/spec';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { AppPlugin } from '@objectstack/runtime';
import myApp from './myapp.config';

export default defineStack({
  manifest: {
    id: 'my-app',
    name: 'my_app',
    version: '1.0.0',
    type: 'app'
  },
  plugins: [
    new ObjectQLPlugin(),
    new AppPlugin(myApp), // Metadata defined in code
  ]
});
```

**Result**: ObjectQL provides metadata service, serves in-memory definitions.

### Advanced Mode (With MetadataPlugin)

```typescript
// objectstack.config.ts
import { defineStack } from '@objectstack/spec';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { MetadataPlugin } from '@objectstack/metadata';

export default defineStack({
  manifest: {
    id: 'my-app',
    name: 'my_app',
    version: '1.0.0',
    type: 'app'
  },
  plugins: [
    new MetadataPlugin({
      rootDir: process.cwd(),
      watch: true
    }),
    new ObjectQLPlugin(),
  ]
});
```

**Result**: MetadataPlugin provides metadata service, ObjectQL reads from it.

**File Structure**:
```
project/
├── objectstack.config.ts
├── objects/
│   ├── account.object.ts
│   └── contact.object.ts
├── views/
│   ├── account-list.view.yaml
│   └── contact-form.view.json
└── apps/
    └── crm.app.ts
```

## API Metadata Endpoints

All API metadata endpoints use the kernel's `metadata` service:

```typescript
// In API handler
const metadataService = ctx.getService('metadata');

// Single object
const object = await metadataService.load('object', 'account');
return { data: object };

// List all objects
const objects = await metadataService.loadMany('object');
return { data: objects };
```

The API **doesn't know or care** whether metadata comes from ObjectQL or MetadataPlugin.

## When to Use Each Mode

### Use ObjectQL-only when:
- Building prototypes or POCs
- Writing tests
- Creating simple single-file applications
- All metadata is programmatically generated

### Use MetadataPlugin when:
- Building production applications
- Need file-based metadata (version control friendly)
- Want hot reload during development
- Need export/import capabilities
- Multiple developers editing metadata
- Metadata stored in external systems

## Metadata Service Interface

Both providers implement this interface:

```typescript
interface IMetadataService {
  /**
   * Load a single metadata item
   */
  load<T>(type: string, name: string, options?: MetadataLoadOptions): Promise<T | null>;
  
  /**
   * Load multiple metadata items of a type
   */
  loadMany<T>(type: string, options?: MetadataLoadOptions): Promise<T[]>;
  
  /**
   * Save a metadata item
   */
  save<T>(type: string, name: string, data: T, options?: MetadataSaveOptions): Promise<MetadataSaveResult>;
  
  /**
   * Check if metadata item exists
   */
  exists(type: string, name: string): Promise<boolean>;
  
  /**
   * List all items of a type
   */
  list(type: string): Promise<string[]>;
}
```

## Troubleshooting

### "Service 'metadata' already registered" Error

**Cause**: Both ObjectQL and MetadataPlugin trying to register the service.

**Solution**: Ensure MetadataPlugin is loaded BEFORE ObjectQLPlugin in the plugins array. ObjectQL will detect it and not register.

```typescript
// ❌ Wrong order
plugins: [
  new ObjectQLPlugin(),
  new MetadataPlugin(), // Too late, ObjectQL already registered metadata
]

// ✅ Correct order
plugins: [
  new MetadataPlugin(), // Registers first
  new ObjectQLPlugin(), // Detects metadata service, doesn't register
]
```

### Metadata Changes Not Reflected

**Cause**: Using ObjectQL-only mode, which doesn't watch files.

**Solution**: Add MetadataPlugin with `watch: true`:

```typescript
plugins: [
  new MetadataPlugin({ watch: true }),
  new ObjectQLPlugin(),
]
```

### "Cannot find metadata" in API

**Cause**: Metadata not loaded into the service.

**Debug**:
1. Check logs for "Loaded X objects" messages
2. Verify file paths are correct
3. Check that files have correct naming (e.g., `*.object.ts`, `*.view.yaml`)
4. Ensure MetadataPlugin `rootDir` points to correct location

## References

- [ADR-0001: Metadata Service Architecture](./adr/0001-metadata-service-architecture.md)
- [ObjectQL Package](../packages/objectql/README.md)
- [Metadata Package](../packages/metadata/README.md)
- [Metadata Spec](../packages/spec/src/api/metadata.zod.ts)
- [Metadata Loader Protocol](../packages/spec/src/kernel/metadata-loader.zod.ts)
