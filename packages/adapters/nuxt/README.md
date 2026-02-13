# @objectstack/nuxt

The official Nuxt adapter for ObjectStack, built on h3.

## Features
- h3 router integration for Nuxt server routes
- Full Auth/GraphQL/Metadata/Data/Storage routes
- AuthPlugin service support
- Works with standalone h3 apps too

## Usage

```typescript
// server/api/[...].ts
import { createH3Router } from '@objectstack/nuxt';
import { kernel } from '../kernel';

const router = createH3Router({ kernel });
export default defineEventHandler(router.handler);
```
