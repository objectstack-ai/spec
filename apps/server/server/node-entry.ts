// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Node.js Entrypoint
 *
 * Starts a standard Node HTTP server backed by the same Hono app that the
 * Vercel handler uses. This is the preferred entry for:
 *   - Local development (`pnpm dev`)
 *   - Docker / Fly.io deployments
 *   - Any non-serverless environment
 *
 * Reuses the `ensureApp()` singleton from `index.ts`, so the kernel is
 * built once and shared across requests within the process.
 */

import { serve } from '@hono/node-server';
import { ensureApp, ensureBoot } from './index.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

async function main(): Promise<void> {
    console.log('[ObjectStack] Booting kernel...');
    const boot = await ensureBoot();
    console.log(`[ObjectStack] Kernel ready (mode=${boot.mode}, driver=${boot.driverName}).`);

    const app = await ensureApp();

    serve({ fetch: app.fetch, port, hostname: host }, (info) => {
        console.log(`[ObjectStack] Listening on http://${host}:${info.port}`);
    });
}

main().catch((err) => {
    console.error('[ObjectStack] Fatal boot error:', err);
    process.exit(1);
});
