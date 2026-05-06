// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Shared artifact loader used by every code path that boots a kernel
 * from an `objectstack build` artifact:
 *
 *   - `FsAppBundleResolver`         — cloud / multi-project file binding
 *   - `runtime-stack.ts:basePlugins` — single-project local boot
 *   - `StandaloneStack`              — `objectstack serve --standalone`
 *   - `http-dispatcher.ts`           — in-flight artifact rebind
 *
 * Reads the JSON artifact and, if the bundle declares a sibling
 * `runtimeModule` (the ESM produced by `packages/cli/src/utils/build-runtime.ts`),
 * dynamic-imports it and merges its `functions` map onto the bundle so
 * declarative Hooks resolve their handlers at boot.
 *
 * Mutates the returned bundle in place. Returns `null` on read/parse
 * failure (callers may treat as "no bundle for this project yet").
 * Runtime-module load failures are logged but non-fatal — the bundle
 * is still returned, just without runtime functions.
 */

import { readFile } from 'node:fs/promises';
import { resolve as resolvePath, isAbsolute, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

export interface LoadArtifactBundleOptions {
    /** Optional log tag for warnings (defaults to `[loadArtifactBundle]`). */
    tag?: string;
    /** When true, an unwrapped `{ schemaVersion, metadata }` envelope is unwrapped. */
    unwrapEnvelope?: boolean;
}

export async function loadArtifactBundle(
    absArtifactPath: string,
    opts: LoadArtifactBundleOptions = {},
): Promise<any | null> {
    const tag = opts.tag ?? '[loadArtifactBundle]';
    let bundle: any;
    try {
        const raw = await readFile(absArtifactPath, 'utf-8');
        const parsed = JSON.parse(raw);
        bundle = opts.unwrapEnvelope && parsed?.schemaVersion != null && parsed?.metadata !== undefined
            ? parsed.metadata
            : parsed;
    } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn(`${tag} artifact read FAILED: path='${absArtifactPath}' error=${err?.message ?? err}`);
        return null;
    }

    await mergeRuntimeModule(bundle, absArtifactPath, tag);
    return bundle;
}

export async function mergeRuntimeModule(bundle: any, artifactAbsPath: string, tag = '[loadArtifactBundle]'): Promise<void> {
    const ref = bundle?.runtimeModule;
    if (typeof ref !== 'string' || ref.length === 0) return;
    const moduleAbsPath = isAbsolute(ref) ? ref : resolvePath(dirname(artifactAbsPath), ref);
    try {
        const mod: any = await import(pathToFileURL(moduleAbsPath).href);
        const fns = (mod && (mod.functions ?? mod.default?.functions)) ?? null;
        if (!fns || typeof fns !== 'object') {
            // eslint-disable-next-line no-console
            console.warn(`${tag} runtime module '${moduleAbsPath}' exported no \`functions\` map`);
            return;
        }
        const existing = (bundle.functions && typeof bundle.functions === 'object' && !Array.isArray(bundle.functions))
            ? bundle.functions as Record<string, unknown>
            : {};
        bundle.functions = { ...existing, ...fns };
    } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn(`${tag} runtime module load FAILED: path='${moduleAbsPath}' error=${err?.message ?? err}`);
    }
}
