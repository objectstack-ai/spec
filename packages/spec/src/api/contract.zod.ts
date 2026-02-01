import { z } from 'zod';
import { QuerySchema } from '../data/query.zod';

// ==========================================
// 1. Base Envelopes
// ==========================================

export const ApiErrorSchema = z.object({
  code: z.string().describe('Error code (e.g. validation_error)'),
  message: z.string().describe('Readable error message'),
  details: z.any().optional().describe('Additional error context (e.g. field validation errors)'),
});

export const BaseResponseSchema = z.object({
  success: z.boolean().describe('Operation success status'),
  error: ApiErrorSchema.optional().describe('Error details if success is false'),
  meta: z.object({
    timestamp: z.string(),
    duration: z.number().optional(),
    requestId: z.string().optional(),
    traceId: z.string().optional(),
  }).optional().describe('Response metadata'),
});

// ==========================================
// 2. Request Payloads (Inputs)
// ==========================================

export const RecordDataSchema = z.record(z.string(), z.any()).describe('Key-value map of record data');

/**
 * Standard Create Request
 */
export const CreateRequestSchema = z.object({
  data: RecordDataSchema.describe('Record data to insert'),
});

/**
 * Standard Update Request
 */
export const UpdateRequestSchema = z.object({
  data: RecordDataSchema.describe('Partial record data to update'),
});

/**
 * Standard Bulk Request
 */
export const BulkRequestSchema = z.object({
  records: z.array(RecordDataSchema).describe('Array of records to process'),
  allOrNone: z.boolean().default(true).describe('If true, rollback entire transaction on any failure'),
});

/**
 * Export Request
 */
export const ExportRequestSchema = QuerySchema.extend({
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
});

// ==========================================
// 3. Response Payloads (Outputs)
// ==========================================

/**
 * Single Record Response (Get/Create/Update)
 */
export const SingleRecordResponseSchema = BaseResponseSchema.extend({
  data: RecordDataSchema.describe('The requested or modified record'),
});

/**
 * List/Query Response
 */
export const ListRecordResponseSchema = BaseResponseSchema.extend({
  data: z.array(RecordDataSchema).describe('Array of matching records'),
  pagination: z.object({
    total: z.number().describe('Total matching records count'),
    limit: z.number().describe('Page size'),
    offset: z.number().describe('Page offset'),
    hasMore: z.boolean().describe('Are there more pages?'),
  }).describe('Pagination info'),
});

/**
 * Modification Result (for Batch/Bulk operations)
 */
export const ModificationResultSchema = z.object({
  id: z.string().optional().describe('Record ID if processed'),
  success: z.boolean(),
  errors: z.array(ApiErrorSchema).optional(),
});

/**
 * Bulk Operation Response
 */
export const BulkResponseSchema = BaseResponseSchema.extend({
  data: z.array(ModificationResultSchema).describe('Results for each item in the batch'),
});

/**
 * Delete Response
 */
export const DeleteResponseSchema = BaseResponseSchema.extend({
  id: z.string().describe('ID of the deleted record'),
});

// ==========================================
// 4. API Contract Registry
// ==========================================

/**
 * Standard API Contracts map
 * Used for generating SDKs and Documentation
 */
export const ApiContracts = {
  create: {
    input: CreateRequestSchema,
    output: SingleRecordResponseSchema
  },
  update: {
    input: UpdateRequestSchema,
    output: SingleRecordResponseSchema
  },
  delete: {
    input: z.object({}), // usually just ID in URL
    output: DeleteResponseSchema
  },
  get: {
    input: z.object({}), // usually just ID in URL
    output: SingleRecordResponseSchema
  },
  list: {
    input: QuerySchema,
    output: ListRecordResponseSchema
  },
  bulkCreate: {
    input: BulkRequestSchema,
    output: BulkResponseSchema
  },
  bulkUpdate: {
    input: BulkRequestSchema,
    output: BulkResponseSchema
  },
  bulkUpsert: {
    input: BulkRequestSchema,
    output: BulkResponseSchema
  },
  bulkDelete: {
    input: z.object({ ids: z.array(z.string()) }),
    output: BulkResponseSchema
  }
};
