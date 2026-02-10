# Dynamic Service Discovery - Integration Example

This example demonstrates how the ObjectStack discovery API dynamically reflects registered plugins.

## Without Auth Plugin

When no auth plugin is registered:

```typescript
import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';

const kernel = new ObjectKernel();
await kernel.use(new ObjectQLPlugin());
await kernel.bootstrap();

// Get discovery info
const protocol = kernel.getService('protocol');
const discovery = await protocol.getDiscovery();

console.log(discovery.services.auth);
// Output:
// {
//   enabled: false,
//   status: 'unavailable',
//   message: 'Install plugin-auth to enable'
// }

console.log(discovery.endpoints.auth); // undefined
console.log(discovery.capabilities.workflow); // false
```

## With Auth Plugin

When auth plugin is registered:

```typescript
import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { AuthPlugin } from '@objectstack/plugin-auth';

const kernel = new ObjectKernel();
await kernel.use(new ObjectQLPlugin());
await kernel.use(new AuthPlugin({ /* config */ }));
await kernel.bootstrap();

// Get discovery info
const protocol = kernel.getService('protocol');
const discovery = await protocol.getDiscovery();

console.log(discovery.services.auth);
// Output:
// {
//   enabled: true,
//   status: 'available',
//   route: '/api/v1/auth',
//   provider: 'plugin-auth'
// }

console.log(discovery.endpoints.auth); // '/api/v1/auth'
```

## Client Usage

The `@objectstack/client` can use discovery to check service availability:

```typescript
import { ObjectStackClient } from '@objectstack/client';

const client = new ObjectStackClient({
  baseUrl: 'http://localhost:3000'
});

// Fetch discovery info
const discovery = await client.getDiscovery();

// Check if auth is available before using it
if (discovery.services.auth?.enabled) {
  // Auth service is available - safe to use
  await client.auth.login({
    type: 'email',
    email: 'user@example.com',
    password: 'password'
  });
} else {
  console.log('Auth not available:', discovery.services.auth?.message);
}
```

## Dynamic Features

The discovery system automatically:

1. **Detects registered services** - Checks kernel service registry
2. **Updates capabilities** - Sets feature flags based on available services
3. **Builds endpoint map** - Only includes routes for available services
4. **Provides provider info** - Shows which plugin provides each service

## Benefits

- **Client Adaptation**: Clients can adapt UI/features based on what's available
- **Feature Detection**: No hardcoded assumptions about available services
- **Plugin Discovery**: New plugins automatically appear in discovery
- **Version Independence**: Client and server can have different plugin sets
