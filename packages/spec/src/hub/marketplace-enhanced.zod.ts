import { z } from 'zod';
import { PluginSecurityManifestSchema } from '../system/plugin-security-advanced.zod';
import { PluginVersionMetadataSchema } from '../system/plugin-versioning.zod';

/**
 * # Enhanced Plugin Registry and Marketplace Protocol
 * 
 * Comprehensive protocol for plugin discovery, distribution, installation,
 * and lifecycle management in a centralized marketplace.
 * 
 * Features:
 * - Plugin discovery and search
 * - Rating and review system
 * - Quality scoring and certification
 * - Automated installation and updates
 * - License management
 * - Revenue sharing for plugin developers
 * - Registry federation for hybrid cloud deployments
 */

/**
 * Registry Sync Policy
 * Defines how registries synchronize with upstreams
 */
export const RegistrySyncPolicySchema = z.enum([
  'manual',    // Manual synchronization only
  'auto',      // Automatic synchronization
  'proxy',     // Proxy requests to upstream without caching
]).describe('Registry synchronization strategy');

/**
 * Registry Upstream Configuration
 * Configuration for upstream registry connection
 */
export const RegistryUpstreamSchema = z.object({
  /**
   * Upstream registry URL
   */
  url: z.string().url()
    .describe('Upstream registry endpoint'),
  
  /**
   * Synchronization policy
   */
  syncPolicy: RegistrySyncPolicySchema.default('auto'),
  
  /**
   * Sync interval in seconds (for auto sync)
   */
  syncInterval: z.number().int().min(60).optional()
    .describe('Auto-sync interval in seconds'),
  
  /**
   * Authentication credentials
   */
  auth: z.object({
    type: z.enum(['none', 'basic', 'bearer', 'api-key', 'oauth2']).default('none'),
    username: z.string().optional(),
    password: z.string().optional(),
    token: z.string().optional(),
    apiKey: z.string().optional(),
  }).optional(),
  
  /**
   * TLS/SSL configuration
   */
  tls: z.object({
    enabled: z.boolean().default(true),
    verifyCertificate: z.boolean().default(true),
    certificate: z.string().optional(),
    privateKey: z.string().optional(),
  }).optional(),
  
  /**
   * Timeout settings
   */
  timeout: z.number().int().min(1000).default(30000)
    .describe('Request timeout in milliseconds'),
  
  /**
   * Retry configuration
   */
  retry: z.object({
    maxAttempts: z.number().int().min(0).default(3),
    backoff: z.enum(['fixed', 'linear', 'exponential']).default('exponential'),
  }).optional(),
});

/**
 * Registry Configuration
 * Complete registry configuration supporting federation
 */
export const RegistryConfigSchema = z.object({
  /**
   * Registry type
   */
  type: z.enum([
    'public',    // Public marketplace (e.g., plugins.objectstack.com)
    'private',   // Private enterprise registry
    'hybrid',    // Hybrid with upstream federation
  ]).describe('Registry deployment type'),
  
  /**
   * Upstream registries (for hybrid/private registries)
   */
  upstream: z.array(RegistryUpstreamSchema).optional()
    .describe('Upstream registries to sync from or proxy to'),
  
  /**
   * Scopes managed by this registry
   */
  scope: z.array(z.string()).optional()
    .describe('npm-style scopes managed by this registry (e.g., @my-corp, @enterprise)'),
  
  /**
   * Default scope for new plugins
   */
  defaultScope: z.string().optional()
    .describe('Default scope prefix for new plugins'),
  
  /**
   * Registry storage configuration
   */
  storage: z.object({
    /**
     * Storage backend type
     */
    backend: z.enum(['local', 's3', 'gcs', 'azure-blob', 'oss']).default('local'),
    
    /**
     * Storage path or bucket name
     */
    path: z.string().optional(),
    
    /**
     * Credentials
     */
    credentials: z.record(z.string(), z.any()).optional(),
  }).optional(),
  
  /**
   * Registry visibility
   */
  visibility: z.enum(['public', 'private', 'internal']).default('private')
    .describe('Who can access this registry'),
  
  /**
   * Access control
   */
  accessControl: z.object({
    /**
     * Require authentication for read
     */
    requireAuthForRead: z.boolean().default(false),
    
    /**
     * Require authentication for write
     */
    requireAuthForWrite: z.boolean().default(true),
    
    /**
     * Allowed users/teams
     */
    allowedPrincipals: z.array(z.string()).optional(),
  }).optional(),
  
  /**
   * Caching configuration
   */
  cache: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().int().min(0).default(3600)
      .describe('Cache TTL in seconds'),
    maxSize: z.number().int().optional()
      .describe('Maximum cache size in bytes'),
  }).optional(),
  
  /**
   * Mirroring configuration (for high availability)
   */
  mirrors: z.array(z.object({
    url: z.string().url(),
    priority: z.number().int().min(1).default(1),
  })).optional()
    .describe('Mirror registries for redundancy'),
});

/**
 * Plugin Category
 * Categorization for better discovery
 */
export const PluginCategorySchema = z.enum([
  'data-integration',      // Data connectors and integrations
  'analytics',             // Analytics and BI tools
  'ai-ml',                // AI and machine learning
  'automation',           // Workflow automation
  'communication',        // Communication tools
  'crm',                  // CRM extensions
  'erp',                  // ERP extensions
  'productivity',         // Productivity tools
  'security',             // Security tools
  'ui-components',        // UI widgets and components
  'utilities',            // Utility plugins
  'developer-tools',      // Development tools
  'other',                // Other categories
]).describe('Plugin category for classification');

/**
 * Plugin Tag
 * Flexible tagging for discovery
 */
export const PluginTagSchema = z.object({
  name: z.string().describe('Tag name'),
  category: z.enum(['feature', 'technology', 'industry', 'custom']).optional(),
});

/**
 * Plugin Rating
 * User rating for a plugin
 */
export const PluginRatingSchema = z.object({
  /**
   * User who rated
   */
  userId: z.string(),
  
  /**
   * Rating value (1-5 stars)
   */
  rating: z.number().min(1).max(5),
  
  /**
   * Optional review text
   */
  review: z.string().optional(),
  
  /**
   * Rating timestamp
   */
  timestamp: z.string().datetime(),
  
  /**
   * Verified purchase
   */
  verifiedPurchase: z.boolean().default(false),
  
  /**
   * Helpful votes
   */
  helpfulVotes: z.number().int().min(0).default(0),
});

/**
 * Plugin Quality Metrics (Marketplace)
 * Objective quality measurements for marketplace listing
 */
export const MarketplaceQualityMetricsSchema = z.object({
  /**
   * Code quality score (0-100)
   */
  codeQuality: z.number().min(0).max(100).optional(),
  
  /**
   * Test coverage percentage
   */
  testCoverage: z.number().min(0).max(100).optional(),
  
  /**
   * Documentation completeness (0-100)
   */
  documentation: z.number().min(0).max(100).optional(),
  
  /**
   * Performance score (0-100)
   */
  performance: z.number().min(0).max(100).optional(),
  
  /**
   * Security score (0-100)
   */
  security: z.number().min(0).max(100).optional(),
  
  /**
   * Maintainability index
   */
  maintainability: z.number().min(0).max(100).optional(),
  
  /**
   * Number of open issues
   */
  openIssues: z.number().int().min(0).optional(),
  
  /**
   * Average issue resolution time (hours)
   */
  avgIssueResolutionTime: z.number().optional(),
  
  /**
   * Update frequency (days)
   */
  updateFrequency: z.number().optional(),
  
  /**
   * Last update date
   */
  lastUpdated: z.string().datetime().optional(),
});

/**
 * Plugin Certification
 * Official certification status
 */
export const PluginCertificationSchema = z.object({
  /**
   * Certification level
   */
  level: z.enum([
    'verified',       // Identity verified
    'tested',         // Passed basic tests
    'certified',      // Full certification
    'enterprise',     // Enterprise-grade certification
    'partner',        // Official partner
  ]),
  
  /**
   * Certification date
   */
  certifiedDate: z.string().datetime(),
  
  /**
   * Expiry date
   */
  expiryDate: z.string().datetime().optional(),
  
  /**
   * Certification authority
   */
  authority: z.string(),
  
  /**
   * Certificate ID
   */
  certificateId: z.string().optional(),
  
  /**
   * Badge URL
   */
  badgeUrl: z.string().url().optional(),
});

/**
 * Plugin License
 * Licensing information
 */
export const PluginLicenseSchema = z.object({
  /**
   * License type
   */
  type: z.enum([
    'free',              // Free to use
    'open-source',       // Open source license
    'freemium',          // Free with premium features
    'trial',             // Trial period
    'subscription',      // Subscription-based
    'perpetual',         // One-time purchase
    'enterprise',        // Enterprise licensing
    'custom',            // Custom licensing
  ]),
  
  /**
   * SPDX license identifier
   */
  spdxId: z.string().optional().describe('SPDX license identifier (e.g., MIT, Apache-2.0)'),
  
  /**
   * License text or URL
   */
  licenseText: z.string().optional(),
  
  /**
   * License URL
   */
  licenseUrl: z.string().url().optional(),
  
  /**
   * Commercial use allowed
   */
  commercialUse: z.boolean().default(true),
  
  /**
   * Attribution required
   */
  attributionRequired: z.boolean().default(false),
  
  /**
   * Pricing information
   */
  pricing: z.object({
    /**
     * Free tier available
     */
    freeTier: z.boolean().default(false),
    
    /**
     * Trial period (days)
     */
    trialDays: z.number().int().min(0).optional(),
    
    /**
     * Pricing model
     */
    model: z.enum(['free', 'per-user', 'per-tenant', 'usage-based', 'flat-rate']).optional(),
    
    /**
     * Price per unit (in cents)
     */
    pricePerUnit: z.number().int().min(0).optional(),
    
    /**
     * Billing period
     */
    billingPeriod: z.enum(['monthly', 'annually', 'one-time']).optional(),
    
    /**
     * Currency
     */
    currency: z.string().default('USD'),
  }).optional(),
});

/**
 * Plugin Marketplace Listing
 * Complete marketplace information for a plugin
 */
export const PluginMarketplaceListingSchema = z.object({
  /**
   * Plugin identifier
   */
  pluginId: z.string(),
  
  /**
   * Display name
   */
  name: z.string(),
  
  /**
   * Short description (for listings)
   */
  shortDescription: z.string().max(200),
  
  /**
   * Full description (supports markdown)
   */
  description: z.string(),
  
  /**
   * Author/publisher information
   */
  publisher: z.object({
    id: z.string(),
    name: z.string(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    verified: z.boolean().default(false),
  }),
  
  /**
   * Categories
   */
  categories: z.array(PluginCategorySchema),
  
  /**
   * Tags
   */
  tags: z.array(PluginTagSchema).optional(),
  
  /**
   * Version information
   */
  versions: z.array(PluginVersionMetadataSchema),
  
  /**
   * Latest stable version
   */
  latestVersion: z.string(),
  
  /**
   * Icon URL
   */
  icon: z.string().url().optional(),
  
  /**
   * Screenshots
   */
  screenshots: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    thumbnail: z.string().url().optional(),
  })).optional(),
  
  /**
   * Demo/video URL
   */
  demoUrl: z.string().url().optional(),
  
  /**
   * Documentation URL
   */
  documentationUrl: z.string().url().optional(),
  
  /**
   * Source code URL
   */
  sourceUrl: z.string().url().optional(),
  
  /**
   * License
   */
  license: PluginLicenseSchema,
  
  /**
   * Ratings
   */
  ratings: z.object({
    average: z.number().min(0).max(5),
    count: z.number().int().min(0),
    distribution: z.object({
      '1': z.number().int().min(0),
      '2': z.number().int().min(0),
      '3': z.number().int().min(0),
      '4': z.number().int().min(0),
      '5': z.number().int().min(0),
    }),
    reviews: z.array(PluginRatingSchema).optional(),
  }).optional(),
  
  /**
   * Quality metrics
   */
  quality: MarketplaceQualityMetricsSchema.optional(),
  
  /**
   * Certification
   */
  certification: PluginCertificationSchema.optional(),
  
  /**
   * Security information
   */
  security: PluginSecurityManifestSchema.optional(),
  
  /**
   * Statistics
   */
  statistics: z.object({
    downloads: z.number().int().min(0),
    activeInstallations: z.number().int().min(0),
    views: z.number().int().min(0).optional(),
    favorites: z.number().int().min(0).optional(),
  }),
  
  /**
   * Support information
   */
  support: z.object({
    email: z.string().email().optional(),
    url: z.string().url().optional(),
    forum: z.string().url().optional(),
    chat: z.string().url().optional(),
    phone: z.string().optional(),
    responseTime: z.string().optional().describe('Expected response time'),
    sla: z.string().url().optional().describe('SLA document URL'),
  }).optional(),
  
  /**
   * Marketplace metadata
   */
  marketplace: z.object({
    /**
     * Featured plugin
     */
    featured: z.boolean().default(false),
    
    /**
     * Editor's choice
     */
    editorsChoice: z.boolean().default(false),
    
    /**
     * New release
     */
    newRelease: z.boolean().default(false),
    
    /**
     * Trending
     */
    trending: z.boolean().default(false),
    
    /**
     * Rank in category
     */
    categoryRank: z.number().int().min(1).optional(),
    
    /**
     * Overall rank
     */
    overallRank: z.number().int().min(1).optional(),
  }).optional(),
  
  /**
   * First published date
   */
  publishedDate: z.string().datetime(),
  
  /**
   * Last updated date
   */
  lastUpdated: z.string().datetime(),
});

/**
 * Plugin Search Query
 * Search and filter criteria
 */
export const PluginSearchQuerySchema = z.object({
  /**
   * Search text
   */
  query: z.string().optional(),
  
  /**
   * Filter by category
   */
  category: PluginCategorySchema.optional(),
  
  /**
   * Filter by tags
   */
  tags: z.array(z.string()).optional(),
  
  /**
   * Filter by license type
   */
  licenseType: z.array(z.string()).optional(),
  
  /**
   * Minimum rating
   */
  minRating: z.number().min(0).max(5).optional(),
  
  /**
   * Minimum quality score
   */
  minQualityScore: z.number().min(0).max(100).optional(),
  
  /**
   * Certification required
   */
  certifiedOnly: z.boolean().optional(),
  
  /**
   * Free plugins only
   */
  freeOnly: z.boolean().optional(),
  
  /**
   * Sort by
   */
  sortBy: z.enum([
    'relevance',
    'popularity',
    'rating',
    'downloads',
    'newest',
    'updated',
    'name',
  ]).optional(),
  
  /**
   * Sort order
   */
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  /**
   * Pagination
   */
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

/**
 * Plugin Installation Request
 * Request to install a plugin
 */
export const PluginInstallationRequestSchema = z.object({
  /**
   * Plugin identifier
   */
  pluginId: z.string(),
  
  /**
   * Version to install
   */
  version: z.string().optional().describe('If not specified, latest stable version'),
  
  /**
   * Installation configuration
   */
  config: z.record(z.string(), z.any()).optional(),
  
  /**
   * Accept license
   */
  acceptLicense: z.boolean().default(false),
  
  /**
   * Grant permissions
   */
  grantPermissions: z.array(z.string()).optional(),
  
  /**
   * Enable automatically
   */
  autoEnable: z.boolean().default(true),
  
  /**
   * Installation scope
   */
  scope: z.enum(['global', 'tenant', 'user']).default('global'),
  
  /**
   * Tenant ID (if scope is tenant)
   */
  tenantId: z.string().optional(),
});

/**
 * Plugin Installation Status
 * Status of plugin installation
 */
export const PluginInstallationStatusSchema = z.object({
  /**
   * Installation ID
   */
  installationId: z.string(),
  
  /**
   * Plugin ID
   */
  pluginId: z.string(),
  
  /**
   * Version installed
   */
  version: z.string(),
  
  /**
   * Installation status
   */
  status: z.enum([
    'pending',
    'downloading',
    'verifying',
    'installing',
    'configuring',
    'completed',
    'failed',
    'rollback',
  ]),
  
  /**
   * Progress percentage
   */
  progress: z.number().min(0).max(100).optional(),
  
  /**
   * Status message
   */
  message: z.string().optional(),
  
  /**
   * Error details (if failed)
   */
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  
  /**
   * Started timestamp
   */
  startedAt: z.string().datetime(),
  
  /**
   * Completed timestamp
   */
  completedAt: z.string().datetime().optional(),
});

/**
 * Plugin Revenue Sharing
 * Revenue sharing configuration for paid plugins
 */
export const PluginRevenueSharingSchema = z.object({
  /**
   * Plugin ID
   */
  pluginId: z.string(),
  
  /**
   * Developer share percentage
   */
  developerShare: z.number().min(0).max(100).describe('Percentage going to developer'),
  
  /**
   * Platform share percentage
   */
  platformShare: z.number().min(0).max(100).describe('Percentage going to platform'),
  
  /**
   * Payment schedule
   */
  paymentSchedule: z.enum(['monthly', 'quarterly', 'annually']).default('monthly'),
  
  /**
   * Minimum payout threshold (in cents)
   */
  minimumPayout: z.number().int().min(0).default(10000).describe('Minimum $100 default'),
  
  /**
   * Payment method
   */
  paymentMethod: z.object({
    type: z.enum(['bank-transfer', 'paypal', 'stripe', 'other']),
    details: z.record(z.string(), z.any()).optional(),
  }),
  
  /**
   * Tax information
   */
  taxInfo: z.object({
    taxId: z.string().optional(),
    country: z.string(),
    taxExempt: z.boolean().default(false),
  }).optional(),
});

// Export types
export type RegistrySyncPolicy = z.infer<typeof RegistrySyncPolicySchema>;
export type RegistryUpstream = z.infer<typeof RegistryUpstreamSchema>;
export type RegistryConfig = z.infer<typeof RegistryConfigSchema>;
export type PluginCategory = z.infer<typeof PluginCategorySchema>;
export type PluginTag = z.infer<typeof PluginTagSchema>;
export type PluginRating = z.infer<typeof PluginRatingSchema>;
export type MarketplaceQualityMetrics = z.infer<typeof MarketplaceQualityMetricsSchema>;
export type PluginCertification = z.infer<typeof PluginCertificationSchema>;
export type PluginLicense = z.infer<typeof PluginLicenseSchema>;
export type PluginMarketplaceListing = z.infer<typeof PluginMarketplaceListingSchema>;
export type PluginSearchQuery = z.infer<typeof PluginSearchQuerySchema>;
export type PluginInstallationRequest = z.infer<typeof PluginInstallationRequestSchema>;
export type PluginInstallationStatus = z.infer<typeof PluginInstallationStatusSchema>;
export type PluginRevenueSharing = z.infer<typeof PluginRevenueSharingSchema>;
