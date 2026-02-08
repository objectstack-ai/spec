import { z } from 'zod';
import { AnalyticsQuerySchema, CubeSchema } from '../data/analytics.zod';
import { BaseResponseSchema } from './contract.zod';

/**
 * Analytics API Protocol
 * 
 * Defines the HTTP interface for the Semantic Layer.
 * Provides endpoints for executing analytical queries and discovering metadata.
 */

// ==========================================
// 1. API Endpoints
// ==========================================

export const AnalyticsEndpoint = z.enum([
  '/api/v1/analytics/query', // Execute analysis
  '/api/v1/analytics/meta',  // Discover cubes/metrics
  '/api/v1/analytics/sql',   // Dry-run SQL generation
]).describe('Available analytics API endpoints');

// ==========================================
// 2. Query Execution
// ==========================================

/**
 * Query Request Body
 */
export const AnalyticsQueryRequestSchema = z.object({
  query: AnalyticsQuerySchema.describe(' The analytic query definition'),
  cube: z.string().describe('Target cube name'),
  format: z.enum(['json', 'csv', 'xlsx']).default('json').describe('Response format'),
});

/**
 * Query Response (JSON)
 */
export const AnalyticsResultResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    rows: z.array(z.record(z.string(), z.unknown())).describe('Result rows'),
    fields: z.array(z.object({
      name: z.string().describe('Column name'),
      type: z.string().describe('Data type'),
    })).describe('Column metadata'),
    sql: z.string().optional().describe('Executed SQL (if debug enabled)'),
  }).describe('Analytics query result data'),
});

// ==========================================
// 3. Metadata Discovery
// ==========================================

/**
 * Meta Request
 */
export const GetAnalyticsMetaRequestSchema = z.object({
  cube: z.string().optional().describe('Optional cube name to filter'),
});

/**
 * Meta Response
 * Returns available cubes, metrics, and dimensions.
 */
export const AnalyticsMetadataResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    cubes: z.array(CubeSchema).describe('Available cubes'),
  }).describe('Analytics metadata including cubes, metrics, and dimensions'),
});

// ==========================================
// 4. SQL Dry-Run
// ==========================================

export const AnalyticsSqlResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    sql: z.string().describe('Generated SQL query'),
    params: z.array(z.unknown()).describe('Query parameters'),
  }).describe('SQL dry-run result'),
});

export type AnalyticsEndpoint = z.infer<typeof AnalyticsEndpoint>;
export type AnalyticsMetadataResponse = z.infer<typeof AnalyticsMetadataResponseSchema>;
export type AnalyticsSqlResponse = z.infer<typeof AnalyticsSqlResponseSchema>;
