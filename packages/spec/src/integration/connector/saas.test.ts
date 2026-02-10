import { describe, it, expect } from 'vitest';
import {
  SaasProviderSchema,
  ApiVersionConfigSchema,
  SaasObjectTypeSchema,
  SaasConnectorSchema,
} from './saas.zod';

const baseAuth = { type: 'none' as const };

const minimalObjectType = {
  name: 'account',
  label: 'Account',
  apiName: 'Account',
};

const minimalConnector = {
  name: 'sf_prod',
  label: 'Salesforce Prod',
  type: 'saas' as const,
  provider: 'salesforce' as const,
  authentication: baseAuth,
  baseUrl: 'https://api.example.com',
  objectTypes: [minimalObjectType],
};

describe('SaasProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['salesforce', 'hubspot', 'stripe', 'shopify', 'zendesk', 'intercom', 'mailchimp', 'slack', 'microsoft_dynamics', 'servicenow', 'netsuite', 'custom'];
    for (const p of providers) {
      expect(SaasProviderSchema.parse(p)).toBe(p);
    }
  });

  it('should reject invalid provider', () => {
    expect(() => SaasProviderSchema.parse('quickbooks')).toThrow();
  });
});

describe('ApiVersionConfigSchema', () => {
  it('should accept valid config', () => {
    const result = ApiVersionConfigSchema.parse({ version: 'v59.0' });
    expect(result.version).toBe('v59.0');
    expect(result.isDefault).toBe(false);
  });

  it('should accept full config', () => {
    const data = {
      version: '2023-10-01',
      isDefault: true,
      deprecationDate: '2024-01-01',
      sunsetDate: '2024-06-01',
    };
    const result = ApiVersionConfigSchema.parse(data);
    expect(result.isDefault).toBe(true);
    expect(result.deprecationDate).toBe('2024-01-01');
  });

  it('should reject missing version', () => {
    expect(() => ApiVersionConfigSchema.parse({})).toThrow();
  });
});

describe('SaasObjectTypeSchema', () => {
  it('should accept minimal object type', () => {
    const result = SaasObjectTypeSchema.parse(minimalObjectType);
    expect(result.enabled).toBe(true);
    expect(result.supportsCreate).toBe(true);
    expect(result.supportsUpdate).toBe(true);
    expect(result.supportsDelete).toBe(true);
  });

  it('should accept object type with all fields', () => {
    const data = {
      ...minimalObjectType,
      enabled: false,
      supportsCreate: false,
      supportsUpdate: false,
      supportsDelete: false,
      fieldMappings: [{ source: 'Name', target: 'name' }],
    };
    expect(() => SaasObjectTypeSchema.parse(data)).not.toThrow();
  });

  it('should reject non-snake_case name', () => {
    expect(() => SaasObjectTypeSchema.parse({ ...minimalObjectType, name: 'Account' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => SaasObjectTypeSchema.parse({ name: 'acct' })).toThrow();
  });
});

describe('SaasConnectorSchema', () => {
  it('should accept minimal valid connector', () => {
    expect(() => SaasConnectorSchema.parse(minimalConnector)).not.toThrow();
  });

  it('should apply defaults', () => {
    const result = SaasConnectorSchema.parse(minimalConnector);
    expect(result.enabled).toBe(true);
    expect(result.status).toBe('inactive');
  });

  it('should accept full connector', () => {
    const full = {
      ...minimalConnector,
      apiVersion: { version: 'v59.0', isDefault: true },
      oauthSettings: {
        scopes: ['api', 'refresh_token'],
        refreshTokenUrl: 'https://login.example.com/token',
        revokeTokenUrl: 'https://login.example.com/revoke',
        autoRefresh: true,
      },
      paginationConfig: {
        type: 'cursor',
        defaultPageSize: 50,
        maxPageSize: 500,
      },
      sandboxConfig: {
        enabled: true,
        baseUrl: 'https://sandbox.example.com',
      },
      customHeaders: { 'X-Custom': 'value' },
    };
    expect(() => SaasConnectorSchema.parse(full)).not.toThrow();
  });

  it('should reject wrong type literal', () => {
    expect(() => SaasConnectorSchema.parse({ ...minimalConnector, type: 'database' })).toThrow();
  });

  it('should reject invalid baseUrl', () => {
    expect(() => SaasConnectorSchema.parse({ ...minimalConnector, baseUrl: 'not-a-url' })).toThrow();
  });

  it('should reject invalid provider', () => {
    expect(() => SaasConnectorSchema.parse({ ...minimalConnector, provider: 'unknown' })).toThrow();
  });

  it('should reject missing objectTypes', () => {
    const { objectTypes: _, ...noTypes } = minimalConnector;
    expect(() => SaasConnectorSchema.parse(noTypes)).toThrow();
  });

  it('should reject missing baseUrl', () => {
    const { baseUrl: _, ...noUrl } = minimalConnector;
    expect(() => SaasConnectorSchema.parse(noUrl)).toThrow();
  });

  it('should reject invalid paginationConfig', () => {
    expect(() => SaasConnectorSchema.parse({
      ...minimalConnector,
      paginationConfig: { type: 'cursor', defaultPageSize: 0 },
    })).toThrow();
  });

  it('should reject invalid oauthSettings URLs', () => {
    expect(() => SaasConnectorSchema.parse({
      ...minimalConnector,
      oauthSettings: { scopes: ['api'], refreshTokenUrl: 'not-a-url' },
    })).toThrow();
  });
});
