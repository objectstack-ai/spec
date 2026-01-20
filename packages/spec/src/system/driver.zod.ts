import { z } from 'zod';

/**
 * Driver Capabilities Schema
 * 
 * Defines what features a database driver supports.
 * This allows ObjectQL to adapt its behavior based on underlying database capabilities.
 */
export const DriverCapabilitiesSchema = z.object({
  /**
   * Whether the driver supports database transactions.
   * If true, beginTransaction, commit, and rollback must be implemented.
   */
  transactions: z.boolean().describe('Supports transactions'),

  /**
   * Whether the driver supports SQL-style joins.
   * If false, ObjectQL will fetch related data separately and join in memory.
   */
  joins: z.boolean().describe('Supports SQL joins'),

  /**
   * Whether the driver supports full-text search.
   * If true, text search queries can be pushed to the database.
   */
  fullTextSearch: z.boolean().describe('Supports full-text search'),

  /**
   * Whether the driver supports JSON field types.
   * If false, JSON data will be serialized as strings.
   */
  jsonFields: z.boolean().describe('Supports JSON field types'),

  /**
   * Whether the driver supports array field types.
   * If false, arrays will be stored as JSON strings or in separate tables.
   */
  arrayFields: z.boolean().describe('Supports array field types'),
});

/**
 * Driver Interface Schema
 * 
 * This is the unified interface that all database drivers must implement.
 * It enables ObjectQL to work with any database (SQL, NoSQL, SaaS) through a consistent API.
 * 
 * Drivers abstract the underlying database implementation and provide a standard
 * set of CRUD, DDL, and transaction operations.
 * 
 * @example
 * const postgresDriver: DriverInterface = {
 *   name: 'postgresql',
 *   version: '1.0.0',
 *   supports: {
 *     transactions: true,
 *     joins: true,
 *     fullTextSearch: true,
 *     jsonFields: true,
 *     arrayFields: true,
 *   },
 *   // ... implement all required methods
 * };
 */
export const DriverInterfaceSchema = z.object({
  /**
   * Driver name (e.g., 'postgresql', 'mongodb', 'mysql', 'salesforce').
   */
  name: z.string().describe('Driver name'),

  /**
   * Driver version following semantic versioning.
   */
  version: z.string().describe('Driver version'),

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Find multiple records matching the query.
   * 
   * @param object - Object name (e.g., 'account')
   * @param query - Query object with filters, sorting, pagination
   * @returns Promise resolving to array of records
   * 
   * @example
   * await driver.find('account', { 
   *   filters: { status: 'active' },
   *   sort: { created_at: 'desc' },
   *   limit: 10 
   * });
   */
  find: z.function()
    .args(z.string(), z.any())
    .returns(z.promise(z.array(z.record(z.any()))))
    .describe('Find multiple records'),

  /**
   * Find a single record by ID or query.
   * 
   * @param object - Object name
   * @param idOrQuery - Record ID or query object
   * @returns Promise resolving to single record or null
   */
  findOne: z.function()
    .args(z.string(), z.any())
    .returns(z.promise(z.record(z.any()).nullable()))
    .describe('Find single record'),

  /**
   * Create a new record.
   * 
   * @param object - Object name
   * @param data - Record data
   * @returns Promise resolving to created record with generated fields (id, timestamps)
   */
  create: z.function()
    .args(z.string(), z.record(z.any()))
    .returns(z.promise(z.record(z.any())))
    .describe('Create new record'),

  /**
   * Update an existing record.
   * 
   * @param object - Object name
   * @param id - Record ID
   * @param data - Updated fields
   * @returns Promise resolving to updated record
   */
  update: z.function()
    .args(z.string(), z.any(), z.record(z.any()))
    .returns(z.promise(z.record(z.any())))
    .describe('Update existing record'),

  /**
   * Delete a record.
   * 
   * @param object - Object name
   * @param id - Record ID
   * @returns Promise resolving to deletion result
   */
  delete: z.function()
    .args(z.string(), z.any())
    .returns(z.promise(z.any()))
    .describe('Delete record'),

  /**
   * Create multiple records in a single operation.
   * 
   * @param object - Object name
   * @param dataArray - Array of record data
   * @returns Promise resolving to array of created records
   */
  bulkCreate: z.function()
    .args(z.string(), z.array(z.record(z.any())))
    .returns(z.promise(z.array(z.record(z.any()))))
    .describe('Create multiple records'),

  /**
   * Update multiple records in a single operation.
   * 
   * @param object - Object name
   * @param updates - Array of {id, data} objects
   * @returns Promise resolving to array of updated records
   */
  bulkUpdate: z.function()
    .args(z.string(), z.array(z.any()))
    .returns(z.promise(z.array(z.record(z.any()))))
    .describe('Update multiple records'),

  /**
   * Delete multiple records in a single operation.
   * 
   * @param object - Object name
   * @param ids - Array of record IDs
   * @returns Promise resolving to deletion result
   */
  bulkDelete: z.function()
    .args(z.string(), z.array(z.any()))
    .returns(z.promise(z.any()))
    .describe('Delete multiple records'),

  // ============================================================================
  // DDL (Data Definition Language) Operations
  // ============================================================================

  /**
   * Synchronize database schema with object definition.
   * Creates or updates tables, columns, indexes to match the object schema.
   * 
   * @param object - Object name
   * @param schema - Object schema definition
   * @returns Promise resolving when schema is synchronized
   */
  syncSchema: z.function()
    .args(z.string(), z.any())
    .returns(z.promise(z.void()))
    .describe('Synchronize database schema'),

  /**
   * Drop a table/collection from the database.
   * 
   * @param object - Object name
   * @returns Promise resolving when table is dropped
   */
  dropTable: z.function()
    .args(z.string())
    .returns(z.promise(z.void()))
    .describe('Drop table/collection'),

  // ============================================================================
  // Transaction Support (Optional)
  // ============================================================================

  /**
   * Begin a new database transaction.
   * Required if supports.transactions is true.
   * 
   * @returns Promise resolving to transaction handle
   */
  beginTransaction: z.function()
    .returns(z.promise(z.any()))
    .optional()
    .describe('Begin database transaction'),

  /**
   * Commit the current transaction.
   * Required if supports.transactions is true.
   * 
   * @param transaction - Transaction handle from beginTransaction
   * @returns Promise resolving when transaction is committed
   */
  commit: z.function()
    .args(z.any())
    .returns(z.promise(z.void()))
    .optional()
    .describe('Commit transaction'),

  /**
   * Rollback the current transaction.
   * Required if supports.transactions is true.
   * 
   * @param transaction - Transaction handle from beginTransaction
   * @returns Promise resolving when transaction is rolled back
   */
  rollback: z.function()
    .args(z.any())
    .returns(z.promise(z.void()))
    .optional()
    .describe('Rollback transaction'),

  // ============================================================================
  // Capabilities Declaration
  // ============================================================================

  /**
   * Driver capabilities.
   * Declares what features this driver supports.
   */
  supports: DriverCapabilitiesSchema.describe('Driver capabilities'),
});

/**
 * TypeScript types
 */
export type DriverCapabilities = z.infer<typeof DriverCapabilitiesSchema>;
export type DriverInterface = z.infer<typeof DriverInterfaceSchema>;
