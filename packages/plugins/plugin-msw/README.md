# @objectstack/plugin-msw

MSW (Mock Service Worker) Plugin for ObjectStack Runtime. This plugin enables seamless integration with [Mock Service Worker](https://mswjs.io/) for testing and development environments.

## Features

- 🎯 **Automatic API Mocking**: Automatically generates MSW handlers for all ObjectStack API endpoints
- 🔄 **Runtime Integration**: Seamlessly integrates with ObjectStack Runtime Protocol
- 🧪 **Testing Ready**: Perfect for unit tests, integration tests, and development
- 🌐 **Browser & Node Support**: Works in both browser and Node.js environments
- 🎨 **Custom Handlers**: Easily add custom MSW handlers alongside standard ones
- 📝 **TypeScript First**: Fully typed with TypeScript

## Installation

```bash
pnpm add @objectstack/plugin-msw msw
```

## Usage

### With ObjectStack Runtime

```typescript
import { MSWPlugin } from '@objectstack/plugin-msw';
import { ObjectStackRuntime } from '@objectstack/runtime';

const runtime = new ObjectStackRuntime({
  plugins: [
    new MSWPlugin({
      enableBrowser: true,
      baseUrl: '/api/v1',
      logRequests: true
    })
  ]
});

await runtime.start();
```

### Standalone Usage (Browser)

```typescript
import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { ObjectStackServer } from '@objectstack/plugin-msw';

// 1. Initialize the mock server
ObjectStackServer.init(protocol);

// 2. Define your handlers
const handlers = [
  // Intercept GET /api/user/:id
  http.get('/api/user/:id', async ({ params }) => {
    const result = await ObjectStackServer.getData('user', params.id as string);
    return HttpResponse.json(result.data, { status: result.status });
  }),

  // Intercept POST /api/user
  http.post('/api/user', async ({ request }) => {
    const body = await request.json();
    const result = await ObjectStackServer.createData('user', body);
    return HttpResponse.json(result.data, { status: result.status });
  }),
];

// 3. Create and start the worker
const worker = setupWorker(...handlers);
await worker.start();
```

### With Custom Handlers

```typescript
import { MSWPlugin } from '@objectstack/plugin-msw';
import { http, HttpResponse } from 'msw';

const customHandlers = [
  http.get('/api/custom/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, custom: true });
  })
];

const plugin = new MSWPlugin({
  customHandlers,
  baseUrl: '/api/v1'
});
```

## API Reference

### MSWPlugin

The main plugin class that implements the ObjectStack Runtime Plugin interface.

#### Options

```typescript
interface MSWPluginOptions {
  /**
   * Enable MSW in the browser environment
   * @default true
   */
  enableBrowser?: boolean;
  
  /**
   * Custom handlers to add to MSW
   */
  customHandlers?: Array<any>;
  
  /**
   * Base URL for API endpoints
   * @default '/api/v1'
   */
  baseUrl?: string;
  
  /**
   * Whether to log requests
   * @default true
   */
  logRequests?: boolean;
}
```

### ObjectStackServer

The mock server that handles ObjectStack API calls.

#### Static Methods

- `init(protocol, logger?)` - Initialize the mock server with an ObjectStack protocol instance
- `findData(object, params?)` - Find records for an object
- `getData(object, id)` - Get a single record by ID
- `createData(object, data)` - Create a new record
- `updateData(object, id, data)` - Update an existing record
- `deleteData(object, id)` - Delete a record
- `getUser(id)` - Legacy method for getting user (alias for `getData('user', id)`)
- `createUser(data)` - Legacy method for creating user (alias for `createData('user', data)`)

## Mocked Endpoints

The plugin automatically mocks the following ObjectStack API endpoints:

### Discovery
- `GET /api/v1` - Get API discovery information

### Metadata
- `GET /api/v1/meta` - Get available metadata types
- `GET /api/v1/meta/:type` - Get metadata items for a type
- `GET /api/v1/meta/:type/:name` - Get specific metadata item

### Data Operations
- `GET /api/v1/data/:object` - Find records
- `GET /api/v1/data/:object/:id` - Get record by ID
- `POST /api/v1/data/:object` - Create record
- `PATCH /api/v1/data/:object/:id` - Update record
- `DELETE /api/v1/data/:object/:id` - Delete record

### UI Protocol
- `GET /api/v1/ui/view/:object` - Get UI view configuration

## Example: Testing with Vitest

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupWorker } from 'msw/browser';
import { ObjectStackServer } from '@objectstack/plugin-msw';
import { http, HttpResponse } from 'msw';

describe('User API', () => {
  let worker: any;

  beforeAll(async () => {
    // Initialize mock server
    ObjectStackServer.init(protocol);

    // Setup handlers
    const handlers = [
      http.get('/api/user/:id', async ({ params }) => {
        const result = await ObjectStackServer.getData('user', params.id as string);
        return HttpResponse.json(result.data, { status: result.status });
      })
    ];

    worker = setupWorker(...handlers);
    await worker.start({ onUnhandledRequest: 'bypass' });
  });

  afterAll(() => {
    worker.stop();
  });

  it('should get user by id', async () => {
    const response = await fetch('/api/user/123');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
```

## License

Apache-2.0

## Related Packages

- [@objectstack/runtime](../runtime) - ObjectStack Runtime
- [@objectstack/spec](../spec) - ObjectStack Specifications
- [msw](https://mswjs.io/) - Mock Service Worker
