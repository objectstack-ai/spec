---
"@objectstack/studio": patch
---

Fix Vercel deployment API endpoints returning HTML instead of JSON.

Replace the custom `getRequestListener` export in `server/index.ts` with the
standard `handle()` adapter from `@hono/node-server/vercel` and the
outer→inner Hono delegation pattern (`inner.fetch(c.req.raw)`).

- The `handle()` adapter correctly wraps the Hono app with the
  `(IncomingMessage, ServerResponse) => Promise<void>` signature that
  Vercel's Node.js runtime expects for serverless functions in `api/`.
- `@hono/node-server/vercel`'s `getRequestListener()` already handles
  Vercel's pre-buffered `rawBody` natively, removing the need for the
  custom body-extraction helper.
- The outer→inner delegation pattern matches the documented ObjectStack
  Vercel deployment guide and the `@objectstack/hono` adapter test suite.
