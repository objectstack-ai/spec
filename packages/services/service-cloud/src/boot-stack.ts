// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Top-level boot-mode orchestrator.
 *
 * Dispatches to the appropriate stack factory based on the resolved
 * `OS_MODE` (or an explicit `mode` override). The same config
 * object is accepted by every host (apps/objectos, CLI's `serve`,
 * embedding frameworks) — branches not relevant to the resolved mode
 * are ignored.
 */

import { z } from 'zod';
import { resolveMode, resolveAuthSecret, resolveBaseUrl } from './boot-env.js';
import type { BootMode } from './boot-env.js';
import { createRuntimeStack, RuntimeStackConfigSchema } from './runtime-stack.js';
import { createCloudStack } from './cloud-stack.js';
import type { CloudStackConfig } from './cloud-stack.js';
import type { ProjectTemplate } from './multi-project-plugin.js';
import type { AppBundleResolver } from './project-kernel-factory.js';

const CloudStackConfigSchema = z.object({
    authSecret: z.string().optional(),
    baseUrl: z.string().optional(),
    controlDriverUrl: z.string().optional(),
    controlDriverAuthToken: z.string().optional(),
    appBundles: z.custom<AppBundleResolver>().optional(),
    templates: z.record(z.string(), z.custom<ProjectTemplate>()).optional(),
    kernelCacheSize: z.number().optional(),
    kernelTtlMs: z.number().optional(),
    envCacheTtlMs: z.number().optional(),
    apiPrefix: z.string().optional(),
});

export const BootStackConfigSchema = z.object({
    /** Explicit mode override. When unset, resolves from env. */
    mode: z.enum(['runtime', 'cloud', 'project']).optional(),
    /** Runtime-mode options (used when mode resolves to `runtime`). */
    runtime: RuntimeStackConfigSchema.optional(),
    /**
     * @deprecated Use `runtime`. Kept for back-compat with hosts that
     * already pass `project: { … }` to `createBootStack()`.
     */
    project: RuntimeStackConfigSchema.optional(),
    /** Cloud-mode options (used when mode resolves to `cloud`). */
    cloud: CloudStackConfigSchema.optional(),
});

export type BootStackConfig = z.input<typeof BootStackConfigSchema>;

export interface BootStackResult {
    plugins: any[];
    api: { enableProjectScoping: boolean; projectResolution: 'auto' | 'none' };
}

/**
 * Build the host plugin list for the resolved boot mode.
 *
 * Selection precedence:
 *   1. `config.mode` (explicit override)
 *   2. `OS_MODE` environment variable
 *   3. Default: `'standalone'`
 *
 * Note: `'project'` is accepted as a deprecated alias for `'runtime'`
 * (renamed v4.x to better describe the mode's role: a runtime node
 * connected to ObjectStack Cloud).
 */
export async function createBootStack(config?: BootStackConfig): Promise<BootStackResult> {
    const cfg = BootStackConfigSchema.parse(config ?? {});
    const explicitMode: BootMode | undefined = cfg.mode
        ? (cfg.mode === 'project' ? 'runtime' : cfg.mode as BootMode)
        : undefined;
    const mode: BootMode = explicitMode ?? resolveMode();

    if (mode === 'cloud') {
        const cloudCfg = cfg.cloud ?? {};
        const merged: CloudStackConfig = {
            authSecret: cloudCfg.authSecret ?? resolveAuthSecret(),
            baseUrl: cloudCfg.baseUrl ?? resolveBaseUrl(),
            controlDriverUrl: cloudCfg.controlDriverUrl,
            controlDriverAuthToken: cloudCfg.controlDriverAuthToken,
            appBundles: cloudCfg.appBundles,
            templates: cloudCfg.templates,
            kernelCacheSize: cloudCfg.kernelCacheSize,
            kernelTtlMs: cloudCfg.kernelTtlMs,
            envCacheTtlMs: cloudCfg.envCacheTtlMs,
            apiPrefix: cloudCfg.apiPrefix,
        };
        return createCloudStack(merged);
    }

    // runtime (also reached via deprecated `mode: 'project'`)
    return createRuntimeStack(cfg.runtime ?? cfg.project);
}
