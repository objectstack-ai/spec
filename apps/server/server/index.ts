// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Vercel Serverless API Entrypoint
 *
 * Boots the ObjectStack kernel from the shared objectstack.config.ts
 * and delegates all /api/* traffic to the ObjectStack Hono adapter.
 */

import { ObjectKernel } from '@objectstack/runtime';
import { createHonoApp } from '@objectstack/hono';
import { getRequestListener } from '@hono/node-server';
import type { Hono } from 'hono';
import stackConfig from '../objectstack.config';

// ---------------------------------------------------------------------------
// Singleton state — persists across warm Vercel invocations
// ---------------------------------------------------------------------------

let _kernel: ObjectKernel | null = null;
let _app: Hono | null = null;

/** Shared boot promise — prevents concurrent cold-start races. */
let _bootPromise: Promise<ObjectKernel> | null = null;

// ---------------------------------------------------------------------------
// Kernel bootstrap
// ---------------------------------------------------------------------------

async function ensureKernel(): Promise<ObjectKernel> {
    if (_kernel) return _kernel;
    if (_bootPromise) return _bootPromise;

    _bootPromise = (async () => {
        console.log('[Vercel] Booting ObjectStack Kernel...');

        try {
            const kernel = new ObjectKernel();

            // Register all plugins from shared config
            if (!stackConfig.plugins || stackConfig.plugins.length === 0) {
                throw new Error(`[Vercel] No plugins found in stackConfig`);
            }

            for (const plugin of stackConfig.plugins) {
                await kernel.use(plugin as any);
            }

            await kernel.bootstrap();
            console.log('[Vercel] Kernel ready.');
            return kernel;
        } catch (err) {
            // Clear the lock so the next request can retry
            _bootPromise = null;
            console.error('[Vercel] Kernel boot failed:', (err as any)?.message || err);
            throw err;
        }
    })();

    return _bootPromise;
}

// ---------------------------------------------------------------------------
// Hono app factory
// ---------------------------------------------------------------------------

async function ensureApp(): Promise<Hono> {
    if (_app) return _app;

    const kernel = await ensureKernel();
    _app = createHonoApp({ kernel, prefix: '/api/v1' });
    return _app;
}

// ---------------------------------------------------------------------------
// CORS headers — applied to responses that bypass the Hono app
// (bootstrap failures, preflight short-circuit). Mirrors the defaults of
// `createHonoApp()` so behaviour is identical whether or not the kernel
// has finished booting. See packages/adapters/hono/src/index.ts.
//
// Controlled by the same environment variables as the Hono adapter:
//   CORS_ENABLED, CORS_ORIGIN, CORS_CREDENTIALS, CORS_MAX_AGE.
// ---------------------------------------------------------------------------

const CORS_ALLOW_METHODS = 'GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS';
const CORS_ALLOW_HEADERS = 'Content-Type,Authorization,X-Requested-With';

function corsEnabled(): boolean {
    return process.env.CORS_ENABLED !== 'false';
}

function corsCredentials(): boolean {
    return process.env.CORS_CREDENTIALS !== 'false';
}

function corsMaxAge(): number {
    return process.env.CORS_MAX_AGE ? parseInt(process.env.CORS_MAX_AGE, 10) : 86400;
}

/**
 * Resolve the `Access-Control-Allow-Origin` value for a given request.
 *
 * - If `CORS_ORIGIN` is unset, reflects the request `Origin` (or `*` when
 *   credentials are disabled and no `Origin` is sent).
 * - If `CORS_ORIGIN` is a comma-separated list, matches against it.
 * - Returns `null` if the origin is disallowed.
 */
function resolveAllowOrigin(requestOrigin: string | null): string | null {
    const credentials = corsCredentials();
    const envOrigin = process.env.CORS_ORIGIN?.trim();

    if (!envOrigin) {
        // Default: reflect origin (credentials-safe). Fall back to '*' only
        // when no Origin header is sent and credentials are disabled.
        if (requestOrigin) return requestOrigin;
        return credentials ? null : '*';
    }

    if (envOrigin === '*') {
        if (credentials) return requestOrigin || null;
        return '*';
    }

    const allowed = envOrigin.includes(',')
        ? envOrigin.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [envOrigin];

    if (requestOrigin && allowed.includes(requestOrigin)) return requestOrigin;
    // Exact match with the single configured origin is allowed as a safe default
    if (allowed.length === 1 && !requestOrigin) return allowed[0];
    return null;
}

/**
 * Apply CORS headers to a Response that was produced outside of the Hono app
 * (e.g., bootstrap-failure 503). Headers are added to a cloned Response so
 * the original is never mutated. Non-browser requests (no `Origin`) are
 * passed through untouched.
 */
function withCorsHeaders(response: Response, request: Request): Response {
    if (!corsEnabled()) return response;

    const requestOrigin = request.headers.get('origin');
    const allowOrigin = resolveAllowOrigin(requestOrigin);
    if (!allowOrigin) return response;

    // Clone so we can mutate headers — Response headers may be locked.
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', allowOrigin);
    if (corsCredentials()) {
        headers.set('Access-Control-Allow-Credentials', 'true');
    }
    // Vary on Origin whenever we reflect it, per CORS spec recommendation.
    const existingVary = headers.get('Vary');
    if (!existingVary) {
        headers.set('Vary', 'Origin');
    } else if (!/(^|,\s*)Origin(\s*,|$)/i.test(existingVary)) {
        headers.set('Vary', `${existingVary}, Origin`);
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

/**
 * Build a CORS preflight (OPTIONS) response without requiring the kernel to
 * be booted. Browsers block the subsequent simple request if preflight fails
 * for any reason, so this path must never depend on bootstrap success.
 */
function buildPreflightResponse(request: Request): Response {
    const requestOrigin = request.headers.get('origin');
    const allowOrigin = resolveAllowOrigin(requestOrigin);

    // No Origin header or disallowed origin → 204 without CORS headers
    // (matches Hono's cors() behaviour for non-browser/disallowed requests).
    if (!allowOrigin) {
        return new Response(null, { status: 204 });
    }

    const requestedHeaders = request.headers.get('access-control-request-headers');
    const headers = new Headers({
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': CORS_ALLOW_METHODS,
        'Access-Control-Allow-Headers': requestedHeaders || CORS_ALLOW_HEADERS,
        'Access-Control-Max-Age': String(corsMaxAge()),
        Vary: 'Origin, Access-Control-Request-Headers',
    });
    if (corsCredentials()) {
        headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return new Response(null, { status: 204, headers });
}

// ---------------------------------------------------------------------------
// Body extraction — reads Vercel's pre-buffered request body.
// ---------------------------------------------------------------------------

interface VercelIncomingMessage {
    rawBody?: Buffer | string;
    body?: unknown;
    headers?: Record<string, string | string[] | undefined>;
}

interface VercelEnv {
    incoming?: VercelIncomingMessage;
}

function extractBody(
    incoming: VercelIncomingMessage,
    method: string,
    contentType: string | undefined,
): BodyInit | null {
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;

    if (incoming.rawBody != null) {
        return incoming.rawBody;
    }

    if (incoming.body != null) {
        if (typeof incoming.body === 'string') return incoming.body;
        if (contentType?.includes('application/json')) return JSON.stringify(incoming.body);
        return String(incoming.body);
    }

    return null;
}

function resolvePublicUrl(
    requestUrl: string,
    incoming: VercelIncomingMessage | undefined,
): string {
    if (!incoming) return requestUrl;
    const fwdProto = incoming.headers?.['x-forwarded-proto'];
    const rawProto = Array.isArray(fwdProto) ? fwdProto[0] : fwdProto;
    const proto = rawProto === 'https' || rawProto === 'http' ? rawProto : undefined;
    if (proto === 'https' && requestUrl.startsWith('http:')) {
        return requestUrl.replace(/^http:/, 'https:');
    }
    return requestUrl;
}

// ---------------------------------------------------------------------------
// Vercel Node.js serverless handler
// ---------------------------------------------------------------------------

export default getRequestListener(async (request, env) => {
    const method = request.method.toUpperCase();
    const incoming = (env as VercelEnv)?.incoming;
    const url = resolvePublicUrl(request.url, incoming);

    // ─── CORS Preflight short-circuit ──────────────────────────────────────
    // OPTIONS requests must never depend on kernel bootstrap. If we let them
    // fall through to ensureApp() a slow/failed cold start would cause the
    // browser to see a missing Access-Control-Allow-Origin on the preflight,
    // which then blocks every subsequent `/api/v1/*` request.
    if (method === 'OPTIONS') {
        console.log(`[Vercel] OPTIONS ${url} (preflight short-circuit)`);
        return buildPreflightResponse(request);
    }

    let app: Hono;
    try {
        app = await ensureApp();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Vercel] Handler error — bootstrap did not complete:', message);
        const errorResponse = new Response(
            JSON.stringify({
                success: false,
                error: {
                    message: 'Service Unavailable — kernel bootstrap failed.',
                    code: 503,
                },
            }),
            { status: 503, headers: { 'content-type': 'application/json' } },
        );
        // Ensure CORS headers are present even on bootstrap failure so that
        // browsers surface the real status code instead of a generic CORS
        // error. Without this the frontend sees "missing Access-Control-Allow-Origin".
        return withCorsHeaders(errorResponse, request);
    }

    console.log(`[Vercel] ${method} ${url}`);

    if (method !== 'GET' && method !== 'HEAD' && incoming) {
        const contentType = incoming.headers?.['content-type'];
        const contentTypeStr = Array.isArray(contentType) ? contentType[0] : contentType;
        const body = extractBody(incoming, method, contentTypeStr);
        if (body != null) {
            return await app.fetch(
                new Request(url, { method, headers: request.headers, body }),
            );
        }
    }

    return await app.fetch(
        new Request(url, { method, headers: request.headers }),
    );
});

export const config = {
    maxDuration: 60,
};
