# @objectstack/runtime

ObjectStack Core Runtime & Query Engine

## Overview

The runtime package provides the `ObjectStackKernel` - the central orchestrator for ObjectStack applications. It manages the application lifecycle, plugins, and the ObjectQL data engine.

## Installation

```bash
npm install @objectstack/runtime
```

## Usage

### Basic Setup

```typescript
import { ObjectStackKernel, ObjectQLPlugin } from '@objectstack/runtime';
import { InMemoryDriver } from '@objectstack/driver-memory';

const kernel = new ObjectStackKernel([
  // Register ObjectQL engine
  new ObjectQLPlugin(),
  
  // Add database driver
  new InMemoryDriver(),
  
  // Add your app configurations
  // appConfig,
]);

await kernel.start();
```

### Custom ObjectQL Instance

If you have a separate ObjectQL implementation or need custom configuration:

```typescript
import { ObjectStackKernel, ObjectQLPlugin, ObjectQL } from '@objectstack/runtime';

// Create custom ObjectQL instance
const customQL = new ObjectQL({
  env: 'production',
  customConfig: true
});

// Pre-configure with custom hooks
customQL.registerHook('beforeInsert', async (ctx) => {
  console.log(`Inserting into ${ctx.object}`);
});

const kernel = new ObjectStackKernel([
  // Use your custom ObjectQL instance
  new ObjectQLPlugin(customQL),
  
  // ... other plugins
]);

await kernel.start();
```

### Backward Compatibility

For backward compatibility, the kernel will automatically initialize ObjectQL if no `ObjectQLPlugin` is provided:

```typescript
// This still works, but will show a deprecation warning
const kernel = new ObjectStackKernel([
  new InMemoryDriver(),
  // ... other plugins
]);
```

## Architecture

### ObjectStackKernel

The kernel is responsible for:
- Orchestrating application lifecycle
- Managing plugins
- Coordinating the ObjectQL engine
- Handling data operations

### ObjectQLPlugin

The `ObjectQLPlugin` provides:
- Explicit ObjectQL engine registration
- Support for custom ObjectQL instances
- Clean separation of concerns
- Better testability

## API Reference

### ObjectStackKernel

#### Constructor
```typescript
constructor(plugins: any[] = [])
```

#### Methods
- `start()`: Initialize and start the kernel
- `find(objectName, query)`: Query data
- `get(objectName, id)`: Get single record
- `create(objectName, data)`: Create record
- `update(objectName, id, data)`: Update record
- `delete(objectName, id)`: Delete record
- `getMetadata(objectName)`: Get object metadata
- `getView(objectName, viewType)`: Get UI view definition

### ObjectQLPlugin

#### Constructor
```typescript
constructor(ql?: ObjectQL, hostContext?: Record<string, any>)
```

#### Parameters
- `ql` (optional): Custom ObjectQL instance
- `hostContext` (optional): Host context configuration

## Examples

See the `examples/` directory for complete examples:
- `examples/host/` - Full server setup with Hono
- `examples/msw-react-crud/` - Browser-based setup with MSW
- `examples/custom-objectql-example.ts` - Custom ObjectQL instance

## Migration Guide

### From Hardcoded ObjectQL to Plugin-Based

**Before:**
```typescript
const kernel = new ObjectStackKernel([appConfig, driver]);
```

**After (Recommended):**
```typescript
const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(),
  appConfig, 
  driver
]);
```

**After (Custom Instance):**
```typescript
const customQL = new ObjectQL({ /* config */ });
const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(customQL),
  appConfig, 
  driver
]);
```

## License

MIT
