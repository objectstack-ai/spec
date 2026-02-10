import { describe, it, expect } from 'vitest';
import {
  ConnectorOAuth2Schema,
  ConnectorAPIKeySchema,
  ConnectorBasicAuthSchema,
  ConnectorBearerAuthSchema,
  ConnectorNoAuthSchema,
  ConnectorAuthConfigSchema,
} from './connector-auth.zod';

describe('ConnectorOAuth2Schema', () => {
  const validOAuth2 = {
    type: 'oauth2' as const,
    authorizationUrl: 'https://auth.example.com/authorize',
    tokenUrl: 'https://auth.example.com/token',
    clientId: 'my-client-id',
    clientSecret: 'my-client-secret',
  };

  it('should accept valid minimal oauth2 config', () => {
    const result = ConnectorOAuth2Schema.parse(validOAuth2);
    expect(result.type).toBe('oauth2');
    expect(result.authorizationUrl).toBe('https://auth.example.com/authorize');
  });

  it('should accept oauth2 with all optional fields', () => {
    const result = ConnectorOAuth2Schema.parse({
      ...validOAuth2,
      scopes: ['read', 'write'],
      redirectUri: 'https://app.example.com/callback',
      refreshToken: 'refresh-token-value',
      tokenExpiry: 1700000000,
    });
    expect(result.scopes).toEqual(['read', 'write']);
    expect(result.redirectUri).toBe('https://app.example.com/callback');
    expect(result.refreshToken).toBe('refresh-token-value');
    expect(result.tokenExpiry).toBe(1700000000);
  });

  it('should have optional fields as undefined when not provided', () => {
    const result = ConnectorOAuth2Schema.parse(validOAuth2);
    expect(result.scopes).toBeUndefined();
    expect(result.redirectUri).toBeUndefined();
    expect(result.refreshToken).toBeUndefined();
    expect(result.tokenExpiry).toBeUndefined();
  });

  it('should reject invalid authorizationUrl', () => {
    expect(() =>
      ConnectorOAuth2Schema.parse({ ...validOAuth2, authorizationUrl: 'not-a-url' }),
    ).toThrow();
  });

  it('should reject invalid tokenUrl', () => {
    expect(() =>
      ConnectorOAuth2Schema.parse({ ...validOAuth2, tokenUrl: 'not-a-url' }),
    ).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => ConnectorOAuth2Schema.parse({ type: 'oauth2' })).toThrow();
    expect(() =>
      ConnectorOAuth2Schema.parse({ type: 'oauth2', authorizationUrl: 'https://a.com' }),
    ).toThrow();
  });
});

describe('ConnectorAPIKeySchema', () => {
  it('should accept valid api-key config with default headerName', () => {
    const result = ConnectorAPIKeySchema.parse({
      type: 'api-key',
      key: 'my-api-key-123',
    });
    expect(result.type).toBe('api-key');
    expect(result.key).toBe('my-api-key-123');
    expect(result.headerName).toBe('X-API-Key');
  });

  it('should accept custom headerName', () => {
    const result = ConnectorAPIKeySchema.parse({
      type: 'api-key',
      key: 'key123',
      headerName: 'Authorization',
    });
    expect(result.headerName).toBe('Authorization');
  });

  it('should accept optional paramName', () => {
    const result = ConnectorAPIKeySchema.parse({
      type: 'api-key',
      key: 'key123',
      paramName: 'api_key',
    });
    expect(result.paramName).toBe('api_key');
  });

  it('should reject missing key', () => {
    expect(() => ConnectorAPIKeySchema.parse({ type: 'api-key' })).toThrow();
  });
});

describe('ConnectorBasicAuthSchema', () => {
  it('should accept valid basic auth', () => {
    const result = ConnectorBasicAuthSchema.parse({
      type: 'basic',
      username: 'admin',
      password: 'secret',
    });
    expect(result.type).toBe('basic');
    expect(result.username).toBe('admin');
    expect(result.password).toBe('secret');
  });

  it('should reject missing username', () => {
    expect(() =>
      ConnectorBasicAuthSchema.parse({ type: 'basic', password: 'secret' }),
    ).toThrow();
  });

  it('should reject missing password', () => {
    expect(() =>
      ConnectorBasicAuthSchema.parse({ type: 'basic', username: 'admin' }),
    ).toThrow();
  });
});

describe('ConnectorBearerAuthSchema', () => {
  it('should accept valid bearer auth', () => {
    const result = ConnectorBearerAuthSchema.parse({
      type: 'bearer',
      token: 'my-bearer-token',
    });
    expect(result.type).toBe('bearer');
    expect(result.token).toBe('my-bearer-token');
  });

  it('should reject missing token', () => {
    expect(() => ConnectorBearerAuthSchema.parse({ type: 'bearer' })).toThrow();
  });
});

describe('ConnectorNoAuthSchema', () => {
  it('should accept valid no-auth config', () => {
    const result = ConnectorNoAuthSchema.parse({ type: 'none' });
    expect(result.type).toBe('none');
  });

  it('should reject wrong type', () => {
    expect(() => ConnectorNoAuthSchema.parse({ type: 'other' })).toThrow();
  });
});

describe('ConnectorAuthConfigSchema', () => {
  it('should accept oauth2 via discriminated union', () => {
    const result = ConnectorAuthConfigSchema.parse({
      type: 'oauth2',
      authorizationUrl: 'https://auth.example.com/authorize',
      tokenUrl: 'https://auth.example.com/token',
      clientId: 'id',
      clientSecret: 'secret',
    });
    expect(result.type).toBe('oauth2');
  });

  it('should accept api-key via discriminated union', () => {
    const result = ConnectorAuthConfigSchema.parse({
      type: 'api-key',
      key: 'key123',
    });
    expect(result.type).toBe('api-key');
  });

  it('should accept basic via discriminated union', () => {
    const result = ConnectorAuthConfigSchema.parse({
      type: 'basic',
      username: 'user',
      password: 'pass',
    });
    expect(result.type).toBe('basic');
  });

  it('should accept bearer via discriminated union', () => {
    const result = ConnectorAuthConfigSchema.parse({
      type: 'bearer',
      token: 'tok',
    });
    expect(result.type).toBe('bearer');
  });

  it('should accept none via discriminated union', () => {
    const result = ConnectorAuthConfigSchema.parse({ type: 'none' });
    expect(result.type).toBe('none');
  });

  it('should reject unknown auth type', () => {
    expect(() => ConnectorAuthConfigSchema.parse({ type: 'custom' })).toThrow();
  });

  it('should reject missing type', () => {
    expect(() => ConnectorAuthConfigSchema.parse({ key: 'value' })).toThrow();
  });
});
