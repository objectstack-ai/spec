import { describe, it, expect } from 'vitest';
import {
  GraphQLScalarType,
  GraphQLTypeConfigSchema,
  GraphQLQueryConfigSchema,
  GraphQLMutationConfigSchema,
  GraphQLSubscriptionConfigSchema,
  GraphQLResolverConfigSchema,
  GraphQLDataLoaderConfigSchema,
  GraphQLDirectiveConfigSchema,
  GraphQLDirectiveLocation,
  GraphQLQueryDepthLimitSchema,
  GraphQLQueryComplexitySchema,
  GraphQLRateLimitSchema,
  GraphQLPersistedQuerySchema,
  GraphQLConfigSchema,
  GraphQLConfig,
  mapFieldTypeToGraphQL,
  FederationEntityKeySchema,
  FederationEntitySchema,
  SubgraphConfigSchema,
  FederationGatewaySchema,
  FederationExternalFieldSchema,
  FederationRequiresSchema,
  FederationProvidesSchema,
} from './graphql.zod';

describe('GraphQLScalarType', () => {
  it('should accept built-in GraphQL scalar types', () => {
    const builtInTypes = ['ID', 'String', 'Int', 'Float', 'Boolean'];
    
    builtInTypes.forEach(type => {
      expect(() => GraphQLScalarType.parse(type)).not.toThrow();
    });
  });

  it('should accept extended scalar types', () => {
    const extendedTypes = ['DateTime', 'Date', 'JSON', 'URL', 'Email', 'UUID'];
    
    extendedTypes.forEach(type => {
      expect(() => GraphQLScalarType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid scalar types', () => {
    expect(() => GraphQLScalarType.parse('CustomType')).toThrow();
    expect(() => GraphQLScalarType.parse('NotAScalar')).toThrow();
  });
});

describe('GraphQLTypeConfigSchema', () => {
  it('should accept minimal type configuration', () => {
    const config = GraphQLTypeConfigSchema.parse({
      name: 'Customer',
      object: 'customer',
    });

    expect(config.name).toBe('Customer');
    expect(config.object).toBe('customer');
  });

  it('should accept type configuration with field mappings', () => {
    const config = GraphQLTypeConfigSchema.parse({
      name: 'Customer',
      object: 'customer',
      description: 'Customer type',
      fields: {
        include: ['id', 'name', 'email'],
        exclude: ['password', 'ssn'],
        mappings: {
          email: {
            graphqlName: 'emailAddress',
            description: 'Customer email',
          },
        },
      },
    });

    expect(config.fields?.include).toContain('email');
    expect(config.fields?.exclude).toContain('password');
    expect(config.fields?.mappings?.email?.graphqlName).toBe('emailAddress');
  });

  it('should accept type with interfaces', () => {
    const config = GraphQLTypeConfigSchema.parse({
      name: 'Customer',
      object: 'customer',
      interfaces: ['Node', 'Timestamped'],
    });

    expect(config.interfaces).toHaveLength(2);
  });

  it('should accept interface definition', () => {
    const config = GraphQLTypeConfigSchema.parse({
      name: 'Node',
      object: 'base_entity',
      isInterface: true,
    });

    expect(config.isInterface).toBe(true);
  });

  it('should accept type with directives', () => {
    const config = GraphQLTypeConfigSchema.parse({
      name: 'Customer',
      object: 'customer',
      directives: [
        { name: 'auth', args: { requires: 'ADMIN' } },
        { name: 'cache', args: { maxAge: 60 } },
      ],
    });

    expect(config.directives).toHaveLength(2);
  });
});

describe('GraphQLQueryConfigSchema', () => {
  it('should accept minimal query configuration', () => {
    const config = GraphQLQueryConfigSchema.parse({
      name: 'customer',
      object: 'customer',
      type: 'get',
    });

    expect(config.name).toBe('customer');
    expect(config.type).toBe('get');
  });

  it('should accept list query with filtering', () => {
    const config = GraphQLQueryConfigSchema.parse({
      name: 'customers',
      object: 'customer',
      type: 'list',
      filtering: {
        enabled: true,
        fields: ['name', 'email', 'status'],
        operators: ['eq', 'ne', 'contains', 'in'],
      },
    });

    expect(config.filtering?.enabled).toBe(true);
    expect(config.filtering?.fields).toContain('name');
  });

  it('should accept query with sorting', () => {
    const config = GraphQLQueryConfigSchema.parse({
      name: 'customers',
      object: 'customer',
      type: 'list',
      sorting: {
        enabled: true,
        fields: ['name', 'createdAt'],
        defaultSort: {
          field: 'createdAt',
          direction: 'DESC',
        },
      },
    });

    expect(config.sorting?.defaultSort?.direction).toBe('DESC');
  });

  it('should accept query with pagination', () => {
    const config = GraphQLQueryConfigSchema.parse({
      name: 'customers',
      object: 'customer',
      type: 'list',
      pagination: {
        enabled: true,
        type: 'cursor',
        defaultLimit: 50,
        maxLimit: 200,
      },
    });

    expect(config.pagination?.type).toBe('cursor');
    expect(config.pagination?.maxLimit).toBe(200);
  });

  it('should accept different pagination types', () => {
    const types: Array<'offset' | 'cursor' | 'relay'> = ['offset', 'cursor', 'relay'];

    types.forEach(type => {
      const config = GraphQLQueryConfigSchema.parse({
        name: 'test',
        object: 'test',
        type: 'list',
        pagination: { enabled: true, type },
      });
      expect(config.pagination?.type).toBe(type);
    });
  });

  it('should accept query with arguments', () => {
    const config = GraphQLQueryConfigSchema.parse({
      name: 'customer',
      object: 'customer',
      type: 'get',
      args: {
        id: {
          type: 'ID!',
          description: 'Customer ID',
        },
      },
    });

    expect(config.args?.id?.type).toBe('ID!');
  });

  it('should accept query with caching', () => {
    const config = GraphQLQueryConfigSchema.parse({
      name: 'customer',
      object: 'customer',
      type: 'get',
      cache: {
        enabled: true,
        ttl: 300,
        key: 'customer:{id}',
      },
    });

    expect(config.cache?.enabled).toBe(true);
    expect(config.cache?.ttl).toBe(300);
  });

  it('should apply default authRequired', () => {
    const config = GraphQLQueryConfigSchema.parse({
      name: 'test',
      object: 'test',
      type: 'get',
    });

    expect(config.authRequired).toBe(true);
  });
});

describe('GraphQLMutationConfigSchema', () => {
  it('should accept minimal mutation configuration', () => {
    const config = GraphQLMutationConfigSchema.parse({
      name: 'createCustomer',
      object: 'customer',
      type: 'create',
    });

    expect(config.name).toBe('createCustomer');
    expect(config.type).toBe('create');
  });

  it('should accept different mutation types', () => {
    const types: Array<'create' | 'update' | 'delete' | 'upsert' | 'custom'> = 
      ['create', 'update', 'delete', 'upsert', 'custom'];

    types.forEach(type => {
      const config = GraphQLMutationConfigSchema.parse({
        name: 'testMutation',
        object: 'test',
        type,
      });
      expect(config.type).toBe(type);
    });
  });

  it('should accept mutation with input configuration', () => {
    const config = GraphQLMutationConfigSchema.parse({
      name: 'createCustomer',
      object: 'customer',
      type: 'create',
      input: {
        typeName: 'CreateCustomerInput',
        fields: {
          include: ['name', 'email', 'phone'],
          exclude: ['id', 'createdAt'],
          required: ['name', 'email'],
        },
        validation: {
          enabled: true,
          rules: ['email_format', 'phone_format'],
        },
      },
    });

    expect(config.input?.typeName).toBe('CreateCustomerInput');
    expect(config.input?.fields?.required).toContain('email');
  });

  it('should accept mutation with output configuration', () => {
    const config = GraphQLMutationConfigSchema.parse({
      name: 'createCustomer',
      object: 'customer',
      type: 'create',
      output: {
        type: 'payload',
        includeEnvelope: true,
      },
    });

    expect(config.output?.type).toBe('payload');
    expect(config.output?.includeEnvelope).toBe(true);
  });

  it('should accept mutation with transaction configuration', () => {
    const config = GraphQLMutationConfigSchema.parse({
      name: 'createOrder',
      object: 'order',
      type: 'create',
      transaction: {
        enabled: true,
        isolationLevel: 'serializable',
      },
    });

    expect(config.transaction?.enabled).toBe(true);
    expect(config.transaction?.isolationLevel).toBe('serializable');
  });

  it('should accept mutation with hooks', () => {
    const config = GraphQLMutationConfigSchema.parse({
      name: 'createCustomer',
      object: 'customer',
      type: 'create',
      hooks: {
        before: ['validate_email', 'check_duplicates'],
        after: ['send_welcome_email', 'create_audit_log'],
      },
    });

    expect(config.hooks?.before).toHaveLength(2);
    expect(config.hooks?.after).toContain('send_welcome_email');
  });
});

describe('GraphQLSubscriptionConfigSchema', () => {
  it('should accept minimal subscription configuration', () => {
    const config = GraphQLSubscriptionConfigSchema.parse({
      name: 'customerCreated',
      object: 'customer',
      events: ['created'],
    });

    expect(config.name).toBe('customerCreated');
    expect(config.events).toContain('created');
  });

  it('should accept subscription with multiple events', () => {
    const config = GraphQLSubscriptionConfigSchema.parse({
      name: 'customerChanged',
      object: 'customer',
      events: ['created', 'updated', 'deleted'],
    });

    expect(config.events).toHaveLength(3);
  });

  it('should accept subscription with filtering', () => {
    const config = GraphQLSubscriptionConfigSchema.parse({
      name: 'customerUpdated',
      object: 'customer',
      events: ['updated'],
      filter: {
        enabled: true,
        fields: ['status', 'priority'],
      },
    });

    expect(config.filter?.enabled).toBe(true);
  });

  it('should accept subscription with payload configuration', () => {
    const config = GraphQLSubscriptionConfigSchema.parse({
      name: 'customerUpdated',
      object: 'customer',
      events: ['updated'],
      payload: {
        includeEntity: true,
        includePreviousValues: true,
        includeMeta: true,
      },
    });

    expect(config.payload?.includePreviousValues).toBe(true);
  });

  it('should accept subscription with rate limiting', () => {
    const config = GraphQLSubscriptionConfigSchema.parse({
      name: 'customerUpdated',
      object: 'customer',
      events: ['updated'],
      rateLimit: {
        enabled: true,
        maxSubscriptionsPerUser: 5,
        throttleMs: 1000,
      },
    });

    expect(config.rateLimit?.maxSubscriptionsPerUser).toBe(5);
  });
});

describe('GraphQLResolverConfigSchema', () => {
  it('should accept minimal resolver configuration', () => {
    const config = GraphQLResolverConfigSchema.parse({
      path: 'Query.customers',
      type: 'datasource',
    });

    expect(config.path).toBe('Query.customers');
    expect(config.type).toBe('datasource');
  });

  it('should accept different resolver types', () => {
    const types: Array<'datasource' | 'computed' | 'script' | 'proxy'> = 
      ['datasource', 'computed', 'script', 'proxy'];

    types.forEach(type => {
      const config = GraphQLResolverConfigSchema.parse({
        path: 'Query.test',
        type,
      });
      expect(config.type).toBe(type);
    });
  });

  it('should accept datasource resolver', () => {
    const config = GraphQLResolverConfigSchema.parse({
      path: 'Query.customers',
      type: 'datasource',
      implementation: {
        datasource: 'external_db',
        query: 'SELECT * FROM customers WHERE id = $1',
      },
    });

    expect(config.implementation?.datasource).toBe('external_db');
  });

  it('should accept computed resolver', () => {
    const config = GraphQLResolverConfigSchema.parse({
      path: 'Customer.fullName',
      type: 'computed',
      implementation: {
        expression: 'concat(firstName, " ", lastName)',
        dependencies: ['firstName', 'lastName'],
      },
    });

    expect(config.implementation?.dependencies).toContain('firstName');
  });

  it('should accept resolver with caching', () => {
    const config = GraphQLResolverConfigSchema.parse({
      path: 'Query.customer',
      type: 'datasource',
      cache: {
        enabled: true,
        ttl: 600,
        keyArgs: ['id'],
      },
    });

    expect(config.cache?.enabled).toBe(true);
    expect(config.cache?.keyArgs).toContain('id');
  });
});

describe('GraphQLDataLoaderConfigSchema', () => {
  it('should accept minimal DataLoader configuration', () => {
    const config = GraphQLDataLoaderConfigSchema.parse({
      name: 'customerLoader',
      source: 'customer',
      batchFunction: {
        type: 'findByIds',
        keyField: 'id',
      },
    });

    expect(config.name).toBe('customerLoader');
    expect(config.batchFunction.type).toBe('findByIds');
  });

  it('should accept different batch function types', () => {
    const types: Array<'findByIds' | 'query' | 'script' | 'custom'> = 
      ['findByIds', 'query', 'script', 'custom'];

    types.forEach(type => {
      const config = GraphQLDataLoaderConfigSchema.parse({
        name: 'testLoader',
        source: 'test',
        batchFunction: { type },
      });
      expect(config.batchFunction.type).toBe(type);
    });
  });

  it('should apply default maxBatchSize', () => {
    const config = GraphQLDataLoaderConfigSchema.parse({
      name: 'testLoader',
      source: 'test',
      batchFunction: {
        type: 'findByIds',
      },
    });

    expect(config.batchFunction.maxBatchSize).toBe(100);
  });

  it('should accept DataLoader with caching options', () => {
    const config = GraphQLDataLoaderConfigSchema.parse({
      name: 'customerLoader',
      source: 'customer',
      batchFunction: {
        type: 'findByIds',
      },
      cache: {
        enabled: true,
        keyFn: 'customKeyFunction',
      },
      options: {
        batch: true,
        cache: true,
        maxCacheSize: 1000,
      },
    });

    expect(config.cache?.enabled).toBe(true);
    expect(config.options?.maxCacheSize).toBe(1000);
  });
});

describe('GraphQLDirectiveConfigSchema', () => {
  it('should accept minimal directive configuration', () => {
    const config = GraphQLDirectiveConfigSchema.parse({
      name: 'auth',
      locations: ['FIELD_DEFINITION'],
    });

    expect(config.name).toBe('auth');
    expect(config.locations).toContain('FIELD_DEFINITION');
  });

  it('should accept directive with arguments', () => {
    const config = GraphQLDirectiveConfigSchema.parse({
      name: 'auth',
      locations: ['FIELD_DEFINITION', 'OBJECT'],
      args: {
        requires: {
          type: 'String!',
          description: 'Required permission',
        },
      },
    });

    expect(config.args?.requires?.type).toBe('String!');
  });

  it('should accept repeatable directive', () => {
    const config = GraphQLDirectiveConfigSchema.parse({
      name: 'validate',
      locations: ['FIELD_DEFINITION'],
      repeatable: true,
    });

    expect(config.repeatable).toBe(true);
  });

  it('should validate directive name format', () => {
    expect(() => GraphQLDirectiveConfigSchema.parse({
      name: 'myDirective',
      locations: ['FIELD'],
    })).not.toThrow();

    expect(() => GraphQLDirectiveConfigSchema.parse({
      name: 'MyDirective',
      locations: ['FIELD'],
    })).toThrow();

    expect(() => GraphQLDirectiveConfigSchema.parse({
      name: 'my-directive',
      locations: ['FIELD'],
    })).toThrow();
  });

  it('should accept directive with implementation', () => {
    const config = GraphQLDirectiveConfigSchema.parse({
      name: 'cache',
      locations: ['FIELD_DEFINITION'],
      implementation: {
        type: 'cache',
        handler: 'cacheHandler',
      },
    });

    expect(config.implementation?.type).toBe('cache');
  });
});

describe('GraphQLQueryDepthLimitSchema', () => {
  it('should apply default values', () => {
    const config = GraphQLQueryDepthLimitSchema.parse({});

    expect(config.enabled).toBe(true);
    expect(config.maxDepth).toBe(10);
    expect(config.onDepthExceeded).toBe('reject');
  });

  it('should accept custom depth limit', () => {
    const config = GraphQLQueryDepthLimitSchema.parse({
      enabled: true,
      maxDepth: 5,
      ignoreFields: ['__typename', 'id'],
      onDepthExceeded: 'log',
      errorMessage: 'Query too deep',
    });

    expect(config.maxDepth).toBe(5);
    expect(config.ignoreFields).toContain('__typename');
    expect(config.onDepthExceeded).toBe('log');
  });
});

describe('GraphQLQueryComplexitySchema', () => {
  it('should apply default values', () => {
    const config = GraphQLQueryComplexitySchema.parse({});

    expect(config.enabled).toBe(true);
    expect(config.maxComplexity).toBe(1000);
    expect(config.defaultFieldComplexity).toBe(1);
    expect(config.listMultiplier).toBe(10);
  });

  it('should accept custom complexity configuration', () => {
    const config = GraphQLQueryComplexitySchema.parse({
      enabled: true,
      maxComplexity: 5000,
      defaultFieldComplexity: 2,
      listMultiplier: 20,
    });

    expect(config.maxComplexity).toBe(5000);
    expect(config.listMultiplier).toBe(20);
  });

  it('should accept field-specific complexity as number', () => {
    const config = GraphQLQueryComplexitySchema.parse({
      fieldComplexity: {
        'Query.customers': 10,
        'Customer.orders': 5,
      },
    });

    expect(config.fieldComplexity?.['Query.customers']).toBe(10);
  });

  it('should accept field-specific complexity as object', () => {
    const config = GraphQLQueryComplexitySchema.parse({
      fieldComplexity: {
        'Query.customers': {
          base: 10,
          multiplier: 'limit',
          calculator: 'customCalculator',
        },
      },
    });

    const complexityConfig = config.fieldComplexity?.['Query.customers'];
    if (typeof complexityConfig === 'object' && 'base' in complexityConfig) {
      expect(complexityConfig.base).toBe(10);
      expect(complexityConfig.multiplier).toBe('limit');
    }
  });
});

describe('GraphQLRateLimitSchema', () => {
  it('should apply default values', () => {
    const config = GraphQLRateLimitSchema.parse({});

    expect(config.enabled).toBe(true);
    expect(config.strategy).toBe('token_bucket');
    expect(config.onLimitExceeded).toBe('reject');
    expect(config.includeHeaders).toBe(true);
  });

  it('should accept different strategies', () => {
    const strategies: Array<'token_bucket' | 'fixed_window' | 'sliding_window' | 'cost_based'> = 
      ['token_bucket', 'fixed_window', 'sliding_window', 'cost_based'];

    strategies.forEach(strategy => {
      const config = GraphQLRateLimitSchema.parse({ strategy });
      expect(config.strategy).toBe(strategy);
    });
  });

  it('should accept global rate limits', () => {
    const config = GraphQLRateLimitSchema.parse({
      global: {
        maxRequests: 5000,
        windowMs: 3600000,
      },
    });

    expect(config.global?.maxRequests).toBe(5000);
  });

  it('should accept per-user rate limits', () => {
    const config = GraphQLRateLimitSchema.parse({
      perUser: {
        maxRequests: 100,
        windowMs: 60000,
      },
    });

    expect(config.perUser?.maxRequests).toBe(100);
  });

  it('should accept cost-based rate limiting', () => {
    const config = GraphQLRateLimitSchema.parse({
      costBased: {
        enabled: true,
        maxCost: 10000,
        windowMs: 60000,
        useComplexityAsCost: true,
      },
    });

    expect(config.costBased?.enabled).toBe(true);
    expect(config.costBased?.useComplexityAsCost).toBe(true);
  });

  it('should accept operation-specific limits', () => {
    const config = GraphQLRateLimitSchema.parse({
      operations: {
        'createOrder': {
          maxRequests: 10,
          windowMs: 60000,
        },
        'deleteCustomer': {
          maxRequests: 5,
          windowMs: 60000,
        },
      },
    });

    expect(config.operations?.createOrder?.maxRequests).toBe(10);
  });
});

describe('GraphQLPersistedQuerySchema', () => {
  it('should apply default values', () => {
    const config = GraphQLPersistedQuerySchema.parse({});

    expect(config.enabled).toBe(false);
    expect(config.mode).toBe('optional');
  });

  it('should accept different modes', () => {
    const modes: Array<'optional' | 'required'> = ['optional', 'required'];

    modes.forEach(mode => {
      const config = GraphQLPersistedQuerySchema.parse({ mode });
      expect(config.mode).toBe(mode);
    });
  });

  it('should accept store configuration', () => {
    const config = GraphQLPersistedQuerySchema.parse({
      store: {
        type: 'redis',
        connection: 'redis://localhost:6379',
        ttl: 86400,
      },
    });

    expect(config.store.type).toBe('redis');
    expect(config.store.ttl).toBe(86400);
  });

  it('should accept APQ configuration', () => {
    const config = GraphQLPersistedQuerySchema.parse({
      apq: {
        enabled: true,
        hashAlgorithm: 'sha256',
        cache: {
          ttl: 3600,
          maxSize: 1000,
        },
      },
    });

    expect(config.apq?.enabled).toBe(true);
    expect(config.apq?.hashAlgorithm).toBe('sha256');
  });

  it('should accept allowlist configuration', () => {
    const config = GraphQLPersistedQuerySchema.parse({
      allowlist: {
        enabled: true,
        queries: [
          { id: 'query1', operation: 'GetCustomer' },
          { id: 'query2', operation: 'ListOrders' },
        ],
        source: '/path/to/allowlist.json',
      },
    });

    expect(config.allowlist?.enabled).toBe(true);
    expect(config.allowlist?.queries).toHaveLength(2);
  });

  it('should accept security configuration', () => {
    const config = GraphQLPersistedQuerySchema.parse({
      security: {
        maxQuerySize: 10000,
        rejectIntrospection: true,
      },
    });

    expect(config.security?.rejectIntrospection).toBe(true);
  });
});

describe('GraphQLConfigSchema', () => {
  it('should apply default values', () => {
    const config = GraphQLConfigSchema.parse({});

    expect(config.enabled).toBe(true);
    expect(config.path).toBe('/graphql');
  });

  it('should accept complete GraphQL configuration', () => {
    const config = GraphQLConfigSchema.parse({
      enabled: true,
      path: '/api/graphql',
      playground: {
        enabled: true,
        path: '/graphql-playground',
      },
      schema: {
        autoGenerateTypes: true,
        types: [
          {
            name: 'Customer',
            object: 'customer',
          },
        ],
        queries: [
          {
            name: 'customers',
            object: 'customer',
            type: 'list',
          },
        ],
        mutations: [
          {
            name: 'createCustomer',
            object: 'customer',
            type: 'create',
          },
        ],
      },
      security: {
        depthLimit: {
          enabled: true,
          maxDepth: 10,
        },
        complexity: {
          enabled: true,
          maxComplexity: 1000,
        },
        rateLimit: {
          enabled: true,
          strategy: 'token_bucket',
        },
        persistedQueries: {
          enabled: true,
          mode: 'optional',
          store: {
            type: 'memory',
          },
        },
      },
    });

    expect(config.path).toBe('/api/graphql');
    expect(config.schema?.types).toHaveLength(1);
    expect(config.security?.depthLimit?.enabled).toBe(true);
  });

  it('should use GraphQLConfig factory', () => {
    const config = GraphQLConfig.create({
      enabled: true,
      path: '/graphql',
    });

    expect(config.enabled).toBe(true);
  });
});

describe('mapFieldTypeToGraphQL', () => {
  it('should map text types to String', () => {
    expect(mapFieldTypeToGraphQL('text')).toBe('String');
    expect(mapFieldTypeToGraphQL('textarea')).toBe('String');
    expect(mapFieldTypeToGraphQL('markdown')).toBe('String');
  });

  it('should map email to Email scalar', () => {
    expect(mapFieldTypeToGraphQL('email')).toBe('Email');
  });

  it('should map url to URL scalar', () => {
    expect(mapFieldTypeToGraphQL('url')).toBe('URL');
  });

  it('should map number types to Float', () => {
    expect(mapFieldTypeToGraphQL('number')).toBe('Float');
    expect(mapFieldTypeToGraphQL('percent')).toBe('Float');
  });

  it('should map currency to Currency scalar', () => {
    expect(mapFieldTypeToGraphQL('currency')).toBe('Currency');
  });

  it('should map date types correctly', () => {
    expect(mapFieldTypeToGraphQL('date')).toBe('Date');
    expect(mapFieldTypeToGraphQL('datetime')).toBe('DateTime');
    expect(mapFieldTypeToGraphQL('time')).toBe('Time');
  });

  it('should map boolean types to Boolean', () => {
    expect(mapFieldTypeToGraphQL('boolean')).toBe('Boolean');
    expect(mapFieldTypeToGraphQL('toggle')).toBe('Boolean');
  });

  it('should map select to String', () => {
    expect(mapFieldTypeToGraphQL('select')).toBe('String');
  });

  it('should map multiselect to [String]', () => {
    expect(mapFieldTypeToGraphQL('multiselect')).toBe('[String]');
  });

  it('should map lookup types to ID', () => {
    expect(mapFieldTypeToGraphQL('lookup')).toBe('ID');
    expect(mapFieldTypeToGraphQL('master_detail')).toBe('ID');
  });

  it('should map media types to URL', () => {
    expect(mapFieldTypeToGraphQL('image')).toBe('URL');
    expect(mapFieldTypeToGraphQL('file')).toBe('URL');
    expect(mapFieldTypeToGraphQL('avatar')).toBe('URL');
  });

  it('should map location and address to JSONObject', () => {
    expect(mapFieldTypeToGraphQL('location')).toBe('JSONObject');
    expect(mapFieldTypeToGraphQL('address')).toBe('JSONObject');
  });

  it('should map json to JSON scalar', () => {
    expect(mapFieldTypeToGraphQL('json')).toBe('JSON');
  });

  it('should map vector to [Float]', () => {
    expect(mapFieldTypeToGraphQL('vector')).toBe('[Float]');
  });

  it('should default to String for unknown types', () => {
    // @ts-expect-error Testing unknown type
    expect(mapFieldTypeToGraphQL('unknown_type')).toBe('String');
  });
});

// ==========================================
// Federation Schema Tests
// ==========================================

describe('FederationEntityKeySchema', () => {
  it('should accept minimal entity key', () => {
    const key = FederationEntityKeySchema.parse({
      fields: 'id',
    });

    expect(key.fields).toBe('id');
    expect(key.resolvable).toBe(true);
  });

  it('should accept composite key', () => {
    const key = FederationEntityKeySchema.parse({
      fields: 'sku packageId',
      resolvable: false,
    });

    expect(key.fields).toBe('sku packageId');
    expect(key.resolvable).toBe(false);
  });
});

describe('FederationExternalFieldSchema', () => {
  it('should accept external field', () => {
    const field = FederationExternalFieldSchema.parse({
      field: 'name',
      ownerSubgraph: 'users',
    });

    expect(field.field).toBe('name');
    expect(field.ownerSubgraph).toBe('users');
  });
});

describe('FederationRequiresSchema', () => {
  it('should accept requires directive', () => {
    const req = FederationRequiresSchema.parse({
      field: 'shippingCost',
      fields: 'price weight',
    });

    expect(req.field).toBe('shippingCost');
    expect(req.fields).toBe('price weight');
  });
});

describe('FederationProvidesSchema', () => {
  it('should accept provides directive', () => {
    const prov = FederationProvidesSchema.parse({
      field: 'reviews',
      fields: 'title body',
    });

    expect(prov.field).toBe('reviews');
    expect(prov.fields).toBe('title body');
  });
});

describe('FederationEntitySchema', () => {
  it('should accept minimal entity', () => {
    const entity = FederationEntitySchema.parse({
      typeName: 'Product',
      keys: [{ fields: 'id' }],
    });

    expect(entity.typeName).toBe('Product');
    expect(entity.keys).toHaveLength(1);
    expect(entity.owner).toBe(false);
  });

  it('should accept entity with all directives', () => {
    const entity = FederationEntitySchema.parse({
      typeName: 'Product',
      keys: [
        { fields: 'id' },
        { fields: 'sku', resolvable: false },
      ],
      externalFields: [
        { field: 'weight', ownerSubgraph: 'inventory' },
      ],
      requires: [
        { field: 'shippingCost', fields: 'price weight' },
      ],
      provides: [
        { field: 'reviews', fields: 'author body' },
      ],
      owner: true,
    });

    expect(entity.keys).toHaveLength(2);
    expect(entity.externalFields).toHaveLength(1);
    expect(entity.requires).toHaveLength(1);
    expect(entity.provides).toHaveLength(1);
    expect(entity.owner).toBe(true);
  });

  it('should require at least one key', () => {
    expect(() => FederationEntitySchema.parse({
      typeName: 'Product',
      keys: [],
    })).toThrow();
  });
});

describe('SubgraphConfigSchema', () => {
  it('should accept minimal subgraph config', () => {
    const subgraph = SubgraphConfigSchema.parse({
      name: 'products',
      url: 'http://localhost:4001/graphql',
    });

    expect(subgraph.name).toBe('products');
    expect(subgraph.schemaSource).toBe('introspection');
  });

  it('should accept subgraph with entities and health check', () => {
    const subgraph = SubgraphConfigSchema.parse({
      name: 'users',
      url: 'http://localhost:4002/graphql',
      schemaSource: 'file',
      schemaPath: './schemas/users.graphql',
      entities: [
        {
          typeName: 'User',
          keys: [{ fields: 'id' }],
          owner: true,
        },
      ],
      healthCheck: {
        enabled: true,
        path: '/.well-known/apollo/server-health',
        intervalMs: 10000,
      },
      forwardHeaders: ['Authorization', 'X-Tenant-ID'],
    });

    expect(subgraph.schemaSource).toBe('file');
    expect(subgraph.entities).toHaveLength(1);
    expect(subgraph.healthCheck?.enabled).toBe(true);
    expect(subgraph.forwardHeaders).toContain('Authorization');
  });

  it('should accept all schema source types', () => {
    const sources = ['introspection', 'file', 'registry'] as const;

    sources.forEach(source => {
      const subgraph = SubgraphConfigSchema.parse({
        name: 'test',
        url: 'http://localhost:4000/graphql',
        schemaSource: source,
      });
      expect(subgraph.schemaSource).toBe(source);
    });
  });
});

describe('FederationGatewaySchema', () => {
  it('should apply default values', () => {
    const gateway = FederationGatewaySchema.parse({
      subgraphs: [
        { name: 'products', url: 'http://localhost:4001/graphql' },
      ],
    });

    expect(gateway.enabled).toBe(false);
    expect(gateway.version).toBe('v2');
  });

  it('should accept complete gateway configuration', () => {
    const gateway = FederationGatewaySchema.parse({
      enabled: true,
      version: 'v2',
      subgraphs: [
        {
          name: 'products',
          url: 'http://products:4001/graphql',
          entities: [
            { typeName: 'Product', keys: [{ fields: 'id' }], owner: true },
          ],
        },
        {
          name: 'reviews',
          url: 'http://reviews:4002/graphql',
          entities: [
            {
              typeName: 'Product',
              keys: [{ fields: 'id' }],
              externalFields: [{ field: 'name' }],
            },
            { typeName: 'Review', keys: [{ fields: 'id' }], owner: true },
          ],
        },
      ],
      serviceDiscovery: {
        type: 'kubernetes',
        pollIntervalMs: 15000,
        namespace: 'production',
      },
      queryPlanning: {
        strategy: 'parallel',
        maxDepth: 8,
        dryRun: false,
      },
      composition: {
        conflictResolution: 'error',
        validate: true,
      },
      errorHandling: {
        includeSubgraphName: true,
        partialErrors: 'propagate',
      },
    });

    expect(gateway.enabled).toBe(true);
    expect(gateway.subgraphs).toHaveLength(2);
    expect(gateway.serviceDiscovery?.type).toBe('kubernetes');
    expect(gateway.queryPlanning?.strategy).toBe('parallel');
    expect(gateway.composition?.conflictResolution).toBe('error');
    expect(gateway.errorHandling?.includeSubgraphName).toBe(true);
  });

  it('should accept all service discovery types', () => {
    const types = ['static', 'dns', 'consul', 'kubernetes'] as const;

    types.forEach(type => {
      const gateway = FederationGatewaySchema.parse({
        subgraphs: [{ name: 'test', url: 'http://localhost:4000/graphql' }],
        serviceDiscovery: { type },
      });
      expect(gateway.serviceDiscovery?.type).toBe(type);
    });
  });

  it('should accept all query planning strategies', () => {
    const strategies = ['parallel', 'sequential', 'adaptive'] as const;

    strategies.forEach(strategy => {
      const gateway = FederationGatewaySchema.parse({
        subgraphs: [{ name: 'test', url: 'http://localhost:4000/graphql' }],
        queryPlanning: { strategy },
      });
      expect(gateway.queryPlanning?.strategy).toBe(strategy);
    });
  });

  it('should accept all conflict resolution strategies', () => {
    const strategies = ['error', 'first_wins', 'last_wins'] as const;

    strategies.forEach(conflictResolution => {
      const gateway = FederationGatewaySchema.parse({
        subgraphs: [{ name: 'test', url: 'http://localhost:4000/graphql' }],
        composition: { conflictResolution },
      });
      expect(gateway.composition?.conflictResolution).toBe(conflictResolution);
    });
  });
});

describe('GraphQLConfigSchema with Federation', () => {
  it('should accept config with federation', () => {
    const config = GraphQLConfigSchema.parse({
      enabled: true,
      path: '/graphql',
      federation: {
        enabled: true,
        version: 'v2',
        subgraphs: [
          {
            name: 'products',
            url: 'http://products:4001/graphql',
            entities: [
              { typeName: 'Product', keys: [{ fields: 'id' }] },
            ],
          },
        ],
      },
    });

    expect(config.federation?.enabled).toBe(true);
    expect(config.federation?.subgraphs).toHaveLength(1);
  });
});
