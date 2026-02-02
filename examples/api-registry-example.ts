/**
 * Example: Unified API Registry Usage
 * 
 * This example demonstrates how to use the unified API registry system
 * to register different types of APIs and generate documentation.
 */

import {
  // Registry types
  ApiRegistry,
  ApiRegistryEntry,
  ApiEndpointRegistration,
  ApiProtocolType,
  
  // Documentation types
  ApiDocumentationConfig,
  OpenApiSpec,
  ApiTestCollection,
} from '@objectstack/spec/api';

// ==========================================
// Example 1: Register a REST API
// ==========================================

const customerRestApi = ApiRegistryEntry.create({
  id: 'customer_rest_api',
  name: 'Customer Management REST API',
  type: 'rest',
  version: 'v1',
  basePath: '/api/v1/customers',
  description: 'CRUD operations for customer records',
  
  // Define endpoints
  endpoints: [
    ApiEndpointRegistration.create({
      id: 'list_customers',
      method: 'GET',
      path: '/api/v1/customers',
      summary: 'List all customers',
      description: 'Retrieve a paginated list of customers',
      operationId: 'listCustomers',
      tags: ['customer', 'data'],
      
      // Query parameters
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          required: false,
          schema: { type: 'integer' },
          example: 1,
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          required: false,
          schema: { type: 'integer', default: 20 },
          example: 20,
        },
      ],
      
      // Response definitions
      responses: [
        {
          statusCode: 200,
          description: 'Successful response',
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              data: { type: 'array' },
              total: { type: 'integer' },
            },
          },
        },
      ],
      
      // Security requirements
      security: [
        {
          type: 'http',
          scheme: 'bearer',
        },
      ],
    }),
    
    ApiEndpointRegistration.create({
      id: 'create_customer',
      method: 'POST',
      path: '/api/v1/customers',
      summary: 'Create a new customer',
      operationId: 'createCustomer',
      tags: ['customer', 'data'],
      
      // Request body
      requestBody: {
        description: 'Customer data',
        required: true,
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
          },
          required: ['name', 'email'],
        },
        example: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      },
      
      responses: [
        {
          statusCode: 201,
          description: 'Customer created successfully',
          schema: { type: 'object' },
        },
        {
          statusCode: 400,
          description: 'Invalid input',
        },
      ],
      
      security: [{ type: 'http', scheme: 'bearer' }],
    }),
  ],
  
  // Metadata
  metadata: {
    owner: 'sales_team',
    status: 'active',
    tags: ['customer', 'crm', 'public'],
  },
  
  // Contact & License
  contact: {
    name: 'API Team',
    email: 'api@example.com',
  },
  license: {
    name: 'Apache 2.0',
    url: 'https://www.apache.org/licenses/LICENSE-2.0',
  },
});

// ==========================================
// Example 2: Register a GraphQL API
// ==========================================

const graphqlApi = ApiRegistryEntry.create({
  id: 'graphql_api',
  name: 'GraphQL API',
  type: 'graphql',
  version: 'v1',
  basePath: '/graphql',
  description: 'Flexible GraphQL API for querying data',
  
  endpoints: [
    ApiEndpointRegistration.create({
      id: 'graphql_endpoint',
      method: 'POST',
      path: '/graphql',
      summary: 'GraphQL query endpoint',
      operationId: 'graphqlQuery',
      tags: ['graphql'],
      
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            variables: { type: 'object' },
            operationName: { type: 'string' },
          },
          required: ['query'],
        },
      },
      
      responses: [
        {
          statusCode: 200,
          description: 'GraphQL response',
        },
      ],
      
      security: [{ type: 'http', scheme: 'bearer' }],
    }),
  ],
  
  metadata: {
    owner: 'platform_team',
    status: 'active',
  },
});

// ==========================================
// Example 3: Register a Plugin API
// ==========================================

const pluginApi = ApiRegistryEntry.create({
  id: 'payment_webhook_api',
  name: 'Payment Gateway Webhook API',
  type: 'plugin',
  version: '1.0.0',
  basePath: '/plugins/payment/webhook',
  description: 'Webhook endpoints for payment notifications',
  
  endpoints: [
    ApiEndpointRegistration.create({
      id: 'payment_webhook',
      method: 'POST',
      path: '/plugins/payment/webhook',
      summary: 'Receive payment notifications',
      operationId: 'receivePaymentWebhook',
      tags: ['webhook', 'payment'],
      
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            event: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
      
      responses: [
        {
          statusCode: 200,
          description: 'Webhook processed',
        },
      ],
      
      security: [
        {
          type: 'apiKey',
          name: 'X-Webhook-Secret',
          in: 'header',
        },
      ],
    }),
  ],
  
  metadata: {
    owner: 'payment_team',
    status: 'active',
    pluginSource: 'payment_gateway_plugin',
    tags: ['webhook', 'payment'],
  },
});

// ==========================================
// Example 4: Create the Registry
// ==========================================

const registry = ApiRegistry.create({
  version: '1.0.0',
  apis: [
    customerRestApi,
    graphqlApi,
    pluginApi,
  ],
  totalApis: 3,
  totalEndpoints: 4,
  updatedAt: new Date().toISOString(),
});

console.log('API Registry created with', registry.totalApis, 'APIs');

// ==========================================
// Example 5: API Discovery
// ==========================================

// Discover REST APIs
const restApis = registry.apis.filter(api => api.type === 'rest');
console.log('Found', restApis.length, 'REST APIs');

// Discover plugin-registered APIs
const pluginApis = registry.apis.filter(
  api => api.metadata?.pluginSource !== undefined
);
console.log('Found', pluginApis.length, 'plugin APIs');

// ==========================================
// Example 6: Configure API Documentation
// ==========================================

const docConfig = ApiDocumentationConfig.create({
  enabled: true,
  title: 'ObjectStack API Documentation',
  version: '1.0.0',
  description: 'Unified API documentation for ObjectStack platform',
  
  // Server configurations
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
    {
      url: 'https://staging-api.example.com',
      description: 'Staging server',
    },
  ],
  
  // Configure Swagger UI
  ui: {
    type: 'swagger-ui',
    path: '/api-docs',
    theme: 'light',
    enableTryItOut: true,
    enableFilter: true,
    displayRequestDuration: true,
    layout: {
      deepLinking: true,
      displayOperationId: false,
      docExpansion: 'list',
    },
  },
  
  // Generate OpenAPI spec and test collections
  generateOpenApi: true,
  generateTestCollections: true,
  
  // Test collections
  testCollections: [
    ApiTestCollection.create({
      name: 'Customer API Tests',
      description: 'Test collection for customer endpoints',
      variables: {
        baseUrl: 'https://api.example.com',
        token: 'test_token',
      },
      requests: [
        {
          name: 'List Customers',
          method: 'GET',
          url: '{{baseUrl}}/api/v1/customers',
          headers: {
            'Authorization': 'Bearer {{token}}',
          },
          queryParams: {
            page: 1,
            limit: 20,
          },
          expectedResponse: {
            statusCode: 200,
          },
        },
        {
          name: 'Create Customer',
          method: 'POST',
          url: '{{baseUrl}}/api/v1/customers',
          headers: {
            'Authorization': 'Bearer {{token}}',
            'Content-Type': 'application/json',
          },
          body: {
            name: 'Test Customer',
            email: 'test@example.com',
          },
          expectedResponse: {
            statusCode: 201,
          },
        },
      ],
    }),
  ],
  
  // API Changelog
  changelog: [
    {
      version: '1.0.0',
      date: '2024-01-01',
      changes: {
        added: [
          'Initial release with Customer REST API',
          'GraphQL API support',
          'Plugin API registration',
        ],
      },
    },
  ],
  
  // Code generation templates
  codeTemplates: [
    {
      language: 'typescript',
      name: 'TypeScript Axios Client',
      template: `
import axios from 'axios';

const api = axios.create({
  baseURL: '{{baseUrl}}',
  headers: {
    'Authorization': 'Bearer {{token}}'
  }
});

// List customers
const customers = await api.get('/api/v1/customers');

// Create customer
const newCustomer = await api.post('/api/v1/customers', {
  name: 'John Doe',
  email: 'john@example.com'
});
      `,
      variables: ['baseUrl', 'token'],
    },
    {
      language: 'curl',
      name: 'cURL Request',
      template: `
curl -X {{method}} {{baseUrl}}{{path}} \\
  -H "Authorization: Bearer {{token}}" \\
  -H "Content-Type: application/json" \\
  -d '{{body}}'
      `,
      variables: ['method', 'baseUrl', 'path', 'token', 'body'],
    },
  ],
  
  // Security schemes
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT bearer token authentication',
    },
    apiKey: {
      type: 'apiKey',
      name: 'X-API-Key',
      in: 'header',
      description: 'API key authentication',
    },
  },
  
  // Global tags
  tags: [
    {
      name: 'customer',
      description: 'Customer management operations',
    },
    {
      name: 'data',
      description: 'Data operations (CRUD)',
    },
    {
      name: 'webhook',
      description: 'Webhook endpoints',
    },
  ],
  
  // Contact and license
  contact: {
    name: 'API Support',
    email: 'api@example.com',
    url: 'https://example.com/support',
  },
  license: {
    name: 'Apache 2.0',
    url: 'https://www.apache.org/licenses/LICENSE-2.0',
  },
});

console.log('API Documentation configured');

// ==========================================
// Example 7: Generate OpenAPI Specification
// ==========================================

const openApiSpec = OpenApiSpec.create({
  openapi: '3.0.0',
  info: {
    title: docConfig.title,
    version: docConfig.version,
    description: docConfig.description,
    contact: docConfig.contact,
    license: docConfig.license,
  },
  servers: docConfig.servers,
  
  // Paths would be generated from the registry
  paths: {
    '/api/v1/customers': {
      get: {
        summary: 'List customers',
        operationId: 'listCustomers',
        tags: ['customer', 'data'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
          },
        },
        security: [
          { bearerAuth: [] },
        ],
      },
      post: {
        summary: 'Create customer',
        operationId: 'createCustomer',
        tags: ['customer', 'data'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Customer created',
          },
        },
        security: [
          { bearerAuth: [] },
        ],
      },
    },
  },
  
  components: {
    securitySchemes: docConfig.securitySchemes,
    schemas: {
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },
    },
  },
  
  tags: docConfig.tags,
});

console.log('OpenAPI specification generated');

// ==========================================
// Example 8: Usage Summary
// ==========================================

console.log(`
=================================================
Unified API Registry System Example
=================================================

Registry Summary:
- Total APIs: ${registry.totalApis}
- Total Endpoints: ${registry.totalEndpoints}
- API Types: REST, GraphQL, Plugin

Documentation:
- UI Type: ${docConfig.ui?.type}
- Test Collections: ${docConfig.testCollections?.length}
- Code Templates: ${docConfig.codeTemplates?.length}
- Security Schemes: ${Object.keys(docConfig.securitySchemes || {}).length}

Benefits:
✅ Unified API management across all protocols
✅ Auto-generated Swagger/OpenAPI documentation
✅ Plugin API support out-of-the-box
✅ Interactive API testing interface
✅ Version management and changelog
✅ Code generation for multiple languages

=================================================
`);

export {
  registry,
  docConfig,
  openApiSpec,
  customerRestApi,
  graphqlApi,
  pluginApi,
};
