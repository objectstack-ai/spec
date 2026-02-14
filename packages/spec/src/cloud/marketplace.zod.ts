// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * # Marketplace Protocol
 * 
 * Defines the core schemas for the plugin marketplace ecosystem, covering:
 * - **Developer Side**: Package publishing, submission, and version releases
 * - **Platform Side**: Marketplace listing, review, approval, and discovery
 * 
 * This protocol defines the contract between plugin developers, the marketplace
 * platform, and customers who install plugins.
 * 
 * ## Architecture Alignment
 * - **Salesforce AppExchange**: Security review, managed packages, listing profiles
 * - **VS Code Marketplace**: Extension publishing, ratings, verified publishers
 * - **npm Registry**: Package publishing, versioning, scoped packages
 * - **Shopify App Store**: App review process, billing integration, merchant installs
 * 
 * ## Developer Publishing Flow
 * ```
 * 1. Develop   → Build plugin locally using ObjectStack CLI
 * 2. Validate  → Run `os plugin validate` (schema + security checks)
 * 3. Build     → Run `os plugin build` (bundle + sign)
 * 4. Submit    → Run `os plugin publish` (submit to marketplace)
 * 5. Review    → Platform conducts automated + manual review
 * 6. Publish   → Approved listing goes live on marketplace
 * ```
 * 
 * ## Platform Management Flow
 * ```
 * 1. Receive   → Accept submissions from verified publishers
 * 2. Scan      → Automated security scan and compatibility check
 * 3. Review    → Human review for quality and policy compliance
 * 4. Catalog   → Index in marketplace search catalog
 * 5. Monitor   → Track installs, ratings, issues, and enforce SLAs
 * ```
 */

// ==========================================
// Publisher Identity
// ==========================================

/**
 * Publisher Verification Status
 */
export const PublisherVerificationSchema = z.enum([
  'unverified',  // Not yet verified
  'pending',     // Verification in progress
  'verified',    // Identity verified by platform
  'trusted',     // Trusted publisher (track record of quality)
  'partner',     // Official platform partner
]);

/**
 * Publisher Schema
 * Represents a developer or organization that publishes packages.
 */
export const PublisherSchema = z.object({
  /** Publisher unique identifier */
  id: z.string().describe('Publisher ID'),

  /** Display name */
  name: z.string().describe('Publisher display name'),

  /** Publisher type */
  type: z.enum(['individual', 'organization']).describe('Publisher type'),

  /** Verification status */
  verification: PublisherVerificationSchema.default('unverified'),

  /** Contact email */
  email: z.string().email().optional().describe('Contact email'),

  /** Website URL */
  website: z.string().url().optional().describe('Publisher website'),

  /** Organization logo URL */
  logoUrl: z.string().url().optional().describe('Publisher logo URL'),

  /** Short description/bio */
  description: z.string().optional().describe('Publisher description'),

  /** Registration date */
  registeredAt: z.string().datetime().optional(),
});

// ==========================================
// Marketplace Listing
// ==========================================

/**
 * Marketplace Category
 */
export const MarketplaceCategorySchema = z.enum([
  'crm',             // Customer Relationship Management
  'erp',             // Enterprise Resource Planning
  'hr',              // Human Resources
  'finance',         // Finance & Accounting
  'project',         // Project Management
  'collaboration',   // Collaboration & Communication
  'analytics',       // Analytics & Reporting
  'integration',     // Integrations & Connectors
  'automation',      // Automation & Workflows
  'ai',              // AI & Machine Learning
  'security',        // Security & Compliance
  'developer-tools', // Developer Tools
  'ui-theme',        // UI Themes & Appearance
  'storage',         // Storage & Drivers
  'other',           // Other / Uncategorized
]);

/**
 * Listing Status
 */
export const ListingStatusSchema = z.enum([
  'draft',           // Not yet submitted
  'submitted',       // Submitted for review
  'in-review',       // Under review
  'approved',        // Approved, ready to publish
  'published',       // Live on marketplace
  'rejected',        // Review rejected
  'suspended',       // Suspended by platform (policy violation)
  'deprecated',      // Deprecated by publisher
  'unlisted',        // Available by direct link only
]);

/**
 * Pricing Model
 */
export const PricingModelSchema = z.enum([
  'free',            // Free to install
  'freemium',        // Free with paid premium features
  'paid',            // Requires purchase
  'subscription',    // Recurring subscription
  'usage-based',     // Pay per usage
  'contact-sales',   // Enterprise pricing, contact for quote
]);

/**
 * Marketplace Listing Schema
 * 
 * The public-facing profile of a package on the marketplace.
 * Contains marketing information, pricing, and installation metadata.
 */
export const MarketplaceListingSchema = z.object({
  /** Listing ID (matches package ID) */
  id: z.string().describe('Listing ID (matches package manifest ID)'),

  /** Package ID (reverse domain notation) */
  packageId: z.string().describe('Package identifier'),

  /** Publisher information */
  publisherId: z.string().describe('Publisher ID'),

  /** Current listing status */
  status: ListingStatusSchema.default('draft'),

  /** Display name */
  name: z.string().describe('Display name'),

  /** Tagline (short description for cards/search results) */
  tagline: z.string().max(120).optional().describe('Short tagline (max 120 chars)'),

  /** Full description (supports Markdown) */
  description: z.string().optional().describe('Full description (Markdown)'),

  /** Category */
  category: MarketplaceCategorySchema,

  /** Additional tags for search discovery */
  tags: z.array(z.string()).optional().describe('Search tags'),

  /** Icon/logo URL */
  iconUrl: z.string().url().optional().describe('Package icon URL'),

  /** Screenshot URLs */
  screenshots: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
  })).optional().describe('Screenshots'),

  /** Documentation URL */
  documentationUrl: z.string().url().optional(),

  /** Support URL */
  supportUrl: z.string().url().optional(),

  /** Source repository URL (if open source) */
  repositoryUrl: z.string().url().optional(),

  /** Pricing model */
  pricing: PricingModelSchema.default('free'),

  /** Price in cents (if paid) */
  priceInCents: z.number().int().min(0).optional()
    .describe('Price in cents (e.g. 999 = $9.99)'),

  /** Latest published version */
  latestVersion: z.string().describe('Latest published version'),

  /** Minimum platform version required */
  minPlatformVersion: z.string().optional()
    .describe('Minimum ObjectStack platform version'),

  /** Available versions for installation */
  versions: z.array(z.object({
    version: z.string(),
    releaseDate: z.string().datetime(),
    releaseNotes: z.string().optional(),
    minPlatformVersion: z.string().optional(),
    deprecated: z.boolean().default(false),
  })).optional().describe('Published versions'),

  /** Aggregate statistics */
  stats: z.object({
    totalInstalls: z.number().int().min(0).default(0),
    activeInstalls: z.number().int().min(0).default(0),
    averageRating: z.number().min(0).max(5).optional(),
    totalRatings: z.number().int().min(0).default(0),
    totalReviews: z.number().int().min(0).default(0),
  }).optional().describe('Aggregate marketplace statistics'),

  /**
   * Preview / Demo Mode Configuration.
   * Allows customers to browse package content (objects, views, sample data)
   * without registration or login. Analogous to Salesforce AppExchange
   * "Test Drive" or Shopify App Store live demo.
   */
  preview: z.object({
    /** Whether preview mode is enabled for this listing */
    enabled: z.boolean().default(false)
      .describe('Whether preview mode is available for this listing'),

    /** External demo URL (e.g., hosted sandbox instance) */
    demoUrl: z.string().url().optional()
      .describe('External demo URL for live preview'),

    /**
     * Which content types are visible in preview mode.
     * Allows publishers to control what prospective customers can see
     * before installing.
     */
    includedContent: z.array(z.enum([
      'objects',       // Object definitions (fields, relationships)
      'views',         // List and form view definitions
      'dashboards',    // Dashboard layouts
      'flows',         // Automation flow definitions
      'sample_data',   // Seed/demo data
      'navigation',    // App navigation structure
    ])).optional()
      .describe('Content types visible in preview mode'),

    /** Preview expiration duration in seconds (0 = no expiration) */
    expiresInSeconds: z.number().int().min(0).optional()
      .describe('Preview session duration in seconds (0 or omitted = no expiration)'),
  }).optional().describe('Preview/demo mode configuration'),

  /** First published date */
  publishedAt: z.string().datetime().optional(),

  /** Last updated date */
  updatedAt: z.string().datetime().optional(),
});

// ==========================================
// Package Submission & Review
// ==========================================

/**
 * Package Submission Schema
 * A developer's submission of a package version for marketplace review.
 */
export const PackageSubmissionSchema = z.object({
  /** Submission ID */
  id: z.string().describe('Submission ID'),

  /** Package ID */
  packageId: z.string().describe('Package identifier'),

  /** Version being submitted */
  version: z.string().describe('Version being submitted'),

  /** Publisher ID */
  publisherId: z.string().describe('Publisher submitting'),

  /** Submission status */
  status: z.enum([
    'pending',        // Awaiting review
    'scanning',       // Automated scan in progress
    'in-review',      // Under manual review
    'changes-requested', // Reviewer requests changes
    'approved',       // Approved for publishing
    'rejected',       // Rejected
  ]).default('pending'),

  /**
   * Package artifact URL or reference.
   * Points to the built package bundle for review.
   */
  artifactUrl: z.string().describe('Package artifact URL for review'),

  /** Release notes for this version */
  releaseNotes: z.string().optional(),

  /** Whether this is the first submission (new listing) vs version update */
  isNewListing: z.boolean().default(false),

  /** Automated scan results */
  scanResults: z.object({
    /** Whether automated scan passed */
    passed: z.boolean(),
    /** Security scan score (0-100) */
    securityScore: z.number().min(0).max(100).optional(),
    /** Compatibility check passed */
    compatibilityCheck: z.boolean().optional(),
    /** Issues found during scan */
    issues: z.array(z.object({
      severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
      message: z.string(),
      file: z.string().optional(),
      line: z.number().optional(),
    })).optional(),
  }).optional().describe('Automated scan results'),

  /** Reviewer notes (from platform reviewer) */
  reviewerNotes: z.string().optional(),

  /** Submitted timestamp */
  submittedAt: z.string().datetime().optional(),

  /** Review completed timestamp */
  reviewedAt: z.string().datetime().optional(),
});

// ==========================================
// Marketplace Search & Discovery
// ==========================================

/**
 * Marketplace Search Request
 */
export const MarketplaceSearchRequestSchema = z.object({
  /** Search query string */
  query: z.string().optional().describe('Full-text search query'),

  /** Filter by category */
  category: MarketplaceCategorySchema.optional(),

  /** Filter by tags */
  tags: z.array(z.string()).optional(),

  /** Filter by pricing model */
  pricing: PricingModelSchema.optional(),

  /** Filter by publisher verification level */
  publisherVerification: PublisherVerificationSchema.optional(),

  /** Sort by */
  sortBy: z.enum([
    'relevance',    // Best match (default for search)
    'popularity',   // Most installs
    'rating',       // Highest rated
    'newest',       // Most recently published
    'updated',      // Most recently updated
    'name',         // Alphabetical
  ]).default('relevance'),

  /** Sort direction */
  sortDirection: z.enum(['asc', 'desc']).default('desc'),

  /** Pagination: page number */
  page: z.number().int().min(1).default(1),

  /** Pagination: items per page */
  pageSize: z.number().int().min(1).max(100).default(20),

  /** Filter by minimum platform version compatibility */
  platformVersion: z.string().optional()
    .describe('Filter by platform version compatibility'),
});

/**
 * Marketplace Search Response
 */
export const MarketplaceSearchResponseSchema = z.object({
  /** Search results */
  items: z.array(MarketplaceListingSchema),

  /** Total count (for pagination) */
  total: z.number().int().min(0),

  /** Current page */
  page: z.number().int().min(1),

  /** Items per page */
  pageSize: z.number().int().min(1),

  /** Facets for filtering */
  facets: z.object({
    categories: z.array(z.object({
      category: MarketplaceCategorySchema,
      count: z.number().int().min(0),
    })).optional(),
    pricing: z.array(z.object({
      model: PricingModelSchema,
      count: z.number().int().min(0),
    })).optional(),
  }).optional(),
});

// ==========================================
// Marketplace Install from Marketplace
// ==========================================

/**
 * Install from Marketplace Request
 * Extends the basic package install with marketplace-specific fields.
 */
export const MarketplaceInstallRequestSchema = z.object({
  /** Listing ID to install */
  listingId: z.string().describe('Marketplace listing ID'),

  /** Specific version to install (defaults to latest) */
  version: z.string().optional().describe('Version to install'),

  /** License key (for paid packages) */
  licenseKey: z.string().optional().describe('License key for paid packages'),

  /** User-provided settings at install time */
  settings: z.record(z.string(), z.unknown()).optional(),

  /** Whether to enable immediately after install */
  enableOnInstall: z.boolean().default(true),

  /** Tenant ID */
  tenantId: z.string().optional(),
});

/**
 * Install from Marketplace Response
 */
export const MarketplaceInstallResponseSchema = z.object({
  /** Whether installation was successful */
  success: z.boolean(),

  /** Installed package ID */
  packageId: z.string().optional(),

  /** Installed version */
  version: z.string().optional(),

  /** Human-readable message */
  message: z.string().optional(),
});

// ==========================================
// Export Types
// ==========================================

export type PublisherVerification = z.infer<typeof PublisherVerificationSchema>;
export type Publisher = z.infer<typeof PublisherSchema>;
export type MarketplaceCategory = z.infer<typeof MarketplaceCategorySchema>;
export type ListingStatus = z.infer<typeof ListingStatusSchema>;
export type PricingModel = z.infer<typeof PricingModelSchema>;
export type MarketplaceListing = z.infer<typeof MarketplaceListingSchema>;
export type PackageSubmission = z.infer<typeof PackageSubmissionSchema>;
export type MarketplaceSearchRequest = z.infer<typeof MarketplaceSearchRequestSchema>;
export type MarketplaceSearchResponse = z.infer<typeof MarketplaceSearchResponseSchema>;
export type MarketplaceInstallRequest = z.infer<typeof MarketplaceInstallRequestSchema>;
export type MarketplaceInstallResponse = z.infer<typeof MarketplaceInstallResponseSchema>;
