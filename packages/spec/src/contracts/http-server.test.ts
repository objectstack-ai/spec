import { describe, it, expect } from 'vitest';
import type {
  IHttpRequest,
  IHttpResponse,
  RouteHandler,
  Middleware,
  IHttpServer,
} from './http-server';

describe('HTTP Server Contract', () => {
  describe('IHttpRequest interface', () => {
    it('should allow a valid request object', () => {
      const req: IHttpRequest = {
        params: { id: '123' },
        query: { page: '1', tags: ['a', 'b'] },
        body: { name: 'Test' },
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        path: '/api/users',
      };

      expect(req.params.id).toBe('123');
      expect(req.method).toBe('POST');
      expect(req.path).toBe('/api/users');
      expect(req.body).toEqual({ name: 'Test' });
    });

    it('should allow a minimal request without body', () => {
      const req: IHttpRequest = {
        params: {},
        query: {},
        headers: {},
        method: 'GET',
        path: '/',
      };

      expect(req.body).toBeUndefined();
      expect(req.method).toBe('GET');
    });
  });

  describe('IHttpResponse interface', () => {
    it('should support chaining status and header calls', () => {
      const res: IHttpResponse = {
        json: (_data) => {},
        send: (_data) => {},
        status: function (code) {
          return this;
        },
        header: function (name, value) {
          return this;
        },
      };

      // Chaining: res.status(200).header('X-Custom', 'val').json({})
      const chained = res.status(200).header('X-Custom', 'value');
      expect(chained).toBeDefined();
    });

    it('should call json and send', () => {
      const sent: any[] = [];
      const res: IHttpResponse = {
        json: (data) => { sent.push({ type: 'json', data }); },
        send: (data) => { sent.push({ type: 'text', data }); },
        status: function () { return this; },
        header: function () { return this; },
      };

      res.json({ message: 'ok' });
      res.send('<h1>Hello</h1>');

      expect(sent).toHaveLength(2);
      expect(sent[0]).toEqual({ type: 'json', data: { message: 'ok' } });
      expect(sent[1]).toEqual({ type: 'text', data: '<h1>Hello</h1>' });
    });
  });

  describe('RouteHandler type', () => {
    it('should accept a sync route handler', () => {
      const handler: RouteHandler = (_req, res) => {
        res.status(200).json({ ok: true });
      };

      expect(typeof handler).toBe('function');
    });

    it('should accept an async route handler', () => {
      const handler: RouteHandler = async (_req, res) => {
        res.status(200).json({ ok: true });
      };

      expect(typeof handler).toBe('function');
    });
  });

  describe('Middleware type', () => {
    it('should accept a sync middleware', () => {
      const mw: Middleware = (_req, _res, next) => {
        next();
      };

      expect(typeof mw).toBe('function');
    });

    it('should accept an async middleware', () => {
      const mw: Middleware = async (_req, _res, next) => {
        await next();
      };

      expect(typeof mw).toBe('function');
    });
  });

  describe('IHttpServer interface', () => {
    it('should allow a full implementation', () => {
      const routes: Array<{ method: string; path: string }> = [];

      const server: IHttpServer = {
        get: (path, _handler) => { routes.push({ method: 'GET', path }); },
        post: (path, _handler) => { routes.push({ method: 'POST', path }); },
        put: (path, _handler) => { routes.push({ method: 'PUT', path }); },
        delete: (path, _handler) => { routes.push({ method: 'DELETE', path }); },
        patch: (path, _handler) => { routes.push({ method: 'PATCH', path }); },
        use: (_pathOrHandler, _handler?) => {},
        listen: async (_port) => {},
      };

      server.get('/api/users', async (_req, res) => res.json([]));
      server.post('/api/users', async (_req, res) => res.status(201).json({}));
      server.put('/api/users/:id', async (_req, res) => res.json({}));
      server.delete('/api/users/:id', async (_req, res) => res.status(204).send(''));
      server.patch('/api/users/:id', async (_req, res) => res.json({}));

      expect(routes).toHaveLength(5);
      expect(routes.map(r => r.method)).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    });

    it('should support middleware registration', () => {
      const middlewareApplied: string[] = [];

      const server: IHttpServer = {
        get: () => {},
        post: () => {},
        put: () => {},
        delete: () => {},
        patch: () => {},
        use: (pathOrHandler, _handler?) => {
          if (typeof pathOrHandler === 'string') {
            middlewareApplied.push(`path:${pathOrHandler}`);
          } else {
            middlewareApplied.push('global');
          }
        },
        listen: async () => {},
      };

      const globalMw: Middleware = (_req, _res, next) => { next(); };
      server.use(globalMw);
      server.use('/api', globalMw);

      expect(middlewareApplied).toEqual(['global', 'path:/api']);
    });

    it('should support optional close method', async () => {
      const server: IHttpServer = {
        get: () => {},
        post: () => {},
        put: () => {},
        delete: () => {},
        patch: () => {},
        use: () => {},
        listen: async () => {},
        close: async () => {},
      };

      expect(server.close).toBeDefined();
      await expect(server.close!()).resolves.toBeUndefined();
    });

    it('should listen on a port', async () => {
      let listenedPort: number | undefined;

      const server: IHttpServer = {
        get: () => {},
        post: () => {},
        put: () => {},
        delete: () => {},
        patch: () => {},
        use: () => {},
        listen: async (port) => { listenedPort = port; },
      };

      await server.listen(3000);
      expect(listenedPort).toBe(3000);
    });
  });
});
