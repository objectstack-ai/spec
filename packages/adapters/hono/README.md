# @objectstack/hono

The official Hono adapter for ObjectStack.

## Features
- Lightweight & Fast
- Edge Compatible (Cloudflare Workers, Deno, Bun)
- Built-in CORS

## Usage

```typescript
import { createHonoApp } from '@objectstack/hono';
import { kernel } from './my-kernel';

const app = createHonoApp({ kernel });

export default app;
```
