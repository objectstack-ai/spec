# @objectstack/runtime

ObjectStack Core Runtime & Query Engine

## Overview

The runtime package provides the `ObjectKernel` (MiniKernel) - a highly modular, plugin-based microkernel that orchestrates ObjectStack applications. It manages the application lifecycle through a standardized plugin system with dependency injection and event hooks.

### Architecture Highlights

- **MiniKernel Design**: Business logic is completely separated into plugins
- **Dependency Injection**: Service registry for inter-plugin communication
- **Event/Hook System**: Publish-subscribe mechanism for loose coupling
- **Lifecycle Management**: Standardized init/start/destroy phases
- **Dependency Resolution**: Automatic topological sorting based on plugin dependencies

## Installation

```bash
npm install @objectstack/runtime
```

## Quick Start

### Basic Setup (Recommended)

```typescript
import { ObjectKernel, ObjectQLPlugin, DriverPlugin } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';

const kernel = new ObjectKernel();

kernel
  // Register ObjectQL engine
  .use(new ObjectQLPlugin())
  
  // Add database driver
  .use(new DriverPlugin(new InMemoryDriver(), 'memory'))
  
  // Add your app configurations
  // .use(new AppManifestPlugin(appConfig));

await kernel.bootstrap();
```

### Custom ObjectQL Instance

If you have a separate ObjectQL implementation or need custom configuration:

```typescript
import { ObjectKernel, ObjectQLPlugin, DriverPlugin, ObjectQL } from '@objectstack/runtime';

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

#### AppManifestPlugin
Wraps ObjectStack app manifests (objectstack.config.ts) as plugins.

```typescript
new AppManifestPlugin(appConfig)
```

**Dependencies**: `['com.objectstack.engine.objectql']`

## API Reference

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
- `examples/custom-objectql-example.ts` - Custom ObjectQL instance
- `test-mini-kernel.ts` - Comprehensive test suite

## Migration Guide

### From ObjectStackKernel to ObjectKernel

**Before (Legacy):**
```typescript
import { ObjectStackKernel, ObjectQLPlugin } from '@objectstack/runtime';

const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(),
  appConfig,
  driver
]);

await kernel.start();
```

**After (Recommended):**
```typescript
import { ObjectKernel, ObjectQLPlugin, DriverPlugin, AppManifestPlugin } from '@objectstack/runtime';

const kernel = new ObjectKernel();

kernel
  .use(new ObjectQLPlugin())
  .use(new DriverPlugin(driver, 'memory'))
  .use(new AppManifestPlugin(appConfig));

await kernel.bootstrap();
```

## Benefits of MiniKernel

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

## Documentation

- [MiniKernel Guide](../../MINI_KERNEL_GUIDE.md) - Complete API documentation and patterns
- [MiniKernel Architecture](../../MINI_KERNEL_ARCHITECTURE.md) - Architecture diagrams and flows
- [MiniKernel Implementation](../../MINI_KERNEL_IMPLEMENTATION.md) - Implementation details

## Legacy Support

The `ObjectStackKernel` is still available for backward compatibility but is deprecated. New projects should use `ObjectKernel`.

## License

Apache-2.0
