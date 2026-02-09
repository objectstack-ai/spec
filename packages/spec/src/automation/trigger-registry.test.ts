import { describe, it, expect } from 'vitest';
import {
  ConnectorCategorySchema,
  AuthenticationTypeSchema,
  AuthFieldSchema,
  OAuth2ConfigSchema,
  AuthenticationSchema,
  OperationTypeSchema,
  OperationParameterSchema,
  ConnectorOperationSchema,
  ConnectorTriggerSchema,
  ConnectorSchema,
  ConnectorInstanceSchema,
  Connector,
} from './trigger-registry.zod';

describe('ConnectorCategorySchema', () => {
  it('should accept all valid categories', () => {
    const categories = [
      'crm', 'payment', 'communication', 'storage', 'analytics',
      'database', 'marketing', 'accounting', 'hr', 'productivity',
      'ecommerce', 'support', 'devtools', 'social', 'other',
    ];
    categories.forEach(c => {
      expect(() => ConnectorCategorySchema.parse(c)).not.toThrow();
    });
  });

  it('should reject invalid category', () => {
    expect(() => ConnectorCategorySchema.parse('invalid')).toThrow();
  });
});

describe('AuthenticationTypeSchema', () => {
  it('should accept all valid auth types', () => {
    const types = ['none', 'apiKey', 'basic', 'bearer', 'oauth1', 'oauth2', 'custom'];
    types.forEach(t => {
      expect(() => AuthenticationTypeSchema.parse(t)).not.toThrow();
    });
  });

  it('should reject invalid auth type', () => {
    expect(() => AuthenticationTypeSchema.parse('saml')).toThrow();
  });
});

describe('AuthFieldSchema', () => {
  it('should accept valid auth field with defaults', () => {
    const result = AuthFieldSchema.parse({
      name: 'api_key',
      label: 'API Key',
    });
    expect(result.type).toBe('text');
    expect(result.required).toBe(true);
  });

  it('should accept full auth field', () => {
    const field = {
      name: 'region',
      label: 'Region',
      type: 'select' as const,
      description: 'Cloud region',
      required: false,
      default: 'us-east-1',
      options: [
        { label: 'US East', value: 'us-east-1' },
        { label: 'EU West', value: 'eu-west-1' },
      ],
      placeholder: 'Select a region',
    };
    expect(() => AuthFieldSchema.parse(field)).not.toThrow();
  });

  it('should reject invalid name (not snake_case)', () => {
    expect(() => AuthFieldSchema.parse({
      name: 'ApiKey',
      label: 'API Key',
    })).toThrow();
  });

  it('should reject missing label', () => {
    expect(() => AuthFieldSchema.parse({
      name: 'api_key',
    })).toThrow();
  });
});

describe('OAuth2ConfigSchema', () => {
  it('should accept valid config with defaults', () => {
    const result = OAuth2ConfigSchema.parse({
      authorizationUrl: 'https://example.com/auth',
      tokenUrl: 'https://example.com/token',
    });
    expect(result.clientIdField).toBe('client_id');
    expect(result.clientSecretField).toBe('client_secret');
  });

  it('should accept full config', () => {
    expect(() => OAuth2ConfigSchema.parse({
      authorizationUrl: 'https://example.com/auth',
      tokenUrl: 'https://example.com/token',
      scopes: ['read', 'write'],
      clientIdField: 'my_client_id',
      clientSecretField: 'my_secret',
    })).not.toThrow();
  });

  it('should reject invalid URLs', () => {
    expect(() => OAuth2ConfigSchema.parse({
      authorizationUrl: 'not-a-url',
      tokenUrl: 'https://example.com/token',
    })).toThrow();
  });
});

describe('AuthenticationSchema', () => {
  it('should accept minimal auth config', () => {
    expect(() => AuthenticationSchema.parse({
      type: 'none',
    })).not.toThrow();
  });

  it('should accept auth with fields and test', () => {
    const result = AuthenticationSchema.parse({
      type: 'apiKey',
      fields: [{ name: 'api_key', label: 'API Key', type: 'password' }],
      test: { url: 'https://api.example.com/me' },
    });
    expect(result.test?.method).toBe('GET');
  });

  it('should accept oauth2 with config', () => {
    expect(() => AuthenticationSchema.parse({
      type: 'oauth2',
      oauth2: {
        authorizationUrl: 'https://example.com/auth',
        tokenUrl: 'https://example.com/token',
      },
    })).not.toThrow();
  });

  it('should reject missing type', () => {
    expect(() => AuthenticationSchema.parse({})).toThrow();
  });
});

describe('OperationTypeSchema', () => {
  it('should accept all valid types', () => {
    const types = ['read', 'write', 'delete', 'search', 'trigger', 'action'];
    types.forEach(t => {
      expect(() => OperationTypeSchema.parse(t)).not.toThrow();
    });
  });

  it('should reject invalid type', () => {
    expect(() => OperationTypeSchema.parse('execute')).toThrow();
  });
});

describe('OperationParameterSchema', () => {
  it('should accept valid param with defaults', () => {
    const result = OperationParameterSchema.parse({
      name: 'channel',
      label: 'Channel',
      type: 'string',
    });
    expect(result.required).toBe(false);
  });

  it('should accept full param', () => {
    expect(() => OperationParameterSchema.parse({
      name: 'channel',
      label: 'Channel',
      description: 'Slack channel',
      type: 'string',
      required: true,
      default: '#general',
      validation: { pattern: '^#' },
      dynamicOptions: 'loadChannels',
    })).not.toThrow();
  });

  it('should reject missing type', () => {
    expect(() => OperationParameterSchema.parse({
      name: 'channel',
      label: 'Channel',
    })).toThrow();
  });
});

describe('ConnectorOperationSchema', () => {
  it('should accept valid operation with defaults', () => {
    const result = ConnectorOperationSchema.parse({
      id: 'send_message',
      name: 'Send Message',
      type: 'action',
    });
    expect(result.supportsPagination).toBe(false);
    expect(result.supportsFiltering).toBe(false);
  });

  it('should accept full operation', () => {
    expect(() => ConnectorOperationSchema.parse({
      id: 'list_contacts',
      name: 'List Contacts',
      description: 'List all contacts',
      type: 'read',
      inputSchema: [{ name: 'limit', label: 'Limit', type: 'number' }],
      outputSchema: { type: 'array' },
      sampleOutput: [{ name: 'John' }],
      supportsPagination: true,
      supportsFiltering: true,
    })).not.toThrow();
  });

  it('should reject invalid id (not snake_case)', () => {
    expect(() => ConnectorOperationSchema.parse({
      id: 'SendMessage',
      name: 'Send Message',
      type: 'action',
    })).toThrow();
  });
});

describe('ConnectorTriggerSchema', () => {
  it('should accept valid webhook trigger', () => {
    expect(() => ConnectorTriggerSchema.parse({
      id: 'new_message',
      name: 'New Message',
      type: 'webhook',
    })).not.toThrow();
  });

  it('should accept polling trigger with interval', () => {
    expect(() => ConnectorTriggerSchema.parse({
      id: 'new_record',
      name: 'New Record',
      type: 'polling',
      pollingIntervalMs: 5000,
      config: { resource: 'contacts' },
      outputSchema: { type: 'object' },
    })).not.toThrow();
  });

  it('should reject polling interval below minimum', () => {
    expect(() => ConnectorTriggerSchema.parse({
      id: 'fast_poll',
      name: 'Fast Poll',
      type: 'polling',
      pollingIntervalMs: 500,
    })).toThrow();
  });

  it('should reject invalid trigger type', () => {
    expect(() => ConnectorTriggerSchema.parse({
      id: 'test',
      name: 'Test',
      type: 'invalid',
    })).toThrow();
  });
});

describe('ConnectorSchema', () => {
  const minimalConnector = {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    authentication: { type: 'apiKey' },
  };

  it('should accept minimal connector with defaults', () => {
    const result = ConnectorSchema.parse(minimalConnector);
    expect(result.verified).toBe(false);
  });

  it('should accept full connector', () => {
    expect(() => ConnectorSchema.parse({
      ...minimalConnector,
      description: 'Slack integration',
      version: '1.0.0',
      icon: 'slack-icon',
      baseUrl: 'https://slack.com/api',
      operations: [{ id: 'send_message', name: 'Send Message', type: 'action' }],
      triggers: [{ id: 'new_message', name: 'New Message', type: 'webhook' }],
      rateLimit: { requestsPerSecond: 10, requestsPerMinute: 100 },
      author: 'ObjectStack',
      documentation: 'https://docs.example.com',
      homepage: 'https://example.com',
      license: 'MIT',
      tags: ['chat', 'messaging'],
      verified: true,
      metadata: { tier: 'premium' },
    })).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => ConnectorSchema.parse({})).toThrow();
    expect(() => ConnectorSchema.parse({ id: 'test' })).toThrow();
  });

  it('should reject invalid id format', () => {
    expect(() => ConnectorSchema.parse({
      ...minimalConnector,
      id: 'My-Connector',
    })).toThrow();
  });
});

describe('ConnectorInstanceSchema', () => {
  it('should accept valid instance with defaults', () => {
    const result = ConnectorInstanceSchema.parse({
      id: 'inst-123',
      connectorId: 'slack',
      name: 'Slack Production',
      credentials: { api_key: 'encrypted-value' },
    });
    expect(result.active).toBe(true);
    expect(result.testStatus).toBe('unknown');
  });

  it('should accept full instance', () => {
    expect(() => ConnectorInstanceSchema.parse({
      id: 'inst-456',
      connectorId: 'slack',
      name: 'Slack Dev',
      description: 'Development instance',
      credentials: { api_key: 'encrypted' },
      config: { workspace: 'dev' },
      active: false,
      createdAt: '2024-01-01T00:00:00Z',
      lastTestedAt: '2024-01-02T00:00:00Z',
      testStatus: 'success',
    })).not.toThrow();
  });

  it('should reject missing credentials', () => {
    expect(() => ConnectorInstanceSchema.parse({
      id: 'inst-789',
      connectorId: 'slack',
      name: 'Slack',
    })).toThrow();
  });

  it('should reject invalid datetime', () => {
    expect(() => ConnectorInstanceSchema.parse({
      id: 'inst-789',
      connectorId: 'slack',
      name: 'Slack',
      credentials: {},
      createdAt: 'not-a-date',
    })).toThrow();
  });
});

describe('Connector factory', () => {
  it('should create an API key connector', () => {
    const connector = Connector.apiKey({
      id: 'twilio',
      name: 'Twilio',
      category: 'communication',
      baseUrl: 'https://api.twilio.com',
    });
    expect(connector.authentication.type).toBe('apiKey');
    expect(connector.verified).toBe(false);
    expect(() => ConnectorSchema.parse(connector)).not.toThrow();
  });

  it('should create an OAuth2 connector', () => {
    const connector = Connector.oauth2({
      id: 'salesforce',
      name: 'Salesforce',
      category: 'crm',
      baseUrl: 'https://login.salesforce.com',
      authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
      tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
      scopes: ['api', 'refresh_token'],
    });
    expect(connector.authentication.type).toBe('oauth2');
    expect(connector.authentication.oauth2?.scopes).toEqual(['api', 'refresh_token']);
    expect(() => ConnectorSchema.parse(connector)).not.toThrow();
  });
});
