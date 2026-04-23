// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * ObjectStack Server — Bootstrap
 *
 * The control plane is always on: one kernel owns the `sys_*` namespace
 * (projects, credentials, members, auth) and per-project kernels are minted
 * on demand by `DefaultProjectKernelFactory` / `KernelManager`.
 *
 * The only knob is which database backs the control plane. It is selected
 * by a single URL-style env var, following the Turso/Prisma convention:
 *
 *   OBJECTSTACK_DATABASE_URL
 *     - unset                 → `file:./.objectstack/data/control.db` (SQLite)
 *     - `file:<path>` / path  → SQLite at that path (better-sqlite3)
 *     - `libsql://…`          → libSQL/Turso
 *     - `http(s)://…`         → libSQL/sqld over HTTP
 *
 *   OBJECTSTACK_DATABASE_AUTH_TOKEN
 *     - optional, forwarded to TursoDriver when the URL is libSQL/HTTP.
 */

import { resolve as resolvePath } from 'node:path';
import {
    ObjectKernel,
    KernelManager,
    DefaultProjectKernelFactory,
    DefaultEnvironmentDriverRegistry,
    type BasePluginsFactory,
    type AppBundleResolver,
    type EnvironmentDriverRegistry,
} from '@objectstack/runtime';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { MetadataPlugin } from '@objectstack/metadata';
import { TursoDriver } from '@objectstack/driver-turso';
import { SqlDriver } from '@objectstack/driver-sql';
import type { Contracts } from '@objectstack/spec';
import { createControlPlanePlugins } from './control-plane-preset.js';
import { createTemplateSeeder } from './template-seeder.js';

type IDataDriver = Contracts.IDataDriver;

/**
 * Inferred from the resolved control-plane URL: libSQL/HTTP → `cloud`,
 * SQLite file → `self-hosted`. Preserved on `BootstrapResult` for callers
 * (logs, diagnostics) that previously keyed off shape.
 */
export type RuntimeMode = 'self-hosted' | 'cloud';

export interface BootstrapResult {
    kernel: ObjectKernel;
    kernelManager: KernelManager;
    envRegistry: EnvironmentDriverRegistry;
    mode: RuntimeMode;
    /** Resolved control-plane URL, for logging. */
    databaseUrl: string;
    /** Short driver id (`sqlite` | `turso`). */
    driverName: 'sqlite' | 'turso';
}

interface ResolvedControlDriver {
    driver: IDataDriver;
    driverName: 'sqlite' | 'turso';
    mode: RuntimeMode;
    databaseUrl: string;
}

/**
 * Resolve the control-plane driver from `OBJECTSTACK_DATABASE_URL`.
 *
 * `libsql:` and `http(s):` URLs select `TursoDriver`. Anything else is
 * treated as a SQLite filesystem path, with a `file:` / `file://` prefix
 * stripped for convenience so all three of `file:./x.db`, `file:///x.db`,
 * and `./x.db` point at the same file.
 */
function buildControlDriver(): ResolvedControlDriver {
    const raw = process.env.OBJECTSTACK_DATABASE_URL?.trim()
        || `file:${resolvePath(process.cwd(), '.objectstack/data/control.db')}`;

    if (/^(libsql|https?):\/\//i.test(raw)) {
        const driver = new TursoDriver({
            url: raw,
            authToken: process.env.OBJECTSTACK_DATABASE_AUTH_TOKEN,
        });
        return {
            driver: driver as unknown as IDataDriver,
            driverName: 'turso',
            mode: 'cloud',
            databaseUrl: raw,
        };
    }

    const filename = raw.replace(/^file:(\/\/)?/, '');
    const driver = new SqlDriver({
        client: 'better-sqlite3',
        connection: { filename },
        useNullAsDefault: true,
    });
    return {
        driver: driver as unknown as IDataDriver,
        driverName: 'sqlite',
        mode: 'self-hosted',
        databaseUrl: `file:${filename}`,
    };
}

async function bootstrapControlKernel(
    controlDriver: IDataDriver,
    driverName: string,
): Promise<ObjectKernel> {
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

    const plugins = createControlPlanePlugins({
        controlDriver,
        driverName,
        authSecret,
        baseUrl,
    });

    const kernel = new ObjectKernel();
    for (const plugin of plugins) {
        await kernel.use(plugin as any);
    }
    await kernel.bootstrap();
    return kernel;
}

/**
 * Boot the control-plane kernel and wire up the per-project KernelManager.
 *
 * 1. Resolve the control-plane driver from env.
 * 2. Boot the control-plane kernel (owns `sys_*`, auth, discovery).
 * 3. Wire envRegistry + DefaultProjectKernelFactory + KernelManager for
 *    per-project routing inside HttpDispatcher.
 * 4. Register the template-seeder service on the control kernel so
 *    `/cloud/templates` and project provisioning can resolve it.
 */
export async function bootstrap(): Promise<BootstrapResult> {
    const { driver: controlDriver, driverName, mode, databaseUrl } = buildControlDriver();
    console.log(`[Bootstrap] Control DB: ${databaseUrl} (${driverName})`);

    const envRegistry = new DefaultEnvironmentDriverRegistry({
        controlPlaneDriver: controlDriver,
        cacheTTLMs: Number(
            process.env.OBJECTSTACK_ENV_CACHE_TTL_MS ?? 5 * 60 * 1000,
        ),
    });

    // Example bundles are seeded once at provisioning time via
    // `createTemplateSeeder` — not pre-installed into every project kernel.
    const appBundles: AppBundleResolver = {
        async resolve() { return []; },
    };

    // Per-project kernels get the minimal base; driver is injected by the
    // factory. Both ObjectQL and Metadata are scoped to projectId so
    // DatabaseLoader's `env_id` filter and `protocol.saveMetaItem` writes
    // stay aligned across the physically-isolated project databases.
    const basePlugins: BasePluginsFactory = ({ projectId }) => [
        new ObjectQLPlugin({ environmentId: projectId }),
        new MetadataPlugin({ watch: false, environmentId: projectId }),
    ];

    const factory = new DefaultProjectKernelFactory({
        controlPlaneDriver: controlDriver,
        basePlugins,
        appBundles,
        envRegistry,
    });

    const kernelManager = new KernelManager({
        factory,
        maxSize: Number(process.env.OBJECTSTACK_KERNEL_CACHE_SIZE ?? 32),
        ttlMs: Number(process.env.OBJECTSTACK_KERNEL_TTL_MS ?? 15 * 60 * 1000),
    });

    const controlKernel = await bootstrapControlKernel(controlDriver, driverName);

    const seeder = createTemplateSeeder(kernelManager);
    controlKernel.registerService('template-seeder', seeder);

    return {
        kernel: controlKernel,
        kernelManager,
        envRegistry,
        mode,
        databaseUrl,
        driverName,
    };
}
