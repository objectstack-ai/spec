import { test, expect, request } from '@playwright/test';

/**
 * E2E test: verifies the CRM dev server boots with the MongoDB driver
 * (selected via `OS_DATABASE_DRIVER=mongodb`) and that CRUD round-trips
 * land in the configured MongoDB database.
 */
const BASE_URL = process.env.CRM_BASE_URL ?? 'http://localhost:3001';

test.describe('CRM running on MongoDB driver', () => {
  test('Studio responds', async () => {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    const studio = await ctx.get('/_studio/');
    expect(studio.status()).toBeGreaterThanOrEqual(200);
    expect(studio.status()).toBeLessThan(500);
    await ctx.dispose();
  });

  test('seed data is queryable from MongoDB', async () => {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    const res = await ctx.get('/api/v1/data/account?limit=10');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.object).toBe('account');
    expect(Array.isArray(body.records)).toBe(true);
    expect(body.records.length).toBeGreaterThan(0);
    await ctx.dispose();
  });

  test('CRUD round-trip on account collection', async () => {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    const unique = `Playwright Mongo Account ${Date.now()}`;

    const created = await ctx.post('/api/v1/data/account', {
      data: { name: unique, industry: 'technology', type: 'prospect' },
    });
    expect(created.ok()).toBe(true);
    const createdBody = await created.json();
    const id = createdBody.id ?? createdBody.record?.id;
    expect(id).toBeTruthy();
    expect(createdBody.record?.name).toBe(unique);

    const fetched = await ctx.get(`/api/v1/data/account/${id}`);
    expect(fetched.ok()).toBe(true);
    const fetchedBody = await fetched.json();
    expect(fetchedBody.record?.name).toBe(unique);

    const updated = await ctx.patch(`/api/v1/data/account/${id}`, {
      data: { industry: 'finance' },
    });
    expect(updated.ok()).toBe(true);

    const reread = await ctx.get(`/api/v1/data/account/${id}`);
    const rereadBody = await reread.json();
    expect(rereadBody.record?.industry).toBe('finance');

    const deleted = await ctx.delete(`/api/v1/data/account/${id}`);
    expect(deleted.ok()).toBe(true);

    await ctx.dispose();
  });
});
