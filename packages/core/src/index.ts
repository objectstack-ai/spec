/**
 * @objectstack/core
 * 
 * Core runtime for ObjectStack microkernel architecture.
 * Provides plugin system, dependency injection, and lifecycle management.
 */

export * from './kernel-base.js';
export * from './kernel.js';
export * from './lite-kernel.js';
export * from './types.js';
export * from './logger.js';
export * from './plugin-loader.js';
export * from './api-registry.js';
export * from './api-registry-plugin.js';
export * as QA from './qa/index.js';

// Export security utilities
export * from './security/index.js';

// Export Phase 2 components - Advanced lifecycle management
export * from './health-monitor.js';
export * from './hot-reload.js';
export * from './dependency-resolver.js';

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
