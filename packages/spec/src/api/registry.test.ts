import { describe, it, expect } from 'vitest';
import {
  ApiProtocolType,
  ApiParameterSchema,
  ApiResponseSchema,
  ApiEndpointRegistrationSchema,
  ApiMetadataSchema,
  ApiRegistryEntrySchema,
  ApiRegistrySchema,
  ApiDiscoveryQuerySchema,
  ApiDiscoveryResponseSchema,
  ApiEndpointRegistration,
  ApiRegistryEntry,
  ApiRegistry,
} from './registry.zod';

describe('API Registry Protocol', () => {
  describe('ApiProtocolType', () => {
    it('should accept valid API protocol types', () => {
      expect(ApiProtocolType.parse('rest')).toBe('rest');
      expect(ApiProtocolType.parse('graphql')).toBe('graphql');
      expect(ApiProtocolType.parse('odata')).toBe('odata');
      expect(ApiProtocolType.parse('websocket')).toBe('websocket');
      expect(ApiProtocolType.parse('file')).toBe('file');
      expect(ApiProtocolType.parse('auth')).toBe('auth');
      expect(ApiProtocolType.parse('metadata')).toBe('metadata');
      expect(ApiProtocolType.parse('plugin')).toBe('plugin');
      expect(ApiProtocolType.parse('webhook')).toBe('webhook');
      expect(ApiProtocolType.parse('rpc')).toBe('rpc');
    });

    it('should reject invalid API protocol types', () => {
      expect(() => ApiProtocolType.parse('invalid')).toThrow();
    });
  });

  describe('ApiParameterSchema', () => {
    it('should validate valid parameter', () => {
      const param = {
        name: 'id',
        in: 'path' as const,
        description: 'Customer ID',
        required: true,
        schema: {
          type: 'string' as const,
          format: 'uuid',
        },
        example: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = ApiParameterSchema.parse(param);
      expect(result.name).toBe('id');
      expect(result.in).toBe('path');
      expect(result.required).toBe(true);
    });

    it('should apply defaults for optional fields', () => {
      const param = {
        name: 'filter',
        in: 'query' as const,
        schema: { type: 'string' as const },
      };

      const result = ApiParameterSchema.parse(param);
      expect(result.required).toBe(false);
    });

    it('should validate parameter in different locations', () => {
      expect(() => ApiParameterSchema.parse({
        name: 'auth',
        in: 'header',
        schema: { type: 'string' },
      })).not.toThrow();

      expect(() => ApiParameterSchema.parse({
        name: 'page',
        in: 'query',
        schema: { type: 'number' },
      })).not.toThrow();

      expect(() => ApiParameterSchema.parse({
        name: 'id',
        in: 'path',
        schema: { type: 'string' },
      })).not.toThrow();

      expect(() => ApiParameterSchema.parse({
        name: 'data',
        in: 'body',
        schema: { type: 'object' },
      })).not.toThrow();
    });
  });

  describe('ApiResponseSchema', () => {
    it('should validate valid response', () => {
      const response = {
        statusCode: 200,
        description: 'Successful response',
        contentType: 'application/json',
        schema: { type: 'object' },
        example: { id: '123', name: 'Test' },
      };

      const result = ApiResponseSchema.parse(response);
      expect(result.statusCode).toBe(200);
      expect(result.contentType).toBe('application/json');
    });

    it('should apply default content type', () => {
      const response = {
        statusCode: 200,
        description: 'Success',
      };

      const result = ApiResponseSchema.parse(response);
      expect(result.contentType).toBe('application/json');
    });

    it('should accept status code patterns', () => {
      expect(() => ApiResponseSchema.parse({
        statusCode: '2xx',
        description: 'Success range',
      })).not.toThrow();

      expect(() => ApiResponseSchema.parse({
        statusCode: 404,
        description: 'Not found',
      })).not.toThrow();
    });
  });

  describe('ApiEndpointRegistrationSchema', () => {
    it('should validate complete endpoint registration', () => {
      const endpoint = {
        id: 'get_customer',
        method: 'GET',
        path: '/api/v1/customers/:id',
        summary: 'Get customer by ID',
        description: 'Retrieves a single customer record',
        operationId: 'getCustomerById',
        tags: ['customer', 'data'],
        parameters: [
          {
            name: 'id',
            in: 'path' as const,
            required: true,
            schema: { type: 'string' as const },
          },
        ],
        responses: [
          {
            statusCode: 200,
            description: 'Customer found',
            schema: { type: 'object' as const },
          },
          {
            statusCode: 404,
            description: 'Customer not found',
          },
        ],
        deprecated: false,
      };

      const result = ApiEndpointRegistrationSchema.parse(endpoint);
      expect(result.id).toBe('get_customer');
      expect(result.method).toBe('GET');
      expect(result.tags).toHaveLength(2);
      expect(result.parameters).toHaveLength(1);
      expect(result.responses).toHaveLength(2);
    });

    it('should apply defaults for optional fields', () => {
      const endpoint = {
        id: 'simple_endpoint',
        path: '/api/test',
      };

      const result = ApiEndpointRegistrationSchema.parse(endpoint);
      expect(result.tags).toEqual([]);
      expect(result.parameters).toEqual([]);
      expect(result.responses).toEqual([]);
      expect(result.deprecated).toBe(false);
    });

    it('should support request body', () => {
      const endpoint = {
        id: 'create_customer',
        method: 'POST',
        path: '/api/v1/customers',
        requestBody: {
          description: 'Customer data',
          required: true,
          contentType: 'application/json',
          schema: { type: 'object' },
          example: { name: 'John Doe', email: 'john@example.com' },
        },
        responses: [
          {
            statusCode: 201,
            description: 'Customer created',
          },
        ],
      };

      const result = ApiEndpointRegistrationSchema.parse(endpoint);
      expect(result.requestBody).toBeDefined();
      expect(result.requestBody?.required).toBe(true);
    });

    it('should support security requirements', () => {
      const endpoint = {
        id: 'protected_endpoint',
        path: '/api/v1/protected',
        security: [
          {
            type: 'http' as const,
            scheme: 'bearer',
          },
          {
            type: 'apiKey' as const,
            name: 'X-API-Key',
            in: 'header' as const,
          },
        ],
        responses: [],
      };

      const result = ApiEndpointRegistrationSchema.parse(endpoint);
      expect(result.security).toHaveLength(2);
      expect(result.security?.[0].type).toBe('http');
    });

    it('should use helper create function', () => {
      const endpoint = ApiEndpointRegistration.create({
        id: 'test_endpoint',
        path: '/test',
        summary: 'Test endpoint',
      });

      expect(endpoint.id).toBe('test_endpoint');
      expect(endpoint.path).toBe('/test');
    });
  });

  describe('ApiMetadataSchema', () => {
    it('should validate API metadata', () => {
      const metadata = {
        owner: 'api_team',
        status: 'active' as const,
        tags: ['customer', 'public'],
        custom: {
          rateLimit: 1000,
          cacheable: true,
        },
      };

      const result = ApiMetadataSchema.parse(metadata);
      expect(result.owner).toBe('api_team');
      expect(result.status).toBe('active');
      expect(result.tags).toHaveLength(2);
    });

    it('should apply defaults', () => {
      const metadata = {};

      const result = ApiMetadataSchema.parse(metadata);
      expect(result.status).toBe('active');
      expect(result.tags).toEqual([]);
    });

    it('should validate status values', () => {
      expect(() => ApiMetadataSchema.parse({ status: 'active' })).not.toThrow();
      expect(() => ApiMetadataSchema.parse({ status: 'deprecated' })).not.toThrow();
      expect(() => ApiMetadataSchema.parse({ status: 'experimental' })).not.toThrow();
      expect(() => ApiMetadataSchema.parse({ status: 'beta' })).not.toThrow();
      expect(() => ApiMetadataSchema.parse({ status: 'invalid' })).toThrow();
    });

    it('should support plugin source', () => {
      const metadata = {
        pluginSource: 'payment_gateway_plugin',
        status: 'active' as const,
      };

      const result = ApiMetadataSchema.parse(metadata);
      expect(result.pluginSource).toBe('payment_gateway_plugin');
    });
  });

  describe('ApiRegistryEntrySchema', () => {
    it('should validate complete registry entry', () => {
      const entry = {
        id: 'customer_api',
        name: 'Customer Management API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/v1/customers',
        description: 'CRUD operations for customer records',
        endpoints: [
          {
            id: 'list_customers',
            method: 'GET',
            path: '/api/v1/customers',
            summary: 'List customers',
            responses: [],
          },
          {
            id: 'get_customer',
            method: 'GET',
            path: '/api/v1/customers/:id',
            summary: 'Get customer',
            responses: [],
          },
        ],
        metadata: {
          owner: 'sales_team',
          status: 'active' as const,
          tags: ['customer', 'crm'],
        },
        contact: {
          name: 'API Team',
          email: 'api@example.com',
        },
        license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0',
        },
      };

      const result = ApiRegistryEntrySchema.parse(entry);
      expect(result.id).toBe('customer_api');
      expect(result.type).toBe('rest');
      expect(result.endpoints).toHaveLength(2);
    });

    it('should enforce snake_case for id', () => {
      expect(() => ApiRegistryEntrySchema.parse({
        id: 'customer_api',
        name: 'Customer API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/customers',
        endpoints: [],
      })).not.toThrow();

      expect(() => ApiRegistryEntrySchema.parse({
        id: 'CustomerAPI',
        name: 'Customer API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/customers',
        endpoints: [],
      })).toThrow();
    });

    it('should support plugin-registered APIs', () => {
      const entry = {
        id: 'payment_webhook',
        name: 'Payment Webhook API',
        type: 'plugin',
        version: '1.0.0',
        basePath: '/plugins/payment/webhook',
        endpoints: [
          {
            id: 'receive_payment_notification',
            method: 'POST',
            path: '/plugins/payment/webhook',
            responses: [],
          },
        ],
        metadata: {
          pluginSource: 'payment_gateway_plugin',
          status: 'active' as const,
        },
      };

      const result = ApiRegistryEntrySchema.parse(entry);
      expect(result.type).toBe('plugin');
      expect(result.metadata?.pluginSource).toBe('payment_gateway_plugin');
    });

    it('should use helper create function', () => {
      const entry = ApiRegistryEntry.create({
        id: 'test_api',
        name: 'Test API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/test',
        endpoints: [],
      });

      expect(entry.id).toBe('test_api');
      expect(entry.type).toBe('rest');
    });
  });

  describe('ApiRegistrySchema', () => {
    it('should validate complete registry', () => {
      const registry = {
        version: '1.0.0',
        apis: [
          {
            id: 'customer_api',
            name: 'Customer API',
            type: 'rest',
            version: 'v1',
            basePath: '/api/v1/customers',
            endpoints: [
              {
                id: 'list_customers',
                path: '/api/v1/customers',
                responses: [],
              },
            ],
          },
          {
            id: 'graphql_api',
            name: 'GraphQL API',
            type: 'graphql',
            version: 'v1',
            basePath: '/graphql',
            endpoints: [
              {
                id: 'graphql_query',
                path: '/graphql',
                responses: [],
              },
            ],
          },
        ],
        totalApis: 2,
        totalEndpoints: 2,
        updatedAt: new Date().toISOString(),
      };

      const result = ApiRegistrySchema.parse(registry);
      expect(result.totalApis).toBe(2);
      expect(result.apis).toHaveLength(2);
    });

    it('should support grouping by type', () => {
      const registry = {
        version: '1.0.0',
        apis: [
          {
            id: 'rest_api_1',
            name: 'REST API 1',
            type: 'rest' as const,
            version: 'v1',
            basePath: '/api/v1',
            endpoints: [],
          },
          {
            id: 'rest_api_2',
            name: 'REST API 2',
            type: 'rest' as const,
            version: 'v1',
            basePath: '/api/v2',
            endpoints: [],
          },
          {
            id: 'graphql_api',
            name: 'GraphQL API',
            type: 'graphql' as const,
            version: 'v1',
            basePath: '/graphql',
            endpoints: [],
          },
        ],
        totalApis: 3,
        totalEndpoints: 0,
      };

      const result = ApiRegistrySchema.parse(registry);
      expect(result.totalApis).toBe(3);
      expect(result.apis).toHaveLength(3);
    });

    it('should use helper create function', () => {
      const registry = ApiRegistry.create({
        version: '1.0.0',
        apis: [],
        totalApis: 0,
        totalEndpoints: 0,
      });

      expect(registry.version).toBe('1.0.0');
      expect(registry.totalApis).toBe(0);
    });
  });

  describe('ApiDiscoveryQuerySchema', () => {
    it('should validate discovery query', () => {
      const query = {
        type: 'rest',
        tags: ['customer', 'public'],
        status: 'active' as const,
        search: 'customer',
      };

      const result = ApiDiscoveryQuerySchema.parse(query);
      expect(result.type).toBe('rest');
      expect(result.tags).toHaveLength(2);
      expect(result.status).toBe('active');
    });

    it('should allow empty query', () => {
      const query = {};
      const result = ApiDiscoveryQuerySchema.parse(query);
      expect(result).toEqual({});
    });

    it('should filter by plugin source', () => {
      const query = {
        pluginSource: 'payment_gateway',
      };

      const result = ApiDiscoveryQuerySchema.parse(query);
      expect(result.pluginSource).toBe('payment_gateway');
    });
  });

  describe('ApiDiscoveryResponseSchema', () => {
    it('should validate discovery response', () => {
      const response = {
        apis: [
          {
            id: 'customer_api',
            name: 'Customer API',
            type: 'rest',
            version: 'v1',
            basePath: '/api/customers',
            endpoints: [],
          },
        ],
        total: 1,
        filters: {
          type: 'rest',
          status: 'active' as const,
        },
      };

      const result = ApiDiscoveryResponseSchema.parse(response);
      expect(result.total).toBe(1);
      expect(result.apis).toHaveLength(1);
    });
  });
});
