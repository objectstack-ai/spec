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
 * Data Engine Query filter conditions
 * Simple key-value filter structure for IDataEngine.find() operations
 */
export const DataEngineFilterSchema = z.record(z.any()).describe('Data Engine query filter conditions');

/**
 * Query options for IDataEngine.find() operations
 */
export const DataEngineQueryOptionsSchema = z.object({
  /** Filter conditions */
  filter: DataEngineFilterSchema.optional(),
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
}).describe('Query options for IDataEngine.find() operations');

/**
 * Data Engine Interface Schema
 * 
 * Defines the contract for data engine implementations.
 * (Deprecated: Moved to @objectstack/core/contracts/data-engine)
 */
/*
export const DataEngineSchema = z.object({
  ...
}).describe('Data Engine Interface');
*/

/**
 * TypeScript types derived from schemas
 */
export type DataEngineFilter = z.infer<typeof DataEngineFilterSchema>;
export type DataEngineQueryOptions = z.infer<typeof DataEngineQueryOptionsSchema>;

// Moved IDataEngine interface to @objectstack/core to separate runtime contract from data schema
// Moved IDataEngine interface to @objectstack/core to separate runtime contract from data schema
