// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, vi } from 'vitest';
import { ArtifactApiClient } from '../src/artifact-api-client.js';

function mockJson(body: any, init?: { status?: number }): Response {
    return {
        ok: (init?.status ?? 200) < 400,
        status: init?.status ?? 200,
        json: async () => body,
    } as unknown as Response;
}

describe('ArtifactApiClient', () => {
    it('throws when controlPlaneUrl is missing', () => {
        expect(() => new ArtifactApiClient({ controlPlaneUrl: '' as any, fetch: globalThis.fetch }))
            .toThrow(/controlPlaneUrl/);
    });

    it('resolves a hostname and unwraps `{ success, data }`', async () => {
        const fetch = vi.fn().mockResolvedValue(mockJson({
            success: true,
            data: { projectId: 'proj_a', organizationId: 'org_x' },
        }));
        const client = new ArtifactApiClient({
            controlPlaneUrl: 'https://cp.example.com/',
            fetch: fetch as any,
        });
        const out = await client.resolveHostname('acme.example.com');
        expect(out).toEqual({ projectId: 'proj_a', organizationId: 'org_x', runtime: undefined });
        const calledUrl = fetch.mock.calls[0][0];
        expect(calledUrl).toBe('https://cp.example.com/api/v1/cloud/resolve-hostname?host=acme.example.com');
    });

    it('caches hostname resolutions until invalidated', async () => {
        const fetch = vi.fn().mockResolvedValue(mockJson({ projectId: 'proj_a' }));
        const client = new ArtifactApiClient({
            controlPlaneUrl: 'http://cp',
            fetch: fetch as any,
        });
        await client.resolveHostname('a.example');
        await client.resolveHostname('a.example');
        expect(fetch).toHaveBeenCalledTimes(1);
        client.invalidate('proj_a');
        await client.resolveHostname('a.example');
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('returns null on 404 hostname', async () => {
        const fetch = vi.fn().mockResolvedValue(mockJson(null, { status: 404 }));
        const client = new ArtifactApiClient({
            controlPlaneUrl: 'http://cp',
            fetch: fetch as any,
        });
        expect(await client.resolveHostname('missing')).toBeNull();
    });

    it('fetches an artifact and validates `metadata`', async () => {
        const artifact = {
            schemaVersion: '0.1',
            projectId: 'proj_a',
            commitId: 'c1',
            checksum: 'a'.repeat(64),
            metadata: { manifest: { name: 'demo' } },
            runtime: { databaseDriver: 'memory', databaseUrl: 'memory://demo' },
        };
        const fetch = vi.fn().mockResolvedValue(mockJson({ success: true, data: artifact }));
        const client = new ArtifactApiClient({
            controlPlaneUrl: 'http://cp',
            fetch: fetch as any,
        });
        const out = await client.fetchArtifact('proj_a');
        expect(out).toMatchObject({ projectId: 'proj_a', commitId: 'c1' });
        expect(out?.runtime?.databaseDriver).toBe('memory');
    });

    it('rejects an artifact response without metadata', async () => {
        const fetch = vi.fn().mockResolvedValue(mockJson({ projectId: 'proj_a' }));
        const client = new ArtifactApiClient({
            controlPlaneUrl: 'http://cp',
            fetch: fetch as any,
            logger: { warn: () => undefined },
        });
        expect(await client.fetchArtifact('proj_a')).toBeNull();
    });

    it('forwards bearer token when apiKey is set', async () => {
        const fetch = vi.fn().mockResolvedValue(mockJson({ projectId: 'proj_a' }));
        const client = new ArtifactApiClient({
            controlPlaneUrl: 'http://cp',
            apiKey: 'sek',
            fetch: fetch as any,
        });
        await client.resolveHostname('h');
        const headers = fetch.mock.calls[0][1].headers as Record<string, string>;
        expect(headers.authorization).toBe('Bearer sek');
    });

    it('throws on non-404 HTTP errors', async () => {
        const fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({}),
        });
        const client = new ArtifactApiClient({
            controlPlaneUrl: 'http://cp',
            fetch: fetch as any,
        });
        await expect(client.resolveHostname('h')).rejects.toThrow(/HTTP 500/);
    });
});
