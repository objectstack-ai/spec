// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Example: Metadata Datasource Configuration
 * 
 * This example demonstrates how to configure ObjectStack to store
 * metadata in a database instead of the filesystem.
 */

import type {
  DatasourceSchema,
  MetadataLoaderContractSchema,
  MetadataDriverConfigSchema,
} from '@objectstack/spec';

/**
 * Example 1: Basic PostgreSQL Configuration
 * 
 * Simplest setup - store metadata in PostgreSQL with default settings
 */
export const basicPostgresExample = {
  // 1. Define the datasource
  datasource: {
    name: 'metadata_postgres',
    driver: 'postgres',
    config: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: 5432,
      database: 'objectstack_metadata',
      user: process.env.POSTGRES_USER || 'admin',
      password: process.env.POSTGRES_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
  } satisfies typeof DatasourceSchema,

  // 2. Configure the metadata loader
  loader: {
    name: 'postgres-metadata-loader',
    protocol: 'database:',
    capabilities: {
      read: true,
      write: true,
      watch: false,
      list: true,
    },
    datasourceConfig: {
      datasource: 'metadata_postgres',
      table: '_framework_metadata',
      autoMigrate: true,
    },
  } satisfies typeof MetadataLoaderContractSchema,
};

/**
 * Example 2: MongoDB Configuration
 * 
 * Store metadata in MongoDB with custom collection name
 */
export const mongoDBExample = {
  datasource: {
    name: 'metadata_mongo',
    driver: 'mongodb',
    config: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      database: 'objectstack',
    },
  } satisfies typeof DatasourceSchema,

  loader: {
    name: 'mongo-metadata-loader',
    protocol: 'database:',
    capabilities: {
      read: true,
      write: true,
      watch: true, // MongoDB supports change streams
      list: true,
    },
    datasourceConfig: {
      datasource: 'metadata_mongo',
      table: 'metadata', // Collection name in MongoDB
      cache: {
        enabled: true,
        ttlSeconds: 3600,
        invalidateOnWrite: true,
      },
    },
  } satisfies typeof MetadataLoaderContractSchema,
};

/**
 * Example 3: Advanced PostgreSQL with Performance Tuning
 * 
 * Production-ready configuration with caching, batching, and transactions
 */
export const advancedPostgresExample = {
  datasource: {
    name: 'metadata_db_prod',
    driver: 'postgres',
    config: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: 'objectstack_prod',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA,
      },
    },
    pool: {
      min: 5,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
    },
    retryPolicy: {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
    },
  } satisfies typeof DatasourceSchema,

  driverConfig: {
    datasource: 'metadata_db_prod',
    
    tableSchema: {
      name: 'metadata',
      schema: 'framework',
      primaryKey: 'id',
      indexes: [
        {
          name: 'idx_metadata_type_name',
          fields: ['type', 'name'],
          unique: true,
          type: 'btree',
        },
        {
          name: 'idx_metadata_namespace',
          fields: ['namespace'],
          unique: false,
          type: 'btree',
        },
        {
          name: 'idx_metadata_scope_state',
          fields: ['scope', 'state'],
          unique: false,
          type: 'btree',
        },
      ],
    },
    
    migration: {
      autoMigrate: true,
      dropOnMigrate: false,
      backupBeforeMigrate: true,
    },
    
    performance: {
      batchSize: 200,
      enableCache: true,
      cacheTtlSeconds: 7200, // 2 hours
      prefetchOnInit: true,
      parallelLoad: true,
    },
    
    transaction: {
      defaultIsolation: 'read_committed',
      timeout: 30000,
      retryOnConflict: true,
      maxRetries: 3,
    },
    
    query: {
      useIndexes: true,
      maxResultSize: 10000,
      enablePagination: true,
      defaultPageSize: 100,
    },
  } satisfies typeof MetadataDriverConfigSchema,
};

/**
 * Example 4: Hybrid Setup - System in Files, User in Database
 * 
 * Use filesystem for system metadata (version controlled),
 * database for user metadata (runtime configurable)
 */
export const hybridSetupExample = {
  // File-based loader for system metadata
  fileLoader: {
    name: 'file-loader',
    protocol: 'file:',
    capabilities: {
      read: true,
      write: true,
      watch: true,
      list: true,
    },
    // No datasourceConfig - uses filesystem
  } satisfies typeof MetadataLoaderContractSchema,

  // Database loader for user metadata
  dbLoader: {
    name: 'user-metadata-loader',
    protocol: 'database:',
    capabilities: {
      read: true,
      write: true,
      watch: false,
      list: true,
    },
    datasourceConfig: {
      datasource: 'user_metadata_db',
      table: 'user_metadata',
      schema: 'public',
      autoMigrate: true,
      cache: {
        enabled: true,
        ttlSeconds: 1800, // 30 minutes
        invalidateOnWrite: true,
      },
      queryOptions: {
        batchSize: 50,
        useIndexes: true,
        parallelLoad: false,
      },
    },
  } satisfies typeof MetadataLoaderContractSchema,

  // Loader selection logic (pseudo-code)
  getLoader: (metadataType: string, scope: string) => {
    // System metadata from files
    if (scope === 'system') {
      return 'file-loader';
    }
    // User metadata from database
    if (scope === 'user') {
      return 'user-metadata-loader';
    }
    // Platform metadata could use either
    return 'user-metadata-loader';
  },
};

/**
 * Example 5: Multi-Tenant Setup
 * 
 * Separate metadata storage per tenant
 */
export const multiTenantExample = {
  // Shared datasource connection
  datasource: {
    name: 'multitenant_metadata_db',
    driver: 'postgres',
    config: {
      host: process.env.DB_HOST,
      port: 5432,
      database: 'objectstack_multitenant',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 10,
      max: 50, // Higher pool for multiple tenants
    },
  } satisfies typeof DatasourceSchema,

  // Function to create tenant-specific loader
  createTenantLoader: (tenantId: string) => ({
    name: `metadata-loader-${tenantId}`,
    protocol: 'database:',
    capabilities: {
      read: true,
      write: true,
      watch: false,
      list: true,
    },
    datasourceConfig: {
      datasource: 'multitenant_metadata_db',
      table: `tenant_${tenantId}_metadata`, // Separate table per tenant
      schema: 'public',
      autoMigrate: true,
      cache: {
        enabled: true,
        ttlSeconds: 3600,
        invalidateOnWrite: true,
      },
    },
  } satisfies typeof MetadataLoaderContractSchema),
};

/**
 * Example 6: Development Setup
 * 
 * Simple in-memory or local database for development
 */
export const developmentExample = {
  // Use SQLite for local development
  datasource: {
    name: 'metadata_dev',
    driver: 'sqlite',
    config: {
      filename: './data/metadata.db',
    },
  } satisfies typeof DatasourceSchema,

  loader: {
    name: 'dev-metadata-loader',
    protocol: 'database:',
    capabilities: {
      read: true,
      write: true,
      watch: false,
      list: true,
    },
    datasourceConfig: {
      datasource: 'metadata_dev',
      table: 'metadata',
      autoMigrate: true,
      cache: {
        enabled: false, // Disable cache in dev for immediate changes
        ttlSeconds: 0,
        invalidateOnWrite: true,
      },
    },
  } satisfies typeof MetadataLoaderContractSchema,
};

/**
 * Usage in objectstack.config.ts
 */
export const manifestExample = {
  version: '1.0.0',
  
  // Configure datasources
  datasources: [
    basicPostgresExample.datasource,
  ],
  
  // Configure metadata manager
  metadata: {
    loaders: [
      basicPostgresExample.loader,
    ],
    // Default loader to use
    defaultLoader: 'postgres-metadata-loader',
  },
  
  // ... other manifest configuration
};
