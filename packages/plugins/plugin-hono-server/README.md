# @objectstack/plugin-hono-server

HTTP Server adapter for ObjectStack using Hono.

## Features

- **Fast**: Built on Hono, a high-performance web framework.
- **Protocol Compliant**: Implements the `IHttpServer` interface required by `@objectstack/runtime`.
- **Middleware**: Supports standard ObjectStack middleware.

## Usage

```typescript
import { ObjectKernel } from '@objectstack/core';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';

const kernel = new ObjectKernel();
kernel.use(new HonoServerPlugin({ port: 3000 }));
```
