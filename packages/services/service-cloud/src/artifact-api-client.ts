// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Artifact API client.
 *
 * HTTP client that talks to the ObjectStack control plane (e.g.
 * `apps/cloud`) to resolve hostnames to projects and to download a
 * project's compiled artifact.
 *
 * The control plane is expected to expose two endpoints:
 *
 *   GET {controlPlaneUrl}/api/v1/cloud/resolve-hostname?host={hostname}
 *     → { projectId: string, organizationId?: string, runtime?: ProjectRuntimeConfig }
 *
 *   GET {controlPlaneUrl}/api/v1/cloud/projects/:projectId/artifact
 *     → ProjectArtifactResponse  (ProjectArtifact + optional `runtime` block)
 *
 * Both endpoints accept an optional `Authorization: Bearer <apiKey>`.
 *
 * Responses are cached in-memory with a TTL so each kernel-manager
 * miss does not produce an extra HTTP round trip. Concurrent callers
 * for the same key share a single in-flight promise (singleflight).
 */

import type { ProjectArtifact } from '@objectstack/spec/cloud';

/**
 * Per-project runtime config injected by the control plane alongside
 * the artifact. Carries the physical database URL the runtime should
 * connect to (this is *not* part of the developer-authored compiled
 * artifact — the control plane mints it when serving the API).
 */
export interface ProjectRuntimeConfig {
    organizationId?: string;
    hostname?: string;
    /** Driver type — e.g. `sqlite`, `postgres`, `turso`, `memory`. */
    databaseDriver: string;
    /** Driver-specific connection URL. */
    databaseUrl: string;
    /** Optional auth token (e.g. for libSQL/Turso). */
    databaseAuthToken?: string;
}

/**
 * Hostname resolution response.
 */
export interface ResolvedHostname {
    projectId: string;
    organizationId?: string;
    /** Optional runtime config — when present, callers can skip the artifact fetch's runtime block. */
    runtime?: ProjectRuntimeConfig;
}

/**
 * Artifact response wrapping the spec's `ProjectArtifact` envelope plus
 * an optional `runtime` block carrying the project's database
 * connection details.
 */
export interface ProjectArtifactResponse extends ProjectArtifact {
    runtime?: ProjectRuntimeConfig;
}

export interface ArtifactApiClientConfig {
    /** Control-plane base URL (no trailing slash). */
    controlPlaneUrl: string;
    /** Optional bearer token. */
    apiKey?: string;
    /** Cache TTL in ms. Default: 5 min. */
    cacheTtlMs?: number;
    /** Timeout for control-plane HTTP calls in ms. Default: 10s. */
    requestTimeoutMs?: number;
    /** Optional fetch override (testing). */
    fetch?: typeof fetch;
    /** Optional logger. */
    logger?: { info?: (...a: any[]) => void; warn?: (...a: any[]) => void; error?: (...a: any[]) => void };
}

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

export class ArtifactApiClient {
    private readonly base: string;
    private readonly apiKey?: string;
    private readonly cacheTtlMs: number;
    private readonly requestTimeoutMs: number;
    private readonly fetchImpl: typeof fetch;
    private readonly logger: NonNullable<ArtifactApiClientConfig['logger']>;

    private readonly hostnameCache = new Map<string, CacheEntry<ResolvedHostname>>();
    private readonly artifactCache = new Map<string, CacheEntry<ProjectArtifactResponse>>();
    private readonly pendingHostname = new Map<string, Promise<ResolvedHostname | null>>();
    private readonly pendingArtifact = new Map<string, Promise<ProjectArtifactResponse | null>>();

    constructor(config: ArtifactApiClientConfig) {
        if (!config.controlPlaneUrl) {
            throw new Error('[ArtifactApiClient] controlPlaneUrl is required');
        }
        this.base = config.controlPlaneUrl.replace(/\/+$/, '');
        this.apiKey = config.apiKey;
        this.cacheTtlMs = config.cacheTtlMs ?? 5 * 60 * 1000;
        this.requestTimeoutMs = config.requestTimeoutMs ?? 10_000;
        this.fetchImpl = config.fetch ?? globalThis.fetch;
        this.logger = config.logger ?? console;
        if (typeof this.fetchImpl !== 'function') {
            throw new Error('[ArtifactApiClient] global fetch is not available — provide config.fetch');
        }
    }

    /**
     * Resolve a hostname to its project. Returns `null` on 404 or
     * malformed responses. Errors (network / 5xx) are thrown so
     * upstream callers can retry.
     */
    async resolveHostname(host: string): Promise<ResolvedHostname | null> {
        const cached = this.hostnameCache.get(host);
        if (cached && cached.expiresAt > Date.now()) return cached.value;

        const inflight = this.pendingHostname.get(host);
        if (inflight) return inflight;

        const promise = (async () => {
            try {
                const url = `${this.base}/api/v1/cloud/resolve-hostname?host=${encodeURIComponent(host)}`;
                const res = await this.request(url);
                if (res === null) return null;
                const body = res.success === false ? null : (res.data ?? res);
                if (!body || typeof body.projectId !== 'string' || !body.projectId) return null;
                const value: ResolvedHostname = {
                    projectId: body.projectId,
                    organizationId: body.organizationId,
                    runtime: body.runtime,
                };
                this.hostnameCache.set(host, { value, expiresAt: Date.now() + this.cacheTtlMs });
                return value;
            } finally {
                this.pendingHostname.delete(host);
            }
        })();
        this.pendingHostname.set(host, promise);
        return promise;
    }

    /**
     * Fetch the compiled artifact for a project.
     */
    async fetchArtifact(projectId: string): Promise<ProjectArtifactResponse | null> {
        const cached = this.artifactCache.get(projectId);
        if (cached && cached.expiresAt > Date.now()) return cached.value;

        const inflight = this.pendingArtifact.get(projectId);
        if (inflight) return inflight;

        const promise = (async () => {
            try {
                const url = `${this.base}/api/v1/cloud/projects/${encodeURIComponent(projectId)}/artifact`;
                const res = await this.request(url);
                if (res === null) return null;
                const body = res.success === false ? null : (res.data ?? res);
                if (!body || typeof body !== 'object') return null;
                if (!body.metadata) {
                    this.logger.warn?.('[ArtifactApiClient] artifact response missing `metadata`', { projectId });
                    return null;
                }
                const value = body as ProjectArtifactResponse;
                this.artifactCache.set(projectId, { value, expiresAt: Date.now() + this.cacheTtlMs });
                return value;
            } finally {
                this.pendingArtifact.delete(projectId);
            }
        })();
        this.pendingArtifact.set(projectId, promise);
        return promise;
    }

    /** Drop cached entries for a project (and any matching hostname). */
    invalidate(projectId: string): void {
        this.artifactCache.delete(projectId);
        for (const [host, entry] of this.hostnameCache) {
            if (entry.value.projectId === projectId) this.hostnameCache.delete(host);
        }
    }

    /** Drop everything. Used on shutdown / hot-reload. */
    clear(): void {
        this.hostnameCache.clear();
        this.artifactCache.clear();
    }

    private async request(url: string): Promise<any> {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), this.requestTimeoutMs) : null;
        try {
            const res = await this.fetchImpl(url, {
                method: 'GET',
                headers: this.buildHeaders(),
                signal: controller?.signal,
            });
            if (res.status === 404) return null;
            if (!res.ok) {
                throw new Error(`[ArtifactApiClient] ${url} → HTTP ${res.status}`);
            }
            return await res.json();
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    private buildHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'accept': 'application/json',
            'user-agent': 'objectos-runtime',
        };
        if (this.apiKey) headers['authorization'] = `Bearer ${this.apiKey}`;
        return headers;
    }
}
