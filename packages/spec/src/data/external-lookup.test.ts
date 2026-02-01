import { describe, it, expect } from 'vitest';
import {
  ExternalDataSourceSchema,
  ExternalFieldMappingSchema,
  ExternalLookupSchema,
  type ExternalLookup,
  type ExternalDataSource,
  type ExternalFieldMapping,
} from './external-lookup.zod';

describe('ExternalDataSourceSchema', () => {
  it('should validate complete external data source', () => {
    const validSource: ExternalDataSource = {
      id: 'salesforce-accounts',
      name: 'Salesforce Account Data',
      type: 'rest-api',
      endpoint: 'https://api.salesforce.com/services/data/v58.0',
      authentication: {
        type: 'oauth2',
        config: {
          clientId: 'client_123',
          clientSecret: 'secret_456',
          tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
        },
      },
    };

    expect(() => ExternalDataSourceSchema.parse(validSource)).not.toThrow();
  });

  it('should accept all data source types', () => {
    const types = ['odata', 'rest-api', 'graphql', 'custom'] as const;

    types.forEach((type) => {
      const source = {
        id: `source-${type}`,
        name: `${type} Source`,
        type,
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none' as const,
          config: {},
        },
      };

      expect(() => ExternalDataSourceSchema.parse(source)).not.toThrow();
    });
  });

  it('should accept all authentication types', () => {
    const authTypes = ['oauth2', 'api-key', 'basic', 'none'] as const;

    authTypes.forEach((authType) => {
      const source = {
        id: `auth-${authType}`,
        name: 'Test Source',
        type: 'rest-api' as const,
        endpoint: 'https://api.example.com',
        authentication: {
          type: authType,
          config: {},
        },
      };

      expect(() => ExternalDataSourceSchema.parse(source)).not.toThrow();
    });
  });

  it('should validate API key authentication', () => {
    const source = {
      id: 'api-key-source',
      name: 'API Key Source',
      type: 'rest-api',
      endpoint: 'https://api.example.com',
      authentication: {
        type: 'api-key',
        config: {
          apiKey: 'sk-1234567890',
          headerName: 'X-API-Key',
        },
      },
    };

    expect(() => ExternalDataSourceSchema.parse(source)).not.toThrow();
  });

  it('should validate basic authentication', () => {
    const source = {
      id: 'basic-auth-source',
      name: 'Basic Auth Source',
      type: 'rest-api',
      endpoint: 'https://api.example.com',
      authentication: {
        type: 'basic',
        config: {
          username: 'user',
          password: 'pass',
        },
      },
    };

    expect(() => ExternalDataSourceSchema.parse(source)).not.toThrow();
  });

  it('should reject invalid endpoint URL', () => {
    const invalidSource = {
      id: 'invalid-source',
      name: 'Invalid Source',
      type: 'rest-api',
      endpoint: 'not-a-url',
      authentication: {
        type: 'none',
        config: {},
      },
    };

    expect(() => ExternalDataSourceSchema.parse(invalidSource)).toThrow();
  });
});

describe('ExternalFieldMappingSchema', () => {
  it('should validate complete field mapping', () => {
    const validMapping: ExternalFieldMapping = {
      source: 'AccountName',
      target: 'name',
      type: 'text',
      readonly: true,
    };

    expect(() => ExternalFieldMappingSchema.parse(validMapping)).not.toThrow();
  });

  it('should accept minimal field mapping', () => {
    const minimalMapping = {
      source: 'ExternalField',
      target: 'local_field',
      type: 'text',
    };

    expect(() => ExternalFieldMappingSchema.parse(minimalMapping)).not.toThrow();
  });

  it('should default readonly to true', () => {
    const mapping = {
      source: 'Field1',
      target: 'field_1',
      type: 'text',
    };

    const parsed = ExternalFieldMappingSchema.parse(mapping);
    expect(parsed.readonly).toBe(true);
  });

  it('should accept writable field mapping', () => {
    const writableMapping = {
      source: 'Status',
      target: 'status',
      type: 'text',
      readonly: false,
    };

    expect(() => ExternalFieldMappingSchema.parse(writableMapping)).not.toThrow();
  });

  it('should accept various field types', () => {
    const types = ['text', 'number', 'boolean', 'date', 'datetime', 'lookup'];

    types.forEach((type) => {
      const mapping = {
        source: 'Field',
        target: 'field',
        type,
      };

      expect(() => ExternalFieldMappingSchema.parse(mapping)).not.toThrow();
    });
  });
});

describe('ExternalLookupSchema', () => {
  it('should validate complete external lookup', () => {
    const validLookup: ExternalLookup = {
      fieldName: 'external_account',
      dataSource: {
        id: 'salesforce-api',
        name: 'Salesforce',
        type: 'rest-api',
        endpoint: 'https://api.salesforce.com/services/data/v58.0',
        authentication: {
          type: 'oauth2',
          config: { clientId: 'client_123' },
        },
      },
      query: {
        endpoint: '/sobjects/Account',
        method: 'GET',
        parameters: { limit: 100 },
      },
      fieldMappings: [
        {
          source: 'Name',
          target: 'account_name',
          type: 'text',
          readonly: true,
        },
        {
          source: 'Industry',
          target: 'industry',
          type: 'text',
          readonly: true,
        },
      ],
      caching: {
        enabled: true,
        ttl: 300,
        strategy: 'ttl',
      },
      fallback: {
        enabled: true,
        showError: true,
      },
      rateLimit: {
        requestsPerSecond: 10,
        burstSize: 20,
      },
    };

    expect(() => ExternalLookupSchema.parse(validLookup)).not.toThrow();
  });

  it('should accept minimal external lookup', () => {
    const minimalLookup = {
      fieldName: 'external_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/data',
      },
      fieldMappings: [
        {
          source: 'Field1',
          target: 'field_1',
          type: 'text',
        },
      ],
    };

    expect(() => ExternalLookupSchema.parse(minimalLookup)).not.toThrow();
  });

  it('should default query method to GET', () => {
    const lookup = {
      fieldName: 'test_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/data',
      },
      fieldMappings: [],
    };

    const parsed = ExternalLookupSchema.parse(lookup);
    expect(parsed.query.method).toBe('GET');
  });

  it('should accept POST query method', () => {
    const lookup = {
      fieldName: 'test_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/search',
        method: 'POST' as const,
        parameters: {
          query: 'search term',
        },
      },
      fieldMappings: [],
    };

    expect(() => ExternalLookupSchema.parse(lookup)).not.toThrow();
  });

  it('should default caching to enabled with 300s TTL', () => {
    const lookup = {
      fieldName: 'test_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/data',
      },
      fieldMappings: [],
      caching: {},
    };

    const parsed = ExternalLookupSchema.parse(lookup);
    expect(parsed.caching?.enabled).toBe(true);
    expect(parsed.caching?.ttl).toBe(300);
    expect(parsed.caching?.strategy).toBe('ttl');
  });

  it('should accept all cache strategies', () => {
    const strategies = ['lru', 'lfu', 'ttl'] as const;

    strategies.forEach((strategy) => {
      const lookup = {
        fieldName: 'test_field',
        dataSource: {
          id: 'source-1',
          name: 'Source',
          type: 'rest-api',
          endpoint: 'https://api.example.com',
          authentication: {
            type: 'none',
            config: {},
          },
        },
        query: {
          endpoint: '/data',
        },
        fieldMappings: [],
        caching: {
          strategy,
        },
      };

      expect(() => ExternalLookupSchema.parse(lookup)).not.toThrow();
    });
  });

  it('should validate custom cache TTL', () => {
    const lookup = {
      fieldName: 'test_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/data',
      },
      fieldMappings: [],
      caching: {
        enabled: true,
        ttl: 600,
        strategy: 'ttl' as const,
      },
    };

    const parsed = ExternalLookupSchema.parse(lookup);
    expect(parsed.caching?.ttl).toBe(600);
  });

  it('should default fallback to enabled with showError true', () => {
    const lookup = {
      fieldName: 'test_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/data',
      },
      fieldMappings: [],
      fallback: {},
    };

    const parsed = ExternalLookupSchema.parse(lookup);
    expect(parsed.fallback?.enabled).toBe(true);
    expect(parsed.fallback?.showError).toBe(true);
  });

  it('should accept custom fallback value', () => {
    const lookup = {
      fieldName: 'test_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/data',
      },
      fieldMappings: [],
      fallback: {
        enabled: true,
        defaultValue: 'N/A',
        showError: false,
      },
    };

    const parsed = ExternalLookupSchema.parse(lookup);
    expect(parsed.fallback?.defaultValue).toBe('N/A');
    expect(parsed.fallback?.showError).toBe(false);
  });

  it('should validate rate limiting', () => {
    const lookup = {
      fieldName: 'test_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/data',
      },
      fieldMappings: [],
      rateLimit: {
        requestsPerSecond: 5,
        burstSize: 10,
      },
    };

    expect(() => ExternalLookupSchema.parse(lookup)).not.toThrow();
  });

  it('should accept rate limit without burst size', () => {
    const lookup = {
      fieldName: 'test_field',
      dataSource: {
        id: 'source-1',
        name: 'Source',
        type: 'rest-api',
        endpoint: 'https://api.example.com',
        authentication: {
          type: 'none',
          config: {},
        },
      },
      query: {
        endpoint: '/data',
      },
      fieldMappings: [],
      rateLimit: {
        requestsPerSecond: 10,
      },
    };

    expect(() => ExternalLookupSchema.parse(lookup)).not.toThrow();
  });

  it('should validate OData external lookup', () => {
    const odataLookup = {
      fieldName: 'odata_products',
      dataSource: {
        id: 'odata-service',
        name: 'OData Product Service',
        type: 'odata' as const,
        endpoint: 'https://services.odata.org/V4/Northwind/Northwind.svc',
        authentication: {
          type: 'none' as const,
          config: {},
        },
      },
      query: {
        endpoint: '/Products',
        method: 'GET' as const,
        parameters: {
          $filter: "ProductName eq 'Chai'",
          $select: 'ProductID,ProductName,UnitPrice',
        },
      },
      fieldMappings: [
        {
          source: 'ProductID',
          target: 'product_id',
          type: 'number',
          readonly: true,
        },
        {
          source: 'ProductName',
          target: 'product_name',
          type: 'text',
          readonly: true,
        },
        {
          source: 'UnitPrice',
          target: 'unit_price',
          type: 'currency',
          readonly: true,
        },
      ],
    };

    expect(() => ExternalLookupSchema.parse(odataLookup)).not.toThrow();
  });

  it('should validate GraphQL external lookup', () => {
    const graphqlLookup = {
      fieldName: 'graphql_users',
      dataSource: {
        id: 'graphql-api',
        name: 'GraphQL API',
        type: 'graphql' as const,
        endpoint: 'https://api.example.com/graphql',
        authentication: {
          type: 'api-key' as const,
          config: {
            apiKey: 'key_123',
            headerName: 'Authorization',
          },
        },
      },
      query: {
        endpoint: '',
        method: 'POST' as const,
        parameters: {
          query: '{ users { id name email } }',
        },
      },
      fieldMappings: [
        {
          source: 'id',
          target: 'user_id',
          type: 'text',
          readonly: true,
        },
        {
          source: 'name',
          target: 'user_name',
          type: 'text',
          readonly: true,
        },
        {
          source: 'email',
          target: 'user_email',
          type: 'email',
          readonly: true,
        },
      ],
      caching: {
        enabled: true,
        ttl: 180,
        strategy: 'lru' as const,
      },
    };

    expect(() => ExternalLookupSchema.parse(graphqlLookup)).not.toThrow();
  });

  it('should validate complete Salesforce-like external lookup', () => {
    const salesforceLookup: ExternalLookup = {
      fieldName: 'salesforce_contacts',
      dataSource: {
        id: 'salesforce-prod',
        name: 'Salesforce Production',
        type: 'rest-api',
        endpoint: 'https://na1.salesforce.com/services/data/v58.0',
        authentication: {
          type: 'oauth2',
          config: {
            clientId: 'client_id',
            clientSecret: 'client_secret',
            tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
            scope: 'api',
          },
        },
      },
      query: {
        endpoint: '/query',
        method: 'GET',
        parameters: {
          q: 'SELECT Id, Name, Email, Phone FROM Contact WHERE IsActive = true LIMIT 1000',
        },
      },
      fieldMappings: [
        {
          source: 'Id',
          target: 'salesforce_id',
          type: 'text',
          readonly: true,
        },
        {
          source: 'Name',
          target: 'contact_name',
          type: 'text',
          readonly: true,
        },
        {
          source: 'Email',
          target: 'email',
          type: 'email',
          readonly: true,
        },
        {
          source: 'Phone',
          target: 'phone',
          type: 'phone',
          readonly: true,
        },
      ],
      caching: {
        enabled: true,
        ttl: 600,
        strategy: 'ttl',
      },
      fallback: {
        enabled: true,
        defaultValue: null,
        showError: true,
      },
      rateLimit: {
        requestsPerSecond: 5,
        burstSize: 15,
      },
    };

    expect(() => ExternalLookupSchema.parse(salesforceLookup)).not.toThrow();
  });
});
