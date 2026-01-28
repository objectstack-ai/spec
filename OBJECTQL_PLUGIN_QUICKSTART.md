# ObjectQL Plugin - Quick Reference

## Installation

```bash
npm install @objectstack/runtime
```

## Basic Usage

### Default ObjectQL (Recommended)

```typescript
import { ObjectKernel, ObjectQLPlugin } from '@objectstack/runtime';

const kernel = new ObjectKernel();
kernel.use(new ObjectQLPlugin());
// ... other plugins

await kernel.bootstrap();
```

### Custom ObjectQL Instance

```typescript
import { ObjectKernel, ObjectQLPlugin, ObjectQL } from '@objectstack/runtime';

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
const kernel = new ObjectKernel();
kernel.use(new ObjectQLPlugin(customQL));
// ... other plugins

await kernel.bootstrap();
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

### From Array-Based to Chaining Pattern

**Before:**
```typescript
const kernel = new ObjectKernel([appConfig, driver]);
```

**After:**
```typescript
const kernel = new ObjectKernel();
kernel.use(new ObjectQLPlugin());  // Add this line
kernel.use(appConfig);
kernel.use(driver);

await kernel.bootstrap();
```

## Common Patterns

### Testing with Mock ObjectQL

```typescript
import { ObjectKernel, ObjectQLPlugin } from '@objectstack/runtime';
import { MockObjectQL } from './mocks';

const mockQL = new MockObjectQL();
const kernel = new ObjectKernel();
kernel.use(new ObjectQLPlugin(mockQL));
// ... test config

await kernel.bootstrap();
```

### Multiple Environments

```typescript
// Production
const prodQL = new ObjectQL({ env: 'production', cache: true });
const prodKernel = new ObjectKernel();
prodKernel.use(new ObjectQLPlugin(prodQL));
// ... production plugins

await prodKernel.bootstrap();

// Development
const devKernel = new ObjectKernel();
devKernel.use(new ObjectQLPlugin(undefined, { env: 'development', debug: true }));
// ... dev plugins

await devKernel.bootstrap();
```

### Custom ObjectQL from Separate Project

```typescript
// Your custom implementation
import { ObjectKernel, ObjectQLPlugin } from '@objectstack/runtime';
import { MyCustomObjectQL } from '@mycompany/custom-objectql';

const customQL = new MyCustomObjectQL({
  specialFeature: true,
  // custom options
});

const kernel = new ObjectKernel();
kernel.use(new ObjectQLPlugin(customQL));
// ... other plugins

await kernel.bootstrap();
```

## Troubleshooting

### Error: "ObjectQL engine not initialized"

This means the kernel tried to use ObjectQL before it was set up. Make sure you register the `ObjectQLPlugin`:

```typescript
const kernel = new ObjectKernel();
kernel.use(new ObjectQLPlugin());  // Add this
// ... other plugins

await kernel.bootstrap();
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
export class ObjectKernel {
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
