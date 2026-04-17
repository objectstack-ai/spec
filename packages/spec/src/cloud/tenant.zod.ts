// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Multi-Tenant Architecture Schema
 *
 * Defines the schema for managing multi-tenant architecture with:
 * - Global control plane: Single database for auth, org management, tenant registry
 * - Tenant data plane: Isolated databases per organization with flexible driver selection
 *
 * Design decisions:
 * - Database naming: UUID-based (not org-slug, since slugs can be modified)
 * - Each organization can choose its own database driver (Turso, Memory, SQL, etc.)
 * - Global database stores user auth, organizations, and tenant metadata
 * - Supports development (memory), production (Turso), and enterprise (SQL) scenarios
 */

/**
 * Tenant Database Status
 */
export const TenantDatabaseStatusSchema = z.enum([
  'provisioning',  // Database is being created
  'active',        // Database is active and accepting connections
  'suspended',     // Database is suspended (read-only or inaccessible)
  'archived',      // Database is archived (data preserved but not accessible)
  'failed',        // Provisioning or migration failed
]);

export type TenantDatabaseStatus = z.infer<typeof TenantDatabaseStatusSchema>;

/**
 * Tenant Plan Tier
 */
export const TenantPlanSchema = z.enum([
  'free',
  'starter',
  'pro',
  'enterprise',
  'custom',
]);

export type TenantPlan = z.infer<typeof TenantPlanSchema>;

/**
 * Organization Database Driver Type
 *
 * Specifies which driver implementation to use for the organization's data storage.
 */
export const OrganizationDatabaseDriverSchema = z.enum([
  'turso',        // Turso/LibSQL driver (cloud-native, edge-ready)
  'memory',       // In-memory driver (dev/test only, data lost on restart)
  'sql',          // Generic SQL driver (PostgreSQL, MySQL, MariaDB, MSSQL)
  'sqlite',       // SQLite file-based driver (local development)
  'custom',       // Custom driver implementation
]);

export type OrganizationDatabaseDriver = z.infer<typeof OrganizationDatabaseDriverSchema>;

/**
 * Driver Configuration Schemas
 *
 * Each driver type has its own configuration structure.
 * Uses discriminated union for type-safe driver config.
 */

/** Turso Driver Configuration */
export const TursoDriverConfigSchema = z.object({
  driver: z.literal('turso'),
  databaseUrl: z.string().url().describe('Turso database URL'),
  authToken: z.string().describe('Turso auth token'),
  region: z.string().optional().describe('Deployment region'),
  syncUrl: z.string().url().optional().describe('Sync URL for embedded replicas'),
});

/** Memory Driver Configuration */
export const MemoryDriverConfigSchema = z.object({
  driver: z.literal('memory'),
  persistent: z.boolean().default(false).describe('Enable persistence to disk'),
  dataFile: z.string().optional().describe('File path for persistent storage'),
});

/** SQL Driver Configuration */
export const SQLDriverConfigSchema = z.object({
  driver: z.literal('sql'),
  dialect: z.enum(['postgresql', 'mysql', 'mariadb', 'mssql']).describe('SQL dialect'),
  host: z.string().describe('Database host'),
  port: z.number().int().positive().describe('Database port'),
  database: z.string().describe('Database name'),
  username: z.string().describe('Database username'),
  password: z.string().describe('Database password'),
  ssl: z.boolean().optional().describe('Enable SSL connection'),
  pool: z.object({
    min: z.number().int().optional(),
    max: z.number().int().optional(),
  }).optional().describe('Connection pool configuration'),
});

/** SQLite Driver Configuration */
export const SQLiteDriverConfigSchema = z.object({
  driver: z.literal('sqlite'),
  filename: z.string().describe('SQLite database file path'),
  readonly: z.boolean().optional().describe('Open database in readonly mode'),
});

/** Custom Driver Configuration */
export const CustomDriverConfigSchema = z.object({
  driver: z.literal('custom'),
  driverName: z.string().describe('Custom driver identifier'),
  config: z.record(z.string(), z.unknown()).describe('Driver-specific configuration'),
});

/**
 * Driver Configuration (Discriminated Union)
 *
 * Type-safe union of all supported driver configurations.
 * The 'driver' field discriminates which config structure to use.
 */
export const DriverConfigSchema = z.discriminatedUnion('driver', [
  TursoDriverConfigSchema,
  MemoryDriverConfigSchema,
  SQLDriverConfigSchema,
  SQLiteDriverConfigSchema,
  CustomDriverConfigSchema,
]);

export type DriverConfig = z.infer<typeof DriverConfigSchema>;
export type TursoDriverConfig = z.infer<typeof TursoDriverConfigSchema>;
export type MemoryDriverConfig = z.infer<typeof MemoryDriverConfigSchema>;
export type SQLDriverConfig = z.infer<typeof SQLDriverConfigSchema>;
export type SQLiteDriverConfig = z.infer<typeof SQLiteDriverConfigSchema>;
export type CustomDriverConfig = z.infer<typeof CustomDriverConfigSchema>;

/**
 * Tenant Database Registry Entry
 *
 * Tracks each tenant's database configuration.
 * Stored in the global control plane database.
 *
 * Now supports multiple driver types instead of hardcoded Turso configuration.
 */
export const TenantDatabaseSchema = z.object({
  /**
   * Unique tenant database identifier (UUID)
   */
  id: z.string().uuid().describe('Unique tenant database identifier (UUID)'),

  /**
   * Organization ID (foreign key to sys_organization)
   */
  organizationId: z.string().describe('Organization ID (foreign key to sys_organization)'),

  /**
   * Driver Configuration
   *
   * Specifies which database driver to use and its configuration.
   * Replaces hardcoded Turso fields for flexibility.
   */
  driverConfig: DriverConfigSchema.describe('Database driver configuration'),

  /**
   * Database provisioning and runtime status
   */
  status: TenantDatabaseStatusSchema.default('provisioning').describe('Database status'),

  /**
   * Tenant plan tier
   */
  plan: TenantPlanSchema.default('free').describe('Tenant plan tier'),

  /**
   * Storage limit in megabytes
   */
  storageLimitMb: z.number().int().positive().describe('Storage limit in megabytes'),

  /**
   * Database creation timestamp
   */
  createdAt: z.string().datetime().describe('Database creation timestamp'),

  /**
   * Last update timestamp
   */
  updatedAt: z.string().datetime().describe('Last update timestamp'),

  /**
   * Last accessed timestamp (for usage tracking)
   */
  lastAccessedAt: z.string().datetime().optional().describe('Last accessed timestamp'),

  /**
   * Custom tenant configuration
   * Can store additional metadata like feature flags, quotas, etc.
   */
  metadata: z.record(z.string(), z.unknown()).optional().describe('Custom tenant configuration'),
});

export type TenantDatabase = z.infer<typeof TenantDatabaseSchema>;

/**
 * Package Installation Status
 */
export const PackageInstallationStatusSchema = z.enum([
  'installing',    // Package is being installed
  'active',        // Package is active and running
  'disabled',      // Package is disabled (soft delete)
  'uninstalling',  // Package is being uninstalled
  'failed',        // Installation failed
]);

export type PackageInstallationStatus = z.infer<typeof PackageInstallationStatusSchema>;

/**
 * Package Installation Record
 *
 * Tracks which packages are installed in which tenant.
 * Stored in the global control plane database.
 */
export const PackageInstallationSchema = z.object({
  /**
   * Unique installation identifier
   */
  id: z.string().uuid().describe('Unique installation identifier'),

  /**
   * Tenant database ID (foreign key to tenant_database)
   */
  tenantId: z.string().uuid().describe('Tenant database ID'),

  /**
   * Package identifier
   * Example: "@objectstack/crm", "@acme/custom-plugin"
   */
  packageId: z.string().describe('Package identifier'),

  /**
   * Installed package version (semver)
   */
  version: z.string().describe('Installed package version'),

  /**
   * Installation status
   */
  status: PackageInstallationStatusSchema.default('installing').describe('Installation status'),

  /**
   * Installation timestamp
   */
  installedAt: z.string().datetime().describe('Installation timestamp'),

  /**
   * User ID who installed the package
   */
  installedBy: z.string().describe('User ID who installed the package'),

  /**
   * Package-specific configuration
   */
  config: z.record(z.string(), z.unknown()).optional().describe('Package-specific configuration'),

  /**
   * Last update timestamp
   */
  updatedAt: z.string().datetime().describe('Last update timestamp'),
});

export type PackageInstallation = z.infer<typeof PackageInstallationSchema>;

/**
 * Tenant Context
 *
 * Runtime context containing current tenant information.
 * Extracted from request (subdomain, header, JWT claim, etc.)
 */
export const TenantContextSchema = z.object({
  /**
   * Current tenant database ID
   */
  tenantId: z.string().uuid().describe('Current tenant database ID'),

  /**
   * Current organization ID
   */
  organizationId: z.string().describe('Current organization ID'),

  /**
   * Organization slug (for display purposes)
   */
  organizationSlug: z.string().optional().describe('Organization slug'),

  /**
   * Tenant database URL
   */
  databaseUrl: z.string().url().describe('Tenant database URL'),

  /**
   * Tenant plan tier
   */
  plan: TenantPlanSchema.describe('Tenant plan tier'),

  /**
   * Custom tenant metadata
   */
  metadata: z.record(z.string(), z.unknown()).optional().describe('Custom tenant metadata'),
});

export type TenantContext = z.infer<typeof TenantContextSchema>;

/**
 * Tenant Identification Source
 *
 * How the tenant was identified from the request
 */
export const TenantIdentificationSourceSchema = z.enum([
  'subdomain',       // Extracted from subdomain (e.g., acme.objectstack.app)
  'custom_domain',   // Extracted from custom domain (e.g., app.acme.com)
  'header',          // Extracted from X-Tenant-ID header
  'jwt_claim',       // Extracted from JWT organizationId claim
  'session',         // Extracted from session data
  'default',         // Default/fallback tenant
]);

export type TenantIdentificationSource = z.infer<typeof TenantIdentificationSourceSchema>;

/**
 * Tenant Routing Configuration
 *
 * Configuration for tenant identification and routing
 */
export const TenantRoutingConfigSchema = z.object({
  /**
   * Enable multi-tenant mode
   */
  enabled: z.boolean().default(false).describe('Enable multi-tenant mode'),

  /**
   * Tenant identification strategy (in order of precedence)
   */
  identificationSources: z.array(TenantIdentificationSourceSchema)
    .default(['subdomain', 'header', 'jwt_claim'])
    .describe('Tenant identification strategy (in order of precedence)'),

  /**
   * Default tenant ID (for single-tenant deployments or fallback)
   */
  defaultTenantId: z.string().uuid().optional().describe('Default tenant ID'),

  /**
   * Subdomain pattern for tenant extraction
   * Example: "{tenant}.objectstack.app"
   */
  subdomainPattern: z.string().optional().describe('Subdomain pattern for tenant extraction'),

  /**
   * Custom domain mapping
   * Maps custom domains to tenant IDs
   * Example: { "app.acme.com": "550e8400-e29b-41d4-a716-446655440000" }
   */
  customDomainMapping: z.record(z.string(), z.string().uuid()).optional()
    .describe('Custom domain to tenant ID mapping'),

  /**
   * Header name for tenant ID
   */
  tenantHeaderName: z.string().default('X-Tenant-ID').describe('Header name for tenant ID'),

  /**
   * JWT claim name for organization ID
   */
  jwtOrganizationClaim: z.string().default('organizationId')
    .describe('JWT claim name for organization ID'),
});

export type TenantRoutingConfig = z.infer<typeof TenantRoutingConfigSchema>;

/**
 * Tenant Provisioning Request
 *
 * Request to provision a new organization database with flexible driver selection.
 */
export const ProvisionTenantRequestSchema = z.object({
  /**
   * Organization ID to provision database for
   */
  organizationId: z.string().describe('Organization ID'),

  /**
   * Driver Configuration
   *
   * Specifies which database driver to use and its configuration.
   */
  driverConfig: DriverConfigSchema.describe('Database driver configuration'),

  /**
   * Tenant plan tier
   */
  plan: TenantPlanSchema.default('free').describe('Tenant plan tier'),

  /**
   * Storage limit in megabytes
   */
  storageLimitMb: z.number().int().positive().optional().describe('Storage limit in megabytes'),

  /**
   * Custom tenant metadata
   */
  metadata: z.record(z.string(), z.unknown()).optional().describe('Custom tenant metadata'),
});

export type ProvisionTenantRequest = z.infer<typeof ProvisionTenantRequestSchema>;

/**
 * Tenant Provisioning Response
 *
 * Result of tenant provisioning operation
 */
export const ProvisionTenantResponseSchema = z.object({
  /**
   * Provisioned tenant database
   */
  tenant: TenantDatabaseSchema.describe('Provisioned tenant database'),

  /**
   * Provisioning duration in milliseconds
   */
  durationMs: z.number().describe('Provisioning duration in milliseconds'),

  /**
   * Any warnings or notes from provisioning
   */
  warnings: z.array(z.string()).optional().describe('Provisioning warnings'),
});

export type ProvisionTenantResponse = z.infer<typeof ProvisionTenantResponseSchema>;
