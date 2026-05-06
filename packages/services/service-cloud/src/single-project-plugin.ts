// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Project-mode bootstrap plugin.
 *
 * Companion to `createCloudStack()` for the single-project local
 * deployment shape. It is registered last in the plugin chain by
 * `createProjectStack()` and performs two jobs:
 *
 *   1. **Idempotent identity seed** — writes the local
 *      `sys_organization` and `sys_project` rows to the control-plane
 *      DB on every boot via `ensureLocalIdentity()`.
 *
 *   2. **Studio runtime-config signal** — exposes
 *      `GET /api/v1/studio/runtime-config` returning
 *      `{ singleProject: true, defaultOrgId, defaultProjectId }`. The
 *      route registered here overrides the cloud preset's
 *      `{ singleProject: false }` response (the cloud preset is filtered
 *      out by `createProjectStack`).
 *
 * It does NOT mock `/cloud/projects`, `/cloud/organizations`, or
 * `/auth/*` — those routes are served by real plugins backed by the
 * seeded control plane.
 */

import type { IHttpServer } from '@objectstack/spec/contracts';

type AnyContext = any;

export const DEFAULT_LOCAL_ORG_ID = 'org_local';
export const DEFAULT_LOCAL_PROJECT_ID = 'proj_local';

export interface SingleProjectPluginOptions {
    orgId?: string;
    projectId?: string;
    /** Display name written to the seeded `sys_organization`. */
    orgName?: string;
    apiPrefix?: string;
    /** Project DB URL stored in `sys_project.database_url`. */
    projectDatabaseUrl?: string;
    /** Driver name for the project DB (e.g. `sqlite`, `turso`). */
    projectDatabaseDriver?: string;
}

export function createSingleProjectPlugin(options: SingleProjectPluginOptions = {}): any {
    const orgId = options.orgId ?? DEFAULT_LOCAL_ORG_ID;
    const projectId = options.projectId ?? DEFAULT_LOCAL_PROJECT_ID;
    const orgName = options.orgName ?? 'Local';
    const prefix = options.apiPrefix ?? '/api/v1';

    return {
        name: 'com.objectstack.studio.single-project',
        version: '2.0.0',

        init: async (ctx: AnyContext) => {
            // Publish the local org/project as the runtime "default" so
            // RestServer / HttpDispatcher can route bare URLs (no
            // `/projects/<id>` prefix, no hostname mapping) into the lone
            // project kernel instead of the control plane.
            try {
                ctx.registerService?.('default-project', { projectId, orgId });
            } catch {
                // registerService unavailable on this kernel shape — the
                // dispatcher and rest layer will simply skip the fallback.
            }
        },

        start: async (ctx: AnyContext) => {
            // Re-register in `start` for boot shapes where a service
            // registry is rebuilt between init and start.
            try {
                ctx.registerService?.('default-project', { projectId, orgId });
            } catch { /* best-effort */ }

            // ── 1. Idempotent identity seed ──────────────────────────────
            if (options.projectDatabaseUrl) {
                let objectql: any;
                try {
                    objectql = ctx.getService('objectql');
                } catch {
                    // ObjectQL not registered yet — control-plane preset must
                    // run first; if that's not the case we skip silently.
                }
                if (objectql) {
                    const { ensureLocalIdentity } = await import('./local-identity.js');
                    await ensureLocalIdentity({
                        objectql,
                        orgId,
                        projectId,
                        orgName,
                        projectDatabaseUrl: options.projectDatabaseUrl,
                        projectDatabaseDriver: options.projectDatabaseDriver ?? 'sqlite',
                    });
                }
            }

            // ── 2. Studio runtime-config (single-project signal) ─────────
            let server: IHttpServer | undefined;
            try {
                server = ctx.getService('http.server') as IHttpServer | undefined;
            } catch {
                return;
            }
            if (!server) return;

            server.get(`${prefix}/studio/runtime-config`, async (_req: any, res: any) => {
                res.json({
                    singleProject: true,
                    defaultOrgId: orgId,
                    defaultProjectId: projectId,
                });
            });
        },

        stop: async (_ctx: AnyContext) => {
            // http.server routes are torn down by the server plugin.
        },
    };
}
