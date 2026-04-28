// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Boot environment resolution.
 *
 * Single source of truth for reading `process.env` related to deployment
 * mode selection. All other modules in this package consume the resolved
 * values via the helpers exported here — no other module reads
 * `process.env` directly.
 *
 * Each helper accepts an optional `env` override so callers (and tests)
 * can pass an explicit environment without mutating the process.
 */

import { z } from 'zod';

export const BootEnvSchema = z.object({
    OBJECTSTACK_MODE: z.string().optional(),
    OBJECTSTACK_MULTI_PROJECT: z.string().optional(),
    AUTH_SECRET: z.string().optional(),
    NEXT_PUBLIC_BASE_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    PORT: z.coerce.number().optional(),
    OBJECTSTACK_PROJECT_ID: z.string().optional(),
    OBJECTSTACK_ARTIFACT_PATH: z.string().optional(),
    OBJECTSTACK_DATABASE_URL: z.string().optional(),
    OBJECTSTACK_DATABASE_AUTH_TOKEN: z.string().optional(),
    OBJECTSTACK_DATABASE_DRIVER: z.string().optional(),
    TURSO_DATABASE_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
});

export type BootEnv = z.infer<typeof BootEnvSchema>;
export type BootMode = 'project' | 'cloud' | 'standalone';

const DEV_AUTH_SECRET_FALLBACK =
    'dev-secret-please-change-in-production-min-32-chars';

function envFlag(value: string | undefined): boolean {
    return ['1', 'true', 'yes', 'on'].includes((value ?? '').trim().toLowerCase());
}

function pickEnv(env?: Record<string, string | undefined>): Record<string, string | undefined> {
    return env ?? (process.env as Record<string, string | undefined>);
}

/**
 * Resolve the deployment mode from environment.
 *
 * Recognised values:
 *   - `project`, `local`, `single-project`     → `'project'` (default)
 *   - `cloud`, `multi-project`                 → `'cloud'`
 *   - `standalone`                             → `'standalone'`
 *
 * Falls back to `'project'` when unset; logs a warning and falls back to
 * `'project'` when the value is unrecognised. The legacy
 * `OBJECTSTACK_MULTI_PROJECT=true` flag is still honoured (with a
 * deprecation warning) when `OBJECTSTACK_MODE` is unset.
 */
export function resolveMode(env?: Record<string, string | undefined>): BootMode {
    const e = pickEnv(env);
    const raw = e.OBJECTSTACK_MODE?.trim().toLowerCase();
    if (raw === 'cloud' || raw === 'multi-project') return 'cloud';
    if (raw === 'standalone') return 'standalone';
    if (raw === 'project' || raw === 'local' || raw === 'single-project') return 'project';
    if (raw && raw.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`[objectstack] Unknown OBJECTSTACK_MODE=${raw}; falling back to "project".`);
    }
    if (envFlag(e.OBJECTSTACK_MULTI_PROJECT)) {
        // eslint-disable-next-line no-console
        console.warn(
            '[objectstack] OBJECTSTACK_MULTI_PROJECT is deprecated. Use `OBJECTSTACK_MODE=cloud` instead.',
        );
        return 'cloud';
    }
    return 'project';
}

/**
 * Auth secret used by `plugin-auth` (better-auth). Returns the dev
 * fallback when unset — explicit warning is the caller's responsibility.
 */
export function resolveAuthSecret(env?: Record<string, string | undefined>): string {
    const e = pickEnv(env);
    return e.AUTH_SECRET ?? DEV_AUTH_SECRET_FALLBACK;
}

/**
 * Public origin used by better-auth callbacks. Honors Vercel's stable
 * production URL first, then the per-deploy URL, finally falling back to
 * `http://localhost:<PORT|3000>`.
 */
export function resolveBaseUrl(env?: Record<string, string | undefined>): string {
    const e = pickEnv(env);
    return (
        e.NEXT_PUBLIC_BASE_URL
        ?? (e.VERCEL_PROJECT_PRODUCTION_URL ? `https://${e.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
        ?? (e.VERCEL_URL ? `https://${e.VERCEL_URL}` : undefined)
        ?? `http://localhost:${e.PORT ?? 3000}`
    );
}
