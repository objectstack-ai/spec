import { z } from 'zod';
import { BatchUpdateRequestSchema, BatchUpdateResponseSchema, BatchOptionsSchema } from './batch.zod';
import { MetadataCacheRequestSchema, MetadataCacheResponseSchema } from './http-cache.zod';
import { 
  CreateViewRequestSchema, 
  UpdateViewRequestSchema,
  ListViewsRequestSchema,
  ViewResponseSchema,
  ListViewsResponseSchema 
} from './view-storage.zod';
import { QuerySchema } from '../data/query.zod';

/**
 * ObjectStack Protocol - Zod Schema Definitions
 * 
 * Defines the runtime-validated contract for interacting with ObjectStack metadata and data.
 * Used by API adapters (HTTP, WebSocket, gRPC) to fetch data/metadata without knowing engine internals.
 * 
 * This protocol enables:
 * - Runtime request/response validation at API gateway level
 * - Automatic API documentation generation
 * - Type-safe RPC communication between microservices
 * - Client SDK generation from schemas
 * 
 * Architecture Alignment:
 * - Salesforce: REST API Request/Response schemas
 * - Kubernetes: API Resource schemas with runtime validation
 * - GraphQL: Schema-first API design
 */

// ==========================================
// Discovery & Metadata Operations
// ==========================================

/**
 * Get API Discovery Request
 * No parameters needed
 */
export const GetDiscoveryRequestSchema = z.object({});

/**
 * Get API Discovery Response
 * Returns API version information and capabilities
 */
export const GetDiscoveryResponseSchema = z.object({
  version: z.string().describe('API version (e.g., "v1", "2024-01")'),
  apiName: z.string().describe('API name'),
  capabilities: z.array(z.string()).optional().describe('Supported features/capabilities'),
  endpoints: z.record(z.string(), z.string()).optional().describe('Available endpoint paths'),
});

/**
 * Get Metadata Types Request
 */
export const GetMetaTypesRequestSchema = z.object({});

/**
 * Get Metadata Types Response
 */
export const GetMetaTypesResponseSchema = z.object({
  types: z.array(z.string()).describe('Available metadata type names (e.g., "object", "plugin", "view")'),
});

/**
 * Get Metadata Items Request
 * Get all items of a specific metadata type
 */
export const GetMetaItemsRequestSchema = z.object({
  type: z.string().describe('Metadata type name (e.g., "object", "plugin")'),
});

/**
 * Get Metadata Items Response
 */
export const GetMetaItemsResponseSchema = z.object({
  type: z.string().describe('Metadata type name'),
  items: z.array(z.any()).describe('Array of metadata items'),
});

/**
 * Get Metadata Item Request
 * Get a specific metadata item by type and name
 */
export const GetMetaItemRequestSchema = z.object({
  type: z.string().describe('Metadata type name'),
  name: z.string().describe('Item name (snake_case identifier)'),
});

/**
 * Get Metadata Item Response
 */
export const GetMetaItemResponseSchema = z.object({
  type: z.string().describe('Metadata type name'),
  name: z.string().describe('Item name'),
  item: z.any().describe('Metadata item definition'),
});

/**
 * Get Metadata Item with Cache Request
 * Get a specific metadata item with HTTP cache validation support
 */
export const GetMetaItemCachedRequestSchema = z.object({
  type: z.string().describe('Metadata type name'),
  name: z.string().describe('Item name'),
  cacheRequest: MetadataCacheRequestSchema.optional().describe('Cache validation parameters'),
});

/**
 * Get Metadata Item with Cache Response
 * Uses MetadataCacheResponse from http-cache.zod.ts
 */
export const GetMetaItemCachedResponseSchema = MetadataCacheResponseSchema;

/**
 * Get UI View Request
 * Get UI view definition for an object
 */
export const GetUiViewRequestSchema = z.object({
  object: z.string().describe('Object name (snake_case)'),
  type: z.enum(['list', 'form']).describe('View type'),
});

/**
 * Get UI View Response
 */
export const GetUiViewResponseSchema = z.object({
  object: z.string().describe('Object name'),
  type: z.enum(['list', 'form']).describe('View type'),
  view: z.any().describe('View definition'),
});

// ==========================================
// Data Operations
// ==========================================

/**
 * Find Data Request
 * Query records from an object
 */
export const FindDataRequestSchema = z.object({
  object: z.string().describe('Object name (snake_case)'),
  query: QuerySchema.optional().describe('Query parameters (filter, sort, select, pagination)'),
});

/**
 * Find Data Response
 */
export const FindDataResponseSchema = z.object({
  object: z.string().describe('Object name'),
  records: z.array(z.record(z.string(), z.any())).describe('Array of records'),
  total: z.number().optional().describe('Total count (if requested)'),
  hasMore: z.boolean().optional().describe('Whether more records exist'),
});

/**
 * Get Data Request
 * Get a single record by ID
 */
export const GetDataRequestSchema = z.object({
  object: z.string().describe('Object name'),
  id: z.string().describe('Record ID'),
});

/**
 * Get Data Response
 */
export const GetDataResponseSchema = z.object({
  object: z.string().describe('Object name'),
  id: z.string().describe('Record ID'),
  record: z.record(z.string(), z.any()).describe('Record data'),
});

/**
 * Create Data Request
 */
export const CreateDataRequestSchema = z.object({
  object: z.string().describe('Object name'),
  data: z.record(z.string(), z.any()).describe('Record data to create'),
});

/**
 * Create Data Response
 */
export const CreateDataResponseSchema = z.object({
  object: z.string().describe('Object name'),
  id: z.string().describe('Created record ID'),
  record: z.record(z.string(), z.any()).describe('Created record (with server-generated fields)'),
});

/**
 * Update Data Request
 */
export const UpdateDataRequestSchema = z.object({
  object: z.string().describe('Object name'),
  id: z.string().describe('Record ID to update'),
  data: z.record(z.string(), z.any()).describe('Fields to update'),
});

/**
 * Update Data Response
 */
export const UpdateDataResponseSchema = z.object({
  object: z.string().describe('Object name'),
  id: z.string().describe('Updated record ID'),
  record: z.record(z.string(), z.any()).describe('Updated record'),
});

/**
 * Delete Data Request
 */
export const DeleteDataRequestSchema = z.object({
  object: z.string().describe('Object name'),
  id: z.string().describe('Record ID to delete'),
});

/**
 * Delete Data Response
 */
export const DeleteDataResponseSchema = z.object({
  object: z.string().describe('Object name'),
  id: z.string().describe('Deleted record ID'),
  success: z.boolean().describe('Whether deletion succeeded'),
});

// ==========================================
// Batch Operations
// ==========================================

/**
 * Batch Data Request
 */
export const BatchDataRequestSchema = z.object({
  object: z.string().describe('Object name'),
  request: BatchUpdateRequestSchema.describe('Batch operation request'),
});

/**
 * Batch Data Response
 * Uses BatchUpdateResponse from batch.zod.ts
 */
export const BatchDataResponseSchema = BatchUpdateResponseSchema;

/**
 * Create Many Data Request
 */
export const CreateManyDataRequestSchema = z.object({
  object: z.string().describe('Object name'),
  records: z.array(z.record(z.string(), z.any())).describe('Array of records to create'),
});

/**
 * Create Many Data Response
 */
export const CreateManyDataResponseSchema = z.object({
  object: z.string().describe('Object name'),
  records: z.array(z.record(z.string(), z.any())).describe('Created records'),
  count: z.number().describe('Number of records created'),
});

/**
 * Update Many Data Request
 */
export const UpdateManyDataRequestSchema = z.object({
  object: z.string().describe('Object name'),
  records: z.array(z.object({
    id: z.string().describe('Record ID'),
    data: z.record(z.string(), z.any()).describe('Fields to update'),
  })).describe('Array of updates'),
  options: BatchOptionsSchema.optional().describe('Update options'),
});

/**
 * Update Many Data Response
 * Uses BatchUpdateResponse for consistency
 */
export const UpdateManyDataResponseSchema = BatchUpdateResponseSchema;

/**
 * Delete Many Data Request
 */
export const DeleteManyDataRequestSchema = z.object({
  object: z.string().describe('Object name'),
  ids: z.array(z.string()).describe('Array of record IDs to delete'),
  options: BatchOptionsSchema.optional().describe('Delete options'),
});

/**
 * Delete Many Data Response
 */
export const DeleteManyDataResponseSchema = BatchUpdateResponseSchema;

// ==========================================
// View Storage Operations
// ==========================================

/**
 * All View Storage schemas are imported from view-storage.zod.ts
 * - CreateViewRequest/Response
 * - GetViewRequest/Response
 * - ListViewsRequest/Response
 * - UpdateViewRequest/Response
 * - DeleteViewRequest/Response
 */

export const GetViewRequestSchema = z.object({
  id: z.string().describe('View ID'),
});

export const GetViewResponseSchema = ViewResponseSchema;

export const DeleteViewRequestSchema = z.object({
  id: z.string().describe('View ID to delete'),
});

export const DeleteViewResponseSchema = z.object({
  success: z.boolean().describe('Whether deletion succeeded'),
});

// ==========================================
// Protocol Interface Schema
// ==========================================

/**
 * ObjectStack Protocol Contract
 * 
 * This schema defines the complete API contract as a Zod schema.
 * Unlike the old TypeScript interface, this provides runtime validation
 * and can be used for:
 * - API Gateway validation
 * - RPC call validation
 * - Client SDK generation
 * - API documentation generation
 * 
 * Each method is defined with its request and response schemas.
 */
export const ObjectStackProtocolSchema = z.object({
  // Discovery & Metadata
  getDiscovery: z.function({
    input: z.tuple([GetDiscoveryRequestSchema]),
    output: z.promise(GetDiscoveryResponseSchema)
  }).describe('Get API discovery information'),

  getMetaTypes: z.function({
    input: z.tuple([GetMetaTypesRequestSchema]),
    output: z.promise(GetMetaTypesResponseSchema)
  }).describe('Get available metadata types'),

  getMetaItems: z.function({
    input: z.tuple([GetMetaItemsRequestSchema]),
    output: z.promise(GetMetaItemsResponseSchema)
  }).describe('Get all items of a metadata type'),

  getMetaItem: z.function({
    input: z.tuple([GetMetaItemRequestSchema]),
    output: z.promise(GetMetaItemResponseSchema)
  }).describe('Get a specific metadata item'),

  getMetaItemCached: z.function({
    input: z.tuple([GetMetaItemCachedRequestSchema]),
    output: z.promise(GetMetaItemCachedResponseSchema)
  }).describe('Get a metadata item with cache validation'),

  getUiView: z.function({
    input: z.tuple([GetUiViewRequestSchema]),
    output: z.promise(GetUiViewResponseSchema)
  }).describe('Get UI view definition'),

  // Data Operations
  findData: z.function({
    input: z.tuple([FindDataRequestSchema]),
    output: z.promise(FindDataResponseSchema)
  }).describe('Find data records'),

  getData: z.function({
    input: z.tuple([GetDataRequestSchema]),
    output: z.promise(GetDataResponseSchema)
  }).describe('Get single data record'),

  createData: z.function({
    input: z.tuple([CreateDataRequestSchema]),
    output: z.promise(CreateDataResponseSchema)
  }).describe('Create a data record'),

  updateData: z.function({
    input: z.tuple([UpdateDataRequestSchema]),
    output: z.promise(UpdateDataResponseSchema)
  }).describe('Update a data record'),

  deleteData: z.function({
    input: z.tuple([DeleteDataRequestSchema]),
    output: z.promise(DeleteDataResponseSchema)
  }).describe('Delete a data record'),

  // Batch Operations
  batchData: z.function({
    input: z.tuple([BatchDataRequestSchema]),
    output: z.promise(BatchDataResponseSchema)
  }).describe('Perform batch operations'),

  createManyData: z.function({
    input: z.tuple([CreateManyDataRequestSchema]),
    output: z.promise(CreateManyDataResponseSchema)
  }).describe('Create multiple records'),

  updateManyData: z.function({
    input: z.tuple([UpdateManyDataRequestSchema]),
    output: z.promise(UpdateManyDataResponseSchema)
  }).describe('Update multiple records'),

  deleteManyData: z.function({
    input: z.tuple([DeleteManyDataRequestSchema]),
    output: z.promise(DeleteManyDataResponseSchema)
  }).describe('Delete multiple records'),

  // View Storage
  createView: z.function({
    input: z.tuple([CreateViewRequestSchema]),
    output: z.promise(ViewResponseSchema)
  }).describe('Create a saved view'),

  getView: z.function({
    input: z.tuple([GetViewRequestSchema]),
    output: z.promise(ViewResponseSchema)
  }).describe('Get a saved view'),

  listViews: z.function({
    input: z.tuple([ListViewsRequestSchema]),
    output: z.promise(ListViewsResponseSchema)
  }).describe('List saved views'),

  updateView: z.function({
    input: z.tuple([UpdateViewRequestSchema]),
    output: z.promise(ViewResponseSchema)
  }).describe('Update a saved view'),

  deleteView: z.function({
    input: z.tuple([DeleteViewRequestSchema]),
    output: z.promise(DeleteViewResponseSchema)
  }).describe('Delete a saved view'),
});

/**
 * TypeScript Types
 * Derived from Zod schemas using z.infer
 */
export type GetDiscoveryRequest = z.infer<typeof GetDiscoveryRequestSchema>;
export type GetDiscoveryResponse = z.infer<typeof GetDiscoveryResponseSchema>;
export type GetMetaTypesRequest = z.infer<typeof GetMetaTypesRequestSchema>;
export type GetMetaTypesResponse = z.infer<typeof GetMetaTypesResponseSchema>;
export type GetMetaItemsRequest = z.infer<typeof GetMetaItemsRequestSchema>;
export type GetMetaItemsResponse = z.infer<typeof GetMetaItemsResponseSchema>;
export type GetMetaItemRequest = z.infer<typeof GetMetaItemRequestSchema>;
export type GetMetaItemResponse = z.infer<typeof GetMetaItemResponseSchema>;
export type GetMetaItemCachedRequest = z.infer<typeof GetMetaItemCachedRequestSchema>;
export type GetMetaItemCachedResponse = z.infer<typeof GetMetaItemCachedResponseSchema>;
export type GetUiViewRequest = z.infer<typeof GetUiViewRequestSchema>;
export type GetUiViewResponse = z.infer<typeof GetUiViewResponseSchema>;

export type FindDataRequest = z.input<typeof FindDataRequestSchema>;
export type FindDataResponse = z.infer<typeof FindDataResponseSchema>;
export type GetDataRequest = z.input<typeof GetDataRequestSchema>;
export type GetDataResponse = z.infer<typeof GetDataResponseSchema>;
export type CreateDataRequest = z.input<typeof CreateDataRequestSchema>;
export type CreateDataResponse = z.infer<typeof CreateDataResponseSchema>;
export type UpdateDataRequest = z.input<typeof UpdateDataRequestSchema>;
export type UpdateDataResponse = z.infer<typeof UpdateDataResponseSchema>;
export type DeleteDataRequest = z.input<typeof DeleteDataRequestSchema>;
export type DeleteDataResponse = z.infer<typeof DeleteDataResponseSchema>;

export type BatchDataRequest = z.input<typeof BatchDataRequestSchema>;
export type BatchDataResponse = z.infer<typeof BatchDataResponseSchema>;
export type CreateManyDataRequest = z.input<typeof CreateManyDataRequestSchema>;
export type CreateManyDataResponse = z.infer<typeof CreateManyDataResponseSchema>;
export type UpdateManyDataRequest = z.input<typeof UpdateManyDataRequestSchema>;
export type UpdateManyDataResponse = z.infer<typeof UpdateManyDataResponseSchema>;
export type DeleteManyDataRequest = z.input<typeof DeleteManyDataRequestSchema>;
export type DeleteManyDataResponse = z.infer<typeof DeleteManyDataResponseSchema>;

export type GetViewRequest = z.infer<typeof GetViewRequestSchema>;
export type GetViewResponse = z.infer<typeof GetViewResponseSchema>;
export type DeleteViewRequest = z.infer<typeof DeleteViewRequestSchema>;
export type DeleteViewResponse = z.infer<typeof DeleteViewResponseSchema>;

export type ObjectStackProtocol = z.infer<typeof ObjectStackProtocolSchema>;

/**
 * Legacy Interface Export
 * Maintained for backward compatibility
 * @deprecated Use ObjectStackProtocol type from protocol.zod.ts instead
 */
export interface IObjectStackProtocolLegacy {
  getDiscovery(): Promise<GetDiscoveryResponse>;
  getMetaTypes(): Promise<GetMetaTypesResponse>;
  getMetaItems(request: GetMetaItemsRequest): Promise<GetMetaItemsResponse>;
  getMetaItem(request: GetMetaItemRequest): Promise<GetMetaItemResponse>;
  getMetaItemCached(request: GetMetaItemCachedRequest): Promise<GetMetaItemCachedResponse>;
  getUiView(request: GetUiViewRequest): Promise<GetUiViewResponse>;
  
  findData(request: FindDataRequest): Promise<FindDataResponse>;
  getData(request: GetDataRequest): Promise<GetDataResponse>;
  createData(request: CreateDataRequest): Promise<CreateDataResponse>;
  updateData(request: UpdateDataRequest): Promise<UpdateDataResponse>;
  deleteData(request: DeleteDataRequest): Promise<DeleteDataResponse>;
  
  batchData(request: BatchDataRequest): Promise<BatchDataResponse>;
  createManyData(request: CreateManyDataRequest): Promise<CreateManyDataResponse>;
  updateManyData(request: UpdateManyDataRequest): Promise<UpdateManyDataResponse>;
  deleteManyData(request: DeleteManyDataRequest): Promise<DeleteManyDataResponse>;
  
  createView(request: z.infer<typeof CreateViewRequestSchema>): Promise<z.infer<typeof ViewResponseSchema>>;
  getView(request: GetViewRequest): Promise<GetViewResponse>;
  listViews(request: z.infer<typeof ListViewsRequestSchema>): Promise<z.infer<typeof ListViewsResponseSchema>>;
  updateView(request: z.infer<typeof UpdateViewRequestSchema>): Promise<z.infer<typeof ViewResponseSchema>>;
  deleteView(request: DeleteViewRequest): Promise<DeleteViewResponse>;
}
