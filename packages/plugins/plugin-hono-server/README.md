# @objectstack/plugin-hono-server

HTTP Server adapter for ObjectStack using Hono.

## Features

- **Standard Runtime**: Uses the unified `HttpDispatcher` and standard Hono adapter via `@objectstack/hono`.
- **Fast**: Built on Hono, a high-performance web framework.
- **Full Protocol Support**: Automatically provides all ObjectStack Runtime endpoints (Auth, Data, Metadata, etc.).
- **Middleware**: Supports standard Hono middleware.

## Usage

```typescript
import { ObjectKernel } from '@objectstack/runtime';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';

const kernel = new ObjectKernel();

// Register the server plugin
kernel.use(new HonoServerPlugin({ 
  port: 3000,
  restConfig: {
      api: {
          apiPath: '/api/v1' // Customize API prefix
      }
  }
}));

await kernel.start();
```

## Architecture

This plugin wraps `@objectstack/hono` to provide a turnkey HTTP server solution for the Runtime. It binds the standard `HttpDispatcher` to a Hono application and starts listening on the configured port.

