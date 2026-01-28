import { z } from 'zod';

/**
 * Data Engine Protocol
 * 
 * Defines the standard interface for data persistence engines.
 * This allows different data engines (ObjectQL, Prisma, TypeORM, etc.)
 * to be used interchangeably through a common interface.
 * 
 * Following the Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete database implementations.
 */

/**
 * Query filter conditions
 */
export const QueryFilterSchema = z.record(z.any()).describe('Query filter conditions');

/**
 * Query options for find operations
 */
export const QueryOptionsSchema = z.object({
  /** Filter conditions */
  filter: QueryFilterSchema.optional(),
  /** Fields to select */
  select: z.array(z.string()).optional(),
  /** Sort order */
  sort: z.record(z.union([z.literal(1), z.literal(-1), z.literal('asc'), z.literal('desc')])).optional(),
  /** Limit number of results (alternative name for top, used by some drivers) */
  limit: z.number().optional(),
  /** Skip number of results (for pagination) */
  skip: z.number().optional(),
  /** Maximum number of results (OData-style, takes precedence over limit if both specified) */
  top: z.number().optional(),
}).describe('Query options for find operations');

/**
 * Data Engine Interface Schema
 * 
 * Defines the contract for data engine implementations.
 */
export const DataEngineSchema = z.object({
  /**
   * Insert a new record
   * 
   * @param objectName - Name of the object/table (e.g., 'user', 'order')
   * @param data - Data to insert
   * @returns Promise resolving to the created record (including generated ID)
   */
  insert: z.function()
    .args(z.string(), z.any())
    .returns(z.promise(z.any()))
    .describe('Insert a new record'),
  
  /**
   * Find records matching a query
   * 
   * @param objectName - Name of the object/table
   * @param query - Query conditions (optional)
   * @returns Promise resolving to an array of matching records
   */
  find: z.function()
    .args(z.string())
    .returns(z.promise(z.array(z.any())))
    .describe('Find records matching a query'),
  
  /**
   * Update a record by ID
   * 
   * @param objectName - Name of the object/table
   * @param id - Record ID
   * @param data - Updated data (partial update)
   * @returns Promise resolving to the updated record
   */
  update: z.function()
    .args(z.string(), z.any(), z.any())
    .returns(z.promise(z.any()))
    .describe('Update a record by ID'),
  
  /**
   * Delete a record by ID
   * 
   * @param objectName - Name of the object/table
   * @param id - Record ID
   * @returns Promise resolving to true if deleted, false otherwise
   */
  delete: z.function()
    .args(z.string(), z.any())
    .returns(z.promise(z.boolean()))
    .describe('Delete a record by ID'),
}).describe('Data Engine Interface');

/**
 * TypeScript types derived from schemas
 */
export type QueryFilter = z.infer<typeof QueryFilterSchema>;
export type QueryOptions = z.infer<typeof QueryOptionsSchema>;

// Define the TypeScript interface manually for better type safety
// Zod function schema doesn't handle optional parameters well
export interface IDataEngine {
  insert(objectName: string, data: any): Promise<any>;
  find(objectName: string, query?: QueryOptions): Promise<any[]>;
  update(objectName: string, id: any, data: any): Promise<any>;
  delete(objectName: string, id: any): Promise<boolean>;
}
