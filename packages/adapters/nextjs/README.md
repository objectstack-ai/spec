# @objectstack/nextjs

The official Next.js adapter for ObjectStack.

## Features
- Works with App Router (`app/api/...`)
- Server Actions support (Planned)
- Type-safe integration

## Usage

```typescript
// app/api/[...objectstack]/route.ts
import { createRouteHandler } from '@objectstack/nextjs';
import { kernel } from '@/lib/kernel';

const handler = createRouteHandler({ kernel });

export { handler as GET, handler as POST };
```
