// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import {
  AuthEndpointPaths,
  AuthEndpointSchema,
  AuthEndpointAliases,
  EndpointMapping,
  getAuthEndpointUrl,
} from './auth-endpoints.zod';

describe('AuthEndpointPaths', () => {
  it('should define email/password authentication endpoints', () => {
    expect(AuthEndpointPaths.signInEmail).toBe('/sign-in/email');
    expect(AuthEndpointPaths.signUpEmail).toBe('/sign-up/email');
    expect(AuthEndpointPaths.signOut).toBe('/sign-out');
  });

  it('should define session management endpoints', () => {
    expect(AuthEndpointPaths.getSession).toBe('/get-session');
  });

  it('should define password management endpoints', () => {
    expect(AuthEndpointPaths.forgetPassword).toBe('/forget-password');
    expect(AuthEndpointPaths.resetPassword).toBe('/reset-password');
  });

  it('should define email verification endpoints', () => {
    expect(AuthEndpointPaths.sendVerificationEmail).toBe('/send-verification-email');
    expect(AuthEndpointPaths.verifyEmail).toBe('/verify-email');
  });

  it('should define 2FA endpoints', () => {
    expect(AuthEndpointPaths.twoFactorEnable).toBe('/two-factor/enable');
    expect(AuthEndpointPaths.twoFactorVerify).toBe('/two-factor/verify');
  });

  it('should define passkey endpoints', () => {
    expect(AuthEndpointPaths.passkeyRegister).toBe('/passkey/register');
    expect(AuthEndpointPaths.passkeyAuthenticate).toBe('/passkey/authenticate');
  });

  it('should define magic link endpoints', () => {
    expect(AuthEndpointPaths.magicLinkSend).toBe('/magic-link/send');
    expect(AuthEndpointPaths.magicLinkVerify).toBe('/magic-link/verify');
  });
});

describe('AuthEndpointSchema', () => {
  it('should validate signInEmail endpoint', () => {
    const endpoint = AuthEndpointSchema.shape.signInEmail.parse({
      method: 'POST',
      path: '/sign-in/email',
      description: 'Sign in with email and password',
    });

    expect(endpoint.method).toBe('POST');
    expect(endpoint.path).toBe('/sign-in/email');
  });

  it('should validate signUpEmail endpoint', () => {
    const endpoint = AuthEndpointSchema.shape.signUpEmail.parse({
      method: 'POST',
      path: '/sign-up/email',
      description: 'Register new user with email and password',
    });

    expect(endpoint.method).toBe('POST');
    expect(endpoint.path).toBe('/sign-up/email');
  });

  it('should validate getSession endpoint', () => {
    const endpoint = AuthEndpointSchema.shape.getSession.parse({
      method: 'GET',
      path: '/get-session',
      description: 'Get current user session',
    });

    expect(endpoint.method).toBe('GET');
    expect(endpoint.path).toBe('/get-session');
  });

  it('should reject invalid HTTP method', () => {
    expect(() =>
      AuthEndpointSchema.shape.signInEmail.parse({
        method: 'GET', // Should be POST
        path: '/sign-in/email',
        description: 'Sign in with email and password',
      })
    ).toThrow();
  });

  it('should reject invalid path', () => {
    expect(() =>
      AuthEndpointSchema.shape.signInEmail.parse({
        method: 'POST',
        path: '/wrong-path', // Should be /sign-in/email
        description: 'Sign in with email and password',
      })
    ).toThrow();
  });
});

describe('AuthEndpointAliases', () => {
  it('should map common names to canonical endpoints', () => {
    expect(AuthEndpointAliases.login).toBe('/sign-in/email');
    expect(AuthEndpointAliases.register).toBe('/sign-up/email');
    expect(AuthEndpointAliases.logout).toBe('/sign-out');
    expect(AuthEndpointAliases.me).toBe('/get-session');
  });
});

describe('EndpointMapping', () => {
  it('should map legacy paths to canonical paths', () => {
    expect(EndpointMapping['/login']).toBe('/sign-in/email');
    expect(EndpointMapping['/register']).toBe('/sign-up/email');
    expect(EndpointMapping['/logout']).toBe('/sign-out');
    expect(EndpointMapping['/me']).toBe('/get-session');
    expect(EndpointMapping['/refresh']).toBe('/get-session');
  });
});

describe('getAuthEndpointUrl', () => {
  it('should construct full endpoint URLs', () => {
    const basePath = '/api/v1/auth';

    expect(getAuthEndpointUrl(basePath, 'signInEmail')).toBe('/api/v1/auth/sign-in/email');
    expect(getAuthEndpointUrl(basePath, 'signUpEmail')).toBe('/api/v1/auth/sign-up/email');
    expect(getAuthEndpointUrl(basePath, 'getSession')).toBe('/api/v1/auth/get-session');
  });

  it('should handle trailing slash in basePath', () => {
    const basePath = '/api/v1/auth/';

    expect(getAuthEndpointUrl(basePath, 'signInEmail')).toBe('/api/v1/auth/sign-in/email');
    expect(getAuthEndpointUrl(basePath, 'getSession')).toBe('/api/v1/auth/get-session');
  });

  it('should work with different base paths', () => {
    expect(getAuthEndpointUrl('/custom/auth', 'signInEmail')).toBe('/custom/auth/sign-in/email');
    expect(getAuthEndpointUrl('http://localhost:3000/api/auth', 'signUpEmail')).toBe(
      'http://localhost:3000/api/auth/sign-up/email'
    );
  });
});
