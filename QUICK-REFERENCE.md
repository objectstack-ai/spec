# ObjectStack Architecture Quick Reference

> **Quick reference guide for developers working with ObjectStack's microkernel architecture**

## Package Overview

| Package | Layer | Purpose | Key Exports |
|---------|-------|---------|-------------|
| `@objectstack/spec` | 0 | Protocol definitions | Zod schemas, types, constants |
| `@objectstack/types` | 1 | Shared types | Runtime interfaces |
| `@objectstack/core` | 2 | Microkernel | `ObjectKernel`, `Plugin`, `PluginContext` |
| `@objectstack/objectql` | 3 | Query engine | `ObjectQL`, `ObjectQLPlugin` |
| `@objectstack/runtime` | 3 | Runtime utils | `DriverPlugin`, `AppPlugin` |
| `@objectstack/client` | 4 | Client SDK | Client API |
| `@objectstack/client-react` | 4 | React hooks | React integration |
| `@objectstack/driver-memory` | 5 | In-memory driver | Reference driver implementation |
| `@objectstack/plugin-hono-server` | 5 | HTTP server | Hono-based REST API |
| `@objectstack/plugin-msw` | 5 | API mocking | Mock Service Worker |
| `@objectstack/cli` | 6 | CLI tools | Scaffolding, codegen |
| `@objectstack/ai-bridge` | 6 | AI integration | Agent bridge |

## Common Tasks

### Creating a New Plugin

```typescript
import { Plugin, PluginContext } from '@objectstack/core';

export class MyPlugin implements Plugin {
  name = 'com.mycompany.my-plugin';
  version = '1.0.0';
  dependencies = ['com.objectstack.engine.objectql'];
  
  async init(ctx: PluginContext) {
    // Register services
    ctx.registerService('my-service', myService);
    
    // Subscribe to events
    ctx.hook('kernel:ready', () => {
      ctx.logger.info('Plugin ready!');
    });
  }
  
  async start(ctx: PluginContext) {
    // Get dependencies
    const ql = ctx.getService('objectql');
    
    // Start business logic
  }
  
  async destroy() {
    // Clean up resources
  }
}
```

### Setting Up a Kernel

```typescript
import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { DriverPlugin } from '@objectstack/runtime';
import { createMemoryDriver } from '@objectstack/driver-memory';

// Create kernel
const kernel = new ObjectKernel();

// Register plugins
kernel
  .use(new ObjectQLPlugin())
  .use(new DriverPlugin(createMemoryDriver(), 'memory'))
  .use(new MyPlugin());

// Bootstrap
await kernel.bootstrap();

// Access services
const ql = kernel.getService('objectql');

// Shutdown when done
await kernel.shutdown();
```

### Defining a Protocol Schema

```typescript
import { z } from 'zod';

// Define schema
export const MySchema = z.object({
  name: z.string().describe('Name of the entity'),
  maxLength: z.number().optional().describe('Maximum length'),
  enabled: z.boolean().default(true),
});

// Export type
export type MyType = z.infer<typeof MySchema>;

// Use in code
const config: MyType = MySchema.parse(input);
```

## Plugin Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Plugin Name | `{domain}.{category}.{name}` | `com.objectstack.engine.objectql` |
| Package Name | `@objectstack/{category}-{name}` | `@objectstack/driver-memory` |
| Service Name | `{name}` or `{category}.{name}` | `objectql`, `driver.memory` |

## Standard Events

```typescript
// Kernel lifecycle
'kernel:init'         // Before plugins init
'kernel:ready'        // After all plugins start
'kernel:shutdown'     // Before shutdown

// Data lifecycle  
'data:record:beforeCreate'  // { table, data }
'data:record:afterCreate'   // { table, record }
'data:record:beforeUpdate'  // { table, id, data }
'data:record:afterUpdate'   // { table, id, record }
'data:record:beforeDelete'  // { table, id }
'data:record:afterDelete'   // { table, id }
```

## Logger Usage

```typescript
// In plugin code
ctx.logger.debug('Debug message', { metadata });
ctx.logger.info('Info message', { metadata });
ctx.logger.warn('Warning', { metadata });
ctx.logger.error('Error', { error, metadata });
ctx.logger.fatal('Fatal error', { error });
```

## Import Patterns

### ❌ Don't

```typescript
// Don't import plugins directly
import { SomePlugin } from '@objectstack/some-plugin';

// Don't use global state
global.myService = service;

// Don't create circular dependencies
// Package A imports Package B, Package B imports Package A
```

### ✅ Do

```typescript
// Use service registry
const service = ctx.getService('service-name');

// Depend on lower layers only
import { ObjectKernel } from '@objectstack/core';
import { FieldSchema } from '@objectstack/spec/data';

// Use events for cross-plugin communication
ctx.trigger('my:event', payload);
```

## Build Commands

```bash
# Build all packages in order
pnpm -r --filter './packages/**' build

# Build specific package
pnpm --filter @objectstack/core build

# Build with dependencies
pnpm --filter @objectstack/objectql... build

# Development mode
pnpm --filter @objectstack/core dev
```

## Testing Patterns

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ObjectKernel } from '@objectstack/core';

describe('MyPlugin', () => {
  let kernel: ObjectKernel;
  
  beforeEach(async () => {
    kernel = new ObjectKernel();
    kernel.use(new MyPlugin());
    await kernel.bootstrap();
  });
  
  afterEach(async () => {
    await kernel.shutdown();
  });
  
  it('should register service', () => {
    const service = kernel.getService('my-service');
    expect(service).toBeDefined();
  });
});
```

## Directory Structure

```
packages/
├── spec/               # Protocol definitions (Layer 0)
│   └── src/
│       ├── data/       # ObjectQL schemas
│       ├── ui/         # ObjectUI schemas
│       ├── system/     # ObjectOS schemas
│       └── ...
├── types/              # Shared types (Layer 1)
├── core/               # Microkernel (Layer 2)
│   └── src/
│       ├── kernel.ts   # ObjectKernel
│       ├── types.ts    # Plugin, PluginContext
│       └── logger.ts   # Logger
├── objectql/           # Query engine (Layer 3)
├── runtime/            # Runtime utilities (Layer 3)
├── client/             # Client SDK (Layer 4)
├── client-react/       # React hooks (Layer 4)
└── plugins/            # Plugins (Layer 5)
    ├── driver-memory/
    ├── plugin-hono-server/
    └── plugin-msw/
```

## Version Compatibility

All `@objectstack/*` packages use synchronized versioning:
- Current: `0.6.1`
- Updates are coordinated
- Use exact versions in dependencies

## Resources

- [Full Architecture Guide](./ARCHITECTURE.md)
- [Package Dependencies](./PACKAGE-DEPENDENCIES.md)
- [MicroKernel Documentation](./content/docs/developers/micro-kernel.mdx)
- [Plugin Ecosystem](./content/docs/developers/plugin-ecosystem.mdx)
- [Contributing Guide](./CONTRIBUTING.md)

---

**Quick Tip**: Start with the examples in `examples/` to see the architecture in action!
