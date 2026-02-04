import { z } from 'zod';

/**
 * # Service Registry Protocol
 * 
 * Defines the standard built-in services that constitute the ObjectStack Kernel.
 * This registry is used by the `ObjectKernel` and `HttpDispatcher` to:
 * 1. Verify service availability.
 * 2. Route requests to the correct service handler.
 * 3. Type-check service interactions.
 */

// ==========================================
// Service Identifiers
// ==========================================

export const CoreServiceName = z.enum([
  // Core Data & Metadata
  'metadata',       // Object/Field Definitions
  'data',           // CRUD & Query Engine
  'auth',           // Authentication & Identity
  
  // Infrastructure
  'file-storage',   // Storage Driver (Local/S3)
  'search',         // Search Engine (Elastic/Meili)
  'cache',          // Cache Driver (Redis/Memory)
  'queue',          // Job Queue (BullMQ/Redis)
  
  // Advanced Capabilities
  'automation',     // Flow & Script Engine
  'graphql',        // GraphQL API Engine
  'analytics',      // BI & Semantic Layer
  'hub',            // Multi-tenant & Marketplace Management
  'realtime',       // WebSocket & PubSub
  'job',            // Background Job Manager
  'notification',   // Email/Push/SMS
]);

export type CoreServiceName = z.infer<typeof CoreServiceName>;

// ==========================================
// Service Capabilities
// ==========================================

/**
 * Describes the availability and health of a service
 */
export const ServiceStatusSchema = z.object({
  name: CoreServiceName,
  enabled: z.boolean(),
  status: z.enum(['running', 'stopped', 'degraded', 'initializing']),
  version: z.string().optional(),
  provider: z.string().optional().describe('Implementation provider (e.g. "s3" for storage)'),
  features: z.array(z.string()).optional().describe('List of supported sub-features'),
});

/**
 * The Contract definition for what the Kernel MUST expose
 * map<ServiceName, ServiceInstance>
 */
export const KernelServiceMapSchema = z.record(
  CoreServiceName, 
  z.any().describe('Service Instance implementing the protocol interface')
);

// ==========================================
// Service Interfaces (Stub definitions)
// ==========================================
// Ideally, we would define strict Typescript interfaces here 
// for what methods each service must expose to the Registry.
// For Zod, we primarily validate configuration and status.

// e.g.
export const ServiceConfigSchema = z.object({
  id: z.string(),
  name: CoreServiceName,
  options: z.record(z.string(), z.any()).optional(),
});
