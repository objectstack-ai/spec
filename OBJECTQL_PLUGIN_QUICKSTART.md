# ObjectQL Plugin - Quick Reference

## Installation

```bash
npm install @objectstack/runtime
```

## Basic Usage

### Default ObjectQL (Recommended)

```typescript
import { ObjectStackKernel, ObjectQLPlugin } from '@objectstack/runtime';

const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(),
  // ... other plugins
]);

await kernel.start();
```

### Custom ObjectQL Instance

```typescript
import { ObjectStackKernel, ObjectQLPlugin, ObjectQL } from '@objectstack/runtime';

// Create custom instance
const customQL = new ObjectQL({ 
  env: 'production',
  // custom options
});

// Configure as needed
customQL.registerHook('beforeInsert', async (ctx) => {
  console.log(`Inserting into ${ctx.object}`);
});

// Use in kernel
const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(customQL),
  // ... other plugins
]);

await kernel.start();
```

### Backward Compatible (Legacy)

```typescript
// Still works without ObjectQLPlugin, but shows warning
const kernel = new ObjectStackKernel([
  // ... plugins
]);
```

## API Reference

### ObjectQLPlugin Constructor

```typescript
new ObjectQLPlugin(ql?: ObjectQL, hostContext?: Record<string, any>)
```

**Parameters:**
- `ql` (optional): Custom ObjectQL instance to use
- `hostContext` (optional): Configuration for new ObjectQL instance (ignored if `ql` provided)

**Note:** If both parameters are provided, `hostContext` is ignored with a warning.

### Examples

```typescript
// Create with default settings
new ObjectQLPlugin()

// Use custom instance
const custom = new ObjectQL({ env: 'prod' });
new ObjectQLPlugin(custom)

// Create with custom context
new ObjectQLPlugin(undefined, { env: 'prod', debug: true })
```

## Migration Guide

### From Hardcoded to Plugin-Based

**Before:**
```typescript
const kernel = new ObjectStackKernel([appConfig, driver]);
```

**After:**
```typescript
const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(),  // Add this line
  appConfig,
  driver
]);
```

## Common Patterns

### Testing with Mock ObjectQL

```typescript
import { ObjectQLPlugin } from '@objectstack/runtime';
import { MockObjectQL } from './mocks';

const mockQL = new MockObjectQL();
const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(mockQL),
  // ... test config
]);
```

### Multiple Environments

```typescript
// Production
const prodQL = new ObjectQL({ env: 'production', cache: true });
const prodKernel = new ObjectStackKernel([
  new ObjectQLPlugin(prodQL),
  // ... production plugins
]);

// Development
const devKernel = new ObjectStackKernel([
  new ObjectQLPlugin(undefined, { env: 'development', debug: true }),
  // ... dev plugins
]);
```

### Custom ObjectQL from Separate Project

```typescript
// Your custom implementation
import { MyCustomObjectQL } from '@mycompany/custom-objectql';

const customQL = new MyCustomObjectQL({
  specialFeature: true,
  // custom options
});

const kernel = new ObjectStackKernel([
  new ObjectQLPlugin(customQL),
  // ... other plugins
]);
```

## Troubleshooting

### Error: "ObjectQL engine not initialized"

This means the kernel tried to use ObjectQL before it was set up. Make sure:
1. You include `ObjectQLPlugin` in your plugins array, OR
2. The kernel has backward compatibility enabled

### Warning: "No ObjectQL plugin found..."

This is a deprecation warning. Your code will work, but consider migrating to:

```typescript
new ObjectStackKernel([
  new ObjectQLPlugin(),  // Add this
  // ... other plugins
]);
```

### Warning: "Both ql and hostContext provided..."

You passed both a custom ObjectQL instance and host context:

```typescript
// ❌ Don't do this
new ObjectQLPlugin(customQL, { env: 'prod' })  // hostContext ignored

// ✅ Do this instead
new ObjectQLPlugin(customQL)  // Use custom instance

// ✅ Or this
new ObjectQLPlugin(undefined, { env: 'prod' })  // Create with context
```

## Advanced

### Type-Based Detection

ObjectQLPlugin uses a `type` field for reliable detection:

```typescript
// Check if a plugin is an ObjectQL plugin
const isObjectQLPlugin = plugin && plugin.type === 'objectql';
```

The plugin sets `type = 'objectql'` which aligns with the manifest schema that supports package types: 'app', 'plugin', 'driver', 'module', 'objectql', 'gateway', 'adapter'.

### Type Safety

The kernel's `ql` property is typed as optional:

```typescript
export class ObjectStackKernel {
  public ql?: ObjectQL;
  
  private ensureObjectQL(): ObjectQL {
    if (!this.ql) {
      throw new Error('ObjectQL engine not initialized');
    }
    return this.ql;
  }
}
```

## Resources

- [Full Documentation](./packages/runtime/README.md)
- [Implementation Summary](./OBJECTQL_PLUGIN_SUMMARY.md)
- [Custom ObjectQL Example](./examples/custom-objectql-example.ts)

## License

Apache-2.0
