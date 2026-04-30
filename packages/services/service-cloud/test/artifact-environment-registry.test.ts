// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { ArtifactApiClient } from '../src/artifact-api-client.js';
import { ArtifactEnvironmentRegistry } from '../src/artifact-environment-registry.js';

function mockJson(body: any): Response {
    return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

describe('ArtifactEnvironmentRegistry', () => {
    it('resolves a hostname end-to-end through the artifact API', async () => {
        let fetchCalls: string[] = [];
        const fakeFetch = async (url: string) => {
            fetchCalls.push(url);
            if (url.includes('resolve-hostname')) {
                return mockJson({
                    success: true,
                    data: {
                        projectId: 'proj_demo',
                        organizationId: 'org_demo',
                        runtime: {
                            databaseDriver: 'memory',
                            databaseUrl: 'memory://demo-env',
                        },
                    },
                });
            }
            // artifact endpoint not actually needed when resolve-hostname returns runtime
            return mockJson({
                success: true,
                data: {
                    schemaVersion: '0.1',
                    projectId: 'proj_demo',
                    commitId: 'c1',
                    checksum: 'a'.repeat(64),
                    metadata: { manifest: { name: 'demo' } },
                },
            });
        };

        const client = new ArtifactApiClient({
            controlPlaneUrl: 'http://cp',
            fetch: fakeFetch as any,
        });
        const registry = new ArtifactEnvironmentRegistry({
            client,
            logger: { error: () => undefined, warn: () => undefined, info: () => undefined },
        });

        const result = await registry.resolveByHostname('acme.dev');
        expect(result).not.toBeNull();
        expect(result?.projectId).toBe('proj_demo');
        expect(result?.driver).toBeDefined();

        const peek = registry.peekById('proj_demo');
        expect(peek?.project.organization_id).toBe('org_demo');
        expect(peek?.project.database_driver).toBe('memory');
    });

    it('returns null when hostname cannot be resolved', async () => {
        const fakeFetch = async () => ({ ok: false, status: 404, json: async () => null }) as unknown as Response;
        const client = new ArtifactApiClient({ controlPlaneUrl: 'http://cp', fetch: fakeFetch as any });
        const registry = new ArtifactEnvironmentRegistry({ client });
        expect(await registry.resolveByHostname('nope')).toBeNull();
    });

    it('falls back to artifact metadata datasources when runtime block is absent', async () => {
        const fakeFetch = async (url: string) => {
            if (url.includes('resolve-hostname')) {
                return mockJson({ success: true, data: { projectId: 'proj_b' } });
            }
            return mockJson({
                success: true,
                data: {
                    schemaVersion: '0.1',
                    projectId: 'proj_b',
                    commitId: 'c2',
                    checksum: 'b'.repeat(64),
                    metadata: {
                        datasources: [{
                            name: 'default',
                            driver: 'memory',
                            config: { url: 'memory://fallback' },
                        }],
                        datasourceMapping: [{ default: true, datasource: 'default' }],
                    },
                },
            });
        };
        const client = new ArtifactApiClient({ controlPlaneUrl: 'http://cp', fetch: fakeFetch as any });
        const registry = new ArtifactEnvironmentRegistry({
            client,
            logger: { warn: () => undefined, info: () => undefined, error: () => undefined },
        });
        const result = await registry.resolveByHostname('b.example');
        expect(result?.projectId).toBe('proj_b');
        const peek = registry.peekById('proj_b');
        expect(peek?.project.database_driver).toBe('memory');
        expect(peek?.project.database_url).toBe('memory://fallback');
    });
});
