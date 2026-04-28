// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Detect whether a loaded config is a host/aggregator configuration.
 *
 * A host config already contains a `plugins` array with instantiated Plugin
 * objects (i.e. objects that have an `init` method). Such configs must NOT
 * be wrapped again by AppPlugin in the CLI, as that would cause duplicate
 * plugin registration and startup failures.
 */
export function isHostConfig(config: any): boolean {
  return (
    Array.isArray(config.plugins) &&
    config.plugins.some((p: any) => typeof p?.init === 'function')
  );
}

/**
 * Returns true when a bare `defineStack()` config should be booted via
 * `createBootStack()` (full project / cloud / standalone stack) rather
 * than the CLI's lightweight in-memory plugin assembler.
 *
 * Triggers when:
 *   1. The config is NOT already a host config (no instantiated
 *      plugins) — a host config takes precedence.
 *   2. `OBJECTSTACK_MODE` env var is set to a recognised value, OR the
 *      config carries an explicit `bootMode` field.
 *
 * Recognised mode aliases match `resolveMode()` in
 * `@objectstack/service-cloud/boot-env`.
 */
const RECOGNISED_MODES = new Set([
  'project',
  'cloud',
  'standalone',
  'local',
  'single-project',
  'multi-project',
]);

export function shouldBootWithLibrary(config: any): boolean {
  if (isHostConfig(config)) return false;
  const mode = process.env.OBJECTSTACK_MODE?.trim().toLowerCase();
  if (mode && RECOGNISED_MODES.has(mode)) return true;
  if (config?.bootMode && ['project', 'cloud', 'standalone'].includes(config.bootMode)) {
    return true;
  }
  return false;
}
