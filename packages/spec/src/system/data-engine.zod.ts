import { z } from 'zod';
import { FilterConditionSchema } from '../data/filter.zod';
import { SortNodeSchema } from '../data/query.zod';

/**
 * Data Engine Protocol
 * 
 * Defines the standard interface for data persistence engines in ObjectStack.
 * This protocol abstracts the underlying storage mechanism (SQL, NoSQL, API, Memory),
 * allowing the ObjectQL engine to execute standardized CRUD and Aggregation operations
 * regardless of where the data resides.
 * 
 * The Data Engine acts as the "Driver" layer in the Hexagonal Architecture.
 */

// ==========================================================================
// 1. Shared Definitions
// ==========================================================================

/**
 * Data Engine Query filter conditions
 * Supports simple key-value map or complex Logic/Field expressions (DSL)
 */
export const DataEngineFilterSchema = z.union([
  z.record(z.any()),
  FilterConditionSchema
]).describe('Data Engine query filter conditions');

/**
 * Sort order definition
 * Supports:
 * - { name: 'asc' }
 * - { name: 1 }
 * - [{ field: 'name', order: 'asc' }]
 */
export const DataEngineSortSchema = z.union([
  z.record(z.enum(['asc', 'desc'])), 
  z.record(z.union([z.literal(1), z.literal(-1)])),
  z.array(SortNodeSchema)
]).describe('Sort order definition');

// ==========================================================================
// 2. method: FIND
// ==========================================================================

export const DataEngineQueryOptionsSchema = z.object({
  /** Filter conditions (WHERE) */
  filter: DataEngineFilterSchema.optional(),
  
  /** Fields to select (SELECT) */
  select: z.array(z.string()).optional(),
  
  /** Sort order (ORDER BY) */
  sort: DataEngineSortSchema.optional(),
  
  /** Limit number of results (LIMIT) */
  limit: z.number().int().min(1).optional(),
  
  /** Skip number of results (OFFSET) */
  skip: z.number().int().min(0).optional(),
  
  /** 
   * Maximum number of results (OData style)
   * Takes precedence over limit if both specified
   */
  top: z.number().int().min(1).optional(),

  /**
   * Include related records (JOIN/Populate)
   * List of relationship field names to expand
   */
  populate: z.array(z.string()).optional(),
}).describe('Query options for IDataEngine.find() operations');

// ==========================================================================
// 3. method: INSERT
// ==========================================================================

export const DataEngineInsertOptionsSchema = z.object({
  /** 
   * Return the inserted record(s)? 
   * Some drivers support RETURNING clause for efficiency.
   * Default: true
   */
  returning: z.boolean().default(true).optional(),
}).describe('Options for DataEngine.insert operations');

// ==========================================================================
// 4. method: UPDATE
// ==========================================================================

export const DataEngineUpdateOptionsSchema = z.object({
  /** Filter conditions to identify records to update */
  filter: DataEngineFilterSchema.optional(),
  
  /** 
   * Perform an upsert? 
   * If true, insert if not found.
   */
  upsert: z.boolean().default(false).optional(),
  
  /**
   * Update multiple records?
   * If false, only the first match is updated.
   * Default: false
   */
  multi: z.boolean().default(false).optional(),
  
  /** 
   * Return the updated record(s)? 
   * Default: false (returns update count/status)
   */
  returning: z.boolean().default(false).optional(),
}).describe('Options for DataEngine.update operations');

// ==========================================================================
// 5. method: DELETE
// ==========================================================================

export const DataEngineDeleteOptionsSchema = z.object({
  /** Filter conditions to identify records to delete */
  filter: DataEngineFilterSchema.optional(),
  
  /**
   * Delete multiple records?
   * If false, only the first match is deleted.
   * Default: false
   */
  multi: z.boolean().default(false).optional(),
}).describe('Options for DataEngine.delete operations');

// ==========================================================================
// 6. method: AGGREGATE
// ==========================================================================

export const DataEngineAggregateOptionsSchema = z.object({
  /** Filter conditions (WHERE) */
  filter: DataEngineFilterSchema.optional(),
  
  /** Group By fields */
  groupBy: z.array(z.string()).optional(),
  
  /** 
   * Aggregation definitions 
   * e.g. [{ field: 'amount', method: 'sum', alias: 'total' }]
   */
  aggregations: z.array(z.object({
    field: z.string(),
    method: z.enum(['count', 'sum', 'avg', 'min', 'max', 'count_distinct']),
    alias: z.string().optional()
  })).optional(),
}).describe('Options for DataEngine.aggregate operations');

// ==========================================================================
// 7. method: COUNT
// ==========================================================================

export const DataEngineCountOptionsSchema = z.object({
  /** Filter conditions */
  filter: DataEngineFilterSchema.optional(),
}).describe('Options for DataEngine.count operations');

// ==========================================================================
// 8. Type Exports
// ==========================================================================

export type DataEngineFilter = z.infer<typeof DataEngineFilterSchema>;
export type DataEngineSort = z.infer<typeof DataEngineSortSchema>;
export type DataEngineQueryOptions = z.infer<typeof DataEngineQueryOptionsSchema>;
export type DataEngineInsertOptions = z.infer<typeof DataEngineInsertOptionsSchema>;
export type DataEngineUpdateOptions = z.infer<typeof DataEngineUpdateOptionsSchema>;
export type DataEngineDeleteOptions = z.infer<typeof DataEngineDeleteOptionsSchema>;
export type DataEngineAggregateOptions = z.infer<typeof DataEngineAggregateOptionsSchema>;
export type DataEngineCountOptions = z.infer<typeof DataEngineCountOptionsSchema>;

