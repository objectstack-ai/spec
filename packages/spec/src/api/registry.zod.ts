import { z } from 'zod';
import { HttpMethod } from '../shared/http.zod';

/**
 * Unified API Registry Protocol
 * 
 * Provides a centralized registry for managing all API endpoints across different
 * API types (REST, GraphQL, OData, WebSocket, Auth, File, Plugin-registered).
 * 
 * This enables:
 * - Unified API discovery and documentation (similar to Swagger/OpenAPI)
 * - API testing interfaces
 * - API governance and monitoring
 * - Plugin API registration
 * - Multi-protocol support
 * 
 * Architecture Alignment:
 * - Kubernetes: Service Discovery & API Server
 * - AWS API Gateway: Unified API Management
 * - Kong Gateway: Plugin-based API Management
 * 
 * @example API Registry Entry
 * ```typescript
 * const apiEntry: ApiRegistryEntry = {
 *   id: 'customer_crud',
 *   name: 'Customer CRUD API',
 *   type: 'rest',
 *   version: 'v1',
 *   basePath: '/api/v1/data/customer',
 *   endpoints: [...],
 *   metadata: {
 *     owner: 'sales_team',
 *     tags: ['customer', 'crm']
 *   }
 * }
 * ```
 */

// ==========================================
// API Type Enumeration
// ==========================================

/**
 * API Protocol Type
 * 
 * Defines the different types of APIs supported by ObjectStack.
 */
export const ApiProtocolType = z.enum([
  'rest',      // RESTful API (CRUD operations)
  'graphql',   // GraphQL API (flexible queries)
  'odata',     // OData v4 API (enterprise integration)
  'websocket', // WebSocket API (real-time)
  'file',      // File/Storage API (uploads/downloads)
  'auth',      // Authentication/Authorization API
  'metadata',  // Metadata/Schema API
  'plugin',    // Plugin-registered custom API
  'webhook',   // Webhook endpoints
  'rpc',       // JSON-RPC or similar
]);

export type ApiProtocolType = z.infer<typeof ApiProtocolType>;

// ==========================================
// API Endpoint Registration
// ==========================================

/**
 * HTTP Status Code
 */
export const HttpStatusCode = z.union([
  z.number().int().min(100).max(599),
  z.enum(['2xx', '3xx', '4xx', '5xx']), // Pattern matching
]);

export type HttpStatusCode = z.infer<typeof HttpStatusCode>;

/**
 * API Parameter Schema
 * 
 * Defines a single API parameter (path, query, header, or body).
 */
export const ApiParameterSchema = z.object({
  /** Parameter name */
  name: z.string().describe('Parameter name'),
  
  /** Parameter location */
  in: z.enum(['path', 'query', 'header', 'body', 'cookie']).describe('Parameter location'),
  
  /** Parameter description */
  description: z.string().optional().describe('Parameter description'),
  
  /** Required flag */
  required: z.boolean().default(false).describe('Whether parameter is required'),
  
  /** Parameter type/schema */
  schema: z.object({
    type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object']).describe('Parameter type'),
    format: z.string().optional().describe('Format (e.g., date-time, email, uuid)'),
    enum: z.array(z.any()).optional().describe('Allowed values'),
    default: z.any().optional().describe('Default value'),
    items: z.any().optional().describe('Array item schema'),
    properties: z.record(z.string(), z.any()).optional().describe('Object properties'),
  }).describe('Parameter schema definition'),
  
  /** Example value */
  example: z.any().optional().describe('Example value'),
});

export type ApiParameter = z.infer<typeof ApiParameterSchema>;

/**
 * API Response Schema
 * 
 * Defines an API response for a specific status code.
 */
export const ApiResponseSchema = z.object({
  /** HTTP status code */
  statusCode: HttpStatusCode.describe('HTTP status code'),
  
  /** Response description */
  description: z.string().describe('Response description'),
  
  /** Response content type */
  contentType: z.string().default('application/json').describe('Response content type'),
  
  /** Response schema */
  schema: z.any().optional().describe('Response body schema'),
  
  /** Response headers */
  headers: z.record(z.string(), z.object({
    description: z.string().optional(),
    schema: z.any(),
  })).optional().describe('Response headers'),
  
  /** Example response */
  example: z.any().optional().describe('Example response'),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

/**
 * API Endpoint Registration Schema
 * 
 * Represents a single API endpoint registration with complete metadata.
 * 
 * @example REST Endpoint
 * ```json
 * {
 *   "id": "get_customer_by_id",
 *   "method": "GET",
 *   "path": "/api/v1/data/customer/:id",
 *   "summary": "Get customer by ID",
 *   "description": "Retrieves a single customer record by ID",
 *   "operationId": "getCustomerById",
 *   "tags": ["customer", "data"],
 *   "parameters": [
 *     {
 *       "name": "id",
 *       "in": "path",
 *       "required": true,
 *       "schema": { "type": "string" }
 *     }
 *   ],
 *   "responses": [
 *     {
 *       "statusCode": 200,
 *       "description": "Customer found",
 *       "schema": { "type": "object" }
 *     }
 *   ]
 * }
 * ```
 */
export const ApiEndpointRegistrationSchema = z.object({
  /** Unique endpoint identifier */
  id: z.string().describe('Unique endpoint identifier'),
  
  /** HTTP method (for HTTP-based APIs) */
  method: HttpMethod.optional().describe('HTTP method'),
  
  /** URL path pattern */
  path: z.string().describe('URL path pattern'),
  
  /** Short summary */
  summary: z.string().optional().describe('Short endpoint summary'),
  
  /** Detailed description */
  description: z.string().optional().describe('Detailed endpoint description'),
  
  /** Operation ID (OpenAPI) */
  operationId: z.string().optional().describe('Unique operation identifier'),
  
  /** Tags for grouping */
  tags: z.array(z.string()).optional().default([]).describe('Tags for categorization'),
  
  /** Parameters */
  parameters: z.array(ApiParameterSchema).optional().default([]).describe('Endpoint parameters'),
  
  /** Request body schema */
  requestBody: z.object({
    description: z.string().optional(),
    required: z.boolean().default(false),
    contentType: z.string().default('application/json'),
    schema: z.any().optional(),
    example: z.any().optional(),
  }).optional().describe('Request body specification'),
  
  /** Response definitions */
  responses: z.array(ApiResponseSchema).optional().default([]).describe('Possible responses'),
  
  /** Security requirements */
  security: z.array(z.object({
    type: z.enum(['apiKey', 'http', 'oauth2', 'openIdConnect']),
    scheme: z.string().optional(), // bearer, basic, etc.
    name: z.string().optional(),   // for apiKey
    in: z.enum(['header', 'query', 'cookie']).optional(),
  })).optional().describe('Security requirements'),
  
  /** Deprecation flag */
  deprecated: z.boolean().default(false).describe('Whether endpoint is deprecated'),
  
  /** External documentation */
  externalDocs: z.object({
    description: z.string().optional(),
    url: z.string().url(),
  }).optional().describe('External documentation link'),
});

export type ApiEndpointRegistration = z.infer<typeof ApiEndpointRegistrationSchema>;

// ==========================================
// API Registry Entry
// ==========================================

/**
 * API Metadata Schema
 * 
 * Additional metadata for an API registration.
 */
export const ApiMetadataSchema = z.object({
  /** API owner/team */
  owner: z.string().optional().describe('Owner team or person'),
  
  /** API status */
  status: z.enum(['active', 'deprecated', 'experimental', 'beta']).default('active')
    .describe('API lifecycle status'),
  
  /** Categorization tags */
  tags: z.array(z.string()).optional().default([]).describe('Classification tags'),
  
  /** Plugin source (if plugin-registered) */
  pluginSource: z.string().optional().describe('Source plugin name'),
  
  /** Custom metadata */
  custom: z.record(z.string(), z.any()).optional().describe('Custom metadata fields'),
});

export type ApiMetadata = z.infer<typeof ApiMetadataSchema>;

/**
 * API Registry Entry Schema
 * 
 * Complete registration entry for an API in the unified registry.
 * 
 * @example REST API Entry
 * ```json
 * {
 *   "id": "customer_api",
 *   "name": "Customer Management API",
 *   "type": "rest",
 *   "version": "v1",
 *   "basePath": "/api/v1/data/customer",
 *   "description": "CRUD operations for customer records",
 *   "endpoints": [...],
 *   "metadata": {
 *     "owner": "sales_team",
 *     "status": "active",
 *     "tags": ["customer", "crm"]
 *   }
 * }
 * ```
 * 
 * @example Plugin API Entry
 * ```json
 * {
 *   "id": "payment_webhook",
 *   "name": "Payment Webhook API",
 *   "type": "plugin",
 *   "version": "1.0.0",
 *   "basePath": "/plugins/payment/webhook",
 *   "endpoints": [...],
 *   "metadata": {
 *     "pluginSource": "payment_gateway_plugin",
 *     "status": "active"
 *   }
 * }
 * ```
 */
export const ApiRegistryEntrySchema = z.object({
  /** Unique API identifier */
  id: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Unique API identifier (snake_case)'),
  
  /** Human-readable name */
  name: z.string().describe('API display name'),
  
  /** API protocol type */
  type: ApiProtocolType.describe('API protocol type'),
  
  /** API version */
  version: z.string().describe('API version (e.g., v1, 2024-01)'),
  
  /** Base URL path */
  basePath: z.string().describe('Base URL path for this API'),
  
  /** API description */
  description: z.string().optional().describe('API description'),
  
  /** Endpoints in this API */
  endpoints: z.array(ApiEndpointRegistrationSchema).describe('Registered endpoints'),
  
  /** OpenAPI/GraphQL/OData specific configuration */
  config: z.record(z.string(), z.any()).optional().describe('Protocol-specific configuration'),
  
  /** API metadata */
  metadata: ApiMetadataSchema.optional().describe('Additional metadata'),
  
  /** Terms of service URL */
  termsOfService: z.string().url().optional().describe('Terms of service URL'),
  
  /** Contact information */
  contact: z.object({
    name: z.string().optional(),
    url: z.string().url().optional(),
    email: z.string().email().optional(),
  }).optional().describe('Contact information'),
  
  /** License information */
  license: z.object({
    name: z.string(),
    url: z.string().url().optional(),
  }).optional().describe('License information'),
});

export type ApiRegistryEntry = z.infer<typeof ApiRegistryEntrySchema>;

// ==========================================
// API Registry
// ==========================================

/**
 * API Registry Schema
 * 
 * Central registry containing all registered APIs.
 * 
 * @example
 * ```json
 * {
 *   "version": "1.0.0",
 *   "apis": [
 *     { "id": "customer_api", "type": "rest", ... },
 *     { "id": "graphql_api", "type": "graphql", ... },
 *     { "id": "file_upload_api", "type": "file", ... }
 *   ],
 *   "totalApis": 3,
 *   "totalEndpoints": 47
 * }
 * ```
 */
export const ApiRegistrySchema = z.object({
  /** Registry version */
  version: z.string().describe('Registry version'),
  
  /** Registered APIs */
  apis: z.array(ApiRegistryEntrySchema).describe('All registered APIs'),
  
  /** Total API count */
  totalApis: z.number().int().describe('Total number of registered APIs'),
  
  /** Total endpoint count across all APIs */
  totalEndpoints: z.number().int().describe('Total number of endpoints'),
  
  /** APIs grouped by type */
  byType: z.record(ApiProtocolType, z.array(ApiRegistryEntrySchema)).optional()
    .describe('APIs grouped by protocol type'),
  
  /** APIs grouped by status */
  byStatus: z.record(z.string(), z.array(ApiRegistryEntrySchema)).optional()
    .describe('APIs grouped by status'),
  
  /** Last updated timestamp */
  updatedAt: z.string().datetime().optional().describe('Last registry update time'),
});

export type ApiRegistry = z.infer<typeof ApiRegistrySchema>;

// ==========================================
// API Discovery & Query
// ==========================================

/**
 * API Discovery Query Schema
 * 
 * Query parameters for discovering/filtering APIs in the registry.
 * 
 * @example
 * ```json
 * {
 *   "type": "rest",
 *   "tags": ["customer"],
 *   "status": "active"
 * }
 * ```
 */
export const ApiDiscoveryQuerySchema = z.object({
  /** Filter by API type */
  type: ApiProtocolType.optional().describe('Filter by API protocol type'),
  
  /** Filter by tags */
  tags: z.array(z.string()).optional().describe('Filter by tags (ANY match)'),
  
  /** Filter by status */
  status: z.enum(['active', 'deprecated', 'experimental', 'beta']).optional()
    .describe('Filter by lifecycle status'),
  
  /** Filter by plugin source */
  pluginSource: z.string().optional().describe('Filter by plugin name'),
  
  /** Search in name/description */
  search: z.string().optional().describe('Full-text search in name/description'),
  
  /** Filter by version */
  version: z.string().optional().describe('Filter by specific version'),
});

export type ApiDiscoveryQuery = z.infer<typeof ApiDiscoveryQuerySchema>;

/**
 * API Discovery Response Schema
 * 
 * Response for API discovery queries.
 */
export const ApiDiscoveryResponseSchema = z.object({
  /** Matching APIs */
  apis: z.array(ApiRegistryEntrySchema).describe('Matching API entries'),
  
  /** Total matches */
  total: z.number().int().describe('Total matching APIs'),
  
  /** Applied filters */
  filters: ApiDiscoveryQuerySchema.optional().describe('Applied query filters'),
});

export type ApiDiscoveryResponse = z.infer<typeof ApiDiscoveryResponseSchema>;

// ==========================================
// Helper Functions
// ==========================================

/**
 * Helper to create API endpoint registration
 */
export const ApiEndpointRegistration = Object.assign(ApiEndpointRegistrationSchema, {
  create: <T extends z.input<typeof ApiEndpointRegistrationSchema>>(config: T) => config,
});

/**
 * Helper to create API registry entry
 */
export const ApiRegistryEntry = Object.assign(ApiRegistryEntrySchema, {
  create: <T extends z.input<typeof ApiRegistryEntrySchema>>(config: T) => config,
});

/**
 * Helper to create API registry
 */
export const ApiRegistry = Object.assign(ApiRegistrySchema, {
  create: <T extends z.input<typeof ApiRegistrySchema>>(config: T) => config,
});
