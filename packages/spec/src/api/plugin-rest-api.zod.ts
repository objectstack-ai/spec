import { z } from 'zod';
import { HttpMethod } from '../shared/http.zod';
import { MiddlewareConfigSchema } from '../system/http-server.zod';

/**
 * REST API Plugin Protocol
 * 
 * Defines the schema for REST API plugins that register Discovery, Metadata,
 * Data CRUD, Batch, and Permission routes with the HTTP Dispatcher.
 * 
 * This plugin type implements Phase 2 of the API Protocol implementation plan,
 * providing standardized REST endpoints with:
 * - Request validation middleware using Zod schemas
 * - Response envelope wrapping with BaseResponseSchema
 * - Error handling using ApiErrorSchema
 * - OpenAPI documentation auto-generation
 * 
 * Features:
 * - Route registration for core API endpoints
 * - Automatic schema-based validation
 * - Standardized request/response envelopes
 * - OpenAPI/Swagger documentation generation
 * 
 * Architecture Alignment:
 * - Salesforce: REST API with metadata and data CRUD
 * - Microsoft Dynamics: Web API with entity operations
 * - Strapi: Auto-generated REST endpoints from schemas
 * 
 * @example Plugin Manifest
 * ```typescript
 * {
 *   "name": "rest_api",
 *   "version": "1.0.0",
 *   "type": "server",
 *   "contributes": {
 *     "routes": [
 *       {
 *         "prefix": "/api/v1/discovery",
 *         "service": "metadata",
 *         "methods": ["getDiscovery"],
 *         "middleware": [
 *           { "name": "response_envelope", "type": "transformation", "enabled": true }
 *         ]
 *       },
 *       {
 *         "prefix": "/api/v1/meta",
 *         "service": "metadata",
 *         "methods": ["getMetaTypes", "getMetaItems", "getMetaItem", "saveMetaItem"],
 *         "middleware": [
 *           { "name": "auth", "type": "authentication", "enabled": true },
 *           { "name": "request_validation", "type": "validation", "enabled": true }
 *         ]
 *       },
 *       {
 *         "prefix": "/api/v1/data",
 *         "service": "data",
 *         "methods": ["findData", "getData", "createData", "updateData", "deleteData"]
 *       }
 *     ]
 *   }
 * }
 * ```
 */

// ==========================================
// REST API Route Categories
// ==========================================

/**
 * REST API Route Category Enum
 * Categorizes REST API routes by their primary function
 */
export const RestApiRouteCategory = z.enum([
  'discovery',    // API discovery and capabilities
  'metadata',     // Metadata operations (objects, fields, views)
  'data',         // Data CRUD operations
  'batch',        // Batch/bulk operations
  'permission',   // Permission/authorization checks
  'analytics',    // Analytics and reporting
  'automation',   // Automation triggers and flows
  'workflow',     // Workflow state management
  'ui',           // UI metadata (views, layouts)
  'realtime',     // Realtime/WebSocket
  'notification', // Notification management
  'ai',           // AI operations (NLQ, chat)
  'i18n',         // Internationalization
  'hub',          // Hub and package management
]);

export type RestApiRouteCategory = z.infer<typeof RestApiRouteCategory>;

// ==========================================
// Route Registration Schema
// ==========================================

/**
 * REST API Endpoint Schema
 * Defines a single REST API endpoint with its metadata
 * 
 * @example Discovery Endpoint
 * {
 *   "method": "GET",
 *   "path": "/api/v1/discovery",
 *   "handler": "getDiscovery",
 *   "category": "discovery",
 *   "public": true,
 *   "description": "Get API discovery information"
 * }
 */
export const RestApiEndpointSchema = z.object({
  /**
   * HTTP method
   */
  method: HttpMethod.describe('HTTP method for this endpoint'),
  
  /**
   * URL path pattern (supports parameters like :id)
   */
  path: z.string().describe('URL path pattern (e.g., /api/v1/data/:object/:id)'),
  
  /**
   * Handler reference (protocol method name)
   */
  handler: z.string().describe('Protocol method name or handler identifier'),
  
  /**
   * Route category
   */
  category: RestApiRouteCategory.describe('Route category'),
  
  /**
   * Whether endpoint is publicly accessible (no auth required)
   */
  public: z.boolean().default(false).describe('Is publicly accessible without authentication'),
  
  /**
   * Required permissions
   */
  permissions: z.array(z.string()).optional().describe('Required permissions (e.g., ["data.read", "object.account.read"])'),
  
  /**
   * OpenAPI documentation metadata
   */
  summary: z.string().optional().describe('Short description for OpenAPI'),
  description: z.string().optional().describe('Detailed description for OpenAPI'),
  tags: z.array(z.string()).optional().describe('OpenAPI tags for grouping'),
  
  /**
   * Request/Response schema references
   */
  requestSchema: z.string().optional().describe('Request schema name (for validation)'),
  responseSchema: z.string().optional().describe('Response schema name (for documentation)'),
  
  /**
   * Performance and reliability settings
   */
  timeout: z.number().int().optional().describe('Request timeout in milliseconds'),
  rateLimit: z.string().optional().describe('Rate limit policy name'),
  cacheable: z.boolean().default(false).describe('Whether response can be cached'),
  cacheTtl: z.number().int().optional().describe('Cache TTL in seconds'),
});

export type RestApiEndpoint = z.infer<typeof RestApiEndpointSchema>;

/**
 * REST API Route Registration Schema
 * Registers a group of related endpoints under a common prefix
 * 
 * @example Data CRUD Routes
 * {
 *   "prefix": "/api/v1/data",
 *   "service": "data",
 *   "category": "data",
 *   "endpoints": [
 *     { "method": "GET", "path": "/:object", "handler": "findData" },
 *     { "method": "GET", "path": "/:object/:id", "handler": "getData" },
 *     { "method": "POST", "path": "/:object", "handler": "createData" },
 *     { "method": "PATCH", "path": "/:object/:id", "handler": "updateData" },
 *     { "method": "DELETE", "path": "/:object/:id", "handler": "deleteData" }
 *   ],
 *   "middleware": [
 *     { "name": "auth", "type": "authentication", "enabled": true },
 *     { "name": "validation", "type": "validation", "enabled": true },
 *     { "name": "response_envelope", "type": "transformation", "enabled": true }
 *   ]
 * }
 */
export const RestApiRouteRegistrationSchema = z.object({
  /**
   * URL prefix for this route group (e.g., /api/v1/data)
   */
  prefix: z.string().regex(/^\//).describe('URL path prefix for this route group'),
  
  /**
   * Service name that handles these routes
   */
  service: z.string().describe('Core service name (metadata, data, auth, etc.)'),
  
  /**
   * Route category
   */
  category: RestApiRouteCategory.describe('Primary category for this route group'),
  
  /**
   * Protocol methods implemented
   */
  methods: z.array(z.string()).optional().describe('Protocol method names implemented'),
  
  /**
   * Detailed endpoint definitions
   */
  endpoints: z.array(RestApiEndpointSchema).optional().describe('Endpoint definitions'),
  
  /**
   * Middleware applied to all routes in this group
   */
  middleware: z.array(MiddlewareConfigSchema).optional().describe('Middleware stack for this route group'),
  
  /**
   * Whether authentication is required for all routes
   */
  authRequired: z.boolean().default(true).describe('Whether authentication is required by default'),
  
  /**
   * OpenAPI documentation
   */
  documentation: z.object({
    title: z.string().optional().describe('Route group title'),
    description: z.string().optional().describe('Route group description'),
    tags: z.array(z.string()).optional().describe('OpenAPI tags'),
  }).optional().describe('Documentation metadata for this route group'),
});

export type RestApiRouteRegistration = z.infer<typeof RestApiRouteRegistrationSchema>;

// ==========================================
// Request Validation Configuration
// ==========================================

/**
 * Request Validation Mode Enum
 * Defines how validation errors are handled
 */
export const ValidationMode = z.enum([
  'strict',     // Reject requests with validation errors (400 Bad Request)
  'permissive', // Log validation errors but allow request to proceed
  'strip',      // Remove invalid fields and continue with valid data
]);

export type ValidationMode = z.infer<typeof ValidationMode>;

/**
 * Request Validation Configuration Schema
 * Configures Zod-based request validation middleware
 * 
 * @example
 * {
 *   "enabled": true,
 *   "mode": "strict",
 *   "validateBody": true,
 *   "validateQuery": true,
 *   "validateParams": true,
 *   "includeFieldErrors": true
 * }
 */
export const RequestValidationConfigSchema = z.object({
  /**
   * Enable request validation
   */
  enabled: z.boolean().default(true).describe('Enable automatic request validation'),
  
  /**
   * Validation mode
   */
  mode: ValidationMode.default('strict').describe('How to handle validation errors'),
  
  /**
   * Validate request body
   */
  validateBody: z.boolean().default(true).describe('Validate request body against schema'),
  
  /**
   * Validate query parameters
   */
  validateQuery: z.boolean().default(true).describe('Validate query string parameters'),
  
  /**
   * Validate URL parameters
   */
  validateParams: z.boolean().default(true).describe('Validate URL path parameters'),
  
  /**
   * Validate request headers
   */
  validateHeaders: z.boolean().default(false).describe('Validate request headers'),
  
  /**
   * Include detailed field errors in response
   */
  includeFieldErrors: z.boolean().default(true).describe('Include field-level error details in response'),
  
  /**
   * Custom error message prefix
   */
  errorPrefix: z.string().optional().describe('Custom prefix for validation error messages'),
  
  /**
   * Schema registry reference
   */
  schemaRegistry: z.string().optional().describe('Schema registry name to use for validation'),
});

export type RequestValidationConfig = z.infer<typeof RequestValidationConfigSchema>;
export type RequestValidationConfigInput = z.input<typeof RequestValidationConfigSchema>;

// ==========================================
// Response Envelope Configuration
// ==========================================

/**
 * Response Envelope Configuration Schema
 * Configures automatic response wrapping with BaseResponseSchema
 * 
 * @example
 * {
 *   "enabled": true,
 *   "includeMetadata": true,
 *   "includeTimestamp": true,
 *   "includeRequestId": true,
 *   "includeDuration": true
 * }
 */
export const ResponseEnvelopeConfigSchema = z.object({
  /**
   * Enable response envelope wrapping
   */
  enabled: z.boolean().default(true).describe('Enable automatic response envelope wrapping'),
  
  /**
   * Include metadata object
   */
  includeMetadata: z.boolean().default(true).describe('Include meta object in responses'),
  
  /**
   * Include timestamp in metadata
   */
  includeTimestamp: z.boolean().default(true).describe('Include timestamp in response metadata'),
  
  /**
   * Include request ID in metadata
   */
  includeRequestId: z.boolean().default(true).describe('Include requestId in response metadata'),
  
  /**
   * Include request duration in metadata
   */
  includeDuration: z.boolean().default(false).describe('Include request duration in ms'),
  
  /**
   * Include trace ID for distributed tracing
   */
  includeTraceId: z.boolean().default(false).describe('Include distributed traceId'),
  
  /**
   * Custom metadata fields
   */
  customMetadata: z.record(z.string(), z.unknown()).optional().describe('Additional metadata fields to include'),
  
  /**
   * Whether to wrap already-wrapped responses
   */
  skipIfWrapped: z.boolean().default(true).describe('Skip wrapping if response already has success field'),
});

export type ResponseEnvelopeConfig = z.infer<typeof ResponseEnvelopeConfigSchema>;
export type ResponseEnvelopeConfigInput = z.input<typeof ResponseEnvelopeConfigSchema>;

// ==========================================
// Error Handling Configuration
// ==========================================

/**
 * Error Handling Configuration Schema
 * Configures error handling and ApiErrorSchema formatting
 * 
 * @example
 * {
 *   "enabled": true,
 *   "includeStackTrace": false,
 *   "logErrors": true,
 *   "exposeInternalErrors": false,
 *   "customErrorMessages": {
 *     "validation_error": "The request data is invalid. Please check your input."
 *   }
 * }
 */
export const ErrorHandlingConfigSchema = z.object({
  /**
   * Enable standardized error handling
   */
  enabled: z.boolean().default(true).describe('Enable standardized error handling'),
  
  /**
   * Include stack traces in error responses (dev only)
   */
  includeStackTrace: z.boolean().default(false).describe('Include stack traces in error responses'),
  
  /**
   * Log errors to logger
   */
  logErrors: z.boolean().default(true).describe('Log errors to system logger'),
  
  /**
   * Expose internal error details
   */
  exposeInternalErrors: z.boolean().default(false).describe('Expose internal error details in responses'),
  
  /**
   * Include request ID in errors
   */
  includeRequestId: z.boolean().default(true).describe('Include requestId in error responses'),
  
  /**
   * Include timestamp in errors
   */
  includeTimestamp: z.boolean().default(true).describe('Include timestamp in error responses'),
  
  /**
   * Include error documentation URLs
   */
  includeDocumentation: z.boolean().default(true).describe('Include documentation URLs for errors'),
  
  /**
   * Documentation base URL
   */
  documentationBaseUrl: z.string().url().optional().describe('Base URL for error documentation'),
  
  /**
   * Custom error messages by code
   */
  customErrorMessages: z.record(z.string(), z.string()).optional()
    .describe('Custom error messages by error code'),
  
  /**
   * Sensitive fields to redact from error details
   */
  redactFields: z.array(z.string()).optional().describe('Field names to redact from error details'),
});

export type ErrorHandlingConfig = z.infer<typeof ErrorHandlingConfigSchema>;
export type ErrorHandlingConfigInput = z.input<typeof ErrorHandlingConfigSchema>;

// ==========================================
// OpenAPI Documentation Configuration
// ==========================================

/**
 * OpenAPI Generation Configuration Schema
 * Configures automatic OpenAPI documentation generation
 * 
 * @example
 * {
 *   "enabled": true,
 *   "version": "3.0.0",
 *   "title": "ObjectStack API",
 *   "description": "ObjectStack REST API",
 *   "outputPath": "/api/docs/openapi.json",
 *   "uiPath": "/api/docs",
 *   "includeInternal": false,
 *   "generateSchemas": true
 * }
 */
export const OpenApiGenerationConfigSchema = z.object({
  /**
   * Enable OpenAPI generation
   */
  enabled: z.boolean().default(true).describe('Enable automatic OpenAPI documentation generation'),
  
  /**
   * OpenAPI specification version
   */
  version: z.enum(['3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0']).default('3.0.3')
    .describe('OpenAPI specification version'),
  
  /**
   * API title
   */
  title: z.string().default('ObjectStack API').describe('API title'),
  
  /**
   * API description
   */
  description: z.string().optional().describe('API description'),
  
  /**
   * API version
   */
  apiVersion: z.string().default('1.0.0').describe('API version'),
  
  /**
   * Output path for OpenAPI spec
   */
  outputPath: z.string().default('/api/docs/openapi.json').describe('URL path to serve OpenAPI JSON'),
  
  /**
   * UI path for Swagger/Redoc
   */
  uiPath: z.string().default('/api/docs').describe('URL path to serve documentation UI'),
  
  /**
   * UI framework to use
   */
  uiFramework: z.enum(['swagger-ui', 'redoc', 'rapidoc', 'elements']).default('swagger-ui')
    .describe('Documentation UI framework'),
  
  /**
   * Include internal/admin endpoints
   */
  includeInternal: z.boolean().default(false).describe('Include internal endpoints in documentation'),
  
  /**
   * Generate JSON schemas from Zod
   */
  generateSchemas: z.boolean().default(true).describe('Auto-generate schemas from Zod definitions'),
  
  /**
   * Include examples in documentation
   */
  includeExamples: z.boolean().default(true).describe('Include request/response examples'),
  
  /**
   * Server URLs
   */
  servers: z.array(z.object({
    url: z.string().describe('Server URL'),
    description: z.string().optional().describe('Server description'),
  })).optional().describe('Server URLs for API'),
  
  /**
   * Contact information
   */
  contact: z.object({
    name: z.string().optional(),
    url: z.string().url().optional(),
    email: z.string().email().optional(),
  }).optional().describe('API contact information'),
  
  /**
   * License information
   */
  license: z.object({
    name: z.string().describe('License name'),
    url: z.string().url().optional().describe('License URL'),
  }).optional().describe('API license information'),
  
  /**
   * Security schemes
   */
  securitySchemes: z.record(z.string(), z.object({
    type: z.enum(['apiKey', 'http', 'oauth2', 'openIdConnect']),
    scheme: z.string().optional(),
    bearerFormat: z.string().optional(),
  })).optional().describe('Security scheme definitions'),
});

export type OpenApiGenerationConfig = z.infer<typeof OpenApiGenerationConfigSchema>;
export type OpenApiGenerationConfigInput = z.input<typeof OpenApiGenerationConfigSchema>;

// ==========================================
// REST API Plugin Configuration
// ==========================================

/**
 * REST API Plugin Configuration Schema
 * Complete configuration for REST API plugin
 * 
 * @example
 * {
 *   "enabled": true,
 *   "basePath": "/api",
 *   "version": "v1",
 *   "routes": [...],
 *   "validation": { "enabled": true, "mode": "strict" },
 *   "responseEnvelope": { "enabled": true, "includeMetadata": true },
 *   "errorHandling": { "enabled": true, "includeStackTrace": false },
 *   "openApi": { "enabled": true, "title": "ObjectStack API" }
 * }
 */
export const RestApiPluginConfigSchema = z.object({
  /**
   * Enable REST API plugin
   */
  enabled: z.boolean().default(true).describe('Enable REST API plugin'),
  
  /**
   * API base path
   */
  basePath: z.string().default('/api').describe('Base path for all API routes'),
  
  /**
   * API version
   */
  version: z.string().default('v1').describe('API version identifier'),
  
  /**
   * Route registrations
   */
  routes: z.array(RestApiRouteRegistrationSchema).describe('Route registrations'),
  
  /**
   * Request validation configuration
   */
  validation: RequestValidationConfigSchema.optional().describe('Request validation configuration'),
  
  /**
   * Response envelope configuration
   */
  responseEnvelope: ResponseEnvelopeConfigSchema.optional().describe('Response envelope configuration'),
  
  /**
   * Error handling configuration
   */
  errorHandling: ErrorHandlingConfigSchema.optional().describe('Error handling configuration'),
  
  /**
   * OpenAPI documentation configuration
   */
  openApi: OpenApiGenerationConfigSchema.optional().describe('OpenAPI documentation configuration'),
  
  /**
   * Global middleware applied to all routes
   */
  globalMiddleware: z.array(MiddlewareConfigSchema).optional().describe('Global middleware stack'),
  
  /**
   * CORS configuration
   */
  cors: z.object({
    enabled: z.boolean().default(true),
    origins: z.array(z.string()).optional(),
    methods: z.array(HttpMethod).optional(),
    credentials: z.boolean().default(true),
  }).optional().describe('CORS configuration'),
  
  /**
   * Performance settings
   */
  performance: z.object({
    enableCompression: z.boolean().default(true).describe('Enable response compression'),
    enableETag: z.boolean().default(true).describe('Enable ETag generation'),
    enableCaching: z.boolean().default(true).describe('Enable HTTP caching'),
    defaultCacheTtl: z.number().int().default(300).describe('Default cache TTL in seconds'),
  }).optional().describe('Performance optimization settings'),
});

export type RestApiPluginConfig = z.infer<typeof RestApiPluginConfigSchema>;
export type RestApiPluginConfigInput = z.input<typeof RestApiPluginConfigSchema>;

// ==========================================
// Default Route Registrations
// ==========================================

/**
 * Default Discovery Routes
 * Standard routes for API discovery endpoint
 */
export const DEFAULT_DISCOVERY_ROUTES: RestApiRouteRegistration = {
  prefix: '/api/v1/discovery',
  service: 'metadata',
  category: 'discovery',
  methods: ['getDiscovery'],
  authRequired: false,
  endpoints: [{
    method: 'GET',
    path: '',
    handler: 'getDiscovery',
    category: 'discovery',
    public: true,
    summary: 'Get API discovery information',
    description: 'Returns API version, capabilities, and available routes',
    tags: ['Discovery'],
    responseSchema: 'GetDiscoveryResponseSchema',
    cacheable: false,
  }],
  middleware: [
    { name: 'response_envelope', type: 'transformation', enabled: true, order: 100 },
  ],
};

/**
 * Default Metadata Routes
 * Standard routes for metadata operations
 */
export const DEFAULT_METADATA_ROUTES: RestApiRouteRegistration = {
  prefix: '/api/v1/meta',
  service: 'metadata',
  category: 'metadata',
  methods: ['getMetaTypes', 'getMetaItems', 'getMetaItem', 'saveMetaItem', 'getMetaItemCached'],
  authRequired: true,
  endpoints: [
    {
      method: 'GET',
      path: '',
      handler: 'getMetaTypes',
      category: 'metadata',
      public: false,
      summary: 'List all metadata types',
      description: 'Returns available metadata types (object, field, view, etc.)',
      tags: ['Metadata'],
      responseSchema: 'GetMetaTypesResponseSchema',
      cacheable: true,
      cacheTtl: 3600,
    },
    {
      method: 'GET',
      path: '/:type',
      handler: 'getMetaItems',
      category: 'metadata',
      public: false,
      summary: 'List metadata items of a type',
      description: 'Returns all items of the specified metadata type',
      tags: ['Metadata'],
      responseSchema: 'GetMetaItemsResponseSchema',
      cacheable: true,
      cacheTtl: 3600,
    },
    {
      method: 'GET',
      path: '/:type/:name',
      handler: 'getMetaItem',
      category: 'metadata',
      public: false,
      summary: 'Get specific metadata item',
      description: 'Returns a specific metadata item by type and name',
      tags: ['Metadata'],
      requestSchema: 'GetMetaItemRequestSchema',
      responseSchema: 'GetMetaItemResponseSchema',
      cacheable: true,
      cacheTtl: 3600,
    },
    {
      method: 'PUT',
      path: '/:type/:name',
      handler: 'saveMetaItem',
      category: 'metadata',
      public: false,
      summary: 'Create or update metadata item',
      description: 'Creates or updates a metadata item',
      tags: ['Metadata'],
      requestSchema: 'SaveMetaItemRequestSchema',
      responseSchema: 'SaveMetaItemResponseSchema',
      permissions: ['metadata.write'],
      cacheable: false,
    },
  ],
  middleware: [
    { name: 'auth', type: 'authentication', enabled: true, order: 10 },
    { name: 'validation', type: 'validation', enabled: true, order: 20 },
    { name: 'response_envelope', type: 'transformation', enabled: true, order: 100 },
  ],
};

/**
 * Default Data CRUD Routes
 * Standard routes for data operations
 */
export const DEFAULT_DATA_CRUD_ROUTES: RestApiRouteRegistration = {
  prefix: '/api/v1/data',
  service: 'data',
  category: 'data',
  methods: ['findData', 'getData', 'createData', 'updateData', 'deleteData'],
  authRequired: true,
  endpoints: [
    {
      method: 'GET',
      path: '/:object',
      handler: 'findData',
      category: 'data',
      public: false,
      summary: 'Query records',
      description: 'Query records with filtering, sorting, and pagination',
      tags: ['Data'],
      requestSchema: 'FindDataRequestSchema',
      responseSchema: 'ListRecordResponseSchema',
      permissions: ['data.read'],
      cacheable: false,
    },
    {
      method: 'GET',
      path: '/:object/:id',
      handler: 'getData',
      category: 'data',
      public: false,
      summary: 'Get record by ID',
      description: 'Retrieve a single record by its ID',
      tags: ['Data'],
      requestSchema: 'IdRequestSchema',
      responseSchema: 'SingleRecordResponseSchema',
      permissions: ['data.read'],
      cacheable: false,
    },
    {
      method: 'POST',
      path: '/:object',
      handler: 'createData',
      category: 'data',
      public: false,
      summary: 'Create record',
      description: 'Create a new record',
      tags: ['Data'],
      requestSchema: 'CreateRequestSchema',
      responseSchema: 'SingleRecordResponseSchema',
      permissions: ['data.create'],
      cacheable: false,
    },
    {
      method: 'PATCH',
      path: '/:object/:id',
      handler: 'updateData',
      category: 'data',
      public: false,
      summary: 'Update record',
      description: 'Update an existing record',
      tags: ['Data'],
      requestSchema: 'UpdateRequestSchema',
      responseSchema: 'SingleRecordResponseSchema',
      permissions: ['data.update'],
      cacheable: false,
    },
    {
      method: 'DELETE',
      path: '/:object/:id',
      handler: 'deleteData',
      category: 'data',
      public: false,
      summary: 'Delete record',
      description: 'Delete a record by ID',
      tags: ['Data'],
      requestSchema: 'IdRequestSchema',
      responseSchema: 'DeleteResponseSchema',
      permissions: ['data.delete'],
      cacheable: false,
    },
  ],
  middleware: [
    { name: 'auth', type: 'authentication', enabled: true, order: 10 },
    { name: 'validation', type: 'validation', enabled: true, order: 20 },
    { name: 'response_envelope', type: 'transformation', enabled: true, order: 100 },
    { name: 'error_handler', type: 'error', enabled: true, order: 200 },
  ],
};

/**
 * Default Batch Routes
 * Standard routes for batch operations
 */
export const DEFAULT_BATCH_ROUTES: RestApiRouteRegistration = {
  prefix: '/api/v1/data/:object',
  service: 'data',
  category: 'batch',
  methods: ['batchData', 'createManyData', 'updateManyData', 'deleteManyData'],
  authRequired: true,
  endpoints: [
    {
      method: 'POST',
      path: '/batch',
      handler: 'batchData',
      category: 'batch',
      public: false,
      summary: 'Batch operation',
      description: 'Execute a batch operation (create, update, upsert, delete)',
      tags: ['Batch'],
      requestSchema: 'BatchUpdateRequestSchema',
      responseSchema: 'BatchUpdateResponseSchema',
      permissions: ['data.batch'],
      timeout: 60000, // 60 seconds for batch operations
      cacheable: false,
    },
    {
      method: 'POST',
      path: '/createMany',
      handler: 'createManyData',
      category: 'batch',
      public: false,
      summary: 'Batch create',
      description: 'Create multiple records in a single operation',
      tags: ['Batch'],
      requestSchema: 'CreateManyRequestSchema',
      responseSchema: 'BatchUpdateResponseSchema',
      permissions: ['data.create', 'data.batch'],
      timeout: 60000,
      cacheable: false,
    },
    {
      method: 'POST',
      path: '/updateMany',
      handler: 'updateManyData',
      category: 'batch',
      public: false,
      summary: 'Batch update',
      description: 'Update multiple records in a single operation',
      tags: ['Batch'],
      requestSchema: 'UpdateManyRequestSchema',
      responseSchema: 'BatchUpdateResponseSchema',
      permissions: ['data.update', 'data.batch'],
      timeout: 60000,
      cacheable: false,
    },
    {
      method: 'POST',
      path: '/deleteMany',
      handler: 'deleteManyData',
      category: 'batch',
      public: false,
      summary: 'Batch delete',
      description: 'Delete multiple records in a single operation',
      tags: ['Batch'],
      requestSchema: 'DeleteManyRequestSchema',
      responseSchema: 'BatchUpdateResponseSchema',
      permissions: ['data.delete', 'data.batch'],
      timeout: 60000,
      cacheable: false,
    },
  ],
  middleware: [
    { name: 'auth', type: 'authentication', enabled: true, order: 10 },
    { name: 'validation', type: 'validation', enabled: true, order: 20 },
    { name: 'response_envelope', type: 'transformation', enabled: true, order: 100 },
    { name: 'error_handler', type: 'error', enabled: true, order: 200 },
  ],
};

/**
 * Default Permission Routes
 * Standard routes for permission checking
 */
export const DEFAULT_PERMISSION_ROUTES: RestApiRouteRegistration = {
  prefix: '/api/v1/auth',
  service: 'auth',
  category: 'permission',
  methods: ['checkPermission', 'getObjectPermissions', 'getEffectivePermissions'],
  authRequired: true,
  endpoints: [
    {
      method: 'POST',
      path: '/check',
      handler: 'checkPermission',
      category: 'permission',
      public: false,
      summary: 'Check permission',
      description: 'Check if current user has a specific permission',
      tags: ['Permission'],
      requestSchema: 'CheckPermissionRequestSchema',
      responseSchema: 'CheckPermissionResponseSchema',
      cacheable: false,
    },
    {
      method: 'GET',
      path: '/permissions/:object',
      handler: 'getObjectPermissions',
      category: 'permission',
      public: false,
      summary: 'Get object permissions',
      description: 'Get all permissions for a specific object',
      tags: ['Permission'],
      responseSchema: 'ObjectPermissionsResponseSchema',
      cacheable: true,
      cacheTtl: 300,
    },
    {
      method: 'GET',
      path: '/permissions/effective',
      handler: 'getEffectivePermissions',
      category: 'permission',
      public: false,
      summary: 'Get effective permissions',
      description: 'Get all effective permissions for current user',
      tags: ['Permission'],
      responseSchema: 'EffectivePermissionsResponseSchema',
      cacheable: true,
      cacheTtl: 300,
    },
  ],
  middleware: [
    { name: 'auth', type: 'authentication', enabled: true, order: 10 },
    { name: 'response_envelope', type: 'transformation', enabled: true, order: 100 },
  ],
};

// ==========================================
// Helper Functions
// ==========================================

/**
 * Helper to create REST API plugin configuration
 */
export const RestApiPluginConfig = Object.assign(RestApiPluginConfigSchema, {
  create: <T extends z.input<typeof RestApiPluginConfigSchema>>(config: T) => config,
});

/**
 * Helper to create route registration
 */
export const RestApiRouteRegistration = Object.assign(RestApiRouteRegistrationSchema, {
  create: <T extends z.input<typeof RestApiRouteRegistrationSchema>>(registration: T) => registration,
});

/**
 * Get all default route registrations
 */
export function getDefaultRouteRegistrations(): RestApiRouteRegistration[] {
  return [
    DEFAULT_DISCOVERY_ROUTES,
    DEFAULT_METADATA_ROUTES,
    DEFAULT_DATA_CRUD_ROUTES,
    DEFAULT_BATCH_ROUTES,
    DEFAULT_PERMISSION_ROUTES,
  ];
}
