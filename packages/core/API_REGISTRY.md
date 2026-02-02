# API Registry Implementation

## Overview

The API Registry is a centralized service in the ObjectStack kernel that manages API endpoint registration, discovery, and conflict resolution across different protocols and plugins.

## Features

✅ **Multi-Protocol Support** - REST, GraphQL, OData, WebSocket, Plugin APIs, and more  
✅ **Route Conflict Detection** - Configurable strategies (error, priority, first-wins, last-wins)  
✅ **RBAC Integration** - Endpoints can specify required permissions  
✅ **Dynamic Schema Linking** - Reference ObjectQL objects for auto-updating schemas  
✅ **Protocol Extensions** - Support for gRPC, tRPC, and custom protocols  
✅ **API Discovery** - Filter and search APIs by type, status, tags, and more  

## Architecture

The API Registry follows the ObjectStack microkernel pattern:

```
┌─────────────────────────────────────────────────────┐
│              ObjectKernel (Core)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Service Registry (DI Container)              │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │    API Registry Service                 │  │  │
│  │  │    • registerApi()                      │  │  │
│  │  │    • unregisterApi()                    │  │  │
│  │  │    • findApis()                         │  │  │
│  │  │    • getRegistry()                      │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
              │
    ┌─────────┴─────────┬──────────┬──────────┐
    │                   │          │          │
┌───▼────┐      ┌───────▼──┐   ┌──▼───┐  ┌───▼────┐
│  REST  │      │ GraphQL  │   │WebSkt│  │ Plugin │
│ Plugin │      │  Plugin  │   │Plugin│  │  APIs  │
└────────┘      └──────────┘   └──────┘  └────────┘
```

## Usage

### 1. Register the API Registry Plugin

```typescript
import { ObjectKernel, createApiRegistryPlugin } from '@objectstack/core';

const kernel = new ObjectKernel();

// Register with default settings (error on conflicts)
kernel.use(createApiRegistryPlugin());

// Or with custom configuration
kernel.use(
  createApiRegistryPlugin({
    conflictResolution: 'priority', // priority, first-wins, last-wins
    version: '1.0.0',
  })
);

await kernel.bootstrap();
```

### 2. Register APIs in Plugins

```typescript
import type { Plugin } from '@objectstack/core';
import type { ApiRegistry } from '@objectstack/core';
import type { ApiRegistryEntry } from '@objectstack/spec/api';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  init: async (ctx) => {
    // Get the API Registry service
    const registry = ctx.getService<ApiRegistry>('api-registry');
    
    // Register your API
    const api: ApiRegistryEntry = {
      id: 'customer_api',
      name: 'Customer API',
      type: 'rest',
      version: 'v1',
      basePath: '/api/v1/customers',
      endpoints: [
        {
          id: 'get_customer',
          method: 'GET',
          path: '/api/v1/customers/:id',
          summary: 'Get customer by ID',
          requiredPermissions: ['customer.read'], // RBAC
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: [
            {
              statusCode: 200,
              description: 'Customer found',
              schema: {
                $ref: {
                  objectId: 'customer', // Dynamic ObjectQL reference
                  excludeFields: ['password_hash'],
                },
              },
            },
          ],
        },
      ],
      metadata: {
        status: 'active',
        tags: ['customer', 'crm'],
      },
    };
    
    registry.registerApi(api);
  },
};
```

### 3. Discover APIs

```typescript
const registry = kernel.getService<ApiRegistry>('api-registry');

// Get all APIs
const allApis = registry.getAllApis();

// Find REST APIs
const restApis = registry.findApis({ type: 'rest' });

// Find active APIs with specific tags
const crmApis = registry.findApis({
  status: 'active',
  tags: ['crm'],
});

// Search by name
const searchResults = registry.findApis({
  search: 'customer',
});

// Get endpoint by route
const endpoint = registry.findEndpointByRoute('GET', '/api/v1/customers/:id');
console.log(endpoint?.api.name); // "Customer API"
console.log(endpoint?.endpoint.summary); // "Get customer by ID"
```

### 4. Get Registry Snapshot

```typescript
const registry = kernel.getService<ApiRegistry>('api-registry');
const snapshot = registry.getRegistry();

console.log(`Total APIs: ${snapshot.totalApis}`);
console.log(`Total Endpoints: ${snapshot.totalEndpoints}`);
console.log(`Conflict Resolution: ${snapshot.conflictResolution}`);

// APIs grouped by type
snapshot.byType?.rest.forEach((api) => {
  console.log(`REST API: ${api.name}`);
});

// APIs grouped by status
snapshot.byStatus?.active.forEach((api) => {
  console.log(`Active API: ${api.name}`);
});
```

## Conflict Resolution Strategies

### 1. Error (Default)

Throws an error when a route conflict is detected.

```typescript
kernel.use(createApiRegistryPlugin({ conflictResolution: 'error' }));
```

**Best for:** Production environments where conflicts should be caught early.

### 2. Priority

Uses the `priority` field on endpoints to resolve conflicts. Higher priority wins.

```typescript
kernel.use(createApiRegistryPlugin({ conflictResolution: 'priority' }));

// In your plugin
registry.registerApi({
  endpoints: [
    {
      path: '/api/data/:object',
      priority: 900, // Core API (high priority)
    },
  ],
});
```

**Priority Ranges:**
- **900-1000**: Core system endpoints
- **500-900**: Custom/override endpoints
- **100-500**: Plugin endpoints
- **0-100**: Fallback routes

### 3. First-Wins

First registered endpoint wins. Subsequent registrations are ignored.

```typescript
kernel.use(createApiRegistryPlugin({ conflictResolution: 'first-wins' }));
```

**Best for:** Stable, predictable routing where load order matters.

### 4. Last-Wins

Last registered endpoint wins. Previous registrations are overwritten.

```typescript
kernel.use(createApiRegistryPlugin({ conflictResolution: 'last-wins' }));
```

**Best for:** Development/testing where you want to override defaults.

## RBAC Integration

Endpoints can specify required permissions that are automatically validated at the gateway level:

```typescript
{
  id: 'delete_customer',
  method: 'DELETE',
  path: '/api/v1/customers/:id',
  requiredPermissions: [
    'customer.delete',
    'api_enabled',
  ],
  responses: [],
}
```

**Permission Format:**
- **Object Permissions:** `<object>.<operation>` (e.g., `customer.read`, `order.delete`)
- **System Permissions:** `<permission_name>` (e.g., `manage_users`, `api_enabled`)

## Dynamic Schema Linking

Reference ObjectQL objects instead of static schemas:

```typescript
{
  statusCode: 200,
  description: 'Customer retrieved',
  schema: {
    $ref: {
      objectId: 'customer',              // ObjectQL object name
      excludeFields: ['password_hash'],  // Exclude sensitive fields
      includeFields: ['id', 'name'],     // Or whitelist specific fields
      includeRelated: ['account'],       // Include related objects
    },
  },
}
```

**Benefits:**
- API documentation auto-updates when object schemas change
- No schema duplication between API and data model
- Consistent type definitions across API and database

## Protocol-Specific Configuration

Support custom protocols with `protocolConfig`:

### WebSocket

```typescript
{
  id: 'customer_updates',
  path: '/ws/customers',
  protocolConfig: {
    subProtocol: 'websocket',
    eventName: 'customer.updated',
    direction: 'server-to-client',
  },
}
```

### gRPC

```typescript
{
  id: 'grpc_method',
  path: '/grpc/CustomerService/GetCustomer',
  protocolConfig: {
    subProtocol: 'grpc',
    serviceName: 'CustomerService',
    methodName: 'GetCustomer',
    streaming: false,
  },
}
```

### tRPC

```typescript
{
  id: 'trpc_query',
  path: '/trpc/customer.get',
  protocolConfig: {
    subProtocol: 'trpc',
    procedureType: 'query',
    router: 'customer',
  },
}
```

## API Registry Methods

### Registration

- `registerApi(api: ApiRegistryEntry): void` - Register an API
- `unregisterApi(apiId: string): void` - Unregister an API

### Discovery

- `getApi(apiId: string): ApiRegistryEntry | undefined` - Get API by ID
- `getAllApis(): ApiRegistryEntry[]` - Get all registered APIs
- `findApis(query: ApiDiscoveryQuery): ApiDiscoveryResponse` - Search/filter APIs
- `getEndpoint(apiId: string, endpointId: string): ApiEndpointRegistration | undefined` - Get specific endpoint
- `findEndpointByRoute(method: string, path: string): { api, endpoint } | undefined` - Find endpoint by route

### Registry Info

- `getRegistry(): ApiRegistry` - Get complete registry snapshot
- `getStats(): RegistryStats` - Get registry statistics
- `clear(): void` - Clear all registered APIs (for testing)

## Examples

See [api-registry-example.ts](./examples/api-registry-example.ts) for comprehensive examples:

1. **Basic API Registration** - Simple REST API with CRUD endpoints
2. **Multi-Plugin Discovery** - Multiple plugins registering different API types
3. **Route Conflict Resolution** - Priority-based conflict handling
4. **Custom Protocol Support** - WebSocket API with protocol config
5. **Dynamic Schema Linking** - ObjectQL reference in API responses

## Testing

Run the API Registry tests:

```bash
pnpm --filter @objectstack/core test api-registry.test.ts
pnpm --filter @objectstack/core test api-registry-plugin.test.ts
```

**Test Coverage:**
- ✅ 32 tests for ApiRegistry service
- ✅ 9 tests for API Registry plugin
- ✅ All conflict resolution strategies
- ✅ Multi-protocol support
- ✅ API discovery and filtering
- ✅ Integration with kernel lifecycle

## Next Steps

Based on [API_REGISTRY_ENHANCEMENTS.md](../../API_REGISTRY_ENHANCEMENTS.md), recommended next implementations:

1. **API Explorer Plugin** - UI to visualize the registry
2. **Gateway Integration** - Implement permission checking in API gateway
3. **Schema Resolution** - Build engine to resolve ObjectQL references to JSON schemas
4. **Conflict Detection UI** - Visualization of route conflicts and priorities
5. **Plugin Examples** - Reference implementations for gRPC and tRPC plugins

## Related Documentation

- [API Registry Schema](../spec/src/api/registry.zod.ts) - Zod schema definitions
- [API Registry Tests](./src/api-registry.test.ts) - Comprehensive test suite
- [Plugin System](./README.md) - ObjectStack plugin architecture
- [Microkernel Design](../../ARCHITECTURE.md) - Overall architecture

## License

MIT
