# @objectstack/plugin-hono-server

HTTP Server Adapter for ObjectStack Runtime using the [Hono](https://hono.dev/) framework. This plugin provides a production-ready REST API gateway for ObjectStack applications.

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
}
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

### Extending with Middleware

The plugin provides extension points for adding custom middleware:

```typescript
// In another plugin's manifest
capabilities: {
  extensions: [
    {
      targetPluginId: 'com.objectstack.server.hono',
      extensionPointId: 'com.objectstack.server.extension.middleware',
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
      extensionPointId: 'com.objectstack.server.extension.route',
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
