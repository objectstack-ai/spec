// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Example: Metadata Storage with ObjectQL
 * 
 * This example demonstrates how to store metadata in a database using
 * ObjectQL's universal data layer instead of filesystem-based storage.
 * 
 * Key Concept: ObjectQL already provides cross-database abstraction.
 * Metadata leverages ObjectQL's standard CRUD operations rather than
 * creating custom database drivers.
 */

import type { DatasourceSchema, MetadataLoaderContractSchema } from '@objectstack/spec';

/**
 * Example 1: Basic PostgreSQL Configuration
 * 
 * Store metadata in PostgreSQL using ObjectQL
 */
export const basicPostgresExample = {
  // 1. Define ObjectQL datasource
  datasource: {
    name: 'metadata_db',
    driver: 'postgres',
    config: {
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      database: 'objectstack',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
  } satisfies typeof DatasourceSchema,

  // 2. Configure metadata loader to use ObjectQL
  loader: {
    name: 'objectql-metadata-loader',
    protocol: 'objectql:',
    capabilities: {
      read: true,
      write: true,
      watch: false,
      list: true,
    },
    datasourceConfig: {
      datasource: 'metadata_db',           // References datasource above
      object: '_framework_metadata',        // ObjectQL object name
      cache: {
        enabled: true,
        ttlSeconds: 3600,
      },
    },
  } satisfies typeof MetadataLoaderContractSchema,
};

/**
 * Example 2: MongoDB Configuration
 * 
 * Store metadata in MongoDB using ObjectQL
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
    name: 'objectql-metadata-loader',
    protocol: 'objectql:',
    capabilities: {
      read: true,
      write: true,
      watch: true, // MongoDB supports change streams
      list: true,
    },
    datasourceConfig: {
      datasource: 'metadata_mongo',
      object: 'metadata',  // Collection name in MongoDB
      cache: {
        enabled: true,
        ttlSeconds: 1800,
      },
    },
  } satisfies typeof MetadataLoaderContractSchema,
};

/**
 * Example 3: Hybrid Setup
 * 
 * System metadata in files (version controlled)
 * User metadata in database (runtime configurable)
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
  } satisfies typeof MetadataLoaderContractSchema,

  // ObjectQL loader for user metadata
  objectqlLoader: {
    name: 'objectql-user-metadata',
    protocol: 'objectql:',
    capabilities: {
      read: true,
      write: true,
      watch: false,
      list: true,
    },
    datasourceConfig: {
      datasource: 'user_metadata_db',
      object: 'user_metadata',
      cache: {
        enabled: true,
        ttlSeconds: 1800,
      },
    },
  } satisfies typeof MetadataLoaderContractSchema,
};

/**
 * Example 4: Complete Manifest Configuration
 * 
 * Full objectstack.config.ts example
 */
export const manifestExample = {
  version: '1.0.0',
  
  // Configure ObjectQL datasources
  datasources: [
    {
      name: 'metadata_db',
      driver: 'postgres',
      config: {
        host: process.env.DB_HOST,
        port: 5432,
        database: 'objectstack',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
  ],
  
  // Configure metadata loaders
  metadata: {
    loaders: [
      {
        name: 'objectql-loader',
        protocol: 'objectql:',
        capabilities: {
          read: true,
          write: true,
          watch: false,
          list: true,
        },
        datasourceConfig: {
          datasource: 'metadata_db',
          object: '_framework_metadata',
          cache: {
            enabled: true,
            ttlSeconds: 3600,
          },
        },
      },
    ],
    defaultLoader: 'objectql-loader',
  },
};

/**
 * How It Works
 * 
 * 1. Datasource Configuration:
 *    - Define ObjectQL datasource in manifest
 *    - Specify driver (postgres, mysql, mongodb, etc.)
 *    - Provide connection details
 * 
 * 2. Object Definition:
 *    - Define '_framework_metadata' object in schema
 *    - Fields: id, name, type, namespace, scope, metadata, state, etc.
 *    - ObjectQL handles table creation and CRUD operations
 * 
 * 3. Metadata Operations:
 *    - Load: objectql.find('_framework_metadata', { where: { type: 'object' } })
 *    - Save: objectql.insert('_framework_metadata', { ...metadata })
 *    - Update: objectql.update('_framework_metadata', id, { ...changes })
 *    - Delete: objectql.delete('_framework_metadata', id)
 * 
 * 4. Benefits:
 *    - No custom database drivers needed
 *    - Leverages ObjectQL's cross-database abstraction
 *    - Standard CRUD operations
 *    - Consistent API across all databases
 *    - Less code to maintain
 */
