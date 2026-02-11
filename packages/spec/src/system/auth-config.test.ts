import { describe, it, expect } from 'vitest';
import {
  AuthProviderConfigSchema,
  AuthPluginConfigSchema,
  AuthConfigSchema,
  MutualTLSConfigSchema,
} from './auth-config.zod';

describe('AuthProviderConfigSchema', () => {
  it('should accept valid provider config', () => {
    const config = AuthProviderConfigSchema.parse({
      id: 'github',
      clientId: 'abc123',
      clientSecret: 'secret456',
    });

    expect(config.id).toBe('github');
    expect(config.clientId).toBe('abc123');
    expect(config.clientSecret).toBe('secret456');
  });

  it('should accept optional scope', () => {
    const config = AuthProviderConfigSchema.parse({
      id: 'google',
      clientId: 'abc123',
      clientSecret: 'secret456',
      scope: ['email', 'profile'],
    });

    expect(config.scope).toEqual(['email', 'profile']);
  });

  it('should reject missing required fields', () => {
    expect(() => AuthProviderConfigSchema.parse({})).toThrow();
    expect(() => AuthProviderConfigSchema.parse({ id: 'github' })).toThrow();
    expect(() => AuthProviderConfigSchema.parse({ id: 'github', clientId: 'abc' })).toThrow();
  });
});

describe('AuthPluginConfigSchema', () => {
  it('should apply defaults for all fields', () => {
    const config = AuthPluginConfigSchema.parse({});

    expect(config.organization).toBe(false);
    expect(config.twoFactor).toBe(false);
    expect(config.passkeys).toBe(false);
    expect(config.magicLink).toBe(false);
  });

  it('should accept custom values', () => {
    const config = AuthPluginConfigSchema.parse({
      organization: true,
      twoFactor: true,
      passkeys: true,
      magicLink: true,
    });

    expect(config.organization).toBe(true);
    expect(config.twoFactor).toBe(true);
    expect(config.passkeys).toBe(true);
    expect(config.magicLink).toBe(true);
  });
});

describe('AuthConfigSchema', () => {
  it('should accept minimal configuration', () => {
    const config = AuthConfigSchema.parse({});

    expect(config.secret).toBeUndefined();
    expect(config.baseUrl).toBeUndefined();
    expect(config.providers).toBeUndefined();
    expect(config.plugins).toBeUndefined();
    expect(config.session).toBeUndefined();
  });

  it('should accept full configuration', () => {
    const config = AuthConfigSchema.parse({
      secret: 'my-secret',
      baseUrl: 'https://auth.example.com',
      databaseUrl: 'postgres://localhost/auth',
      providers: [
        { id: 'github', clientId: 'abc', clientSecret: 'def' },
      ],
      plugins: { organization: true, twoFactor: true },
      session: { expiresIn: 3600, updateAge: 600 },
    });

    expect(config.secret).toBe('my-secret');
    expect(config.baseUrl).toBe('https://auth.example.com');
    expect(config.providers).toHaveLength(1);
    expect(config.plugins?.organization).toBe(true);
    expect(config.session?.expiresIn).toBe(3600);
  });

  it('should apply session defaults', () => {
    const config = AuthConfigSchema.parse({
      session: {},
    });

    expect(config.session?.expiresIn).toBe(60 * 60 * 24 * 7);
    expect(config.session?.updateAge).toBe(60 * 60 * 24);
  });

  it('should allow extra properties via catchall', () => {
    const config = AuthConfigSchema.parse({
      customSetting: 'value',
    });

    expect(config.customSetting).toBe('value');
  });
});

// ==========================================
// Mutual TLS Configuration Tests
// ==========================================

describe('MutualTLSConfigSchema', () => {
  it('should accept minimal mTLS config', () => {
    const config = MutualTLSConfigSchema.parse({
      trustedCAs: ['/path/to/ca.pem'],
      certificateValidation: 'strict',
    });

    expect(config.enabled).toBe(false);
    expect(config.clientCertRequired).toBe(false);
    expect(config.trustedCAs).toHaveLength(1);
    expect(config.certificateValidation).toBe('strict');
  });

  it('should accept full mTLS config', () => {
    const config = MutualTLSConfigSchema.parse({
      enabled: true,
      clientCertRequired: true,
      trustedCAs: ['/path/to/ca1.pem', '/path/to/ca2.pem'],
      crlUrl: 'https://crl.example.com/crl.pem',
      ocspUrl: 'https://ocsp.example.com',
      certificateValidation: 'strict',
      allowedCNs: ['client.example.com', 'service.example.com'],
      allowedOUs: ['Engineering', 'DevOps'],
      pinning: {
        enabled: true,
        pins: ['sha256/AAAA', 'sha256/BBBB'],
      },
    });

    expect(config.enabled).toBe(true);
    expect(config.clientCertRequired).toBe(true);
    expect(config.trustedCAs).toHaveLength(2);
    expect(config.allowedCNs).toHaveLength(2);
    expect(config.allowedOUs).toHaveLength(2);
    expect(config.pinning?.enabled).toBe(true);
    expect(config.pinning?.pins).toHaveLength(2);
  });

  it('should accept all certificate validation levels', () => {
    const levels = ['strict', 'relaxed', 'none'] as const;
    levels.forEach(level => {
      const config = MutualTLSConfigSchema.parse({
        trustedCAs: [],
        certificateValidation: level,
      });
      expect(config.certificateValidation).toBe(level);
    });
  });

  it('should require trustedCAs and certificateValidation', () => {
    expect(() => MutualTLSConfigSchema.parse({})).toThrow();
    expect(() => MutualTLSConfigSchema.parse({
      trustedCAs: [],
    })).toThrow();
  });

  it('should accept mTLS in AuthConfigSchema', () => {
    const config = AuthConfigSchema.parse({
      mutualTls: {
        enabled: true,
        clientCertRequired: true,
        trustedCAs: ['/certs/ca.pem'],
        certificateValidation: 'strict',
      },
    });

    expect(config.mutualTls?.enabled).toBe(true);
    expect(config.mutualTls?.clientCertRequired).toBe(true);
  });
});
