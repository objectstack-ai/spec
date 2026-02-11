// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * @objectstack/plugin-dev
 *
 * Development Mode Plugin for ObjectStack.
 *
 * Auto-enables all platform services (ObjectQL, InMemoryDriver, Auth,
 * Hono HTTP server, REST API, Dispatcher, Metadata) with in-memory
 * implementations so that developers can run the full stack locally
 * without external dependencies.
 *
 * Provides a complete API development environment where you can:
 * - CRUD business objects
 * - Read/write metadata (views, apps, dashboards, etc.)
 * - Use GraphQL, analytics, and automation endpoints
 * - Authenticate with dev credentials
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
 * @example Full-stack dev with project metadata
 * ```typescript
 * import config from './objectstack.config';
 * import { DevPlugin } from '@objectstack/plugin-dev';
 *
 * // Loads all project metadata (objects, views, etc.) into the dev server
 * plugins: [new DevPlugin({ stack: config })]
 * ```
 */

export { DevPlugin } from './dev-plugin.js';
export type { DevPluginOptions } from './dev-plugin.js';
