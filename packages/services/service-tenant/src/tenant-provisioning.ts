// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type {
  ProvisionTenantRequest,
  ProvisionTenantResponse,
  TenantDatabase,
} from '@objectstack/spec/cloud';
import type { IDataDriver } from '@objectstack/spec';
import { randomUUID } from 'node:crypto';
import { TursoPlatformClient, type TursoPlatformConfig } from './turso-platform-client';

/**
 * Tenant Provisioning Service Configuration
 */
export interface TenantProvisioningConfig {
  /**
   * Turso Platform API configuration
   * If not provided, runs in mock mode (for development/testing)
   */
  turso?: TursoPlatformConfig;

  /**
   * Global control plane data driver
   * Used to store tenant registry and package installations
   */
  controlPlaneDriver?: IDataDriver;

  /**
   * Default region for new tenant databases
   */
  defaultRegion?: string;

  /**
   * Database group name for tenant databases
   * Optional: groups share configuration like location
   */
  databaseGroup?: string;

  /**
   * Default storage limit in MB for free tier
   */
  defaultStorageLimitMb?: number;

  /**
   * Auth token encryption key
   * Used to encrypt tenant auth tokens before storing in control plane
   */
  encryptionKey?: string;
}

/**
 * Tenant Provisioning Service
 *
 * Handles tenant database provisioning operations:
 * - Create new tenant databases via Turso Platform API
 * - Generate tenant-specific auth tokens
 * - Register tenants in global control plane
 * - Initialize tenant database schema
 */
export class TenantProvisioningService {
  private config: TenantProvisioningConfig;
  private tursoClient?: TursoPlatformClient;

  constructor(config: TenantProvisioningConfig = {}) {
    this.config = config;

    // Initialize Turso Platform client if credentials provided
    if (config.turso) {
      this.tursoClient = new TursoPlatformClient(config.turso);
    }
  }

  /**
   * Provision a new tenant database
   *
   * Supports multiple driver types:
   * - Turso: Cloud-native production deployment
   * - Memory: Development and testing (data lost on restart)
   * - SQL: Enterprise PostgreSQL/MySQL/etc.
   * - SQLite: Local file-based storage
   * - Custom: Custom driver implementation
   *
   * @param request - Provisioning request with driver configuration
   * @returns Provisioning result with tenant database info
   */
  async provisionTenant(request: ProvisionTenantRequest): Promise<ProvisionTenantResponse> {
    const startTime = Date.now();
    const warnings: string[] = [];

    // Generate UUID for tenant database
    const tenantId = randomUUID();

    // Provision based on driver type
    let tenant: TenantDatabase;

    switch (request.driverConfig.driver) {
      case 'turso':
        tenant = await this.provisionTursoDatabase(tenantId, request, warnings);
        break;

      case 'memory':
        tenant = await this.provisionMemoryDriver(tenantId, request, warnings);
        break;

      case 'sql':
        tenant = await this.provisionSQLDatabase(tenantId, request, warnings);
        break;

      case 'sqlite':
        tenant = await this.provisionSQLiteDatabase(tenantId, request, warnings);
        break;

      case 'custom':
        tenant = await this.provisionCustomDriver(tenantId, request, warnings);
        break;

      default:
        throw new Error(`Unsupported driver type: ${(request.driverConfig as any).driver}`);
    }

    // Store tenant record in global control plane
    if (this.config.controlPlaneDriver) {
      try {
        await this.storeTenantRecord(tenant);
      } catch (error) {
        warnings.push(
          `Failed to store tenant record in control plane: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    } else {
      warnings.push('Control plane driver not configured - tenant record not persisted');
    }

    const durationMs = Date.now() - startTime;

    return {
      tenant,
      durationMs,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Provision Turso database
   */
  private async provisionTursoDatabase(
    tenantId: string,
    request: ProvisionTenantRequest,
    warnings: string[],
  ): Promise<TenantDatabase> {
    const config = request.driverConfig;
    if (config.driver !== 'turso') {
      throw new Error('Invalid driver config for Turso provisioning');
    }

    const databaseName = tenantId; // UUID-based naming
    let databaseUrl: string;
    let authToken: string;

    if (this.tursoClient) {
      // Production mode: Use Turso Platform API
      try {
        const createDbResponse = await this.tursoClient.createDatabase({
          name: databaseName,
          group: this.config.databaseGroup,
        });

        const tokenResponse = await this.tursoClient.createDatabaseToken(databaseName, {
          authorization: 'full-access',
        });

        databaseUrl = `libsql://${createDbResponse.database.Hostname}`;
        authToken = this.encryptAuthToken(tokenResponse.jwt);
      } catch (error) {
        throw new Error(
          `Failed to provision Turso database: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    } else {
      // Development/Mock mode
      databaseUrl = `libsql://${databaseName}.turso.io`;
      authToken = this.encryptAuthToken(`mock-token-${tenantId}`);
      warnings.push('Running in mock mode - Turso Platform API credentials not configured');
    }

    return {
      id: tenantId,
      organizationId: request.organizationId,
      driverConfig: {
        driver: 'turso',
        databaseUrl,
        authToken,
        region: config.region,
        syncUrl: config.syncUrl,
      },
      status: 'active',
      plan: request.plan || 'free',
      storageLimitMb: request.storageLimitMb || this.config.defaultStorageLimitMb || 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata,
    };
  }

  /**
   * Provision Memory driver (for development/testing)
   */
  private async provisionMemoryDriver(
    tenantId: string,
    request: ProvisionTenantRequest,
    warnings: string[],
  ): Promise<TenantDatabase> {
    const config = request.driverConfig;
    if (config.driver !== 'memory') {
      throw new Error('Invalid driver config for Memory provisioning');
    }

    warnings.push('Memory driver: Data will be lost on restart unless persistence is enabled');

    return {
      id: tenantId,
      organizationId: request.organizationId,
      driverConfig: {
        driver: 'memory',
        persistent: config.persistent,
        dataFile: config.dataFile,
      },
      status: 'active',
      plan: request.plan || 'free',
      storageLimitMb: request.storageLimitMb || 512, // Lower default for memory
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata,
    };
  }

  /**
   * Provision SQL database (PostgreSQL, MySQL, etc.)
   */
  private async provisionSQLDatabase(
    tenantId: string,
    request: ProvisionTenantRequest,
    warnings: string[],
  ): Promise<TenantDatabase> {
    const config = request.driverConfig;
    if (config.driver !== 'sql') {
      throw new Error('Invalid driver config for SQL provisioning');
    }

    // In production, you might create a new database via SQL admin connection
    // For now, we assume the database already exists or will be created externally

    return {
      id: tenantId,
      organizationId: request.organizationId,
      driverConfig: {
        driver: 'sql',
        dialect: config.dialect,
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.username,
        password: config.password,
        ssl: config.ssl,
        pool: config.pool,
      },
      status: 'active',
      plan: request.plan || 'enterprise',
      storageLimitMb: request.storageLimitMb || 10240, // 10GB default for SQL
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata,
    };
  }

  /**
   * Provision SQLite database
   */
  private async provisionSQLiteDatabase(
    tenantId: string,
    request: ProvisionTenantRequest,
    warnings: string[],
  ): Promise<TenantDatabase> {
    const config = request.driverConfig;
    if (config.driver !== 'sqlite') {
      throw new Error('Invalid driver config for SQLite provisioning');
    }

    return {
      id: tenantId,
      organizationId: request.organizationId,
      driverConfig: {
        driver: 'sqlite',
        filename: config.filename,
        readonly: config.readonly,
      },
      status: 'active',
      plan: request.plan || 'free',
      storageLimitMb: request.storageLimitMb || 2048,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata,
    };
  }

  /**
   * Provision Custom driver
   */
  private async provisionCustomDriver(
    tenantId: string,
    request: ProvisionTenantRequest,
    warnings: string[],
  ): Promise<TenantDatabase> {
    const config = request.driverConfig;
    if (config.driver !== 'custom') {
      throw new Error('Invalid driver config for Custom provisioning');
    }

    warnings.push(`Using custom driver: ${config.driverName}`);

    return {
      id: tenantId,
      organizationId: request.organizationId,
      driverConfig: {
        driver: 'custom',
        driverName: config.driverName,
        config: config.config,
      },
      status: 'active',
      plan: request.plan || 'custom',
      storageLimitMb: request.storageLimitMb || 5120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata,
    };
  }

  /**
   * Store tenant record in control plane database
   */
  private async storeTenantRecord(tenant: TenantDatabase): Promise<void> {
    if (!this.config.controlPlaneDriver) {
      return;
    }

    await this.config.controlPlaneDriver.create('tenant_database', {
      id: tenant.id,
      organization_id: tenant.organizationId,
      driver_config: JSON.stringify(tenant.driverConfig),
      status: tenant.status,
      plan: tenant.plan,
      storage_limit_mb: tenant.storageLimitMb,
      created_at: tenant.createdAt,
      updated_at: tenant.updatedAt,
      last_accessed_at: tenant.lastAccessedAt,
      metadata: tenant.metadata,
    });
  }

  /**
   * Suspend a tenant database
   *
   * Makes the database read-only or inaccessible.
   */
  async suspendTenant(tenantId: string): Promise<void> {
    // Step 1: Update tenant status in control plane
    if (this.config.controlPlaneDriver) {
      await this.config.controlPlaneDriver.update('tenant_database', tenantId, {
        status: 'suspended',
        updated_at: new Date().toISOString(),
      });
    }

    // Step 2: Platform API doesn't have suspend endpoint yet
    // This would typically set database to read-only mode
    // For now, we just update the status in control plane
  }

  /**
   * Archive a tenant database
   *
   * Preserves data but makes it inaccessible.
   */
  async archiveTenant(tenantId: string): Promise<void> {
    if (!this.config.controlPlaneDriver) {
      throw new Error('Control plane driver required for archive operation');
    }

    // Get tenant info
    const tenant = (await this.config.controlPlaneDriver.findById(
      'tenant_database',
      tenantId,
    )) as any;

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Update status to archived
    await this.config.controlPlaneDriver.update('tenant_database', tenantId, {
      status: 'archived',
      updated_at: new Date().toISOString(),
    });

    // Optionally delete from Turso Platform
    if (this.tursoClient) {
      try {
        await this.tursoClient.deleteDatabase(tenant.database_name);
      } catch (error) {
        // Log but don't fail if database doesn't exist
        console.warn(`Failed to delete database from Turso Platform: ${error}`);
      }
    }
  }

  /**
   * Restore a suspended or archived tenant
   *
   * Makes the database active again.
   */
  async restoreTenant(tenantId: string): Promise<void> {
    if (!this.config.controlPlaneDriver) {
      throw new Error('Control plane driver required for restore operation');
    }

    // Get tenant info
    const tenant = (await this.config.controlPlaneDriver.findById(
      'tenant_database',
      tenantId,
    )) as any;

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    if (tenant.status === 'archived') {
      throw new Error('Cannot restore archived tenant - create a new tenant instead');
    }

    // Update status to active
    await this.config.controlPlaneDriver.update('tenant_database', tenantId, {
      status: 'active',
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Migrate tenant to a different region
   *
   * Creates replica in target region and updates routing configuration.
   */
  async migrateTenantRegion(tenantId: string, targetRegion: string): Promise<void> {
    // TODO: Implementation
    // 1. Create replica in target region via Platform API
    // 2. Wait for sync to complete
    // 3. Update tenant record with new region
    // 4. Switch traffic to new region
    // 5. Delete old replica
    throw new Error('Region migration not yet implemented');
  }

  /**
   * Encrypt auth token before storing
   */
  private encryptAuthToken(token: string): string {
    // TODO: Implement proper encryption using this.config.encryptionKey
    // For now, just return the token (in production, use crypto to encrypt)
    return token;
  }

  /**
   * Decrypt auth token for use
   */
  private decryptAuthToken(encryptedToken: string): string {
    // TODO: Implement proper decryption using this.config.encryptionKey
    return encryptedToken;
  }
}
