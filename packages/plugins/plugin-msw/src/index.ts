// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * @objectstack/plugin-msw
 * 
 * MSW (Mock Service Worker) Plugin for ObjectStack Runtime
 * 
 * This plugin enables seamless integration with Mock Service Worker for
 * testing and development environments. It automatically generates MSW
 * handlers for all ObjectStack API endpoints.
 * 
 * @example
 * ```typescript
 * import { MSWPlugin, ObjectStackServer } from '@objectstack/plugin-msw';
 * import { ObjectStackRuntime } from '@objectstack/runtime';
 * 
 * // Use with runtime
 * const runtime = new ObjectStackRuntime({
 *   plugins: [
 *     new MSWPlugin({
 *       enableBrowser: true,
 *       baseUrl: '/api/v1'
 *     })
 *   ]
 * });
 * 
 * // Or use standalone in browser
 * import { setupWorker, http } from 'msw/browser';
 * 
 * ObjectStackServer.init(protocol);
 * 
 * const handlers = [
 *   http.get('/api/user/:id', async ({ params }) => {
 *     const result = await ObjectStackServer.getData('user', params.id);
 *     return HttpResponse.json(result.data, { status: result.status });
 *   })
 * ];
 * 
 * const worker = setupWorker(...handlers);
 * await worker.start();
 * ```
 */

export { MSWPlugin, ObjectStackServer } from './msw-plugin';
export type { MSWPluginOptions } from './msw-plugin';

// Re-export MSW types for convenience
export type { HttpHandler, HttpResponse } from 'msw';
