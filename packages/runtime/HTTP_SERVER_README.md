# HTTP Server & REST API Server

This document describes the HTTP Server and REST API Server implementation for the ObjectStack runtime environment.

## Overview

The HTTP Server and REST API Server components provide:

1. **HTTP Server Abstraction** - Unified interface for HTTP server implementations
2. **REST API Server** - Automatic RESTful CRUD endpoint generation
3. **Middleware Management** - Flexible middleware chain with ordering and filtering
4. **Route Management** - Organized route registration and metadata

## Architecture

### Protocol Schemas (Spec Package)

#### 1. HTTP Server Protocol (`packages/spec/src/system/http-server.zod.ts`)

Defines runtime HTTP server configuration and capabilities:

- **HttpServerConfigSchema** - Server configuration (port, host, CORS, compression, security)
- **RouteHandlerMetadataSchema** - Route metadata for documentation
- **MiddlewareConfigSchema** - Middleware configuration with ordering and path filtering
- **ServerEventSchema** - Server lifecycle events
- **ServerCapabilitiesSchema** - Server capability declarations
- **ServerStatusSchema** - Operational status and metrics

#### 2. REST API Server Protocol (`packages/spec/src/api/rest-server.zod.ts`)

Defines REST API server configuration for automatic endpoint generation:

- **RestApiConfigSchema** - API version, base path, feature toggles
- **CrudEndpointsConfigSchema** - CRUD operation patterns
- **MetadataEndpointsConfigSchema** - Metadata API with HTTP caching
- **BatchEndpointsConfigSchema** - Batch operation endpoints
- **RouteGenerationConfigSchema** - Per-object route customization
- **EndpointRegistrySchema** - Generated endpoint registry

### Runtime Implementation (Runtime Package)

#### 1. HttpServer (`packages/runtime/src/http-server.ts`)

Unified HTTP server wrapper that:
- Implements the `IHttpServer` interface from `@objectstack/core`
- Wraps underlying server implementations (Hono, Express, Fastify, etc.)
- Provides unified route registration API (GET, POST, PUT, PATCH, DELETE)
- Manages middleware registration
- Tracks registered routes and middleware

#### 2. MiddlewareManager (`packages/runtime/src/middleware.ts`)

Advanced middleware management with:
- **Execution ordering** - Priority-based middleware execution (lower order = earlier execution)
- **Path filtering** - Include/exclude path patterns (glob support)
- **Dynamic control** - Enable/disable individual middleware at runtime
- **Type categorization** - Group middleware by type (authentication, logging, validation, etc.)
- **Composite chains** - Generate middleware chains for specific paths

#### 3. RouteManager (`packages/runtime/src/route-manager.ts`)

Route organization and registration:
- **Route registration** - Register routes with metadata
- **Route grouping** - Group routes by common prefix
- **Route querying** - Lookup by method, prefix, or tag
- **Builder pattern** - Fluent API for route groups

#### 4. RestServer (`packages/runtime/src/rest-server.ts`)

Automatic REST API endpoint generation:
- **Discovery endpoints** - API version and capabilities
- **Metadata endpoints** - Object schemas with HTTP caching (ETag, Last-Modified)
- **CRUD endpoints** - Standard RESTful operations for all objects
- **Batch endpoints** - Bulk operations (createMany, updateMany, deleteMany)
- **Configurable** - Customize paths, operations, and behavior per object

## Usage

### 1. Basic REST Server Setup

```typescript
import { RestServer } from '@objectstack/runtime';
import type { IProtocolProvider } from '@objectstack/runtime';

// Create a protocol provider (usually from ObjectQL engine)
const protocol: IProtocolProvider = {
  // Implement required methods
  getDiscovery() { /* ... */ },
  getMetaTypes() { /* ... */ },
  findData(object, query) { /* ... */ },
  getData(object, id) { /* ... */ },
  createData(object, data) { /* ... */ },
  updateData(object, id, data) { /* ... */ },
  deleteData(object, id) { /* ... */ },
  // Optional batch operations
  createManyData(object, records) { /* ... */ },
  // ...
};

// Create REST server with configuration
const restServer = new RestServer(httpServer, protocol, {
  api: {
    version: 'v1',
    basePath: '/api',
    enableCrud: true,
    enableMetadata: true,
    enableBatch: true,
  },
  crud: {
    dataPrefix: '/data',
  },
  metadata: {
    prefix: '/meta',
    enableCache: true,
  },
  batch: {
    maxBatchSize: 200,
  }
});

// Register all routes
restServer.registerRoutes();
```

### 2. Middleware Management

```typescript
import { MiddlewareManager } from '@objectstack/runtime';

const manager = new MiddlewareManager();

// Register middleware with ordering
manager.register({
  name: 'auth',
  type: 'authentication',
  order: 30,
  paths: {
    exclude: ['/health', '/metrics'] // Public endpoints
  }
}, authMiddleware);

manager.register({
  name: 'logger',
  type: 'logging',
  order: 20,
}, loggingMiddleware);

// Apply to server
const chain = manager.getMiddlewareChain();
chain.forEach(mw => server.use(mw));

// Dynamic control
manager.disable('auth'); // Temporarily disable
manager.enable('auth');  // Re-enable
```

### 3. Route Management

```typescript
import { RouteManager } from '@objectstack/runtime';

const routeManager = new RouteManager(server);

// Register individual routes
routeManager.register({
  method: 'GET',
  path: '/api/users/:id',
  handler: getUserHandler,
  metadata: {
    summary: 'Get user by ID',
    tags: ['users']
  }
});

// Use route groups
routeManager.group('/api/users', (group) => {
  group.get('/', listUsersHandler);
  group.post('/', createUserHandler);
  group.get('/:id', getUserHandler);
  group.patch('/:id', updateUserHandler);
  group.delete('/:id', deleteUserHandler);
});

// Query routes
const routes = routeManager.getAll();
const userRoutes = routeManager.getByPrefix('/api/users');
const taggedRoutes = routeManager.getByTag('users');
```

## Generated Endpoints

When you call `restServer.registerRoutes()`, the following endpoints are automatically generated:

### Discovery
- `GET /api/v1` - API discovery information

### Metadata
- `GET /api/v1/meta` - List all metadata types
- `GET /api/v1/meta/:type` - List items of a type (e.g., objects, fields)
- `GET /api/v1/meta/:type/:name` - Get specific metadata item with HTTP caching

### CRUD (for each object)
- `GET /api/v1/data/:object` - List/query records
- `GET /api/v1/data/:object/:id` - Get record by ID
- `POST /api/v1/data/:object` - Create record
- `PATCH /api/v1/data/:object/:id` - Update record
- `DELETE /api/v1/data/:object/:id` - Delete record

### Batch Operations
- `POST /api/v1/data/:object/batch` - Generic batch operations
- `POST /api/v1/data/:object/createMany` - Bulk create
- `POST /api/v1/data/:object/updateMany` - Bulk update
- `POST /api/v1/data/:object/deleteMany` - Bulk delete

## Configuration Examples

### Custom CRUD Patterns

```typescript
const restServer = new RestServer(httpServer, protocol, {
  crud: {
    dataPrefix: '/entities',  // Use /entities instead of /data
    operations: {
      create: true,
      read: true,
      update: true,
      delete: false,  // Disable delete
      list: true,
    }
  }
});
```

### Metadata with Custom Cache

```typescript
const restServer = new RestServer(httpServer, protocol, {
  metadata: {
    prefix: '/schema',
    enableCache: true,
    cacheTtl: 7200,  // 2 hours
    endpoints: {
      types: true,
      items: true,
      item: true,
      schema: false,  // Disable schema endpoint
    }
  }
});
```

### Object-Specific Route Overrides

```typescript
const restServer = new RestServer(httpServer, protocol, {
  routes: {
    excludeObjects: ['system_log'],  // Don't generate routes for system objects
    overrides: {
      user: {
        enabled: true,
        basePath: '/users',  // Custom path for user object
        operations: {
          create: true,
          read: true,
          update: true,
          delete: false,  // Users can't be deleted via API
          list: true,
        }
      }
    }
  }
});
```

## Features

### HTTP Caching for Metadata

Metadata endpoints support standard HTTP caching headers:
- **ETag** - Entity tag for conditional requests
- **Last-Modified** - Last modification timestamp
- **Cache-Control** - Caching directives
- **304 Not Modified** - Efficient cache validation

```http
GET /api/v1/meta/object/user HTTP/1.1
If-None-Match: "abc123"

HTTP/1.1 304 Not Modified
```

### Middleware Ordering

Middleware executes in order based on the `order` field (lower = earlier):

1. Error handling (order: 1)
2. CORS (order: 10)
3. Logging (order: 20)
4. Rate limiting (order: 25)
5. Authentication (order: 30)
6. Caching (order: 35)
7. Validation (order: 40)

### Path-Based Filtering

Middleware can include or exclude specific paths:

```typescript
manager.register({
  name: 'auth',
  type: 'authentication',
  paths: {
    include: ['/api/*'],           // Only API paths
    exclude: ['/health', '/metrics'] // Skip health checks
  }
}, authMiddleware);
```

## Integration with Existing Code

The new components integrate seamlessly with existing ObjectStack infrastructure:

1. **IHttpServer Interface** - Compatible with `@objectstack/core` contracts
2. **Plugin System** - Works with existing plugin architecture
3. **Protocol Provider** - Uses the same protocol interface as existing implementations
4. **Hono Server Plugin** - Can be enhanced to use RestServer for automatic route generation

## Examples

See the following example files for complete usage:
- `examples/rest-server-example.ts` - REST server setup and usage
- `examples/middleware-example.ts` - Middleware management patterns

## Best Practices

1. **Use RestServer for standard CRUD** - Let the server generate endpoints automatically
2. **Use RouteManager for custom routes** - Add custom business logic routes
3. **Order middleware correctly** - Error handling first, validation last
4. **Use path filtering** - Exclude public endpoints from authentication
5. **Enable HTTP caching** - Reduce metadata endpoint load
6. **Configure batch limits** - Prevent abuse with appropriate limits

## Future Enhancements

Potential future improvements:
- OpenAPI/Swagger documentation generation
- Rate limiting per route
- Request transformation and validation
- Response transformation and serialization
- WebSocket endpoint support
- GraphQL endpoint support
