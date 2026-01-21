import { z } from 'zod';
import { QuerySchema } from '../data/query.zod';

/**
 * Common Driver Options
 * Passed to most driver methods to control behavior (transactions, timeouts, etc.)
 */
export const DriverOptionsSchema = z.object({
  /**
   * Transaction handle/identifier.
   * If provided, the operation must run within this transaction.
   */
  transaction: z.any().optional().describe('Transaction handle'),

  /**
   * Operation timeout in milliseconds.
   */
  timeout: z.number().optional().describe('Timeout in ms'),

  /**
   * Whether to bypass cache and force a fresh read.
   */
  skipCache: z.boolean().optional().describe('Bypass cache'),
});

/**
 * Driver Capabilities Schema
 * 
 * Defines what features a database driver supports.
 * This allows ObjectQL to adapt its behavior based on underlying database capabilities.
 */
export const DriverCapabilitiesSchema = z.object({
  // ============================================================================
  // Transaction & Connection Management
  // ============================================================================
  
  /**
   * Whether the driver supports database transactions.
   * If true, beginTransaction, commit, and rollback must be implemented.
   */
  transactions: z.boolean().describe('Supports transactions'),

  // ============================================================================
  // Query Operations
  // ============================================================================
  
  /**
   * Whether the driver supports WHERE clause filters.
   * If false, ObjectQL will fetch all records and filter in memory.
   * 
   * Example: Memory driver might not support complex filter conditions.
   */
  queryFilters: z.boolean().describe('Supports WHERE clause filtering'),

  /**
   * Whether the driver supports aggregation functions (COUNT, SUM, AVG, etc.).
   * If false, ObjectQL will compute aggregations in memory.
   */
  queryAggregations: z.boolean().describe('Supports GROUP BY and aggregation functions'),

  /**
   * Whether the driver supports ORDER BY sorting.
   * If false, ObjectQL will sort results in memory.
   */
  querySorting: z.boolean().describe('Supports ORDER BY sorting'),

  /**
   * Whether the driver supports LIMIT/OFFSET pagination.
   * If false, ObjectQL will fetch all records and paginate in memory.
   */
  queryPagination: z.boolean().describe('Supports LIMIT/OFFSET pagination'),

  /**
   * Whether the driver supports window functions (ROW_NUMBER, RANK, LAG, LEAD, etc.).
   * If false, ObjectQL will compute window functions in memory.
   */
  queryWindowFunctions: z.boolean().describe('Supports window functions with OVER clause'),

  /**
   * Whether the driver supports subqueries (nested SELECT statements).
   * If false, ObjectQL will execute queries separately and combine results.
   */
  querySubqueries: z.boolean().describe('Supports subqueries'),

  /**
   * Whether the driver supports SQL-style joins.
   * If false, ObjectQL will fetch related data separately and join in memory.
   */
  joins: z.boolean().describe('Supports SQL joins'),

  // ============================================================================
  // Advanced Features
  // ============================================================================
  
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
 * Unified Database Driver Interface
 * 
 * This is the contract that all storage adapters (Postgres, Mongo, Excel, Salesforce) must implement.
 * It abstracts the underlying engine, enabling ObjectStack to be "Database Agnostic".
 */
export const DriverInterfaceSchema = z.object({
  /**
   * Driver name (e.g., 'postgresql', 'mongodb', 'rest_api').
   */
  name: z.string().describe('Driver unique name'),

  /**
   * Driver version.
   */
  version: z.string().describe('Driver version'),

  /**
   * Capabilities descriptor.
   */
  supports: DriverCapabilitiesSchema,

  // ============================================================================
  // Lifecycle Management
  // ============================================================================

  /**
   * Initialize connection pool or authenticate.
   */
  connect: z.function()
    .returns(z.promise(z.void()))
    .describe('Establish connection'),

  /**
   * Close connections and cleanup resources.
   */
  disconnect: z.function()
    .returns(z.promise(z.void()))
    .describe('Close connection'),

  /**
   * Check connection health.
   * @returns true if healthy, false otherwise.
   */
  checkHealth: z.function()
    .returns(z.promise(z.boolean()))
    .describe('Health check'),

  // ============================================================================
  // Raw Execution (Escape Hatch)
  // ============================================================================

  /**
   * Execute a raw command/query native to the driver.
   * Useful for complex reports, stored procedures, or DDL not covered by standard sync.
   * 
   * @param command - The raw command (e.g., SQL string, shell command, or remote API payload).
   * @param parameters - Optional array of bound parameters for safe execution (prevention of injection).
   * @param options - Driver options (transaction context, timeout).
   * @returns Promise resolving to the raw result from the driver.
   * 
   * @example
   * // SQL Driver
   * await driver.execute('SELECT * FROM complex_view WHERE id = ?', [123]);
   * 
   * // Mongo Driver
   * await driver.execute({ aggregate: 'orders', pipeline: [...] });
   */
  execute: z.function()
    .args(z.any(), z.array(z.any()).optional(), DriverOptionsSchema.optional())
    .returns(z.promise(z.any()))
    .describe('Execute raw command'),

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Find multiple records matching the structured query.
   * Parsing the QueryAST is the responsibility of the driver implementation.
   * 
   * @param object - The name of the object/table to query (e.g. 'account').
   * @param query - The structured QueryAST (filters, sorts, joins, pagination).
   * @param options - Driver options.
   * @returns Array of records.
   * 
   * @example
   * await driver.find('account', {
   *   filters: [['status', '=', 'active'], 'and', ['amount', '>', 500]],
   *   sort: [{ field: 'created_at', order: 'desc' }],
   *   top: 10
   * });
   * @returns Array of records.
   *          MUST return `id` as string. MUST NOT return implementation details like `_id`.
   */
  find: z.function()
    .args(z.string(), QuerySchema, DriverOptionsSchema.optional())
    .returns(z.promise(z.array(z.record(z.any()))))
    .describe('Find records'),

  /**
   * Find a single record by query.
   * Similar to find(), but returns only the first match or null.
   * 
   * @param object - The name of the object.
   * @param query - QueryAST.
   * @param options - Driver options.
   * @returns The record or null.
   *          MUST return `id` as string. MUST NOT return implementation details like `_id`.
   */
  findOne: z.function()
    .args(z.string(), QuerySchema, DriverOptionsSchema.optional())
    .returns(z.promise(z.record(z.any()).nullable()))
    .describe('Find one record'),

  /**
   * Create a new record.
   * 
   * @param object - The object name.
   * @param data - Key-value map of field data.
   * @param options - Driver options.
   * @returns The created record, including server-generated fields (id, created_at, etc.).
   *          MUST return `id` as string. MUST NOT return implementation details like `_id`.
   */
  create: z.function()
    .args(z.string(), z.record(z.any()), DriverOptionsSchema.optional())
    .returns(z.promise(z.record(z.any())))
    .describe('Create record'),

  /**
   * Update an existing record by ID.
   * 
   * @param object - The object name.
   * @param id - The unique identifier of the record.
   * @param data - The fields to update.
   * @param options - Driver options.
   * @returns The updated record.
   *          MUST return `id` as string. MUST NOT return implementation details like `_id`.
   */
  update: z.function()
    .args(z.string(), z.string().or(z.number()), z.record(z.any()), DriverOptionsSchema.optional())
    .returns(z.promise(z.record(z.any())))
    .describe('Update record'),

  /**
   * Delete a record by ID.
   * 
   * @param object - The object name.
   * @param id - The unique identifier of the record.
   * @param options - Driver options.
   * @returns True if deleted, false if not found.
   */
  delete: z.function()
    .args(z.string(), z.string().or(z.number()), DriverOptionsSchema.optional())
    .returns(z.promise(z.boolean()))
    .describe('Delete record'),

  /**
   * Count records matching a query.
   * 
   * @param object - The object name.
   * @param query - Optional filtering criteria.
   * @param options - Driver options.
   * @returns Total count.
   */
  count: z.function()
    .args(z.string(), QuerySchema.optional(), DriverOptionsSchema.optional())
    .returns(z.promise(z.number()))
    .describe('Count records'),

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Create multiple records in a single batch.
   * Optimized for performance.
   * 
   * @param object - The object name.
   * @param dataArray - Array of record data.
   * @returns Array of created records.
   */
  bulkCreate: z.function()
    .args(z.string(), z.array(z.record(z.any())), DriverOptionsSchema.optional())
    .returns(z.promise(z.array(z.record(z.any())))),

  /**
   * Update multiple records in a single batch.
   * 
   * @param object - The object name.
   * @param updates - Array of objects containing {id, data}.
   * @returns Array of updated records.
   */
  bulkUpdate: z.function()
    .args(z.string(), z.array(z.object({ id: z.string().or(z.number()), data: z.record(z.any()) })), DriverOptionsSchema.optional())
    .returns(z.promise(z.array(z.record(z.any())))),

  /**
   * Delete multiple records in a single batch.
   * 
   * @param object - The object name.
   * @param ids - Array of record IDs.
   */
  bulkDelete: z.function()
    .args(z.string(), z.array(z.string().or(z.number())), DriverOptionsSchema.optional())
    .returns(z.promise(z.void())),

  // ============================================================================
  // Transaction Management
  // ============================================================================

  /**
   * Begin a new database transaction.
   * @returns A transaction handle to be passed to subsequent operations via `options.transaction`.
   */
  beginTransaction: z.function()
    .returns(z.promise(z.any()))
    .describe('Start transaction'),

  /**
   * Commit the transaction.
   * @param transaction - The transaction handle.
   */
  commit: z.function()
    .args(z.any())
    .returns(z.promise(z.void()))
    .describe('Commit transaction'),

  /**
   * Rollback the transaction.
   * @param transaction - The transaction handle.
   */
  rollback: z.function()
    .args(z.any())
    .returns(z.promise(z.void()))
    .describe('Rollback transaction'),

  // ============================================================================
  // Schema Management
  // ============================================================================

  /**
   * Synchronize the database schema with the Object definition.
   * This is an idempotent operation: it should create tables if missing, 
   * add columns if missing, and update indexes.
   * 
   * @param object - The object name.
   * @param schema - The full Object Schema (fields, indexes, etc).
   * @param options - Driver options.
   */
  syncSchema: z.function()
    .args(z.string(), z.any(), DriverOptionsSchema.optional())
    .returns(z.promise(z.void()))
    .describe('Sync object schema to DB'),
  
  /**
   * Drop the underlying table or collection for an object.
   * WARNING: Destructive operation.
   * 
   * @param object - The object name.
   */
  dropTable: z.function()
    .args(z.string(), DriverOptionsSchema.optional())
    .returns(z.promise(z.void())),
});

/**
 * TypeScript types
 */
export type DriverOptions = z.infer<typeof DriverOptionsSchema>;
export type DriverCapabilities = z.infer<typeof DriverCapabilitiesSchema>;
export type DriverInterface = z.infer<typeof DriverInterfaceSchema>;
