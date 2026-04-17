# @objectstack/express

> Express adapter for ObjectStack — mounts the auto-generated REST API and route dispatcher onto an Express app.

[![npm](https://img.shields.io/npm/v/@objectstack/express.svg)](https://www.npmjs.com/package/@objectstack/express)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

Wraps `HttpDispatcher` from `@objectstack/runtime` as an Express `Router` (or request middleware). All ObjectStack routes — CRUD, batch, metadata, discovery, auth, storage, GraphQL — are handled by a catch-all that delegates to the dispatcher, so new protocol routes work automatically without adapter updates.

## Installation

```bash
pnpm add @objectstack/express express
```

## Quick Start

```typescript
import express from 'express';
import { createExpressRouter } from '@objectstack/express';
import { kernel } from './my-kernel';

const app = express();
app.use(express.json());
app.use('/api', createExpressRouter({ kernel }));
app.listen(3000);
```

### Middleware mode

```typescript
import { objectStackMiddleware } from '@objectstack/express';

app.use(objectStackMiddleware(kernel));
```

## Key Exports

| Export | Kind | Description |
|:---|:---|:---|
| `createExpressRouter(options)` | function | Returns a mounted `Router` with all ObjectStack dispatchers. |
| `objectStackMiddleware(kernel)` | function | Per-request middleware (use for custom routing/prefix). |
| `ExpressAdapterOptions` | interface | `{ kernel: ObjectKernel, prefix?: string }`. |

## Configuration

| Option | Type | Default | Notes |
|:---|:---|:---|:---|
| `kernel` | `ObjectKernel` | — | Bootstrapped kernel from `@objectstack/core`. |
| `prefix` | `string` | `'/api'` | Base path for the mounted router. |

## Middleware order

`express.json()` (or an equivalent body parser) MUST be registered **before** the ObjectStack router. Auth cookies require `cookie-parser` if you use cookie sessions. The adapter sets response headers directly; do not wrap with compression middleware that rewrites JSON bodies before the router.

## When to use

- ✅ Adding ObjectStack to an existing Express app.
- ✅ Node.js deployments without edge runtime constraints.

## When not to use

- ❌ Edge / Workers — use [`@objectstack/hono`](../hono) instead.
- ❌ Next.js App Router — use [`@objectstack/nextjs`](../nextjs).

## Related Packages

- [`@objectstack/runtime`](../../runtime) — provides `HttpDispatcher`.
- [`@objectstack/rest`](../../rest) — route registration used by the dispatcher.
- [`@objectstack/core`](../../core) — kernel.

## Links

- 📖 Docs: <https://objectstack.ai/docs>
- 📚 API Reference: <https://objectstack.ai/docs/references>

## License

Apache-2.0 © ObjectStack
