// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Contracts } from '@objectstack/spec';
type IDataDriver = Contracts.IDataDriver;

/**
 * Environment-scoped driver registry with LRU caching.
 *
 * Resolves environments by hostname or ID, lazily instantiates data drivers,
 * and caches them with TTL to avoid re-querying control plane on every request.
 *
 * Implements ADR-0002 environment routing: request → hostname/header/session →
 * sys__environment → sys__database_credential → env-scoped IDataDriver.
 */
export interface EnvironmentDriverRegistry {
  /**
   * Resolve environment by hostname (e.g. "acme-dev.objectstack.app").
   * Returns { environmentId, driver } if found, null otherwise.
   * Caches result with TTL.
   */
  resolveByHostname(host: string): Promise<{ environmentId: string; driver: IDataDriver } | null>;

  /**
   * Resolve environment by ID.
   * Returns driver if found, null otherwise.
   * Caches result with TTL.
   */
  resolveById(environmentId: string): Promise<IDataDriver | null>;

  /**
   * Invalidate cached driver for given environment.
   * Call this when environment is updated (e.g. hostname change, credential rotation).
   */
  invalidate(environmentId: string): void;
}

interface CacheEntry {
  environmentId: string;
  driver: IDataDriver;
  expiresAt: number;
}

/**
 * Secret encryptor interface - must match service-tenant NoopSecretEncryptor
 */
export interface SecretEncryptor {
  readonly keyId: string;
  encrypt(plaintext: string): Promise<string> | string;
  decrypt(ciphertext: string): Promise<string> | string;
}

/**
 * No-op encryptor used in development / tests. **Never** use in production.
 */
export class NoopSecretEncryptor implements SecretEncryptor {
  readonly keyId = 'noop';
  encrypt(plaintext: string): string {
    return plaintext;
  }
  decrypt(ciphertext: string): string {
    return ciphertext;
  }
}

/**
 * Default implementation of EnvironmentDriverRegistry with LRU caching.
 */
export class DefaultEnvironmentDriverRegistry implements EnvironmentDriverRegistry {
  private readonly controlPlaneDriver: IDataDriver;
  private readonly encryptor: SecretEncryptor;
  private readonly cacheTTL: number;
  private readonly hostnameCache = new Map<string, CacheEntry>();
  private readonly idCache = new Map<string, CacheEntry>();
  private readonly pendingResolves = new Map<string, Promise<CacheEntry | null>>();

  constructor(config: {
    controlPlaneDriver: IDataDriver;
    encryptor?: SecretEncryptor;
    cacheTTLMs?: number;
  }) {
    this.controlPlaneDriver = config.controlPlaneDriver;
    this.encryptor = config.encryptor ?? new NoopSecretEncryptor();
    this.cacheTTL = config.cacheTTLMs ?? 5 * 60 * 1000; // 5 minutes default
  }

  async resolveByHostname(host: string): Promise<{ environmentId: string; driver: IDataDriver } | null> {
    // Check cache first
    const cached = this.hostnameCache.get(host);
    if (cached && cached.expiresAt > Date.now()) {
      return { environmentId: cached.environmentId, driver: cached.driver };
    }

    // Prevent concurrent lookups for same hostname
    const cacheKey = `host:${host}`;
    const pending = this.pendingResolves.get(cacheKey);
    if (pending) {
      const result = await pending;
      return result ? { environmentId: result.environmentId, driver: result.driver } : null;
    }

    // Resolve from control plane
    const resolvePromise = this.fetchAndCacheByHostname(host);
    this.pendingResolves.set(cacheKey, resolvePromise);

    try {
      const entry = await resolvePromise;
      return entry ? { environmentId: entry.environmentId, driver: entry.driver } : null;
    } finally {
      this.pendingResolves.delete(cacheKey);
    }
  }

  async resolveById(environmentId: string): Promise<IDataDriver | null> {
    // Check cache first
    const cached = this.idCache.get(environmentId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.driver;
    }

    // Prevent concurrent lookups for same ID
    const cacheKey = `id:${environmentId}`;
    const pending = this.pendingResolves.get(cacheKey);
    if (pending) {
      const result = await pending;
      return result?.driver ?? null;
    }

    // Resolve from control plane
    const resolvePromise = this.fetchAndCacheById(environmentId);
    this.pendingResolves.set(cacheKey, resolvePromise);

    try {
      const entry = await resolvePromise;
      return entry?.driver ?? null;
    } finally {
      this.pendingResolves.delete(cacheKey);
    }
  }

  invalidate(environmentId: string): void {
    // Remove from ID cache
    this.idCache.delete(environmentId);

    // Remove from hostname cache (need to find entry by environmentId)
    for (const [hostname, entry] of this.hostnameCache.entries()) {
      if (entry.environmentId === environmentId) {
        this.hostnameCache.delete(hostname);
      }
    }
  }

  private async fetchAndCacheByHostname(host: string): Promise<CacheEntry | null> {
    try {
      // Query control plane: SELECT ... FROM sys__environment WHERE hostname = ? LIMIT 1
      const result = await this.controlPlaneDriver.find('environment', {
        object: 'environment',
        where: { hostname: host },
        limit: 1,
      });

      const rows = Array.isArray(result) ? result : (result as any)?.value ?? [];
      const envRow = rows[0];

      if (!envRow) {
        return null;
      }

      const entry = await this.buildCacheEntry(envRow);
      if (entry) {
        this.hostnameCache.set(host, entry);
        this.idCache.set(entry.environmentId, entry);
      }

      return entry;
    } catch (error) {
      console.error(`[EnvironmentRegistry] Failed to resolve hostname ${host}:`, error);
      return null;
    }
  }

  private async fetchAndCacheById(environmentId: string): Promise<CacheEntry | null> {
    try {
      // Query control plane: SELECT ... FROM sys__environment WHERE id = ? LIMIT 1
      const result = await this.controlPlaneDriver.find('environment', {
        object: 'environment',
        where: { id: environmentId },
        limit: 1,
      });

      const rows = Array.isArray(result) ? result : (result as any)?.value ?? [];
      const envRow = rows[0];

      if (!envRow) {
        return null;
      }

      const entry = await this.buildCacheEntry(envRow);
      if (entry) {
        this.idCache.set(environmentId, entry);
        if (envRow.hostname) {
          this.hostnameCache.set(envRow.hostname, entry);
        }
      }

      return entry;
    } catch (error) {
      console.error(`[EnvironmentRegistry] Failed to resolve environment ID ${environmentId}:`, error);
      return null;
    }
  }

  private async buildCacheEntry(envRow: any): Promise<CacheEntry | null> {
    const environmentId = envRow.id;
    const databaseUrl = envRow.database_url;
    const databaseDriver = envRow.database_driver;

    if (!databaseUrl || !databaseDriver) {
      console.warn(`[EnvironmentRegistry] Environment ${environmentId} missing database_url or database_driver`);
      return null;
    }

    // Fetch active credential
    const credResult = await this.controlPlaneDriver.find('database_credential', {
      object: 'database_credential',
      where: { environment_id: environmentId, status: 'active' },
      limit: 1,
    });

    const credRows = Array.isArray(credResult) ? credResult : (credResult as any)?.value ?? [];
    const credRow = credRows[0];

    if (!credRow) {
      console.warn(`[EnvironmentRegistry] No active credential for environment ${environmentId}`);
      return null;
    }

    // Decrypt secret
    const plaintextSecret = await Promise.resolve(
      this.encryptor.decrypt(credRow.secret_ciphertext),
    );

    // Instantiate driver based on driver type
    const driver = await this.createDriver(databaseDriver, databaseUrl, plaintextSecret);

    return {
      environmentId,
      driver,
      expiresAt: Date.now() + this.cacheTTL,
    };
  }

  private async createDriver(driverType: string, databaseUrl: string, authToken: string): Promise<IDataDriver> {
    // Dynamic import drivers to avoid circular dependencies
    switch (driverType) {
      case 'memory': {
        // Memory driver: URL format is memory://dbname or memory://
        const dbName = databaseUrl.replace('memory://', '') || 'default';
        const { InMemoryDriver } = await import('@objectstack/driver-memory');
        return new InMemoryDriver({
          name: `com.objectstack.driver.memory.${dbName}`,
          persistence: 'file', // Use file persistence for environments
        });
      }

      case 'sqlite': {
        // SQLite driver: URL format is file:./path/to/db.db
        const filePath = databaseUrl.replace('file:', '');
        const { SqlDriver } = await import('@objectstack/driver-sql');
        return new SqlDriver({
          client: 'better-sqlite3',
          connection: {
            filename: filePath,
          },
          useNullAsDefault: true,
        });
      }

      case 'turso': {
        // Turso driver: URL format is libsql://hostname
        const { TursoDriver } = await import('@objectstack/driver-turso');
        return new TursoDriver({
          name: 'com.objectstack.driver.turso',
          url: databaseUrl,
          authToken,
        });
      }

      default:
        throw new Error(`[EnvironmentRegistry] Unsupported driver type: ${driverType}`);
    }
  }
}

/**
 * Create a default environment driver registry instance.
 */
export function createEnvironmentDriverRegistry(
  controlPlaneDriver: IDataDriver,
  options?: {
    encryptor?: SecretEncryptor;
    cacheTTLMs?: number;
  },
): EnvironmentDriverRegistry {
  return new DefaultEnvironmentDriverRegistry({
    controlPlaneDriver,
    encryptor: options?.encryptor,
    cacheTTLMs: options?.cacheTTLMs,
  });
}
