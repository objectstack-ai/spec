// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';
import { DriverDefinitionSchema } from '../datasource.zod';

/**
 * Memory Driver Configuration Schema
 * 
 * Defines the configuration options for the in-memory driver.
 * Reference: objectql/packages/drivers/memory (Mingo-powered production-ready driver)
 * 
 * The memory driver is ideal for:
 * - Unit testing (no database setup required)
 * - Development & prototyping
 * - Edge/Worker environments (Cloudflare Workers, Deno Deploy)
 * - Client-side state management
 * - Temporary data caching
 * - CI/CD pipelines
 */

// ==========================================================================
// 1. Persistence Configuration
// ==========================================================================

/**
 * Optional file-system persistence for the memory store.
 * Enables data survival across process restarts.
 */
export const MemoryPersistenceConfigSchema = z.object({
  /**
   * File path to persist data (JSON format).
   */
  filePath: z.string().describe('File path to persist data'),

  /**
   * Auto-save interval in milliseconds.
   * Data is written to disk on this cadence.
   */
  autoSaveInterval: z.number().min(100).default(5000).describe('Auto-save interval in ms'),
}).describe('File-system persistence configuration');

// ==========================================================================
// 2. Connection Configuration
// ==========================================================================

export const MemoryConfigSchema = z.object({
  /**
   * Initial data to pre-populate the in-memory store.
   * Maps object/table names to arrays of records.
   * Records should include an `id` field; one will be generated if absent.
   * 
   * @example
   * {
   *   users: [
   *     { id: '1', name: 'Alice', email: 'alice@example.com' },
   *     { id: '2', name: 'Bob', email: 'bob@example.com' }
   *   ],
   *   posts: [
   *     { id: '1', title: 'Hello World', author_id: '1' }
   *   ]
   * }
   */
  initialData: z.record(
    z.string(),
    z.array(z.record(z.string(), z.unknown()))
  ).optional().describe('Pre-populated data keyed by object name'),

  /**
   * Enable strict mode.
   * When enabled, operations on missing records throw errors instead of returning null/false.
   */
  strictMode: z.boolean().default(false).describe('Throw on missing records instead of returning null'),

  /**
   * Optional file-system persistence.
   * When configured, the memory store periodically saves to disk
   * and loads existing data on startup.
   */
  persistence: MemoryPersistenceConfigSchema.optional().describe('File-system persistence'),

  /**
   * Fields to index for faster lookups.
   * Maps object names to arrays of field names to index.
   * 
   * @example
   * {
   *   users: ['email', 'role'],
   *   posts: ['author_id', 'status']
   * }
   */
  indexes: z.record(
    z.string(),
    z.array(z.string())
  ).optional().describe('Index configuration per object'),

  /**
   * Maximum number of records per object type.
   * When exceeded, oldest records may be evicted (LRU).
   * Useful for caching or bounded memory usage.
   */
  maxRecordsPerObject: z.number().min(1).optional().describe('Max records per object (memory bound)'),

}).describe('Memory Driver Connection Configuration');

// ==========================================================================
// 3. Driver Definition (Metadata)
// ==========================================================================

/**
 * The static definition of the Memory driver's capabilities and default metadata.
 * Implements the `DriverDefinitionSchema` contract.
 */
export const MemoryDriverSpec = DriverDefinitionSchema.parse({
  id: 'memory',
  label: 'In-Memory',
  description: 'High-performance in-memory driver powered by Mingo (MongoDB-compatible query engine). Supports filtering, aggregation pipelines, sorting, projection.',
  icon: 'memory',
  configSchema: {},
  capabilities: {
    transactions: true,
    // Query
    queryFilters: true,
    queryAggregations: true,
    querySorting: true,
    queryPagination: true,
    // No join, window function, or subquery support
    joins: false,
    queryWindowFunctions: false,
    querySubqueries: false,
    // No full-text search (linear scan)
    fullTextSearch: false,
    // Dynamic schema (no DDL needed)
    dynamicSchema: true,
  },
});

// ==========================================================================
// 4. Derived Types
// ==========================================================================

export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;
export type MemoryPersistenceConfig = z.infer<typeof MemoryPersistenceConfigSchema>;
