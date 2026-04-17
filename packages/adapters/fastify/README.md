# @objectstack/fastify

> Fastify plugin for ObjectStack — registers the auto-generated REST API and dispatcher as a Fastify plugin.

[![npm](https://img.shields.io/npm/v/@objectstack/fastify.svg)](https://www.npmjs.com/package/@objectstack/fastify)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

Exposes ObjectStack as a standard Fastify plugin. Auth, storage, GraphQL, and discovery routes are handled explicitly; everything else is served by a catch-all delegating to `HttpDispatcher`, so protocol evolution does not require adapter changes.

## Installation

```bash
pnpm add @objectstack/fastify fastify
```

## Quick Start

```typescript
import Fastify from 'fastify';
import { objectStackPlugin } from '@objectstack/fastify';
import { kernel } from './my-kernel';

const app = Fastify({ logger: true });
await app.register(objectStackPlugin, { kernel, prefix: '/api' });
await app.listen({ port: 3000 });
```

### Decorator mode

```typescript
import { objectStackDecorator } from '@objectstack/fastify';

app.decorate('objectstack', objectStackDecorator(kernel));
```

## Key Exports

| Export | Kind | Description |
|:---|:---|:---|
| `objectStackPlugin` | fastify plugin | Registers all dispatcher routes under `prefix`. |
| `objectStackDecorator(kernel)` | function | Returns a decorator that exposes the dispatcher on the Fastify instance. |
| `FastifyAdapterOptions` | interface | `{ kernel, prefix? }`. |

## Configuration

| Option | Type | Default |
|:---|:---|:---|
| `kernel` | `ObjectKernel` | — |
| `prefix` | `string` | `'/api'` |

## Middleware order

Register the ObjectStack plugin **after** body parsing, CORS, and authentication preprocessors. Do not enable Fastify's automatic schema validation on ObjectStack routes — the protocol does its own Zod validation.

## When to use

- ✅ Fastify applications needing high-throughput APIs.
- ✅ Teams already invested in Fastify's plugin ecosystem.

## When not to use

- ❌ Edge / serverless Workers — use [`@objectstack/hono`](../hono).

## Related Packages

- [`@objectstack/runtime`](../../runtime), [`@objectstack/rest`](../../rest), [`@objectstack/core`](../../core).

## Links

- 📖 Docs: <https://objectstack.ai/docs>
- 📚 API Reference: <https://objectstack.ai/docs/references>

## License

Apache-2.0 © ObjectStack
