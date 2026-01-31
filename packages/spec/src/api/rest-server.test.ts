import { describe, it, expect } from 'vitest';
import {
  RestApiConfigSchema,
  CrudOperation,
  CrudEndpointPatternSchema,
  CrudEndpointsConfigSchema,
  MetadataEndpointsConfigSchema,
  BatchEndpointsConfigSchema,
  RouteGenerationConfigSchema,
  RestServerConfigSchema,
  GeneratedEndpointSchema,
  EndpointRegistrySchema,
  RestApiConfig,
  RestServerConfig,
  type RestApiConfig as RestApiConfigType,
  type RestServerConfig as RestServerConfigType,
} from './rest-server.zod';

describe('RestApiConfigSchema', () => {
  it('should accept minimal config with defaults', () => {
    const config = RestApiConfigSchema.parse({});

    expect(config.version).toBe('v1');
    expect(config.basePath).toBe('/api');
    expect(config.enableCrud).toBe(true);
    expect(config.enableMetadata).toBe(true);
    expect(config.enableBatch).toBe(true);
    expect(config.enableDiscovery).toBe(true);
  });

  it('should accept custom version', () => {
    const config = RestApiConfigSchema.parse({
      version: 'v2',
    });

    expect(config.version).toBe('v2');
  });

  it('should accept date-based version', () => {
    const config = RestApiConfigSchema.parse({
      version: '2024-01',
    });

    expect(config.version).toBe('2024-01');
  });

  it('should accept custom basePath', () => {
    const config = RestApiConfigSchema.parse({
      basePath: '/rest',
    });

    expect(config.basePath).toBe('/rest');
  });

  it('should accept custom apiPath', () => {
    const config = RestApiConfigSchema.parse({
      apiPath: '/api/v2',
    });

    expect(config.apiPath).toBe('/api/v2');
  });

  it('should disable features', () => {
    const config = RestApiConfigSchema.parse({
      enableCrud: false,
      enableMetadata: false,
      enableBatch: false,
      enableDiscovery: false,
    });

    expect(config.enableCrud).toBe(false);
    expect(config.enableMetadata).toBe(false);
    expect(config.enableBatch).toBe(false);
    expect(config.enableDiscovery).toBe(false);
  });

  describe('Documentation Configuration', () => {
    it('should accept basic documentation config', () => {
      const config = RestApiConfigSchema.parse({
        documentation: {
          enabled: true,
          title: 'My API',
        },
      });

      expect(config.documentation?.enabled).toBe(true);
      expect(config.documentation?.title).toBe('My API');
    });

    it('should accept complete documentation config', () => {
      const config = RestApiConfigSchema.parse({
        documentation: {
          enabled: true,
          title: 'ObjectStack API',
          description: 'Complete API for ObjectStack platform',
          version: '1.0.0',
          termsOfService: 'https://example.com/terms',
          contact: {
            name: 'API Support',
            url: 'https://example.com/support',
            email: 'api@example.com',
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
          },
        },
      });

      expect(config.documentation?.title).toBe('ObjectStack API');
      expect(config.documentation?.contact?.email).toBe('api@example.com');
      expect(config.documentation?.license?.name).toBe('MIT');
    });
  });

  describe('Response Format Configuration', () => {
    it('should accept response format config', () => {
      const config = RestApiConfigSchema.parse({
        responseFormat: {
          envelope: true,
          includeMetadata: true,
          includePagination: true,
        },
      });

      expect(config.responseFormat?.envelope).toBe(true);
      expect(config.responseFormat?.includeMetadata).toBe(true);
      expect(config.responseFormat?.includePagination).toBe(true);
    });

    it('should accept minimal response format', () => {
      const config = RestApiConfigSchema.parse({
        responseFormat: {
          envelope: false,
          includeMetadata: false,
          includePagination: false,
        },
      });

      expect(config.responseFormat?.envelope).toBe(false);
    });
  });
});

describe('CrudOperation', () => {
  it('should accept all CRUD operations', () => {
    const operations = ['create', 'read', 'update', 'delete', 'list'];
    
    operations.forEach(op => {
      expect(() => CrudOperation.parse(op)).not.toThrow();
    });
  });

  it('should reject invalid operation', () => {
    expect(() => CrudOperation.parse('invalid')).toThrow();
  });
});

describe('CrudEndpointPatternSchema', () => {
  it('should accept basic pattern', () => {
    const pattern = CrudEndpointPatternSchema.parse({
      method: 'GET',
      path: '/data/{object}',
    });

    expect(pattern.method).toBe('GET');
    expect(pattern.path).toBe('/data/{object}');
  });

  it('should accept pattern with documentation', () => {
    const pattern = CrudEndpointPatternSchema.parse({
      method: 'POST',
      path: '/data/{object}',
      summary: 'Create record',
      description: 'Creates a new record in the specified object',
    });

    expect(pattern.summary).toBe('Create record');
    expect(pattern.description).toBeDefined();
  });
});

describe('CrudEndpointsConfigSchema', () => {
  it('should accept default config', () => {
    const config = CrudEndpointsConfigSchema.parse({});

    expect(config.dataPrefix).toBe('/data');
    expect(config.objectParamStyle).toBe('path');
  });

  it('should accept custom operations config', () => {
    const config = CrudEndpointsConfigSchema.parse({
      operations: {
        create: true,
        read: true,
        update: true,
        delete: false,
        list: true,
      },
    });

    expect(config.operations?.delete).toBe(false);
  });

  it('should accept custom patterns', () => {
    const config = CrudEndpointsConfigSchema.parse({
      patterns: {
        create: { method: 'POST', path: '/objects/{object}' },
        read: { method: 'GET', path: '/objects/{object}/:id' },
      },
    });

    expect(config.patterns?.create.path).toBe('/objects/{object}');
  });

  it('should accept custom data prefix', () => {
    const config = CrudEndpointsConfigSchema.parse({
      dataPrefix: '/objects',
    });

    expect(config.dataPrefix).toBe('/objects');
  });

  it('should accept query param style', () => {
    const config = CrudEndpointsConfigSchema.parse({
      objectParamStyle: 'query',
    });

    expect(config.objectParamStyle).toBe('query');
  });
});

describe('MetadataEndpointsConfigSchema', () => {
  it('should accept default config', () => {
    const config = MetadataEndpointsConfigSchema.parse({});

    expect(config.prefix).toBe('/meta');
    expect(config.enableCache).toBe(true);
    expect(config.cacheTtl).toBe(3600);
  });

  it('should accept custom prefix', () => {
    const config = MetadataEndpointsConfigSchema.parse({
      prefix: '/metadata',
    });

    expect(config.prefix).toBe('/metadata');
  });

  it('should accept cache config', () => {
    const config = MetadataEndpointsConfigSchema.parse({
      enableCache: false,
      cacheTtl: 7200,
    });

    expect(config.enableCache).toBe(false);
    expect(config.cacheTtl).toBe(7200);
  });

  it('should accept endpoints config', () => {
    const config = MetadataEndpointsConfigSchema.parse({
      endpoints: {
        types: true,
        items: true,
        item: true,
        schema: false,
      },
    });

    expect(config.endpoints?.schema).toBe(false);
  });
});

describe('BatchEndpointsConfigSchema', () => {
  it('should accept default config', () => {
    const config = BatchEndpointsConfigSchema.parse({});

    expect(config.maxBatchSize).toBe(200);
    expect(config.enableBatchEndpoint).toBe(true);
    expect(config.defaultAtomic).toBe(true);
  });

  it('should accept custom max batch size', () => {
    const config = BatchEndpointsConfigSchema.parse({
      maxBatchSize: 500,
    });

    expect(config.maxBatchSize).toBe(500);
  });

  it('should reject invalid batch size', () => {
    expect(() => BatchEndpointsConfigSchema.parse({
      maxBatchSize: 0,
    })).toThrow();

    expect(() => BatchEndpointsConfigSchema.parse({
      maxBatchSize: 2000,
    })).toThrow();
  });

  it('should accept operations config', () => {
    const config = BatchEndpointsConfigSchema.parse({
      operations: {
        createMany: true,
        updateMany: true,
        deleteMany: false,
        upsertMany: true,
      },
    });

    expect(config.operations?.deleteMany).toBe(false);
  });

  it('should accept non-atomic mode', () => {
    const config = BatchEndpointsConfigSchema.parse({
      defaultAtomic: false,
    });

    expect(config.defaultAtomic).toBe(false);
  });
});

describe('RouteGenerationConfigSchema', () => {
  it('should accept minimal config', () => {
    const config = RouteGenerationConfigSchema.parse({});

    expect(config.nameTransform).toBe('none');
  });

  it('should accept include objects', () => {
    const config = RouteGenerationConfigSchema.parse({
      includeObjects: ['account', 'contact', 'opportunity'],
    });

    expect(config.includeObjects).toHaveLength(3);
  });

  it('should accept exclude objects', () => {
    const config = RouteGenerationConfigSchema.parse({
      excludeObjects: ['system_log', 'audit_trail'],
    });

    expect(config.excludeObjects).toHaveLength(2);
  });

  it('should accept name transform', () => {
    const transforms = ['none', 'plural', 'kebab-case', 'camelCase'] as const;
    
    transforms.forEach(transform => {
      const config = RouteGenerationConfigSchema.parse({
        nameTransform: transform,
      });
      expect(config.nameTransform).toBe(transform);
    });
  });

  it('should accept overrides', () => {
    const config = RouteGenerationConfigSchema.parse({
      overrides: {
        account: {
          enabled: true,
          basePath: '/accounts',
        },
        contact: {
          enabled: false,
        },
        task: {
          operations: {
            create: true,
            read: true,
            update: true,
            delete: false,
            list: true,
          },
        },
      },
    });

    expect(config.overrides?.account?.basePath).toBe('/accounts');
    expect(config.overrides?.contact?.enabled).toBe(false);
    expect(config.overrides?.task?.operations?.delete).toBe(false);
  });
});

describe('RestServerConfigSchema', () => {
  it('should accept minimal config', () => {
    const config = RestServerConfigSchema.parse({});

    expect(config).toBeDefined();
  });

  it('should accept complete config', () => {
    const config = RestServerConfigSchema.parse({
      api: {
        version: 'v1',
        basePath: '/api',
        enableCrud: true,
        enableMetadata: true,
        enableBatch: true,
      },
      crud: {
        dataPrefix: '/data',
        operations: {
          create: true,
          read: true,
          update: true,
          delete: true,
          list: true,
        },
      },
      metadata: {
        prefix: '/meta',
        enableCache: true,
      },
      batch: {
        maxBatchSize: 200,
      },
      routes: {
        excludeObjects: ['system_log'],
      },
    });

    expect(config.api?.version).toBe('v1');
    expect(config.crud?.dataPrefix).toBe('/data');
    expect(config.metadata?.prefix).toBe('/meta');
    expect(config.batch?.maxBatchSize).toBe(200);
    expect(config.routes?.excludeObjects).toContain('system_log');
  });
});

describe('GeneratedEndpointSchema', () => {
  it('should accept basic endpoint', () => {
    const endpoint = GeneratedEndpointSchema.parse({
      id: 'list_accounts',
      method: 'GET',
      path: '/api/v1/data/account',
      object: 'account',
      operation: 'list',
      handler: 'list_handler',
    });

    expect(endpoint.id).toBe('list_accounts');
    expect(endpoint.method).toBe('GET');
    expect(endpoint.operation).toBe('list');
  });

  it('should accept endpoint with metadata', () => {
    const endpoint = GeneratedEndpointSchema.parse({
      id: 'create_account',
      method: 'POST',
      path: '/api/v1/data/account',
      object: 'account',
      operation: 'create',
      handler: 'create_handler',
      metadata: {
        summary: 'Create Account',
        description: 'Creates a new account record',
        tags: ['account', 'crm'],
        deprecated: false,
      },
    });

    expect(endpoint.metadata?.summary).toBe('Create Account');
    expect(endpoint.metadata?.tags).toContain('crm');
  });
});

describe('EndpointRegistrySchema', () => {
  it('should accept basic registry', () => {
    const registry = EndpointRegistrySchema.parse({
      endpoints: [
        {
          id: 'list_accounts',
          method: 'GET',
          path: '/api/v1/data/account',
          object: 'account',
          operation: 'list',
          handler: 'list_handler',
        },
      ],
      total: 1,
    });

    expect(registry.endpoints).toHaveLength(1);
    expect(registry.total).toBe(1);
  });

  it('should accept registry with groupings', () => {
    const registry = EndpointRegistrySchema.parse({
      endpoints: [
        {
          id: 'list_accounts',
          method: 'GET',
          path: '/api/data/account',
          object: 'account',
          operation: 'list',
          handler: 'list_handler',
        },
        {
          id: 'create_account',
          method: 'POST',
          path: '/api/data/account',
          object: 'account',
          operation: 'create',
          handler: 'create_handler',
        },
      ],
      total: 2,
      byObject: {
        account: [
          {
            id: 'list_accounts',
            method: 'GET',
            path: '/api/data/account',
            object: 'account',
            operation: 'list',
            handler: 'list_handler',
          },
          {
            id: 'create_account',
            method: 'POST',
            path: '/api/data/account',
            object: 'account',
            operation: 'create',
            handler: 'create_handler',
          },
        ],
      },
      byOperation: {
        list: [
          {
            id: 'list_accounts',
            method: 'GET',
            path: '/api/data/account',
            object: 'account',
            operation: 'list',
            handler: 'list_handler',
          },
        ],
        create: [
          {
            id: 'create_account',
            method: 'POST',
            path: '/api/data/account',
            object: 'account',
            operation: 'create',
            handler: 'create_handler',
          },
        ],
      },
    });

    expect(registry.byObject?.account).toHaveLength(2);
    expect(registry.byOperation?.list).toHaveLength(1);
  });
});

describe('Helper Functions', () => {
  it('should create config with RestApiConfig.create', () => {
    const config = RestApiConfig.create({
      version: 'v2',
      basePath: '/api',
    });

    expect(config.version).toBe('v2');
  });

  it('should create server config with RestServerConfig.create', () => {
    const config = RestServerConfig.create({
      api: {
        version: 'v1',
      },
      crud: {
        dataPrefix: '/data',
      },
    });

    expect(config.api?.version).toBe('v1');
  });
});

describe('Integration Tests', () => {
  it('should support complete REST server configuration', () => {
    const serverConfig: RestServerConfigType = {
      api: {
        version: 'v1',
        basePath: '/api',
        enableCrud: true,
        enableMetadata: true,
        enableBatch: true,
        enableDiscovery: true,
        documentation: {
          enabled: true,
          title: 'ObjectStack API',
          description: 'REST API for ObjectStack platform',
          version: '1.0.0',
        },
        responseFormat: {
          envelope: true,
          includeMetadata: true,
          includePagination: true,
        },
      },
      crud: {
        dataPrefix: '/data',
        operations: {
          create: true,
          read: true,
          update: true,
          delete: true,
          list: true,
        },
        objectParamStyle: 'path',
      },
      metadata: {
        prefix: '/meta',
        enableCache: true,
        cacheTtl: 3600,
        endpoints: {
          types: true,
          items: true,
          item: true,
          schema: true,
        },
      },
      batch: {
        maxBatchSize: 200,
        enableBatchEndpoint: true,
        operations: {
          createMany: true,
          updateMany: true,
          deleteMany: true,
          upsertMany: true,
        },
        defaultAtomic: true,
      },
      routes: {
        excludeObjects: ['system_log'],
        nameTransform: 'none',
      },
    };

    const result = RestServerConfigSchema.parse(serverConfig);
    expect(result.api?.version).toBe('v1');
    expect(result.crud?.dataPrefix).toBe('/data');
    expect(result.metadata?.cacheTtl).toBe(3600);
    expect(result.batch?.maxBatchSize).toBe(200);
  });
});
