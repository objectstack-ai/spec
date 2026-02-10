# Metadata Service FAQ

Frequently asked questions about ObjectStack's metadata service architecture.

## General Questions

### Q: Why are there two packages that provide metadata service?

**A:** ObjectStack supports both simple and advanced use cases:

- **Simple (ObjectQL-only)**: For prototypes, tests, and simple apps. Metadata is defined in code and stored in memory.
- **Advanced (MetadataPlugin)**: For production apps. Metadata is loaded from files, supports hot reload, and enables team collaboration.

Both implement the same interface, so you can switch between them without changing your code.

See: [ADR-0001: Metadata Service Architecture](./adr/0001-metadata-service-architecture.md)

---

### Q: Which metadata provider should I use?

**A:** 

**Use ObjectQL-only when:**
- Building prototypes or POCs
- Writing unit tests
- Creating simple single-file applications
- All metadata is generated programmatically

**Use MetadataPlugin when:**
- Building production applications
- Need file-based metadata (git-friendly)
- Want hot reload during development
- Multiple developers editing metadata
- Need export/import capabilities

**Recommendation**: Start with MetadataPlugin from day one. The setup is simple, and the benefits are substantial.

---

### Q: Can I use both ObjectQL and MetadataPlugin together?

**A:** Yes! This is the recommended approach:

1. MetadataPlugin loads metadata from files
2. ObjectQL syncs metadata into its registry for fast queries
3. You get both file persistence AND in-memory performance

See: [Hybrid Usage Example](./METADATA_USAGE.md#hybrid-usage)

---

## Architecture Questions

### Q: Why is metadata service registered in ObjectQL instead of metadata package?

**A:** Both can register the metadata service, depending on configuration:

- **When only ObjectQL is loaded**: ObjectQL registers itself as the metadata service (fallback)
- **When MetadataPlugin is loaded**: MetadataPlugin registers as the metadata service (primary)
- **When both are loaded**: MetadataPlugin takes precedence, ObjectQL syncs from it

This hybrid approach supports both simple and advanced use cases with a single architecture.

---

### Q: Who loads metadata in objectstack.config.ts?

**A:** It depends on your plugin configuration:

**ObjectQL-only mode:**
```typescript
plugins: [
  new ObjectQLPlugin(),
  new AppPlugin(myApp), // Metadata defined here
]
```
→ AppPlugin provides manifest with objects/views → ObjectQL registers them in its registry

**MetadataPlugin mode:**
```typescript
plugins: [
  new MetadataPlugin({ rootDir: process.cwd() }),
  new ObjectQLPlugin(),
]
```
→ MetadataPlugin loads from file system → ObjectQL syncs into its registry

See: [Metadata Flow Documentation](./METADATA_FLOW.md)

---

### Q: Where is metadata stored?

**A:**

**ObjectQL-only**: In-memory registry (SchemaRegistry class)
- Lost on restart
- Fast access
- Good for testing

**With MetadataPlugin**: 
1. **Source**: File system (`objects/`, `views/`, etc.)
2. **Runtime**: Synced into ObjectQL's in-memory registry
3. **Cached**: Both MetadataManager and ObjectQL have caches

Best of both worlds: persistent files + fast runtime queries.

---

### Q: Who provides metadata in API responses?

**A:** The kernel's `metadata` service, which could be either:

1. ObjectQL (if used alone)
2. MetadataPlugin (if loaded)

API code doesn't know or care which provider is active:

```typescript
const metadataService = ctx.getService('metadata');
const object = await metadataService.load('object', 'account');
```

This abstraction allows swapping providers without changing API code.

---

## Implementation Questions

### Q: If I rewrite metadata service, will it break existing code?

**A:** No, as long as you implement the standard interface:

```typescript
interface IMetadataService {
  load<T>(type: string, name: string): Promise<T | null>;
  loadMany<T>(type: string): Promise<T[]>;
  save<T>(type: string, name: string, data: T): Promise<void>;
  exists(type: string, name: string): Promise<boolean>;
  list(type: string): Promise<string[]>;
}
```

Any code using `kernel.getService('metadata')` will continue working.

**Important**: Register your service as `'metadata'` in the init phase to take precedence over ObjectQL.

---

### Q: How do I add a custom metadata provider?

**Example: Database-backed metadata service**

```typescript
import { Plugin, PluginContext } from '@objectstack/core';

export class DatabaseMetadataPlugin implements Plugin {
  name = 'com.example.db-metadata';
  type = 'metadata';
  version = '1.0.0';
  
  private db: any; // Your database client

  init = async (ctx: PluginContext) => {
    // Register EARLY to take precedence
    ctx.registerService('metadata', {
      load: async (type: string, name: string) => {
        return this.db.query(
          'SELECT data FROM metadata WHERE type = ? AND name = ?',
          [type, name]
        );
      },
      loadMany: async (type: string) => {
        return this.db.query(
          'SELECT data FROM metadata WHERE type = ?',
          [type]
        );
      },
      save: async (type: string, name: string, data: any) => {
        await this.db.query(
          'INSERT OR REPLACE INTO metadata (type, name, data) VALUES (?, ?, ?)',
          [type, name, JSON.stringify(data)]
        );
      },
      exists: async (type: string, name: string) => {
        const result = await this.db.query(
          'SELECT 1 FROM metadata WHERE type = ? AND name = ?',
          [type, name]
        );
        return result.length > 0;
      },
      list: async (type: string) => {
        const results = await this.db.query(
          'SELECT name FROM metadata WHERE type = ?',
          [type]
        );
        return results.map((r: any) => r.name);
      }
    });
    
    ctx.logger.info('Database metadata service registered');
  }
}
```

**Usage:**
```typescript
plugins: [
  new DatabaseMetadataPlugin(), // First!
  new ObjectQLPlugin(), // Will sync from database
]
```

---

## Configuration Questions

### Q: What's the correct plugin order?

**A:** Metadata providers should come BEFORE ObjectQLPlugin:

```typescript
// ✅ Correct order
plugins: [
  new MetadataPlugin(),      // Registers 'metadata' service
  new ObjectQLPlugin(),      // Detects existing service, syncs from it
  new OtherPlugins(),
]

// ❌ Wrong order
plugins: [
  new ObjectQLPlugin(),      // Registers 'metadata' service (fallback)
  new MetadataPlugin(),      // Error: service already registered!
]
```

**Why?** ObjectQL checks for existing metadata service in its `init` phase. If found, it doesn't register itself as metadata provider.

---

### Q: How do I disable ObjectQL's metadata service registration?

**A:** Just load MetadataPlugin (or any metadata provider) before ObjectQL:

```typescript
plugins: [
  new MetadataPlugin(), // ObjectQL will detect this and not register metadata
  new ObjectQLPlugin(),
]
```

ObjectQL will automatically detect the existing metadata service and use it instead of registering itself.

---

### Q: Can I use multiple metadata sources?

**A:** Yes, through MetadataManager's loader system:

```typescript
import { MetadataManager } from '@objectstack/metadata';
import { FilesystemLoader } from '@objectstack/metadata/loaders';
import { RemoteLoader } from '@objectstack/metadata/loaders';

const manager = new MetadataManager({
  rootDir: process.cwd(),
  loaders: [
    new FilesystemLoader({ basePath: './metadata' }),
    new RemoteLoader({ baseUrl: 'https://api.example.com/metadata' })
  ]
});

// Queries all loaders, returns first match or aggregates results
const objects = await manager.loadMany('object');
```

MetadataManager queries loaders in order and can deduplicate results.

---

## Performance Questions

### Q: Is there a performance cost to using MetadataPlugin?

**A:** Minimal:

**Startup cost**: MetadataPlugin loads files during the `start` phase. For typical apps:
- 100 objects = ~50ms
- 1000 objects = ~500ms

**Runtime cost**: None! ObjectQL syncs metadata into its registry, so runtime queries are in-memory (microseconds).

**Trade-off**: Tiny startup cost for massive developer experience benefits.

---

### Q: How does metadata caching work?

**A:** Three-level cache:

1. **MetadataManager cache**: Parsed file contents (ETag-based)
2. **ObjectQL registry**: In-memory object definitions
3. **HTTP cache**: API responses (if using caching middleware)

Metadata is loaded once at startup, then served from memory.

---

### Q: Do file changes trigger hot reload?

**A:** Yes, if watching is enabled:

```typescript
new MetadataPlugin({
  rootDir: process.cwd(),
  watch: true  // Enable file watching
})
```

MetadataPlugin uses `chokidar` to watch for file changes and triggers reload events.

**Note**: ObjectQL's registry cache is invalidated on changes, so updates are reflected immediately.

---

## Migration Questions

### Q: How do I migrate from ObjectQL-only to MetadataPlugin?

**Step 1**: Extract metadata to files

```typescript
// Before (in code)
objectql.registry.registerObject({
  packageId: 'my-app',
  namespace: 'crm',
  ownership: 'own',
  object: accountObject
});

// After (in file: objects/account.object.ts)
export default {
  name: 'account',
  label: 'Account',
  fields: { ... }
};
```

**Step 2**: Update config

```typescript
// Before
plugins: [
  new ObjectQLPlugin(),
]

// After
plugins: [
  new MetadataPlugin({ rootDir: process.cwd() }),
  new ObjectQLPlugin(),
]
```

**Step 3**: Remove programmatic registration code

Your metadata is now file-based!

---

### Q: Can I gradually migrate metadata to files?

**A:** Yes! Use hybrid mode:

1. Load MetadataPlugin for file-based metadata
2. Keep programmatic registration for dynamic objects
3. Gradually move objects to files

Both sources work together seamlessly.

---

## Troubleshooting

### Q: "Service 'metadata' already registered" error

**Cause**: Wrong plugin order.

**Fix**: Put MetadataPlugin BEFORE ObjectQLPlugin:

```typescript
plugins: [
  new MetadataPlugin(),  // First
  new ObjectQLPlugin(),  // Second
]
```

---

### Q: Metadata changes not reflected

**Cause**: File watching disabled or not using MetadataPlugin.

**Fix**: Enable watching:

```typescript
new MetadataPlugin({
  watch: true
})
```

---

### Q: "Cannot find object" in API

**Debug checklist**:
1. ✅ Check logs for "Loaded X objects"
2. ✅ Verify file naming: `account.object.ts` (not `account.ts`)
3. ✅ File in correct directory (`objects/`)
4. ✅ Object has `name` field matching filename
5. ✅ MetadataPlugin loaded before ObjectQL

---

## Best Practices

### Q: What's the recommended setup for production?

**A:**

```typescript
import { defineStack } from '@objectstack/spec';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { MetadataPlugin } from '@objectstack/metadata';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';

export default defineStack({
  manifest: {
    id: 'my-app',
    name: 'my_app',
    version: '1.0.0',
    type: 'app'
  },
  plugins: [
    // 1. Metadata - file-based, version controlled
    new MetadataPlugin({
      rootDir: process.cwd(),
      watch: process.env.NODE_ENV !== 'production'
    }),
    
    // 2. ObjectQL - syncs metadata, provides data engine
    new ObjectQLPlugin(),
    
    // 3. HTTP Server
    new HonoServerPlugin({ port: 3000 }),
    
    // 4. Other plugins...
  ]
});
```

**Why this order?**
1. MetadataPlugin loads first, provides metadata service
2. ObjectQL syncs metadata into registry
3. HTTP server can use metadata in routes
4. Other plugins can query metadata as needed

---

## Further Reading

- [ADR-0001: Metadata Service Architecture](./adr/0001-metadata-service-architecture.md) - Design rationale
- [Metadata Flow Documentation](./METADATA_FLOW.md) - How metadata flows through the system
- [Usage Examples](./METADATA_USAGE.md) - Code examples for both modes
- [Object Schema Reference](../packages/spec/src/data/object.zod.ts) - Object definition spec
