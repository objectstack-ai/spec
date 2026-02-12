import { describe, it, expect } from 'vitest';
import {
  UserSchema,
  AccountSchema,
  SessionSchema,
  VerificationTokenSchema,
  ApiKeySchema,
  type User,
  type Account,
  type Session,
  type VerificationToken,
  type ApiKey,
} from "./identity.zod";

describe('UserSchema', () => {
  it('should accept valid user data', () => {
    const user: User = {
      id: 'user_123',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => UserSchema.parse(user)).not.toThrow();
  });

  it('should accept minimal user data', () => {
    const user = {
      id: 'user_123',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = UserSchema.parse(user);
    expect(result.emailVerified).toBe(false); // default value
  });

  it('should validate email format', () => {
    const user = {
      id: 'user_123',
      email: 'invalid-email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => UserSchema.parse(user)).toThrow();
  });

  it('should validate image URL format', () => {
    const user = {
      id: 'user_123',
      email: 'test@example.com',
      image: 'not-a-url',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => UserSchema.parse(user)).toThrow();
  });

  it('should accept user without optional fields', () => {
    const user = {
      id: 'user_123',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => UserSchema.parse(user)).not.toThrow();
  });
});

describe('AccountSchema', () => {
  it('should accept valid OAuth account', () => {
    const account: Account = {
      id: 'account_123',
      userId: 'user_123',
      type: 'oauth',
      provider: 'google',
      providerAccountId: 'google_user_123',
      accessToken: 'access_token_xyz',
      refreshToken: 'refresh_token_xyz',
      expiresAt: Date.now() + 3600000,
      tokenType: 'Bearer',
      scope: 'openid profile email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => AccountSchema.parse(account)).not.toThrow();
  });

  it('should accept minimal account data', () => {
    const account = {
      id: 'account_123',
      userId: 'user_123',
      type: 'email',
      provider: 'email',
      providerAccountId: 'email_user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => AccountSchema.parse(account)).not.toThrow();
  });

  it('should accept all account types', () => {
    const types = ['oauth', 'oidc', 'email', 'credentials', 'saml', 'ldap'] as const;

    types.forEach((type) => {
      const account = {
        id: 'account_123',
        userId: 'user_123',
        type,
        provider: 'provider',
        providerAccountId: 'provider_account_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => AccountSchema.parse(account)).not.toThrow();
    });
  });

  it('should reject invalid account type', () => {
    const account = {
      id: 'account_123',
      userId: 'user_123',
      type: 'invalid',
      provider: 'provider',
      providerAccountId: 'provider_account_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => AccountSchema.parse(account)).toThrow();
  });
});

describe('SessionSchema', () => {
  it('should accept valid session data', () => {
    const session: Session = {
      id: 'session_123',
      sessionToken: 'session_token_xyz',
      userId: 'user_123',
      expires: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      fingerprint: 'fingerprint_xyz',
    };

    expect(() => SessionSchema.parse(session)).not.toThrow();
  });

  it('should accept minimal session data', () => {
    const session = {
      id: 'session_123',
      sessionToken: 'session_token_xyz',
      userId: 'user_123',
      expires: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => SessionSchema.parse(session)).not.toThrow();
  });

  it('should accept session with device information', () => {
    const session = {
      id: 'session_123',
      sessionToken: 'session_token_xyz',
      userId: 'user_123',
      expires: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ipAddress: '10.0.0.1',
      userAgent: 'Chrome/120.0.0.0',
      fingerprint: 'device_fingerprint',
    };

    expect(() => SessionSchema.parse(session)).not.toThrow();
  });

  it('should accept session with activeOrganizationId', () => {
    const session = {
      id: 'session_123',
      sessionToken: 'session_token_xyz',
      userId: 'user_123',
      activeOrganizationId: 'org_123',
      expires: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => SessionSchema.parse(session)).not.toThrow();
  });

  it('should accept session without activeOrganizationId', () => {
    const session = {
      id: 'session_123',
      sessionToken: 'session_token_xyz',
      userId: 'user_123',
      expires: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => SessionSchema.parse(session)).not.toThrow();
  });
});

describe('VerificationTokenSchema', () => {
  it('should accept valid verification token', () => {
    const token: VerificationToken = {
      identifier: 'test@example.com',
      token: 'verification_token_xyz',
      expires: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    expect(() => VerificationTokenSchema.parse(token)).not.toThrow();
  });

  it('should accept token with phone identifier', () => {
    const token = {
      identifier: '+1234567890',
      token: 'verification_token_xyz',
      expires: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    expect(() => VerificationTokenSchema.parse(token)).not.toThrow();
  });

  it('should accept token with email identifier', () => {
    const token = {
      identifier: 'user@example.com',
      token: 'reset_password_token',
      expires: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    expect(() => VerificationTokenSchema.parse(token)).not.toThrow();
  });
});

describe('ApiKeySchema', () => {
  it('should accept minimal API key', () => {
    const key = {
      id: 'key_123',
      name: 'CI/CD Pipeline',
      userId: 'user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = ApiKeySchema.parse(key);
    expect(result.enabled).toBe(true);
  });

  it('should accept full API key with rate limiting and permissions', () => {
    const key: ApiKey = {
      id: 'key_123',
      name: 'Production API Key',
      start: 'os_pk_ab',
      prefix: 'os_pk_',
      userId: 'user_123',
      organizationId: 'org_456',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      lastRefetchAt: new Date().toISOString(),
      enabled: true,
      rateLimitEnabled: true,
      rateLimitTimeWindow: 60000,
      rateLimitMax: 100,
      remaining: 95,
      permissions: { 'publish': true, 'read': true, 'manage': false },
      scopes: ['marketplace:publish', 'marketplace:read'],
      metadata: { environment: 'production' },
    };

    const result = ApiKeySchema.parse(key);
    expect(result.organizationId).toBe('org_456');
    expect(result.scopes).toHaveLength(2);
    expect(result.permissions?.publish).toBe(true);
  });

  it('should accept API key without optional fields', () => {
    const key = {
      id: 'key_123',
      name: 'Minimal Key',
      userId: 'user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = ApiKeySchema.parse(key);
    expect(result.organizationId).toBeUndefined();
    expect(result.expiresAt).toBeUndefined();
    expect(result.scopes).toBeUndefined();
  });

  it('should correctly infer ApiKey type', () => {
    const key: ApiKey = {
      id: 'key_123',
      name: 'Test Key',
      userId: 'user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(key.id).toBe('key_123');
    expect(key.name).toBe('Test Key');
  });
});

describe('Type inference', () => {
  it('should correctly infer User type', () => {
    const user: User = {
      id: 'user_123',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // This test passes if TypeScript compiles without errors
    expect(user.id).toBe('user_123');
    expect(user.email).toBe('test@example.com');
  });

  it('should correctly infer Account type', () => {
    const account: Account = {
      id: 'account_123',
      userId: 'user_123',
      type: 'oauth',
      provider: 'google',
      providerAccountId: 'google_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // This test passes if TypeScript compiles without errors
    expect(account.type).toBe('oauth');
    expect(account.provider).toBe('google');
  });

  it('should correctly infer Session type', () => {
    const session: Session = {
      id: 'session_123',
      sessionToken: 'token_xyz',
      userId: 'user_123',
      expires: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // This test passes if TypeScript compiles without errors
    expect(session.id).toBe('session_123');
    expect(session.userId).toBe('user_123');
  });

  it('should correctly infer VerificationToken type', () => {
    const token: VerificationToken = {
      identifier: 'test@example.com',
      token: 'token_xyz',
      expires: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // This test passes if TypeScript compiles without errors
    expect(token.identifier).toBe('test@example.com');
    expect(token.token).toBe('token_xyz');
  });
});
