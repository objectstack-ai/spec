// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * ObjectStack Server — Host Configuration
 *
 * Booted by `objectstack dev` / `objectstack serve` (see `package.json`).
 *
 * ## Boot modes
 *
 * Selected via the `OBJECTSTACK_MODE` environment variable:
 *
 *   - `project`   (default) — local single-project deployment. Reuses the
 *                            cloud (multi-project) plugin stack but backs
 *                            it with two SQLite files (`control.db` for
 *                            the control plane, `proj_local.db` for the
 *                            single project's business data).
 *                            Aliases: `local`, `single-project`.
 *   - `cloud`              — multi-project, control-plane connected.
 *                            Alias: `multi-project`.
 *   - `standalone`         — runtime-only (ObjectQL + REST + Driver).
 *
 * All boot orchestration now lives in @objectstack/service-cloud.
 * This file only supplies the apps/server-specific knobs (templates,
 * app bundle resolution).
 */

import { resolve as resolvePath, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBootStack } from '@objectstack/service-cloud';
import { createFsAppBundleResolver } from './server/fs-app-bundle-resolver.js';
import { templateRegistry } from './server/templates/registry.js';

const serverDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolvePath(serverDir, '.objectstack/data');
const localArtifactPath = process.env.OBJECTSTACK_ARTIFACT_PATH
    ?? resolvePath(serverDir, 'dist/objectstack.json');

const config = await createBootStack({
    project: {
        dataDir,
        artifactPath: localArtifactPath,
        appBundles: createFsAppBundleResolver(),
    },
    cloud: {
        templates: templateRegistry,
        appBundles: createFsAppBundleResolver(),
    },
    standalone: {
        artifactPath: localArtifactPath,
        databaseUrl: process.env.OBJECTSTACK_DATABASE_URL
            ?? `file:${resolvePath(dataDir, 'standalone.db')}`,
    },
});

export default config;
