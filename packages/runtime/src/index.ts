// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

// Export Kernels
export { ObjectKernel } from '@objectstack/core';

// Export Runtime
export { Runtime } from './runtime.js';
export type { RuntimeConfig } from './runtime.js';

// Export Plugins
export { DriverPlugin } from './driver-plugin.js';
export { AppPlugin } from './app-plugin.js';
export { createDispatcherPlugin } from './dispatcher-plugin.js';
export type { DispatcherPluginConfig } from './dispatcher-plugin.js';

// Export HTTP Server Components
export { HttpServer } from './http-server.js';
/** @deprecated Use createDispatcherPlugin() instead. Will be removed in v3.0.0. */
export { HttpDispatcher } from './http-dispatcher.js';
export type { HttpProtocolContext, HttpDispatcherResult } from './http-dispatcher.js';
export { MiddlewareManager } from './middleware.js';

// Re-export from @objectstack/rest for backward compatibility
export {
    RestServer,
    RouteManager,
    RouteGroupBuilder,
    createRestApiPlugin,
    createApiRegistryPlugin,
} from '@objectstack/rest';
export type {
    RouteEntry,
    RestApiPluginConfig,
    ApiRegistryConfig,
} from '@objectstack/rest';

// Export Types
export * from '@objectstack/core';



