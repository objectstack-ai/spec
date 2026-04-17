# @objectstack/sveltekit

> SvelteKit adapter for ObjectStack — server endpoints and `handle` hook for the auto-generated REST API.

[![npm](https://img.shields.io/npm/v/@objectstack/sveltekit.svg)](https://www.npmjs.com/package/@objectstack/sveltekit)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

Bridges SvelteKit request events to `HttpDispatcher`. Ship ObjectStack either as a catch-all `+server.ts` route or as a `handle` hook for global interception.

## Installation

```bash
pnpm add @objectstack/sveltekit
```

## Quick Start — catch-all endpoint

```typescript
// src/routes/api/[...path]/+server.ts
import { createRequestHandler } from '@objectstack/sveltekit';
import { kernel } from '$lib/server/kernel';

const handler = createRequestHandler({ kernel });

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
```

### Global `handle` hook

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { createHandle } from '@objectstack/sveltekit';
import { kernel } from '$lib/server/kernel';

export const handle = sequence(createHandle({ kernel, prefix: '/api' }));
```

## Key Exports

| Export | Kind | Description |
|:---|:---|:---|
| `createRequestHandler(options)` | function | Returns a `RequestHandler` for catch-all routes. |
| `createHandle(options)` | function | Returns a SvelteKit `Handle` hook. |
| `SvelteKitAdapterOptions` | interface | `{ kernel, prefix? }`. |

## When to use

- ✅ SvelteKit 2.x applications.
- ✅ Projects preferring the `handle` hook over route files.

## When not to use

- ❌ Sapper and SvelteKit 1.x are not supported.

## Related Packages

- [`@objectstack/runtime`](../../runtime), [`@objectstack/rest`](../../rest).

## Links

- 📖 Docs: <https://objectstack.ai/docs>
- 📚 API Reference: <https://objectstack.ai/docs/references>

## License

Apache-2.0 © ObjectStack
