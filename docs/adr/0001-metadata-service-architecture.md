# ADR 0001: Metadata Service Architecture

**Status:** Accepted  
**Date:** 2026-02-10  
**Decision Makers:** ObjectStack Core Team  
**Context:** Resolving confusion about metadata service registration and loading

## Context and Problem Statement

ObjectStack has two separate packages that can provide metadata services:
1. `@objectstack/objectql` - The data engine that CAN provide metadata
2. `@objectstack/metadata` - A dedicated metadata management system

This dual capability has caused confusion:
- **Where should metadata service be registered?** ObjectQL or Metadata package?
- **Who loads metadata from objectstack.config.ts?**
- **What is the source of metadata in API responses?**
- **How does rewriting the metadata service impact existing code?**

## Decision Drivers

1. **Separation of Concerns**: Data engine and metadata management are distinct responsibilities
2. **Flexibility**: Users should be able to choose metadata providers
3. **Compatibility**: Existing code should continue working
4. **Clarity**: The architecture should be easy to understand and document

## Considered Options

### Option 1: ObjectQL as Primary Metadata Provider (Current)
ObjectQL registers `metadata` service by default and uses its internal registry.

**Pros:**
- Simple for basic use cases
- Everything in one package
- Fast in-memory access

**Cons:**
- Tight coupling between data engine and metadata
- No file system persistence by default
- Limited metadata management features (no watch, export, migration)

### Option 2: MetadataPlugin as Primary Provider
Always use MetadataPlugin for metadata service.

**Pros:**
- Clear separation of concerns
- Rich metadata features (watch, serialization, multi-source)
- File system persistence

**Cons:**
- Requires additional plugin
- More complex setup for simple cases

### Option 3: Hybrid Approach (SELECTED)
Both can provide metadata service, with clear precedence and compatibility:

1. **MetadataPlugin takes precedence** when explicitly loaded
2. **ObjectQL provides fallback** when MetadataPlugin is not present
3. Both implement the same interface for compatibility

## Decision

We adopt **Option 3: Hybrid Approach** with the following principles:

### Principle 1: Interface Compatibility
Both ObjectQL and MetadataPlugin must implement a common metadata interface:

```typescript
interface IMetadataService {
  load<T>(type: string, name: string): Promise<T | null>;
  loadMany<T>(type: string): Promise<T[]>;
  save<T>(type: string, name: string, data: T): Promise<void>;
  exists(type: string, name: string): Promise<boolean>;
  list(type: string): Promise<string[]>;
}
```

### Principle 2: Precedence Rules
When both plugins are loaded:
1. **MetadataPlugin registers FIRST** (init phase)
2. **ObjectQLPlugin checks existence** before registering metadata service
3. If MetadataPlugin exists, ObjectQL uses it as source

### Principle 3: Metadata Flow

**When ONLY ObjectQL is loaded:**
```
objectstack.config.ts → ObjectQL.registerApp() → Internal Registry → metadata service
```

**When MetadataPlugin is loaded:**
```
File System → MetadataPlugin → metadata service → ObjectQL reads from it
```

### Principle 4: ObjectQL Integration
ObjectQLPlugin should:
1. Check for `metadata` service in its `start()` phase
2. If metadata service exists, load definitions from it
3. Register loaded definitions into its internal registry
4. Use registry for fast runtime queries

### Principle 5: API Metadata Source
The API's metadata endpoints (`GET /api/v1/metadata/:type/:name`) should:
1. Query the `metadata` service from kernel
2. Return standardized responses per spec (`ObjectDefinitionResponse`, etc.)
3. Not care whether source is ObjectQL or MetadataPlugin

## Implementation Details

### ObjectQLPlugin Changes (packages/objectql/src/plugin.ts)

```typescript
init = async (ctx: PluginContext) => {
  // ... existing objectql and data registration ...
  
  // Only register metadata service if not already provided
  let hasMetadata = false;
  try {
    if (ctx.getService('metadata')) {
      hasMetadata = true;
    }
  } catch (e) {
    // Service not found, we can register it
  }

  if (!hasMetadata) {
    ctx.registerService('metadata', this.ql);
    ctx.logger.info('ObjectQL providing metadata service (fallback)');
  }
}

start = async (ctx: PluginContext) => {
  // If external metadata service exists, load from it
  try {
    const metadataService = ctx.getService('metadata');
    if (metadataService !== this.ql) {
      await this.loadMetadataFromService(metadataService, ctx);
    }
  } catch (e) {
    // No external metadata service, use internal registry
  }
  
  // ... existing driver and app discovery ...
}

private async loadMetadataFromService(service: any, ctx: PluginContext) {
  // Load all metadata types from external service
  const types = ['object', 'view', 'app', 'flow', 'workflow'];
  for (const type of types) {
    const items = await service.loadMany(type);
    items.forEach(item => {
      const keyField = item.id ? 'id' : 'name';
      this.ql.registry.registerItem(type, item, keyField);
    });
    ctx.logger.info(`Loaded ${items.length} ${type}(s) from metadata service`);
  }
}
```

### MetadataPlugin Changes (packages/metadata/src/plugin.ts)

```typescript
init = async (ctx: PluginContext) => {
  // Register EARLY to take precedence
  ctx.registerService('metadata', this.manager);
  ctx.logger.info('MetadataPlugin providing metadata service (primary)');
}

start = async (ctx: PluginContext) => {
  // Load metadata from file system
  await this.loadAllMetadata(ctx);
  
  // Notify ObjectQL if present (it will read from us)
  // No direct coupling - ObjectQL will discover us via service registry
}
```

## Consequences

### Positive
✅ Clear separation between data engine and metadata management  
✅ Both simple (ObjectQL-only) and advanced (with MetadataPlugin) use cases supported  
✅ Backward compatible with existing code  
✅ Well-defined metadata loading flow  
✅ Consistent API regardless of provider  

### Negative
⚠️ Slight complexity in ObjectQL to check for external metadata service  
⚠️ Need to maintain interface compatibility between providers  
⚠️ Documentation must clearly explain both modes  

### Neutral
ℹ️ Users can switch providers without changing consuming code  
ℹ️ MetadataPlugin becomes optional but recommended for production  

## Validation

This decision should be validated by:
1. ✅ Both ObjectQL-only and ObjectQL+MetadataPlugin configurations work
2. ✅ API returns same metadata format regardless of provider
3. ✅ Metadata loaded from files appears in ObjectQL registry
4. ✅ No duplicate service registration errors
5. ✅ Clear logs indicating which provider is active

## References

- [ObjectQL Plugin Implementation](../../packages/objectql/src/plugin.ts)
- [MetadataPlugin Implementation](../../packages/metadata/src/plugin.ts)
- [Metadata Spec](../../packages/spec/src/api/metadata.zod.ts)
- [Repository Custom Instructions](../../.github/copilot-instructions.md)

## Notes

This ADR clarifies the architectural intent. The actual implementation already partially follows this pattern (see ObjectQLPlugin lines 36-55), but needed explicit documentation and refinement.
