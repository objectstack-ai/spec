import { describe, it, expect } from 'vitest';
import {
  AuthProviderConfigSchema,
  AuthPluginConfigSchema,
  AuthConfigSchema,
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
