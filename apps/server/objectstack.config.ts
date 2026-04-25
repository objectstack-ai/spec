// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * ObjectStack Server — Host Configuration
 *
 * Booted by `objectstack dev` / `objectstack serve` (see `package.json`).
 *
 * ## Boot modes
 *
 * ### Local mode  (`OBJECTSTACK_CLOUD_URL` is unset)
 *
 * Single-project, offline-first.  No control-plane DB is required.
 * Required env vars:
 *   OBJECTSTACK_PROJECT_ID        — project identity (e.g. "proj_local")
 *   OBJECTSTACK_DATABASE_URL      — project business DB (file:./app.db, memory://mydb, libsql://…)
 *   OBJECTSTACK_DATABASE_DRIVER   — driver name: sqlite | memory | turso | postgres
 *   OBJECTSTACK_ARTIFACT_PATH     — path to compiled artifact (default: ./dist/objectstack.json)
 *   AUTH_SECRET                   — JWT signing secret (≥32 chars)
 *
 * ### Cloud mode  (`OBJECTSTACK_CLOUD_URL` is set)
 *
 * Multi-project, control-plane connected.
 * Required env vars:
 *   OBJECTSTACK_DATABASE_URL      — control-plane DB URL
 *   OBJECTSTACK_DATABASE_AUTH_TOKEN — optional, for libSQL/Turso URLs
 *   AUTH_SECRET / NEXT_PUBLIC_BASE_URL — same as local
 *
 * The control-plane driver URL accepts:
 *   - unset / `file:<path>`  → SQLite (better-sqlite3)  [default: .objectstack/data/control.db]
 *   - `libsql://…`           → libSQL / Turso
 *   - `http(s)://…`          → libSQL / sqld over HTTP
 */

import { resolve as resolvePath } from 'node:path';
import type * as Contracts from '@objectstack/spec/contracts';
import {
    type BasePluginsFactory,
    type AppBundleResolver,
} from '@objectstack/runtime';
import { createControlPlanePlugins } from './server/control-plane-preset.js';
import { templateRegistry } from './server/templates/registry.js';

type IDataDriver = Contracts.IDataDriver;

// ── Discriminator ─────────────────────────────────────────────────────────────
const isLocalMode = !process.env.OBJECTSTACK_CLOUD_URL;

const authSecret = process.env.AUTH_SECRET
    ?? 'dev-secret-please-change-in-production-min-32-chars';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined)
    ?? (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined)
    ?? `http://localhost:${process.env.PORT ?? 3000}`;

// ── LOCAL MODE ────────────────────────────────────────────────────────────────

const localProjectId = process.env.OBJECTSTACK_PROJECT_ID ?? 'proj_local';
const localDatabaseUrl = process.env.OBJECTSTACK_DATABASE_URL
    ?? `file:${resolvePath(process.cwd(), '.objectstack/data/local.db')}`;
const localDatabaseDriver = process.env.OBJECTSTACK_DATABASE_DRIVER ?? 'sqlite';
const localArtifactPath = process.env.OBJECTSTACK_ARTIFACT_PATH
    ?? resolvePath(process.cwd(), 'dist/objectstack.json');

// Lazy-loading proxy for local boot: registers ObjectQL + MetadataPlugin(local-file) + Auth
// on the kernel. No control-plane, no MultiProjectPlugin.
const localBootPluginProxy: any = {
    name: 'com.objectstack.local-boot',
    version: '0.0.0',
    async init(ctx: any) {
        const { ObjectQLPlugin } = await import('@objectstack/objectql');
        const { MetadataPlugin } = await import('@objectstack/metadata');
        const { AuthPlugin } = await import('@objectstack/plugin-auth');

        await ctx.kernel.use(new ObjectQLPlugin({ environmentId: localProjectId }));
        await ctx.kernel.use(new MetadataPlugin({
            watch: false,
            environmentId: localProjectId,
            artifactSource: { mode: 'local-file', path: localArtifactPath },
        }));
        await ctx.kernel.use(new AuthPlugin({ secret: authSecret, baseUrl }));

        ctx.logger?.info?.('[LocalBoot] plugins registered', {
            projectId: localProjectId,
            databaseUrl: localDatabaseUrl,
            databaseDriver: localDatabaseDriver,
            artifactPath: localArtifactPath,
        });
    },
};

// ── CLOUD MODE ────────────────────────────────────────────────────────────────

async function buildControlDriver(): Promise<{
    driver: IDataDriver;
    driverName: 'sqlite' | 'turso';
    databaseUrl: string;
}> {
    const raw = (process.env.OBJECTSTACK_DATABASE_URL || process.env.TURSO_DATABASE_URL)?.trim()
        || `file:${resolvePath(process.cwd(), '.objectstack/data/control.db')}`;

    const authToken = process.env.OBJECTSTACK_DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

    if (/^(libsql|https?):\/\//i.test(raw)) {
        const { TursoDriver } = await import('@objectstack/driver-turso');
        const driver = new TursoDriver({ url: raw, authToken });
        return { driver: driver as unknown as IDataDriver, driverName: 'turso', databaseUrl: raw };
    }

    const filename = raw.replace(/^file:(\/\/)?/, '');
    const { SqlDriver } = await import('@objectstack/driver-sql');
    const driver = new SqlDriver({ client: 'better-sqlite3', connection: { filename }, useNullAsDefault: true });
    return { driver: driver as unknown as IDataDriver, driverName: 'sqlite', databaseUrl: `file:${filename}` };
}

// Per-project kernels share a minimal base. Loaded lazily on project provisioning.
const basePlugins: BasePluginsFactory = async ({ projectId, project }) => {
    const { ObjectQLPlugin } = await import('@objectstack/objectql');
    const { MetadataPlugin } = await import('@objectstack/metadata');
    const { createTenantPlugin } = await import('@objectstack/service-tenant');
    const { AuthPlugin } = await import('@objectstack/plugin-auth');
    const { SecurityPlugin } = await import('@objectstack/plugin-security');
    const { AuditPlugin } = await import('@objectstack/plugin-audit');
    const orgId = project.organization_id;
    return [
        new ObjectQLPlugin({ environmentId: projectId }),
        new MetadataPlugin({ watch: false, environmentId: projectId, organizationId: orgId }),
        createTenantPlugin({ registerSystemObjects: true, registerLegacyTenantDatabase: false }),
        new AuthPlugin({ secret: authSecret, baseUrl }),
        new SecurityPlugin(),
        new AuditPlugin(),
    ];
};

const appBundles: AppBundleResolver = {
    async resolve() { return []; },
};

// Single shared promise — both control-plane plugins and MultiProjectPlugin
// use the same DB connection.
const controlDriverPromise = buildControlDriver();

const multiProjectPluginProxy: any = {
    name: 'com.objectstack.multi-project',
    version: '0.0.0',
    _impl: null as any,
    async init(ctx: any) {
        const { driver: controlDriver } = await controlDriverPromise;
        const { MultiProjectPlugin: MPlugin } = await import('@objectstack/runtime');
        this._impl = new MPlugin({
            controlDriver,
            basePlugins,
            appBundles,
            templates: templateRegistry,
            maxSize: Number(process.env.OBJECTSTACK_KERNEL_CACHE_SIZE ?? 32),
            ttlMs: Number(process.env.OBJECTSTACK_KERNEL_TTL_MS ?? 15 * 60 * 1000),
            cacheTTLMs: Number(process.env.OBJECTSTACK_ENV_CACHE_TTL_MS ?? 5 * 60 * 1000),
        });
        if (this._impl.init) await this._impl.init(ctx);
    },
    async start(ctx: any) {
        if (this._impl?.start) await this._impl.start(ctx);
    },
    async stop(ctx: any) {
        if (this._impl?.stop) await this._impl.stop(ctx);
    },
};

// ── Export ────────────────────────────────────────────────────────────────────

export default isLocalMode
    ? {
        plugins: [localBootPluginProxy],
        api: {
            enableProjectScoping: false,
            projectResolution: 'none' as const,
        },
    }
    : {
        plugins: [
            ...createControlPlanePlugins({
                controlDriverPromise,
                authSecret,
                baseUrl,
            }),
            multiProjectPluginProxy,
        ],
        api: {
            enableProjectScoping: true,
            projectResolution: 'auto' as const,
        },
    };
