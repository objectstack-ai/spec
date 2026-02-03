# @objectstack/plugin-hono-server

HTTP Server Adapter for ObjectStack Runtime using the [Hono](https://hono.dev/) framework. This plugin provides a production-ready REST API gateway for ObjectStack applications.

## 🤖 AI Development Context

**Role**: HTTP Server Adapter
**Usage**:
- Replaces the default server implementation with Hono.
- Ideal for Edge runtimes (Cloudflare Workers, etc.).

## Plugin Capabilities

This plugin implements the ObjectStack plugin capability protocol:
- **Type**: `adapter`
- **Protocol**: `com.objectstack.protocol.http.v1` (full conformance)
- **Protocol**: `com.objectstack.protocol.api.rest.v1` (full conformance)
- **Provides**: `IHttpServer` interface for HTTP server operations
- **Requires**: `com.objectstack.engine.objectql` (optional) for protocol implementation
- **Extension Points**: 
  - `middleware` - Register custom HTTP middleware
  - `route` - Register custom API routes

See [objectstack.config.ts](./objectstack.config.ts) for the complete capability manifest.

## Features

- 🚀 **High Performance**: Built on Hono, one of the fastest web frameworks
- 🌐 **Universal**: Works in Node.js, Deno, Bun, and edge runtimes
- 🔒 **Type Safe**: Fully typed with TypeScript
- 📡 **REST API**: Complete ObjectStack Runtime Protocol implementation
- 🎯 **Auto-Discovery**: Automatic endpoint registration
- 🔌 **Extensible**: Easy to add custom routes and middleware

## Installation

```bash
pnpm add @objectstack/plugin-hono-server hono @hono/node-server
```

## Usage

### Basic Setup

```typescript
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';
import { ObjectKernel } from '@objectstack/runtime';

const kernel = new ObjectKernel();

// Register the server plugin
kernel.use(new HonoServerPlugin({
  port: 3000,
  staticRoot: './public'  // Optional: serve static files
}));

await kernel.bootstrap();

// Server starts automatically when kernel is ready
// API available at: http://localhost:3000/api/v1
```

### With Custom Port

```typescript
const plugin = new HonoServerPlugin({
  port: process.env.PORT || 8080
});

kernel.use(plugin);
```

### Configuration Options

```typescript
interface HonoPluginOptions {
  /**
   * HTTP server port
   * @default 3000
   */
  port?: number;
  
  /**
   * Path to static files directory (optional)
   */
  staticRoot?: string;
  
  /**
   * REST server configuration
   * Controls automatic endpoint generation and API behavior
   */
  restConfig?: RestServerConfig;
  
  /**
   * Whether to register standard ObjectStack CRUD endpoints
   * @default true
   */
  registerStandardEndpoints?: boolean;
  
  /**
   * Whether to load endpoints from API Registry
   * When enabled, routes are loaded dynamically from the API Registry
   * When disabled, uses legacy static route registration
   * @default true
   */
  useApiRegistry?: boolean;
}
```

### Using API Registry (New in v0.9.0)

The plugin now integrates with the ObjectStack API Registry for centralized endpoint management:

```typescript
import { createApiRegistryPlugin } from '@objectstack/core';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';

const kernel = new ObjectKernel();

// 1. Register API Registry Plugin first
kernel.use(createApiRegistryPlugin({
  conflictResolution: 'priority' // Handle route conflicts by priority
}));

// 2. Register Hono Server Plugin
kernel.use(new HonoServerPlugin({
  port: 3000,
  useApiRegistry: true,
  registerStandardEndpoints: true,
  restConfig: {
    api: {
      version: 'v1',
      basePath: '/api',
      enableCrud: true,
      enableMetadata: true,
      enableBatch: true
    }
  }
}));

await kernel.bootstrap();
```

**Benefits of API Registry Integration:**
- 📋 Centralized endpoint registration and discovery
- 🔀 Priority-based route conflict resolution
- 🧩 Support for plugin-registered custom endpoints
- ⚙️ Configurable endpoint generation via `RestServerConfig`
- 🔍 API introspection and documentation generation

### Configuring REST Server Behavior

Use `restConfig` to control which endpoints are automatically generated:

```typescript
new HonoServerPlugin({
  restConfig: {
    api: {
      version: 'v2',
      basePath: '/api',
      enableCrud: true,
      enableMetadata: true,
      enableBatch: true,
      enableDiscovery: true
    },
    crud: {
      dataPrefix: '/data',
      operations: {
        create: true,
        read: true,
        update: true,
        delete: true,
        list: true
      }
    },
    metadata: {
      prefix: '/meta',
      enableCache: true,
      cacheTtl: 3600
    },
    batch: {
      maxBatchSize: 200,
      operations: {
        createMany: true,
        updateMany: true,
        deleteMany: true,
        upsertMany: true
      }
    }
  }
})
```

### Legacy Mode (Without API Registry)

If the API Registry plugin is not registered, the server automatically falls back to legacy mode:

```typescript
// No API Registry needed for simple setups
const kernel = new ObjectKernel();

kernel.use(new HonoServerPlugin({
  port: 3000,
  useApiRegistry: false  // Explicitly disable API Registry
}));

await kernel.bootstrap();
// All standard routes registered statically
```

## API Endpoints

The plugin automatically exposes the following ObjectStack REST API endpoints:

### Discovery

```http
GET /api/v1
```

Returns API discovery information including available endpoints and versions.

### Metadata Protocol

```http
GET /api/v1/meta
GET /api/v1/meta/:type
GET /api/v1/meta/:type/:name
```

Retrieve metadata about objects, views, and other system definitions.

### Data Protocol (CRUD Operations)

```http
GET    /api/v1/data/:object        # Find records
GET    /api/v1/data/:object/:id    # Get record by ID
POST   /api/v1/data/:object        # Create record
PATCH  /api/v1/data/:object/:id    # Update record
DELETE /api/v1/data/:object/:id    # Delete record
```

Example requests:

```bash
# Get all users
curl http://localhost:3000/api/v1/data/user

# Get user by ID
curl http://localhost:3000/api/v1/data/user/123

# Create a user
curl -X POST http://localhost:3000/api/v1/data/user \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Update a user
curl -X PATCH http://localhost:3000/api/v1/data/user/123 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe"}'

# Delete a user
curl -X DELETE http://localhost:3000/api/v1/data/user/123
```

### UI Protocol

```http
GET /api/v1/ui/view/:object?type=list|form
```

Retrieve UI view configurations for objects.

## Advanced Usage

### Accessing the HTTP Server Instance

The server instance is registered as a service and can be accessed by other plugins:

```typescript
export class MyPlugin implements Plugin {
  name = 'my-custom-plugin';
  
  async start(ctx: PluginContext) {
    const httpServer = ctx.getService<IHttpServer>('http-server');
    
    // Add custom routes
    httpServer.get('/api/custom', (req, res) => {
      res.json({ message: 'Custom endpoint' });
    });
  }
}
```

### Registering Custom Endpoints via API Registry

Plugins can register their own endpoints through the API Registry:

```typescript
export class MyApiPlugin implements Plugin {
  name = 'my-api-plugin';
  version = '1.0.0';
  
  async init(ctx: PluginContext) {
    const apiRegistry = ctx.getService<ApiRegistry>('api-registry');
    
    apiRegistry.registerApi({
      id: 'my_custom_api',
      name: 'My Custom API',
      type: 'rest',
      version: 'v1',
      basePath: '/api/v1/custom',
      endpoints: [
        {
          id: 'get_custom_data',
          method: 'GET',
          path: '/api/v1/custom/data',
          summary: 'Get custom data',
          priority: 500, // Lower than core endpoints (950)
          responses: [{
            statusCode: 200,
            description: 'Custom data retrieved'
          }]
        }
      ],
      metadata: {
        pluginSource: 'my-api-plugin',
        status: 'active',
        tags: ['custom']
      }
    });
    
    ctx.logger.info('Custom API endpoints registered');
  }
  
  async start(ctx: PluginContext) {
    // Bind the actual handler implementation
    const httpServer = ctx.getService<IHttpServer>('http-server');
    
    httpServer.get('/api/v1/custom/data', async (req, res) => {
      res.json({ data: 'my custom data' });
    });
  }
}
```

**Note:** The Hono Server Plugin loads routes from the API Registry sorted by priority (highest first), ensuring core endpoints take precedence over plugin endpoints.

### Extending with Middleware

The plugin provides extension points for adding custom middleware:

```typescript
// In another plugin's manifest
capabilities: {
  extensions: [
    {
      targetPluginId: 'com.objectstack.server.hono',
      extensionPointId: 'com.objectstack.server.hono.extension.middleware',
      implementation: './middleware/auth.ts',
      priority: 10
    }
  ]
}
```

### Custom Route Registration

```typescript
// In another plugin's manifest
capabilities: {
  extensions: [
    {
      targetPluginId: 'com.objectstack.server.hono',
      extensionPointId: 'com.objectstack.server.hono.extension.route',
      implementation: './routes/webhooks.ts',
      priority: 50
    }
  ]
}
```

## Architecture

The Hono Server Plugin follows a clean architecture:

```
┌─────────────────────────────────┐
│   HonoServerPlugin              │
│   (Plugin Lifecycle)            │
└────────────┬────────────────────┘
             │
             ├─ init()    → Register HTTP server service
             ├─ start()   → Bind routes, start server
             └─ destroy() → Stop server
                  │
                  ▼
        ┌─────────────────────┐
        │  HonoHttpServer     │
        │  (Adapter)          │
        └──────┬──────────────┘
               │
               ▼
        ┌─────────────────────┐
        │   Hono Framework    │
        │   (Core Library)    │
        └─────────────────────┘
```

## Plugin Lifecycle

1. **Init Phase**: 
   - Creates HonoHttpServer instance
   - Registers as `http-server` service
   
2. **Start Phase**:
   - Retrieves protocol implementation service
   - Registers all ObjectStack API routes
   - Sets up lifecycle hooks
   
3. **Ready Hook** (`kernel:ready`):
   - Starts HTTP server on configured port
   - Logs server URL
   
4. **Destroy Phase**:
   - Gracefully closes server
   - Cleans up resources

## Error Handling

The plugin includes comprehensive error handling:

```typescript
// 404 Not Found
GET /api/v1/data/user/999
→ { "error": "Record not found" }

// 400 Bad Request
POST /api/v1/data/user (invalid data)
→ { "error": "Validation failed: email is required" }
```

## Production Deployment

### Environment Variables

```bash
PORT=8080
NODE_ENV=production
```

### Docker Example

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

### Serverless Deployment

Hono works seamlessly with serverless platforms:

```typescript
// Cloudflare Workers, Vercel Edge, etc.
export default {
  async fetch(request: Request) {
    const app = createHonoApp();
    return app.fetch(request);
  }
}
```

## Performance

Hono is designed for performance:
- ⚡ One of the fastest web frameworks for Node.js
- 🪶 Minimal overhead and memory footprint
- 🚀 Optimized routing with RegExpRouter
- 📦 Small bundle size (~12KB)

## Comparison with Other Adapters

| Feature | Hono | Express | Fastify |
|---------|------|---------|---------|
| Universal Runtime | ✅ | ❌ | ❌ |
| Edge Support | ✅ | ❌ | ❌ |
| TypeScript | ✅ | Partial | ✅ |
| Performance | Excellent | Good | Excellent |
| Bundle Size | 12KB | 208KB | 28KB |

## License

Apache-2.0

## Related Packages

- [@objectstack/runtime](../../runtime) - ObjectStack Runtime
- [@objectstack/spec](../../spec) - ObjectStack Specifications
- [hono](https://hono.dev/) - Hono Web Framework
- [@hono/node-server](https://github.com/honojs/node-server) - Node.js adapter for Hono
