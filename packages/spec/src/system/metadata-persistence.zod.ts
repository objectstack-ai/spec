// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Metadata Scope Enum
 * Defines the lifecycle and mutability of a metadata item.
 */
export const MetadataScopeSchema = z.enum([
  'system',   // Defined in Code (Files). Read-only at runtime. Upgraded via deployment.
  'platform', // Defined in DB (Global). admin-configured. Overrides system.
  'user',     // Defined in DB (Personal). User-configured. Overrides platform/system.
]);

/**
 * Metadata Lifecycle State
 */
export const MetadataStateSchema = z.enum([
  'draft',    // Work in progress, not active
  'active',   // Live and running
  'archived', // Soft deleted
  'deprecated' // Running but flagged for removal
]);

/**
 * Unified Metadata Persistence Protocol
 * 
 * Defines the standardized envelope for storing ANY metadata item (Object, View, Flow)
 * in the database (e.g. `_framework_metadata` or generic `metadata` table).
 * 
 * This treats "Metadata as Data".
 */
export const MetadataRecordSchema = z.object({
  /** Primary Key (UUID) */
  id: z.string(),
  
  /** 
   * Machine Name 
   * The unique identifier used in code references (e.g. "account_list_view").
   */
  name: z.string(),
  
  /**
   * Metadata Type
   * e.g. "object", "view", "permission_set", "flow"
   */
  type: z.string(),
  
  /**
   * Namespace / Module
   * Groups metadata into packages (e.g. "crm", "finance", "core").
   */
  namespace: z.string().default('default'),
  
  /**
   * Ownership differentiation
   */
  scope: MetadataScopeSchema.default('platform'),
  
  /**
   * The Payload
   * Stores the actual configuration JSON.
   * This field holds the value of `ViewSchema`, `ObjectSchema`, etc.
   */
  metadata: z.record(z.string(), z.unknown()),

  /**
   * Extension / Merge Strategy
   * If this record overrides a system record, how should it be applied?
   */
  extends: z.string().optional().describe('Name of the parent metadata to extend/override'),
  strategy: z.enum(['merge', 'replace']).default('merge'),

  /** Owner (for user-scope items) */
  owner: z.string().optional(),
  
  /** State */
  state: MetadataStateSchema.default('active'),
  
  /** Audit */
  createdBy: z.string().optional(),
  createdAt: z.string().datetime().optional().describe('Creation timestamp'),
  updatedBy: z.string().optional(),
  updatedAt: z.string().datetime().optional().describe('Last update timestamp'),
});

export type MetadataRecord = z.infer<typeof MetadataRecordSchema>;
export type MetadataScope = z.infer<typeof MetadataScopeSchema>;
export type MetadataDatasourceConfig = z.infer<typeof MetadataDatasourceConfigSchema>;

/**
 * Metadata Format
 * Supported file formats for metadata serialization.
 */
export const MetadataFormatSchema = z.enum([
  'json', 'yaml', 'yml', 'ts', 'js',
  'typescript', 'javascript' // Aliases
]);

/**
 * Metadata Stats
 * Statistics about a metadata item.
 */
export const MetadataStatsSchema = z.object({
  path: z.string().optional(),
  size: z.number().optional(),
  mtime: z.string().datetime().optional(),
  hash: z.string().optional(),
  etag: z.string().optional(), // Required by local cache
  modifiedAt: z.string().datetime().optional(), // Alias for mtime
  format: MetadataFormatSchema.optional(), // Required for serialization
});

/**
 * Metadata Datasource Configuration
 * Configuration for database-backed metadata storage.
 * Allows metadata to be loaded from and saved to any datasource.
 */
export const MetadataDatasourceConfigSchema = z.object({
  /**
   * Datasource name (references a configured datasource)
   * This decouples metadata storage from specific driver implementation
   */
  datasource: z.string().describe('Datasource name for metadata storage'),
  
  /**
   * Table/Collection name for metadata storage
   * Default: '_framework_metadata' or 'metadata'
   */
  table: z.string().default('_framework_metadata').describe('Table/collection name'),
  
  /**
   * Schema name (for databases that support schemas)
   */
  schema: z.string().optional().describe('Database schema name'),
  
  /**
   * Enable automatic table creation/migration
   */
  autoMigrate: z.boolean().default(true).describe('Automatically create/update table schema'),
  
  /**
   * Cache configuration for database-backed metadata
   */
  cache: z.object({
    enabled: z.boolean().default(true).describe('Enable metadata caching'),
    ttlSeconds: z.number().default(3600).describe('Cache TTL in seconds'),
    invalidateOnWrite: z.boolean().default(true).describe('Invalidate cache on write'),
  }).optional().describe('Caching configuration'),
  
  /**
   * Query optimization options
   */
  queryOptions: z.object({
    batchSize: z.number().default(100).describe('Batch size for bulk operations'),
    useIndexes: z.boolean().default(true).describe('Use database indexes'),
    parallelLoad: z.boolean().default(false).describe('Load metadata types in parallel'),
  }).optional().describe('Query optimization options'),
});

/**
 * Metadata Loader Contract
 * Describes the capabilities and identity of a metadata loader.
 */
export const MetadataLoaderContractSchema = z.object({
  name: z.string(),
  protocol: z.string(), // e.g. 'file:', 'http:', 's3:', 'database:'
  description: z.string().optional(),
  supportedFormats: z.array(z.string()).optional(),
  supportsWatch: z.boolean().optional(),
  supportsWrite: z.boolean().optional(),
  supportsCache: z.boolean().optional(),
  capabilities: z.object({
    read: z.boolean().default(true),
    write: z.boolean().default(false),
    watch: z.boolean().default(false),
    list: z.boolean().default(true),
  }),
  
  /**
   * Datasource configuration (for database-backed loaders)
   * When specified, this loader will use the datasource for storage
   */
  datasourceConfig: MetadataDatasourceConfigSchema.optional().describe('Database datasource configuration'),
});

/**
 * Metadata Load Options
 */
export const MetadataLoadOptionsSchema = z.object({
  scope: MetadataScopeSchema.optional(),
  namespace: z.string().optional(),
  raw: z.boolean().optional().describe('Return raw file content instead of parsed JSON'),
  cache: z.boolean().optional(),
  useCache: z.boolean().optional(), // Alias for cache
  validate: z.boolean().optional(),
  ifNoneMatch: z.string().optional(), // For caching
  recursive: z.boolean().optional(),
  limit: z.number().optional(),
  patterns: z.array(z.string()).optional(),
  loader: z.string().optional().describe('Specific loader to use (e.g. filesystem, database)'),
  
  /**
   * Datasource name for database-backed loading
   * When specified, metadata will be loaded from the datasource instead of filesystem
   */
  datasource: z.string().optional().describe('Datasource name for database-backed loading'),
  
  /**
   * Database query filters (for database-backed loaders)
   * Applied as WHERE clause when loading from database
   */
  filters: z.record(z.string(), z.unknown()).optional().describe('Database query filters'),
  
  /**
   * Sort order (for database-backed loaders)
   */
  sort: z.object({
    field: z.string().describe('Field to sort by'),
    order: z.enum(['asc', 'desc']).default('asc').describe('Sort order'),
  }).optional().describe('Sort configuration'),
});

/**
 * Metadata Load Result
 */
export const MetadataLoadResultSchema = z.object({
  data: z.unknown(),
  stats: MetadataStatsSchema.optional(),
  format: MetadataFormatSchema.optional(),
  source: z.string().optional(), // File path or URL
  fromCache: z.boolean().optional(),
  etag: z.string().optional(),
  notModified: z.boolean().optional(),
  loadTime: z.number().optional(),
});

/**
 * Metadata Save Options
 */
export const MetadataSaveOptionsSchema = z.object({
  format: MetadataFormatSchema.optional(),
  create: z.boolean().default(true),
  overwrite: z.boolean().default(true),
  path: z.string().optional(),
  prettify: z.boolean().optional(),
  indent: z.number().optional(),
  sortKeys: z.boolean().optional(),
  backup: z.boolean().optional(),
  atomic: z.boolean().optional(),
  loader: z.string().optional().describe('Specific loader to use (e.g. filesystem, database)'),
  
  /**
   * Datasource name for database-backed saving
   * When specified, metadata will be saved to the datasource instead of filesystem
   */
  datasource: z.string().optional().describe('Datasource name for database-backed saving'),
  
  /**
   * Transaction configuration (for database-backed savers)
   */
  transaction: z.object({
    enabled: z.boolean().default(false).describe('Use database transaction'),
    isolationLevel: z.enum(['read_uncommitted', 'read_committed', 'repeatable_read', 'serializable'])
      .optional()
      .describe('Transaction isolation level'),
  }).optional().describe('Transaction configuration'),
  
  /**
   * Conflict resolution strategy (for database-backed savers)
   */
  onConflict: z.enum(['error', 'skip', 'update', 'replace'])
    .default('update')
    .describe('How to handle conflicts on save'),
});

/**
 * Metadata Save Result
 */
export const MetadataSaveResultSchema = z.object({
  success: z.boolean(),
  path: z.string().optional(),
  stats: MetadataStatsSchema.optional(),
  etag: z.string().optional(),
  size: z.number().optional(),
  saveTime: z.number().optional(),
  backupPath: z.string().optional(),
});

/**
 * Metadata Watch Event
 */
export const MetadataWatchEventSchema = z.object({
  type: z.enum(['add', 'change', 'unlink', 'added', 'changed', 'deleted']),
  path: z.string(),
  name: z.string().optional(),
  stats: MetadataStatsSchema.optional(),
  metadataType: z.string().optional(),
  data: z.unknown().optional(),
  timestamp: z.string().datetime().optional(),
});

/**
 * Metadata Collection Info
 */
export const MetadataCollectionInfoSchema = z.object({
  type: z.string(),
  count: z.number(),
  namespaces: z.array(z.string()),
});

/**
 * Metadata Export/Import Options
 */
export const MetadataExportOptionsSchema = z.object({
  types: z.array(z.string()).optional(),
  namespaces: z.array(z.string()).optional(),
  output: z.string().describe('Output directory or file'),
  format: MetadataFormatSchema.default('json'),
});

export const MetadataImportOptionsSchema = z.object({
  source: z.string().describe('Input directory or file'),
  strategy: z.enum(['merge', 'replace', 'skip']).default('merge'),
  validate: z.boolean().default(true),
});

/**
 * Metadata Manager Config
 */
export const MetadataManagerConfigSchema = z.object({
  loaders: z.array(z.unknown()).optional(),
  watch: z.boolean().optional(),
  cache: z.boolean().optional(),
  basePath: z.string().optional(),
  rootDir: z.string().optional(),
  formats: z.array(MetadataFormatSchema).optional(),
  watchOptions: z.unknown().optional(), // Chokidar options
});

export type MetadataFormat = z.infer<typeof MetadataFormatSchema>;
export type MetadataStats = z.infer<typeof MetadataStatsSchema>;
export type MetadataLoaderContract = z.infer<typeof MetadataLoaderContractSchema>;
export type MetadataLoadOptions = z.infer<typeof MetadataLoadOptionsSchema>;
export type MetadataLoadResult = z.infer<typeof MetadataLoadResultSchema>;
export type MetadataSaveOptions = z.infer<typeof MetadataSaveOptionsSchema>;
export type MetadataSaveResult = z.infer<typeof MetadataSaveResultSchema>;
export type MetadataWatchEvent = z.infer<typeof MetadataWatchEventSchema>;
export type MetadataCollectionInfo = z.infer<typeof MetadataCollectionInfoSchema>;
export type MetadataExportOptions = z.infer<typeof MetadataExportOptionsSchema>;
export type MetadataImportOptions = z.infer<typeof MetadataImportOptionsSchema>;
export type MetadataManagerConfig = z.infer<typeof MetadataManagerConfigSchema>;
