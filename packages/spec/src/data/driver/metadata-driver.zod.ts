// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Metadata Driver Protocol
 * 
 * Defines the standard interface for database-backed metadata storage.
 * This protocol enables metadata to be stored in any datasource (SQL, NoSQL, etc.)
 * instead of being locked to filesystem-based storage.
 * 
 * Key Design Principles:
 * 1. Datasource Agnostic: Works with any configured datasource
 * 2. Schema Flexible: Supports both structured (SQL) and schemaless (NoSQL) stores
 * 3. Performance Optimized: Built-in caching and batching support
 * 4. Transaction Safe: Supports ACID operations where available
 */

/**
 * Metadata Table Schema
 * Defines the structure of the metadata storage table/collection
 */
export const MetadataTableSchemaSchema = z.object({
  /**
   * Table/Collection name
   */
  name: z.string().default('_framework_metadata').describe('Table or collection name'),
  
  /**
   * Database schema (for RDBMS)
   */
  schema: z.string().optional().describe('Database schema name'),
  
  /**
   * Primary key field name
   */
  primaryKey: z.string().default('id').describe('Primary key field name'),
  
  /**
   * Indexes for performance
   */
  indexes: z.array(z.object({
    name: z.string().describe('Index name'),
    fields: z.array(z.string()).describe('Indexed fields'),
    unique: z.boolean().default(false).describe('Unique constraint'),
    type: z.enum(['btree', 'hash', 'gin', 'gist']).optional().describe('Index type'),
  })).optional().describe('Table indexes'),
  
  /**
   * Column/Field mappings
   * Maps metadata record fields to database columns
   */
  columnMapping: z.object({
    id: z.string().default('id'),
    name: z.string().default('name'),
    type: z.string().default('type'),
    namespace: z.string().default('namespace'),
    scope: z.string().default('scope'),
    metadata: z.string().default('metadata'),
    extends: z.string().default('extends'),
    strategy: z.string().default('strategy'),
    owner: z.string().default('owner'),
    state: z.string().default('state'),
    createdBy: z.string().default('created_by'),
    createdAt: z.string().default('created_at'),
    updatedBy: z.string().default('updated_by'),
    updatedAt: z.string().default('updated_at'),
  }).optional().describe('Column name mappings'),
});

/**
 * Metadata Driver Configuration
 * Configuration for database-backed metadata driver
 */
export const MetadataDriverConfigSchema = z.object({
  /**
   * Datasource reference
   * Name of the datasource to use for metadata storage
   */
  datasource: z.string().describe('Datasource name'),
  
  /**
   * Table schema configuration
   */
  tableSchema: MetadataTableSchemaSchema.optional().describe('Table schema configuration'),
  
  /**
   * Auto-migration settings
   */
  migration: z.object({
    autoMigrate: z.boolean().default(true).describe('Automatically create/update table'),
    dropOnMigrate: z.boolean().default(false).describe('Drop table before creating (dangerous)'),
    backupBeforeMigrate: z.boolean().default(true).describe('Backup data before migration'),
  }).optional().describe('Migration configuration'),
  
  /**
   * Performance settings
   */
  performance: z.object({
    batchSize: z.number().default(100).describe('Batch size for bulk operations'),
    enableCache: z.boolean().default(true).describe('Enable in-memory caching'),
    cacheTtlSeconds: z.number().default(3600).describe('Cache TTL in seconds'),
    prefetchOnInit: z.boolean().default(true).describe('Prefetch all metadata on initialization'),
    parallelLoad: z.boolean().default(false).describe('Load metadata types in parallel'),
  }).optional().describe('Performance optimization'),
  
  /**
   * Transaction settings
   */
  transaction: z.object({
    defaultIsolation: z.enum(['read_uncommitted', 'read_committed', 'repeatable_read', 'serializable'])
      .default('read_committed')
      .describe('Default transaction isolation level'),
    timeout: z.number().default(30000).describe('Transaction timeout in milliseconds'),
    retryOnConflict: z.boolean().default(true).describe('Retry on conflict'),
    maxRetries: z.number().default(3).describe('Maximum retry attempts'),
  }).optional().describe('Transaction configuration'),
  
  /**
   * Query optimization
   */
  query: z.object({
    useIndexes: z.boolean().default(true).describe('Use database indexes'),
    maxResultSize: z.number().optional().describe('Maximum result set size'),
    enablePagination: z.boolean().default(true).describe('Enable result pagination'),
    defaultPageSize: z.number().default(100).describe('Default page size'),
  }).optional().describe('Query optimization'),
});

/**
 * Metadata Query Filters
 * Structured filters for querying metadata from database
 */
export const MetadataQueryFiltersSchema = z.object({
  /**
   * Filter by metadata type(s)
   */
  type: z.union([z.string(), z.array(z.string())]).optional().describe('Metadata type filter'),
  
  /**
   * Filter by name(s)
   */
  name: z.union([z.string(), z.array(z.string())]).optional().describe('Name filter'),
  
  /**
   * Filter by namespace(s)
   */
  namespace: z.union([z.string(), z.array(z.string())]).optional().describe('Namespace filter'),
  
  /**
   * Filter by scope(s)
   */
  scope: z.union([
    z.enum(['system', 'platform', 'user']),
    z.array(z.enum(['system', 'platform', 'user']))
  ]).optional().describe('Scope filter'),
  
  /**
   * Filter by state(s)
   */
  state: z.union([
    z.enum(['draft', 'active', 'archived', 'deprecated']),
    z.array(z.enum(['draft', 'active', 'archived', 'deprecated']))
  ]).optional().describe('State filter'),
  
  /**
   * Filter by owner
   */
  owner: z.string().optional().describe('Owner filter'),
  
  /**
   * Custom filters (database-specific)
   */
  custom: z.record(z.string(), z.unknown()).optional().describe('Custom filter conditions'),
});

/**
 * Metadata Query Options
 * Options for querying metadata from database
 */
export const MetadataQueryOptionsSchema = z.object({
  /**
   * Query filters
   */
  filters: MetadataQueryFiltersSchema.optional().describe('Query filters'),
  
  /**
   * Sort configuration
   */
  sort: z.array(z.object({
    field: z.string().describe('Field to sort by'),
    order: z.enum(['asc', 'desc']).default('asc').describe('Sort order'),
  })).optional().describe('Sort configuration'),
  
  /**
   * Pagination
   */
  pagination: z.object({
    page: z.number().min(1).default(1).describe('Page number (1-based)'),
    pageSize: z.number().min(1).max(1000).default(100).describe('Page size'),
  }).optional().describe('Pagination options'),
  
  /**
   * Field selection
   */
  select: z.array(z.string()).optional().describe('Fields to select'),
  
  /**
   * Include deleted/archived records
   */
  includeArchived: z.boolean().default(false).describe('Include archived records'),
});

/**
 * Metadata Bulk Operation
 * Configuration for bulk metadata operations
 */
export const MetadataBulkOperationSchema = z.object({
  /**
   * Operation type
   */
  operation: z.enum(['create', 'update', 'delete', 'upsert']).describe('Operation type'),
  
  /**
   * Records to operate on
   */
  records: z.array(z.unknown()).describe('Metadata records'),
  
  /**
   * Batch configuration
   */
  batch: z.object({
    size: z.number().default(100).describe('Batch size'),
    parallel: z.boolean().default(false).describe('Execute batches in parallel'),
    continueOnError: z.boolean().default(false).describe('Continue on error'),
  }).optional().describe('Batch processing options'),
  
  /**
   * Transaction mode
   */
  transactional: z.boolean().default(true).describe('Use transaction for bulk operation'),
});

/**
 * Metadata Migration Operation
 * Schema migration operations for metadata storage
 */
export const MetadataMigrationOperationSchema = z.object({
  /**
   * Migration type
   */
  type: z.enum(['create', 'alter', 'drop', 'backup', 'restore']).describe('Migration type'),
  
  /**
   * Target table
   */
  table: z.string().describe('Target table name'),
  
  /**
   * Migration script (SQL or driver-specific)
   */
  script: z.string().optional().describe('Migration script'),
  
  /**
   * Rollback script
   */
  rollbackScript: z.string().optional().describe('Rollback script'),
  
  /**
   * Dry run mode (don't execute, just validate)
   */
  dryRun: z.boolean().default(false).describe('Dry run mode'),
});

// Export types
export type MetadataTableSchema = z.infer<typeof MetadataTableSchemaSchema>;
export type MetadataDriverConfig = z.infer<typeof MetadataDriverConfigSchema>;
export type MetadataQueryFilters = z.infer<typeof MetadataQueryFiltersSchema>;
export type MetadataQueryOptions = z.infer<typeof MetadataQueryOptionsSchema>;
export type MetadataBulkOperation = z.infer<typeof MetadataBulkOperationSchema>;
export type MetadataMigrationOperation = z.infer<typeof MetadataMigrationOperationSchema>;
