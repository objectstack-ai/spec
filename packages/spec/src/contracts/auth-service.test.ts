import { describe, it, expect } from 'vitest';
import type { IAuthService, AuthResult, AuthUser } from './auth-service';

describe('Auth Service Contract', () => {
  it('should allow a minimal IAuthService implementation with required methods', () => {
    const service: IAuthService = {
      handleRequest: async (_request) => new Response('OK'),
      verify: async (_token) => ({ success: false }),
    };

    expect(typeof service.handleRequest).toBe('function');
    expect(typeof service.verify).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IAuthService = {
      handleRequest: async () => new Response('OK'),
      verify: async () => ({ success: false }),
      logout: async (_sessionId) => {},
      getCurrentUser: async (_request) => undefined,
    };

    expect(service.logout).toBeDefined();
    expect(service.getCurrentUser).toBeDefined();
  });

  it('should verify a valid token', async () => {
    const validUser: AuthUser = { id: 'u1', email: 'alice@test.com', name: 'Alice' };

    const service: IAuthService = {
      handleRequest: async () => new Response('OK'),
      verify: async (token): Promise<AuthResult> => {
        if (token === 'valid-token') {
          return {
            success: true,
            user: validUser,
            session: { id: 's1', userId: 'u1', expiresAt: '2099-01-01T00:00:00Z' },
          };
        }
        return { success: false, error: 'Invalid token' };
      },
    };

    const result = await service.verify('valid-token');
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('alice@test.com');
    expect(result.session?.userId).toBe('u1');
  });

  it('should reject an invalid token', async () => {
    const service: IAuthService = {
      handleRequest: async () => new Response('OK'),
      verify: async (_token) => ({ success: false, error: 'Invalid token' }),
    };

    const result = await service.verify('bad-token');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid token');
  });

  it('should handle logout', async () => {
    const sessions = new Set(['s1', 's2']);

    const service: IAuthService = {
      handleRequest: async () => new Response('OK'),
      verify: async () => ({ success: true }),
      logout: async (sessionId) => { sessions.delete(sessionId); },
    };

    await service.logout!('s1');
    expect(sessions.has('s1')).toBe(false);
    expect(sessions.has('s2')).toBe(true);
  });
});
