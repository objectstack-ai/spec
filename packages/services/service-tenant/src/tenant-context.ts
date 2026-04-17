// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type {
  TenantContext,
  TenantIdentificationSource,
  TenantRoutingConfig,
  TenantDatabase,
} from '@objectstack/spec/cloud';
import type { IDataDriver } from '@objectstack/spec';
import { DriverFactory, type DriverFactoryConfig } from './driver-factory.js';

/**
 * Tenant Context Service Configuration
 */
export interface TenantContextServiceConfig extends TenantRoutingConfig {
  /**
   * Driver factory for creating driver instances
   */
  driverFactory?: DriverFactory;

  /**
   * Driver factory configuration (if driverFactory not provided)
   */
  driverFactoryConfig?: DriverFactoryConfig;

  /**
   * Control plane driver for querying tenant database records
   */
  controlPlaneDriver?: IDataDriver;
}

/**
 * Tenant Context Service
 *
 * Manages tenant identification and context resolution from HTTP requests.
 * Supports multiple identification strategies and runtime driver resolution.
 */
export class TenantContextService {
  private config: TenantContextServiceConfig;
  private tenantCache = new Map<string, TenantContext>();
  private tenantDbCache = new Map<string, TenantDatabase>();
  private driverFactory: DriverFactory;

  constructor(config: TenantContextServiceConfig) {
    this.config = config;

    // Initialize driver factory
    this.driverFactory =
      config.driverFactory ||
      new DriverFactory(config.driverFactoryConfig || {});
  }

  /**
   * Extract tenant context from request
   *
   * @param request - HTTP request object with headers, hostname, etc.
   * @returns Tenant context or null if multi-tenant is disabled
   */
  async resolveTenantContext(request: {
    hostname?: string;
    headers?: Record<string, string | string[] | undefined>;
    session?: { organizationId?: string };
    jwt?: Record<string, unknown>;
  }): Promise<TenantContext | null> {
    if (!this.config.enabled) {
      return null;
    }

    // Try each identification source in order of precedence
    for (const source of this.config.identificationSources) {
      const tenantId = await this.extractTenantId(request, source);
      if (tenantId) {
        return this.getTenantContextById(tenantId, source);
      }
    }

    // Fallback to default tenant if configured
    if (this.config.defaultTenantId) {
      return this.getTenantContextById(this.config.defaultTenantId, 'default');
    }

    return null;
  }

  /**
   * Extract tenant ID from request using specific identification source
   */
  private async extractTenantId(
    request: {
      hostname?: string;
      headers?: Record<string, string | string[] | undefined>;
      session?: { organizationId?: string };
      jwt?: Record<string, unknown>;
    },
    source: TenantIdentificationSource,
  ): Promise<string | null> {
    switch (source) {
      case 'subdomain':
        return this.extractFromSubdomain(request.hostname);

      case 'custom_domain':
        return this.extractFromCustomDomain(request.hostname);

      case 'header':
        return this.extractFromHeader(request.headers);

      case 'jwt_claim':
        return this.extractFromJWT(request.jwt);

      case 'session':
        return this.extractFromSession(request.session);

      case 'default':
        return this.config.defaultTenantId || null;

      default:
        return null;
    }
  }

  /**
   * Extract tenant from subdomain
   * Example: "acme.objectstack.app" -> resolve to tenant with org slug "acme"
   */
  private extractFromSubdomain(hostname?: string): string | null {
    if (!hostname || !this.config.subdomainPattern) {
      return null;
    }

    // Extract tenant slug from subdomain
    // Pattern: "{tenant}.objectstack.app"
    const parts = hostname.split('.');
    if (parts.length < 2) {
      return null;
    }

    const tenantSlug = parts[0];
    // In real implementation, lookup tenant ID by organization slug
    // For now, return null (needs database integration)
    return null;
  }

  /**
   * Extract tenant from custom domain mapping
   * Example: "app.acme.com" -> "550e8400-e29b-41d4-a716-446655440000"
   */
  private extractFromCustomDomain(hostname?: string): string | null {
    if (!hostname || !this.config.customDomainMapping) {
      return null;
    }

    return this.config.customDomainMapping[hostname] || null;
  }

  /**
   * Extract tenant from HTTP header
   */
  private extractFromHeader(headers?: Record<string, string | string[] | undefined>): string | null {
    if (!headers) {
      return null;
    }

    const headerValue = headers[this.config.tenantHeaderName];
    if (typeof headerValue === 'string') {
      return headerValue;
    }

    if (Array.isArray(headerValue) && headerValue.length > 0) {
      return headerValue[0];
    }

    return null;
  }

  /**
   * Extract tenant from JWT claim
   */
  private extractFromJWT(jwt?: Record<string, unknown>): string | null {
    if (!jwt) {
      return null;
    }

    const organizationId = jwt[this.config.jwtOrganizationClaim];
    if (typeof organizationId === 'string') {
      // In real implementation, lookup tenant ID by organization ID
      // For now, return the organization ID as tenant ID
      return organizationId;
    }

    return null;
  }

  /**
   * Extract tenant from session
   */
  private extractFromSession(session?: { organizationId?: string }): string | null {
    if (!session?.organizationId) {
      return null;
    }

    // In real implementation, lookup tenant ID by organization ID
    // For now, return the organization ID as tenant ID
    return session.organizationId;
  }

  /**
   * Get tenant context by ID
   * In real implementation, this would query the global database
   * for tenant registry information
   */
  private async getTenantContextById(
    tenantId: string,
    source: TenantIdentificationSource,
  ): Promise<TenantContext | null> {
    // Check cache first
    const cached = this.tenantCache.get(tenantId);
    if (cached) {
      return cached;
    }

    // In real implementation, query global database for tenant info
    // For now, return a minimal context
    const context: TenantContext = {
      tenantId,
      organizationId: tenantId, // Placeholder
      databaseUrl: `libsql://${tenantId}.turso.io`,
      plan: 'free',
    };

    // Cache the context
    this.tenantCache.set(tenantId, context);

    return context;
  }

  /**
   * Get driver instance for a specific organization
   *
   * @param organizationId - Organization ID
   * @returns Driver instance configured for the organization
   */
  async getDriverForOrganization(organizationId: string): Promise<IDataDriver> {
    // Get tenant database configuration
    const tenantDb = await this.getTenantDatabase(organizationId);

    if (!tenantDb) {
      throw new Error(`No tenant database found for organization: ${organizationId}`);
    }

    // Create or retrieve driver instance
    return this.driverFactory.create(tenantDb.driverConfig);
  }

  /**
   * Get tenant database configuration by organization ID
   */
  private async getTenantDatabase(organizationId: string): Promise<TenantDatabase | null> {
    // Check cache first
    const cached = this.tenantDbCache.get(organizationId);
    if (cached) {
      return cached;
    }

    // Query control plane database
    if (!this.config.controlPlaneDriver) {
      return null;
    }

    try {
      const results = await this.config.controlPlaneDriver.find('tenant_database', {
        filter: { organization_id: organizationId },
        limit: 1,
      });

      if (results.records.length === 0) {
        return null;
      }

      const record = results.records[0];
      const tenantDb: TenantDatabase = {
        id: record.id as string,
        organizationId: record.organization_id as string,
        driverConfig: typeof record.driver_config === 'string'
          ? JSON.parse(record.driver_config)
          : record.driver_config,
        status: record.status as any,
        plan: record.plan as any,
        storageLimitMb: record.storage_limit_mb as number,
        createdAt: record.created_at as string,
        updatedAt: record.updated_at as string,
        lastAccessedAt: record.last_accessed_at as string | undefined,
        metadata: record.metadata,
      };

      // Cache the result
      this.tenantDbCache.set(organizationId, tenantDb);

      return tenantDb;
    } catch (error) {
      console.error(`Failed to fetch tenant database for org ${organizationId}:`, error);
      return null;
    }
  }

  /**
   * Clear tenant cache
   */
  clearCache(): void {
    this.tenantCache.clear();
  }

  /**
   * Clear tenant database cache
   */
  clearDbCache(): void {
    this.tenantDbCache.clear();
  }

  /**
   * Invalidate specific tenant from cache
   */
  invalidateTenant(tenantId: string): void {
    this.tenantCache.delete(tenantId);
  }

  /**
   * Invalidate specific tenant database from cache
   */
  invalidateTenantDb(organizationId: string): void {
    this.tenantDbCache.delete(organizationId);
  }
}
