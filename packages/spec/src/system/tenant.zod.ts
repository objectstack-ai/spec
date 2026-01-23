import { z } from 'zod';

/**
 * Tenant Schema (Multi-Tenant Architecture)
 * 
 * Defines the tenant/tenancy model for ObjectStack SaaS deployments.
 * Supports different levels of data isolation to meet varying security,
 * performance, and compliance requirements.
 * 
 * Isolation Levels:
 * - shared_schema: All tenants share the same database and schema (row-level isolation)
 * - isolated_schema: Tenants have separate schemas within a shared database
 * - isolated_db: Each tenant has a completely separate database
 */

/**
 * Tenant Isolation Level Enum
 * Defines how tenant data is separated in the system
 */
export const TenantIsolationLevel = z.enum([
  'shared_schema',    // Shared DB, shared schema, row-level isolation (most economical)
  'isolated_schema',  // Shared DB, separate schema per tenant (balanced)
  'isolated_db',      // Separate database per tenant (maximum isolation)
]);

export type TenantIsolationLevel = z.infer<typeof TenantIsolationLevel>;

/**
 * Tenant Quota Schema
 * Defines resource limits and usage quotas for a tenant
 */
export const TenantQuotaSchema = z.object({
  /**
   * Maximum number of users allowed for this tenant
   */
  maxUsers: z.number().int().positive().optional().describe('Maximum number of users'),
  
  /**
   * Maximum storage space in bytes
   */
  maxStorage: z.number().int().positive().optional().describe('Maximum storage in bytes'),
  
  /**
   * API rate limit (requests per minute)
   */
  apiRateLimit: z.number().int().positive().optional().describe('API requests per minute'),
});

export type TenantQuota = z.infer<typeof TenantQuotaSchema>;

/**
 * Tenant Schema
 * Represents a tenant in a multi-tenant SaaS deployment
 */
export const TenantSchema = z.object({
  /**
   * Unique tenant identifier
   */
  id: z.string().describe('Unique tenant identifier'),
  
  /**
   * Tenant name (display name)
   */
  name: z.string().describe('Tenant display name'),
  
  /**
   * Data isolation level for this tenant
   * Determines how tenant data is segregated from other tenants
   */
  isolationLevel: TenantIsolationLevel.describe('Data isolation strategy'),
  
  /**
   * Custom configurations and metadata specific to this tenant
   * Can store tenant-specific settings, branding, features, etc.
   */
  customizations: z.record(z.any()).optional().describe('Tenant-specific customizations'),
  
  /**
   * Resource quotas and limits for this tenant
   */
  quotas: TenantQuotaSchema.optional().describe('Resource quotas and limits'),
});

export type Tenant = z.infer<typeof TenantSchema>;
