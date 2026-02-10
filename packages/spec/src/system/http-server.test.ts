import { describe, it, expect } from 'vitest';
import {
  HttpServerConfigSchema,
  RouteHandlerMetadataSchema,
  MiddlewareType,
  MiddlewareConfigSchema,
  ServerEventType,
  ServerEventSchema,
  ServerCapabilitiesSchema,
  ServerStatusSchema,
} from './http-server.zod';

describe('HttpServerConfigSchema', () => {
  it('should accept minimal config with defaults', () => {
    const config = HttpServerConfigSchema.parse({});

    expect(config.port).toBe(3000);
    expect(config.host).toBe('0.0.0.0');
    expect(config.requestTimeout).toBe(30000);
    expect(config.bodyLimit).toBe('10mb');
    expect(config.compression).toBe(true);
    expect(config.trustProxy).toBe(false);
  });

  it('should accept full configuration', () => {
    const config = HttpServerConfigSchema.parse({
      port: 8080,
      host: '127.0.0.1',
      cors: { enabled: true, origins: ['http://localhost:3000'] },
      requestTimeout: 60000,
      bodyLimit: '50mb',
      compression: false,
      security: {
        helmet: false,
        rateLimit: { windowMs: 60000, maxRequests: 100 },
      },
      trustProxy: true,
    });

    expect(config.port).toBe(8080);
    expect(config.host).toBe('127.0.0.1');
    expect(config.compression).toBe(false);
    expect(config.trustProxy).toBe(true);
  });

  it('should reject invalid port numbers', () => {
    expect(() => HttpServerConfigSchema.parse({ port: 0 })).toThrow();
    expect(() => HttpServerConfigSchema.parse({ port: 70000 })).toThrow();
    expect(() => HttpServerConfigSchema.parse({ port: -1 })).toThrow();
  });
});

describe('RouteHandlerMetadataSchema', () => {
  it('should accept valid route handler', () => {
    const route = RouteHandlerMetadataSchema.parse({
      method: 'GET',
      path: '/api/users/:id',
      handler: 'getUser',
    });

    expect(route.method).toBe('GET');
    expect(route.path).toBe('/api/users/:id');
    expect(route.handler).toBe('getUser');
  });

  it('should accept route with metadata and security', () => {
    const route = RouteHandlerMetadataSchema.parse({
      method: 'POST',
      path: '/api/users',
      handler: 'createUser',
      metadata: {
        summary: 'Create a user',
        description: 'Creates a new user account',
        tags: ['users'],
        operationId: 'createUser',
      },
      security: {
        authRequired: true,
        permissions: ['users.create'],
        rateLimit: 'strict',
      },
    });

    expect(route.metadata?.summary).toBe('Create a user');
    expect(route.security?.permissions).toEqual(['users.create']);
  });

  it('should default authRequired to true', () => {
    const route = RouteHandlerMetadataSchema.parse({
      method: 'GET',
      path: '/api/data',
      handler: 'getData',
      security: {},
    });

    expect(route.security?.authRequired).toBe(true);
  });

  it('should reject missing required fields', () => {
    expect(() => RouteHandlerMetadataSchema.parse({})).toThrow();
    expect(() => RouteHandlerMetadataSchema.parse({ method: 'GET' })).toThrow();
    expect(() => RouteHandlerMetadataSchema.parse({ method: 'GET', path: '/test' })).toThrow();
  });
});

describe('MiddlewareType', () => {
  it('should accept valid middleware types', () => {
    const types = ['authentication', 'authorization', 'logging', 'validation', 'transformation', 'error', 'custom'];

    types.forEach((type) => {
      expect(() => MiddlewareType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid middleware types', () => {
    expect(() => MiddlewareType.parse('invalid')).toThrow();
    expect(() => MiddlewareType.parse('cache')).toThrow();
  });
});

describe('MiddlewareConfigSchema', () => {
  it('should accept valid middleware with defaults', () => {
    const mw = MiddlewareConfigSchema.parse({
      name: 'auth_middleware',
      type: 'authentication',
    });

    expect(mw.name).toBe('auth_middleware');
    expect(mw.type).toBe('authentication');
    expect(mw.enabled).toBe(true);
    expect(mw.order).toBe(100);
  });

  it('should accept full configuration', () => {
    const mw = MiddlewareConfigSchema.parse({
      name: 'rate_limiter',
      type: 'custom',
      enabled: false,
      order: 10,
      config: { maxRequests: 100 },
      paths: {
        include: ['/api/*'],
        exclude: ['/health'],
      },
    });

    expect(mw.enabled).toBe(false);
    expect(mw.order).toBe(10);
    expect(mw.config).toEqual({ maxRequests: 100 });
    expect(mw.paths?.include).toEqual(['/api/*']);
    expect(mw.paths?.exclude).toEqual(['/health']);
  });

  it('should reject invalid snake_case names', () => {
    expect(() => MiddlewareConfigSchema.parse({ name: 'InvalidName', type: 'custom' })).toThrow();
    expect(() => MiddlewareConfigSchema.parse({ name: 'my-middleware', type: 'custom' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => MiddlewareConfigSchema.parse({})).toThrow();
    expect(() => MiddlewareConfigSchema.parse({ name: 'test' })).toThrow();
  });
});

describe('ServerEventType', () => {
  it('should accept valid event types', () => {
    const types = ['starting', 'started', 'stopping', 'stopped', 'request', 'response', 'error'];

    types.forEach((type) => {
      expect(() => ServerEventType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid event types', () => {
    expect(() => ServerEventType.parse('invalid')).toThrow();
  });
});

describe('ServerEventSchema', () => {
  it('should accept valid server event', () => {
    const event = ServerEventSchema.parse({
      type: 'started',
      timestamp: '2025-01-01T00:00:00Z',
    });

    expect(event.type).toBe('started');
    expect(event.timestamp).toBe('2025-01-01T00:00:00Z');
  });

  it('should accept event with data', () => {
    const event = ServerEventSchema.parse({
      type: 'error',
      timestamp: '2025-01-01T00:00:00Z',
      data: { message: 'Connection refused', code: 500 },
    });

    expect(event.data).toEqual({ message: 'Connection refused', code: 500 });
  });

  it('should reject invalid timestamp', () => {
    expect(() => ServerEventSchema.parse({ type: 'started', timestamp: 'not-a-date' })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => ServerEventSchema.parse({})).toThrow();
    expect(() => ServerEventSchema.parse({ type: 'started' })).toThrow();
  });
});

describe('ServerCapabilitiesSchema', () => {
  it('should accept empty config with defaults', () => {
    const caps = ServerCapabilitiesSchema.parse({});

    expect(caps.httpVersions).toEqual(['1.1']);
    expect(caps.websocket).toBe(false);
    expect(caps.sse).toBe(false);
    expect(caps.serverPush).toBe(false);
    expect(caps.streaming).toBe(true);
    expect(caps.middleware).toBe(true);
    expect(caps.routeParams).toBe(true);
    expect(caps.compression).toBe(true);
  });

  it('should accept full configuration', () => {
    const caps = ServerCapabilitiesSchema.parse({
      httpVersions: ['1.1', '2.0'],
      websocket: true,
      sse: true,
      serverPush: true,
      streaming: false,
      middleware: false,
      routeParams: false,
      compression: false,
    });

    expect(caps.httpVersions).toEqual(['1.1', '2.0']);
    expect(caps.websocket).toBe(true);
    expect(caps.sse).toBe(true);
  });

  it('should reject invalid HTTP versions', () => {
    expect(() => ServerCapabilitiesSchema.parse({ httpVersions: ['4.0'] })).toThrow();
  });
});

describe('ServerStatusSchema', () => {
  it('should accept minimal status', () => {
    const status = ServerStatusSchema.parse({
      state: 'running',
    });

    expect(status.state).toBe('running');
  });

  it('should accept all state values', () => {
    const states = ['stopped', 'starting', 'running', 'stopping', 'error'];

    states.forEach((state) => {
      expect(() => ServerStatusSchema.parse({ state })).not.toThrow();
    });
  });

  it('should accept full status', () => {
    const status = ServerStatusSchema.parse({
      state: 'running',
      uptime: 3600000,
      server: { port: 3000, host: '0.0.0.0', url: 'http://localhost:3000' },
      connections: { active: 10, total: 500 },
      requests: { total: 1000, success: 990, errors: 10 },
    });

    expect(status.uptime).toBe(3600000);
    expect(status.server?.port).toBe(3000);
    expect(status.connections?.active).toBe(10);
    expect(status.requests?.total).toBe(1000);
  });

  it('should reject invalid state', () => {
    expect(() => ServerStatusSchema.parse({ state: 'invalid' })).toThrow();
  });

  it('should reject missing required state', () => {
    expect(() => ServerStatusSchema.parse({})).toThrow();
  });
});
