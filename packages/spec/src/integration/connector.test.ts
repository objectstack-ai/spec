import { describe, it, expect } from 'vitest';
import {
  // Field Mapping
  FieldMappingSchema,
  FieldTransformSchema,
  
  // Data Sync
  DataSyncConfigSchema,
  SyncStrategySchema,
  ConflictResolutionSchema,
  
  // Webhook
  WebhookConfigSchema,
  WebhookEventSchema,
  
  // Rate Limiting & Retry
  RateLimitConfigSchema,
  RetryConfigSchema,
  
  // Base Connector
  ConnectorSchema,
  ConnectorTypeSchema,
  ConnectorStatusSchema,
  AuthenticationSchema,
  
  // Types
  type Connector,
  type FieldMapping,
  type DataSyncConfig,
  type WebhookConfig,
  type Authentication,
} from './connector.zod';

// Import shared auth schemas from canonical source
import {
  APIKeySchema,
  OAuth2Schema,
  JWTAuthSchema,
  SAMLAuthSchema,
  BasicAuthSchema,
  BearerAuthSchema,
  NoAuthSchema,
  AuthConfigSchema,
  type APIKey,
  type OAuth2,
  type JWTAuth,
  type SAMLAuth,
  type BasicAuth,
  type BearerAuth,
  type NoAuth,
  type AuthConfig,
} from '../auth/config.zod';

// ============================================================================
// Authentication Schemas Tests (from auth/config.zod.ts)
// ============================================================================

describe('APIKeySchema', () => {
  it('should accept valid API key authentication', () => {
    const auth: APIKey = {
      type: 'api-key',
      key: 'test-api-key-12345',
      headerName: 'X-API-Key',
    };
    
    expect(() => APIKeySchema.parse(auth)).not.toThrow();
  });
  
  it('should accept API key with query parameter', () => {
    const auth = {
      type: 'api-key',
      key: 'test-key',
      headerName: 'X-Custom-Key',
      paramName: 'api_key',
    };
    
    const parsed = APIKeySchema.parse(auth);
    expect(parsed.paramName).toBe('api_key');
  });
  
  it('should use default header name', () => {
    const auth = {
      type: 'api-key',
      key: 'test-key',
    };
    
    const parsed = APIKeySchema.parse(auth);
    expect(parsed.headerName).toBe('X-API-Key');
  });
});

describe('OAuth2Schema', () => {
  it('should accept valid OAuth2 configuration', () => {
    const auth: OAuth2 = {
      type: 'oauth2',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      authorizationUrl: 'https://auth.example.com/authorize',
      tokenUrl: 'https://auth.example.com/token',
      grantType: 'authorization_code',
    };
    
    expect(() => OAuth2Schema.parse(auth)).not.toThrow();
  });
  
  it('should accept OAuth2 with scopes and refresh token', () => {
    const auth = {
      type: 'oauth2',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      authorizationUrl: 'https://auth.example.com/authorize',
      tokenUrl: 'https://auth.example.com/token',
      scopes: ['read', 'write'],
      refreshToken: 'refresh-token-xyz',
      grantType: 'client_credentials',
    };
    
    const parsed = OAuth2Schema.parse(auth);
    expect(parsed.scopes).toHaveLength(2);
    expect(parsed.refreshToken).toBe('refresh-token-xyz');
  });
  
  it('should use default grant type', () => {
    const auth = {
      type: 'oauth2',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      authorizationUrl: 'https://auth.example.com/authorize',
      tokenUrl: 'https://auth.example.com/token',
    };
    
    const parsed = OAuth2Schema.parse(auth);
    expect(parsed.grantType).toBe('authorization_code');
  });
});

describe('JWTAuthSchema', () => {
  it('should accept JWT with token', () => {
    const auth = {
      type: 'jwt',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      algorithm: 'HS256',
    };
    
    expect(() => JWTAuthSchema.parse(auth)).not.toThrow();
  });
  
  it('should accept JWT with secret key and claims', () => {
    const auth = {
      type: 'jwt',
      secretKey: 'my-secret-key',
      algorithm: 'HS256',
      issuer: 'objectstack',
      audience: 'api',
      expiresIn: 3600,
      claims: { role: 'admin' },
    };
    
    const parsed = JWTAuthSchema.parse(auth);
    expect(parsed.claims).toEqual({ role: 'admin' });
  });
  
  it('should use default algorithm and expiry', () => {
    const auth = {
      type: 'jwt',
      token: 'test-token',
    };
    
    const parsed = JWTAuthSchema.parse(auth);
    expect(parsed.algorithm).toBe('HS256');
    expect(parsed.expiresIn).toBe(3600);
  });
});

describe('SAMLAuthSchema', () => {
  it('should accept valid SAML configuration', () => {
    const auth = {
      type: 'saml',
      entryPoint: 'https://idp.example.com/sso',
      issuer: 'objectstack-sp',
      certificate: '-----BEGIN CERTIFICATE-----...',
      signatureAlgorithm: 'sha256',
    };
    
    expect(() => SAMLAuthSchema.parse(auth)).not.toThrow();
  });
  
  it('should use default values', () => {
    const auth = {
      type: 'saml',
      entryPoint: 'https://idp.example.com/sso',
      issuer: 'objectstack-sp',
      certificate: 'cert-content',
    };
    
    const parsed = SAMLAuthSchema.parse(auth);
    expect(parsed.signatureAlgorithm).toBe('sha256');
    expect(parsed.wantAssertionsSigned).toBe(true);
  });
});

describe('AuthenticationSchema', () => {
  it('should accept all authentication types via discriminated union', () => {
    const keyAuth = { type: 'api-key', key: 'key' };
    const oauth2Auth = { 
      type: 'oauth2', 
      clientId: 'id', 
      clientSecret: 'secret',
      authorizationUrl: 'https://auth.example.com/authorize',
      tokenUrl: 'https://auth.example.com/token',
    };
    const basicAuth = { type: 'basic', username: 'user', password: 'pass' };
    const noAuth = { type: 'none' };
    
    expect(() => AuthenticationSchema.parse(keyAuth)).not.toThrow();
    expect(() => AuthenticationSchema.parse(oauth2Auth)).not.toThrow();
    expect(() => AuthenticationSchema.parse(basicAuth)).not.toThrow();
    expect(() => AuthenticationSchema.parse(noAuth)).not.toThrow();
  });
});

// ============================================================================
// Field Mapping Tests
// ============================================================================

describe('FieldMappingSchema', () => {
  it('should accept valid field mapping', () => {
    const mapping: FieldMapping = {
      sourceField: 'firstName',
      targetField: 'first_name',
      dataType: 'string',
      syncMode: 'bidirectional',
    };
    
    expect(() => FieldMappingSchema.parse(mapping)).not.toThrow();
  });
  
  it('should validate target field snake_case format', () => {
    expect(() => FieldMappingSchema.parse({
      sourceField: 'field',
      targetField: 'valid_field_name',
    })).not.toThrow();
    
    expect(() => FieldMappingSchema.parse({
      sourceField: 'field',
      targetField: 'InvalidField',
    })).toThrow();
  });
  
  it('should accept field with transformation', () => {
    const mapping = {
      sourceField: 'name',
      targetField: 'full_name',
      transform: {
        type: 'uppercase',
      },
    };
    
    const parsed = FieldMappingSchema.parse(mapping);
    expect(parsed.transform?.type).toBe('uppercase');
  });
  
  it('should use default values', () => {
    const mapping = {
      sourceField: 'field1',
      targetField: 'field_1',
    };
    
    const parsed = FieldMappingSchema.parse(mapping);
    expect(parsed.required).toBe(false);
    expect(parsed.syncMode).toBe('bidirectional');
  });
});

// ============================================================================
// Data Sync Configuration Tests
// ============================================================================

describe('DataSyncConfigSchema', () => {
  it('should accept valid sync configuration', () => {
    const config: DataSyncConfig = {
      strategy: 'incremental',
      direction: 'bidirectional',
      schedule: '0 */6 * * *',
      realtimeSync: true,
      conflictResolution: 'latest_wins',
      batchSize: 1000,
      deleteMode: 'soft_delete',
    };
    
    expect(() => DataSyncConfigSchema.parse(config)).not.toThrow();
  });
  
  it('should use default values', () => {
    const config = {};
    
    const parsed = DataSyncConfigSchema.parse(config);
    expect(parsed.strategy).toBe('incremental');
    expect(parsed.direction).toBe('import');
    expect(parsed.realtimeSync).toBe(false);
    expect(parsed.conflictResolution).toBe('latest_wins');
    expect(parsed.batchSize).toBe(1000);
    expect(parsed.deleteMode).toBe('soft_delete');
  });
  
  it('should validate batch size range', () => {
    expect(() => DataSyncConfigSchema.parse({ batchSize: 0 })).toThrow();
    expect(() => DataSyncConfigSchema.parse({ batchSize: 10001 })).toThrow();
    expect(() => DataSyncConfigSchema.parse({ batchSize: 500 })).not.toThrow();
  });
});

// ============================================================================
// Webhook Configuration Tests
// ============================================================================

describe('WebhookConfigSchema', () => {
  it('should accept valid webhook configuration', () => {
    const webhook: WebhookConfig = {
      url: 'https://api.example.com/webhooks',
      events: ['record.created', 'record.updated'],
      secret: 'webhook-secret',
      signatureAlgorithm: 'hmac_sha256',
      enabled: true,
    };
    
    expect(() => WebhookConfigSchema.parse(webhook)).not.toThrow();
  });
  
  it('should accept webhook with retry configuration', () => {
    const webhook = {
      url: 'https://api.example.com/webhooks',
      events: ['sync.completed'],
      retryConfig: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000,
      },
    };
    
    const parsed = WebhookConfigSchema.parse(webhook);
    expect(parsed.retryConfig?.maxAttempts).toBe(3);
  });
  
  it('should use default values', () => {
    const webhook = {
      url: 'https://api.example.com/webhooks',
      events: ['record.created'],
    };
    
    const parsed = WebhookConfigSchema.parse(webhook);
    expect(parsed.signatureAlgorithm).toBe('hmac_sha256');
    expect(parsed.timeoutMs).toBe(30000);
    expect(parsed.enabled).toBe(true);
  });
});

// ============================================================================
// Rate Limiting & Retry Tests
// ============================================================================

describe('RateLimitConfigSchema', () => {
  it('should accept valid rate limit configuration', () => {
    const config = {
      strategy: 'token_bucket',
      maxRequests: 100,
      windowSeconds: 60,
      burstCapacity: 150,
      respectUpstreamLimits: true,
    };
    
    expect(() => RateLimitConfigSchema.parse(config)).not.toThrow();
  });
  
  it('should use default values', () => {
    const config = {
      maxRequests: 100,
      windowSeconds: 60,
    };
    
    const parsed = RateLimitConfigSchema.parse(config);
    expect(parsed.strategy).toBe('token_bucket');
    expect(parsed.respectUpstreamLimits).toBe(true);
  });
});

describe('RetryConfigSchema', () => {
  it('should accept valid retry configuration', () => {
    const config = {
      strategy: 'exponential_backoff',
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 60000,
      backoffMultiplier: 2,
      retryableStatusCodes: [429, 500, 502, 503],
      retryOnNetworkError: true,
      jitter: true,
    };
    
    expect(() => RetryConfigSchema.parse(config)).not.toThrow();
  });
  
  it('should use default values', () => {
    const config = {};
    
    const parsed = RetryConfigSchema.parse(config);
    expect(parsed.strategy).toBe('exponential_backoff');
    expect(parsed.maxAttempts).toBe(3);
    expect(parsed.initialDelayMs).toBe(1000);
    expect(parsed.maxDelayMs).toBe(60000);
    expect(parsed.backoffMultiplier).toBe(2);
    expect(parsed.retryableStatusCodes).toEqual([408, 429, 500, 502, 503, 504]);
    expect(parsed.retryOnNetworkError).toBe(true);
    expect(parsed.jitter).toBe(true);
  });
  
  it('should validate max attempts range', () => {
    expect(() => RetryConfigSchema.parse({ maxAttempts: -1 })).toThrow();
    expect(() => RetryConfigSchema.parse({ maxAttempts: 11 })).toThrow();
    expect(() => RetryConfigSchema.parse({ maxAttempts: 5 })).not.toThrow();
  });
});

// ============================================================================
// Base Connector Tests
// ============================================================================

describe('ConnectorSchema', () => {
  it('should accept valid minimal connector', () => {
    const connector: Connector = {
      name: 'test_connector',
      label: 'Test Connector',
      type: 'api',
      authentication: {
        type: 'api-key',
        key: 'test-key',
      },
      status: 'inactive',
      enabled: true,
    };
    
    expect(() => ConnectorSchema.parse(connector)).not.toThrow();
  });
  
  it('should validate connector name format (snake_case)', () => {
    expect(() => ConnectorSchema.parse({
      name: 'valid_connector_name',
      label: 'Test',
      type: 'saas',
      authentication: { type: 'none' },
    })).not.toThrow();
    
    expect(() => ConnectorSchema.parse({
      name: 'InvalidConnector',
      label: 'Test',
      type: 'saas',
      authentication: { type: 'none' },
    })).toThrow();
  });
  
  it('should accept connector with all fields', () => {
    const connector = {
      name: 'full_connector',
      label: 'Full Connector',
      type: 'saas',
      description: 'A comprehensive connector',
      icon: 'cloud',
      authentication: {
        type: 'oauth2',
        clientId: 'client',
        clientSecret: 'secret',
        authorizationUrl: 'https://auth.example.com/authorize',
        tokenUrl: 'https://auth.example.com/token',
      },
      syncConfig: {
        strategy: 'incremental',
        direction: 'bidirectional',
      },
      fieldMappings: [
        {
          sourceField: 'id',
          targetField: 'external_id',
        },
      ],
      webhooks: [
        {
          url: 'https://api.example.com/webhook',
          events: ['record.created'],
        },
      ],
      rateLimitConfig: {
        maxRequests: 100,
        windowSeconds: 60,
      },
      retryConfig: {
        maxAttempts: 3,
      },
      status: 'active',
      enabled: true,
      metadata: {
        version: '1.0',
      },
    };
    
    const parsed = ConnectorSchema.parse(connector);
    expect(parsed.description).toBe('A comprehensive connector');
    expect(parsed.fieldMappings).toHaveLength(1);
    expect(parsed.webhooks).toHaveLength(1);
  });
  
  it('should use default values', () => {
    const connector = {
      name: 'default_connector',
      label: 'Default Connector',
      type: 'database',
      authentication: { type: 'none' },
    };
    
    const parsed = ConnectorSchema.parse(connector);
    expect(parsed.connectionTimeoutMs).toBe(30000);
    expect(parsed.requestTimeoutMs).toBe(30000);
    expect(parsed.status).toBe('inactive');
    expect(parsed.enabled).toBe(true);
  });
  
  it('should validate timeout ranges', () => {
    expect(() => ConnectorSchema.parse({
      name: 'test',
      label: 'Test',
      type: 'api',
      authentication: { type: 'none' },
      connectionTimeoutMs: 500,
    })).toThrow();
    
    expect(() => ConnectorSchema.parse({
      name: 'test',
      label: 'Test',
      type: 'api',
      authentication: { type: 'none' },
      connectionTimeoutMs: 350000,
    })).toThrow();
    
    expect(() => ConnectorSchema.parse({
      name: 'test',
      label: 'Test',
      type: 'api',
      authentication: { type: 'none' },
      connectionTimeoutMs: 5000,
    })).not.toThrow();
  });
});

describe('ConnectorTypeSchema', () => {
  it('should accept all valid connector types', () => {
    const types = ['saas', 'database', 'file_storage', 'message_queue', 'api', 'custom'];
    
    types.forEach(type => {
      expect(() => ConnectorTypeSchema.parse(type)).not.toThrow();
    });
  });
  
  it('should reject invalid connector types', () => {
    expect(() => ConnectorTypeSchema.parse('invalid_type')).toThrow();
  });
});

describe('ConnectorStatusSchema', () => {
  it('should accept all valid statuses', () => {
    const statuses = ['active', 'inactive', 'error', 'configuring'];
    
    statuses.forEach(status => {
      expect(() => ConnectorStatusSchema.parse(status)).not.toThrow();
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Connector Integration', () => {
  it('should create a complete SaaS connector', () => {
    const connector = {
      name: 'salesforce_prod',
      label: 'Salesforce Production',
      type: 'saas',
      description: 'Production Salesforce connector',
      authentication: {
        type: 'oauth2',
        clientId: '${SF_CLIENT_ID}',
        clientSecret: '${SF_CLIENT_SECRET}',
        authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
        tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
        scopes: ['api', 'refresh_token'],
      },
      syncConfig: {
        strategy: 'incremental',
        direction: 'bidirectional',
        schedule: '0 */6 * * *',
        realtimeSync: true,
        batchSize: 200,
      },
      fieldMappings: [
        {
          source: 'FirstName',
          target: 'first_name',
          dataType: 'string',
          required: true,
        },
        {
          source: 'LastName',
          target: 'last_name',
          dataType: 'string',
          required: true,
        },
      ],
      rateLimitConfig: {
        strategy: 'token_bucket',
        maxRequests: 100,
        windowSeconds: 20,
      },
      retryConfig: {
        strategy: 'exponential_backoff',
        maxAttempts: 3,
      },
      status: 'active',
      enabled: true,
    };
    
    const parsed = ConnectorSchema.parse(connector);
    expect(parsed.type).toBe('saas');
    expect(parsed.fieldMappings).toHaveLength(2);
  });
});
