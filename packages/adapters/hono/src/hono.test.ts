// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// Mock dispatcher instance
const mockDispatcher = {
  getDiscoveryInfo: vi.fn().mockReturnValue({ version: '1.0', endpoints: [] }),
  handleAuth: vi.fn().mockResolvedValue({ handled: true, response: { body: { ok: true }, status: 200 } }),
  handleGraphQL: vi.fn().mockResolvedValue({ data: {} }),
  handleMetadata: vi.fn().mockResolvedValue({ handled: true, response: { body: { objects: [] }, status: 200 } }),
  handleData: vi.fn().mockResolvedValue({ handled: true, response: { body: { records: [] }, status: 200 } }),
  handleAnalytics: vi.fn().mockResolvedValue({ handled: true, response: { body: {}, status: 200 } }),
  handleAutomation: vi.fn().mockResolvedValue({ handled: true, response: { body: {}, status: 200 } }),
  handleStorage: vi.fn().mockResolvedValue({ handled: true, response: { body: {}, status: 200 } }),
  handlePackages: vi.fn().mockResolvedValue({ handled: true, response: { body: {}, status: 200 } }),
};

vi.mock('@objectstack/runtime', () => {
  return {
    HttpDispatcher: function HttpDispatcher() {
      return mockDispatcher;
    },
  };
});

import { createHonoApp, objectStackMiddleware } from './index';

const mockKernel = { name: 'test-kernel' } as any;

describe('createHonoApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a Hono app instance', () => {
    const app = createHonoApp({ kernel: mockKernel });
    expect(app).toBeInstanceOf(Hono);
  });

  describe('Discovery Endpoint', () => {
    it('GET /api returns discovery info', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual({ version: '1.0', endpoints: [] });
      expect(mockDispatcher.getDiscoveryInfo).toHaveBeenCalledWith('/api');
    });

    it('uses custom prefix for discovery', async () => {
      const app = createHonoApp({ kernel: mockKernel, prefix: '/v2' });
      const res = await app.request('/v2');
      expect(res.status).toBe(200);
      expect(mockDispatcher.getDiscoveryInfo).toHaveBeenCalledWith('/v2');
    });
  });

  describe('Auth Endpoint', () => {
    it('POST /api/auth/login calls handleAuth', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/auth/login', { method: 'POST' });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleAuth).toHaveBeenCalledWith(
        'login',
        'POST',
        expect.anything(),
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });

    it('GET /api/auth/callback calls handleAuth', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/auth/callback', { method: 'GET' });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleAuth).toHaveBeenCalledWith(
        'callback',
        'GET',
        expect.anything(),
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });

    it('returns error on handleAuth exception', async () => {
      mockDispatcher.handleAuth.mockRejectedValueOnce(
        Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
      );
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/auth/login', { method: 'POST' });
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe('Unauthorized');
    });
  });

  describe('Auth via AuthPlugin service', () => {
    it('uses kernel.getService("auth") when available', async () => {
      const mockHandleRequest = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ user: { id: '1' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const kernelWithAuth = {
        ...mockKernel,
        getService: vi.fn().mockReturnValue({ handleRequest: mockHandleRequest }),
      };
      const app = createHonoApp({ kernel: kernelWithAuth });
      const res = await app.request('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.com', password: 'pass' }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.user.id).toBe('1');
      expect(kernelWithAuth.getService).toHaveBeenCalledWith('auth');
      expect(mockHandleRequest).toHaveBeenCalledWith(expect.any(Request));
      expect(mockDispatcher.handleAuth).not.toHaveBeenCalled();
    });

    it('falls back to dispatcher.handleAuth when auth service is not available', async () => {
      const kernelWithoutAuth = {
        ...mockKernel,
        getService: vi.fn().mockReturnValue(null),
      };
      const app = createHonoApp({ kernel: kernelWithoutAuth });
      const res = await app.request('/api/auth/login', { method: 'POST' });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleAuth).toHaveBeenCalled();
    });

    it('forwards GET requests to auth service', async () => {
      const mockHandleRequest = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ session: { token: 'abc' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const kernelWithAuth = {
        ...mockKernel,
        getService: vi.fn().mockReturnValue({ handleRequest: mockHandleRequest }),
      };
      const app = createHonoApp({ kernel: kernelWithAuth });
      const res = await app.request('/api/auth/get-session', { method: 'GET' });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.session.token).toBe('abc');
      expect(mockHandleRequest).toHaveBeenCalled();
    });

    it('returns error when auth service throws', async () => {
      const mockHandleRequest = vi.fn().mockRejectedValue(new Error('Auth failed'));
      const kernelWithAuth = {
        ...mockKernel,
        getService: vi.fn().mockReturnValue({ handleRequest: mockHandleRequest }),
      };
      const app = createHonoApp({ kernel: kernelWithAuth });
      const res = await app.request('/api/auth/sign-in/email', { method: 'POST' });
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe('Auth failed');
    });
  });

  describe('GraphQL Endpoint', () => {
    it('POST /api/graphql calls handleGraphQL', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const body = { query: '{ objects { name } }' };
      const res = await app.request('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleGraphQL).toHaveBeenCalledWith(
        body,
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });

    it('returns error on handleGraphQL exception', async () => {
      mockDispatcher.handleGraphQL.mockRejectedValueOnce(new Error('Parse error'));
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'bad' }),
      });
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe('Metadata Endpoint', () => {
    it('GET /api/meta/objects calls handleMetadata', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/meta/objects');
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
        '/objects',
        expect.objectContaining({ request: expect.any(Request) }),
        'GET',
        undefined,
        expect.any(Object),
      );
    });

    it('PUT /api/meta/objects parses JSON body', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const body = { name: 'test_object' };
      const res = await app.request('/api/meta/objects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleMetadata).toHaveBeenCalledWith(
        '/objects',
        expect.objectContaining({ request: expect.any(Request) }),
        'PUT',
        body,
        expect.any(Object),
      );
    });
  });

  describe('Data Endpoint', () => {
    it('GET /api/data/account calls handleData', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/data/account');
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleData).toHaveBeenCalledWith(
        '/account',
        'GET',
        {},
        expect.any(Object),
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });

    it('POST /api/data/account parses JSON body', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const body = { name: 'Acme' };
      const res = await app.request('/api/data/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleData).toHaveBeenCalledWith(
        '/account',
        'POST',
        body,
        expect.any(Object),
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });

    it('returns 404 when result is not handled', async () => {
      mockDispatcher.handleData.mockResolvedValueOnce({ handled: false });
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/data/missing');
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe('Analytics Endpoint', () => {
    it('GET /api/analytics/report calls handleAnalytics', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/analytics/report');
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleAnalytics).toHaveBeenCalled();
    });

    it('POST /api/analytics/report parses body', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const body = { metric: 'revenue' };
      const res = await app.request('/api/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleAnalytics).toHaveBeenCalledWith(
        '/report',
        'POST',
        body,
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });
  });

  describe('Automation Endpoint', () => {
    it('GET /api/automation/flows calls handleAutomation', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/automation/flows');
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleAutomation).toHaveBeenCalled();
    });

    it('POST /api/automation/flows parses body', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const body = { trigger: 'on_create' };
      const res = await app.request('/api/automation/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleAutomation).toHaveBeenCalledWith(
        '/flows',
        'POST',
        body,
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });
  });

  describe('Storage Endpoint', () => {
    it('GET /api/storage/files calls handleStorage', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/storage/files');
      expect(res.status).toBe(200);
      expect(mockDispatcher.handleStorage).toHaveBeenCalled();
    });
  });

  describe('Packages Endpoint', () => {
    it('GET /api/packages calls handlePackages', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/packages');
      expect(res.status).toBe(200);
      expect(mockDispatcher.handlePackages).toHaveBeenCalledWith(
        '',
        'GET',
        {},
        expect.any(Object),
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });

    it('POST /api/packages/install parses body', async () => {
      const app = createHonoApp({ kernel: mockKernel });
      const body = { package: 'my-plugin' };
      const res = await app.request('/api/packages/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(res.status).toBe(200);
      expect(mockDispatcher.handlePackages).toHaveBeenCalledWith(
        '/install',
        'POST',
        body,
        expect.any(Object),
        expect.objectContaining({ request: expect.any(Request) }),
      );
    });
  });

  describe('normalizeResponse', () => {
    it('handles redirect result', async () => {
      mockDispatcher.handleData.mockResolvedValueOnce({
        handled: true,
        result: { type: 'redirect', url: 'https://example.com' },
      });
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/data/redir', { redirect: 'manual' });
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe('https://example.com');
    });

    it('handles stream result', async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('hello'));
          controller.close();
        },
      });
      mockDispatcher.handleData.mockResolvedValueOnce({
        handled: true,
        result: { type: 'stream', stream, headers: { 'Content-Type': 'text/plain' } },
      });
      const app = createHonoApp({ kernel: mockKernel });
      const res = await app.request('/api/data/stream');
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toBe('hello');
    });
  });
});

describe('objectStackMiddleware', () => {
  it('sets kernel on context via c.set', async () => {
    const app = new Hono();
    const middleware = objectStackMiddleware(mockKernel);

    app.use('*', middleware);
    app.get('/test', (c) => {
      const kernel = c.get('objectStack');
      return c.json({ hasKernel: !!kernel });
    });

    const res = await app.request('/test');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.hasKernel).toBe(true);
  });

  it('calls next middleware', async () => {
    const app = new Hono();
    const middleware = objectStackMiddleware(mockKernel);
    const spy = vi.fn();

    app.use('*', middleware);
    app.use('*', async (_c, next) => {
      spy();
      await next();
    });
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test');
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalled();
  });
});
