// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * ObjectStack Server — Host Configuration (runtime node)
 *
 * Booted by `objectstack dev` / `objectstack serve` (see `package.json`).
 *
 * ## Boot modes
 *
 * Selected via the `OBJECTSTACK_MODE` environment variable. Default:
 * `standalone`.
 *
 *   - `standalone` (default) — Runtime-only (ObjectQL + REST + Driver).
 *                              Single artifact, no control plane, no
 *                              auth. Best for embedding ObjectStack into
 *                              another framework or running headless.
 *   - `runtime`              — Cloud-connected runtime node. Resolves
 *                              projects by hostname against ObjectStack
 *                              Cloud (`apps/cloud` on
 *                              `http://localhost:4000` by default — start
 *                              that service first) and boots per-project
 *                              kernels from artifacts pulled over HTTP.
 *                              Override the cloud URL via
 *                              `OBJECTSTACK_CLOUD_URL`. Set it to
 *                              `local` for the legacy two-SQLite shape
 *                              (`control.db` + `proj_local.db`).
 *                              Aliases: `project`, `local`,
 *                              `single-project` (deprecated).
 *
 * The `cloud` (multi-project control plane) mode lives in `apps/cloud`.
 *
 * All boot orchestration lives in `@objectstack/service-cloud`. This
 * file only supplies the apps/server-specific knobs (filesystem app
 * bundle resolution).
 */

import { resolve as resolvePath, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBootStack } from '@objectstack/service-cloud';
import { createFsAppBundleResolver } from './server/fs-app-bundle-resolver.js';

const serverDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolvePath(serverDir, '.objectstack/data');
const localArtifactPath = process.env.OBJECTSTACK_ARTIFACT_PATH
    ?? resolvePath(serverDir, 'dist/objectstack.json');

const config = await createBootStack({
    runtime: {
        dataDir,
        artifactPath: localArtifactPath,
        appBundles: createFsAppBundleResolver(),
        // Default: connect to the local apps/cloud (port 4000). Override
        // with `OBJECTSTACK_CLOUD_URL=https://cloud.objectstack.ai` for
        // the hosted control plane, or `OBJECTSTACK_CLOUD_URL=local` to
        // fall back to a single-machine `control.db` shape.
        cloudUrl: process.env.OBJECTSTACK_CLOUD_URL,
        cloudApiKey: process.env.OBJECTSTACK_CLOUD_API_KEY,
    },
    standalone: {
        artifactPath: localArtifactPath,
        databaseUrl: process.env.OBJECTSTACK_DATABASE_URL
            ?? `file:${resolvePath(dataDir, 'standalone.db')}`,
    },
});

export default config;
