/**
 * @objectstack/core
 * 
 * Core runtime for ObjectStack microkernel architecture.
 * Provides plugin system, dependency injection, and lifecycle management.
 */

export * from './kernel-base.js';
export * from './kernel.js';
export * from './types.js';
export * from './logger.js';
export * from './plugin-loader.js';
export * from './enhanced-kernel.js';
export * as QA from './qa/index.js';

// Re-export contracts from @objectstack/spec for backward compatibility
export type { 
    Logger,
    IHttpServer,
    IHttpRequest,
    IHttpResponse,
    RouteHandler,
    Middleware,
    IDataEngine,
    DriverInterface
} from '@objectstack/spec/contracts';
