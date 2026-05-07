// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Unit tests for `createFsAppBundleResolver`.
 *
 * Exercises the three binding modes and their interaction:
 *   - Mode 2 (`OS_PROJECT_ARTIFACTS` env override) — wins when set
 *   - Mode 3 (`metadata.artifact_path[s]` on the project row) — fallback
 *   - Missing/unreadable files — logged, dropped from result
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFsAppBundleResolver } from '../src/fs-bundle-resolver.js';

const ENV_MAP_VAR = 'OS_PROJECT_ARTIFACTS';
const ARTIFACT_ROOT_VAR = 'OS_PROJECT_ARTIFACT_ROOT';

function writeBundle(dir: string, name: string, manifestId: string): string {
    const path = join(dir, name);
    writeFileSync(
        path,
        JSON.stringify({
            manifest: { id: manifestId, namespace: manifestId.split('.').pop() },
            objects: [],
        }),
    );
    return path;
}

describe('createFsAppBundleResolver', () => {
    let workdir: string;
    let originalEnvMap: string | undefined;
    let originalRoot: string | undefined;
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        workdir = mkdtempSync(join(tmpdir(), 'fs-bundle-resolver-'));
        originalEnvMap = process.env[ENV_MAP_VAR];
        originalRoot = process.env[ARTIFACT_ROOT_VAR];
        delete process.env[ENV_MAP_VAR];
        delete process.env[ARTIFACT_ROOT_VAR];
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        if (originalEnvMap === undefined) delete process.env[ENV_MAP_VAR];
        else process.env[ENV_MAP_VAR] = originalEnvMap;
        if (originalRoot === undefined) delete process.env[ARTIFACT_ROOT_VAR];
        else process.env[ARTIFACT_ROOT_VAR] = originalRoot;
        warnSpy.mockRestore();
        try { rmSync(workdir, { recursive: true, force: true }); } catch { /* best-effort */ }
    });

    it('returns [] when no binding sources are present', async () => {
        const resolver = createFsAppBundleResolver();
        const out = await resolver.resolve({ id: 'proj_x' });
        expect(out).toEqual([]);
    });

    it('loads bundles from `metadata.artifact_path` (mode 3)', async () => {
        const path = writeBundle(workdir, 'crm.json', 'com.example.crm');
        const resolver = createFsAppBundleResolver();
        const out = await resolver.resolve({
            id: 'proj_crm',
            metadata: { artifact_path: path },
        });
        expect(out).toHaveLength(1);
        expect((out[0] as any).manifest.id).toBe('com.example.crm');
    });

    it('loads bundles from `metadata.artifact_paths` array', async () => {
        const a = writeBundle(workdir, 'a.json', 'com.example.a');
        const b = writeBundle(workdir, 'b.json', 'com.example.b');
        const resolver = createFsAppBundleResolver();
        const out = await resolver.resolve({
            id: 'proj_multi',
            metadata: { artifact_paths: [a, b] },
        });
        expect(out).toHaveLength(2);
        expect((out[0] as any).manifest.id).toBe('com.example.a');
        expect((out[1] as any).manifest.id).toBe('com.example.b');
    });

    it('parses metadata when stored as a JSON string', async () => {
        const path = writeBundle(workdir, 'crm.json', 'com.example.crm');
        const resolver = createFsAppBundleResolver();
        const out = await resolver.resolve({
            id: 'proj_crm',
            metadata: JSON.stringify({ artifact_path: path }),
        });
        expect(out).toHaveLength(1);
    });

    it('OS_PROJECT_ARTIFACTS env override takes precedence over metadata (mode 2)', async () => {
        const fromEnv = writeBundle(workdir, 'env.json', 'com.example.env');
        const fromDb = writeBundle(workdir, 'db.json', 'com.example.db');
        process.env[ENV_MAP_VAR] = `proj_a:${fromEnv}`;
        const resolver = createFsAppBundleResolver();
        const out = await resolver.resolve({
            id: 'proj_a',
            metadata: { artifact_path: fromDb },
        });
        expect(out).toHaveLength(1);
        expect((out[0] as any).manifest.id).toBe('com.example.env');
    });

    it('env override only applies to matching project ids', async () => {
        const fromEnv = writeBundle(workdir, 'env.json', 'com.example.env');
        const fromDb = writeBundle(workdir, 'db.json', 'com.example.db');
        process.env[ENV_MAP_VAR] = `proj_other:${fromEnv}`;
        const resolver = createFsAppBundleResolver();
        const out = await resolver.resolve({
            id: 'proj_a',
            metadata: { artifact_path: fromDb },
        });
        expect(out).toHaveLength(1);
        expect((out[0] as any).manifest.id).toBe('com.example.db');
    });

    it('parses comma-separated multi-project env mapping', async () => {
        const a = writeBundle(workdir, 'a.json', 'com.example.a');
        const b = writeBundle(workdir, 'b.json', 'com.example.b');
        process.env[ENV_MAP_VAR] = `proj_a:${a},proj_b:${b}`;
        const resolver = createFsAppBundleResolver();
        const outA = await resolver.resolve({ id: 'proj_a' });
        const outB = await resolver.resolve({ id: 'proj_b' });
        expect((outA[0] as any).manifest.id).toBe('com.example.a');
        expect((outB[0] as any).manifest.id).toBe('com.example.b');
    });

    it('drops missing files and continues with the rest', async () => {
        const ok = writeBundle(workdir, 'ok.json', 'com.example.ok');
        const missing = join(workdir, 'does-not-exist.json');
        const resolver = createFsAppBundleResolver();
        const out = await resolver.resolve({
            id: 'proj_x',
            metadata: { artifact_paths: [missing, ok] },
        });
        expect(out).toHaveLength(1);
        expect((out[0] as any).manifest.id).toBe('com.example.ok');
    });

    it('caches repeated loads of the same path', async () => {
        const path = writeBundle(workdir, 'crm.json', 'com.example.crm');
        const resolver = createFsAppBundleResolver();
        const a = await resolver.resolve({ id: 'proj_a', metadata: { artifact_path: path } });
        const b = await resolver.resolve({ id: 'proj_b', metadata: { artifact_path: path } });
        expect(a[0]).toBe(b[0]);
    });

    it('resolves relative paths against OS_PROJECT_ARTIFACT_ROOT', async () => {
        writeBundle(workdir, 'rel.json', 'com.example.rel');
        process.env[ARTIFACT_ROOT_VAR] = workdir;
        const resolver = createFsAppBundleResolver();
        const out = await resolver.resolve({
            id: 'proj_x',
            metadata: { artifact_path: 'rel.json' },
        });
        expect(out).toHaveLength(1);
        expect((out[0] as any).manifest.id).toBe('com.example.rel');
    });
});
