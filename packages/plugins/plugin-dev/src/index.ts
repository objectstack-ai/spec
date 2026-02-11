// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * @objectstack/plugin-dev
 *
 * Development Mode Plugin for ObjectStack.
 *
 * Auto-enables all platform services (ObjectQL, InMemoryDriver, Auth,
 * Hono HTTP server, REST API) with in-memory implementations so that
 * developers can run the full stack locally without external dependencies.
 *
 * @example Zero-config
 * ```typescript
 * import { defineStack } from '@objectstack/spec';
 * import { DevPlugin } from '@objectstack/plugin-dev';
 *
 * export default defineStack({
 *   manifest: { id: 'my-app', name: 'My App', version: '0.1.0', type: 'app' },
 *   plugins: [new DevPlugin()],
 * });
 * ```
 *
 * @example With options
 * ```typescript
 * plugins: [
 *   new DevPlugin({
 *     port: 4000,
 *     seedAdminUser: true,
 *     services: { auth: false }, // disable auth
 *   }),
 * ]
 * ```
 */

export { DevPlugin } from './dev-plugin.js';
export type { DevPluginOptions } from './dev-plugin.js';
