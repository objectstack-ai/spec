// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * ObjectStack Cloud — Host Configuration
 *
 * Booted by `objectstack dev` / `objectstack serve` (see `package.json`)
 * and by the Vercel serverless entrypoint (`server/index.ts`).
 *
 * ## Boot mode
 *
 * This config is **cloud-only** — multi-project, control-plane connected,
 * with the Studio template registry and filesystem-backed app bundle
 * resolver wired in. Local single-project / standalone modes live in
 * `apps/objectos`. All boot orchestration lives in
 * `@objectstack/service-cloud`; this file only supplies the
 * apps/cloud-specific knobs (templates, app bundle resolution).
 */

import { createBootStack } from '@objectstack/service-cloud';
import { createFsAppBundleResolver } from './server/fs-app-bundle-resolver.js';
import { templateRegistry } from './server/templates/registry.js';

const config = await createBootStack({
    mode: 'cloud',
    cloud: {
        templates: templateRegistry,
        appBundles: createFsAppBundleResolver(),
    },
});

export default config;
