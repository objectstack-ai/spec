# MiniKernel Architecture Guide

## Overview

ObjectStack now supports a **MiniKernel (Microkernel) Architecture** that provides:

- **High Modularity**: Business logic is completely separated into plugins
- **Dependency Injection**: Service registry for inter-plugin communication
- **Event/Hook System**: Publish-subscribe mechanism for loose coupling
- **Lifecycle Management**: Standardized init/start/destroy phases
- **Dependency Resolution**: Automatic topological sorting based on plugin dependencies

## Core Concepts

### 1. Kernel

The `ObjectKernel` is a minimal orchestrator that:
- Loads and manages plugins
- Provides a shared context (`PluginContext`)
- Handles lifecycle phases (init → start → running)
- Resolves plugin dependencies automatically

### 2. Plugin

Plugins are independent modules with a standard interface:

```typescript
interface Plugin {
  name: string;              // Unique identifier
  version?: string;          // Plugin version
  dependencies?: string[];   // List of required plugin names
  
  init(ctx: PluginContext): Promise<void>;    // Register services
  start?(ctx: PluginContext): Promise<void>;  // Execute business logic
  destroy?(): Promise<void>;                   // Cleanup
}
```

### 3. PluginContext

The context provides plugins access to:
- **Service Registry**: `registerService()`, `getService()`
- **Event System**: `hook()`, `trigger()`
- **Logger**: Console-based logging

## Plugin Lifecycle

```
1. INIT PHASE
   ├── Plugin A: init()  → Register services
   ├── Plugin B: init()  → Register services
   └── Plugin C: init()  → Register services

2. START PHASE
   ├── Plugin A: start() → Execute business logic
   ├── Plugin B: start() → Execute business logic
   └── Plugin C: start() → Execute business logic

3. KERNEL READY
   └── Trigger 'kernel:ready' hook

4. DESTROY PHASE (on shutdown)
   ├── Plugin C: destroy() → Cleanup
   ├── Plugin B: destroy() → Cleanup
   └── Plugin A: destroy() → Cleanup
```

## Basic Usage

### Example 1: Simple Plugin

```typescript
import { ObjectKernel, Plugin, PluginContext } from '@objectstack/runtime';

class HelloPlugin implements Plugin {
  name = 'hello-plugin';
  
  async init(ctx: PluginContext) {
    ctx.logger.log('[HelloPlugin] Initialized');
  }
  
  async start(ctx: PluginContext) {
    ctx.logger.log('[HelloPlugin] Started');
  }
}

const kernel = new ObjectKernel();
kernel.use(new HelloPlugin());
await kernel.bootstrap();
```

### Example 2: Service Registration

```typescript
class DataEnginePlugin implements Plugin {
  name = 'data-engine';
  
  async init(ctx: PluginContext) {
    const db = {
      connect: () => console.log('DB Connected'),
      query: (sql: string) => `Result for ${sql}`
    };
    
    // Register service for other plugins
    ctx.registerService('db', db);
  }
  
  async start(ctx: PluginContext) {
    const db = ctx.getService<any>('db');
    db.connect();
  }
}
```

### Example 3: Plugin Dependencies

```typescript
class ApiPlugin implements Plugin {
  name = 'api-server';
  dependencies = ['data-engine', 'http-server']; // Will load after these
  
  async init(ctx: PluginContext) {
    // Dependencies guaranteed to be initialized
  }
  
  async start(ctx: PluginContext) {
    const db = ctx.getService<any>('db');
    const server = ctx.getService<any>('http-server');
    
    // Use services from other plugins
    server.get('/api/data', () => db.query('SELECT *'));
  }
}
```

### Example 4: Hook System

```typescript
class ServerPlugin implements Plugin {
  name = 'server';
  
  async start(ctx: PluginContext) {
    // Wait for kernel:ready before starting server
    ctx.hook('kernel:ready', () => {
      console.log('Starting HTTP server on port 3000');
    });
  }
}
```

## ObjectQL as a Plugin

ObjectQL is now a first-class plugin:

```typescript
import { ObjectKernel, ObjectQLPlugin, DriverPlugin } from '@objectstack/runtime';

const kernel = new ObjectKernel();

kernel
  .use(new ObjectQLPlugin())                    // Register ObjectQL engine
  .use(new DriverPlugin(memoryDriver, 'memory')); // Register driver

await kernel.bootstrap();

// Access ObjectQL via service registry
const objectql = kernel.getService('objectql');
```

## Built-in Plugins

### ObjectQLPlugin

Registers the ObjectQL engine as a service.

```typescript
new ObjectQLPlugin()                           // Default instance
new ObjectQLPlugin(customQL)                   // Custom instance
new ObjectQLPlugin(undefined, { env: 'prod' }) // With context
```

**Services**: `objectql`

### DriverPlugin

Registers a driver with ObjectQL.

```typescript
new DriverPlugin(driver, 'driver-name')
```

**Dependencies**: `['com.objectstack.engine.objectql']`

### HonoServerPlugin

Provides HTTP server using Hono framework.

```typescript
new HonoServerPlugin({ port: 3000, staticRoot: './public' })
```

**Services**: `http-server`

## Advanced Patterns

### Pattern 1: Configuration-Based Loading

```typescript
interface KernelConfig {
  plugins: Array<{
    name: string;
    enabled: boolean;
    options?: any;
  }>;
}

async function loadFromConfig(config: KernelConfig) {
  const kernel = new ObjectKernel();
  
  for (const pluginCfg of config.plugins) {
    if (pluginCfg.enabled) {
      const plugin = await loadPlugin(pluginCfg.name, pluginCfg.options);
      kernel.use(plugin);
    }
  }
  
  return kernel;
}
```

### Pattern 2: Plugin Factory

```typescript
class PluginFactory {
  static createDataEngine(driver: any) {
    return {
      name: 'data-engine',
      async init(ctx: PluginContext) {
        ctx.registerService('driver', driver);
      }
    } as Plugin;
  }
}

kernel.use(PluginFactory.createDataEngine(myDriver));
```

### Pattern 3: Conditional Plugin Loading

```typescript
const kernel = new ObjectKernel();

// Core plugins
kernel.use(new ObjectQLPlugin());

// Optional plugins based on environment
if (process.env.NODE_ENV === 'production') {
  kernel.use(new MonitoringPlugin());
  kernel.use(new CachingPlugin());
}

if (process.env.ENABLE_API === 'true') {
  kernel.use(new HonoServerPlugin());
}
```

## Usage

```typescript
import { ObjectKernel, ObjectQLPlugin, DriverPlugin } from '@objectstack/runtime';

const kernel = new ObjectKernel();

kernel
  .use(new ObjectQLPlugin())
  .use(new DriverPlugin(driver));

// App manifest as plugin
kernel.use(appManifestPlugin);

await kernel.bootstrap();
```

## Benefits

1. **True Modularity**: Each plugin is independent and reusable
2. **Testability**: Mock services easily in tests
3. **Flexibility**: Load plugins conditionally
4. **Extensibility**: Add new plugins without modifying kernel
5. **Clear Dependencies**: Explicit dependency declarations
6. **Better Architecture**: Separation of concerns

## Best Practices

1. **Keep plugins focused**: One responsibility per plugin
2. **Use services**: Share functionality via service registry
3. **Declare dependencies**: Make plugin requirements explicit
4. **Use hooks**: Decouple plugins with event system
5. **Handle errors**: Implement proper error handling in lifecycle methods
6. **Document services**: Document what services your plugin provides/consumes

## Troubleshooting

### Error: "Service 'xxx' not found"

Make sure the plugin that provides the service is registered and loaded before plugins that consume it.

### Error: "Circular dependency detected"

Check your plugin dependencies - they form a cycle. Refactor to break the cycle.

### Error: "Plugin 'xxx' already registered"

You're registering the same plugin twice. Check your plugin registration code.

## API Reference

### ObjectKernel

- `use(plugin: Plugin)`: Register a plugin
- `bootstrap()`: Initialize and start all plugins
- `shutdown()`: Stop all plugins in reverse order
- `getService<T>(name: string)`: Get a service from registry
- `isRunning()`: Check if kernel is running
- `getState()`: Get current kernel state

### PluginContext

- `registerService(name: string, service: any)`: Register a service
- `getService<T>(name: string)`: Get a service
- `hook(name: string, handler: Function)`: Register event handler
- `trigger(name: string, ...args: any[])`: Trigger an event
- `logger`: Console logger instance

## Examples

See:
- `/examples/mini-kernel-example.ts` - Basic usage
- `/test-objectql-plugin.ts` - ObjectQL plugin examples
- `/packages/plugin-hono-server/src/hono-plugin.ts` - Real plugin implementation

## License

Apache-2.0
