# @objectstack/sveltekit

The official SvelteKit adapter for ObjectStack.

## Features
- SvelteKit API route handler
- Full Auth/GraphQL/Metadata/Data/Storage routes
- AuthPlugin service support
- Handle hook for attaching kernel to event.locals

## Usage

```typescript
// src/routes/api/[...path]/+server.ts
import { createRequestHandler } from '@objectstack/sveltekit';
import { kernel } from '$lib/kernel';

const handler = createRequestHandler({ kernel });

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
```
