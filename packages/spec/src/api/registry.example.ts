/**
 * API Registry Enhancement Examples
 * 
 * This file demonstrates all the enhancements made to the Unified API Registry:
 * 1. RBAC Integration
 * 2. Dynamic Schema Linking (ObjectQL References)
 * 3. Protocol Extensibility
 * 4. Route Conflict Detection
 */

import {
  ApiEndpointRegistration,
  ApiRegistryEntry,
  ApiRegistry,
  type ConflictResolutionStrategy,
} from './registry.zod';

// ==========================================
// Example 1: RBAC Integration
// ==========================================

/**
 * Example: Endpoint with RBAC Permission Requirements
 * 
 * The gateway automatically validates these permissions before
 * allowing the request to proceed.
 */
const endpointWithRBAC = ApiEndpointRegistration.create({
  id: 'get_customer_by_id',
  method: 'GET',
  path: '/api/v1/customers/:id',
  summary: 'Get customer by ID',
  description: 'Retrieves a customer record with RBAC protection',
  
  // RBAC Integration: Permissions checked at gateway level
  requiredPermissions: ['customer.read'],
  
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        format: 'uuid',
      },
    },
  ],
  responses: [
    {
      statusCode: 200,
      description: 'Customer found',
    },
    {
      statusCode: 403,
      description: 'Permission denied - customer.read required',
    },
  ],
});

/**
 * Example: Admin Endpoint with Multiple Permissions
 * 
 * All listed permissions must be satisfied (AND logic).
 */
const adminEndpoint = ApiEndpointRegistration.create({
  id: 'bulk_update_customers',
  method: 'POST',
  path: '/api/v1/admin/customers/bulk-update',
  summary: 'Bulk update customers',
  
  // Multiple permissions required
  requiredPermissions: [
    'customer.modifyAll', // Can modify all customer records
    'api_enabled',        // API access enabled
  ],
  
  responses: [],
});

// ==========================================
// Example 2: Dynamic Schema Linking
// ==========================================

/**
 * Example: Response with ObjectQL Reference
 * 
 * Instead of duplicating the customer schema, we reference
 * the ObjectQL object definition. When the object schema changes,
 * the API documentation automatically updates.
 */
const endpointWithDynamicSchema = ApiEndpointRegistration.create({
  id: 'get_customer_dynamic',
  method: 'GET',
  path: '/api/v1/customers/:id',
  summary: 'Get customer (with dynamic schema)',
  
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ],
  
  responses: [
    {
      statusCode: 200,
      description: 'Customer retrieved successfully',
      // Dynamic schema reference - auto-updates when object changes
      schema: {
        $ref: {
          objectId: 'customer',
          // Exclude sensitive fields from API response
          excludeFields: ['password_hash', 'internal_notes'],
        },
      },
    },
  ],
});

/**
 * Example: Request Body with ObjectQL Reference
 * 
 * The request body schema references the customer object,
 * but only includes specific fields allowed for creation.
 */
const createEndpointWithDynamicSchema = ApiEndpointRegistration.create({
  id: 'create_customer_dynamic',
  method: 'POST',
  path: '/api/v1/customers',
  summary: 'Create customer (with dynamic schema)',
  
  requestBody: {
    description: 'Customer data',
    required: true,
    schema: {
      $ref: {
        objectId: 'customer',
        // Only allow these fields in creation
        includeFields: ['name', 'email', 'phone', 'company'],
      },
    },
  },
  
  responses: [
    {
      statusCode: 201,
      description: 'Customer created',
      schema: {
        $ref: {
          objectId: 'customer',
          excludeFields: ['password_hash'],
        },
      },
    },
  ],
});

/**
 * Example: Complex Schema with Related Objects
 * 
 * Include related objects via lookup fields for a complete response.
 */
const orderWithRelations = ApiEndpointRegistration.create({
  id: 'get_order_with_relations',
  method: 'GET',
  path: '/api/v1/orders/:id',
  summary: 'Get order with customer and items',
  
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    },
  ],
  
  responses: [
    {
      statusCode: 200,
      description: 'Order with related objects',
      schema: {
        $ref: {
          objectId: 'order',
          // Include related customer and order items
          includeRelated: ['customer', 'items'],
        },
      },
    },
  ],
});

// ==========================================
// Example 3: Protocol Extensibility
// ==========================================

/**
 * Example: gRPC Service Endpoint
 * 
 * Plugin-registered gRPC service with protocol-specific configuration.
 */
const grpcEndpoint = ApiEndpointRegistration.create({
  id: 'grpc_get_customer',
  path: '/grpc/CustomerService/GetCustomer',
  summary: 'gRPC: Get Customer',
  
  // Protocol-specific configuration for gRPC
  protocolConfig: {
    subProtocol: 'grpc',
    serviceName: 'CustomerService',
    methodName: 'GetCustomer',
    streaming: false,
    packageName: 'objectstack.customer.v1',
  },
  
  responses: [],
});

/**
 * Example: tRPC Procedure
 * 
 * tRPC query with procedure-specific metadata.
 */
const trpcEndpoint = ApiEndpointRegistration.create({
  id: 'trpc_customer_get_by_id',
  path: '/trpc/customer.getById',
  summary: 'tRPC: Get Customer by ID',
  
  // tRPC-specific configuration
  protocolConfig: {
    subProtocol: 'trpc',
    procedureType: 'query',
    router: 'customer',
    procedureName: 'getById',
  },
  
  responses: [],
});

/**
 * Example: WebSocket Event
 * 
 * Real-time event with WebSocket-specific metadata.
 */
const websocketEndpoint = ApiEndpointRegistration.create({
  id: 'ws_customer_updated',
  path: '/ws/events/customer.updated',
  summary: 'WebSocket: Customer Updated Event',
  
  // WebSocket-specific configuration
  protocolConfig: {
    subProtocol: 'websocket',
    eventName: 'customer.updated',
    direction: 'server-to-client',
    requiresAuth: true,
    room: 'customer_updates',
  },
  
  responses: [],
});

// ==========================================
// Example 4: Route Priority & Conflict Resolution
// ==========================================

/**
 * Example: High Priority Core Endpoint
 * 
 * Core system endpoints should have high priority (900-1000)
 * to ensure they're registered before plugin endpoints.
 */
const coreEndpoint = ApiEndpointRegistration.create({
  id: 'core_data_operation',
  method: 'GET',
  path: '/api/v1/data/:object/:id',
  summary: 'Core data operation',
  
  // High priority for core system endpoint
  priority: 950,
  
  responses: [],
});

/**
 * Example: Medium Priority Plugin Endpoint
 * 
 * Plugin endpoints should have medium priority (100-500).
 */
const pluginEndpoint = ApiEndpointRegistration.create({
  id: 'plugin_custom_action',
  method: 'POST',
  path: '/api/v1/custom/action',
  summary: 'Plugin custom action',
  
  // Medium priority for plugin endpoint
  priority: 300,
  
  protocolConfig: {
    pluginId: 'custom_actions_plugin',
  },
  
  responses: [],
});

/**
 * Example: Low Priority Fallback Endpoint
 * 
 * Fallback or catch-all endpoints should have low priority (0-100).
 */
const fallbackEndpoint = ApiEndpointRegistration.create({
  id: 'fallback_handler',
  method: 'GET',
  path: '/api/*',
  summary: 'Fallback handler',
  
  // Low priority for fallback endpoint
  priority: 50,
  
  responses: [
    {
      statusCode: 404,
      description: 'Not found',
    },
  ],
});

// ==========================================
// Example 5: Complete Registry with Conflict Resolution
// ==========================================

/**
 * Example: Complete Registry with Priority-based Conflict Resolution
 * 
 * When multiple endpoints have overlapping routes, the priority field
 * determines which endpoint wins.
 */
const completeRegistry = ApiRegistry.create({
  version: '1.0.0',
  
  // Use priority-based conflict resolution
  conflictResolution: 'priority' as ConflictResolutionStrategy,
  
  apis: [
    // Core REST API (high priority endpoints)
    ApiRegistryEntry.create({
      id: 'core_rest_api',
      name: 'Core REST API',
      type: 'rest',
      version: 'v1',
      basePath: '/api/v1',
      description: 'Core system REST API',
      endpoints: [
        coreEndpoint,
      ],
      metadata: {
        owner: 'platform_team',
        status: 'active',
      },
    }),
    
    // Plugin API (medium priority endpoints)
    ApiRegistryEntry.create({
      id: 'plugin_api',
      name: 'Custom Actions Plugin API',
      type: 'plugin',
      version: '1.0.0',
      basePath: '/api/v1/custom',
      description: 'Custom actions provided by plugin',
      endpoints: [
        pluginEndpoint,
      ],
      metadata: {
        owner: 'plugin_team',
        status: 'active',
        pluginSource: 'custom_actions_plugin',
      },
    }),
    
    // gRPC API
    ApiRegistryEntry.create({
      id: 'grpc_api',
      name: 'gRPC API',
      type: 'plugin',
      version: '1.0.0',
      basePath: '/grpc',
      description: 'gRPC services',
      endpoints: [
        grpcEndpoint,
      ],
      config: {
        grpcVersion: '1.0.0',
        reflection: true,
      },
      metadata: {
        status: 'beta',
      },
    }),
  ],
  
  totalApis: 3,
  totalEndpoints: 3,
});

// ==========================================
// Example 6: Complete Endpoint with All Features
// ==========================================

/**
 * Example: Production-ready Endpoint with All Enhancements
 * 
 * This example combines all four enhancements:
 * - RBAC permissions
 * - Dynamic schema linking
 * - Protocol configuration
 * - Route priority
 */
const productionEndpoint = ApiEndpointRegistration.create({
  id: 'get_customer_full_featured',
  method: 'GET',
  path: '/api/v1/customers/:id',
  summary: 'Get customer by ID (full-featured)',
  description: 'Production-ready endpoint with all enhancements',
  operationId: 'getCustomerById',
  tags: ['customer', 'crm', 'public'],
  
  // 1. RBAC Integration
  requiredPermissions: ['customer.read'],
  
  // 2. Route Priority
  priority: 500,
  
  // 3. Protocol Configuration
  protocolConfig: {
    cacheEnabled: true,
    cacheTtl: 300, // 5 minutes
    rateLimitPerMinute: 100,
  },
  
  // Standard OpenAPI security (in addition to RBAC)
  security: [
    {
      type: 'http',
      scheme: 'bearer',
    },
  ],
  
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'Customer ID',
      required: true,
      schema: {
        type: 'string',
        format: 'uuid',
      },
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    {
      name: 'include',
      in: 'query',
      description: 'Related objects to include',
      required: false,
      schema: {
        type: 'array',
        items: { type: 'string' },
        enum: ['orders', 'contacts', 'activities'],
      },
    },
  ],
  
  // 4. Dynamic Schema Linking
  responses: [
    {
      statusCode: 200,
      description: 'Customer found',
      schema: {
        $ref: {
          objectId: 'customer',
          excludeFields: ['password_hash', 'internal_notes'],
          includeRelated: ['account'],
        },
      },
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0100',
        account: {
          id: 'acc-001',
          name: 'Acme Account',
        },
      },
    },
    {
      statusCode: 404,
      description: 'Customer not found',
    },
    {
      statusCode: 403,
      description: 'Permission denied',
    },
  ],
  
  externalDocs: {
    description: 'Customer API Documentation',
    url: 'https://docs.objectstack.ai/api/customers',
  },
});

// Export examples for documentation
export {
  endpointWithRBAC,
  adminEndpoint,
  endpointWithDynamicSchema,
  createEndpointWithDynamicSchema,
  orderWithRelations,
  grpcEndpoint,
  trpcEndpoint,
  websocketEndpoint,
  coreEndpoint,
  pluginEndpoint,
  fallbackEndpoint,
  completeRegistry,
  productionEndpoint,
};
