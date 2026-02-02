import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiRegistry } from './api-registry';
import type {
  ApiRegistryEntry,
} from '@objectstack/spec/api';
import type { Logger } from '@objectstack/spec/contracts';

// Mock logger
const createMockLogger = (): Logger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

describe('ApiRegistry', () => {
  let registry: ApiRegistry;
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
    registry = new ApiRegistry(logger, 'error', '1.0.0');
  });

  describe('Constructor', () => {
    it('should create registry with default conflict resolution', () => {
      const reg = new ApiRegistry(logger);
      const snapshot = reg.getRegistry();
      expect(snapshot.conflictResolution).toBe('error');
      expect(snapshot.version).toBe('1.0.0');
    });

    it('should create registry with custom conflict resolution', () => {
      const reg = new ApiRegistry(logger, 'priority', '2.0.0');
      const snapshot = reg.getRegistry();
      expect(snapshot.conflictResolution).toBe('priority');
      expect(snapshot.version).toBe('2.0.0');
    });
  });

  describe('registerApi', () => {
    it('should register a simple REST API', () => {
      const api: ApiRegistryEntry = {
        id: 'customer_api',
        name: 'Customer API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/v1/customers',
        endpoints: [
          {
            id: 'get_customer',
            method: 'GET',
            path: '/api/v1/customers/:id',
            summary: 'Get customer by ID',
            responses: [
              {
                statusCode: 200,
                description: 'Success',
              },
            ],
          },
        ],
      };

      registry.registerApi(api);

      const retrieved = registry.getApi('customer_api');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Customer API');
      expect(retrieved?.endpoints.length).toBe(1);
    });

    it('should throw error when registering duplicate API', () => {
      const api: ApiRegistryEntry = {
        id: 'test_api',
        name: 'Test API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/test',
        endpoints: [],
      };

      registry.registerApi(api);

      expect(() => registry.registerApi(api)).toThrow(
        "API 'test_api' already registered"
      );
    });

    it('should register API with multiple endpoints', () => {
      const api: ApiRegistryEntry = {
        id: 'crud_api',
        name: 'CRUD API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/v1/data',
        endpoints: [
          {
            id: 'create',
            method: 'POST',
            path: '/api/v1/data',
            summary: 'Create record',
            responses: [],
          },
          {
            id: 'read',
            method: 'GET',
            path: '/api/v1/data/:id',
            summary: 'Read record',
            responses: [],
          },
          {
            id: 'update',
            method: 'PUT',
            path: '/api/v1/data/:id',
            summary: 'Update record',
            responses: [],
          },
          {
            id: 'delete',
            method: 'DELETE',
            path: '/api/v1/data/:id',
            summary: 'Delete record',
            responses: [],
          },
        ],
      };

      registry.registerApi(api);

      const stats = registry.getStats();
      expect(stats.totalApis).toBe(1);
      expect(stats.totalEndpoints).toBe(4);
      expect(stats.totalRoutes).toBe(4);
    });

    it('should register API with RBAC permissions', () => {
      const api: ApiRegistryEntry = {
        id: 'protected_api',
        name: 'Protected API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/protected',
        endpoints: [
          {
            id: 'admin_only',
            method: 'POST',
            path: '/api/protected/admin',
            summary: 'Admin endpoint',
            requiredPermissions: ['admin.access', 'api_enabled'],
            responses: [],
          },
        ],
      };

      registry.registerApi(api);

      const endpoint = registry.getEndpoint('protected_api', 'admin_only');
      expect(endpoint?.requiredPermissions).toEqual(['admin.access', 'api_enabled']);
    });
  });

  describe('unregisterApi', () => {
    it('should unregister an API', () => {
      const api: ApiRegistryEntry = {
        id: 'temp_api',
        name: 'Temporary API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/temp',
        endpoints: [
          {
            id: 'test',
            method: 'GET',
            path: '/api/temp/test',
            responses: [],
          },
        ],
      };

      registry.registerApi(api);
      expect(registry.getApi('temp_api')).toBeDefined();

      registry.unregisterApi('temp_api');
      expect(registry.getApi('temp_api')).toBeUndefined();
    });

    it('should throw error when unregistering non-existent API', () => {
      expect(() => registry.unregisterApi('nonexistent')).toThrow(
        "API 'nonexistent' not found"
      );
    });
  });

  describe('Route Conflict Detection', () => {
    describe('error strategy', () => {
      it('should throw error on route conflict', () => {
        const api1: ApiRegistryEntry = {
          id: 'api1',
          name: 'API 1',
          type: 'rest',
          version: 'v1',
          basePath: '/api/v1',
          endpoints: [
            {
              id: 'endpoint1',
              method: 'GET',
              path: '/api/v1/test',
              responses: [],
            },
          ],
        };

        const api2: ApiRegistryEntry = {
          id: 'api2',
          name: 'API 2',
          type: 'rest',
          version: 'v1',
          basePath: '/api/v1',
          endpoints: [
            {
              id: 'endpoint2',
              method: 'GET',
              path: '/api/v1/test', // Same route!
              responses: [],
            },
          ],
        };

        registry.registerApi(api1);
        expect(() => registry.registerApi(api2)).toThrow(/Route conflict detected/);
      });

      it('should allow same path with different methods', () => {
        const api: ApiRegistryEntry = {
          id: 'multi_method',
          name: 'Multi Method API',
          type: 'rest',
          version: 'v1',
          basePath: '/api/v1',
          endpoints: [
            {
              id: 'get',
              method: 'GET',
              path: '/api/v1/resource',
              responses: [],
            },
            {
              id: 'post',
              method: 'POST',
              path: '/api/v1/resource',
              responses: [],
            },
            {
              id: 'put',
              method: 'PUT',
              path: '/api/v1/resource',
              responses: [],
            },
          ],
        };

        expect(() => registry.registerApi(api)).not.toThrow();
        expect(registry.getStats().totalRoutes).toBe(3);
      });
    });

    describe('priority strategy', () => {
      beforeEach(() => {
        registry = new ApiRegistry(logger, 'priority');
      });

      it('should prefer higher priority endpoint', () => {
        const api1: ApiRegistryEntry = {
          id: 'low_priority',
          name: 'Low Priority API',
          type: 'rest',
          version: 'v1',
          basePath: '/api',
          endpoints: [
            {
              id: 'low',
              method: 'GET',
              path: '/api/test',
              priority: 100,
              responses: [],
            },
          ],
        };

        const api2: ApiRegistryEntry = {
          id: 'high_priority',
          name: 'High Priority API',
          type: 'rest',
          version: 'v1',
          basePath: '/api',
          endpoints: [
            {
              id: 'high',
              method: 'GET',
              path: '/api/test',
              priority: 500,
              responses: [],
            },
          ],
        };

        registry.registerApi(api1);
        registry.registerApi(api2); // Should replace low priority

        const result = registry.findEndpointByRoute('GET', '/api/test');
        expect(result?.api.id).toBe('high_priority');
        expect(result?.endpoint.id).toBe('high');
      });

      it('should keep higher priority when registering lower priority', () => {
        const api1: ApiRegistryEntry = {
          id: 'high_priority',
          name: 'High Priority API',
          type: 'rest',
          version: 'v1',
          basePath: '/api',
          endpoints: [
            {
              id: 'high',
              method: 'GET',
              path: '/api/test',
              priority: 900,
              responses: [],
            },
          ],
        };

        const api2: ApiRegistryEntry = {
          id: 'low_priority',
          name: 'Low Priority API',
          type: 'rest',
          version: 'v1',
          basePath: '/api',
          endpoints: [
            {
              id: 'low',
              method: 'GET',
              path: '/api/test',
              priority: 100,
              responses: [],
            },
          ],
        };

        registry.registerApi(api1);
        registry.registerApi(api2); // Should NOT replace

        const result = registry.findEndpointByRoute('GET', '/api/test');
        expect(result?.api.id).toBe('high_priority');
        expect(result?.endpoint.id).toBe('high');
      });
    });

    describe('first-wins strategy', () => {
      beforeEach(() => {
        registry = new ApiRegistry(logger, 'first-wins');
      });

      it('should keep first registered endpoint', () => {
        const api1: ApiRegistryEntry = {
          id: 'first',
          name: 'First API',
          type: 'rest',
          version: 'v1',
          basePath: '/api',
          endpoints: [
            {
              id: 'first_endpoint',
              method: 'GET',
              path: '/api/test',
              responses: [],
            },
          ],
        };

        const api2: ApiRegistryEntry = {
          id: 'second',
          name: 'Second API',
          type: 'rest',
          version: 'v1',
          basePath: '/api',
          endpoints: [
            {
              id: 'second_endpoint',
              method: 'GET',
              path: '/api/test',
              responses: [],
            },
          ],
        };

        registry.registerApi(api1);
        registry.registerApi(api2);

        const result = registry.findEndpointByRoute('GET', '/api/test');
        expect(result?.api.id).toBe('first');
        expect(result?.endpoint.id).toBe('first_endpoint');
      });
    });

    describe('last-wins strategy', () => {
      beforeEach(() => {
        registry = new ApiRegistry(logger, 'last-wins');
      });

      it('should use last registered endpoint', () => {
        const api1: ApiRegistryEntry = {
          id: 'first',
          name: 'First API',
          type: 'rest',
          version: 'v1',
          basePath: '/api',
          endpoints: [
            {
              id: 'first_endpoint',
              method: 'GET',
              path: '/api/test',
              responses: [],
            },
          ],
        };

        const api2: ApiRegistryEntry = {
          id: 'second',
          name: 'Second API',
          type: 'rest',
          version: 'v1',
          basePath: '/api',
          endpoints: [
            {
              id: 'second_endpoint',
              method: 'GET',
              path: '/api/test',
              responses: [],
            },
          ],
        };

        registry.registerApi(api1);
        registry.registerApi(api2);

        const result = registry.findEndpointByRoute('GET', '/api/test');
        expect(result?.api.id).toBe('second');
        expect(result?.endpoint.id).toBe('second_endpoint');
      });
    });
  });

  describe('findApis', () => {
    beforeEach(() => {
      // Register multiple APIs for testing
      registry.registerApi({
        id: 'rest_api',
        name: 'REST API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/v1/rest',
        endpoints: [],
        metadata: {
          status: 'active',
          tags: ['data', 'crud'],
        },
      });

      registry.registerApi({
        id: 'graphql_api',
        name: 'GraphQL API',
        type: 'graphql',
        version: 'v1',
        basePath: '/graphql',
        endpoints: [],
        metadata: {
          status: 'active',
          tags: ['query', 'data'],
        },
      });

      registry.registerApi({
        id: 'deprecated_api',
        name: 'Deprecated API',
        type: 'rest',
        version: 'v0',
        basePath: '/api/v0/old',
        endpoints: [],
        metadata: {
          status: 'deprecated',
          tags: ['legacy'],
        },
      });
    });

    it('should find all APIs with empty query', () => {
      const result = registry.findApis({});
      expect(result.total).toBe(3);
      expect(result.apis.length).toBe(3);
    });

    it('should filter by type', () => {
      const result = registry.findApis({ type: 'rest' });
      expect(result.total).toBe(2);
      expect(result.apis.every((api) => api.type === 'rest')).toBe(true);
    });

    it('should filter by status', () => {
      const result = registry.findApis({ status: 'active' });
      expect(result.total).toBe(2);
      expect(result.apis.every((api) => api.metadata?.status === 'active')).toBe(true);
    });

    it('should filter by version', () => {
      const result = registry.findApis({ version: 'v1' });
      expect(result.total).toBe(2);
      expect(result.apis.every((api) => api.version === 'v1')).toBe(true);
    });

    it('should filter by tags (ANY match)', () => {
      const result = registry.findApis({ tags: ['data'] });
      expect(result.total).toBe(2);
    });

    it('should search in name and description', () => {
      const result = registry.findApis({ search: 'graphql' });
      expect(result.total).toBe(1);
      expect(result.apis[0].id).toBe('graphql_api');
    });

    it('should combine multiple filters', () => {
      const result = registry.findApis({
        type: 'rest',
        status: 'active',
        tags: ['crud'],
      });
      expect(result.total).toBe(1);
      expect(result.apis[0].id).toBe('rest_api');
    });
  });

  describe('getEndpoint', () => {
    it('should get endpoint by API and endpoint ID', () => {
      const api: ApiRegistryEntry = {
        id: 'test_api',
        name: 'Test API',
        type: 'rest',
        version: 'v1',
        basePath: '/api/test',
        endpoints: [
          {
            id: 'test_endpoint',
            method: 'GET',
            path: '/api/test/hello',
            summary: 'Test endpoint',
            responses: [],
          },
        ],
      };

      registry.registerApi(api);

      const endpoint = registry.getEndpoint('test_api', 'test_endpoint');
      expect(endpoint).toBeDefined();
      expect(endpoint?.summary).toBe('Test endpoint');
    });

    it('should return undefined for non-existent endpoint', () => {
      const endpoint = registry.getEndpoint('nonexistent', 'also_nonexistent');
      expect(endpoint).toBeUndefined();
    });
  });

  describe('findEndpointByRoute', () => {
    it('should find endpoint by method and path', () => {
      const api: ApiRegistryEntry = {
        id: 'route_api',
        name: 'Route API',
        type: 'rest',
        version: 'v1',
        basePath: '/api',
        endpoints: [
          {
            id: 'get_users',
            method: 'GET',
            path: '/api/users',
            responses: [],
          },
        ],
      };

      registry.registerApi(api);

      const result = registry.findEndpointByRoute('GET', '/api/users');
      expect(result).toBeDefined();
      expect(result?.api.id).toBe('route_api');
      expect(result?.endpoint.id).toBe('get_users');
    });

    it('should return undefined for non-existent route', () => {
      const result = registry.findEndpointByRoute('POST', '/nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getRegistry', () => {
    it('should return complete registry snapshot', () => {
      registry.registerApi({
        id: 'api1',
        name: 'API 1',
        type: 'rest',
        version: 'v1',
        basePath: '/api/v1',
        endpoints: [
          { id: 'e1', path: '/api/v1/test', responses: [] },
        ],
      });

      const snapshot = registry.getRegistry();
      expect(snapshot.version).toBe('1.0.0');
      expect(snapshot.conflictResolution).toBe('error');
      expect(snapshot.totalApis).toBe(1);
      expect(snapshot.totalEndpoints).toBe(1);
      expect(snapshot.byType).toBeDefined();
      expect(snapshot.byStatus).toBeDefined();
      expect(snapshot.updatedAt).toBeDefined();
    });

    it('should group APIs by type', () => {
      registry.registerApi({
        id: 'rest1',
        name: 'REST 1',
        type: 'rest',
        version: 'v1',
        basePath: '/api/rest1',
        endpoints: [],
      });

      registry.registerApi({
        id: 'rest2',
        name: 'REST 2',
        type: 'rest',
        version: 'v1',
        basePath: '/api/rest2',
        endpoints: [],
      });

      registry.registerApi({
        id: 'graphql1',
        name: 'GraphQL 1',
        type: 'graphql',
        version: 'v1',
        basePath: '/graphql',
        endpoints: [],
      });

      const snapshot = registry.getRegistry();
      expect(snapshot.byType?.rest.length).toBe(2);
      expect(snapshot.byType?.graphql.length).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all registered APIs', () => {
      registry.registerApi({
        id: 'test',
        name: 'Test',
        type: 'rest',
        version: 'v1',
        basePath: '/test',
        endpoints: [{ id: 'e1', path: '/test', responses: [] }],
      });

      expect(registry.getStats().totalApis).toBe(1);

      registry.clear();

      expect(registry.getStats().totalApis).toBe(0);
      expect(registry.getStats().totalEndpoints).toBe(0);
      expect(registry.getStats().totalRoutes).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return accurate statistics', () => {
      registry.registerApi({
        id: 'api1',
        name: 'API 1',
        type: 'rest',
        version: 'v1',
        basePath: '/api1',
        endpoints: [
          { id: 'e1', path: '/api1/e1', responses: [] },
          { id: 'e2', path: '/api1/e2', responses: [] },
        ],
      });

      registry.registerApi({
        id: 'api2',
        name: 'API 2',
        type: 'graphql',
        version: 'v1',
        basePath: '/graphql',
        endpoints: [
          { id: 'query', path: '/graphql', responses: [] },
        ],
      });

      const stats = registry.getStats();
      expect(stats.totalApis).toBe(2);
      expect(stats.totalEndpoints).toBe(3);
      expect(stats.totalRoutes).toBe(3);
      expect(stats.apisByType.rest).toBe(1);
      expect(stats.apisByType.graphql).toBe(1);
      expect(stats.endpointsByApi.api1).toBe(2);
      expect(stats.endpointsByApi.api2).toBe(1);
    });
  });

  describe('Multi-protocol Support', () => {
    it('should register GraphQL API', () => {
      const api: ApiRegistryEntry = {
        id: 'graphql',
        name: 'GraphQL API',
        type: 'graphql',
        version: 'v1',
        basePath: '/graphql',
        endpoints: [
          {
            id: 'query',
            path: '/graphql',
            summary: 'GraphQL Query',
            responses: [],
          },
        ],
      };

      registry.registerApi(api);
      expect(registry.getApi('graphql')?.type).toBe('graphql');
    });

    it('should register WebSocket API', () => {
      const api: ApiRegistryEntry = {
        id: 'websocket',
        name: 'WebSocket API',
        type: 'websocket',
        version: 'v1',
        basePath: '/ws',
        endpoints: [
          {
            id: 'subscribe',
            path: '/ws/events',
            summary: 'Subscribe to events',
            protocolConfig: {
              subProtocol: 'websocket',
              eventName: 'data.updated',
              direction: 'server-to-client',
            },
            responses: [],
          },
        ],
      };

      registry.registerApi(api);
      const endpoint = registry.getEndpoint('websocket', 'subscribe');
      expect(endpoint?.protocolConfig?.subProtocol).toBe('websocket');
    });

    it('should register Plugin API', () => {
      const api: ApiRegistryEntry = {
        id: 'custom_plugin',
        name: 'Custom Plugin API',
        type: 'plugin',
        version: '1.0.0',
        basePath: '/plugins/custom',
        endpoints: [
          {
            id: 'custom_action',
            method: 'POST',
            path: '/plugins/custom/action',
            summary: 'Custom plugin action',
            responses: [],
          },
        ],
        metadata: {
          pluginSource: 'custom_plugin_package',
          status: 'active',
        },
      };

      registry.registerApi(api);
      const result = registry.findApis({ pluginSource: 'custom_plugin_package' });
      expect(result.total).toBe(1);
    });
  });
});
