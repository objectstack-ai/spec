# @objectstack/nuxt

> Nuxt adapter for ObjectStack — Nitro/h3 server routes for the auto-generated REST API.

[![npm](https://img.shields.io/npm/v/@objectstack/nuxt.svg)](https://www.npmjs.com/package/@objectstack/nuxt)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

Provides an h3 router factory that exposes all ObjectStack dispatcher routes, mountable inside `server/api/[...].ts` of any Nuxt 3 application (or directly in a standalone Nitro app).

## Installation

```bash
pnpm add @objectstack/nuxt
```

## Quick Start

```typescript
// server/api/[...objectstack].ts
import { createH3Router } from '@objectstack/nuxt';
import { kernel } from '~/server/kernel';

export default createH3Router({ kernel, prefix: '/api' }).handler;
```

## Key Exports

| Export | Kind | Description |
|:---|:---|:---|
| `createH3Router(options)` | function | h3 `Router` with dispatcher routes installed. |
| `NuxtAdapterOptions` | interface | `{ kernel, prefix? }`. |

## Middleware order

Register Nuxt server middleware that rewrites or compresses responses **before** this router. Do not wrap ObjectStack routes with `defineEventHandler` validators.

## When to use

- ✅ Nuxt 3 / Nitro applications.
- ✅ Any h3-based server (used directly via `createH3Router`).

## When not to use

- ❌ Nuxt 2 is not supported.

## Related Packages

- [`@objectstack/runtime`](../../runtime), [`@objectstack/rest`](../../rest).

## Links

- 📖 Docs: <https://objectstack.ai/docs>
- 📚 API Reference: <https://objectstack.ai/docs/references>

## License

Apache-2.0 © ObjectStack
