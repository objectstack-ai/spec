// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * createObjectOSStack
 *
 * ObjectOS pure-runtime stack — no control-plane database, no auth /
 * security / audit / tenant plugins. The host kernel only registers the
 * `env-registry` and `kernel-manager` services so the runtime's HTTP
 * dispatcher can resolve hostnames and route every request to the
 * matching project kernel built from a remote-fetched artifact.
 *
 * Invoked by `createProjectStack()` whenever `OBJECTSTACK_CONTROL_PLANE_URL`
 * (or `config.controlPlaneUrl`) is set. The same plugin shape is returned
 * as `createCloudStack()` so host configs can swap stacks transparently.
 */

import { Plugin, PluginContext } from '@objectstack/core';
import type { EnvironmentDriverRegistry } from './environment-registry.js';
import { KernelManager } from './kernel-manager.js';
import { ArtifactApiClient } from './artifact-api-client.js';
import { ArtifactEnvironmentRegistry } from './artifact-environment-registry.js';
import { ArtifactKernelFactory } from './artifact-kernel-factory.js';

export interface ObjectOSStackConfig {
    /** Control-plane base URL. Required. */
    controlPlaneUrl: string;
    /** Optional bearer token for the control-plane API. */
    controlPlaneApiKey?: string;
    /** KernelManager LRU size. Default: 32. */
    kernelCacheSize?: number;
    /** KernelManager idle TTL (ms). Default: 15 min. */
    kernelTtlMs?: number;
    /** EnvironmentDriverRegistry cache TTL (ms). Default: 5 min. */
    envCacheTtlMs?: number;
    /** Artifact / hostname response cache TTL (ms). Default: 5 min. */
    artifactCacheTtlMs?: number;
    /** API prefix (carried for parity with cloud-stack). Default: /api/v1. */
    apiPrefix?: string;
}

export interface ObjectOSStackResult {
    plugins: any[];
    api: { enableProjectScoping: true; projectResolution: 'auto' };
}

/**
 * Single host plugin that owns the artifact API client, the env registry,
 * and the kernel manager. Registered as services on the host kernel so
 * downstream plugins (the dispatcher, the REST API plugin) pick them up
 * automatically.
 */
class ObjectOSProjectPlugin implements Plugin {
    readonly name = 'com.objectstack.runtime.objectos-project';
    readonly version = '1.0.0';

    private readonly config: ObjectOSStackConfig;
    private kernelManager?: KernelManager;
    private client?: ArtifactApiClient;

    constructor(config: ObjectOSStackConfig) {
        this.config = config;
    }

    init = async (ctx: PluginContext): Promise<void> => {
        this.client = new ArtifactApiClient({
            controlPlaneUrl: this.config.controlPlaneUrl,
            apiKey: this.config.controlPlaneApiKey,
            cacheTtlMs: this.config.artifactCacheTtlMs,
            logger: ctx.logger,
        });

        const envRegistry: EnvironmentDriverRegistry = new ArtifactEnvironmentRegistry({
            client: this.client,
            cacheTtlMs: this.config.envCacheTtlMs,
            logger: ctx.logger,
        });

        const factory = new ArtifactKernelFactory({
            client: this.client,
            envRegistry,
            logger: ctx.logger,
        });

        const kernelManager = new KernelManager({
            factory,
            maxSize: this.config.kernelCacheSize,
            ttlMs: this.config.kernelTtlMs,
            logger: ctx.logger,
        });
        this.kernelManager = kernelManager;

        ctx.registerService('env-registry', envRegistry);
        ctx.registerService('kernel-manager', kernelManager);
        ctx.registerService('artifact-api-client', this.client);

        ctx.logger.info?.('ObjectOSProjectPlugin: registered env-registry + kernel-manager', {
            controlPlaneUrl: this.config.controlPlaneUrl,
        });
    };

    destroy = async (): Promise<void> => {
        try { await this.kernelManager?.evictAll(); } catch { /* best effort */ }
        try { this.client?.clear(); } catch { /* best effort */ }
    };
}

export async function createObjectOSStack(config: ObjectOSStackConfig): Promise<ObjectOSStackResult> {
    if (!config.controlPlaneUrl) {
        throw new Error('[createObjectOSStack] controlPlaneUrl is required');
    }
    const merged: ObjectOSStackConfig = {
        ...config,
        kernelCacheSize: Number(process.env.OBJECTSTACK_KERNEL_CACHE_SIZE ?? config.kernelCacheSize ?? 32),
        kernelTtlMs: Number(process.env.OBJECTSTACK_KERNEL_TTL_MS ?? config.kernelTtlMs ?? 15 * 60 * 1000),
        envCacheTtlMs: Number(process.env.OBJECTSTACK_ENV_CACHE_TTL_MS ?? config.envCacheTtlMs ?? 5 * 60 * 1000),
        artifactCacheTtlMs: Number(process.env.OBJECTSTACK_ARTIFACT_CACHE_TTL_MS ?? config.artifactCacheTtlMs ?? 5 * 60 * 1000),
    };

    return {
        plugins: [new ObjectOSProjectPlugin(merged)],
        api: {
            enableProjectScoping: true,
            projectResolution: 'auto',
        },
    };
}
