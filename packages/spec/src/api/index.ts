/**
 * API Protocol Exports
 * 
 * API Contracts & Envelopes
 * - Request/Response schemas
 * - Error handling
 * - OData v4 compatibility
 * - Batch operations
 * - Metadata caching
 * - View storage
 */

export * from './contract.zod';
export * from './endpoint.zod';
export * from './discovery.zod';
export * from './realtime.zod';
export * from './websocket.zod';
export * from './router.zod';
export * from './odata.zod';
export * from './graphql.zod';
export * from './batch.zod';
export * from './http-cache.zod';
export * from './errors.zod';
export * from './view-storage.zod';
export * from './protocol.zod';
export * from './rest-server.zod';

// Legacy interface export (deprecated)
export type { IObjectStackProtocol } from './protocol';

