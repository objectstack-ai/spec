import { z } from 'zod';
import { BaseResponseSchema } from './contract.zod';
import {
  HubSpaceSchema,
  TenantSchema,
  BillOfMaterialsSchema,
  ComposerRequestSchema,
  ComposerResponseSchema,
  PluginRegistryEntrySchema,
  PluginSearchFiltersSchema,
  MarketplacePluginSchema,
  LicenseSchema,
} from '../hub/index';

/**
 * # Hub Management API Protocol
 * 
 * Defines RESTful API contracts for the ObjectStack Hub - the unified cloud
 * management center for all tenants, plugins, spaces, and marketplace operations.
 * 
 * This protocol enables:
 * - Multi-tenant SaaS management
 * - Plugin marketplace operations
 * - Space/workspace lifecycle
 * - License management and validation
 * - Composer/builder services
 * 
 * @see https://objectstack.ai/docs/api/hub
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * Pagination Request Parameters
 */
export const PaginationRequestSchema = z.object({
  /**
   * Page number (1-indexed)
   */
  page: z.number().int().min(1).default(1).optional().describe('Page number (1-indexed)'),
  
  /**
   * Number of items per page
   */
  perPage: z.number().int().min(1).max(100).default(20).optional().describe('Number of items per page'),
  
  /**
   * Sort field
   */
  sortBy: z.string().optional().describe('Field name to sort results by'),
  
  /**
   * Sort direction
   */
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional().describe('Sort direction'),
}).describe('Pagination request parameters');

/**
 * Pagination Response Metadata
 */
export const PaginationResponseSchema = z.object({
  /**
   * Current page number
   */
  page: z.number().int().min(1).describe('Current page number'),
  
  /**
   * Items per page
   */
  perPage: z.number().int().min(1).describe('Items per page'),
  
  /**
   * Total number of items
   */
  total: z.number().int().min(0).describe('Total number of items'),
  
  /**
   * Total number of pages
   */
  totalPages: z.number().int().min(0).describe('Total number of pages'),
  
  /**
   * Whether there is a next page
   */
  hasNext: z.boolean().describe('Whether there is a next page'),
  
  /**
   * Whether there is a previous page
   */
  hasPrev: z.boolean().describe('Whether there is a previous page'),
}).describe('Pagination response metadata');

// ============================================================================
// Space Management API
// ============================================================================

/**
 * Create Space Request
 * 
 * @example
 * ```json
 * {
 *   "name": "Sales Team Workspace",
 *   "slug": "sales-team",
 *   "ownerId": "user_abc123",
 *   "runtime": {
 *     "isolation": "shared_schema",
 *     "quotas": {
 *       "maxUsers": 50,
 *       "maxStorage": 107374182400,
 *       "apiRateLimit": 10000
 *     }
 *   }
 * }
 * ```
 */
export const CreateSpaceRequestSchema = z.object({
  name: z.string().min(1).max(255).describe('Space display name'),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(100).describe('URL-friendly identifier'),
  ownerId: z.string().describe('Owner user/org ID'),
  runtime: HubSpaceSchema.shape.runtime.optional().describe('Runtime configuration for the space'),
  bom: BillOfMaterialsSchema.optional().describe('Initial Bill of Materials'),
  subscription: HubSpaceSchema.shape.subscription.optional().describe('Subscription plan configuration'),
  deployment: HubSpaceSchema.shape.deployment.optional().describe('Deployment settings for the space'),
}).describe('Request payload for creating a new space');

/**
 * Update Space Request
 * 
 * @example
 * ```json
 * {
 *   "name": "Updated Sales Team",
 *   "bom": {
 *     "tenantId": "tenant_123",
 *     "dependencies": [
 *       { "id": "com.objectstack.crm", "version": "2.0.0" }
 *     ],
 *     "resolutionStrategy": "override"
 *   }
 * }
 * ```
 */
export const UpdateSpaceRequestSchema = CreateSpaceRequestSchema.partial().describe('Request payload for updating an existing space');

/**
 * Space Response
 * 
 * @example
 * ```json
 * {
 *   "id": "550e8400-e29b-41d4-a716-446655440000",
 *   "name": "Sales Team Workspace",
 *   "slug": "sales-team",
 *   "ownerId": "user_abc123",
 *   "runtime": {
 *     "isolation": "shared_schema",
 *     "quotas": {
 *       "maxUsers": 50,
 *       "maxStorage": 107374182400,
 *       "apiRateLimit": 10000
 *     }
 *   },
 *   "bom": {
 *     "tenantId": "tenant_123",
 *     "dependencies": [],
 *     "resolutionStrategy": "override"
 *   },
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "updatedAt": "2024-01-02T00:00:00Z"
 * }
 * ```
 */
export const SpaceResponseSchema = BaseResponseSchema.extend({
  data: HubSpaceSchema.describe('Space details'),
}).describe('Response containing a single space');

/**
 * List Spaces Request
 */
export const ListSpacesRequestSchema = PaginationRequestSchema.extend({
  ownerId: z.string().optional().describe('Filter by owner'),
  search: z.string().optional().describe('Search in name and slug'),
}).describe('Request parameters for listing spaces');

/**
 * List Spaces Response
 * 
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "name": "Sales Team",
 *       "slug": "sales-team",
 *       "ownerId": "user_123",
  *       "createdAt": "2024-01-01T00:00:00Z",
 *       "updatedAt": "2024-01-02T00:00:00Z"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "perPage": 20,
 *     "total": 1,
 *     "totalPages": 1,
 *     "hasNext": false,
 *     "hasPrev": false
 *   }
 * }
 * ```
 */
export const ListSpacesResponseSchema = BaseResponseSchema.extend({
  data: z.array(HubSpaceSchema).describe('List of spaces'),
  pagination: PaginationResponseSchema.describe('Pagination metadata'),
}).describe('Paginated response containing a list of spaces');

// ============================================================================
// Tenant Management API
// ============================================================================

/**
 * Create Tenant Request
 * 
 * @example
 * ```json
 * {
 *   "name": "Acme Corporation",
 *   "isolationLevel": "isolated_schema",
 *   "quotas": {
 *     "maxUsers": 100,
 *     "maxStorage": 214748364800,
 *     "apiRateLimit": 50000
 *   }
 * }
 * ```
 */
export const CreateTenantRequestSchema = z.object({
  name: z.string().min(1).max(255).describe('Tenant display name'),
  isolationLevel: TenantSchema.shape.isolationLevel.describe('Data isolation level for the tenant'),
  customizations: TenantSchema.shape.customizations.optional().describe('Tenant-specific customizations'),
  quotas: TenantSchema.shape.quotas.optional().describe('Resource quotas for the tenant'),
}).describe('Request payload for creating a new tenant');

/**
 * Update Tenant Request
 */
export const UpdateTenantRequestSchema = CreateTenantRequestSchema.partial().describe('Request payload for updating an existing tenant');

/**
 * Tenant Response
 */
export const TenantResponseSchema = BaseResponseSchema.extend({
  data: TenantSchema.describe('Tenant details'),
}).describe('Response containing a single tenant');

/**
 * List Tenants Request
 */
export const ListTenantsRequestSchema = PaginationRequestSchema.extend({
  isolationLevel: TenantSchema.shape.isolationLevel.optional().describe('Filter by isolation level'),
  search: z.string().optional().describe('Search tenants by name'),
}).describe('Request parameters for listing tenants');

/**
 * List Tenants Response
 */
export const ListTenantsResponseSchema = BaseResponseSchema.extend({
  data: z.array(TenantSchema).describe('List of tenants'),
  pagination: PaginationResponseSchema.describe('Pagination metadata'),
}).describe('Paginated response containing a list of tenants');

// ============================================================================
// Plugin Registry API
// ============================================================================

/**
 * Publish Plugin Request
 * 
 * @example
 * ```json
 * {
 *   "id": "com.acme.crm.advanced",
 *   "version": "1.0.0",
 *   "name": "Advanced CRM",
 *   "description": "Enterprise-grade CRM solution",
 *   "category": "data",
 *   "vendor": {
 *     "id": "com.acme",
 *     "name": "Acme Corporation",
 *     "verified": true,
 *     "trustLevel": "verified"
 *   }
 * }
 * ```
 */
export const PublishPluginRequestSchema = PluginRegistryEntrySchema.omit({
  publishedAt: true,
  updatedAt: true,
  statistics: true,
  quality: true,
}).describe('Request payload for publishing a plugin');

/**
 * Update Plugin Request
 */
export const UpdatePluginRequestSchema = PublishPluginRequestSchema.partial().describe('Request payload for updating a published plugin');

/**
 * Plugin Response
 */
export const PluginResponseSchema = BaseResponseSchema.extend({
  data: PluginRegistryEntrySchema.describe('Plugin registry entry details'),
}).describe('Response containing a single plugin');

/**
 * Search Plugins Request
 * 
 * @example
 * ```json
 * {
 *   "query": "crm",
 *   "category": ["data", "integration"],
 *   "trustLevel": ["verified", "official"],
 *   "minRating": 4.0,
 *   "sortBy": "downloads",
 *   "page": 1,
 *   "limit": 20
 * }
 * ```
 */
export const SearchPluginsRequestSchema = PluginSearchFiltersSchema;

/**
 * Search Plugins Response
 * 
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "com.acme.crm",
 *       "version": "1.0.0",
 *       "name": "Advanced CRM",
 ...
 *       }
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "perPage": 20,
 *     "total": 45,
 *     "totalPages": 3,
 *     "hasNext": true,
 *     "hasPrev": false
 *   }
 * }
 * ```
 */
export const SearchPluginsResponseSchema = BaseResponseSchema.extend({
  data: z.array(PluginRegistryEntrySchema).describe('List of matching plugins'),
  pagination: PaginationResponseSchema.describe('Pagination metadata'),
}).describe('Paginated response containing plugin search results');

/**
 * Get Plugin Versions Request
 */
export const GetPluginVersionsRequestSchema = z.object({
  pluginId: z.string().describe('Plugin identifier'),
}).describe('Request parameters for retrieving plugin versions');

/**
 * Plugin Version Info
 */
export const PluginVersionInfoSchema = z.object({
  version: z.string().describe('Semantic version string'),
  publishedAt: z.string().datetime().describe('Timestamp when this version was published'),
  deprecated: z.boolean().default(false).describe('Whether this version is deprecated'),
  yanked: z.boolean().default(false).describe('Whether this version was removed'),
  changelog: z.string().optional().describe('Release notes for this version'),
}).describe('Version metadata for a plugin release');

/**
 * Get Plugin Versions Response
 */
export const GetPluginVersionsResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    pluginId: z.string().describe('Plugin identifier'),
    versions: z.array(PluginVersionInfoSchema).describe('List of available versions'),
    latest: z.string().describe('Latest stable version'),
    latestPrerelease: z.string().optional().describe('Latest pre-release version'),
  }).describe('Plugin version listing'),
}).describe('Response containing plugin version information');

// ============================================================================
// Marketplace API
// ============================================================================

/**
 * List Marketplace Plugins Request
 */
export const ListMarketplaceRequestSchema = PaginationRequestSchema.extend({
  category: z.string().optional().describe('Filter by plugin category'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  verified: z.boolean().optional().describe('Filter by vendor verification status'),
  search: z.string().optional().describe('Search marketplace plugins by keyword'),
}).describe('Request parameters for listing marketplace plugins');

/**
 * List Marketplace Response
 */
export const ListMarketplaceResponseSchema = BaseResponseSchema.extend({
  data: z.array(MarketplacePluginSchema).describe('List of marketplace plugins'),
  pagination: PaginationResponseSchema.describe('Pagination metadata'),
  categories: z.array(z.object({
    id: z.string().describe('Category identifier'),
    label: z.string().describe('Category display name'),
    count: z.number().int().describe('Number of plugins in this category'),
  }).describe('Marketplace category summary')).optional().describe('Available categories with counts'),
}).describe('Paginated response containing marketplace plugin listings');

/**
 * Get Marketplace Plugin Details Request
 */
export const GetMarketplacePluginRequestSchema = z.object({
  pluginId: z.string().describe('Plugin identifier to retrieve'),
}).describe('Request parameters for retrieving marketplace plugin details');

/**
 * Marketplace Plugin Details Response
 */
export const MarketplacePluginResponseSchema = BaseResponseSchema.extend({
  data: MarketplacePluginSchema.describe('Marketplace plugin details'),
}).describe('Response containing marketplace plugin details');

// ============================================================================
// License Management API
// ============================================================================

/**
 * Issue License Request
 * 
 * @example
 * ```json
 * {
 *   "spaceId": "550e8400-e29b-41d4-a716-446655440000",
 *   "planCode": "enterprise_v1",
 *   "expiresAt": "2025-12-31T23:59:59Z",
 *   "customFeatures": ["advanced_analytics", "ai_insights"],
 *   "customLimits": {
 *     "storage_gb": 500,
 *     "api_calls": 1000000
 *   },
 *   "plugins": ["com.acme.crm", "com.acme.analytics"]
 * }
 * ```
 */
export const IssueLicenseRequestSchema = z.object({
  spaceId: z.string().describe('Target space ID'),
  planCode: z.string().describe('Plan code'),
  expiresAt: z.string().datetime().optional().describe('License expiration date'),
  customFeatures: z.array(z.string()).optional().describe('Custom feature flags to enable'),
  customLimits: z.record(z.string(), z.number()).optional().describe('Custom resource limits'),
  plugins: z.array(z.string()).optional().describe('Licensed plugin identifiers'),
}).describe('Request payload for issuing a new license');

/**
 * License Response
 */
export const LicenseResponseSchema = BaseResponseSchema.extend({
  data: LicenseSchema.describe('License details'),
}).describe('Response containing a single license');

/**
 * Validate License Request
 * 
 * @example
 * ```json
 * {
 *   "spaceId": "550e8400-e29b-41d4-a716-446655440000",
 *   "signature": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * ```
 */
export const ValidateLicenseRequestSchema = z.object({
  spaceId: z.string().describe('Space ID to validate the license for'),
  signature: z.string().describe('License signature/token'),
}).describe('Request payload for validating a license');

/**
 * License Validation Response
 * 
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "valid": true,
 *     "license": {
 *       "spaceId": "550e8400-e29b-41d4-a716-446655440000",
 *       "planCode": "enterprise_v1",
 *       "status": "active",
 *       "issuedAt": "2024-01-01T00:00:00Z",
 *       "expiresAt": "2025-12-31T23:59:59Z"
 *     },
 *     "errors": []
 *   }
 * }
 * ```
 */
export const ValidateLicenseResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    valid: z.boolean().describe('Whether the license is valid'),
    license: LicenseSchema.optional().describe('License details if found'),
    errors: z.array(z.string()).default([]).describe('Validation error messages'),
    warnings: z.array(z.string()).default([]).describe('Validation warning messages'),
  }).describe('License validation result'),
}).describe('Response containing license validation results');

/**
 * Revoke License Request
 */
export const RevokeLicenseRequestSchema = z.object({
  spaceId: z.string().describe('Space ID whose license should be revoked'),
  reason: z.string().optional().describe('Reason for revoking the license'),
}).describe('Request payload for revoking a license');

/**
 * List Licenses Request
 */
export const ListLicensesRequestSchema = PaginationRequestSchema.extend({
  spaceId: z.string().optional().describe('Filter by space ID'),
  planCode: z.string().optional().describe('Filter by plan code'),
  status: LicenseSchema.shape.status.optional().describe('Filter by license status'),
}).describe('Request parameters for listing licenses');

/**
 * List Licenses Response
 */
export const ListLicensesResponseSchema = BaseResponseSchema.extend({
  data: z.array(LicenseSchema).describe('List of licenses'),
  pagination: PaginationResponseSchema.describe('Pagination metadata'),
}).describe('Paginated response containing a list of licenses');

// ============================================================================
// Composer Service API
// ============================================================================

/**
 * Compile Manifest Request
 * 
 * @example
 * ```json
 * {
 *   "bom": {
 *     "tenantId": "tenant_123",
 *     "dependencies": [
 *       {
 *         "id": "com.objectstack.crm",
 *         "version": "2.0.0",
 *         "configuration": {
 *           "currency": "USD",
 *           "region": "us-east-1"
 *         }
 *       }
 *     ],
 *     "resolutionStrategy": "override"
 *   },
 *   "runtimeVersion": "1.5.0",
 *   "dryRun": false
 * }
 * ```
 */
export const CompileManifestRequestSchema = ComposerRequestSchema;

/**
 * Compile Manifest Response
 */
export const CompileManifestResponseSchema = BaseResponseSchema.extend({
  data: ComposerResponseSchema.describe('Compilation result'),
}).describe('Response containing the compiled manifest result');

/**
 * Get Build Status Request
 */
export const GetBuildStatusRequestSchema = z.object({
  buildId: z.string().describe('Unique build identifier'),
}).describe('Request parameters for retrieving build status');

/**
 * Build Status Response
 * 
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "buildId": "build_abc123",
 *     "status": "success",
 *     "progress": 100,
 *     "startedAt": "2024-01-01T10:00:00Z",
 *     "completedAt": "2024-01-01T10:02:30Z",
 *     "duration": 150000,
 *     "logs": [
 *       { "timestamp": "2024-01-01T10:00:00Z", "level": "info", "message": "Starting compilation" },
 *       { "timestamp": "2024-01-01T10:02:30Z", "level": "info", "message": "Compilation complete" }
 *     ]
 *   }
 * }
 * ```
 */
export const BuildStatusResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    buildId: z.string().describe('Unique build identifier'),
    status: z.enum(['pending', 'in_progress', 'success', 'failed']).describe('Current build status'),
    progress: z.number().min(0).max(100).describe('Completion percentage'),
    startedAt: z.string().datetime().optional().describe('Timestamp when the build started'),
    completedAt: z.string().datetime().optional().describe('Timestamp when the build completed'),
    duration: z.number().optional().describe('Duration in milliseconds'),
    logs: z.array(z.object({
      timestamp: z.string().datetime().describe('Log entry timestamp'),
      level: z.enum(['debug', 'info', 'warn', 'error']).describe('Log severity level'),
      message: z.string().describe('Log message content'),
    }).describe('Build log entry')).optional().describe('Build log entries'),
    error: z.string().optional().describe('Error message if the build failed'),
  }).describe('Build status details'),
}).describe('Response containing build status information');

// ============================================================================
// Health & Monitoring
// ============================================================================

/**
 * Hub Health Check Response
 * 
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "status": "healthy",
 *     "version": "1.0.0",
 *     "uptime": 86400,
 *     "services": {
 *       "database": {
 *         "status": "healthy",
 *         "latency": 5
 *       },
 *       "cache": {
 *         "status": "healthy",
 *         "latency": 2
 *       },
 *       "composer": {
 *         "status": "healthy",
 *         "latency": 15
 *       }
 *     },
 *     "timestamp": "2024-01-01T12:00:00Z"
 *   }
 * }
 * ```
 */
export const HubHealthResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']).describe('Overall hub health status'),
    version: z.string().describe('Hub service version'),
    uptime: z.number().describe('Uptime in seconds'),
    services: z.record(z.string(), z.object({
      status: z.enum(['healthy', 'degraded', 'unhealthy']).describe('Service health status'),
      latency: z.number().optional().describe('Latency in milliseconds'),
      message: z.string().optional().describe('Additional status message'),
    }).describe('Individual service health details')).describe('Health status of dependent services'),
    timestamp: z.string().datetime().describe('Timestamp of the health check'),
  }).describe('Hub health check details'),
}).describe('Response containing hub health status');

/**
 * Hub Metrics Response
 * 
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "metrics": {
 *       "spaces": {
 *         "total": 1250,
 *         "active": 980,
 *         "created_last_30d": 45
 *       },
 *       "tenants": {
 *         "total": 320,
 *         "active": 285
 *       },
 *       "plugins": {
 *         "total": 156,
 *         "published_last_30d": 8,
 *         "total_downloads": 456789
 *       },
 *       "api": {
 *         "requests_per_minute": 850,
 *         "avg_response_time": 125,
 *         "error_rate": 0.002
 *       }
 *     },
 *     "timestamp": "2024-01-01T12:00:00Z"
 *   }
 * }
 * ```
 */
export const HubMetricsResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    metrics: z.object({
      spaces: z.object({
        total: z.number().int().describe('Total number of spaces'),
        active: z.number().int().describe('Number of active spaces'),
        created_last_30d: z.number().int().optional().describe('Spaces created in the last 30 days'),
      }).optional().describe('Space-related metrics'),
      tenants: z.object({
        total: z.number().int().describe('Total number of tenants'),
        active: z.number().int().describe('Number of active tenants'),
      }).optional().describe('Tenant-related metrics'),
      plugins: z.object({
        total: z.number().int().describe('Total number of plugins'),
        published_last_30d: z.number().int().optional().describe('Plugins published in the last 30 days'),
        total_downloads: z.number().int().optional().describe('Cumulative plugin downloads'),
      }).optional().describe('Plugin-related metrics'),
      api: z.object({
        requests_per_minute: z.number().describe('Current API request rate per minute'),
        avg_response_time: z.number().describe('Milliseconds'),
        error_rate: z.number().min(0).max(1).describe('Ratio of failed API requests'),
      }).optional().describe('API performance metrics'),
    }).describe('Aggregated hub metrics'),
    timestamp: z.string().datetime().describe('Timestamp when metrics were collected'),
  }).describe('Hub metrics data'),
}).describe('Response containing hub operational metrics');

// ============================================================================
// Export Types
// ============================================================================

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;

// Space API
export type CreateSpaceRequest = z.infer<typeof CreateSpaceRequestSchema>;
export type UpdateSpaceRequest = z.infer<typeof UpdateSpaceRequestSchema>;
export type SpaceResponse = z.infer<typeof SpaceResponseSchema>;
export type ListSpacesRequest = z.infer<typeof ListSpacesRequestSchema>;
export type ListSpacesResponse = z.infer<typeof ListSpacesResponseSchema>;

// Tenant API
export type CreateTenantRequest = z.infer<typeof CreateTenantRequestSchema>;
export type UpdateTenantRequest = z.infer<typeof UpdateTenantRequestSchema>;
export type TenantResponse = z.infer<typeof TenantResponseSchema>;
export type ListTenantsRequest = z.infer<typeof ListTenantsRequestSchema>;
export type ListTenantsResponse = z.infer<typeof ListTenantsResponseSchema>;

// Plugin Registry API
export type PublishPluginRequest = z.infer<typeof PublishPluginRequestSchema>;
export type UpdatePluginRequest = z.infer<typeof UpdatePluginRequestSchema>;
export type PluginResponse = z.infer<typeof PluginResponseSchema>;
export type SearchPluginsRequest = z.infer<typeof SearchPluginsRequestSchema>;
export type SearchPluginsResponse = z.infer<typeof SearchPluginsResponseSchema>;
export type GetPluginVersionsRequest = z.infer<typeof GetPluginVersionsRequestSchema>;
export type PluginVersionInfo = z.infer<typeof PluginVersionInfoSchema>;
export type GetPluginVersionsResponse = z.infer<typeof GetPluginVersionsResponseSchema>;

// Marketplace API
export type ListMarketplaceRequest = z.infer<typeof ListMarketplaceRequestSchema>;
export type ListMarketplaceResponse = z.infer<typeof ListMarketplaceResponseSchema>;
export type GetMarketplacePluginRequest = z.infer<typeof GetMarketplacePluginRequestSchema>;
export type MarketplacePluginResponse = z.infer<typeof MarketplacePluginResponseSchema>;

// License API
export type IssueLicenseRequest = z.infer<typeof IssueLicenseRequestSchema>;
export type LicenseResponse = z.infer<typeof LicenseResponseSchema>;
export type ValidateLicenseRequest = z.infer<typeof ValidateLicenseRequestSchema>;
export type ValidateLicenseResponse = z.infer<typeof ValidateLicenseResponseSchema>;
export type RevokeLicenseRequest = z.infer<typeof RevokeLicenseRequestSchema>;
export type ListLicensesRequest = z.infer<typeof ListLicensesRequestSchema>;
export type ListLicensesResponse = z.infer<typeof ListLicensesResponseSchema>;

// Composer API
export type CompileManifestRequest = z.infer<typeof CompileManifestRequestSchema>;
export type CompileManifestResponse = z.infer<typeof CompileManifestResponseSchema>;
export type GetBuildStatusRequest = z.infer<typeof GetBuildStatusRequestSchema>;
export type BuildStatusResponse = z.infer<typeof BuildStatusResponseSchema>;

// Health & Monitoring
export type HubHealthResponse = z.infer<typeof HubHealthResponseSchema>;
export type HubMetricsResponse = z.infer<typeof HubMetricsResponseSchema>;

// ============================================================================
// Hub API Contracts Export
// ============================================================================

/**
 * Complete Hub API Contract
 * 
 * This object provides a centralized reference to all Hub API endpoints,
 * request/response schemas, and types for building Hub management systems.
 */
export const HubAPIContract = {
  // Space Management
  spaces: {
    create: {
      request: CreateSpaceRequestSchema,
      response: SpaceResponseSchema,
    },
    update: {
      request: UpdateSpaceRequestSchema,
      response: SpaceResponseSchema,
    },
    get: {
      response: SpaceResponseSchema,
    },
    list: {
      request: ListSpacesRequestSchema,
      response: ListSpacesResponseSchema,
    },
    delete: {
      response: z.object({ success: z.boolean().describe('Whether the deletion was successful') }).describe('Space deletion response'),
    },
  },
  
  // Tenant Management
  tenants: {
    create: {
      request: CreateTenantRequestSchema,
      response: TenantResponseSchema,
    },
    update: {
      request: UpdateTenantRequestSchema,
      response: TenantResponseSchema,
    },
    get: {
      response: TenantResponseSchema,
    },
    list: {
      request: ListTenantsRequestSchema,
      response: ListTenantsResponseSchema,
    },
    delete: {
      response: z.object({ success: z.boolean().describe('Whether the deletion was successful') }).describe('Tenant deletion response'),
    },
  },
  
  // Plugin Registry (Publisher Operations)
  registry: {
    publish: {
      request: PublishPluginRequestSchema,
      response: PluginResponseSchema,
    },
    update: {
      request: UpdatePluginRequestSchema,
      response: PluginResponseSchema,
    },
    get: {
      response: PluginResponseSchema,
    },
    search: {
      request: SearchPluginsRequestSchema,
      response: SearchPluginsResponseSchema,
    },
    versions: {
      request: GetPluginVersionsRequestSchema,
      response: GetPluginVersionsResponseSchema,
    },
    delete: {
      response: z.object({ success: z.boolean().describe('Whether the deletion was successful') }).describe('Plugin deletion response'),
    },
  },
  
  // Marketplace (Consumer Operations)
  marketplace: {
    list: {
      request: ListMarketplaceRequestSchema,
      response: ListMarketplaceResponseSchema,
    },
    get: {
      request: GetMarketplacePluginRequestSchema,
      response: MarketplacePluginResponseSchema,
    },
  },
  
  // License Management
  licenses: {
    issue: {
      request: IssueLicenseRequestSchema,
      response: LicenseResponseSchema,
    },
    validate: {
      request: ValidateLicenseRequestSchema,
      response: ValidateLicenseResponseSchema,
    },
    revoke: {
      request: RevokeLicenseRequestSchema,
      response: z.object({ success: z.boolean().describe('Whether the revocation was successful') }).describe('License revocation response'),
    },
    list: {
      request: ListLicensesRequestSchema,
      response: ListLicensesResponseSchema,
    },
  },
  
  // Composer
  composer: {
    compile: {
      request: CompileManifestRequestSchema,
      response: CompileManifestResponseSchema,
    },
    buildStatus: {
      request: GetBuildStatusRequestSchema,
      response: BuildStatusResponseSchema,
    },
  },
  
  // System & Observability
  system: {
    health: {
      response: HubHealthResponseSchema,
    },
    metrics: {
      response: HubMetricsResponseSchema,
    },
  },
} as const;

/**
 * Install Plugin Request
 */
export const InstallPluginRequestSchema = z.object({
  spaceId: z.string().describe('Target Space ID'),
  pluginId: z.string().describe('Plugin Package ID'),
  version: z.string().optional().describe('Version requirement'),
  config: z.record(z.string(), z.unknown()).optional().describe('Plugin configuration'),
}).describe('Request payload for installing a plugin into a space');

/**
 * Install Plugin Response
 */
export const InstallPluginResponseSchema = BaseResponseSchema.extend({
  data: z.unknown().describe('Installation status or installed plugin instance'),
}).describe('Response containing plugin installation result');



export type InstallPluginRequest = z.infer<typeof InstallPluginRequestSchema>;
export type InstallPluginResponse = z.infer<typeof InstallPluginResponseSchema>;
