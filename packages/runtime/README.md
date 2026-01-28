# @objectstack/runtime

ObjectStack Standard System Library

## Overview

The runtime package provides the **Standard Library** for the ObjectStack Operating System. It bridges the pure **ObjectKernel** (from `@objectstack/core`) with the **Data Engine** (`@objectstack/objectql`) and provides essential infrastructure adapters.

### Architecture Highlights

- **Standard Library**: Contains essential plugins (`AppPlugin`, `DriverPlugin`)
- **Core Integration**: Re-exports `ObjectKernel` for convenience
- **Capability Contracts**: Abstract interfaces for HTTP server and data persistence

## Installation

```bash
npm install @objectstack/runtime
```

## Quick Start

### Basic Setup (Recommended)

```typescript
import { ObjectKernel } from '@objectstack/core';
import { DriverPlugin, AppPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';

const kernel = new ObjectKernel();

kernel
  // Register ObjectQL engine
  .use(new ObjectQLPlugin())
  
  // Add database driver
  .use(new DriverPlugin(new InMemoryDriver(), 'memory'))
  
  // Add your app configurations
  // .use(new AppPlugin(appConfig));

await kernel.bootstrap();
```

### Custom ObjectQL Instance

If you have a separate ObjectQL implementation or need custom configuration:

```typescript
import { ObjectKernel, DriverPlugin } from '@objectstack/runtime';
import { ObjectQLPlugin, ObjectQL } from '@objectstack/objectql';

// Create custom ObjectQL instance
const customQL = new ObjectQL({
  env: 'production',
  customConfig: true
});

// Pre-configure with custom hooks
customQL.registerHook('beforeInsert', async (ctx) => {
  console.log(`Inserting into ${ctx.object}`);
});

const kernel = new ObjectKernel();

kernel
  // Use your custom ObjectQL instance
  .use(new ObjectQLPlugin(customQL))
  
  // Add driver
  .use(new DriverPlugin(new InMemoryDriver(), 'memory'));

await kernel.bootstrap();

// Access ObjectQL via service registry
const objectql = kernel.getService('objectql');
```

## Architecture

### ObjectKernel (MiniKernel)

The kernel provides:
- **Plugin Lifecycle Management**: init → start → destroy phases
- **Service Registry**: Dependency injection container
- **Event/Hook System**: Inter-plugin communication
- **Dependency Resolution**: Topological sort for plugin dependencies

### Built-in Plugins

#### ObjectQLPlugin
Registers the ObjectQL data engine as a service.

```typescript
new ObjectQLPlugin()                           // Default instance
new ObjectQLPlugin(customQL)                   // Custom instance
new ObjectQLPlugin(undefined, { env: 'prod' }) // With context
```

**Services**: `'objectql'`

#### DriverPlugin
Registers a data driver with ObjectQL.

```typescript
new DriverPlugin(driver, 'driver-name')
```

**Dependencies**: `['com.objectstack.engine.objectql']`

#### AppPlugin
Wraps ObjectStack app manifests (objectstack.config.ts) as plugins.

```typescript
new AppPlugin(appConfig)
```

**Services**: `'app.{id}'`

## API Reference

### Capability Contract Interfaces

#### IHttpServer

Abstract interface for HTTP server capabilities. Allows plugins to work with any HTTP framework (Express, Fastify, Hono, etc.) without tight coupling.

```typescript
import { IHttpServer, IHttpRequest, IHttpResponse } from '@objectstack/runtime';

// In your HTTP server plugin
class MyHttpServerPlugin implements Plugin {
  name = 'http-server';
  
  async init(ctx: PluginContext) {
    const server: IHttpServer = createMyServer(); // Express, Hono, etc.
    ctx.registerService('http-server', server);
  }
}

// In your API plugin
class MyApiPlugin implements Plugin {
  name = 'api';
  dependencies = ['http-server'];
  
  async start(ctx: PluginContext) {
    const server = ctx.getService<IHttpServer>('http-server');
    
    // Register routes - works with any HTTP framework
    server.get('/api/users', async (req, res) => {
      res.json({ users: [] });
    });
  }
}
```

**Interface Methods:**
- `get(path, handler)` - Register GET route
- `post(path, handler)` - Register POST route  
- `put(path, handler)` - Register PUT route
- `delete(path, handler)` - Register DELETE route
- `patch(path, handler)` - Register PATCH route
- `use(path, handler?)` - Register middleware
- `listen(port)` - Start server
- `close()` - Stop server (optional)

#### IDataEngine

Abstract interface for data persistence. Allows plugins to work with any data layer (ObjectQL, Prisma, TypeORM, etc.) without tight coupling.

```typescript
import { IDataEngine } from '@objectstack/runtime';

// In your data plugin
class MyDataPlugin implements Plugin {
  name = 'data';
  
  async init(ctx: PluginContext) {
    const engine: IDataEngine = createMyDataEngine(); // ObjectQL, Prisma, etc.
    ctx.registerService('data-engine', engine);
  }
}

// In your business logic plugin
class MyBusinessPlugin implements Plugin {
  name = 'business';
  dependencies = ['data'];
  
  async start(ctx: PluginContext) {
    const engine = ctx.getService<IDataEngine>('data-engine');
    
    // CRUD operations - works with any data layer
    const user = await engine.insert('user', { name: 'John' });
    const users = await engine.find('user', { filter: { active: true } });
    await engine.update('user', user.id, { name: 'Jane' });
    await engine.delete('user', user.id);
  }
}
```

**Interface Methods:**
- `insert(objectName, data)` - Create a record
- `find(objectName, query?)` - Query records
- `update(objectName, id, data)` - Update a record
- `delete(objectName, id)` - Delete a record

### ObjectKernel

#### Methods
- `use(plugin: Plugin)`: Register a plugin
- `bootstrap()`: Initialize and start all plugins
- `shutdown()`: Stop all plugins in reverse order
- `getService<T>(name: string)`: Get a service from registry
- `isRunning()`: Check if kernel is running
- `getState()`: Get current kernel state

### Plugin Interface

```typescript
interface Plugin {
  name: string;                              // Unique identifier
  version?: string;                          // Plugin version
  dependencies?: string[];                   // Required plugin names
  
  init(ctx: PluginContext): Promise<void>;   // Register services
  start?(ctx: PluginContext): Promise<void>; // Execute business logic
  destroy?(): Promise<void>;                  // Cleanup
}
```

### PluginContext

```typescript
interface PluginContext {
  registerService(name: string, service: any): void;
  getService<T>(name: string): T;
  hook(name: string, handler: Function): void;
  trigger(name: string, ...args: any[]): Promise<void>;
  logger: Console;
  getKernel?(): any;
}
```

## Examples

See the `examples/` directory for complete examples:
- `examples/host/` - Full server setup with Hono
- `examples/msw-react-crud/` - Browser-based setup with MSW
- `test-mini-kernel.ts` - Comprehensive kernel test suite
- `packages/runtime/src/

## Benefits of MiniKernel

1. **True Modularity**: Each plugin is independent and reusable
2. **Capability Contracts**: Plugins depend on interfaces, not implementations
3. **Testability**: Mock services easily in tests
4. **Flexibility**: Load plugins conditionally, swap implementations
5. **Extensibility**: Add new plugins without modifying kernel
6. **Clear Dependencies**: Explicit dependency declarations
7. **Better Architecture**: Separation of concerns with Dependency Inversion

## Best Practices

1. **Keep plugins focused**: One responsibility per plugin
2. **Use services**: Share functionality via service registry
3. **Declare dependencies**: Make plugin requirements explicit
4. **Use hooks**: Decouple plugins with event system
5. **Handle errors**: Implement proper error handling in lifecycle methods

## Documentation

- [MiniKernel Guide](../../MINI_KERNEL_GUIDE.md) - Complete API documentation and patterns
- [MiniKernel Architecture](../../MINI_KERNEL_ARCHITECTURE.md) - Architecture diagrams and flows
- [MiniKernel Implementation](../../MINI_KERNEL_IMPLEMENTATION.md) - Implementation details

## License

Apache-2.0
