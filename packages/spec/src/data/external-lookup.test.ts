import { describe, it, expect } from 'vitest';
import {
  ExternalDataSourceSchema,
  FieldMappingSchema,
  ExternalLookupSchema,
  type ExternalLookup,
  type ExternalDataSource,
  type FieldMapping,
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

describe('FieldMappingSchema', () => {
  it('should validate complete field mapping', () => {
    const validMapping: FieldMapping = {
      externalField: 'AccountName',
      localField: 'name',
      type: 'text',
      readonly: true,
    };

    expect(() => FieldMappingSchema.parse(validMapping)).not.toThrow();
  });

  it('should accept minimal field mapping', () => {
    const minimalMapping = {
      externalField: 'ExternalField',
      localField: 'local_field',
      type: 'text',
    };

    expect(() => FieldMappingSchema.parse(minimalMapping)).not.toThrow();
  });

  it('should default readonly to true', () => {
    const mapping = {
      externalField: 'Field1',
      localField: 'field_1',
      type: 'text',
    };

    const parsed = FieldMappingSchema.parse(mapping);
    expect(parsed.readonly).toBe(true);
  });

  it('should accept writable field mapping', () => {
    const writableMapping = {
      externalField: 'Status',
      localField: 'status',
      type: 'text',
      readonly: false,
    };

    expect(() => FieldMappingSchema.parse(writableMapping)).not.toThrow();
  });

  it('should accept various field types', () => {
    const types = ['text', 'number', 'boolean', 'date', 'datetime', 'lookup'];

    types.forEach((type) => {
      const mapping = {
        externalField: 'Field',
        localField: 'field',
        type,
      };

      expect(() => FieldMappingSchema.parse(mapping)).not.toThrow();
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
          externalField: 'Name',
          localField: 'account_name',
          type: 'text',
          readonly: true,
        },
        {
          externalField: 'Industry',
          localField: 'industry',
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
          externalField: 'Field1',
          localField: 'field_1',
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
          externalField: 'ProductID',
          localField: 'product_id',
          type: 'number',
          readonly: true,
        },
        {
          externalField: 'ProductName',
          localField: 'product_name',
          type: 'text',
          readonly: true,
        },
        {
          externalField: 'UnitPrice',
          localField: 'unit_price',
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
          externalField: 'id',
          localField: 'user_id',
          type: 'text',
          readonly: true,
        },
        {
          externalField: 'name',
          localField: 'user_name',
          type: 'text',
          readonly: true,
        },
        {
          externalField: 'email',
          localField: 'user_email',
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
          externalField: 'Id',
          localField: 'salesforce_id',
          type: 'text',
          readonly: true,
        },
        {
          externalField: 'Name',
          localField: 'contact_name',
          type: 'text',
          readonly: true,
        },
        {
          externalField: 'Email',
          localField: 'email',
          type: 'email',
          readonly: true,
        },
        {
          externalField: 'Phone',
          localField: 'phone',
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
