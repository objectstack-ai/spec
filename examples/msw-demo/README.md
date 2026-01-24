# MSW Demo Example

This example demonstrates how to use the `@objectstack/plugin-msw` package to mock ObjectStack APIs using Mock Service Worker (MSW).

## Features

- **Browser Mode**: Shows how to use MSW in a browser environment with standalone handlers
- **Server Mode**: Demonstrates MSW plugin integration with ObjectStack Runtime

## Files

- `src/browser.ts` - Browser-based MSW setup matching the problem statement
- `src/server.ts` - Server-side MSW plugin integration with Runtime

## Usage

### Browser Mode

```typescript
import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { ObjectStackServer } from '@objectstack/plugin-msw';

// Initialize mock server
ObjectStackServer.init(protocol);

// Define handlers
const handlers = [
  http.get('/api/user/:id', async ({ params }) => {
    const result = await ObjectStackServer.getUser(params.id);
    return HttpResponse.json(result.data, { status: result.status });
  })
];

// Start worker
const worker = setupWorker(...handlers);
await worker.start();
```

### Runtime Integration

```typescript
import { ObjectStackKernel } from '@objectstack/runtime';
import { MSWPlugin } from '@objectstack/plugin-msw';

const kernel = new ObjectStackKernel([
  // Your manifests...
  new MSWPlugin({
    baseUrl: '/api/v1',
    logRequests: true
  })
]);

await kernel.start();
```

## Running

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run server example
pnpm dev
```

## API Endpoints Mocked

The MSW plugin automatically mocks the following endpoints:

- `GET /api/v1` - Discovery
- `GET /api/v1/meta` - Metadata types
- `GET /api/v1/meta/:type` - Metadata items
- `GET /api/v1/meta/:type/:name` - Specific metadata
- `GET /api/v1/data/:object` - Find records
- `GET /api/v1/data/:object/:id` - Get record
- `POST /api/v1/data/:object` - Create record
- `PATCH /api/v1/data/:object/:id` - Update record
- `DELETE /api/v1/data/:object/:id` - Delete record
- `GET /api/v1/ui/view/:object` - UI view config

## See Also

- [@objectstack/plugin-msw](../../packages/plugin-msw) - MSW Plugin package
- [MSW Documentation](https://mswjs.io/) - Official MSW docs
