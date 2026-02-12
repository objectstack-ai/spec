// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

import { objectStackMiddleware } from './index';

const mockKernel = { name: 'test-kernel' } as any;

describe('objectStackMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('provides the correct kernel instance', async () => {
    const app = new Hono();
    const middleware = objectStackMiddleware(mockKernel);

    app.use('*', middleware);
    app.get('/test', (c) => {
      const kernel = c.get('objectStack');
      return c.json({ name: kernel.name });
    });

    const res = await app.request('/test');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('test-kernel');
  });
});
