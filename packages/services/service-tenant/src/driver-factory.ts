// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { IDataDriver } from '@objectstack/spec';
import type { DriverConfig } from '@objectstack/spec/cloud';

/**
 * Driver Factory Configuration
 */
export interface DriverFactoryConfig {
  /**
   * Available driver instances keyed by driver name
   * Example: { 'turso': tursoDriver, 'memory': memoryDriver }
   */
  drivers?: Map<string, IDataDriver>;

  /**
   * Driver class constructors for dynamic instantiation
   * Example: { 'turso': TursoDriver, 'memory': InMemoryDriver }
   */
  driverConstructors?: Map<string, new (config: any) => IDataDriver>;
}

/**
 * Driver Factory
 *
 * Manages driver instances for multi-tenant deployments.
 * Each organization's database uses a specific driver configuration,
 * and the factory creates/caches driver instances on demand.
 *
 * Features:
 * - Instance caching to avoid creating duplicate drivers
 * - Support for pre-configured drivers
 * - Dynamic driver instantiation
 * - Type-safe driver configuration
 */
export class DriverFactory {
  private driverCache = new Map<string, IDataDriver>();
  private config: DriverFactoryConfig;

  constructor(config: DriverFactoryConfig = {}) {
    this.config = config;

    // Pre-populate cache with provided drivers
    if (config.drivers) {
      for (const [key, driver] of config.drivers) {
        this.driverCache.set(key, driver);
      }
    }
  }

  /**
   * Create or retrieve a driver instance based on configuration
   *
   * @param driverConfig - Driver configuration from TenantDatabase
   * @returns Driver instance ready to use
   */
  async create(driverConfig: DriverConfig): Promise<IDataDriver> {
    const cacheKey = this.getCacheKey(driverConfig);

    // Check cache first
    if (this.driverCache.has(cacheKey)) {
      return this.driverCache.get(cacheKey)!;
    }

    // Create new driver instance
    const driver = await this.instantiateDriver(driverConfig);

    // Cache for future use
    this.driverCache.set(cacheKey, driver);

    return driver;
  }

  /**
   * Instantiate a new driver based on configuration
   */
  private async instantiateDriver(driverConfig: DriverConfig): Promise<IDataDriver> {
    switch (driverConfig.driver) {
      case 'turso':
        return this.createTursoDriver(driverConfig);

      case 'memory':
        return this.createMemoryDriver(driverConfig);

      case 'sql':
        return this.createSQLDriver(driverConfig);

      case 'sqlite':
        return this.createSQLiteDriver(driverConfig);

      case 'custom':
        return this.createCustomDriver(driverConfig);

      default:
        throw new Error(`Unsupported driver type: ${(driverConfig as any).driver}`);
    }
  }

  /**
   * Create Turso driver instance
   */
  private async createTursoDriver(config: DriverConfig): Promise<IDataDriver> {
    if (config.driver !== 'turso') {
      throw new Error('Invalid driver config for Turso');
    }

    // Check if constructor is available
    const TursoDriverConstructor = this.config.driverConstructors?.get('turso');
    if (!TursoDriverConstructor) {
      throw new Error(
        'Turso driver constructor not registered. Register it via DriverFactory config.',
      );
    }

    return new TursoDriverConstructor({
      url: config.databaseUrl,
      authToken: config.authToken,
      syncUrl: config.syncUrl,
    });
  }

  /**
   * Create Memory driver instance
   */
  private async createMemoryDriver(config: DriverConfig): Promise<IDataDriver> {
    if (config.driver !== 'memory') {
      throw new Error('Invalid driver config for Memory');
    }

    const MemoryDriverConstructor = this.config.driverConstructors?.get('memory');
    if (!MemoryDriverConstructor) {
      throw new Error(
        'Memory driver constructor not registered. Register it via DriverFactory config.',
      );
    }

    return new MemoryDriverConstructor({
      persistent: config.persistent,
      dataFile: config.dataFile,
    });
  }

  /**
   * Create SQL driver instance
   */
  private async createSQLDriver(config: DriverConfig): Promise<IDataDriver> {
    if (config.driver !== 'sql') {
      throw new Error('Invalid driver config for SQL');
    }

    const SQLDriverConstructor = this.config.driverConstructors?.get('sql');
    if (!SQLDriverConstructor) {
      throw new Error(
        'SQL driver constructor not registered. Register it via DriverFactory config.',
      );
    }

    return new SQLDriverConstructor({
      dialect: config.dialect,
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      ssl: config.ssl,
      pool: config.pool,
    });
  }

  /**
   * Create SQLite driver instance
   */
  private async createSQLiteDriver(config: DriverConfig): Promise<IDataDriver> {
    if (config.driver !== 'sqlite') {
      throw new Error('Invalid driver config for SQLite');
    }

    const SQLiteDriverConstructor = this.config.driverConstructors?.get('sqlite');
    if (!SQLiteDriverConstructor) {
      throw new Error(
        'SQLite driver constructor not registered. Register it via DriverFactory config.',
      );
    }

    return new SQLiteDriverConstructor({
      filename: config.filename,
      readonly: config.readonly,
    });
  }

  /**
   * Create Custom driver instance
   */
  private async createCustomDriver(config: DriverConfig): Promise<IDataDriver> {
    if (config.driver !== 'custom') {
      throw new Error('Invalid driver config for Custom');
    }

    const CustomDriverConstructor = this.config.driverConstructors?.get(config.driverName);
    if (!CustomDriverConstructor) {
      throw new Error(
        `Custom driver '${config.driverName}' constructor not registered. Register it via DriverFactory config.`,
      );
    }

    return new CustomDriverConstructor(config.config);
  }

  /**
   * Generate cache key from driver configuration
   */
  private getCacheKey(driverConfig: DriverConfig): string {
    // Create a unique key based on driver type and critical connection params
    switch (driverConfig.driver) {
      case 'turso':
        return `turso:${driverConfig.databaseUrl}`;

      case 'memory':
        return `memory:${driverConfig.dataFile || 'ephemeral'}`;

      case 'sql':
        return `sql:${driverConfig.dialect}:${driverConfig.host}:${driverConfig.port}:${driverConfig.database}`;

      case 'sqlite':
        return `sqlite:${driverConfig.filename}`;

      case 'custom':
        return `custom:${driverConfig.driverName}:${JSON.stringify(driverConfig.config)}`;

      default:
        return `unknown:${JSON.stringify(driverConfig)}`;
    }
  }

  /**
   * Clear driver cache (useful for testing)
   */
  clearCache(): void {
    this.driverCache.clear();
  }

  /**
   * Remove specific driver from cache
   */
  invalidateDriver(cacheKey: string): void {
    this.driverCache.delete(cacheKey);
  }

  /**
   * Get number of cached drivers
   */
  getCacheSize(): number {
    return this.driverCache.size;
  }
}
