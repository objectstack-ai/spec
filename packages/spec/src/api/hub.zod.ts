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
  page: z.number().int().min(1).default(1).optional(),
  
  /**
   * Number of items per page
   */
  perPage: z.number().int().min(1).max(100).default(20).optional(),
  
  /**
   * Sort field
   */
  sortBy: z.string().optional(),
  
  /**
   * Sort direction
   */
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

/**
 * Pagination Response Metadata
 */
export const PaginationResponseSchema = z.object({
  /**
   * Current page number
   */
  page: z.number().int().min(1),
  
  /**
   * Items per page
   */
  perPage: z.number().int().min(1),
  
  /**
   * Total number of items
   */
  total: z.number().int().min(0),
  
  /**
   * Total number of pages
   */
  totalPages: z.number().int().min(0),
  
  /**
   * Whether there is a next page
   */
  hasNext: z.boolean(),
  
  /**
   * Whether there is a previous page
   */
  hasPrev: z.boolean(),
});

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
  runtime: HubSpaceSchema.shape.runtime.optional(),
  bom: BillOfMaterialsSchema.optional().describe('Initial Bill of Materials'),
  subscription: HubSpaceSchema.shape.subscription.optional(),
  deployment: HubSpaceSchema.shape.deployment.optional(),
});

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
export const UpdateSpaceRequestSchema = CreateSpaceRequestSchema.partial();

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
  data: HubSpaceSchema
});

/**
 * List Spaces Request
 */
export const ListSpacesRequestSchema = PaginationRequestSchema.extend({
  ownerId: z.string().optional().describe('Filter by owner'),
  search: z.string().optional().describe('Search in name and slug'),
});

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
  data: z.array(HubSpaceSchema),
  pagination: PaginationResponseSchema,
});

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
  isolationLevel: TenantSchema.shape.isolationLevel,
  customizations: TenantSchema.shape.customizations.optional(),
  quotas: TenantSchema.shape.quotas.optional(),
});

/**
 * Update Tenant Request
 */
export const UpdateTenantRequestSchema = CreateTenantRequestSchema.partial();

/**
 * Tenant Response
 */
export const TenantResponseSchema = BaseResponseSchema.extend({
  data: TenantSchema
});

/**
 * List Tenants Request
 */
export const ListTenantsRequestSchema = PaginationRequestSchema.extend({
  isolationLevel: TenantSchema.shape.isolationLevel.optional(),
  search: z.string().optional(),
});

/**
 * List Tenants Response
 */
export const ListTenantsResponseSchema = BaseResponseSchema.extend({
  data: z.array(TenantSchema),
  pagination: PaginationResponseSchema,
});

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
});

/**
 * Update Plugin Request
 */
export const UpdatePluginRequestSchema = PublishPluginRequestSchema.partial();

/**
 * Plugin Response
 */
export const PluginResponseSchema = BaseResponseSchema.extend({
  data: PluginRegistryEntrySchema
});

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
  data: z.array(PluginRegistryEntrySchema),
  pagination: PaginationResponseSchema,
});

/**
 * Get Plugin Versions Request
 */
export const GetPluginVersionsRequestSchema = z.object({
  pluginId: z.string().describe('Plugin identifier'),
});

/**
 * Plugin Version Info
 */
export const PluginVersionInfoSchema = z.object({
  version: z.string(),
  publishedAt: z.string().datetime(),
  deprecated: z.boolean().default(false),
  yanked: z.boolean().default(false).describe('Whether this version was removed'),
  changelog: z.string().optional(),
});

/**
 * Get Plugin Versions Response
 */
export const GetPluginVersionsResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    pluginId: z.string(),
    versions: z.array(PluginVersionInfoSchema),
    latest: z.string().describe('Latest stable version'),
    latestPrerelease: z.string().optional().describe('Latest pre-release version'),
  })
});

// ============================================================================
// Marketplace API
// ============================================================================

/**
 * List Marketplace Plugins Request
 */
export const ListMarketplaceRequestSchema = PaginationRequestSchema.extend({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  verified: z.boolean().optional(),
  search: z.string().optional(),
});

/**
 * List Marketplace Response
 */
export const ListMarketplaceResponseSchema = BaseResponseSchema.extend({
  data: z.array(MarketplacePluginSchema),
  pagination: PaginationResponseSchema,
  categories: z.array(z.object({
    id: z.string(),
    label: z.string(),
    count: z.number().int(),
  })).optional().describe('Available categories with counts'),
});

/**
 * Get Marketplace Plugin Details Request
 */
export const GetMarketplacePluginRequestSchema = z.object({
  pluginId: z.string(),
});

/**
 * Marketplace Plugin Details Response
 */
export const MarketplacePluginResponseSchema = BaseResponseSchema.extend({
  data: MarketplacePluginSchema
});

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
  expiresAt: z.string().datetime().optional(),
  customFeatures: z.array(z.string()).optional(),
  customLimits: z.record(z.string(), z.number()).optional(),
  plugins: z.array(z.string()).optional(),
});

/**
 * License Response
 */
export const LicenseResponseSchema = BaseResponseSchema.extend({
  data: LicenseSchema
});

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
  spaceId: z.string(),
  signature: z.string().describe('License signature/token'),
});

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
    valid: z.boolean(),
    license: LicenseSchema.optional(),
    errors: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
  })
});

/**
 * Revoke License Request
 */
export const RevokeLicenseRequestSchema = z.object({
  spaceId: z.string(),
  reason: z.string().optional(),
});

/**
 * List Licenses Request
 */
export const ListLicensesRequestSchema = PaginationRequestSchema.extend({
  spaceId: z.string().optional(),
  planCode: z.string().optional(),
  status: LicenseSchema.shape.status.optional(),
});

/**
 * List Licenses Response
 */
export const ListLicensesResponseSchema = BaseResponseSchema.extend({
  data: z.array(LicenseSchema),
  pagination: PaginationResponseSchema,
});

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
  data: ComposerResponseSchema
});

/**
 * Get Build Status Request
 */
export const GetBuildStatusRequestSchema = z.object({
  buildId: z.string(),
});

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
    buildId: z.string(),
    status: z.enum(['pending', 'in_progress', 'success', 'failed']),
    progress: z.number().min(0).max(100).describe('Completion percentage'),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    duration: z.number().optional().describe('Duration in milliseconds'),
    logs: z.array(z.object({
      timestamp: z.string().datetime(),
      level: z.enum(['debug', 'info', 'warn', 'error']),
      message: z.string(),
    })).optional(),
    error: z.string().optional(),
  })
});

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
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    version: z.string(),
    uptime: z.number().describe('Uptime in seconds'),
    services: z.record(z.string(), z.object({
      status: z.enum(['healthy', 'degraded', 'unhealthy']),
      latency: z.number().optional().describe('Latency in milliseconds'),
      message: z.string().optional(),
    })),
    timestamp: z.string().datetime(),
  })
});

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
        total: z.number().int(),
        active: z.number().int(),
        created_last_30d: z.number().int().optional(),
      }).optional(),
      tenants: z.object({
        total: z.number().int(),
        active: z.number().int(),
      }).optional(),
      plugins: z.object({
        total: z.number().int(),
        published_last_30d: z.number().int().optional(),
        total_downloads: z.number().int().optional(),
      }).optional(),
      api: z.object({
        requests_per_minute: z.number(),
        avg_response_time: z.number().describe('Milliseconds'),
        error_rate: z.number().min(0).max(1),
      }).optional(),
    }),
    timestamp: z.string().datetime(),
  })
});

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
      response: z.object({ success: z.boolean() }),
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
      response: z.object({ success: z.boolean() }),
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
      response: z.object({ success: z.boolean() }),
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
      response: z.object({ success: z.boolean() }),
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
  config: z.record(z.any()).optional().describe('Plugin configuration'),
});

/**
 * Install Plugin Response
 */
export const InstallPluginResponseSchema = BaseResponseSchema.extend({
  data: z.any() // Returns installation status or installed instance
});
