# @objectstack/nestjs

> NestJS adapter for ObjectStack — installs the auto-generated REST API as a dynamic NestJS module.

[![npm](https://img.shields.io/npm/v/@objectstack/nestjs.svg)](https://www.npmjs.com/package/@objectstack/nestjs)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

Provides `ObjectStackModule` — a `DynamicModule` that registers `ObjectStackService`, a catch-all `ObjectStackController` (routes under `/api`), and a `DiscoveryController` for service self-description. The module injects `ObjectKernel` via the `OBJECT_KERNEL` DI token so controllers and guards can resolve it normally.

## Installation

```bash
pnpm add @objectstack/nestjs @nestjs/common @nestjs/core
```

## Quick Start

```typescript
import { Module } from '@nestjs/common';
import { ObjectStackModule } from '@objectstack/nestjs';
import { kernel } from './my-kernel';

@Module({
  imports: [ObjectStackModule.forRoot({ kernel })],
})
export class AppModule {}
```

### Inject the kernel elsewhere

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { OBJECT_KERNEL } from '@objectstack/nestjs';
import type { ObjectKernel } from '@objectstack/runtime';

@Injectable()
class MyService {
  constructor(@Inject(OBJECT_KERNEL) private kernel: ObjectKernel) {}
}
```

## Key Exports

| Export | Kind | Description |
|:---|:---|:---|
| `ObjectStackModule` | dynamic module | `ObjectStackModule.forRoot({ kernel })`. |
| `ObjectStackService` | injectable | Exposes `dispatcher` and `getKernel()`. |
| `ObjectStackController` | controller | Catch-all under `/api` delegating to `HttpDispatcher`. |
| `DiscoveryController` | controller | Serves `/api/v1/discovery` and `/.well-known/objectstack`. |
| `OBJECT_KERNEL` | DI token | Resolves the bootstrapped kernel. |
| `ConnectReq` | param decorator | Retrieves the raw request for custom handlers. |

## Middleware order

NestJS global `ValidationPipe` MUST NOT run on ObjectStack routes — the protocol owns its validation. Use `@UsePipes` only on NestJS-owned controllers.

## When to use

- ✅ NestJS monoliths that need ObjectStack as a module alongside domain controllers.
- ✅ Teams standardized on NestJS DI and decorators.

## When not to use

- ❌ Edge runtimes — use [`@objectstack/hono`](../hono).

## Related Packages

- [`@objectstack/runtime`](../../runtime), [`@objectstack/rest`](../../rest), [`@objectstack/core`](../../core).

## Links

- 📖 Docs: <https://objectstack.ai/docs>
- 📚 API Reference: <https://objectstack.ai/docs/references>

## License

Apache-2.0 © ObjectStack
