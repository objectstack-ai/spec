// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { PublisherVerificationSchema } from './marketplace.zod';

/**
 * # Developer Portal Protocol
 *
 * Defines schemas for the developer-facing side of the marketplace ecosystem.
 * Covers the complete developer journey:
 *
 * ```
 * Register → Create App → Develop → Validate → Build → Submit → Monitor → Iterate
 * ```
 *
 * ## Architecture Alignment
 * - **Salesforce Partner Portal**: ISV registration, AppExchange publishing, Trialforce
 * - **Shopify Partner Dashboard**: App management, analytics, billing
 * - **VS Code Marketplace Management**: Extension publishing, statistics, tokens
 *
 * ## Key Concepts
 * - **Developer Account**: Registration and API key management
 * - **App Listing Management**: CRUD for marketplace listings (draft → published)
 * - **Version Channels**: alpha / beta / rc / stable release channels
 * - **Publishing Analytics**: Install trends, revenue, ratings over time
 */

// ==========================================
// Developer Account & API Keys
// ==========================================

/**
 * Developer Account Status
 */
export const DeveloperAccountStatusSchema = z.enum([
  'pending',        // Registration submitted, awaiting approval
  'active',         // Account active and can publish
  'suspended',      // Temporarily suspended (policy violation)
  'deactivated',    // Deactivated by developer
]);

/**
 * API Key Scope — controls what the key can do
 */
export const ApiKeyScopeSchema = z.enum([
  'publish',        // Publish packages to registry
  'read',           // Read listing/analytics data
  'manage',         // Manage listings (update, deprecate)
  'admin',          // Full access (manage team, keys)
]);

/**
 * Developer API Key
 */
export const DeveloperApiKeySchema = z.object({
  /** Key identifier (not the secret) */
  id: z.string().describe('API key identifier'),

  /** Human-readable label */
  label: z.string().describe('Key label (e.g., "CI/CD Pipeline")'),

  /** Scopes granted to this key */
  scopes: z.array(ApiKeyScopeSchema).min(1).describe('Permissions granted'),

  /** Key prefix (first 8 chars) for identification */
  prefix: z.string().max(8).optional().describe('Key prefix for display'),

  /** Expiration date (optional) */
  expiresAt: z.string().datetime().optional(),

  /** Creation timestamp */
  createdAt: z.string().datetime(),

  /** Last used timestamp */
  lastUsedAt: z.string().datetime().optional(),

  /** Whether this key is currently active */
  active: z.boolean().default(true),
});

/**
 * Developer Account Schema
 *
 * Represents a registered developer or organization in the portal.
 */
export const DeveloperAccountSchema = z.object({
  /** Account unique identifier */
  id: z.string().describe('Developer account ID'),

  /** Publisher ID (links to PublisherSchema in marketplace) */
  publisherId: z.string().describe('Associated publisher ID'),

  /** Account status */
  status: DeveloperAccountStatusSchema.default('pending'),

  /** Verification level (from marketplace publisher) */
  verification: PublisherVerificationSchema.default('unverified'),

  /** Organization name */
  organizationName: z.string().describe('Organization or developer name'),

  /** Primary contact email */
  email: z.string().email().describe('Primary contact email'),

  /** Team members (user IDs with roles) */
  teamMembers: z.array(z.object({
    userId: z.string(),
    role: z.enum(['owner', 'admin', 'developer', 'viewer']),
    joinedAt: z.string().datetime().optional(),
  })).optional().describe('Team member list'),

  /** Accepted developer agreement version */
  agreementVersion: z.string().optional().describe('Accepted ToS version'),

  /** Registration timestamp */
  registeredAt: z.string().datetime(),
});

// ==========================================
// Version Channels & Release Management
// ==========================================

/**
 * Release Channel — allows pre-release distribution
 */
export const ReleaseChannelSchema = z.enum([
  'alpha',          // Early development, unstable
  'beta',           // Feature-complete, testing phase
  'rc',             // Release candidate, final testing
  'stable',         // Production-ready, general availability
]);

/**
 * Version Release Schema
 *
 * A single version release of a package with channel assignment.
 */
export const VersionReleaseSchema = z.object({
  /** Semver version string */
  version: z.string().describe('Semver version (e.g., 2.1.0-beta.1)'),

  /** Release channel */
  channel: ReleaseChannelSchema.default('stable'),

  /** Release notes (Markdown) */
  releaseNotes: z.string().optional().describe('Release notes (Markdown)'),

  /** Changelog entries (structured) */
  changelog: z.array(z.object({
    type: z.enum(['added', 'changed', 'fixed', 'removed', 'deprecated', 'security']),
    description: z.string(),
  })).optional().describe('Structured changelog entries'),

  /** Minimum platform version required */
  minPlatformVersion: z.string().optional(),

  /** Build artifact URL */
  artifactUrl: z.string().optional().describe('Built package artifact URL'),

  /** Artifact checksum (integrity) */
  artifactChecksum: z.string().optional().describe('SHA-256 checksum'),

  /** Whether this version is deprecated */
  deprecated: z.boolean().default(false),

  /** Deprecation message (if deprecated) */
  deprecationMessage: z.string().optional(),

  /** Release timestamp */
  releasedAt: z.string().datetime().optional(),
});

// ==========================================
// App Listing Management (Developer CRUD)
// ==========================================

/**
 * Create Listing Request — developer creates a new marketplace listing
 */
export const CreateListingRequestSchema = z.object({
  /** Package ID (reverse domain, e.g., com.acme.crm) */
  packageId: z.string().describe('Package identifier'),

  /** Display name */
  name: z.string().describe('App display name'),

  /** Short tagline (max 120 chars) */
  tagline: z.string().max(120).optional(),

  /** Full description (Markdown) */
  description: z.string().optional(),

  /** Category */
  category: z.string().describe('Marketplace category'),

  /** Additional tags */
  tags: z.array(z.string()).optional(),

  /** Icon URL */
  iconUrl: z.string().url().optional(),

  /** Screenshots */
  screenshots: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
  })).optional(),

  /** Documentation URL */
  documentationUrl: z.string().url().optional(),

  /** Support URL */
  supportUrl: z.string().url().optional(),

  /** Source repository URL */
  repositoryUrl: z.string().url().optional(),

  /** Pricing model */
  pricing: z.enum([
    'free', 'freemium', 'paid', 'subscription', 'usage-based', 'contact-sales',
  ]).default('free'),

  /** Price in cents (if paid) */
  priceInCents: z.number().int().min(0).optional(),
});

/**
 * Update Listing Request — developer updates listing metadata
 */
export const UpdateListingRequestSchema = z.object({
  /** Listing ID */
  listingId: z.string().describe('Listing ID to update'),

  /** Updatable fields (all optional, partial update) */
  name: z.string().optional(),
  tagline: z.string().max(120).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  iconUrl: z.string().url().optional(),
  screenshots: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
  })).optional(),
  documentationUrl: z.string().url().optional(),
  supportUrl: z.string().url().optional(),
  repositoryUrl: z.string().url().optional(),
  pricing: z.enum([
    'free', 'freemium', 'paid', 'subscription', 'usage-based', 'contact-sales',
  ]).optional(),
  priceInCents: z.number().int().min(0).optional(),
});

/**
 * Listing Action Request — lifecycle actions on a listing
 */
export const ListingActionRequestSchema = z.object({
  /** Listing ID */
  listingId: z.string().describe('Listing ID'),

  /** Action to perform */
  action: z.enum([
    'submit',         // Submit for review
    'unlist',         // Remove from public search (keep accessible by direct link)
    'deprecate',      // Mark as deprecated
    'reactivate',     // Reactivate unlisted/deprecated listing
  ]).describe('Action to perform on listing'),

  /** Reason for action (e.g., deprecation message) */
  reason: z.string().optional(),
});

// ==========================================
// Publishing Analytics (Developer Dashboard)
// ==========================================

/**
 * Analytics Time Range
 */
export const AnalyticsTimeRangeSchema = z.enum([
  'last_7d',
  'last_30d',
  'last_90d',
  'last_365d',
  'all_time',
]);

/**
 * Publishing Analytics Request
 */
export const PublishingAnalyticsRequestSchema = z.object({
  /** Listing ID */
  listingId: z.string().describe('Listing to get analytics for'),

  /** Time range */
  timeRange: AnalyticsTimeRangeSchema.default('last_30d'),

  /** Metrics to include */
  metrics: z.array(z.enum([
    'installs',       // Install count over time
    'uninstalls',     // Uninstall count over time
    'active_installs', // Active install trend
    'ratings',        // Rating distribution
    'revenue',        // Revenue (for paid apps)
    'page_views',     // Listing page views
  ])).optional().describe('Metrics to include (default: all)'),
});

/**
 * Time Series Data Point
 */
export const TimeSeriesPointSchema = z.object({
  /** ISO date string (day granularity) */
  date: z.string(),
  /** Metric value */
  value: z.number(),
});

/**
 * Publishing Analytics Response
 */
export const PublishingAnalyticsResponseSchema = z.object({
  /** Listing ID */
  listingId: z.string(),

  /** Time range */
  timeRange: AnalyticsTimeRangeSchema,

  /** Summary statistics */
  summary: z.object({
    totalInstalls: z.number().int().min(0),
    activeInstalls: z.number().int().min(0),
    totalUninstalls: z.number().int().min(0),
    averageRating: z.number().min(0).max(5).optional(),
    totalRatings: z.number().int().min(0),
    totalRevenue: z.number().min(0).optional().describe('Revenue in cents'),
    pageViews: z.number().int().min(0),
  }),

  /** Time series data by metric */
  timeSeries: z.record(z.string(), z.array(TimeSeriesPointSchema)).optional()
    .describe('Time series keyed by metric name'),

  /** Rating distribution (1-5 stars) */
  ratingDistribution: z.object({
    1: z.number().int().min(0).default(0),
    2: z.number().int().min(0).default(0),
    3: z.number().int().min(0).default(0),
    4: z.number().int().min(0).default(0),
    5: z.number().int().min(0).default(0),
  }).optional(),
});

// ==========================================
// Export Types
// ==========================================

export type DeveloperAccountStatus = z.infer<typeof DeveloperAccountStatusSchema>;
export type ApiKeyScope = z.infer<typeof ApiKeyScopeSchema>;
export type DeveloperApiKey = z.infer<typeof DeveloperApiKeySchema>;
export type DeveloperAccount = z.infer<typeof DeveloperAccountSchema>;
export type ReleaseChannel = z.infer<typeof ReleaseChannelSchema>;
export type VersionRelease = z.infer<typeof VersionReleaseSchema>;
export type CreateListingRequest = z.infer<typeof CreateListingRequestSchema>;
export type UpdateListingRequest = z.infer<typeof UpdateListingRequestSchema>;
export type ListingActionRequest = z.infer<typeof ListingActionRequestSchema>;
export type AnalyticsTimeRange = z.infer<typeof AnalyticsTimeRangeSchema>;
export type PublishingAnalyticsRequest = z.infer<typeof PublishingAnalyticsRequestSchema>;
export type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>;
export type PublishingAnalyticsResponse = z.infer<typeof PublishingAnalyticsResponseSchema>;
