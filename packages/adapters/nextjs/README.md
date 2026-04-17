# @objectstack/nextjs

> Next.js adapter for ObjectStack — App Router route handlers and server actions for the generated REST API.

[![npm](https://img.shields.io/npm/v/@objectstack/nextjs.svg)](https://www.npmjs.com/package/@objectstack/nextjs)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

Bridges Next.js App Router to `HttpDispatcher`. Provides one catch-all route handler that supports `/api/[...objectstack]`, a dedicated `/api/v1/discovery` handler, and typed server actions for CRUD and batch operations from React Server Components.

## Installation

```bash
pnpm add @objectstack/nextjs next
```

## Quick Start

```typescript
// app/api/[...objectstack]/route.ts
import { createRouteHandler } from '@objectstack/nextjs';
import { kernel } from '@/lib/kernel';

const handler = createRouteHandler({ kernel });

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
```

```typescript
// app/api/v1/discovery/route.ts
import { createDiscoveryHandler } from '@objectstack/nextjs';
import { kernel } from '@/lib/kernel';

export const GET = createDiscoveryHandler({ kernel });
```

### Server actions

```typescript
// app/actions.ts
'use server';
import { createServerActions } from '@objectstack/nextjs';
import { kernel } from '@/lib/kernel';

export const { find, findOne, create, update, remove } = createServerActions({ kernel });
```

## Key Exports

| Export | Kind | Description |
|:---|:---|:---|
| `createRouteHandler(options)` | function | Catch-all App Router handler. |
| `createDiscoveryHandler(options)` | function | `/api/v1/discovery` handler. |
| `createServerActions(options)` | function | Returns typed server actions. |
| `NextAdapterOptions` | interface | `{ kernel, prefix? }`. |
| `ServerActionResult<T>` | type | `{ success: boolean; data?: T; error?: string }` envelope. |

## Edge vs Node

- Default runtime is Node.js. To use Edge, export `runtime = 'edge'` from the route file and pair with an edge-compatible driver ([`@objectstack/driver-turso`](../../plugins/driver-turso)).
- `HttpDispatcher` is isomorphic; the adapter emits `NextResponse` which works in both runtimes.

## When to use

- ✅ Next.js App Router projects.
- ✅ React Server Components that need type-safe data mutations via server actions.

## When not to use

- ❌ Pages Router projects — use [`@objectstack/express`](../express) with `next-connect` or migrate to App Router.

## Related Packages

- [`@objectstack/client-react`](../../client-react) — client-side hooks.
- [`@objectstack/runtime`](../../runtime), [`@objectstack/rest`](../../rest).

## Links

- 📖 Docs: <https://objectstack.ai/docs>
- 📚 API Reference: <https://objectstack.ai/docs/references>

## License

Apache-2.0 © ObjectStack
